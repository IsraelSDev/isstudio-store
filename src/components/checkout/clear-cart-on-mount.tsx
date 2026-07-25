"use client";

import { useEffect } from "react";
import { useCart } from "@/context/cart-context";

/** Limpa o carrinho ao chegar na página de sucesso do Mercado Pago */
export function ClearCartOnMount() {
  const { clear } = useCart();

  useEffect(() => {
    clear();
  }, [clear]);

  return null;
}
