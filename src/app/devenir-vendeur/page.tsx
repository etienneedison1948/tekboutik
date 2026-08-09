"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { applyAsSeller } from "@/lib/actions/seller";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function DevenirVendeurPage() {
  const router = useRouter();
  const { update } = useSession();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setPending(true);

    const formData = new FormData(e.currentTarget);
    const result = await applyAsSeller(formData);

    if (result.error) {
      setError(result.error);
      setPending(false);
      return;
    }

    // update() sans argument reste un GET (pas de rafraîchissement du rôle
    // côté serveur) ; passer un objet force le POST qui déclenche trigger:"update".
    await update({});
    router.push("/vendeur");
    router.refresh();
  }

  return (
    <div className="mx-auto flex max-w-lg flex-col justify-center px-4 py-16">
      <Card>
        <CardHeader>
          <CardTitle className="font-heading text-2xl">Devenir vendeur</CardTitle>
          <CardDescription>
            Créez votre boutique sur TekBoutik. Votre candidature sera examinée par
            l&apos;équipe avant activation.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="shopName">Nom de la boutique</Label>
              <Input id="shopName" name="shopName" required />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                required
                rows={4}
                placeholder="Ce que vous vendez, depuis quand, etc."
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="moncashNumber">Numéro MonCash (optionnel)</Label>
              <Input id="moncashNumber" name="moncashNumber" placeholder="+509 xxxx xxxx" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="natcashNumber">Numéro NatCash (optionnel)</Label>
              <Input id="natcashNumber" name="natcashNumber" placeholder="+509 xxxx xxxx" />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" disabled={pending} className="mt-2">
              {pending ? "Envoi..." : "Envoyer ma candidature"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
