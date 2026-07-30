import { NextResponse } from "next/server";
import {
  formatAsaasError,
  getPayment,
  isAsaasConfigured,
  isPaymentConfirmed,
} from "@/lib/asaas";
import { deliverPaidOrder } from "@/lib/delivery";
import { formatRedeemCode } from "@/lib/redeem-code";
import { isSupabaseConfigured } from "@/lib/supabase";

export const runtime = "nodejs";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Params) {
  try {
    if (!isAsaasConfigured()) {
      return NextResponse.json(
        { error: "Asaas não configurado." },
        { status: 503 },
      );
    }

    const { id } = await params;
    if (!id) {
      return NextResponse.json(
        { error: "paymentId obrigatório." },
        { status: 400 },
      );
    }

    const payment = await getPayment(id);
    const status = String(payment?.status || "");
    const confirmed = isPaymentConfirmed(status);

    // O Pix é confirmado por polling; em localhost o webhook não chega, então a
    // entrega também é disparada aqui. `code` só vem na primeira confirmação —
    // nas chamadas seguintes o cliente depende do e-mail, como esperado.
    let redeemCode: string | null = null;
    let orderRef: string | null = null;

    if (confirmed && isSupabaseConfigured()) {
      try {
        const result = await deliverPaidOrder({
          paymentId: id,
          externalReference: payment?.externalReference,
          subscriptionId: payment?.subscription,
        });
        if (result) {
          orderRef = result.order.order_ref;
          redeemCode = result.code ? formatRedeemCode(result.code) : null;
        }
      } catch (e) {
        console.error("[asaas status] entrega", e);
      }
    }

    return NextResponse.json({
      paymentId: id,
      status,
      confirmed,
      value: payment?.value ?? null,
      invoiceUrl: payment?.invoiceUrl || payment?.bankSlipUrl || null,
      orderRef,
      redeemCode,
    });
  } catch (e) {
    return NextResponse.json({ error: formatAsaasError(e) }, { status: 500 });
  }
}
