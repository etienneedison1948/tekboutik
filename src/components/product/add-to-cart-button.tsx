"use client";

import { useState } from "react";
import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart, type CartProductInput } from "@/lib/cart-context";

export function AddToCartButton({
  product,
  quantity = 1,
  className,
  size = "sm",
}: {
  product: CartProductInput;
  quantity?: number;
  className?: string;
  size?: "sm" | "default" | "lg";
}) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    addItem(product, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  }

  return (
    <Button
      type="button"
      size={size}
      variant={added ? "secondary" : "default"}
      disabled={product.stock === 0}
      onClick={handleClick}
      className={className}
    >
      <ShoppingCart className="h-4 w-4" />
      {product.stock === 0 ? "Rupture" : added ? "Ajouté ✓" : "Ajouter au panier"}
    </Button>
  );
}
