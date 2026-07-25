import type { Metadata } from "next";
import { categories } from "@/lib/catalog";
import { CategoryCard } from "@/components/category/category-card";
import { SectionHeader } from "@/components/ui/section-header";

export const metadata: Metadata = {
  title: "Categorias de soluções digitais",
  description:
    "Dez linhas de produto: sistemas, APIs, templates, plugins, licenças, SaaS, IA, white label, hospedagem e assinaturas.",
  alternates: { canonical: "/categorias" },
  openGraph: {
    title: "Categorias · ISStudio Store",
    description:
      "Escolha o tipo de solução e encontre o que acelera o seu negócio.",
    url: "/categorias",
  },
};

export default function CategoriesPage() {
  return (
    <div className="container-page py-12 sm:py-16">
      <SectionHeader
        eyebrow="Categorias"
        title="Escolha o tipo de solução"
        description="Cada categoria agrupa produtos com o mesmo modelo de entrega — do código-fonte à assinatura SaaS."
      />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((c) => (
          <CategoryCard key={c.slug} category={c} />
        ))}
      </div>
    </div>
  );
}
