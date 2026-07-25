import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  CreditCard,
  ShieldCheck,
  Sparkles,
  Zap,
} from "lucide-react";
import { categories, getFeaturedProducts, products } from "@/lib/catalog";
import { CategoryCard } from "@/components/category/category-card";
import { ProductCard } from "@/components/product/product-card";
import { SectionHeader } from "@/components/ui/section-header";
import { Button } from "@/components/ui/button";

const trust = [
  { icon: ShieldCheck, label: "Código e licenças comerciais" },
  { icon: Zap, label: "Entrega imediata ou em até 48h" },
  { icon: CreditCard, label: "Asaas · Mercado Pago · PayPal" },
  { icon: Sparkles, label: "Suporte ISStudio incluso" },
];

const logos = [
  "Nimbus",
  "Orbit Labs",
  "Vertex",
  "Atlas Digital",
  "Pulse Co.",
  "Nova Agency",
  "Hexa",
  "Lumen Soft",
];

export default function HomePage() {
  const featured = getFeaturedProducts();

  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="container-page pt-16 pb-20 sm:pt-24 sm:pb-28">
          <div className="mx-auto max-w-4xl text-center animate-rise">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3.5 py-1.5 text-xs text-white/70 backdrop-blur">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-aqua-400 opacity-60" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-aqua-400" />
              </span>
              Marketplace de soluções digitais · {products.length}+ produtos
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight text-balance leading-[1.08]">
              Tudo que sua empresa precisa{" "}
              <span className="text-gradient">para vender e escalar</span>
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-base sm:text-lg text-white/50 leading-relaxed text-balance">
              Sistemas, APIs, templates, plugins, SaaS, IA, white label,
              hospedagem e assinaturas — em um único e-commerce de soluções
              premium.
            </p>

            <div className="mt-9 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link href="/catalogo">
                <Button size="lg">
                  Explorar catálogo
                  <ArrowRight size={16} />
                </Button>
              </Link>
              <Link href="/categorias">
                <Button size="lg" variant="secondary">
                  Ver categorias
                </Button>
              </Link>
            </div>

            <div className="mt-12 grid grid-cols-2 lg:grid-cols-4 gap-3">
              {trust.map(({ icon: Icon, label }) => (
                <div
                  key={label}
                  className="flex items-center gap-2.5 rounded-xl border border-white/8 bg-white/[0.03] px-3.5 py-3 text-left"
                >
                  <Icon size={16} className="shrink-0 text-brand-300" />
                  <span className="text-xs text-white/55 leading-snug">
                    {label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* MARQUEE */}
      <section className="border-y border-white/5 bg-ink-900/30 py-5 overflow-hidden">
        <div className="flex animate-marquee whitespace-nowrap">
          {[...logos, ...logos].map((name, i) => (
            <span
              key={`${name}-${i}`}
              className="mx-8 text-sm font-semibold tracking-wide text-white/20"
            >
              {name}
            </span>
          ))}
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="container-page py-20 sm:py-24">
        <SectionHeader
          eyebrow="Categorias"
          title="Dez linhas de soluções digitais"
          description="Do sistema completo à assinatura recorrente — escolha a categoria e encontre o que acelera seu negócio."
          href="/categorias"
          linkLabel="Todas as categorias"
        />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((c, i) => (
            <CategoryCard key={c.slug} category={c} featured={i === 0} />
          ))}
        </div>
      </section>

      {/* FEATURED */}
      <section className="container-page pb-20 sm:pb-24">
        <SectionHeader
          eyebrow="Destaques"
          title="Soluções mais pedidas"
          description="Seleção curada das soluções com melhor avaliação e maior adoção nas últimas semanas."
          href="/catalogo"
        />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="border-y border-white/5 bg-ink-900/25">
        <div className="container-page py-20 sm:py-24">
          <SectionHeader
            eyebrow="Como funciona"
            title="Do catálogo ao deploy em minutos"
            description="Compre, receba acesso e comece a operar. Pagamentos via Asaas, Mercado Pago ou PayPal."
          />
          <div className="grid gap-4 md:grid-cols-3">
            {[
              {
                step: "01",
                title: "Escolha a solução",
                body: "Navegue por categorias ou busque no catálogo. Cada produto traz stack, entrega e o que está incluso.",
              },
              {
                step: "02",
                title: "Pague do seu jeito",
                body: "Checkout com Asaas (Pix/boleto/cartão), Mercado Pago ou PayPal — tudo em reais quando aplicável.",
              },
              {
                step: "03",
                title: "Receba e escale",
                body: "Download, chave de API ou acesso SaaS. Suporte ISStudio incluso nos planos elegíveis.",
              },
            ].map((item) => (
              <div
                key={item.step}
                className="rounded-2xl border border-white/8 bg-white/[0.03] p-6"
              >
                <span className="text-xs font-mono font-semibold text-brand-300">
                  {item.step}
                </span>
                <h3 className="mt-3 text-lg font-semibold">{item.title}</h3>
                <p className="mt-2 text-sm text-white/45 leading-relaxed">
                  {item.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container-page py-20 sm:py-28">
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-brand-600/30 via-ink-850 to-aqua-500/10 p-8 sm:p-12 lg:p-14 shadow-[var(--shadow-glow)]">
          <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-brand-500/40 blur-3xl" />
          <div className="relative max-w-2xl space-y-5">
            <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-balance">
              Pronto para montar o stack da sua operação?
            </h2>
            <p className="text-white/55 leading-relaxed">
              Comece pelo Studio+ e tenha acesso a templates, créditos de API e
              descontos em todo o catálogo — ou escolha uma solução pontual.
            </p>
            <ul className="space-y-2">
              {[
                "Cancelamento fácil",
                "Nota fiscal disponível",
                "Suporte em português",
              ].map((t) => (
                <li
                  key={t}
                  className="flex items-center gap-2 text-sm text-white/70"
                >
                  <CheckCircle2 size={16} className="text-aqua-400" />
                  {t}
                </li>
              ))}
            </ul>
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Link href="/produto/studio-plus">
                <Button size="lg">
                  Conhecer Studio+
                  <ArrowRight size={16} />
                </Button>
              </Link>
              <Link href="/catalogo">
                <Button size="lg" variant="secondary">
                  Ver catálogo
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
