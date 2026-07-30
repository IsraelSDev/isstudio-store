"use client";

import type { Product } from "@/lib/catalog";
import { useCart } from "@/store/cart";

export function AddToCartButton({ product }: { product: Product }) {
  const add = useCart((s) => s.add);

  return (
    <button
      type="button"
      onClick={() =>
        add({ id: product.id, name: product.name, price: product.price })
      }
      className="w-full rounded-xl bg-neutral-900 px-4 py-2.5 text-sm font-medium text-white"
    >
      Adicionar ao carrinho
    </button>
  );
}