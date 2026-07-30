export type ChannelKind = "email" | "whatsapp" | "chat";

export interface InboundMessage {
  id: string;
  tenantId: string;
  channel: ChannelKind;
  from: string;
  body: string;
  receivedAt: string;
  /** Thread / conversation id no provedor de origem. */
  threadId: string;
}

export interface OutboundMessage {
  tenantId: string;
  channel: ChannelKind;
  to: string;
  body: string;
  threadId?: string;
}

export interface ChannelAdapter {
  readonly kind: ChannelKind;
  isConfigured(): boolean;
  send(message: OutboundMessage): Promise<{ providerId: string }>;
  /**
   * Valida e traduz o webhook do provedor para InboundMessage.
   * Retorna null se o evento não for uma mensagem (ex.: status de entrega).
   */
  parseWebhook(
    headers: Record<string, string>,
    rawBody: string,
  ): Promise<InboundMessage | null>;
}

const adapters = new Map<ChannelKind, ChannelAdapter>();

export function registerChannel(adapter: ChannelAdapter): void {
  adapters.set(adapter.kind, adapter);
}

export function getChannel(kind: ChannelKind): ChannelAdapter {
  const adapter = adapters.get(kind);
  if (!adapter) throw new Error(`Canal não registrado: ${kind}`);
  if (!adapter.isConfigured()) {
    throw new Error(`Canal ${kind} sem credenciais.`);
  }
  return adapter;
}

export function configuredChannels(): ChannelAdapter[] {
  return [...adapters.values()].filter((a) => a.isConfigured());
}
