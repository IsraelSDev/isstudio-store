import type { Metadata } from "next";
import { RedeemForm } from "@/components/redeem/redeem-form";

export const metadata: Metadata = {
  title: "Resgatar produto",
  description:
    "Use o código recebido por e-mail após a compra para baixar o código-fonte dos produtos ISStudio adquiridos.",
  alternates: { canonical: "/resgatar" },
  robots: { index: false, follow: false },
};

export default function RedeemPage() {
  return (
    <div className="container-page py-12 sm:py-16">
      <div className="mx-auto max-w-xl">
        <div className="mb-8 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-300">
            Área do cliente
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
            Resgatar produto
          </h1>
          <p className="mt-3 leading-relaxed text-white/45">
            Informe o código que você recebeu por e-mail para baixar o
            código-fonte de tudo que comprou.
          </p>
        </div>

        <RedeemForm />
      </div>
    </div>
  );
}
