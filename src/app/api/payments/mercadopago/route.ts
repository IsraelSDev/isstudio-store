import { NextResponse } from "next/server";
import {
  checkoutRedirectUrl,
  createCheckoutPreference,
  formatMercadoPagoError,
  isMercadoPagoConfigured,
} from "@/lib/mercadopago";
import { siteConfig } from "@/lib/seo";

export const runtime = "nodejs";

interface CheckoutBody {
  name: string;
  email: string;
  cpfCnpj: string;
  items: {
    id: string;
    name: string;
    price: number;
    quantity: number;
  }[];
  subtotal: number;
}

export async function POST(req: Request) {
  try {
    if (!isMercadoPagoConfigured()) {
      return NextResponse.json(
        {
          error:
            "Mercado Pago não configurado. Defina MERCADOPAGO_ACCESS_TOKEN no .env.local (credenciais de produção ou teste).",
        },
        { status: 503 },
      );
    }

    const body = (await req.json()) as CheckoutBody;
    const email = String(body.email || "")
      .trim()
      .toLowerCase();
    const name = String(body.name || "").trim();
    const cpfCnpj = String(body.cpfCnpj || "").replace(/\D/g, "");
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

    const orderId = `ISS-MP-${Date.now().toString(36).toUpperCase()}-${Math.floor(
      Math.random() * 900 + 100,
    )}`;

    const origin = req.headers.get("origin") || "";
    const baseUrl =
      (process.env.NEXT_PUBLIC_APP_URL || "").replace(/\/+$/, "") ||
      origin ||
      siteConfig.url;

    const preference = await createCheckoutPreference({
      orderId,
      baseUrl,
      payer: { name, email, cpfCnpj },
      items: items.map((item) => ({
        id: item.id,
        title: item.name,
        description: `ISStudio Store — ${item.name}`,
        quantity: item.quantity,
        unitPrice: item.price,
      })),
    });

    const redirectUrl = checkoutRedirectUrl(preference);
    if (!redirectUrl) {
      return NextResponse.json(
        {
          error:
            "Mercado Pago não retornou o link de checkout. Verifique as credenciais.",
        },
        { status: 502 },
      );
    }

    return NextResponse.json({
      flow: "redirect",
      provider: "mercadopago",
      orderId,
      preferenceId: preference.id,
      redirectUrl,
      amount: subtotal,
    });
  } catch (e) {
    console.error("[mercadopago] checkout", formatMercadoPagoError(e));
    return NextResponse.json(
      { error: formatMercadoPagoError(e) },
      { status: 500 },
    );
  }
}
