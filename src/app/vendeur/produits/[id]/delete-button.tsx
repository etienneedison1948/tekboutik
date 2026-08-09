"use client";

import { useState, useTransition } from "react";
import { unstable_rethrow } from "next/navigation";
import { Button } from "@/components/ui/button";
import { deleteProduct } from "@/lib/actions/products";

export function DeleteProductButton({ productId }: { productId: string }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleDelete() {
    if (!confirm("Supprimer définitivement ce produit ?")) return;
    setError(null);
    startTransition(async () => {
      try {
        await deleteProduct(productId);
      } catch (err) {
        unstable_rethrow(err);
        setError(err instanceof Error ? err.message : "Échec de la suppression.");
      }
    });
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <Button type="button" variant="outline" disabled={isPending} onClick={handleDelete}>
        {isPending ? "Suppression..." : "Supprimer"}
      </Button>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
