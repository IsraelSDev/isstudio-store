export type Trigger =
  | { type: "any" }
  | { type: "collection"; collectionId: string }
  | { type: "min_subtotal"; amount: number }
  | { type: "tag"; tag: string };

export interface UpsellVariant {
  id: string;
  productId: string;
  weight: number;
}

export interface UpsellCampaign {
  id: string;
  name: string;
  active: boolean;
  trigger: Trigger;
  variants: UpsellVariant[];
}

export interface CartContext {
  collectionIds: string[];
  tags: string[];
  subtotal: number;
}

export function matchesTrigger(trigger: Trigger, cart: CartContext): boolean {
  switch (trigger.type) {
    case "any":
      return true;
    case "collection":
      return cart.collectionIds.includes(trigger.collectionId);
    case "min_subtotal":
      return cart.subtotal >= trigger.amount;
    case "tag":
      return cart.tags.includes(trigger.tag);
    default:
      return false;
  }
}

/** Sorteio ponderado. Pesos relativos: 70 e 30 → ~70%/30%. */
export function pickVariant(variants: UpsellVariant[]): UpsellVariant | null {
  const eligible = variants.filter((v) => v.weight > 0);
  if (eligible.length === 0) return null;

  const total = eligible.reduce((sum, v) => sum + v.weight, 0);
  let cursor = Math.random() * total;

  for (const variant of eligible) {
    cursor -= variant.weight;
    if (cursor <= 0) return variant;
  }
  return eligible[eligible.length - 1];
}

export function resolveOffer(
  campaigns: UpsellCampaign[],
  cart: CartContext,
): UpsellVariant | null {
  const campaign = campaigns.find(
    (c) => c.active && matchesTrigger(c.trigger, cart),
  );
  if (!campaign) return null;
  return pickVariant(campaign.variants);
}
