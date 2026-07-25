import Link from "next/link";
import { categories } from "@/lib/catalog";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-white/5 bg-ink-900/40">
      <div className="container-page py-14">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-4">
            <Link href="/" className="inline-flex items-center gap-2.5">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-brand-400 to-aqua-400">
                <span className="h-3.5 w-3.5 rounded-sm bg-ink-950 rotate-45" />
              </span>
              <span className="text-[15px] font-semibold tracking-tight">
                ISStudio Store
              </span>
            </Link>
            <p className="text-sm text-white/50 leading-relaxed max-w-xs">
              Marketplace de soluções digitais: sistemas, APIs, IA, SaaS,
              white label e muito mais — prontas para vender e escalar.
            </p>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-white/40 mb-4">
              Categorias
            </h4>
            <ul className="space-y-2">
              {categories.slice(0, 5).map((c) => (
                <li key={c.slug}>
                  <Link
                    href={`/categorias/${c.slug}`}
                    className="text-sm text-white/60 hover:text-white transition"
                  >
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-white/40 mb-4">
              Mais soluções
            </h4>
            <ul className="space-y-2">
              {categories.slice(5).map((c) => (
                <li key={c.slug}>
                  <Link
                    href={`/categorias/${c.slug}`}
                    className="text-sm text-white/60 hover:text-white transition"
                  >
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-white/40 mb-4">
              Pagamentos
            </h4>
            <p className="text-sm text-white/50 mb-4 leading-relaxed">
              Aceitamos Asaas, Mercado Pago e PayPal — Pix, cartão e boleto.
            </p>
            <div className="flex flex-wrap gap-2">
              {["Asaas", "Mercado Pago", "PayPal", "Pix"].map((p) => (
                <span
                  key={p}
                  className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] font-medium text-white/70"
                >
                  {p}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-t border-white/5 pt-6 text-xs text-white/35">
          <p>© {new Date().getFullYear()} ISStudio. Todos os direitos reservados.</p>
          <p>Feito para quem constrói produtos digitais.</p>
        </div>
      </div>
    </footer>
  );
}
