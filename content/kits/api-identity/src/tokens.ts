import { createHash, randomBytes } from "node:crypto";
import { SignJWT, jwtVerify } from "jose";

const ACCESS_TTL_SECONDS = 15 * 60;
const REFRESH_TTL_SECONDS = 30 * 24 * 60 * 60;

export interface SessionClaims {
  sub: string;
  email: string;
  roles: string[];
  /** Identifica a família de refresh tokens desta sessão. */
  sid: string;
}

function secretKey(): Uint8Array {
  const secret = (process.env.JWT_SECRET || "").trim();
  if (secret.length < 32) {
    throw new Error(
      "JWT_SECRET ausente ou curto (mínimo 32 caracteres). Gere com: openssl rand -base64 48",
    );
  }
  return new TextEncoder().encode(secret);
}

export async function signAccessToken(claims: SessionClaims): Promise<string> {
  return new SignJWT({ email: claims.email, roles: claims.roles, sid: claims.sid })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(claims.sub)
    .setIssuedAt()
    .setExpirationTime(`${ACCESS_TTL_SECONDS}s`)
    .sign(secretKey());
}

export async function verifyAccessToken(
  token: string,
): Promise<SessionClaims | null> {
  try {
    const { payload } = await jwtVerify(token, secretKey());
    return {
      sub: String(payload.sub),
      email: String(payload.email ?? ""),
      roles: Array.isArray(payload.roles) ? (payload.roles as string[]) : [],
      sid: String(payload.sid ?? ""),
    };
  } catch {
    return null;
  }
}

/**
 * Refresh token opaco. Só o hash vai para o Redis — vazamento do storage não
 * produz um token utilizável.
 */
export function createRefreshToken(): { token: string; hash: string } {
  const token = randomBytes(48).toString("base64url");
  return { token, hash: hashRefreshToken(token) };
}

export function hashRefreshToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export interface RefreshStore {
  get(hash: string): Promise<StoredRefresh | null>;
  put(hash: string, value: StoredRefresh, ttlSeconds: number): Promise<void>;
  markUsed(hash: string, replacedBy: string): Promise<void>;
  revokeFamily(sid: string): Promise<void>;
}

export interface StoredRefresh {
  userId: string;
  sid: string;
  usedAt?: string | null;
  replacedBy?: string | null;
}

export class RefreshReuseError extends Error {
  constructor() {
    super("Refresh token reutilizado — sessão revogada por segurança.");
  }
}

/**
 * Rotaciona o refresh token.
 *
 * Um token já usado que reaparece significa que alguém tem uma cópia: pode ser o
 * atacante ou o usuário legítimo (se o atacante rotacionou primeiro). Como não é
 * possível distinguir, revogamos a família inteira e forçamos novo login. É o
 * comportamento recomendado pelo OAuth 2.1 para clientes públicos.
 */
export async function rotateRefreshToken(
  presentedToken: string,
  store: RefreshStore,
): Promise<{ userId: string; sid: string; refreshToken: string }> {
  const presentedHash = hashRefreshToken(presentedToken);
  const stored = await store.get(presentedHash);

  if (!stored) throw new Error("Refresh token inválido ou expirado.");

  if (stored.usedAt) {
    await store.revokeFamily(stored.sid);
    throw new RefreshReuseError();
  }

  const next = createRefreshToken();
  await store.put(
    next.hash,
    { userId: stored.userId, sid: stored.sid, usedAt: null },
    REFRESH_TTL_SECONDS,
  );
  await store.markUsed(presentedHash, next.hash);

  return {
    userId: stored.userId,
    sid: stored.sid,
    refreshToken: next.token,
  };
}

export const TTL = {
  accessSeconds: ACCESS_TTL_SECONDS,
  refreshSeconds: REFRESH_TTL_SECONDS,
};
