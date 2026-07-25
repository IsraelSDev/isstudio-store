import { NextResponse } from "next/server";
import {
  buildExternalReference,
  createPayment,
  createPixPayment,
  createSubscription,
  ensurePixAddressKey,
  findOrCreateCustomer,
  formatAsaasError,
  getSubscriptionPayments,
  isAsaasConfigured,
  pixQrSetupHint,
  waitForPixQrForPayment,
  type AsaasBillingType,
} from "@/lib/asaas";

export const runtime = "nodejs";

type BillingMethod = "PIX" | "CREDIT_CARD" | "BOLETO";

interface CheckoutBody {
  name: string;
  email: string;
  cpfCnpj: string;
  billingType: BillingMethod;
  items: {
    id: string;
    name: string;
    price: number;
    quantity: number;
    pricingModel: string;
    billingPeriod?: string;
  }[];
  subtotal: number;
}

function digitsOnly(value: string) {
  return String(value || "").replace(/\D/g, "");
}

export async function POST(req: Request) {
  try {
    if (!isAsaasConfigured()) {
      return NextResponse.json(
        {
          error:
            "Asaas não configurado. Defina ASAAS_API_KEY no .env.local (mesma chave do Capivara).",
        },
        { status: 503 },
      );
    }

    const body = (await req.json()) as CheckoutBody;
    const email = String(body.email || "")
      .trim()
      .toLowerCase();
    const name = String(body.name || "").trim();
    const cpfCnpj = digitsOnly(body.cpfCnpj);
    const billingType = (body.billingType || "PIX") as BillingMethod;
    const items = Array.isArray(body.items) ? body.items : [];
    const subtotal = Number(body.subtotal) || 0;

    if (!email || !name) {
      return NextResponse.json(
        { error: "Nome e e-mail são obrigatórios." },
        { status: 400 },
      );
    }
    if (cpfCnpj.length < 11) {
      return NextResponse.json(
        { error: "Informe um CPF ou CNPJ válido." },
        { status: 400 },
      );
    }
    if (items.length === 0 || subtotal <= 0) {
      return NextResponse.json(
        { error: "Carrinho vazio ou valor inválido." },
        { status: 400 },
      );
    }
    if (!["PIX", "CREDIT_CARD", "BOLETO"].includes(billingType)) {
      return NextResponse.json(
        { error: "Forma de pagamento Asaas inválida." },
        { status: 400 },
      );
    }

    const orderId = `ISS-${Date.now().toString(36).toUpperCase()}-${Math.floor(
      Math.random() * 900 + 100,
    )}`;
    const description =
      items.length === 1
        ? `ISStudio Store — ${items[0].name}`
        : `ISStudio Store — ${items.length} itens (${orderId})`;

    const customer = await findOrCreateCustomer({
      name,
      email,
      cpfCnpj,
      externalReference: `isstudio-customer-${email}`,
    });

    const externalReference = buildExternalReference(orderId);
    const allSubscriptions = items.every(
      (i) => i.pricingModel === "subscription",
    );

    // Assinaturas + cartão → subscription Asaas (mesmo fluxo do Capivara)
    if (allSubscriptions && billingType === "CREDIT_CARD") {
      const cycle =
        items[0]?.billingPeriod === "year" ? "YEARLY" : "MONTHLY";
      const subscription = await createSubscription({
        customerId: customer.id,
        billingType: "CREDIT_CARD",
        value: subtotal,
        description,
        externalReference,
        cycle,
      });

      const asaasSubId = String(subscription.id);
      let firstPayment: Record<string, unknown> | null = null;
      for (let attempt = 0; attempt < 8; attempt++) {
        const payments = await getSubscriptionPayments(asaasSubId);
        if (payments.length > 0) {
          firstPayment = payments[0];
          break;
        }
        await new Promise((r) => setTimeout(r, 1000));
      }

      const redirectUrl =
        (firstPayment?.invoiceUrl as string | undefined) ||
        (subscription?.invoiceUrl as string | undefined) ||
        (firstPayment?.bankSlipUrl as string | undefined) ||
        null;

      if (!redirectUrl) {
        return NextResponse.json(
          {
            error:
              "Link de pagamento com cartão indisponível. Tente novamente em instantes.",
          },
          { status: 502 },
        );
      }

      return NextResponse.json({
        flow: "redirect",
        provider: "asaas",
        orderId,
        subscriptionId: asaasSubId,
        paymentId: firstPayment?.id || null,
        redirectUrl,
        amount: subtotal,
      });
    }

    // PIX → QR no site (fluxo Capivara)
    if (billingType === "PIX") {
      await ensurePixAddressKey();
      const payment = await createPixPayment({
        customerId: customer.id,
        value: subtotal,
        description,
        externalReference,
      });

      const paymentId = String(payment.id);
      if (String(payment.billingType || "").toUpperCase() !== "PIX") {
        return NextResponse.json(
          {
            error: `A cobrança foi criada como ${payment.billingType || "outro método"}, não PIX. Habilite PIX na conta Asaas.`,
          },
          { status: 502 },
        );
      }

      const pix = await waitForPixQrForPayment(paymentId, payment);
      if (!pix.qr_code && !pix.qr_base64) {
        return NextResponse.json(
          {
            error: `Não foi possível gerar o QR Code PIX. ${pixQrSetupHint()}`,
          },
          { status: 502 },
        );
      }

      return NextResponse.json({
        flow: "pix",
        provider: "asaas",
        orderId,
        paymentId,
        amount: subtotal,
        pending: true,
        pix: {
          qr_code: pix.qr_code,
          qr_base64: pix.qr_base64,
          expires_at: pix.expires_at,
          invoiceUrl: pix.invoiceUrl,
        },
      });
    }

    // Cartão / boleto avulso → redirect invoiceUrl
    const payment = await createPayment({
      customerId: customer.id,
      billingType: billingType as AsaasBillingType,
      value: subtotal,
      description,
      externalReference,
    });

    const redirectUrl =
      payment?.invoiceUrl || payment?.bankSlipUrl || null;
    if (!redirectUrl) {
      return NextResponse.json(
        {
          error:
            "Link de pagamento indisponível no Asaas. Tente Pix ou outra forma.",
        },
        { status: 502 },
      );
    }

    return NextResponse.json({
      flow: "redirect",
      provider: "asaas",
      orderId,
      paymentId: payment.id,
      redirectUrl,
      amount: subtotal,
    });
  } catch (e) {
    console.error("[asaas] checkout", formatAsaasError(e));
    return NextResponse.json(
      { error: formatAsaasError(e) },
      { status: 500 },
    );
  }
}
