import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  categories,
  getCategory,
  getProductsByCategory,
} from "@/lib/catalog";
import type { CategorySlug } from "@/lib/types";
import { categoryIcons } from "@/lib/icons";
import { ProductCard } from "@/components/product/product-card";
import { SectionHeader } from "@/components/ui/section-header";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return categories.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const category = getCategory(slug);
  if (!category) return { title: "Categoria" };

  const url = `/categorias/${category.slug}`;
  const title = `${category.name} — soluções digitais`;
  const description = `${category.description} Explore ${category.short.toLowerCase()} na ISStudio Store.`;

  return {
    title: category.name,
    description,
    keywords: [category.name, category.short, "ISStudio Store", "marketplace"],
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;
  const category = getCategory(slug);
  if (!category) notFound();

  const items = getProductsByCategory(slug as CategorySlug);
  const Icon = categoryIcons[category.slug];

  return (
    <div className="container-page py-12 sm:py-16">
      <div className="mb-10 flex flex-col sm:flex-row sm:items-end gap-6">
        <div
          className="grid h-16 w-16 place-items-center rounded-2xl border border-white/10 shrink-0"
          style={{
            background: `linear-gradient(145deg, ${category.accent}35, transparent 70%)`,
          }}
        >
          <Icon size={28} style={{ color: category.accent }} />
        </div>
        <div className="space-y-2 max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/40">
            Categoria
          </p>
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">
            {category.name}
          </h1>
          <p className="text-white/50 leading-relaxed">{category.description}</p>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-10 text-center">
          <p className="text-white/50">Em breve novas soluções nesta categoria.</p>
          <Link
            href="/catalogo"
            className="mt-4 inline-block text-sm text-brand-300 hover:text-brand-200"
          >
            Voltar ao catálogo
          </Link>
        </div>
      ) : (
        <>
          <SectionHeader
            title={`${items.length} ${items.length === 1 ? "solução" : "soluções"}`}
          />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
