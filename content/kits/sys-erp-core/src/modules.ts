/**
 * Registro dos módulos do ERP.
 *
 * A lista é explícita de propósito: descoberta automática de pastas deixa o boot
 * imprevisível e esconde erro de dependência até a requisição acontecer. Aqui a
 * aplicação falha ao subir se a configuração estiver incoerente.
 */
export type ModuleId =
  | "financeiro"
  | "estoque"
  | "pedidos"
  | "fiscal"
  | "relatorios";

export interface ModuleDefinition {
  id: ModuleId;
  name: string;
  description: string;
  /** Módulos que precisam estar ativos junto com este. */
  requires: ModuleId[];
  /** Variáveis de ambiente obrigatórias quando o módulo está ativo. */
  requiredEnv?: string[];
}

export const moduleRegistry: Record<ModuleId, ModuleDefinition> = {
  financeiro: {
    id: "financeiro",
    name: "Financeiro",
    description: "Contas a pagar e receber, conciliação e fluxo de caixa.",
    requires: [],
  },
  estoque: {
    id: "estoque",
    name: "Estoque",
    description: "Saldo multi-depósito, movimentações e inventário.",
    requires: [],
  },
  pedidos: {
    id: "pedidos",
    name: "Pedidos e PDV",
    description: "Venda, orçamento e frente de caixa.",
    // Pedido baixa estoque: sem o módulo, a venda ficaria inconsistente.
    requires: ["estoque"],
  },
  fiscal: {
    id: "fiscal",
    name: "Fiscal",
    description: "Emissão de NF-e/NFC-e via provedor externo.",
    requires: ["pedidos"],
    requiredEnv: ["FISCAL_PROVIDER", "FISCAL_API_KEY"],
  },
  relatorios: {
    id: "relatorios",
    name: "Relatórios",
    description: "Painéis consolidados de vendas, margem e caixa.",
    requires: ["financeiro"],
  },
};

export class ModuleConfigError extends Error {}

function parseList(raw: string | undefined): string[] {
  return String(raw || "")
    .split(",")
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);
}

/**
 * Lê ERP_MODULES, valida dependências e variáveis obrigatórias.
 * Chame no bootstrap da API antes de registrar as rotas.
 */
export function resolveActiveModules(
  env: Record<string, string | undefined> = process.env,
): ModuleDefinition[] {
  const requested = parseList(env.ERP_MODULES);
  if (requested.length === 0) {
    throw new ModuleConfigError(
      "ERP_MODULES está vazio. Ative ao menos um módulo.",
    );
  }

  const unknown = requested.filter((id) => !(id in moduleRegistry));
  if (unknown.length > 0) {
    throw new ModuleConfigError(
      `Módulos desconhecidos em ERP_MODULES: ${unknown.join(", ")}. ` +
        `Disponíveis: ${Object.keys(moduleRegistry).join(", ")}.`,
    );
  }

  const active = requested as ModuleId[];

  for (const id of active) {
    const definition = moduleRegistry[id];

    const missingDeps = definition.requires.filter(
      (dep) => !active.includes(dep),
    );
    if (missingDeps.length > 0) {
      throw new ModuleConfigError(
        `O módulo "${id}" exige: ${missingDeps.join(", ")}. Adicione em ERP_MODULES.`,
      );
    }

    const missingEnv = (definition.requiredEnv ?? []).filter(
      (key) => !String(env[key] || "").trim(),
    );
    if (missingEnv.length > 0) {
      throw new ModuleConfigError(
        `O módulo "${id}" exige as variáveis: ${missingEnv.join(", ")}.`,
      );
    }
  }

  // Ordena respeitando dependências para o registro na aplicação.
  return topologicalOrder(active).map((id) => moduleRegistry[id]);
}

function topologicalOrder(active: ModuleId[]): ModuleId[] {
  const ordered: ModuleId[] = [];
  const visiting = new Set<ModuleId>();

  const visit = (id: ModuleId) => {
    if (ordered.includes(id)) return;
    if (visiting.has(id)) {
      throw new ModuleConfigError(`Dependência circular envolvendo "${id}".`);
    }

    visiting.add(id);
    for (const dep of moduleRegistry[id].requires) {
      if (active.includes(dep)) visit(dep);
    }
    visiting.delete(id);
    ordered.push(id);
  };

  active.forEach(visit);
  return ordered;
}
