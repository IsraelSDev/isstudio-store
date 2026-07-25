"use client";

import Link from "next/link";
import { Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react";
import { useCart } from "@/context/cart-context";
import { formatPrice, pricingLabel } from "@/lib/catalog";
import { Button } from "@/components/ui/button";
import { categoryIcons } from "@/lib/icons";

export function CartDrawer() {
  const { items, isOpen, setOpen, subtotal, updateQuantity, removeItem } =
    useCart();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      <button
        type="button"
        aria-label="Fechar carrinho"
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={() => setOpen(false)}
      />

      <aside className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col border-l border-white/10 bg-ink-900 shadow-2xl animate-rise">
        <div className="flex items-center justify-between border-b border-white/5 px-5 py-4">
          <div className="flex items-center gap-2.5">
            <ShoppingBag size={18} className="text-brand-300" />
            <h2 className="text-base font-semibold">Seu carrinho</h2>
            <span className="rounded-full bg-white/5 px-2 py-0.5 text-xs text-white/50">
              {items.length}
            </span>
          </div>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="grid h-9 w-9 place-items-center rounded-lg text-white/50 hover:bg-white/5 hover:text-white"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
          {items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center gap-3 py-16">
              <div className="grid h-14 w-14 place-items-center rounded-2xl bg-white/5 border border-white/10">
                <ShoppingBag className="text-white/30" />
              </div>
              <p className="text-sm text-white/50">Seu carrinho está vazio.</p>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setOpen(false)}
              >
                Continuar explorando
              </Button>
            </div>
          ) : (
            items.map(({ product, quantity }) => {
              const Icon = categoryIcons[product.category];
              return (
                <div
                  key={product.id}
                  className="flex gap-3 rounded-2xl border border-white/8 bg-white/[0.03] p-3"
                >
                  <div
                    className="grid h-12 w-12 shrink-0 place-items-center rounded-xl border border-white/10"
                    style={{
                      background: `linear-gradient(135deg, ${getAccent(product.category)}22, transparent)`,
                    }}
                  >
                    <Icon size={18} style={{ color: getAccent(product.category) }} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/produto/${product.slug}`}
                      onClick={() => setOpen(false)}
                      className="block truncate text-sm font-medium hover:text-brand-200"
                    >
                      {product.name}
                    </Link>
                    <p className="text-xs text-white/40 mt-0.5">
                      {formatPrice(product.price)}
                      <span className="text-white/25">
                        {" "}
                        · {pricingLabel(product)}
                      </span>
                    </p>
                    <div className="mt-2 flex items-center justify-between">
                      <div className="inline-flex items-center rounded-lg border border-white/10 bg-ink-950/60">
                        <button
                          type="button"
                          className="grid h-8 w-8 place-items-center text-white/60 hover:text-white"
                          onClick={() =>
                            updateQuantity(product.id, quantity - 1)
                          }
                        >
                          <Minus size={14} />
                        </button>
                        <span className="w-7 text-center text-sm tabular-nums">
                          {quantity}
                        </span>
                        <button
                          type="button"
                          className="grid h-8 w-8 place-items-center text-white/60 hover:text-white"
                          onClick={() =>
                            updateQuantity(product.id, quantity + 1)
                          }
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeItem(product.id)}
                        className="grid h-8 w-8 place-items-center rounded-lg text-white/35 hover:bg-rose-500/10 hover:text-rose-300"
                        aria-label="Remover"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t border-white/5 p-5 space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-white/50">Subtotal</span>
              <span className="text-lg font-semibold tabular-nums">
                {formatPrice(subtotal)}
              </span>
            </div>
            <p className="text-[11px] text-white/35">
              Pagamento via Asaas, Mercado Pago ou PayPal no checkout.
            </p>
            <Link href="/checkout" onClick={() => setOpen(false)} className="block">
              <Button className="w-full" size="lg">
                Finalizar compra
              </Button>
            </Link>
          </div>
        )}
      </aside>
    </div>
  );
}

const accents: Record<string, string> = {
  sistemas: "#8b72ff",
  apis: "#35e0d6",
  templates: "#ff7eb6",
  plugins: "#ffb347",
  licencas: "#6ee7b7",
  saas: "#60a5fa",
  ia: "#c084fc",
  "white-label": "#f472b6",
  hospedagem: "#34d399",
  assinaturas: "#fbbf24",
};

function getAccent(slug: string) {
  return accents[slug] ?? "#8b72ff";
}
