import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Check,
  Package,
  Star,
  Truck,
} from "lucide-react";
import {
  formatPrice,
  getCategory,
  getProduct,
  getProductsByCategory,
  pricingLabel,
  products,
} from "@/lib/catalog";
import { Badge } from "@/components/ui/badge";
import { ProductCard } from "@/components/product/product-card";
import { categoryIcons } from "@/lib/icons";
import { AddToCartButton } from "@/components/product/add-to-cart-button";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) return { title: "Produto" };
  return {
    title: product.name,
    description: product.tagline,
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) notFound();

  const category = getCategory(product.category)!;
  const Icon = categoryIcons[product.category];
  const related = getProductsByCategory(product.category)
    .filter((p) => p.id !== product.id)
    .slice(0, 3);

  return (
    <div className="container-page py-12 sm:py-16">
      <nav className="mb-8 flex flex-wrap items-center gap-2 text-xs text-white/40">
        <Link href="/" className="hover:text-white/70">
          Home
        </Link>
        <span>/</span>
        <Link
          href={`/categorias/${category.slug}`}
          className="hover:text-white/70"
        >
          {category.name}
        </Link>
        <span>/</span>
        <span className="text-white/70">{product.name}</span>
      </nav>

      <div className="grid gap-10 lg:grid-cols-2 lg:gap-14">
        {/* Visual */}
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.06] to-transparent p-10 sm:p-14 min-h-[320px] flex flex-col justify-between">
          <div
            className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full blur-3xl opacity-50"
            style={{ background: category.accent }}
          />
          <div className="relative flex items-start justify-between">
            <div
              className="grid h-16 w-16 place-items-center rounded-2xl border border-white/15"
              style={{
                background: `linear-gradient(145deg, ${category.accent}40, transparent 70%)`,
              }}
            >
              <Icon size={30} style={{ color: category.accent }} />
            </div>
            {product.badge && <Badge kind={product.badge} />}
          </div>

          <div className="relative mt-16 space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/40">
              {category.name}
            </p>
            <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">
              {product.name}
            </h1>
            <p className="text-white/50 text-lg leading-relaxed">
              {product.tagline}
            </p>
          </div>
        </div>

        {/* Buy box */}
        <div className="space-y-6">
          <div className="flex items-center gap-2 text-sm text-white/50">
            <Star size={14} className="fill-amber-glow text-amber-glow" />
            <span className="tabular-nums text-white/80 font-medium">
              {product.rating}
            </span>
            <span>·</span>
            <span>{product.reviews} avaliações</span>
          </div>

          <p className="text-white/55 leading-relaxed">{product.description}</p>

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 space-y-4">
            <div>
              {product.compareAt && (
                <p className="text-sm text-white/30 line-through tabular-nums">
                  {formatPrice(product.compareAt)}
                </p>
              )}
              <p className="text-3xl font-semibold tracking-tight tabular-nums">
                {formatPrice(product.price)}
                <span className="ml-2 text-sm font-normal text-white/40">
                  {pricingLabel(product)}
                </span>
              </p>
            </div>

            <AddToCartButton product={product} />

            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="flex items-start gap-2 text-xs text-white/45">
                <Truck size={14} className="mt-0.5 shrink-0 text-aqua-400" />
                <span>{product.delivery}</span>
              </div>
              <div className="flex items-start gap-2 text-xs text-white/45">
                <Package size={14} className="mt-0.5 shrink-0 text-brand-300" />
                <span>Licença comercial inclusa</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold mb-3">O que está incluso</h3>
            <ul className="space-y-2">
              {product.includes.map((item) => (
                <li
                  key={item}
                  className="flex items-center gap-2 text-sm text-white/60"
                >
                  <Check size={14} className="text-aqua-400 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Details */}
      <div className="mt-16 grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-2xl border border-white/8 bg-white/[0.03] p-6 sm:p-8">
          <h2 className="text-lg font-semibold mb-3">Sobre a solução</h2>
          <p className="text-white/50 leading-relaxed">{product.longDescription}</p>

          <h3 className="text-sm font-semibold mt-8 mb-3">Recursos principais</h3>
          <ul className="grid sm:grid-cols-2 gap-2">
            {product.features.map((f) => (
              <li
                key={f}
                className="flex items-center gap-2 rounded-xl border border-white/6 bg-ink-950/40 px-3.5 py-2.5 text-sm text-white/65"
              >
                <Check size={14} className="text-brand-300 shrink-0" />
                {f}
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-6 sm:p-8 space-y-5">
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-white/35 mb-2">
              Stack
            </h3>
            <div className="flex flex-wrap gap-2">
              {product.stack.map((s) => (
                <span
                  key={s}
                  className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-white/65"
                >
                  {s}
                </span>
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-white/35 mb-2">
              Modelo
            </h3>
            <p className="text-sm text-white/65 capitalize">
              {product.pricingModel === "subscription"
                ? `Assinatura ${product.billingPeriod === "year" ? "anual" : "mensal"}`
                : product.pricingModel === "one-time"
                  ? "Pagamento único"
                  : "Sob consulta"}
            </p>
          </div>
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-white/35 mb-2">
              Entrega
            </h3>
            <p className="text-sm text-white/65">{product.delivery}</p>
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <div className="mt-20">
          <h2 className="text-xl font-semibold mb-6">
            Mais em {category.name}
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
