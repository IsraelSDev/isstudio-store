export type ConversationPhase =
  | "greeting"
  | "budget"
  | "authority"
  | "need"
  | "timeline"
  | "qualified"
  | "handoff";

export interface BantScore {
  budget: boolean | null;
  authority: boolean | null;
  need: boolean | null;
  timeline: boolean | null;
}

export interface ConversationState {
  phase: ConversationPhase;
  bant: BantScore;
  notes: string[];
}

export function createState(): ConversationState {
  return {
    phase: "greeting",
    bant: { budget: null, authority: null, need: null, timeline: null },
    notes: [],
  };
}

const ORDER: ConversationPhase[] = [
  "greeting",
  "budget",
  "authority",
  "need",
  "timeline",
  "qualified",
];

/** Avança só quando o campo BANT da fase atual foi preenchido. */
export function advance(state: ConversationState): ConversationState {
  const phaseField: Partial<Record<ConversationPhase, keyof BantScore>> = {
    budget: "budget",
    authority: "authority",
    need: "need",
    timeline: "timeline",
  };

  const field = phaseField[state.phase];
  if (field && state.bant[field] === null) return state;

  const index = ORDER.indexOf(state.phase);
  if (index < 0 || index >= ORDER.length - 1) return state;

  return { ...state, phase: ORDER[index + 1] };
}

export function isFullyQualified(bant: BantScore): boolean {
  return (
    bant.budget === true &&
    bant.authority === true &&
    bant.need === true &&
    bant.timeline === true
  );
}

export function nextQuestion(phase: ConversationPhase): string {
  switch (phase) {
    case "greeting":
      return "Olá! Sou o assistente comercial. Posso te fazer algumas perguntas rápidas?";
    case "budget":
      return "Vocês já têm orçamento reservado para essa iniciativa neste trimestre?";
    case "authority":
      return "Você participa da decisão final de compra, ou há mais alguém envolvido?";
    case "need":
      return "Qual problema principal vocês querem resolver com essa solução?";
    case "timeline":
      return "Há uma data-alvo para começar? (ex.: este mês, próximo trimestre)";
    case "qualified":
      return "Perfeito — posso agendar uma conversa com um especialista?";
    case "handoff":
      return "Estou te transferindo para um humano agora.";
  }
}
