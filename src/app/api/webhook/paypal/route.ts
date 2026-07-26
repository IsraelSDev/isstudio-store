import { NextResponse } from "next/server";
import {
  formatPayPalError,
  isPayPalConfigured,
  isOrderCompleted,
  verifyWebhookSignature,
} from "@/lib/paypal";

export const runtime = "nodejs";

/**
 * Webhook PayPal
 *
 * Painel: Developer Dashboard → sua app → Webhooks → Add webhook
 * URL: {APP_URL}/api/webhook/paypal
 * Eventos: CHECKOUT.ORDER.APPROVED, PAYMENT.CAPTURE.COMPLETED,
 *          PAYMENT.CAPTURE.DENIED, PAYMENT.CAPTURE.REFUNDED
 *
 * Copie o Webhook ID gerado para PAYPAL_WEBHOOK_ID.
 */
export async function POST(req: Request) {
  if (!isPayPalConfigured()) {
    return NextResponse.json({ error: "PayPal não configurado" }, { status: 503 });
  }

  const rawBody = await req.text();

  try {
    const hasWebhookId = !!(process.env.PAYPAL_WEBHOOK_ID || "").trim();
    if (hasWebhookId) {
      const valid = await verifyWebhookSignature({
        headers: req.headers,
        rawBody,
      });
      if (!valid) {
        console.warn("[paypal webhook] assinatura inválida");
        return NextResponse.json({ error: "Assinatura inválida" }, { status: 401 });
      }
    } else {
      console.warn(
        "[paypal webhook] PAYPAL_WEBHOOK_ID ausente — assinatura não validada",
      );
    }

    const event = JSON.parse(rawBody || "{}") as {
      event_type?: string;
      resource?: {
        id?: string;
        status?: string;
        custom_id?: string;
        supplementary_data?: {
          related_ids?: { order_id?: string };
        };
      };
    };

    const eventType = event.event_type || "";
    const resource = event.resource || {};

    console.log("[paypal webhook]", {
      eventType,
      resourceId: resource.id,
      status: resource.status,
      orderId: resource.custom_id,
      completed: isOrderCompleted(resource.status),
    });

    // Persistência de pedidos pode ser ligada aqui depois (DB).
    return NextResponse.json({ received: true }, { status: 200 });
  } catch (e) {
    console.error("[paypal webhook]", formatPayPalError(e));
    return NextResponse.json({ received: true }, { status: 200 });
  }
}
