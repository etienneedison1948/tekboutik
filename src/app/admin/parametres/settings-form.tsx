"use client";

import { useState } from "react";
import { updatePlatformSettings } from "@/lib/actions/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Settings = {
  commissionRatePercent: number;
  moncashNumber: string | null;
  natcashNumber: string | null;
};

export function SettingsForm({ settings }: { settings: Settings }) {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setPending(true);
    const formData = new FormData(e.currentTarget);
    const result = await updatePlatformSettings(formData);
    setPending(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    setSuccess(true);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="commissionRatePercent">Taux de commission (%)</Label>
        <Input
          id="commissionRatePercent"
          name="commissionRatePercent"
          type="number"
          step="0.1"
          min={0}
          max={100}
          defaultValue={settings.commissionRatePercent}
          required
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="moncashNumber">Numéro MonCash de la plateforme</Label>
        <Input
          id="moncashNumber"
          name="moncashNumber"
          placeholder="+509 xxxx xxxx"
          defaultValue={settings.moncashNumber ?? ""}
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="natcashNumber">Numéro NatCash de la plateforme</Label>
        <Input
          id="natcashNumber"
          name="natcashNumber"
          placeholder="+509 xxxx xxxx"
          defaultValue={settings.natcashNumber ?? ""}
        />
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      {success && <p className="text-sm text-primary">Paramètres enregistrés.</p>}
      <Button type="submit" disabled={pending} className="w-fit">
        {pending ? "Enregistrement..." : "Enregistrer"}
      </Button>
    </form>
  );
}
