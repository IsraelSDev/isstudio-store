export type TicketPriority = "low" | "normal" | "high" | "urgent";

export interface SlaPolicy {
  priority: TicketPriority;
  /** Minutos até a primeira resposta. */
  firstResponseMinutes: number;
  /** Minutos até a resolução. */
  resolutionMinutes: number;
}

export const defaultSla: SlaPolicy[] = [
  { priority: "urgent", firstResponseMinutes: 15, resolutionMinutes: 120 },
  { priority: "high", firstResponseMinutes: 60, resolutionMinutes: 480 },
  { priority: "normal", firstResponseMinutes: 240, resolutionMinutes: 1440 },
  { priority: "low", firstResponseMinutes: 1440, resolutionMinutes: 4320 },
];

export interface Ticket {
  id: string;
  tenantId: string;
  priority: TicketPriority;
  assigneeId: string | null;
  createdAt: string;
  firstRespondedAt: string | null;
  resolvedAt: string | null;
}

export type SlaStatus = "ok" | "warning" | "breached";

export function slaFor(priority: TicketPriority): SlaPolicy {
  return (
    defaultSla.find((p) => p.priority === priority) ??
    defaultSla.find((p) => p.priority === "normal")!
  );
}

/**
 * Retorna o status do SLA de primeira resposta.
 * warning = passou de 80% do prazo sem resposta.
 */
export function firstResponseStatus(
  ticket: Ticket,
  now: Date = new Date(),
): SlaStatus {
  if (ticket.firstRespondedAt) return "ok";

  const policy = slaFor(ticket.priority);
  const deadline =
    new Date(ticket.createdAt).getTime() +
    policy.firstResponseMinutes * 60_000;
  const remaining = deadline - now.getTime();

  if (remaining <= 0) return "breached";
  if (remaining <= policy.firstResponseMinutes * 60_000 * 0.2) return "warning";
  return "ok";
}

/**
 * Round-robin simples entre agentes online.
 * Em produção, considere carga (tickets abertos) e especialidade.
 */
export function assignRoundRobin(
  agentIds: string[],
  lastAssignedIndex: number,
): { agentId: string; nextIndex: number } | null {
  if (agentIds.length === 0) return null;
  const nextIndex = (lastAssignedIndex + 1) % agentIds.length;
  return { agentId: agentIds[nextIndex], nextIndex };
}
