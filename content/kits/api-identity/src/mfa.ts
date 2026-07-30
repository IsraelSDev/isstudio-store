import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";

const DIGITS = 6;
const PERIOD_SECONDS = 30;
/** Aceita o código anterior e o seguinte: relógio de celular atrasa. */
const WINDOW = 1;

const BASE32_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

export function generateSecret(): string {
  return toBase32(randomBytes(20));
}

function toBase32(buffer: Buffer): string {
  let bits = 0;
  let value = 0;
  let output = "";

  for (const byte of buffer) {
    value = (value << 8) | byte;
    bits += 8;
    while (bits >= 5) {
      output += BASE32_ALPHABET[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }
  if (bits > 0) {
    output += BASE32_ALPHABET[(value << (5 - bits)) & 31];
  }
  return output;
}

function fromBase32(input: string): Buffer {
  const clean = input.toUpperCase().replace(/[^A-Z2-7]/g, "");
  let bits = 0;
  let value = 0;
  const bytes: number[] = [];

  for (const char of clean) {
    value = (value << 5) | BASE32_ALPHABET.indexOf(char);
    bits += 5;
    if (bits >= 8) {
      bytes.push((value >>> (bits - 8)) & 0xff);
      bits -= 8;
    }
  }
  return Buffer.from(bytes);
}

function hotp(secret: Buffer, counter: number): string {
  const buffer = Buffer.alloc(8);
  buffer.writeBigUInt64BE(BigInt(counter));

  const digest = createHmac("sha1", secret).update(buffer).digest();
  const offset = digest[digest.length - 1] & 0x0f;
  const binary =
    ((digest[offset] & 0x7f) << 24) |
    (digest[offset + 1] << 16) |
    (digest[offset + 2] << 8) |
    digest[offset + 3];

  return String(binary % 10 ** DIGITS).padStart(DIGITS, "0");
}

export function generateTotp(secret: string, at: Date = new Date()): string {
  const counter = Math.floor(at.getTime() / 1000 / PERIOD_SECONDS);
  return hotp(fromBase32(secret), counter);
}

/**
 * Valida o código considerando a janela de tolerância.
 * Comparação em tempo constante: comparar com `===` permite inferir o código
 * correto medindo o tempo de resposta.
 */
export function verifyTotp(
  secret: string,
  code: string,
  at: Date = new Date(),
): boolean {
  const candidate = String(code || "").replace(/\D/g, "");
  if (candidate.length !== DIGITS) return false;

  const key = fromBase32(secret);
  const counter = Math.floor(at.getTime() / 1000 / PERIOD_SECONDS);
  const received = Buffer.from(candidate);

  for (let drift = -WINDOW; drift <= WINDOW; drift++) {
    const expected = Buffer.from(hotp(key, counter + drift));
    if (expected.length === received.length && timingSafeEqual(expected, received)) {
      return true;
    }
  }
  return false;
}

/** URI do QR Code lido pelo app autenticador. */
export function buildOtpAuthUri(input: {
  secret: string;
  accountName: string;
  issuer?: string;
}): string {
  const issuer = input.issuer || process.env.MFA_ISSUER || "Identity Kit";
  const label = encodeURIComponent(`${issuer}:${input.accountName}`);
  const params = new URLSearchParams({
    secret: input.secret,
    issuer,
    algorithm: "SHA1",
    digits: String(DIGITS),
    period: String(PERIOD_SECONDS),
  });
  return `otpauth://totp/${label}?${params.toString()}`;
}

/**
 * Códigos de recuperação para quando o usuário perde o celular.
 * Guarde apenas o hash e invalide cada um após o uso.
 */
export function generateRecoveryCodes(count = 8): string[] {
  return Array.from({ length: count }, () =>
    randomBytes(5).toString("hex").toUpperCase().match(/.{1,5}/g)!.join("-"),
  );
}
