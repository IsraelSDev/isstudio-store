export type PricingModel = "one-time" | "subscription" | "custom";
export type ProductBadge = "novo" | "destaque" | "popular" | "enterprise";

export type CategorySlug =
  | "sistemas"
  | "apis"
  | "templates"
  | "plugins"
  | "licencas"
  | "saas"
  | "ia"
  | "white-label"
  | "hospedagem"
  | "assinaturas";

export interface Category {
  slug: CategorySlug;
  name: string;
  short: string;
  description: string;
  accent: string;
  icon: string;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  longDescription: string;
  category: CategorySlug;
  price: number;
  compareAt?: number;
  pricingModel: PricingModel;
  billingPeriod?: "month" | "year";
  badge?: ProductBadge;
  features: string[];
  includes: string[];
  stack: string[];
  delivery: string;
  rating: number;
  reviews: number;
  featured?: boolean;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export type PaymentMethod = "asaas" | "mercadopago" | "paypal";
