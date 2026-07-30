import { createHmac, randomInt } from "crypto";

/** Sem O/0/I/1 para o código poder ser ditado por telefone sem ambiguidade. */
const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const GROUPS = 3;
const GROUP_SIZE = 4;

export const REDEEM_CODE_LENGTH = GROUPS * GROUP_SIZE;

/** Gera um código no formato ABCD-EFGH-JKLM (~60 bits de entropia). */
export function generateRedeemCode(): string {
  const groups: string[] = [];
  for (let g = 0; g < GROUPS; g++) {
    let group = "";
    for (let i = 0; i < GROUP_SIZE; i++) {
      group += ALPHABET[randomInt(ALPHABET.length)];
    }
    groups.push(group);
  }
  return groups.join("-");
}

/** Remove hífens, espaços e caixa para aceitar o código como o cliente digitar. */
export function normalizeRedeemCode(raw: string): string {
  return String(raw || "")
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "");
}

export function formatRedeemCode(raw: string): string {
  const normalized = normalizeRedeemCode(raw);
  const groups: string[] = [];
  for (let i = 0; i < normalized.length; i += GROUP_SIZE) {
    groups.push(normalized.slice(i, i + GROUP_SIZE));
  }
  return groups.join("-");
}

export function isValidRedeemCodeShape(raw: string): boolean {
  const normalized = normalizeRedeemCode(raw);
  if (normalized.length !== REDEEM_CODE_LENGTH) return false;
  return [...normalized].every((char) => ALPHABET.includes(char));
}

function secret(): string {
  const value = (process.env.REDEEM_CODE_SECRET || "").trim();
  if (!value) {
    throw new Error(
      "REDEEM_CODE_SECRET não configurado. Gere um valor aleatório e defina no .env.local.",
    );
  }
  return value;
}

/**
 * HMAC-SHA256 do código normalizado. Determinístico de propósito: o resgate
 * localiza o pedido pelo hash. Como o código tem entropia alta, um vazamento do
 * banco não permite força bruta viável.
 */
export function hashRedeemCode(raw: string): string {
  return createHmac("sha256", secret())
    .update(normalizeRedeemCode(raw))
    .digest("hex");
}

export function redeemCodeLast4(raw: string): string {
  return normalizeRedeemCode(raw).slice(-4);
}
