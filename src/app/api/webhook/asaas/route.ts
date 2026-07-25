import { NextResponse } from "next/server";
import { isPaymentConfirmed } from "@/lib/asaas";

export const runtime = "nodejs";

/**
 * Webhook Asaas — mesma validação do Capivara (header asaas-access-token).
 * Configure no painel: {APP_URL}/api/webhook/asaas
 * Eventos: PAYMENT_RECEIVED, PAYMENT_CONFIRMED
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
    const paymentId = payment?.id;
    const externalReference = payment?.externalReference;

    console.log("[asaas webhook]", {
      event,
      paymentId,
      status,
      externalReference,
      confirmed: isPaymentConfirmed(status),
    });

    // Persistência de pedidos pode ser ligada aqui depois (DB).
    return NextResponse.json({ received: true });
  } catch (e) {
    console.error("[asaas webhook]", e);
    return NextResponse.json({ received: true });
  }
}
