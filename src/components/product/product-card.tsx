"use client";

import Link from "next/link";
import { ArrowRight, ShoppingCart, Star } from "lucide-react";
import type { Product } from "@/lib/types";
import { formatPrice, getCategory, pricingLabel } from "@/lib/catalog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/cart-context";
import { categoryIcons } from "@/lib/icons";

export function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart();
  const category = getCategory(product.category);
  const Icon = categoryIcons[product.category];
  const accent = category?.accent ?? "#8b72ff";

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-2xl border border-white/8 bg-white/[0.03] shadow-[var(--shadow-card)] transition duration-300 hover:-translate-y-1 hover:border-white/15 hover:bg-white/[0.05]">
      <div
        className="absolute inset-x-0 top-0 h-px opacity-80"
        style={{
          background: `linear-gradient(90deg, transparent, ${accent}, transparent)`,
        }}
      />

      <div className="relative p-5 pb-4">
        <div className="flex items-start justify-between gap-3">
          <div
            className="grid h-11 w-11 place-items-center rounded-xl border border-white/10"
            style={{
              background: `linear-gradient(145deg, ${accent}28, transparent 70%)`,
            }}
          >
            <Icon size={20} style={{ color: accent }} />
          </div>
          {product.badge && <Badge kind={product.badge} />}
        </div>

        <div className="mt-4 space-y-1.5">
          <p className="text-[11px] font-medium uppercase tracking-wider text-white/35">
            {category?.name}
          </p>
          <Link href={`/produto/${product.slug}`}>
            <h3 className="text-[15px] font-semibold tracking-tight text-white group-hover:text-brand-200 transition">
              {product.name}
            </h3>
          </Link>
          <p className="text-sm text-white/45 line-clamp-2 leading-relaxed">
            {product.tagline}
          </p>
        </div>

        <div className="mt-3 flex items-center gap-1.5 text-xs text-white/45">
          <Star size={12} className="fill-amber-glow text-amber-glow" />
          <span className="tabular-nums text-white/70">{product.rating}</span>
          <span>·</span>
          <span>{product.reviews} avaliações</span>
        </div>
      </div>

      <div className="mt-auto border-t border-white/5 p-5 pt-4">
        <div className="flex items-end justify-between gap-3 mb-3">
          <div>
            {product.compareAt && (
              <p className="text-xs text-white/30 line-through tabular-nums">
                {formatPrice(product.compareAt)}
              </p>
            )}
            <p className="text-xl font-semibold tracking-tight tabular-nums">
              {formatPrice(product.price)}
              <span className="ml-1 text-xs font-normal text-white/35">
                {pricingLabel(product)}
              </span>
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            size="sm"
            className="flex-1"
            onClick={() => addItem(product)}
          >
            <ShoppingCart size={14} />
            Adicionar
          </Button>
          <Link href={`/produto/${product.slug}`} className="shrink-0">
            <Button size="sm" variant="secondary" aria-label="Ver detalhes">
              <ArrowRight size={14} />
            </Button>
          </Link>
        </div>
      </div>
    </article>
  );
}
