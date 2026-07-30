import type { PaymentStatus, ProviderId } from "../providers/index.js";

export interface PaymentEvent {
  provider: ProviderId;
  providerId: string;
  externalReference: string | null;
  status: PaymentStatus;
  amountInCents: number | null;
  occurredAt: string;
  /** Corpo original, para auditoria e depuração. */
  raw: unknown;
}

/**
 * Tabelas de tradução por provedor.
 *
 * Vocabulário desconhecido cai em "pending" de propósito: tratar status novo
 * como pago liberaria produto sem pagamento, e como falho cancelaria uma venda
 * boa. Pendente é o único default seguro.
 */
const ASAAS_STATUS: Record<string, PaymentStatus> = {
  PENDING: "pending",
  AWAITING_RISK_ANALYSIS: "pending",
  CONFIRMED: "paid",
  RECEIVED: "paid",
  RECEIVED_IN_CASH: "paid",
  OVERDUE: "failed",
  REFUNDED: "refunded",
  CHARGEBACK_REQUESTED: "refunded",
};

const MERCADOPAGO_STATUS: Record<string, PaymentStatus> = {
  pending: "pending",
  in_process: "pending",
  authorized: "pending",
  approved: "paid",
  rejected: "failed",
  cancelled: "failed",
  refunded: "refunded",
  charged_back: "refunded",
};

const PAYPAL_STATUS: Record<string, PaymentStatus> = {
  CREATED: "pending",
  SAVED: "pending",
  APPROVED: "pending",
  PENDING: "pending",
  COMPLETED: "paid",
  DECLINED: "failed",
  VOIDED: "failed",
  REFUNDED: "refunded",
};

function toCents(value: unknown): number | null {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return null;
  return Math.round(amount * 100);
}

function pick(map: Record<string, PaymentStatus>, key: unknown): PaymentStatus {
  return map[String(key ?? "")] ?? "pending";
}

export function normalizeAsaas(body: Record<string, any>): PaymentEvent {
  const payment = body?.payment ?? {};
  return {
    provider: "asaas",
    providerId: String(payment.id ?? ""),
    externalReference: payment.externalReference ?? null,
    status: pick(ASAAS_STATUS, payment.status),
    amountInCents: toCents(payment.value),
    occurredAt: body?.dateCreated ?? new Date().toISOString(),
    raw: body,
  };
}

export function normalizeMercadoPago(
  payment: Record<string, any>,
): PaymentEvent {
  return {
    provider: "mercadopago",
    providerId: String(payment.id ?? ""),
    externalReference: payment.external_reference ?? null,
    status: pick(MERCADOPAGO_STATUS, payment.status),
    amountInCents: toCents(payment.transaction_amount),
    occurredAt: payment.date_last_updated ?? new Date().toISOString(),
    raw: payment,
  };
}

export function normalizePayPal(body: Record<string, any>): PaymentEvent {
  const resource = body?.resource ?? {};
  return {
    provider: "paypal",
    providerId: String(resource.id ?? ""),
    externalReference:
      resource.custom_id ?? resource.invoice_id ?? null,
    status: pick(PAYPAL_STATUS, resource.status),
    amountInCents: toCents(resource?.amount?.value),
    occurredAt: body?.create_time ?? new Date().toISOString(),
    raw: body,
  };
}
