import Link from "next/link";
import { Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function CheckoutPendingPage({ searchParams }: Props) {
  const params = await searchParams;
  const status = String(params.status || params.collection_status || "pending");
  const externalReference = String(params.external_reference || "");
  const paymentId = String(params.payment_id || params.collection_id || "");

  return (
    <div className="container-page py-20 sm:py-28">
      <div className="mx-auto max-w-lg text-center space-y-5 animate-rise">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-amber-glow/15 border border-amber-glow/30">
          <Clock className="text-amber-glow" size={28} />
        </div>
        <h1 className="text-3xl font-semibold tracking-tight">
          Pagamento em análise
        </h1>
        <p className="text-white/50 leading-relaxed">
          O Mercado Pago está processando. Pix e boleto podem levar alguns
          minutos (ou até o horário bancário). Você receberá a confirmação por
          e-mail.
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
            <span className="text-amber-glow">{status}</span>
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <Link href="/catalogo">
            <Button>Continuar explorando</Button>
          </Link>
          <Link href="/">
            <Button variant="secondary">Voltar à home</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
