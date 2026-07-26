import Link from "next/link";
import { CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ClearCartOnMount } from "@/components/checkout/clear-cart-on-mount";
import {
  captureOrder,
  formatPayPalError,
  getOrder,
  isOrderCompleted,
  isPayPalConfigured,
  type PayPalOrder,
} from "@/lib/paypal";

export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

/**
 * Retorno do PayPal — captura a ordem aprovada.
 * PayPal redireciona para cá com ?token={orderId}&PayerID={payerId}
 */
export default async function PayPalReturnPage({ searchParams }: Props) {
  const params = await searchParams;
  const paypalOrderId = String(params.token || params.order_id || "");

  let order: PayPalOrder | null = null;
  let error = "";

  if (!isPayPalConfigured()) {
    error = "PayPal não configurado no servidor.";
  } else if (!paypalOrderId) {
    error = "Retorno do PayPal sem identificador da ordem.";
  } else {
    try {
      order = await captureOrder(paypalOrderId);
    } catch (e) {
      // Recarregar a página tenta capturar de novo → busca o estado atual
      try {
        order = await getOrder(paypalOrderId);
      } catch {
        error = formatPayPalError(e);
      }
      if (order && !isOrderCompleted(order.status)) {
        error = formatPayPalError(e);
      }
    }
  }

  const completed = isOrderCompleted(order?.status);
  const capture = order?.purchase_units?.[0]?.payments?.captures?.[0];
  const internalOrderId =
    order?.purchase_units?.[0]?.custom_id ||
    order?.purchase_units?.[0]?.reference_id ||
    "";

  if (!completed) {
    return (
      <div className="container-page py-20 sm:py-28">
        <div className="mx-auto max-w-lg text-center space-y-5 animate-rise">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-rose-500/15 border border-rose-500/30">
            <XCircle className="text-rose-300" size={28} />
          </div>
          <h1 className="text-3xl font-semibold tracking-tight">
            Pagamento não concluído
          </h1>
          <p className="text-white/50 leading-relaxed">
            {error ||
              "O PayPal não confirmou a captura deste pagamento. Nenhum valor foi cobrado."}
          </p>
          {paypalOrderId && (
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-4 text-sm text-left">
              <p>
                <span className="text-white/40">Ordem PayPal: </span>
                <span className="font-mono text-white/70">{paypalOrderId}</span>
              </p>
              {order?.status && (
                <p className="mt-1">
                  <span className="text-white/40">Status: </span>
                  <span className="text-rose-300">{order.status}</span>
                </p>
              )}
            </div>
          )}
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <Link href="/checkout">
              <Button>Tentar novamente</Button>
            </Link>
            <Link href="/catalogo">
              <Button variant="secondary">Voltar ao catálogo</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-page py-20 sm:py-28">
      <ClearCartOnMount />
      <div className="mx-auto max-w-lg text-center space-y-5 animate-rise">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-aqua-500/15 border border-aqua-500/30">
          <CheckCircle2 className="text-aqua-400" size={28} />
        </div>
        <h1 className="text-3xl font-semibold tracking-tight">
          Pagamento aprovado
        </h1>
        <p className="text-white/50 leading-relaxed">
          O PayPal confirmou a captura. O acesso à solução será enviado para o
          e-mail informado no checkout.
        </p>
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-4 text-sm space-y-2 text-left">
          {internalOrderId && (
            <p>
              <span className="text-white/40">Pedido: </span>
              <span className="font-mono text-brand-200">{internalOrderId}</span>
            </p>
          )}
          {capture?.id && (
            <p>
              <span className="text-white/40">Captura PayPal: </span>
              <span className="font-mono text-white/70">{capture.id}</span>
            </p>
          )}
          <p>
            <span className="text-white/40">Status: </span>
            <span className="text-aqua-400">{order?.status}</span>
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <Link href="/catalogo">
            <Button>Continuar comprando</Button>
          </Link>
          <Link href="/">
            <Button variant="secondary">Voltar à home</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
