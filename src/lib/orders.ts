import { supabaseAdmin } from "./supabase";
import {
  generateRedeemCode,
  hashRedeemCode,
  isValidRedeemCodeShape,
  redeemCodeLast4,
} from "./redeem-code";

const TABLE = "orders";
const ATTEMPTS_TABLE = "redeem_attempts";

export type OrderStatus = "pending" | "paid" | "failed";

export interface OrderItem {
  id: string;
  slug?: string;
  name: string;
  price: number;
  quantity: number;
  pricingModel?: string;
  billingPeriod?: string;
}

export interface Order {
  id: string;
  order_ref: string;
  asaas_payment_id: string | null;
  asaas_subscription_id: string | null;
  customer_name: string;
  customer_email: string;
  amount: number;
  status: OrderStatus;
  items: OrderItem[];
  redeem_code_hash: string | null;
  redeem_code_last4: string | null;
  redeem_count: number;
  first_redeemed_at: string | null;
  last_redeemed_at: string | null;
  paid_at: string | null;
  email_sent_at: string | null;
  created_at: string;
  updated_at: string;
}

export function generateOrderRef(): string {
  const stamp = Date.now().toString(36).toUpperCase();
  const suffix = Math.floor(Math.random() * 900 + 100);
  return `ISS-${stamp}-${suffix}`;
}

export async function createPendingOrder(input: {
  orderRef: string;
  customerName: string;
  customerEmail: string;
  amount: number;
  items: OrderItem[];
}): Promise<Order> {
  const { data, error } = await supabaseAdmin()
    .from(TABLE)
    .insert({
      order_ref: input.orderRef,
      customer_name: input.customerName,
      customer_email: input.customerEmail.toLowerCase(),
      amount: input.amount,
      items: input.items,
      status: "pending",
    })
    .select()
    .single();

  if (error) throw new Error(`Falha ao registrar pedido: ${error.message}`);
  return data as Order;
}

export async function attachAsaasIds(
  orderId: string,
  ids: { paymentId?: string | null; subscriptionId?: string | null },
): Promise<void> {
  const patch: Record<string, string> = {};
  if (ids.paymentId) patch.asaas_payment_id = String(ids.paymentId);
  if (ids.subscriptionId) patch.asaas_subscription_id = String(ids.subscriptionId);
  if (Object.keys(patch).length === 0) return;

  const { error } = await supabaseAdmin()
    .from(TABLE)
    .update(patch)
    .eq("id", orderId);

  if (error) throw new Error(`Falha ao vincular cobrança: ${error.message}`);
}

export async function getOrderByRef(orderRef: string): Promise<Order | null> {
  const { data, error } = await supabaseAdmin()
    .from(TABLE)
    .select("*")
    .eq("order_ref", orderRef)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return (data as Order) ?? null;
}

async function findOrderForPayment(
  paymentId: string,
  externalReference?: string | null,
): Promise<Order | null> {
  const db = supabaseAdmin();

  const byPayment = await db
    .from(TABLE)
    .select("*")
    .eq("asaas_payment_id", paymentId)
    .maybeSingle();
  if (byPayment.error) throw new Error(byPayment.error.message);
  if (byPayment.data) return byPayment.data as Order;

  // Renovações de assinatura chegam com paymentId novo, mas mesmo
  // externalReference (isstudio-order-<orderRef>) do pedido original.
  const orderRef = String(externalReference || "").replace(
    /^isstudio-order-/,
    "",
  );
  if (!orderRef) return null;

  return getOrderByRef(orderRef);
}

/**
 * Confirma o pagamento e emite o código de resgate uma única vez.
 *
 * Idempotente de propósito: o webhook do Asaas pode reentregar o mesmo evento e
 * o polling do Pix chama esta função em paralelo. O `code` só volta preenchido
 * na chamada que efetivamente gravou o hash — as demais recebem `null`, então o
 * e-mail não é reenviado nem o código é trocado.
 */
export async function confirmPaymentAndIssueCode(input: {
  paymentId: string;
  externalReference?: string | null;
  subscriptionId?: string | null;
}): Promise<{ order: Order; code: string | null } | null> {
  const db = supabaseAdmin();
  const existing = await findOrderForPayment(
    input.paymentId,
    input.externalReference,
  );
  if (!existing) return null;
  if (existing.redeem_code_hash) return { order: existing, code: null };

  const code = generateRedeemCode();
  const patch: Record<string, unknown> = {
    status: "paid",
    paid_at: existing.paid_at || new Date().toISOString(),
    redeem_code_hash: hashRedeemCode(code),
    redeem_code_last4: redeemCodeLast4(code),
  };
  if (!existing.asaas_payment_id) patch.asaas_payment_id = input.paymentId;
  if (input.subscriptionId && !existing.asaas_subscription_id) {
    patch.asaas_subscription_id = String(input.subscriptionId);
  }

  const { data, error } = await db
    .from(TABLE)
    .update(patch)
    .eq("id", existing.id)
    .is("redeem_code_hash", null)
    .select()
    .maybeSingle();

  if (error) throw new Error(`Falha ao confirmar pedido: ${error.message}`);

  if (!data) {
    // Outra chamada concorrente emitiu o código primeiro.
    const fresh = await db
      .from(TABLE)
      .select("*")
      .eq("id", existing.id)
      .maybeSingle();
    if (!fresh.data) return null;
    return { order: fresh.data as Order, code: null };
  }

  return { order: data as Order, code };
}

export async function markOrderFailed(
  paymentId: string,
  externalReference?: string | null,
): Promise<void> {
  const existing = await findOrderForPayment(paymentId, externalReference);
  if (!existing || existing.status === "paid") return;

  await supabaseAdmin()
    .from(TABLE)
    .update({ status: "failed" })
    .eq("id", existing.id);
}

export async function markEmailSent(orderId: string): Promise<void> {
  await supabaseAdmin()
    .from(TABLE)
    .update({ email_sent_at: new Date().toISOString() })
    .eq("id", orderId);
}

export async function findPaidOrderByRedeemCode(
  rawCode: string,
): Promise<Order | null> {
  if (!isValidRedeemCodeShape(rawCode)) return null;

  const { data, error } = await supabaseAdmin()
    .from(TABLE)
    .select("*")
    .eq("redeem_code_hash", hashRedeemCode(rawCode))
    .eq("status", "paid")
    .maybeSingle();

  if (error) throw new Error(error.message);
  return (data as Order) ?? null;
}

export async function registerRedeem(order: Order): Promise<void> {
  const now = new Date().toISOString();
  await supabaseAdmin()
    .from(TABLE)
    .update({
      redeem_count: (order.redeem_count || 0) + 1,
      first_redeemed_at: order.first_redeemed_at || now,
      last_redeemed_at: now,
    })
    .eq("id", order.id);
}

export async function logRedeemAttempt(input: {
  orderId?: string | null;
  success: boolean;
  ip?: string | null;
  userAgent?: string | null;
}): Promise<void> {
  try {
    await supabaseAdmin().from(ATTEMPTS_TABLE).insert({
      order_id: input.orderId ?? null,
      success: input.success,
      ip: input.ip ?? null,
      user_agent: input.userAgent ?? null,
    });
  } catch (e) {
    console.warn("[orders] logRedeemAttempt", e);
  }
}

export async function getOrderById(orderId: string): Promise<Order | null> {
  const { data, error } = await supabaseAdmin()
    .from(TABLE)
    .select("*")
    .eq("id", orderId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return (data as Order) ?? null;
}
