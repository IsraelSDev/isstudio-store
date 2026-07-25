"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  Copy,
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

type AsaasBilling = "PIX" | "CREDIT_CARD" | "BOLETO";

type PixPayload = {
  qr_code: string | null;
  qr_base64: string | null;
  expires_at: string | null;
  invoiceUrl: string | null;
};

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
    description: "Pix instantâneo, boleto e cartão — mesma conta do Capivara.",
    methods: ["Pix", "Boleto", "Cartão"],
    accent: "#0037ff",
  },
  {
    id: "mercadopago",
    name: "Mercado Pago",
    description: "Checkout Pro — Pix, cartão e saldo na conta aprovada.",
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

const asaasBillings: {
  id: AsaasBilling;
  label: string;
  hint: string;
}[] = [
  { id: "PIX", label: "Pix", hint: "QR Code na hora" },
  { id: "CREDIT_CARD", label: "Cartão", hint: "Checkout seguro Asaas" },
  { id: "BOLETO", label: "Boleto", hint: "Vencimento em 3 dias" },
];

export default function CheckoutPage() {
  const { items, subtotal, clear } = useCart();
  const [method, setMethod] = useState<PaymentMethod>("asaas");
  const [asaasBilling, setAsaasBilling] = useState<AsaasBilling>("PIX");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [document, setDocument] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [orderId, setOrderId] = useState("");
  const [pix, setPix] = useState<PixPayload | null>(null);
  const [paymentId, setPaymentId] = useState("");
  const [copied, setCopied] = useState(false);

  const selected = useMemo(
    () => gateways.find((g) => g.id === method)!,
    [method],
  );

  useEffect(() => {
    if (!paymentId || done) return;

    const timer = setInterval(async () => {
      try {
        const res = await fetch(`/api/payments/asaas/${paymentId}/status`);
        const data = await res.json();
        if (data?.confirmed) {
          setDone(true);
          clear();
        }
      } catch {
        /* ignore polling errors */
      }
    }, 4000);

    return () => clearInterval(timer);
  }, [paymentId, done, clear]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (items.length === 0) return;
    setLoading(true);
    setError("");

    try {
      if (method === "asaas") {
        const res = await fetch("/api/payments/asaas", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name,
            email,
            cpfCnpj: document,
            billingType: asaasBilling,
            subtotal,
            items: items.map(({ product, quantity }) => ({
              id: product.id,
              name: product.name,
              price: product.price,
              quantity,
              pricingModel: product.pricingModel,
              billingPeriod: product.billingPeriod,
            })),
          }),
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data?.error || "Falha ao criar cobrança Asaas.");
        }

        setOrderId(data.orderId || "");

        if (data.flow === "pix") {
          setPix(data.pix);
          setPaymentId(data.paymentId);
          setLoading(false);
          return;
        }

        if (data.flow === "redirect" && data.redirectUrl) {
          clear();
          window.location.href = data.redirectUrl;
          return;
        }

        throw new Error("Resposta inesperada do Asaas.");
      }

      if (method === "mercadopago") {
        const res = await fetch("/api/payments/mercadopago", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name,
            email,
            cpfCnpj: document,
            subtotal,
            items: items.map(({ product, quantity }) => ({
              id: product.id,
              name: product.name,
              price: product.price,
              quantity,
            })),
          }),
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(
            data?.error || "Falha ao criar checkout Mercado Pago.",
          );
        }

        setOrderId(data.orderId || "");

        if (data.flow === "redirect" && data.redirectUrl) {
          // Carrinho limpo na página de sucesso; mantém itens se o usuário voltar
          window.location.href = data.redirectUrl;
          return;
        }

        throw new Error("Resposta inesperada do Mercado Pago.");
      }

      // PayPal — ainda simulado
      await new Promise((r) => setTimeout(r, 1200));
      setOrderId(
        `ISS-${Date.now().toString(36).toUpperCase()}-${Math.floor(Math.random() * 900 + 100)}`,
      );
      setDone(true);
      clear();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }

  async function copyPix() {
    if (!pix?.qr_code) return;
    await navigator.clipboard.writeText(pix.qr_code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (done) {
    return (
      <div className="container-page py-20 sm:py-28">
        <div className="mx-auto max-w-lg text-center space-y-5 animate-rise">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-aqua-500/15 border border-aqua-500/30">
            <CheckCircle2 className="text-aqua-400" size={28} />
          </div>
          <h1 className="text-3xl font-semibold tracking-tight">
            Pagamento confirmado
          </h1>
          <p className="text-white/50 leading-relaxed">
            Pedido recebido via{" "}
            <strong className="text-white/80">{selected.name}</strong>.
            Você receberá o acesso por e-mail.
          </p>
          {orderId && (
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-4 text-sm">
              <p className="text-white/40 text-xs uppercase tracking-wider mb-1">
                Número do pedido
              </p>
              <p className="font-mono text-brand-200 text-lg">{orderId}</p>
            </div>
          )}
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

  if (pix) {
    return (
      <div className="container-page py-12 sm:py-16">
        <div className="mx-auto max-w-lg space-y-6 animate-rise">
          <div className="text-center space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-300">
              Asaas · Pix
            </p>
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">
              Escaneie o QR Code
            </h1>
            <p className="text-sm text-white/45">
              Total{" "}
              <strong className="text-white/80 tabular-nums">
                {formatPrice(subtotal || 0)}
              </strong>
              {orderId ? ` · ${orderId}` : ""}
            </p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 flex flex-col items-center gap-4">
            {pix.qr_base64 ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={`data:image/png;base64,${pix.qr_base64}`}
                alt="QR Code Pix"
                className="h-52 w-52 rounded-xl bg-white p-2"
              />
            ) : (
              <div className="h-52 w-52 grid place-items-center rounded-xl bg-white/5 text-sm text-white/40">
                QR indisponível — use o copia e cola
              </div>
            )}

            {pix.qr_code && (
              <div className="w-full space-y-2">
                <p className="text-xs text-white/40 text-center">
                  Pix copia e cola
                </p>
                <div className="rounded-xl border border-white/10 bg-ink-950/60 p-3 break-all text-[11px] font-mono text-white/55 max-h-24 overflow-y-auto">
                  {pix.qr_code}
                </div>
                <Button
                  type="button"
                  variant="secondary"
                  className="w-full"
                  onClick={copyPix}
                >
                  <Copy size={14} />
                  {copied ? "Copiado!" : "Copiar código Pix"}
                </Button>
              </div>
            )}

            <p className="flex items-center gap-2 text-xs text-white/40">
              <Loader2 size={12} className="animate-spin text-brand-300" />
              Aguardando confirmação do pagamento…
            </p>
          </div>

          <Button
            variant="ghost"
            className="w-full"
            onClick={() => {
              setPix(null);
              setPaymentId("");
            }}
          >
            Voltar ao checkout
          </Button>
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
          Asaas e Mercado Pago integrados. PayPal ainda simulado.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="grid gap-8 lg:grid-cols-[1fr_380px]"
      >
        <div className="space-y-6">
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

            {method === "asaas" && (
              <div className="pt-2 space-y-2">
                <p className="text-xs text-white/40">Método Asaas</p>
                <div className="grid grid-cols-3 gap-2">
                  {asaasBillings.map((b) => (
                    <button
                      key={b.id}
                      type="button"
                      onClick={() => setAsaasBilling(b.id)}
                      className={cn(
                        "rounded-xl border px-3 py-2.5 text-left transition",
                        asaasBilling === b.id
                          ? "border-brand-400/50 bg-brand-500/15"
                          : "border-white/10 bg-ink-950/40 hover:border-white/20",
                      )}
                    >
                      <span className="block text-sm font-medium">{b.label}</span>
                      <span className="block text-[10px] text-white/35 mt-0.5">
                        {b.hint}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <p className="flex items-center gap-1.5 text-[11px] text-white/35">
              <Lock size={12} />
              {method === "asaas"
                ? "Cobrança real via API Asaas (mesma integração do Capivara)."
                : method === "mercadopago"
                  ? "Checkout Pro real — você será redirecionado ao Mercado Pago."
                  : "Gateway ainda simulado — nenhuma cobrança real."}
            </p>

            {error && (
              <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-3.5 py-3 text-sm text-rose-200">
                {error}
              </div>
            )}
          </section>
        </div>

        <aside className="h-fit lg:sticky lg:top-24 rounded-2xl border border-white/10 bg-white/[0.04] p-5 sm:p-6 space-y-4">
          <h2 className="text-sm font-semibold">Resumo do pedido</h2>
          <ul className="space-y-3 max-h-64 overflow-y-auto">
            {items.map(({ product, quantity }) => (
              <li
                key={product.id}
                className="flex justify-between gap-3 text-sm"
              >
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
              <span>
                {selected.name}
                {method === "asaas"
                  ? ` · ${asaasBillings.find((b) => b.id === asaasBilling)?.label}`
                  : ""}
              </span>
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
                Processando…
              </>
            ) : method === "asaas" ? (
              <>Pagar com Asaas</>
            ) : (
              <>Pagar com {selected.name}</>
            )}
          </Button>
        </aside>
      </form>
    </div>
  );
}
