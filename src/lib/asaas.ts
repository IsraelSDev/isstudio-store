/**
 * Cliente HTTP para a API Asaas v3 — portado do Capivara.
 * Docs: https://docs.asaas.com
 */

import axios, { type AxiosError } from "axios";

export type AsaasBillingType = "PIX" | "CREDIT_CARD" | "BOLETO" | "UNDEFINED";

function getApiKey(): string {
  return (
    process.env.ASAAS_API_KEY ||
    process.env.ASAAS_ACCESS_TOKEN ||
    ""
  ).trim();
}

export function isAsaasConfigured(): boolean {
  return !!getApiKey();
}

export function isAsaasSandboxKey(key?: string): boolean {
  const k = (key ?? getApiKey()).trim();
  return k.startsWith("$aact_hmlg_");
}

export function getAsaasBaseUrl(): string {
  const explicit = (process.env.ASAAS_API_URL || "").trim().replace(/\/+$/, "");
  if (explicit) return explicit;

  const envFlag = (process.env.ASAAS_ENV || "").toLowerCase();
  const sandbox =
    envFlag === "sandbox" ||
    (envFlag !== "production" && isAsaasSandboxKey());

  return sandbox
    ? "https://api-sandbox.asaas.com/v3"
    : "https://api.asaas.com/v3";
}

function client() {
  const key = getApiKey();
  if (!key) throw new Error("ASAAS_API_KEY não configurada no servidor");
  return axios.create({
    baseURL: getAsaasBaseUrl(),
    headers: {
      access_token: key,
      "Content-Type": "application/json",
      "User-Agent": "isstudio-store",
    },
    timeout: 30000,
  });
}

export function formatAsaasError(err: unknown): string {
  if (axios.isAxiosError(err)) {
    const ax = err as AxiosError<{ errors?: { description?: string }[] }>;
    const desc = ax.response?.data?.errors
      ?.map((e) => e.description)
      .filter(Boolean)
      .join("; ");
    if (desc) return desc;
    return ax.message;
  }
  return err instanceof Error ? err.message : String(err);
}

export async function findCustomerByEmail(email: string) {
  const api = client();
  try {
    const { data } = await api.get("/customers", {
      params: { email: String(email).trim().toLowerCase(), limit: 1 },
    });
    const list = data?.data;
    if (Array.isArray(list) && list.length > 0) return list[0];
    return null;
  } catch (err) {
    if (axios.isAxiosError(err) && err.response?.status === 404) return null;
    throw err;
  }
}

export async function createCustomer(opts: {
  name: string;
  email: string;
  cpfCnpj?: string;
  externalReference?: string;
}) {
  const api = client();
  const payload: Record<string, string> = {
    name: opts.name || opts.email.split("@")[0],
    email: String(opts.email).trim().toLowerCase(),
  };
  if (opts.cpfCnpj) payload.cpfCnpj = opts.cpfCnpj.replace(/\D/g, "");
  if (opts.externalReference) payload.externalReference = opts.externalReference;

  const { data } = await api.post("/customers", payload);
  return data;
}

export async function findOrCreateCustomer(opts: {
  name?: string;
  email: string;
  cpfCnpj?: string;
  externalReference?: string;
}) {
  const existing = await findCustomerByEmail(opts.email);
  if (existing?.id) return existing;
  return createCustomer({
    name: opts.name || opts.email.split("@")[0],
    email: opts.email,
    cpfCnpj: opts.cpfCnpj,
    externalReference: opts.externalReference,
  });
}

function nextDueDate(daysFromNow = 0): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + daysFromNow);
  return d.toISOString().slice(0, 10);
}

const PIX_QR_NOT_READY = /não permite pagamentos via Pix/i;

export async function listPixAddressKeys() {
  const api = client();
  const { data } = await api.get("/pix/addressKeys");
  const list = data?.data;
  return Array.isArray(list) ? list : [];
}

/** Sandbox: cobranças PIX exigem ao menos uma chave EVP ativa */
export async function ensurePixAddressKey(): Promise<boolean> {
  if (!isAsaasConfigured()) return false;
  const autoCreate =
    isAsaasSandboxKey() ||
    (process.env.ASAAS_ENV || "").toLowerCase() === "sandbox";
  if (!autoCreate) return true;

  try {
    const keys = await listPixAddressKeys();
    const hasActive = keys.some(
      (k: { status?: string }) =>
        String(k.status || "").toUpperCase() === "ACTIVE",
    );
    if (hasActive) return true;

    const api = client();
    await api.post("/pix/addressKeys", { type: "EVP" });
    console.log("[asaas] Chave PIX EVP criada automaticamente (sandbox)");
    return true;
  } catch (e) {
    console.warn("[asaas] ensurePixAddressKey:", formatAsaasError(e));
    return false;
  }
}

/** Cobrança avulsa (PIX / cartão / boleto) */
export async function createPayment(opts: {
  customerId: string;
  billingType: AsaasBillingType;
  value: number;
  description: string;
  externalReference: string;
  dueDate?: string;
}) {
  const api = client();
  const { data } = await api.post("/payments", {
    customer: opts.customerId,
    billingType: opts.billingType,
    value: Number(opts.value),
    dueDate: opts.dueDate || nextDueDate(opts.billingType === "BOLETO" ? 3 : 0),
    description: opts.description,
    externalReference: opts.externalReference,
  });
  return data;
}

