import { NextResponse } from "next/server";
import {
  InvalidWebhookSignatureError,
  WebhookSignatureValidator,
} from "mercadopago";
import {
  formatMercadoPagoError,
  getPaymentById,
  isMercadoPagoConfigured,
  isPaymentApproved,
} from "@/lib/mercadopago";

export const runtime = "nodejs";

function getWebhookSecret(): string {
  return (
    process.env.MERCADOPAGO_WEBHOOK_SECRET ||
    process.env.MP_WEBHOOK_SECRET ||
    ""
  ).trim();
}

function validateSignature(req: Request, dataId: string) {
  const secret = getWebhookSecret();
  // Sem secret configurado, aceita (útil em dev) — em produção configure sempre
  if (!secret) {
    console.warn(
      "[mercadopago webhook] MERCADOPAGO_WEBHOOK_SECRET ausente — assinatura não validada",
    );
    return;
  }

  const xSignature = req.headers.get("x-signature") || "";
  const xRequestId = req.headers.get("x-request-id") || "";

  WebhookSignatureValidator.validate({
    xSignature,
    xRequestId,
    dataId,
    secret,
  });
}

/**
 * Webhook Mercado Pago
 *
 * URL no painel (produção):
 *   https://store.isstudio.com.br/api/webhook/mercadopago
 *
 * URL de teste (Vercel):
 *   https://isstudio-store-three.vercel.app/api/webhook/mercadopago
 *
 * Eventos: marque "Pagamentos" (topic payment) — funciona com Checkout Pro.
 * NÃO use só a raiz do site (https://store.isstudio.com.br) — precisa do path /api/webhook/mercadopago
 */
export async function POST(req: Request) {
  try {
    const url = new URL(req.url);
    const topic =
      url.searchParams.get("topic") ||
      url.searchParams.get("type") ||
      "";
    const idFromQuery =
      url.searchParams.get("data.id") ||
      url.searchParams.get("id") ||
      "";

    let body: Record<string, unknown> = {};
    try {
      body = (await req.json()) as Record<string, unknown>;
    } catch {
      /* IPN antigo / simulação sem body */
    }

    const data = body.data as { id?: string | number } | undefined;
    const paymentId = String(data?.id || idFromQuery || body.id || "");
    const action = String(body.type || body.action || topic || "");

    try {
      validateSignature(req, paymentId || idFromQuery);
    } catch (err) {
      if (err instanceof InvalidWebhookSignatureError) {
        console.warn("[mercadopago webhook] assinatura inválida", err.message);
        return NextResponse.json({ error: "Assinatura inválida" }, { status: 401 });
      }
      throw err;
    }

    // Simulação do painel com data.id fictício (ex.: 123456) — confirma recebimento
    if (!paymentId) {
      console.log("[mercadopago webhook] recebido sem payment id", { topic, body });
      return NextResponse.json({ received: true }, { status: 200 });
    }

    // Eventos que não são payment — só ack
    if (
      action &&
      !/payment/i.test(action) &&
      topic &&
      !/payment/i.test(topic)
    ) {
      console.log("[mercadopago webhook] evento ignorado", { action, topic, paymentId });
      return NextResponse.json({ received: true }, { status: 200 });
    }

    if (!isMercadoPagoConfigured()) {
      console.warn("[mercadopago webhook] token ausente — ack sem consultar pagamento");
      return NextResponse.json({ received: true }, { status: 200 });
    }

    try {
      const payment = await getPaymentById(paymentId);
      console.log("[mercadopago webhook]", {
        paymentId,
        status: payment?.status,
        externalReference: payment?.external_reference,
        approved: isPaymentApproved(payment?.status),
        action,
      });
    } catch (e) {
      // Simulação do painel com ID inexistente (123456) — ainda assim 200
      console.warn(
        "[mercadopago webhook] não foi possível carregar pagamento",
        paymentId,
        formatMercadoPagoError(e),
      );
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (e) {
    console.error("[mercadopago webhook]", formatMercadoPagoError(e));
    return NextResponse.json({ received: true }, { status: 200 });
  }
}

export async function GET(req: Request) {
  return POST(req);
}
