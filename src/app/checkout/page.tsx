"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Copy,
  CreditCard,
  KeyRound,
  Loader2,
  Lock,
  ShoppingBag,
} from "lucide-react";
import { useCart } from "@/context/cart-context";
import { formatPrice, pricingLabel } from "@/lib/catalog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type AsaasBilling = "PIX" | "CREDIT_CARD" | "BOLETO";

type PixPayload = {
  qr_code: string | null;
  qr_base64: string | null;
  expires_at: string | null;
  invoiceUrl: string | null;
};

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
  const [asaasBilling, setAsaasBilling] = useState<AsaasBilling>("PIX");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [document, setDocument] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [orderId, setOrderId] = useState("");
  const [redeemCode, setRedeemCode] = useState("");
  const [pix, setPix] = useState<PixPayload | null>(null);
  const [paymentId, setPaymentId] = useState("");
  const [copied, setCopied] = useState(false);
  const [codeCopied, setCodeCopied] = useState(false);

  const billingLabel = useMemo(
    () => asaasBillings.find((b) => b.id === asaasBilling)?.label ?? "Pix",
    [asaasBilling],
  );

  useEffect(() => {
    if (!paymentId || done) return;

    const timer = setInterval(async () => {
      try {
        const res = await fetch(`/api/payments/asaas/${paymentId}/status`);
        const data = await res.json();
        if (data?.confirmed) {
          // O código só volta na primeira confirmação; nas demais o cliente
          // usa o que foi enviado por e-mail.
          if (data.redeemCode) setRedeemCode(data.redeemCode);
          if (data.orderRef) setOrderId(data.orderRef);
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
      const res = await fetch("/api/payments/asaas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          cpfCnpj: document,
          billingType: asaasBilling,
          // Preço e nome vêm do catálogo no servidor.
          items: items.map(({ product, quantity }) => ({
            id: product.id,
            quantity,
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

  async function copyCode() {
    if (!redeemCode) return;
    await navigator.clipboard.writeText(redeemCode);
    setCodeCopied(true);
    setTimeout(() => setCodeCopied(false), 2000);
  }

  if (done) {
    return (
      <div className="container-page py-20 sm:py-28">
        <div className="mx-auto max-w-lg space-y-5 text-center animate-rise">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl border border-aqua-500/30 bg-aqua-500/15">
            <CheckCircle2 className="text-aqua-400" size={28} />
          </div>
          <h1 className="text-3xl font-semibold tracking-tight">
            Pagamento confirmado
          </h1>
          <p className="leading-relaxed text-white/50">
            Enviamos o código de resgate para{" "}
            <strong className="text-white/80">{email}</strong>. Use ele para
            baixar o código-fonte dos produtos.
          </p>

          {orderId && (
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-4 text-sm">
              <p className="mb-1 text-xs uppercase tracking-wider text-white/40">
                Número do pedido
              </p>
              <p className="font-mono text-lg text-brand-200">{orderId}</p>
            </div>
          )}

          {redeemCode && (
            <div className="rounded-2xl border border-brand-400/30 bg-brand-500/10 px-5 py-5">
              <p className="mb-2 flex items-center justify-center gap-1.5 text-xs uppercase tracking-wider text-white/45">
                <KeyRound size={12} />
                Seu código de resgate
              </p>
              <p className="font-mono text-2xl font-semibold tracking-[0.18em] text-white">
                {redeemCode}
              </p>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="mt-4"
                onClick={copyCode}
              >
                <Copy size={13} />
                {codeCopied ? "Copiado!" : "Copiar código"}
              </Button>
            </div>
          )}

          <div className="flex flex-col justify-center gap-3 pt-2 sm:flex-row">
            <Link href="/resgatar">
              <Button>
                Resgatar produto
                <ArrowRight size={15} />
              </Button>
            </Link>
            <Link href="/catalogo">
              <Button variant="secondary">Continuar comprando</Button>
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
          <div className="space-y-2 text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-300">
              Asaas · Pix
            </p>
            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              Escaneie o QR Code
            </h1>
            <p className="text-sm text-white/45">
              Total{" "}
              <strong className="tabular-nums text-white/80">
                {formatPrice(subtotal || 0)}
              </strong>
              {orderId ? ` · ${orderId}` : ""}
            </p>
          </div>

          <div className="flex flex-col items-center gap-4 rounded-3xl border border-white/10 bg-white/[0.04] p-6">
            {pix.qr_base64 ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={`data:image/png;base64,${pix.qr_base64}`}
                alt="QR Code Pix"
                className="h-52 w-52 rounded-xl bg-white p-2"
              />
            ) : (
              <div className="grid h-52 w-52 place-items-center rounded-xl bg-white/5 text-sm text-white/40">
                QR indisponível — use o copia e cola
              </div>
            )}

            {pix.qr_code && (
              <div className="w-full space-y-2">
                <p className="text-center text-xs text-white/40">
                  Pix copia e cola
                </p>
                <div className="max-h-24 overflow-y-auto break-all rounded-xl border border-white/10 bg-ink-950/60 p-3 font-mono text-[11px] text-white/55">
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
        <div className="mx-auto max-w-md space-y-4 text-center">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl border border-white/10 bg-white/5">
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
        className="mb-8 inline-flex items-center gap-1.5 text-sm text-white/45 transition hover:text-white"
      >
        <ArrowLeft size={14} />
        Continuar comprando
      </Link>

      <div className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight">Checkout</h1>
        <p className="mt-2 text-sm text-white/45">
          Pagamento via Asaas — Pix, cartão ou boleto.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="grid gap-8 lg:grid-cols-[1fr_380px]"
      >
        <div className="space-y-6">
          <section className="space-y-4 rounded-2xl border border-white/8 bg-white/[0.03] p-5 sm:p-6">
            <h2 className="text-sm font-semibold">Seus dados</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block space-y-1.5 sm:col-span-2">
                <span className="text-xs text-white/40">Nome completo</span>
                <input
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="h-11 w-full rounded-xl border border-white/10 bg-ink-950/60 px-3.5 text-sm outline-none focus:border-brand-400/50 focus:ring-2 focus:ring-brand-500/20"
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
                  className="h-11 w-full rounded-xl border border-white/10 bg-ink-950/60 px-3.5 text-sm outline-none focus:border-brand-400/50 focus:ring-2 focus:ring-brand-500/20"
                  placeholder="maria@empresa.com"
                />
              </label>
              <label className="block space-y-1.5">
                <span className="text-xs text-white/40">CPF / CNPJ</span>
                <input
                  required
                  value={document}
                  onChange={(e) => setDocument(e.target.value)}
                  className="h-11 w-full rounded-xl border border-white/10 bg-ink-950/60 px-3.5 text-sm outline-none focus:border-brand-400/50 focus:ring-2 focus:ring-brand-500/20"
                  placeholder="000.000.000-00"
                />
              </label>
            </div>
            <p className="text-[11px] leading-relaxed text-white/35">
              O código de resgate é enviado para este e-mail assim que o
              pagamento for confirmado.
            </p>
          </section>

          <section className="space-y-4 rounded-2xl border border-white/8 bg-white/[0.03] p-5 sm:p-6">
            <div className="flex items-center gap-2">
              <CreditCard size={16} className="text-brand-300" />
              <h2 className="text-sm font-semibold">Forma de pagamento</h2>
            </div>

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
                  <span className="mt-0.5 block text-[10px] text-white/35">
                    {b.hint}
                  </span>
                </button>
              ))}
            </div>

            <p className="flex items-center gap-1.5 text-[11px] text-white/35">
              <Lock size={12} />
              Cobrança processada pelo Asaas. Não armazenamos dados de cartão.
            </p>

            {error && (
              <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-3.5 py-3 text-sm text-rose-200">
                {error}
              </div>
            )}
          </section>
        </div>

        <aside className="h-fit space-y-4 rounded-2xl border border-white/10 bg-white/[0.04] p-5 sm:p-6 lg:sticky lg:top-24">
          <h2 className="text-sm font-semibold">Resumo do pedido</h2>
          <ul className="max-h-64 space-y-3 overflow-y-auto">
            {items.map(({ product, quantity }) => (
              <li key={product.id} className="flex justify-between gap-3 text-sm">
                <span className="min-w-0 text-white/60">
                  <span className="block truncate text-white/80">
                    {product.name}
                  </span>
                  <span className="text-xs text-white/35">
                    {quantity}× · {pricingLabel(product)}
                  </span>
                </span>
                <span className="shrink-0 tabular-nums text-white/80">
                  {formatPrice(product.price * quantity)}
                </span>
              </li>
            ))}
          </ul>

          <div className="space-y-2 border-t border-white/8 pt-4">
            <div className="flex justify-between text-sm text-white/50">
              <span>Subtotal</span>
              <span className="tabular-nums">{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm text-white/50">
              <span>Pagamento</span>
              <span>Asaas · {billingLabel}</span>
            </div>
            <div className="flex items-baseline justify-between pt-1">
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
            ) : (
              <>Pagar com Asaas</>
            )}
          </Button>

          <p className="text-center text-[11px] text-white/30">
            Já comprou?{" "}
            <Link href="/resgatar" className="text-brand-300 hover:text-brand-200">
              Resgatar produto
            </Link>
          </p>
        </aside>
      </form>
    </div>
  );
}
