export default function DashboardPage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold">Overview</h1>
      <p className="mt-2 text-[var(--aurora-muted)]">
        Substitua estes cards pelos KPIs do seu produto.
      </p>
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {["MRR", "Ativos", "Churn"].map((label) => (
          <div
            key={label}
            className="rounded-2xl border border-[var(--aurora-border)] bg-[var(--aurora-surface)] p-5"
          >
            <p className="text-xs text-[var(--aurora-muted)]">{label}</p>
            <p className="mt-2 text-2xl font-semibold">—</p>
          </div>
        ))}
      </div>
    </div>
  );
}