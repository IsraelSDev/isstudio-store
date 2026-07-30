import { NextResponse } from "next/server";
import { isPaymentConfirmed } from "@/lib/asaas";
import { deliverPaidOrder } from "@/lib/delivery";
import { markOrderFailed } from "@/lib/orders";
import { isSupabaseConfigured } from "@/lib/supabase";

export const runtime = "nodejs";

const FAILURE_EVENTS = new Set([
  "PAYMENT_REFUNDED",
  "PAYMENT_CHARGEBACK_REQUESTED",
  "PAYMENT_DELETED",
  "PAYMENT_REVERSED",
]);

/**
 * Webhook Asaas — mesma validação do Capivara (header asaas-access-token).
 * Configure no painel: {APP_URL}/api/webhook/asaas
 * Eventos: PAYMENT_RECEIVED, PAYMENT_CONFIRMED
 *
 * Sempre responde 200 quando o token é válido: erro de banco ou de e-mail não
 * deve fazer o Asaas reenfileirar o evento indefinidamente. Falhas ficam no log
 * e o código continua recuperável pela tela de sucesso do checkout.
 */
export async function POST(req: Request) {
  const expected = (process.env.ASAAS_WEBHOOK_TOKEN || "").trim();
  const token = (
    req.headers.get("asaas-access-token") ||
    req.headers.get("Asaas-Access-Token") ||
    ""
  ).trim();

  if (expected && token !== expected) {
    return NextResponse.json({ error: "Token inválido" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const event = String(body?.event || "");
    const payment = body?.payment;
    const status = String(payment?.status || "");
    const paymentId = String(payment?.id || "");
    const externalReference = payment?.externalReference as string | undefined;
    const subscriptionId = payment?.subscription as string | undefined;
    const confirmed = isPaymentConfirmed(status);

    console.log("[asaas webhook]", {
      event,
      paymentId,
      status,
      externalReference,
      confirmed,
    });

    if (!isSupabaseConfigured()) {
      console.warn("[asaas webhook] Supabase não configurado — entrega ignorada");
      return NextResponse.json({ received: true });
    }

    if (paymentId && confirmed) {
      const result = await deliverPaidOrder({
        paymentId,
        externalReference,
        subscriptionId,
      });
      if (result?.code) {
        console.log(
          "[asaas webhook] código emitido para o pedido",
          result.order.order_ref,
        );
      }
    } else if (paymentId && FAILURE_EVENTS.has(event)) {
      await markOrderFailed(paymentId, externalReference);
    }

    return NextResponse.json({ received: true });
  } catch (e) {
    console.error("[asaas webhook]", e);
    return NextResponse.json({ received: true });
  }
}
