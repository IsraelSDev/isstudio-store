"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  CreditCard,
  Loader2,
  Lock,
  ShoppingBag,
} from "lucide-react";
import { useCart } from "@/context/cart-context";
import { formatPrice, pricingLabel } from "@/lib/catalog";
import { Button } from "@/components/ui/button";
import type { PaymentMethod } from "@/lib/types";
import { cn } from "@/lib/utils";

const gateways: {
  id: PaymentMethod;
  name: string;
  description: string;
  methods: string[];
  accent: string;
}[] = [
  {
    id: "asaas",
    name: "Asaas",
    description: "Pix instantâneo, boleto e cartão — ideal para o Brasil.",
    methods: ["Pix", "Boleto", "Cartão"],
    accent: "#0037ff",
  },
  {
    id: "mercadopago",
    name: "Mercado Pago",
    description: "Checkout transparente com saldo MP, Pix e cartões.",
    methods: ["Pix", "Cartão", "Saldo MP"],
    accent: "#009ee3",
  },
  {
    id: "paypal",
    name: "PayPal",
    description: "Pagamento internacional com proteção ao comprador.",
    methods: ["PayPal", "Cartão internacional"],
    accent: "#0070ba",
  },
];

export default function CheckoutPage() {
  const { items, subtotal, clear } = useCart();
  const [method, setMethod] = useState<PaymentMethod>("asaas");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [document, setDocument] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [orderId, setOrderId] = useState("");

  const selected = useMemo(
    () => gateways.find((g) => g.id === method)!,
    [method],
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (items.length === 0) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1600));
    setOrderId(
      `ISS-${Date.now().toString(36).toUpperCase()}-${Math.floor(Math.random() * 900 + 100)}`,
    );
    setDone(true);
    setLoading(false);
    clear();
  }

  if (done) {
    return (
      <div className="container-page py-20 sm:py-28">
        <div className="mx-auto max-w-lg text-center space-y-5 animate-rise">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-aqua-500/15 border border-aqua-500/30">
            <CheckCircle2 className="text-aqua-400" size={28} />
          </div>
          <h1 className="text-3xl font-semibold tracking-tight">
            Pedido confirmado
          </h1>
          <p className="text-white/50 leading-relaxed">
            Simulação concluída via <strong className="text-white/80">{selected.name}</strong>.
            Em produção, você receberia o link/Pix e o acesso por e-mail.
          </p>
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-4 text-sm">
            <p className="text-white/40 text-xs uppercase tracking-wider mb-1">
              Número do pedido
            </p>
            <p className="font-mono text-brand-200 text-lg">{orderId}</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <Link href="/catalogo">
              <Button>Continuar comprando</Button>
            </Link>
            <Link href="/">
              <Button variant="secondary">Voltar à home</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="container-page py-20 sm:py-28">
        <div className="mx-auto max-w-md text-center space-y-4">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-white/5 border border-white/10">
            <ShoppingBag className="text-white/30" />
          </div>
          <h1 className="text-2xl font-semibold">Carrinho vazio</h1>
          <p className="text-sm text-white/45">
            Adicione soluções ao carrinho para finalizar a compra.
          </p>
          <Link href="/catalogo">
            <Button>Explorar catálogo</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container-page py-12 sm:py-16">
      <Link
        href="/catalogo"
        className="inline-flex items-center gap-1.5 text-sm text-white/45 hover:text-white mb-8 transition"
      >
        <ArrowLeft size={14} />
        Continuar comprando
      </Link>

      <div className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight">Checkout</h1>
        <p className="mt-2 text-white/45 text-sm">
          Pagamento simulado — escolha Asaas, Mercado Pago ou PayPal.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="grid gap-8 lg:grid-cols-[1fr_380px]"
      >
        <div className="space-y-6">
          {/* Dados */}
          <section className="rounded-2xl border border-white/8 bg-white/[0.03] p-5 sm:p-6 space-y-4">
            <h2 className="text-sm font-semibold">Seus dados</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block space-y-1.5 sm:col-span-2">
                <span className="text-xs text-white/40">Nome completo</span>
                <input
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full h-11 rounded-xl border border-white/10 bg-ink-950/60 px-3.5 text-sm outline-none focus:border-brand-400/50 focus:ring-2 focus:ring-brand-500/20"
                  placeholder="Maria Silva"
                />
              </label>
              <label className="block space-y-1.5">
                <span className="text-xs text-white/40">E-mail</span>
                <input
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-11 rounded-xl border border-white/10 bg-ink-950/60 px-3.5 text-sm outline-none focus:border-brand-400/50 focus:ring-2 focus:ring-brand-500/20"
                  placeholder="maria@empresa.com"
                />
              </label>
              <label className="block space-y-1.5">
                <span className="text-xs text-white/40">CPF / CNPJ</span>
                <input
                  required
                  value={document}
                  onChange={(e) => setDocument(e.target.value)}
                  className="w-full h-11 rounded-xl border border-white/10 bg-ink-950/60 px-3.5 text-sm outline-none focus:border-brand-400/50 focus:ring-2 focus:ring-brand-500/20"
                  placeholder="000.000.000-00"
                />
              </label>
            </div>
          </section>

          {/* Gateways */}
          <section className="rounded-2xl border border-white/8 bg-white/[0.03] p-5 sm:p-6 space-y-4">
            <div className="flex items-center gap-2">
              <CreditCard size={16} className="text-brand-300" />
              <h2 className="text-sm font-semibold">Forma de pagamento</h2>
            </div>

            <div className="grid gap-3">
              {gateways.map((g) => (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => setMethod(g.id)}
                  className={cn(
                    "relative flex items-start gap-4 rounded-2xl border p-4 text-left transition",
                    method === g.id
                      ? "border-brand-400/50 bg-brand-500/10"
                      : "border-white/8 bg-ink-950/40 hover:border-white/15",
                  )}
                >
                  <span
                    className="mt-0.5 grid h-10 w-10 shrink-0 place-items-center rounded-xl text-xs font-bold text-white"
                    style={{ background: g.accent }}
                  >
                    {g.name.slice(0, 2).toUpperCase()}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center justify-between gap-2">
                      <span className="text-sm font-semibold">{g.name}</span>
                      <span
                        className={cn(
                          "h-4 w-4 rounded-full border-2",
                          method === g.id
                            ? "border-brand-400 bg-brand-500"
                            : "border-white/25",
                        )}
                      />
                    </span>
                    <span className="mt-1 block text-xs text-white/45 leading-relaxed">
                      {g.description}
                    </span>
                    <span className="mt-2 flex flex-wrap gap-1.5">
                      {g.methods.map((m) => (
                        <span
                          key={m}
                          className="rounded-md border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] font-medium text-white/55"
                        >
                          {m}
                        </span>
                      ))}
                    </span>
                  </span>
                </button>
              ))}
            </div>

            <p className="flex items-center gap-1.5 text-[11px] text-white/35">
              <Lock size={12} />
              Ambiente simulado — nenhuma cobrança real será feita.
            </p>
          </section>
        </div>

        {/* Summary */}
        <aside className="h-fit lg:sticky lg:top-24 rounded-2xl border border-white/10 bg-white/[0.04] p-5 sm:p-6 space-y-4">
          <h2 className="text-sm font-semibold">Resumo do pedido</h2>
          <ul className="space-y-3 max-h-64 overflow-y-auto">
            {items.map(({ product, quantity }) => (
              <li key={product.id} className="flex justify-between gap-3 text-sm">
                <span className="text-white/60 min-w-0">
                  <span className="block truncate text-white/80">
                    {product.name}
                  </span>
                  <span className="text-xs text-white/35">
                    {quantity}× · {pricingLabel(product)}
                  </span>
                </span>
                <span className="tabular-nums shrink-0 text-white/80">
                  {formatPrice(product.price * quantity)}
                </span>
              </li>
            ))}
          </ul>

          <div className="border-t border-white/8 pt-4 space-y-2">
            <div className="flex justify-between text-sm text-white/50">
              <span>Subtotal</span>
              <span className="tabular-nums">{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm text-white/50">
              <span>Gateway</span>
              <span>{selected.name}</span>
            </div>
            <div className="flex justify-between items-baseline pt-1">
              <span className="text-sm font-medium">Total</span>
              <span className="text-2xl font-semibold tabular-nums">
                {formatPrice(subtotal)}
              </span>
            </div>
          </div>

          <Button type="submit" size="lg" className="w-full" disabled={loading}>
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Processando via {selected.name}…
              </>
            ) : (
              <>Pagar com {selected.name}</>
            )}
          </Button>
        </aside>
      </form>
    </div>
  );
}
