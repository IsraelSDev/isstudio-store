import { products } from "@/lib/catalog";
import { verifyDownloadToken } from "@/lib/download-token";
import { buildKitZip, kitFileName } from "@/lib/kits";
import { getOrderById } from "@/lib/orders";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

type Params = { params: Promise<{ productId: string }> };

export async function GET(req: Request, { params }: Params) {
  const { productId } = await params;
  const token = new URL(req.url).searchParams.get("token") || "";

  const payload = verifyDownloadToken(token);
  if (!payload) {
    return NextResponse.json(
      { error: "Link de download expirado. Resgate o código novamente." },
      { status: 401 },
    );
  }
  if (payload.productId !== productId) {
    return NextResponse.json({ error: "Link inválido." }, { status: 403 });
  }

  const product = products.find((p) => p.id === productId);
  if (!product) {
    return NextResponse.json(
      { error: "Produto não encontrado." },
      { status: 404 },
    );
  }

  try {
    // Revalida no banco: um pedido estornado ou alterado deixa de baixar
    // mesmo que o token ainda esteja dentro da validade.
    const order = await getOrderById(payload.orderId);
    if (!order || order.status !== "paid") {
      return NextResponse.json(
        { error: "Pedido não está liberado para download." },
        { status: 403 },
      );
    }
    if (!order.items.some((item) => item.id === productId)) {
      return NextResponse.json(
        { error: "Este produto não faz parte do pedido." },
        { status: 403 },
      );
    }

    const bytes = await buildKitZip({
      product,
      orderRef: order.order_ref,
      customerName: order.customer_name,
    });

    return new Response(Buffer.from(bytes), {
      headers: {
        "Content-Type": "application/zip",
        "Content-Length": String(bytes.byteLength),
        "Content-Disposition": `attachment; filename="${kitFileName(product, order.order_ref)}"`,
        "Cache-Control": "no-store, private",
      },
    });
  } catch (e) {
    console.error("[download]", productId, e);
    return NextResponse.json(
      { error: "Falha ao gerar o pacote. Tente novamente." },
      { status: 500 },
    );
  }
}
