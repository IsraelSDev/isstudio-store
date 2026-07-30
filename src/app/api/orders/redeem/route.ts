import { NextResponse } from "next/server";
import { products } from "@/lib/catalog";
import { createDownloadToken } from "@/lib/download-token";
import { kitExists } from "@/lib/kits";
import {
  findPaidOrderByRedeemCode,
  logRedeemAttempt,
  registerRedeem,
} from "@/lib/orders";
import { clientIp, pruneRateLimitBuckets, rateLimit } from "@/lib/rate-limit";
import { isValidRedeemCodeShape } from "@/lib/redeem-code";
import { isSupabaseConfigured } from "@/lib/supabase";

export const runtime = "nodejs";

const GENERIC_ERROR =
  "Código inválido ou pagamento ainda não confirmado. Confira o e-mail da compra.";

export async function POST(req: Request) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { error: "Entrega automática não configurada. Fale com o suporte." },
      { status: 503 },
    );
  }

  pruneRateLimitBuckets();
  const ip = clientIp(req);
  const limit = rateLimit(`redeem:${ip}`, { limit: 10, windowSeconds: 600 });
  if (!limit.allowed) {
    return NextResponse.json(
      {
        error: `Muitas tentativas. Tente novamente em ${limit.retryAfterSeconds}s.`,
      },
      {
        status: 429,
        headers: { "Retry-After": String(limit.retryAfterSeconds) },
      },
    );
  }

  let code = "";
  try {
    const body = await req.json();
    code = String(body?.code || "");
  } catch {
    return NextResponse.json({ error: "Requisição inválida." }, { status: 400 });
  }

  const userAgent = req.headers.get("user-agent");

  if (!isValidRedeemCodeShape(code)) {
    await logRedeemAttempt({ success: false, ip, userAgent });
    return NextResponse.json({ error: GENERIC_ERROR }, { status: 404 });
  }

  try {
    const order = await findPaidOrderByRedeemCode(code);
    if (!order) {
      await logRedeemAttempt({ success: false, ip, userAgent });
      // Mesma mensagem para código inexistente e pedido não pago: não
      // entregamos ao atacante a informação de que um código existe.
      return NextResponse.json({ error: GENERIC_ERROR }, { status: 404 });
    }

    const items = await Promise.all(
      order.items.map(async (item) => {
        const product = products.find((p) => p.id === item.id);
        const hasKit = product ? await kitExists(product.id) : false;

        return {
          productId: item.id,
          slug: product?.slug ?? null,
          name: product?.name ?? item.name,
          tagline: product?.tagline ?? null,
          category: product?.category ?? null,
          stack: product?.stack ?? [],
          quantity: item.quantity,
          delivery: product?.delivery ?? null,
          downloadToken: hasKit
            ? createDownloadToken({
                orderId: order.id,
                orderRef: order.order_ref,
                productId: item.id,
              })
            : null,
        };
      }),
    );

    await Promise.all([
      registerRedeem(order),
      logRedeemAttempt({ orderId: order.id, success: true, ip, userAgent }),
    ]);

    return NextResponse.json({
      order: {
        ref: order.order_ref,
        customerName: order.customer_name,
        paidAt: order.paid_at,
        amount: Number(order.amount),
      },
      items,
    });
  } catch (e) {
    console.error("[redeem]", e);
    return NextResponse.json(
      { error: "Erro ao validar o código. Tente novamente." },
      { status: 500 },
    );
  }
}
