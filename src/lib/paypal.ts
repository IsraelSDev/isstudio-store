/**
 * Cliente PayPal — Orders v2 (checkout por redirect)
 * Docs: https://developer.paypal.com/docs/api/orders/v2/
 */

const SANDBOX_BASE = "https://api-m.sandbox.paypal.com";
const LIVE_BASE = "https://api-m.paypal.com";

function getClientId(): string {
  return (process.env.PAYPAL_CLIENT_ID || "").trim();
}

function getClientSecret(): string {
  return (process.env.PAYPAL_CLIENT_SECRET || "").trim();
}

export function isPayPalConfigured(): boolean {
  return !!getClientId() && !!getClientSecret();
}

export function isPayPalSandbox(): boolean {
  const env = (process.env.PAYPAL_ENV || "").toLowerCase();
  if (env === "live" || env === "production") return false;
  if (env === "sandbox") return true;
  // Sem PAYPAL_ENV definido, assume sandbox por segurança
  return true;
}

export function getPayPalBaseUrl(): string {
  return isPayPalSandbox() ? SANDBOX_BASE : LIVE_BASE;
}

export function getPayPalCurrency(): string {
  return (process.env.PAYPAL_CURRENCY || "BRL").trim().toUpperCase();
}

export function formatPayPalError(err: unknown): string {
  if (err && typeof err === "object") {
    const e = err as {
      message?: string;
      details?: { description?: string; issue?: string }[];
      name?: string;
    };
    const detail = e.details
      ?.map((d) => d.description || d.issue)
      .filter(Boolean)
      .join("; ");
    if (detail) return detail;
    if (e.message) return e.message;
    if (e.name) return e.name;
  }
  return err instanceof Error ? err.message : String(err);
}

interface PayPalTokenResponse {
  access_token: string;
  expires_in: number;
}

let cachedToken: { value: string; expiresAt: number } | null = null;

