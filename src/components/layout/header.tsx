"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Search, ShoppingBag, X } from "lucide-react";
import { useState } from "react";
import { categories } from "@/lib/catalog";
import { useCart } from "@/context/cart-context";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export function Header() {
  const { count, setOpen, hydrated } = useCart();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const cartCount = hydrated ? count : 0;

  return (
    <header className="sticky top-0 z-40 border-b border-white/5 bg-ink-950/70 backdrop-blur-xl">
      <div className="container-page flex h-16 items-center justify-between gap-4">
        <div className="flex items-center gap-8">
          <Link href="/" className="group flex items-center gap-2.5">
            <span className="relative grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-brand-400 to-aqua-400 shadow-[0_0_24px_-4px_rgb(112_72_245_/_0.8)]">
              <span className="h-3.5 w-3.5 rounded-sm bg-ink-950 rotate-45" />
            </span>
            <span className="text-[15px] font-semibold tracking-tight">
              ISStudio
              <span className="text-white/40 font-normal"> Store</span>
            </span>
          </Link>

          <nav className="hidden lg:flex items-center gap-1">
            <Link
              href="/catalogo"
              className={cn(
                "rounded-lg px-3 py-1.5 text-sm text-white/60 transition hover:text-white hover:bg-white/5",
                pathname.startsWith("/catalogo") && "text-white bg-white/5",
              )}
            >
              Catálogo
            </Link>
            <Link
              href="/categorias"
              className={cn(
                "rounded-lg px-3 py-1.5 text-sm text-white/60 transition hover:text-white hover:bg-white/5",
                pathname.startsWith("/categorias") && "text-white bg-white/5",
              )}
            >
              Categorias
            </Link>
            <Link
              href="/assinaturas"
              className="rounded-lg px-3 py-1.5 text-sm text-white/60 transition hover:text-white hover:bg-white/5"
            >
              Planos
            </Link>
            <Link
              href="/resgatar"
              className={cn(
                "rounded-lg px-3 py-1.5 text-sm text-white/60 transition hover:text-white hover:bg-white/5",
                pathname.startsWith("/resgatar") && "text-white bg-white/5",
              )}
            >
              Resgatar
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/catalogo"
            className="hidden sm:inline-flex h-10 w-10 items-center justify-center rounded-xl text-white/60 hover:bg-white/5 hover:text-white transition"
            aria-label="Buscar"
          >
            <Search className="h-4.5 w-4.5" size={18} />
          </Link>

          <button
            type="button"
            onClick={() => setOpen(true)}
            className="relative inline-flex h-10 items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 text-sm text-white/80 transition hover:bg-white/10 hover:text-white"
            aria-label="Abrir carrinho"
          >
            <ShoppingBag size={18} />
            <span className="hidden sm:inline">Carrinho</span>
            {cartCount > 0 && (
              <span className="absolute -right-1.5 -top-1.5 grid h-5 min-w-5 place-items-center rounded-full bg-brand-500 px-1 text-[11px] font-bold text-white shadow-lg">
                {cartCount}
              </span>
            )}
          </button>

          <Link href="/catalogo" className="hidden md:inline-flex">
            <Button size="sm">Começar</Button>
          </Link>

          <button
            type="button"
            className="lg:hidden inline-flex h-10 w-10 items-center justify-center rounded-xl text-white/70 hover:bg-white/5"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Menu"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="lg:hidden border-t border-white/5 bg-ink-900/95 backdrop-blur-xl">
          <div className="container-page py-4 space-y-1">
            <Link
              href="/catalogo"
              onClick={() => setMobileOpen(false)}
              className="block rounded-lg px-3 py-2.5 text-sm text-white/80 hover:bg-white/5"
            >
              Catálogo completo
            </Link>
            <Link
              href="/categorias"
              onClick={() => setMobileOpen(false)}
              className="block rounded-lg px-3 py-2.5 text-sm text-white/80 hover:bg-white/5"
            >
              Todas as categorias
            </Link>
            <Link
              href="/resgatar"
              onClick={() => setMobileOpen(false)}
              className="block rounded-lg px-3 py-2.5 text-sm text-white/80 hover:bg-white/5"
            >
              Resgatar produto
            </Link>
            <div className="pt-2 mt-2 border-t border-white/5 grid grid-cols-2 gap-1">
              {categories.map((c) => (
                <Link
                  key={c.slug}
                  href={`/categorias/${c.slug}`}
                  onClick={() => setMobileOpen(false)}
                  className="rounded-lg px-3 py-2 text-sm text-white/55 hover:text-white hover:bg-white/5"
                >
                  {c.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
