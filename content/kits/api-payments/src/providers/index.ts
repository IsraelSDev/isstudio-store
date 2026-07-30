/** Status normalizado. A aplicação consumidora só conhece estes quatro. */
export type PaymentStatus = "pending" | "paid" | "failed" | "refunded";

export type PaymentMethod = "pix" | "card" | "boleto" | "wallet";

export interface CreateChargeInput {
  /** Sua referência do pedido. Serve de chave de idempotência. */
  externalReference: string;
  /** Valor em centavos — inteiro, nunca float. */
  amountInCents: number;
  method: PaymentMethod;
  description: string;
  customer: {
    name: string;
    email: string;
    /** CPF/CNPJ somente dígitos. Obrigatório em gateways brasileiros. */
    taxId?: string;
  };
}

export interface Charge {
  providerId: string;
  provider: ProviderId;
  externalReference: string;
  status: PaymentStatus;
  amountInCents: number;
  /** Página de pagamento hospedada pelo gateway, quando houver. */
  checkoutUrl?: string | null;
  pix?: {
    qrCodePayload: string | null;
    qrCodeBase64: string | null;
    expiresAt: string | null;
  } | null;
}

export type ProviderId = "asaas" | "mercadopago" | "paypal";

export interface Provider {
  readonly id: ProviderId;
  /** Métodos que este provedor atende — usado para escolher a rota da cobrança. */
  readonly supports: PaymentMethod[];
  isConfigured(): boolean;
  createCharge(input: CreateChargeInput): Promise<Charge>;
  getCharge(providerId: string): Promise<Charge>;
  /**
   * Valida a autenticidade do webhook. Recebe headers e corpo bruto porque
   * algumas assinaturas são calculadas sobre o body exatamente como chegou.
   */
  verifyWebhook(headers: Record<string, string>, rawBody: string): boolean;
}

const registry = new Map<ProviderId, Provider>();

export function registerProvider(provider: Provider): void {
  registry.set(provider.id, provider);
}

export function getProvider(id: ProviderId): Provider {
  const provider = registry.get(id);
  if (!provider) throw new Error(`Provedor não registrado: ${id}`);
  if (!provider.isConfigured()) {
    throw new Error(`Provedor ${id} sem credenciais configuradas.`);
  }
  return provider;
}

export function configuredProviders(): Provider[] {
  return [...registry.values()].filter((provider) => provider.isConfigured());
}

/** Primeiro provedor configurado que atende o método pedido. */
export function pickProviderFor(method: PaymentMethod): Provider {
  const provider = configuredProviders().find((candidate) =>
    candidate.supports.includes(method),
  );
  if (!provider) {
    throw new Error(`Nenhum provedor configurado aceita o método "${method}".`);
  }
  return provider;
}
