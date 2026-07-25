import { NextResponse } from "next/server";
import {
  formatMercadoPagoError,
  getPaymentById,
  isMercadoPagoConfigured,
  isPaymentApproved,
} from "@/lib/mercadopago";

export const runtime = "nodejs";

/**
 * Webhook / IPN Mercado Pago
 * Configure em: Suas integrações → Webhooks →
 * URL: {APP_URL}/api/webhook/mercadopago
 * Eventos: payment
 *
 * Em localhost o MP não consegue chamar — use ngrok ou teste só via back_urls.
 */
export async function POST(req: Request) {
  if (!isMercadoPagoConfigured()) {
    return NextResponse.json({ error: "MP não configurado" }, { status: 503 });
  }

  try {
    const url = new URL(req.url);
    const topic =
      url.searchParams.get("topic") ||
      url.searchParams.get("type") ||
      "";
    const idFromQuery =
      url.searchParams.get("id") ||
      url.searchParams.get("data.id") ||
      "";

    let body: Record<string, unknown> = {};
    try {
      body = (await req.json()) as Record<string, unknown>;
    } catch {
      /* IPN antigo pode vir só com query */
    }

    const data = body.data as { id?: string | number } | undefined;
    const paymentId = String(
      data?.id || idFromQuery || body.id || "",
    );

    const action = String(body.type || body.action || topic || "");

    if (!paymentId) {
      console.log("[mercadopago webhook] sem payment id", { topic, body });
      return NextResponse.json({ received: true });
    }

    // Só processa eventos de pagamento
    if (
      action &&
      !/payment/i.test(action) &&
      topic &&
      !/payment/i.test(topic)
    ) {
      return NextResponse.json({ received: true });
    }

    const payment = await getPaymentById(paymentId);
    const status = payment?.status;
    const externalReference = payment?.external_reference;

    console.log("[mercadopago webhook]", {
      paymentId,
      status,
      externalReference,
      approved: isPaymentApproved(status),
      action,
    });

    // Persistência de pedidos pode ser ligada aqui depois (DB).
    return NextResponse.json({ received: true });
  } catch (e) {
    console.error("[mercadopago webhook]", formatMercadoPagoError(e));
    // Sempre 200 para o MP não reenviar em loop agressivo por erro transitório
    return NextResponse.json({ received: true });
  }
}

/** Alguns fluxos IPN usam GET */
export async function GET(req: Request) {
  return POST(req);
}
