"use client";

import { useTransition } from "react";
import { deleteAddress, setDefaultAddress } from "@/lib/actions/addresses";
import { Button } from "@/components/ui/button";

export function AddressControls({ addressId, isDefault }: { addressId: string; isDefault: boolean }) {
  const [isPending, startTransition] = useTransition();

  return (
    <div className="flex gap-2">
      {!isDefault && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={isPending}
          onClick={() => startTransition(() => setDefaultAddress(addressId))}
        >
          Définir par défaut
        </Button>
      )}
      <Button
        type="button"
        variant="ghost"
        size="sm"
        disabled={isPending}
        onClick={() => {
          if (confirm("Supprimer cette adresse ?")) {
            startTransition(() => deleteAddress(addressId));
          }
        }}
      >
        Supprimer
      </Button>
    </div>
  );
}
