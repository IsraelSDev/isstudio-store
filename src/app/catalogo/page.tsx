import type { Metadata } from "next";
import { products, categories } from "@/lib/catalog";
import { ProductCard } from "@/components/product/product-card";
import { SectionHeader } from "@/components/ui/section-header";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Catálogo completo de soluções digitais",
  description:
    "Explore sistemas, APIs, templates, plugins, SaaS, IA, white label, hospedagem e assinaturas na ISStudio Store. Preços em reais e entrega imediata.",
  alternates: { canonical: "/catalogo" },
  openGraph: {
    title: "Catálogo · ISStudio Store",
    description:
      "Todas as soluções digitais da ISStudio — do CRM ao agente de vendas com IA.",
    url: "/catalogo",
  },
};

export default function CatalogPage() {
  return (
    <div className="container-page py-12 sm:py-16">
      <SectionHeader
        eyebrow="Catálogo"
        title="Todas as soluções"
        description={`${products.length} produtos em ${categories.length} categorias — sistemas, APIs, templates, IA e mais.`}
      />

      <div className="mb-8 flex flex-wrap gap-2">
        <Link
          href="/catalogo"
          className="rounded-full border border-brand-400/40 bg-brand-500/15 px-3.5 py-1.5 text-xs font-medium text-brand-200"
        >
          Todos
        </Link>
        {categories.map((c) => (
          <Link
            key={c.slug}
            href={`/categorias/${c.slug}`}
            className="rounded-full border border-white/10 bg-white/5 px-3.5 py-1.5 text-xs font-medium text-white/55 transition hover:text-white hover:border-white/20"
          >
            {c.name}
          </Link>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </div>
  );
}