async function getAccessToken(): Promise<string> {
  if (!isPayPalConfigured()) {
    throw new Error("PAYPAL_CLIENT_ID / PAYPAL_CLIENT_SECRET não configurados");
  }

  if (cachedToken && Date.now() < cachedToken.expiresAt) {
    return cachedToken.value;
  }

  const basic = Buffer.from(`${getClientId()}:${getClientSecret()}`).toString(
    "base64",
  );

  const res = await fetch(`${getPayPalBaseUrl()}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${basic}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
    cache: "no-store",
  });

  const data = (await res.json()) as PayPalTokenResponse & {
    error_description?: string;
  };

  if (!res.ok) {
    throw new Error(
      data?.error_description || "Falha ao autenticar no PayPal (OAuth).",
    );
  }

  cachedToken = {
    value: data.access_token,
    // Renova 60s antes de expirar
    expiresAt: Date.now() + (data.expires_in - 60) * 1000,
  };

  return data.access_token;
}

async function paypalFetch<T>(
  path: string,
  init: RequestInit & { idempotencyKey?: string } = {},
): Promise<T> {
  const token = await getAccessToken();
  const { idempotencyKey, ...rest } = init;

  const res = await fetch(`${getPayPalBaseUrl()}${path}`, {
    ...rest,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...(idempotencyKey ? { "PayPal-Request-Id": idempotencyKey } : {}),
      ...(rest.headers || {}),
    },
    cache: "no-store",
  });

  const text = await res.text();
  const data = text ? JSON.parse(text) : {};

  if (!res.ok) {
    throw Object.assign(new Error("Erro PayPal"), data);
  }

  return data as T;
}

export interface PayPalOrder {
  id: string;
  status: string;
  links?: { href: string; rel: string; method: string }[];
  purchase_units?: {
    reference_id?: string;
    custom_id?: string;
    payments?: {
      captures?: { id: string; status: string; amount?: { value: string } }[];
    };
  }[];
  payer?: { email_address?: string };
}

function money(value: number): string {
  return (Math.round(Number(value) * 100) / 100).toFixed(2);
}

export async function createOrder(opts: {
  orderId: string;
  items: {
    id: string;
    name: string;
    quantity: number;
    unitPrice: number;
  }[];
  subtotal: number;
  baseUrl: string;
}): Promise<PayPalOrder> {
  const currency = getPayPalCurrency();
  const base = opts.baseUrl.replace(/\/+$/, "");

  const itemTotal = opts.items.reduce(
    (acc, i) => acc + Number(i.unitPrice) * i.quantity,
    0,
  );

  return paypalFetch<PayPalOrder>("/v2/checkout/orders", {
    method: "POST",
    idempotencyKey: opts.orderId,
    body: JSON.stringify({
      intent: "CAPTURE",
      purchase_units: [
        {
          reference_id: opts.orderId,
          custom_id: opts.orderId,
          description: `ISStudio Store — pedido ${opts.orderId}`.slice(0, 127),
          amount: {
            currency_code: currency,
            value: money(itemTotal),
            breakdown: {
              item_total: {
                currency_code: currency,
                value: money(itemTotal),
              },
            },
          },
          items: opts.items.map((item) => ({
            name: item.name.slice(0, 127),
            quantity: String(item.quantity),
            unit_amount: {
              currency_code: currency,
              value: money(item.unitPrice),
            },
            category: "DIGITAL_GOODS",
          })),
        },
      ],
      payment_source: {
        paypal: {
          experience_context: {
            brand_name: "ISStudio Store",
            locale: "pt-BR",
            landing_page: "LOGIN",
            shipping_preference: "NO_SHIPPING",
            user_action: "PAY_NOW",
            return_url: `${base}/checkout/paypal/retorno`,
            cancel_url: `${base}/checkout/falha?provider=paypal`,
          },
        },
      },
    }),
  });
}

export async function captureOrder(paypalOrderId: string): Promise<PayPalOrder> {
  return paypalFetch<PayPalOrder>(
    `/v2/checkout/orders/${paypalOrderId}/capture`,
    {
      method: "POST",
      idempotencyKey: `capture-${paypalOrderId}`,
      body: JSON.stringify({}),
    },
  );
}

export async function getOrder(paypalOrderId: string): Promise<PayPalOrder> {
  return paypalFetch<PayPalOrder>(`/v2/checkout/orders/${paypalOrderId}`, {
    method: "GET",
  });
}

export function approveLink(order: PayPalOrder): string | null {
  const link = order.links?.find(
    (l) => l.rel === "payer-action" || l.rel === "approve",
  );
  return link?.href || null;
}

export function isOrderCompleted(status?: string | null): boolean {
  return String(status || "").toUpperCase() === "COMPLETED";
}

/** Verifica a assinatura do webhook via API oficial do PayPal */
export async function verifyWebhookSignature(opts: {
  headers: Headers;
  rawBody: string;
}): Promise<boolean> {
  const webhookId = (process.env.PAYPAL_WEBHOOK_ID || "").trim();
  if (!webhookId) return false;

  const payload = {
    auth_algo: opts.headers.get("paypal-auth-algo"),
    cert_url: opts.headers.get("paypal-cert-url"),
    transmission_id: opts.headers.get("paypal-transmission-id"),
    transmission_sig: opts.headers.get("paypal-transmission-sig"),
    transmission_time: opts.headers.get("paypal-transmission-time"),
    webhook_id: webhookId,
    webhook_event: JSON.parse(opts.rawBody),
  };

  try {
    const result = await paypalFetch<{ verification_status: string }>(
      "/v1/notifications/verify-webhook-signature",
      { method: "POST", body: JSON.stringify(payload) },
    );
    return result.verification_status === "SUCCESS";
  } catch (e) {
    console.warn("[paypal] verifyWebhookSignature", formatPayPalError(e));
    return false;
  }
}
