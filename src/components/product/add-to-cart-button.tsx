"use client";

import { ShoppingCart } from "lucide-react";
import type { Product } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/cart-context";

export function AddToCartButton({ product }: { product: Product }) {
  const { addItem } = useCart();

  return (
    <div className="flex flex-col sm:flex-row gap-2">
      <Button size="lg" className="flex-1" onClick={() => addItem(product)}>
        <ShoppingCart size={16} />
        Adicionar ao carrinho
      </Button>
      <Button
        size="lg"
        variant="secondary"
        className="flex-1"
        onClick={() => {
          addItem(product);
          window.location.href = "/checkout";
        }}
      >
        Comprar agora
      </Button>
    </div>
  );
}
