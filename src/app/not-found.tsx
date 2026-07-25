import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="container-page py-28 text-center space-y-4">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-300">
        404
      </p>
      <h1 className="text-3xl font-semibold tracking-tight">
        Página não encontrada
      </h1>
      <p className="text-white/45 text-sm">
        Essa rota não existe no catálogo da ISStudio Store.
      </p>
      <Link href="/" className="inline-block pt-2">
        <Button>Voltar à home</Button>
      </Link>
    </div>
  );
}
