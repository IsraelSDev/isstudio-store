export interface Product {
  id: string;
  slug: string;
  name: string;
  description: string;
  price: number;
  image?: string;
}

export const products: Product[] = [
  {
    id: "prod-1",
    slug: "camiseta-essencial",
    name: "Camiseta Essencial",
    description: "Algodão premium, caimento reto.",
    price: 129,
  },
  {
    id: "prod-2",
    slug: "moletom-oversized",
    name: "Moletom Oversized",
    description: "Fleece interno, gola careca.",
    price: 279,
  },
  {
    id: "prod-3",
    slug: "bone-dad-hat",
    name: "Boné Dad Hat",
    description: "Ajuste de metal, aba curva.",
    price: 89,
  },
];

export function getProduct(slug: string) {
  return products.find((p) => p.slug === slug);
}

export function formatPrice(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 0,
  }).format(value);
}