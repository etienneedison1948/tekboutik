"use client";

import { useTransition } from "react";
import { setOrderItemStatus } from "@/lib/actions/seller-orders";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const STATUS_LABEL: Record<string, string> = {
  EN_PREPARATION: "En préparation",
  EXPEDIE: "Expédiée",
  LIVRE: "Livrée",
  ANNULE: "Annulée",
};

const NEXT_STATUS: Record<string, { next: "EXPEDIE" | "LIVRE"; label: string } | undefined> = {
  EN_PREPARATION: { next: "EXPEDIE", label: "Marquer expédiée" },
  EXPEDIE: { next: "LIVRE", label: "Marquer livrée" },
};

export function ItemStatusControl({
  orderItemId,
  status,
  payable,
}: {
  orderItemId: string;
  status: string;
  payable: boolean;
}) {
  const [isPending, startTransition] = useTransition();
  const next = NEXT_STATUS[status];

  return (
    <div className="flex items-center gap-2">
      <Badge variant="secondary">{STATUS_LABEL[status] ?? status}</Badge>
      {payable && next && (
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={isPending}
          onClick={() => startTransition(() => setOrderItemStatus(orderItemId, next.next))}
        >
          {next.label}
        </Button>
      )}
    </div>
  );
}