export async function createPixPayment(opts: {
  customerId: string;
  value: number;
  description: string;
  externalReference: string;
  dueDate?: string;
}) {
  return createPayment({ ...opts, billingType: "PIX" });
}

export async function createSubscription(opts: {
  customerId: string;
  billingType: AsaasBillingType;
  value: number;
  description: string;
  externalReference: string;
  nextDueDate?: string;
  cycle?: "MONTHLY" | "YEARLY";
}) {
  const api = client();
  const { data } = await api.post("/subscriptions", {
    customer: opts.customerId,
    billingType: opts.billingType,
    value: Number(opts.value),
    nextDueDate: opts.nextDueDate || nextDueDate(0),
    cycle: opts.cycle || "MONTHLY",
    description: opts.description,
    externalReference: opts.externalReference,
  });
  return data;
}

export async function getSubscription(subscriptionId: string) {
  const api = client();
  const { data } = await api.get(`/subscriptions/${subscriptionId}`);
  return data;
}

export async function getSubscriptionPayments(subscriptionId: string) {
  const api = client();
  const { data } = await api.get(`/subscriptions/${subscriptionId}/payments`);
  const list = data?.data;
  return Array.isArray(list) ? list : [];
}

export async function getPayment(paymentId: string) {
  const api = client();
  const { data } = await api.get(`/payments/${paymentId}`);
  return data;
}

export async function getPaymentPixQrCode(paymentId: string) {
  const api = client();
  const { data } = await api.get(`/payments/${paymentId}/pixQrCode`);
  return data as {
    encodedImage?: string;
    payload?: string;
    expirationDate?: string;
  };
}

export function buildExternalReference(orderId: string): string {
  return `isstudio-order-${orderId}`;
}

export function extractPixFromPayment(
  payment: Record<string, unknown> | null | undefined,
  pixQr?: {
    encodedImage?: string;
    payload?: string;
    expirationDate?: string;
  },
) {
  const embedded =
    (payment?.pixTransaction as Record<string, string> | undefined) ||
    (payment?.pix as Record<string, string> | undefined);
  return {
    qr_code:
      pixQr?.payload ||
      embedded?.payload ||
      embedded?.qrCode ||
      (payment?.pixCopiaECola as string | undefined) ||
      null,
    qr_base64:
      pixQr?.encodedImage ||
      embedded?.encodedImage ||
      embedded?.qrCodeBase64 ||
      null,
    expires_at:
      pixQr?.expirationDate ||
      (payment?.dueDate as string | undefined) ||
      embedded?.expirationDate ||
      null,
    invoiceUrl:
      (payment?.invoiceUrl as string | undefined) ||
      (payment?.bankSlipUrl as string | undefined) ||
      null,
  };
}

function isRetryablePixQrError(err: unknown): boolean {
  if (!axios.isAxiosError(err)) return false;
  const status = err.response?.status ?? 0;
  const msg = formatAsaasError(err);
  if (PIX_QR_NOT_READY.test(msg)) return true;
  return status === 404 || status === 409 || status === 425;
}

export async function waitForPixQrForPayment(
  paymentId: string,
  payment?: Record<string, unknown>,
  opts?: { maxAttempts?: number; delayMs?: number },
) {
  const maxAttempts = opts?.maxAttempts ?? 12;
  const delayMs = opts?.delayMs ?? 800;
  let lastPayment = payment;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      const pixQr = await getPaymentPixQrCode(paymentId);
      if (pixQr?.payload || pixQr?.encodedImage) {
        return extractPixFromPayment(lastPayment || {}, pixQr);
      }
    } catch (e) {
      const msg = formatAsaasError(e);
      const lastTry = attempt >= maxAttempts - 1;
      if (lastTry || !isRetryablePixQrError(e)) {
        console.warn("[asaas] pixQrCode", paymentId, msg);
      }
      if (!isRetryablePixQrError(e) && lastTry) break;
    }

    const embedded = extractPixFromPayment(lastPayment || {});
    if (embedded.qr_code || embedded.qr_base64) return embedded;

    if (attempt < maxAttempts - 1) {
      await new Promise((r) => setTimeout(r, delayMs));
      try {
        lastPayment = await getPayment(paymentId);
      } catch {
        /* ignore */
      }
    }
  }

  return extractPixFromPayment(lastPayment || {});
}

export function pixQrSetupHint(): string {
  const sandbox =
    isAsaasSandboxKey() ||
    (process.env.ASAAS_ENV || "").toLowerCase() === "sandbox";
  const panel = sandbox ? "sandbox.asaas.com" : "www.asaas.com";
  return `Cadastre uma chave PIX em ${panel} (menu Pix) e tente novamente.`;
}

export function isPaymentConfirmed(status: string): boolean {
  const s = String(status || "").toUpperCase();
  return s === "RECEIVED" || s === "CONFIRMED" || s === "RECEIVED_IN_CASH";
}
