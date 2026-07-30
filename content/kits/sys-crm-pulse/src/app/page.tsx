import { db } from "@/lib/db";
import {
  formatBRL,
  openValue,
  stages,
  weightedForecast,
  winRate,
} from "@/lib/pipeline";

export const dynamic = "force-dynamic";

export default async function PipelinePage() {
  const leads = await db.lead.findMany({
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      name: true,
      company: true,
      stage: true,
      value: true,
    },
  });

  // Decimal do Prisma não é number: converta antes de calcular.
  const metricsInput = leads.map((lead) => ({
    stage: lead.stage,
    value: Number(lead.value),
  }));

  const metrics = [
    { label: "Em aberto", value: formatBRL(openValue(metricsInput)) },
    { label: "Forecast ponderado", value: formatBRL(weightedForecast(metricsInput)) },
    {
      label: "Taxa de ganho",
      value: `${Math.round(winRate(metricsInput) * 100)}%`,
    },
    { label: "Leads", value: String(leads.length) },
  ];

  return (
    <main className="mx-auto max-w-7xl px-6 py-10">
      <h1 className="text-2xl font-semibold">Pipeline</h1>

      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric) => (
          <div key={metric.label} className="rounded-xl border p-4">
            <p className="text-xs text-neutral-500">{metric.label}</p>
            <p className="mt-1 text-xl font-semibold tabular-nums">
              {metric.value}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-3 xl:grid-cols-6">
        {stages.map((stage) => {
          const column = leads.filter((lead) => lead.stage === stage.slug);

          return (
            <section key={stage.slug} className="rounded-xl border p-3">
              <header className="mb-3 flex items-baseline justify-between">
                <h2 className="text-sm font-medium">{stage.name}</h2>
                <span className="text-xs text-neutral-500">{column.length}</span>
              </header>

              <ul className="space-y-2">
                {column.map((lead) => (
                  <li key={lead.id} className="rounded-lg border p-3">
                    <p className="truncate text-sm font-medium">{lead.name}</p>
                    {lead.company && (
                      <p className="truncate text-xs text-neutral-500">
                        {lead.company}
                      </p>
                    )}
                    <p className="mt-1 text-xs tabular-nums text-neutral-600">
                      {formatBRL(Number(lead.value))}
                    </p>
                  </li>
                ))}
                {column.length === 0 && (
                  <li className="py-6 text-center text-xs text-neutral-400">
                    Nenhum lead
                  </li>
                )}
              </ul>
            </section>
          );
        })}
      </div>
    </main>
  );
}
