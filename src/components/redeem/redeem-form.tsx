"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Download,
  KeyRound,
  Loader2,
  Package,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/catalog";

interface RedeemItem {
  productId: string;
  slug: string | null;
  name: string;
  tagline: string | null;
  category: string | null;
  stack: string[];
  quantity: number;
  delivery: string | null;
  downloadToken: string | null;
}

interface RedeemResult {
  order: {
    ref: string;
    customerName: string;
    paidAt: string | null;
    amount: number;
  };
  items: RedeemItem[];
}

const CODE_LENGTH = 12;
const GROUP_SIZE = 4;

function maskCode(raw: string): string {
  const clean = raw
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, CODE_LENGTH);
  const groups: string[] = [];
  for (let i = 0; i < clean.length; i += GROUP_SIZE) {
    groups.push(clean.slice(i, i + GROUP_SIZE));
  }
  return groups.join("-");
}

export function RedeemForm() {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<RedeemResult | null>(null);

  const ready = code.replace(/-/g, "").length === CODE_LENGTH;

  async function submit(e?: React.FormEvent) {
    e?.preventDefault();
    if (!ready || loading) return;

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/orders/redeem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || "Não foi possível validar o código.");
      }

      setResult(data as RedeemResult);
    } catch (err) {
      setResult(null);
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }

  if (result) {
    const paidAt = result.order.paidAt
      ? new Date(result.order.paidAt).toLocaleDateString("pt-BR", {
          day: "2-digit",
          month: "long",
          year: "numeric",
        })
      : null;

    return (
      <div className="space-y-6 animate-rise">
        <section className="rounded-3xl border border-aqua-500/25 bg-aqua-500/[0.06] p-6">
          <div className="flex items-start gap-4">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-aqua-500/30 bg-aqua-500/15">
              <ShieldCheck className="text-aqua-400" size={20} />
            </span>
            <div className="min-w-0 flex-1">
              <h2 className="text-lg font-semibold">
                Pedido liberado, {result.order.customerName.split(" ")[0]}
              </h2>
              <p className="mt-1 text-sm text-white/50">
                <span className="font-mono text-brand-200">
                  {result.order.ref}
                </span>
                {paidAt ? ` · pago em ${paidAt}` : ""} ·{" "}
                {formatPrice(result.order.amount)}
              </p>
            </div>
          </div>
        </section>

        <ul className="space-y-3">
          {result.items.map((item) => (
            <li
              key={item.productId}
              className="rounded-2xl border border-white/10 bg-white/[0.03] p-5"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <Package size={15} className="shrink-0 text-brand-300" />
                    <h3 className="truncate font-semibold">{item.name}</h3>
                  </div>
                  {item.tagline && (
                    <p className="mt-1.5 text-sm leading-relaxed text-white/45">
                      {item.tagline}
                    </p>
                  )}
                  {item.stack.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {item.stack.map((tech) => (
                        <span
                          key={tech}
                          className="rounded-md border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] font-medium text-white/55"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="shrink-0">
                  {item.downloadToken ? (
                    <a
                      href={`/api/downloads/${item.productId}?token=${encodeURIComponent(item.downloadToken)}`}
                    >
                      <Button>
                        <Download size={15} />
                        Baixar .zip
                      </Button>
                    </a>
                  ) : (
                    <span className="block max-w-[220px] text-right text-xs leading-relaxed text-white/40">
                      {item.delivery || "Entrega assistida pelo suporte."}
                    </span>
                  )}
                </div>
              </div>

              {item.slug && (
                <Link
                  href={`/produto/${item.slug}`}
                  className="mt-4 inline-flex items-center gap-1.5 text-xs text-white/40 transition hover:text-white"
                >
                  Ver detalhes do produto
                  <ArrowRight size={12} />
                </Link>
              )}
            </li>
          ))}
        </ul>

        <div className="rounded-2xl border border-white/8 bg-white/[0.02] p-5 text-sm leading-relaxed text-white/45">
          Os links de download valem por 1 hora. Se algum expirar, clique em
          &ldquo;Atualizar links&rdquo; para gerar novos com o mesmo código.
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Button variant="secondary" onClick={() => submit()} disabled={loading}>
            {loading ? (
              <>
                <Loader2 size={15} className="animate-spin" />
                Atualizando…
              </>
            ) : (
              <>
                <RefreshCw size={15} />
                Atualizar links
              </>
            )}
          </Button>
          <Button
            variant="ghost"
            onClick={() => {
              setResult(null);
              setCode("");
              setError("");
            }}
          >
            Resgatar outro código
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-6 animate-rise">
      <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 sm:p-8">
        <div className="mb-6 flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-xl border border-brand-400/30 bg-brand-500/15">
            <KeyRound className="text-brand-300" size={20} />
          </span>
          <div>
            <h2 className="font-semibold">Código de resgate</h2>
            <p className="text-sm text-white/45">
              Enviado por e-mail após a confirmação do pagamento.
            </p>
          </div>
        </div>

        <label className="block space-y-2">
          <span className="text-xs text-white/40">Digite o código</span>
          <input
            value={code}
            onChange={(e) => setCode(maskCode(e.target.value))}
            placeholder="ABCD-EFGH-JKLM"
            autoComplete="off"
            autoCapitalize="characters"
            spellCheck={false}
            inputMode="text"
            aria-invalid={!!error}
            className="h-14 w-full rounded-xl border border-white/10 bg-ink-950/60 px-4 text-center font-mono text-xl tracking-[0.2em] uppercase outline-none transition focus:border-brand-400/50 focus:ring-2 focus:ring-brand-500/20"
          />
        </label>

        {error && (
          <div className="mt-4 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
            {error}
          </div>
        )}

        <Button
          type="submit"
          size="lg"
          className="mt-6 w-full"
          disabled={!ready || loading}
        >
          {loading ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Validando…
            </>
          ) : (
            <>
              Resgatar produtos
              <ArrowRight size={16} />
            </>
          )}
        </Button>
      </div>

      <p className="text-center text-sm text-white/35">
        Não recebeu o e-mail? Confira o spam ou{" "}
        <Link href="/catalogo" className="text-brand-300 hover:text-brand-200">
          fale com o suporte
        </Link>
        .
      </p>
    </form>
  );
}
