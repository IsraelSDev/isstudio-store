import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { Category } from "@/lib/types";
import { getProductsByCategory } from "@/lib/catalog";
import { categoryIcons } from "@/lib/icons";

export function CategoryCard({
  category,
  featured = false,
}: {
  category: Category;
  featured?: boolean;
}) {
  const Icon = categoryIcons[category.slug];
  const count = getProductsByCategory(category.slug).length;

  return (
    <Link
      href={`/categorias/${category.slug}`}
      className={`group relative overflow-hidden rounded-2xl border border-white/8 bg-white/[0.03] p-5 transition duration-300 hover:-translate-y-0.5 hover:border-white/15 hover:bg-white/[0.05] ${
        featured ? "sm:col-span-2 sm:p-7" : ""
      }`}
    >
      <div
        className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full opacity-40 blur-2xl transition group-hover:opacity-70"
        style={{ background: category.accent }}
      />

      <div className="relative flex items-start justify-between gap-3">
        <div
          className="grid h-11 w-11 place-items-center rounded-xl border border-white/10"
          style={{
            background: `linear-gradient(145deg, ${category.accent}30, transparent 70%)`,
          }}
        >
          <Icon size={20} style={{ color: category.accent }} />
        </div>
        <ArrowUpRight
          size={16}
          className="text-white/25 transition group-hover:text-white/70 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
        />
      </div>

      <div className="relative mt-4 space-y-1.5">
        <h3 className="text-base font-semibold tracking-tight">{category.name}</h3>
        <p
          className={`text-sm text-white/45 leading-relaxed ${
            featured ? "max-w-md" : "line-clamp-2"
          }`}
        >
          {featured ? category.description : category.short}
        </p>
      </div>

      <p className="relative mt-4 text-xs font-medium text-white/35">
        {count} {count === 1 ? "solução" : "soluções"}
      </p>
    </Link>
  );
}
