export interface FunnelStep {
  name: string;
  event: string;
}

export interface FunnelDefinition {
  id: string;
  name: string;
  steps: FunnelStep[];
  /** Janela máxima entre o primeiro e o último passo (horas). */
  windowHours: number;
}

export const exampleFunnels: FunnelDefinition[] = [
  {
    id: "signup",
    name: "Cadastro",
    windowHours: 24,
    steps: [
      { name: "Visitou pricing", event: "pricing_viewed" },
      { name: "Iniciou signup", event: "signup_started" },
      { name: "Concluiu signup", event: "signup_completed" },
    ],
  },
];

export interface FunnelCounts {
  step: string;
  users: number;
  /** Conversão em relação ao passo anterior (1 no primeiro). */
  conversionFromPrevious: number;
}

export function computeFunnel(
  steps: FunnelStep[],
  /** Mapa event → set de userIds que dispararam o evento na janela. */
  usersByEvent: Record<string, Set<string>>,
): FunnelCounts[] {
  let previous = 0;
  return steps.map((step, index) => {
    const users = usersByEvent[step.event]?.size ?? 0;
    const conversionFromPrevious =
      index === 0 ? 1 : previous === 0 ? 0 : users / previous;
    previous = users;
    return { step: step.name, users, conversionFromPrevious };
  });
}
