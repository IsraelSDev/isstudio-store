import Link from "next/link";
import { XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function CheckoutFailurePage({ searchParams }: Props) {
  const params = await searchParams;
  const status = String(params.status || params.collection_status || "rejected");
  const externalReference = String(params.external_reference || "");

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
          O Mercado Pago não aprovou esta tentativa. Você pode tentar de novo
          com outro método (Pix, cartão ou saldo).
        </p>
        {(externalReference || status) && (
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-4 text-sm space-y-2 text-left">
            {externalReference && (
              <p>
                <span className="text-white/40">Pedido: </span>
                <span className="font-mono text-white/70">{externalReference}</span>
              </p>
            )}
            <p>
              <span className="text-white/40">Status: </span>
              <span className="text-rose-300">{status}</span>
            </p>
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
