export type PlanId = "studio-plus" | "studio-annual";

export interface Entitlements {
  plan: PlanId;
  unlimitedTemplates: boolean;
  apiCreditsPerMonth: number;
  catalogDiscount: number;
  prioritySupport: boolean;
  earlyAccess: boolean;
}

export const plans: Record<PlanId, Entitlements> = {
  "studio-plus": {
    plan: "studio-plus",
    unlimitedTemplates: true,
    apiCreditsPerMonth: 50_000,
    catalogDiscount: 0.2,
    prioritySupport: true,
    earlyAccess: false,
  },
  "studio-annual": {
    plan: "studio-annual",
    unlimitedTemplates: true,
    apiCreditsPerMonth: 100_000,
    catalogDiscount: 0.2,
    prioritySupport: true,
    earlyAccess: true,
  },
};

export function discountedPrice(listPrice: number, plan: PlanId): number {
  const { catalogDiscount } = plans[plan];
  return Math.round(listPrice * (1 - catalogDiscount));
}
