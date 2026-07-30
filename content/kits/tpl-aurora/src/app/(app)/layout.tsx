import Link from "next/link";
import type { ReactNode } from "react";

const nav = [
  { href: "/app", label: "Overview" },
  { href: "/app/settings", label: "Settings" },
];

export default function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen md:grid md:grid-cols-[240px_1fr]">
      <aside className="border-r border-[var(--aurora-border)] bg-[var(--aurora-surface)] p-5">
        <p className="text-sm font-semibold">Aurora</p>
        <nav className="mt-6 space-y-1">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block rounded-lg px-3 py-2 text-sm text-[var(--aurora-muted)] hover:bg-white/5 hover:text-[var(--aurora-text)]"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>
      <div className="p-6 md:p-8">{children}</div>
    </div>
  );
}