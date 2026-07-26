import { NextResponse } from "next/server";
import {
  approveLink,
  createOrder,
  formatPayPalError,
  getPayPalCurrency,
  isPayPalConfigured,
  isPayPalSandbox,
} from "@/lib/paypal";
import { siteConfig } from "@/lib/seo";

export const runtime = "nodejs";

interface CheckoutBody {
  name: string;
  email: string;
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
    if (!isPayPalConfigured()) {
      return NextResponse.json(
        {
          error:
            "PayPal não configurado. Defina PAYPAL_CLIENT_ID e PAYPAL_CLIENT_SECRET no .env.local.",
        },
        { status: 503 },
      );
    }

    const body = (await req.json()) as CheckoutBody;
    const email = String(body.email || "").trim().toLowerCase();
    const name = String(body.name || "").trim();
    const items = Array.isArray(body.items) ? body.items : [];
    const subtotal = Number(body.subtotal) || 0;

    if (!email || !name) {
      return NextResponse.json(
        { error: "Nome e e-mail são obrigatórios." },
        { status: 400 },
      );
    }
    if (items.length === 0 || subtotal <= 0) {
      return NextResponse.json(
        { error: "Carrinho vazio ou valor inválido." },
        { status: 400 },
      );
    }

    const orderId = `ISS-PP-${Date.now().toString(36).toUpperCase()}-${Math.floor(
      Math.random() * 900 + 100,
    )}`;

    const origin = req.headers.get("origin") || "";
    const baseUrl =
      (process.env.NEXT_PUBLIC_APP_URL || "").replace(/\/+$/, "") ||
      origin ||
      siteConfig.url;

    const order = await createOrder({
      orderId,
      subtotal,
      baseUrl,
      items: items.map((item) => ({
        id: item.id,
        name: item.name,
        quantity: item.quantity,
        unitPrice: item.price,
      })),
    });

    const redirectUrl = approveLink(order);
    if (!redirectUrl) {
      return NextResponse.json(
        { error: "PayPal não retornou o link de aprovação." },
        { status: 502 },
      );
    }

    return NextResponse.json({
      flow: "redirect",
      provider: "paypal",
      orderId,
      paypalOrderId: order.id,
      currency: getPayPalCurrency(),
      sandbox: isPayPalSandbox(),
      redirectUrl,
      amount: subtotal,
    });
  } catch (e) {
    console.error("[paypal] checkout", formatPayPalError(e));
    return NextResponse.json({ error: formatPayPalError(e) }, { status: 500 });
  }
}
