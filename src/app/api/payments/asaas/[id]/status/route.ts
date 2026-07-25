import { NextResponse } from "next/server";
import {
  formatAsaasError,
  getPayment,
  isAsaasConfigured,
  isPaymentConfirmed,
} from "@/lib/asaas";

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

    return NextResponse.json({
      paymentId: id,
      status,
      confirmed,
      value: payment?.value ?? null,
      invoiceUrl: payment?.invoiceUrl || payment?.bankSlipUrl || null,
    });
  } catch (e) {
    return NextResponse.json(
      { error: formatAsaasError(e) },
      { status: 500 },
    );
  }
}
