"use client";

import { useState, useTransition } from "react";
import { setSellerStatus } from "@/lib/actions/admin";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { SellerStatus } from "@/generated/prisma/enums";

const STATUS_LABEL: Record<SellerStatus, string> = {
  EN_ATTENTE: "En attente",
  APPROUVE: "Approuvé",
  SUSPENDU: "Suspendu",
};

const STATUS_VARIANT: Record<SellerStatus, "secondary" | "default" | "destructive"> = {
  EN_ATTENTE: "secondary",
  APPROUVE: "default",
  SUSPENDU: "destructive",
};

export function SellerStatusControls({
  sellerId,
  status,
}: {
  sellerId: string;
  status: SellerStatus;
}) {
  const [current, setCurrent] = useState(status);
  const [isPending, startTransition] = useTransition();

  function updateStatus(next: SellerStatus) {
    startTransition(async () => {
      await setSellerStatus(sellerId, next);
      setCurrent(next);
    });
  }

  return (
    <div className="flex shrink-0 items-center gap-2">
      <Badge variant={STATUS_VARIANT[current]}>{STATUS_LABEL[current]}</Badge>
      {current !== "APPROUVE" && (
        <Button size="sm" disabled={isPending} onClick={() => updateStatus("APPROUVE")}>
          Approuver
        </Button>
      )}
      {current !== "SUSPENDU" && (
        <Button
          size="sm"
          variant="outline"
          disabled={isPending}
          onClick={() => updateStatus("SUSPENDU")}
        >
          Suspendre
        </Button>
      )}
    </div>
  );
}
