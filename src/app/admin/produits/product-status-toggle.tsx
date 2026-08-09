"use client";

import { useTransition } from "react";
import { setProductStatusAsAdmin } from "@/lib/actions/admin";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const LABEL: Record<string, string> = { ACTIF: "Actif", INACTIF: "Suspendu", EN_RUPTURE: "En rupture" };
const VARIANT: Record<string, "default" | "secondary" | "destructive"> = {
  ACTIF: "default",
  INACTIF: "destructive",
  EN_RUPTURE: "secondary",
};

export function ProductStatusToggle({ productId, status }: { productId: string; status: string }) {
  const [isPending, startTransition] = useTransition();

  return (
    <div className="flex items-center gap-2">
      <Badge variant={VARIANT[status] ?? "secondary"}>{LABEL[status] ?? status}</Badge>
      {status === "ACTIF" ? (
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={isPending}
          onClick={() => startTransition(() => setProductStatusAsAdmin(productId, "INACTIF"))}
        >
          Suspendre
        </Button>
      ) : (
        status !== "EN_RUPTURE" && (
          <Button
            type="button"
            size="sm"
            disabled={isPending}
            onClick={() => startTransition(() => setProductStatusAsAdmin(productId, "ACTIF"))}
          >
            Réactiver
          </Button>
        )
      )}
    </div>
  );
}
