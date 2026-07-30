/**
 * Fonte única do funil. Board, métricas e filtros derivam desta lista —
 * reordenar ou renomear estágios aqui não exige migration no banco.
 */
export interface Stage {
  slug: string;
  name: string;
  /** Probabilidade de fechamento usada no forecast ponderado (0 a 1). */
  probability: number;
  /** Estágio terminal: sai do forecast e fecha o lead. */
  outcome?: "won" | "lost";
}

export const stages: Stage[] = [
  { slug: "novo", name: "Novo", probability: 0.1 },
  { slug: "qualificado", name: "Qualificado", probability: 0.3 },
  { slug: "proposta", name: "Proposta enviada", probability: 0.6 },
  { slug: "negociacao", name: "Negociação", probability: 0.8 },
  { slug: "ganho", name: "Ganho", probability: 1, outcome: "won" },
  { slug: "perdido", name: "Perdido", probability: 0, outcome: "lost" },
];

export const openStages = stages.filter((stage) => !stage.outcome);

export function getStage(slug: string): Stage | undefined {
  return stages.find((stage) => stage.slug === slug);
}

export interface PipelineLead {
  stage: string;
  value: number;
}

/** Soma simples do que está em aberto. */
export function openValue(leads: PipelineLead[]): number {
  return leads
    .filter((lead) => !getStage(lead.stage)?.outcome)
    .reduce((total, lead) => total + lead.value, 0);
}

/** Forecast ponderado pela probabilidade do estágio. */
export function weightedForecast(leads: PipelineLead[]): number {
  return leads.reduce((total, lead) => {
    const stage = getStage(lead.stage);
    if (!stage || stage.outcome) return total;
    return total + lead.value * stage.probability;
  }, 0);
}

/** Ganhos ÷ (ganhos + perdidos). Retorna 0 quando nada foi fechado ainda. */
export function winRate(leads: PipelineLead[]): number {
  const closed = leads.filter((lead) => getStage(lead.stage)?.outcome);
  if (closed.length === 0) return 0;
  const won = closed.filter(
    (lead) => getStage(lead.stage)?.outcome === "won",
  ).length;
  return won / closed.length;
}

export function formatBRL(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}
