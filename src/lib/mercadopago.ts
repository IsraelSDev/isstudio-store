/**
 * Cliente Mercado Pago — Checkout Pro (Preference API)
 * Docs: https://www.mercadopago.com.br/developers/pt/docs/checkout-pro
 */

import { MercadoPagoConfig, Payment, Preference } from "mercadopago";
import type { PreferenceRequest } from "mercadopago/dist/clients/preference/commonTypes";

function getAccessToken(): string {
  return (
    process.env.MERCADOPAGO_ACCESS_TOKEN ||
    process.env.MP_ACCESS_TOKEN ||
    ""
  ).trim();
}

export function isMercadoPagoConfigured(): boolean {
  return !!getAccessToken();
}

export function isMercadoPagoSandboxToken(token?: string): boolean {
  const t = (token ?? getAccessToken()).trim();
  // Tokens de teste costumam ser TEST-...; produção APP_USR-...
  return t.startsWith("TEST-") || (process.env.MERCADOPAGO_ENV || "").toLowerCase() === "sandbox";
}

function client() {
  const accessToken = getAccessToken();
  if (!accessToken) {
    throw new Error("MERCADOPAGO_ACCESS_TOKEN não configurado no servidor");
  }
  return new MercadoPagoConfig({
    accessToken,
    options: { timeout: 30000 },
  });
}

export function formatMercadoPagoError(err: unknown): string {
  if (err && typeof err === "object") {
    const anyErr = err as {
      message?: string;
      cause?: { description?: string; message?: string }[] | string;
    };
    if (Array.isArray(anyErr.cause)) {
      const desc = anyErr.cause
        .map((c) => c.description || c.message)
        .filter(Boolean)
        .join("; ");
      if (desc) return desc;
    }
    if (typeof anyErr.cause === "string" && anyErr.cause) return anyErr.cause;
    if (anyErr.message) return anyErr.message;
  }
  return err instanceof Error ? err.message : String(err);
}

export function splitName(fullName: string): { name: string; surname: string } {
  const parts = String(fullName || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (parts.length === 0) return { name: "Cliente", surname: "ISStudio" };
  if (parts.length === 1) return { name: parts[0], surname: "ISStudio" };
  return {
    name: parts[0],
    surname: parts.slice(1).join(" "),
  };
}

export function identificationFromDocument(cpfCnpj: string): {
  type: "CPF" | "CNPJ";
  number: string;
} {
  const number = String(cpfCnpj || "").replace(/\D/g, "");
  return {
    type: number.length > 11 ? "CNPJ" : "CPF",
    number,
  };
}

export async function createCheckoutPreference(opts: {
  orderId: string;
  items: {
    id: string;
    title: string;
    description?: string;
    quantity: number;
    unitPrice: number;
  }[];
  payer: {
    name: string;
    email: string;
    cpfCnpj: string;
  };
  baseUrl: string;
}) {
  const preference = new Preference(client());
  const { name, surname } = splitName(opts.payer.name);
  const identification = identificationFromDocument(opts.payer.cpfCnpj);
  const base = opts.baseUrl.replace(/\/+$/, "");

  const body: PreferenceRequest = {
    items: opts.items.map((item) => ({
      id: item.id,
      title: item.title.slice(0, 256),
      description: (item.description || item.title).slice(0, 256),
      quantity: item.quantity,
      // MP exige número com até 2 casas; evita float estranho
      unit_price: Math.round(Number(item.unitPrice) * 100) / 100,
      currency_id: "BRL",
      category_id: "services",
    })),
    payer: {
      name,
      surname,
      email: opts.payer.email.trim().toLowerCase(),
      identification,
    },
    external_reference: opts.orderId,
    statement_descriptor: "ISSTUDIO",
    binary_mode: false,
    metadata: {
      order_id: opts.orderId,
      source: "isstudio-store",
    },
  };

  /**
   * Importante: back_urls com http:// ou localhost são DESCARTADAS pelo MP.
   * Com back_urls vazias, o botão "Pagar" do Checkout Pro fica DESATIVADO.
   * Só enviamos success/failure/pending + auto_return + webhook em HTTPS público.
   * Docs: https://www.mercadopago.com.br/ajuda/botao-pagamento-desativado-ao-testar-checkout-pro_48609
   */
  const isPublicHttps =
    /^https:\/\//i.test(base) && !/localhost|127\.0\.0\.1/i.test(base);

  if (isPublicHttps) {
    body.back_urls = {
      success: `${base}/checkout/sucesso`,
      failure: `${base}/checkout/falha`,
      pending: `${base}/checkout/pendente`,
    };
    body.auto_return = "approved";
    body.notification_url = `${base}/api/webhook/mercadopago`;
  }

  const result = await preference.create({ body });
  return result;
}

export async function getPaymentById(paymentId: string) {
  const payment = new Payment(client());
  return payment.get({ id: paymentId });
}

export function isPaymentApproved(status?: string | null): boolean {
  return String(status || "").toLowerCase() === "approved";
}

export function checkoutRedirectUrl(preference: {
  init_point?: string | null;
  sandbox_init_point?: string | null;
}): string | null {
  if (isMercadoPagoSandboxToken()) {
    return preference.sandbox_init_point || preference.init_point || null;
  }
  return preference.init_point || preference.sandbox_init_point || null;
}
