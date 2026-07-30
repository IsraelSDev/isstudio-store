import { createHmac, timingSafeEqual } from "crypto";

const DEFAULT_TTL_SECONDS = 60 * 60;

export interface DownloadTokenPayload {
  orderId: string;
  orderRef: string;
  productId: string;
  exp: number;
}

function secret(): string {
  const value = (
    process.env.DOWNLOAD_TOKEN_SECRET ||
    process.env.REDEEM_CODE_SECRET ||
    ""
  ).trim();
  if (!value) {
    throw new Error(
      "DOWNLOAD_TOKEN_SECRET (ou REDEEM_CODE_SECRET) não configurado no servidor.",
    );
  }
  return value;
}

function base64url(input: Buffer | string): string {
  return Buffer.from(input)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function fromBase64url(input: string): Buffer {
  return Buffer.from(input.replace(/-/g, "+").replace(/_/g, "/"), "base64");
}

function sign(body: string): string {
  return base64url(createHmac("sha256", secret()).update(body).digest());
}

/**
 * Token assinado e de vida curta usado nos links de download. Evita que o
 * código de resgate do cliente circule em URL, histórico do navegador e logs.
 */
export function createDownloadToken(
  input: Omit<DownloadTokenPayload, "exp">,
  ttlSeconds = DEFAULT_TTL_SECONDS,
): string {
  const payload: DownloadTokenPayload = {
    ...input,
    exp: Math.floor(Date.now() / 1000) + ttlSeconds,
  };
  const body = base64url(JSON.stringify(payload));
  return `${body}.${sign(body)}`;
}

export function verifyDownloadToken(
  token: string,
): DownloadTokenPayload | null {
  const raw = String(token || "");
  const separator = raw.lastIndexOf(".");
  if (separator <= 0) return null;

  const body = raw.slice(0, separator);
  const signature = raw.slice(separator + 1);

  const expected = Buffer.from(sign(body));
  const received = Buffer.from(signature);
  if (expected.length !== received.length) return null;
  if (!timingSafeEqual(expected, received)) return null;

  try {
    const payload = JSON.parse(
      fromBase64url(body).toString("utf8"),
    ) as DownloadTokenPayload;
    if (!payload?.orderId || !payload?.productId) return null;
    if (typeof payload.exp !== "number") return null;
    if (payload.exp * 1000 < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

export const DOWNLOAD_TOKEN_TTL_SECONDS = DEFAULT_TTL_SECONDS;
