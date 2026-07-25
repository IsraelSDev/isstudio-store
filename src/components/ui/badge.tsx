import { cn } from "@/lib/utils";
import type { ProductBadge } from "@/lib/types";

const styles: Record<ProductBadge, string> = {
  novo: "bg-aqua-500/15 text-aqua-400 border-aqua-500/30",
  destaque: "bg-brand-500/20 text-brand-200 border-brand-400/30",
  popular: "bg-amber-glow/15 text-amber-glow border-amber-glow/30",
  enterprise: "bg-white/10 text-white/80 border-white/20",
};

const labels: Record<ProductBadge, string> = {
  novo: "Novo",
  destaque: "Destaque",
  popular: "Popular",
  enterprise: "Enterprise",
};

export function Badge({
  kind,
  className,
}: {
  kind: ProductBadge;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider",
        styles[kind],
        className,
      )}
    >
      {labels[kind]}
    </span>
  );
}
