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
import { products } from "@/lib/catalog";
import {
  attachAsaasIds,
  createPendingOrder,
  generateOrderRef,
  type OrderItem,
} from "@/lib/orders";
import { isSupabaseConfigured } from "@/lib/supabase";

export const runtime = "nodejs";

type BillingMethod = "PIX" | "CREDIT_CARD" | "BOLETO";

interface CheckoutBody {
  name: string;
  email: string;
  cpfCnpj: string;
  billingType: BillingMethod;
  items: { id: string; quantity: number }[];
}

function digitsOnly(value: string) {
  return String(value || "").replace(/\D/g, "");
}

/**
 * Monta os itens a partir do catálogo do servidor, ignorando nome e preço
 * enviados pelo cliente — o valor cobrado nunca deve vir do navegador.
 */
function resolveItems(
  raw: CheckoutBody["items"],
): { items: OrderItem[]; subtotal: number } | { error: string } {
  if (!Array.isArray(raw) || raw.length === 0) {
    return { error: "Carrinho vazio." };
  }

  const items: OrderItem[] = [];
  for (const entry of raw) {
    const product = products.find((p) => p.id === entry?.id);
    if (!product) {
      return { error: `Produto não encontrado no catálogo: ${entry?.id}` };
    }

    const quantity = Math.floor(Number(entry.quantity) || 0);
    if (quantity < 1 || quantity > 99) {
      return { error: `Quantidade inválida para ${product.name}.` };
    }

    items.push({
      id: product.id,
      slug: product.slug,
      name: product.name,
      price: product.price,
      quantity,
      pricingModel: product.pricingModel,
      billingPeriod: product.billingPeriod,
    });
  }

  const subtotal = items.reduce(
    (total, item) => total + item.price * item.quantity,
    0,
  );
  if (subtotal <= 0) return { error: "Valor do pedido inválido." };

  return { items, subtotal };
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

    // Sem banco não há como emitir o código de resgate: melhor recusar antes de
    // cobrar do que receber o pagamento e não conseguir entregar o produto.
    if (!isSupabaseConfigured()) {
      return NextResponse.json(
        {
          error:
            "Entrega automática indisponível. Defina SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY antes de aceitar pagamentos.",
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
    if (!["PIX", "CREDIT_CARD", "BOLETO"].includes(billingType)) {
      return NextResponse.json(
        { error: "Forma de pagamento Asaas inválida." },
        { status: 400 },
      );
    }

    const resolved = resolveItems(body.items);
    if ("error" in resolved) {
      return NextResponse.json({ error: resolved.error }, { status: 400 });
    }
    const { items, subtotal } = resolved;

    const orderId = generateOrderRef();
    const description =
      items.length === 1
        ? `ISStudio Store — ${items[0].name}`
        : `ISStudio Store — ${items.length} itens (${orderId})`;

    const order = await createPendingOrder({
      orderRef: orderId,
      customerName: name,
      customerEmail: email,
      amount: subtotal,
      items,
    });

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
      const cycle = items[0]?.billingPeriod === "year" ? "YEARLY" : "MONTHLY";
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

      await attachAsaasIds(order.id, {
        subscriptionId: asaasSubId,
        paymentId: (firstPayment?.id as string | undefined) || null,
      });

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
      await attachAsaasIds(order.id, { paymentId });

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

    await attachAsaasIds(order.id, { paymentId: String(payment.id) });

    const redirectUrl = payment?.invoiceUrl || payment?.bankSlipUrl || null;
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
    return NextResponse.json({ error: formatAsaasError(e) }, { status: 500 });
  }
}
