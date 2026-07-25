import type { Metadata } from "next";
import Link from "next/link";
import { Check, ArrowRight } from "lucide-react";
import { getProductsByCategory, formatPrice } from "@/lib/catalog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SectionHeader } from "@/components/ui/section-header";

export const metadata: Metadata = {
  title: "Planos e assinaturas Studio+",
  description:
    "Assinaturas ISStudio Store com templates ilimitados, créditos de API, descontos no catálogo e suporte prioritário. Planos mensal e anual.",
  alternates: { canonical: "/assinaturas" },
  openGraph: {
    title: "Planos Studio+ · ISStudio Store",
    description:
      "Acesso contínuo a soluções, créditos de API e descontos no catálogo.",
    url: "/assinaturas",
  },
};

export default function AssinaturasPage() {
  const plans = getProductsByCategory("assinaturas");

  return (
    <div className="container-page py-12 sm:py-16">
      <SectionHeader
        eyebrow="Assinaturas"
        title="Planos para quem vive de produto digital"
        description="Acesso contínuo a templates, créditos de API, descontos no catálogo e suporte prioritário."
      />

      <div className="grid gap-5 lg:grid-cols-2 max-w-4xl mx-auto">
        {plans.map((plan, i) => (
          <div
            key={plan.id}
            className={`relative overflow-hidden rounded-3xl border p-7 sm:p-8 ${
              i === 0
                ? "border-brand-400/40 bg-gradient-to-br from-brand-600/20 via-ink-850 to-transparent shadow-[var(--shadow-glow)]"
                : "border-white/10 bg-white/[0.03]"
            }`}
          >
            {plan.badge && (
              <div className="absolute right-5 top-5">
                <Badge kind={plan.badge} />
              </div>
            )}
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/40">
              {plan.billingPeriod === "year" ? "Anual" : "Mensal"}
            </p>
            <h2 className="mt-2 text-2xl font-semibold">{plan.name}</h2>
            <p className="mt-2 text-sm text-white/45 leading-relaxed">
              {plan.tagline}
            </p>
            <p className="mt-6 text-4xl font-semibold tracking-tight tabular-nums">
              {formatPrice(plan.price)}
              <span className="ml-1.5 text-sm font-normal text-white/40">
                /{plan.billingPeriod === "year" ? "ano" : "mês"}
              </span>
            </p>

            <ul className="mt-6 space-y-2.5">
              {plan.features.map((f) => (
                <li
                  key={f}
                  className="flex items-center gap-2 text-sm text-white/65"
                >
                  <Check size={14} className="text-aqua-400 shrink-0" />
                  {f}
                </li>
              ))}
            </ul>

            <Link href={`/produto/${plan.slug}`} className="block mt-8">
              <Button
                size="lg"
                className="w-full"
                variant={i === 0 ? "primary" : "secondary"}
              >
                Escolher {plan.name}
                <ArrowRight size={16} />
              </Button>
            </Link>
          </div>
        ))}
      </div>

      <p className="mt-10 text-center text-sm text-white/40">
        Prefere uma solução pontual?{" "}
        <Link href="/catalogo" className="text-brand-300 hover:text-brand-200">
          Veja o catálogo completo
        </Link>
      </p>
    </div>
  );
}
