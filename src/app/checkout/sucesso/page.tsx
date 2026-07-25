import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ClearCartOnMount } from "@/components/checkout/clear-cart-on-mount";

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function CheckoutSuccessPage({ searchParams }: Props) {
  const params = await searchParams;
  const paymentId = String(params.payment_id || params.collection_id || "");
  const status = String(params.status || params.collection_status || "approved");
  const externalReference = String(params.external_reference || "");

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
          Recebemos a confirmação do Mercado Pago. O acesso à solução será
          enviado para o e-mail informado no checkout.
        </p>
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-4 text-sm space-y-2 text-left">
          {externalReference && (
            <p>
              <span className="text-white/40">Pedido: </span>
              <span className="font-mono text-brand-200">{externalReference}</span>
            </p>
          )}
          {paymentId && (
            <p>
              <span className="text-white/40">Pagamento MP: </span>
              <span className="font-mono text-white/70">{paymentId}</span>
            </p>
          )}
          <p>
            <span className="text-white/40">Status: </span>
            <span className="text-aqua-400">{status}</span>
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
