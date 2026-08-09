"use client";

import { useTransition } from "react";
import { confirmOrderPayment, rejectOrderPayment } from "@/lib/actions/admin";
import { Button } from "@/components/ui/button";

export function PaymentActions({ orderId }: { orderId: string }) {
  const [isPending, startTransition] = useTransition();

  return (
    <div className="flex gap-2">
      <Button
        type="button"
        size="sm"
        disabled={isPending}
        onClick={() => startTransition(() => confirmOrderPayment(orderId))}
      >
        Confirmer
      </Button>
      <Button
        type="button"
        size="sm"
        variant="outline"
        disabled={isPending}
        onClick={() => startTransition(() => rejectOrderPayment(orderId))}
      >
        Rejeter
      </Button>
    </div>
  );
}
