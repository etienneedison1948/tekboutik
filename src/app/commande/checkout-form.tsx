"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCart } from "@/lib/cart-context";
import { formatHTG } from "@/lib/format";
import { createOrder } from "@/lib/actions/orders";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Address = {
  id: string;
  label: string;
  fullName: string;
  street: string;
  city: string;
  phone: string;
  isDefault: boolean;
};

export function CheckoutForm({ addresses }: { addresses: Address[] }) {
  const router = useRouter();
  const { groupedBySeller, items, total, count, clearCart, loaded } = useCart();

  const defaultAddress = addresses.find((a) => a.isDefault) ?? addresses[0];
  const [addressId, setAddressId] = useState<string>(defaultAddress?.id ?? "");
  const [useNewAddress, setUseNewAddress] = useState(addresses.length === 0);
  const [newAddress, setNewAddress] = useState({
    label: "",
    fullName: "",
    street: "",
    city: "",
    phone: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  if (!loaded) return null;

  if (count === 0) {
    return (
      <div className="text-center">
        <p className="text-muted-foreground">Votre panier est vide.</p>
        <Button className="mt-4" nativeButton={false} render={<Link href="/catalogue">Voir le catalogue</Link>} />
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);

    const result = await createOrder({
      addressId: useNewAddress ? undefined : addressId,
      newAddress: useNewAddress ? newAddress : undefined,
      items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
    });

    setPending(false);

    if ("error" in result) {
      setError(result.error);
      return;
    }

    clearCart();
    router.push(`/compte/commandes/${result.orderId}`);
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-8 sm:grid-cols-[1fr_320px]">
      <div className="flex flex-col gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Adresse de livraison</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {addresses.map((address) => (
              <label
                key={address.id}
                className="flex items-start gap-3 rounded-lg border border-border p-3 text-sm has-[:checked]:border-primary"
              >
                <input
                  type="radio"
                  name="address"
                  checked={!useNewAddress && addressId === address.id}
                  onChange={() => {
                    setUseNewAddress(false);
                    setAddressId(address.id);
                  }}
                  className="mt-1"
                />
                <span>
                  <span className="font-medium">{address.label}</span> — {address.fullName}
                  <br />
                  {address.street}, {address.city} · {address.phone}
                </span>
              </label>
            ))}

            <label className="flex items-center gap-3 rounded-lg border border-border p-3 text-sm has-[:checked]:border-primary">
              <input
                type="radio"
                name="address"
                checked={useNewAddress}
                onChange={() => setUseNewAddress(true)}
              />
              Nouvelle adresse
            </label>

            {useNewAddress && (
              <div className="grid gap-3 rounded-lg bg-muted p-3 sm:grid-cols-2">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="na-label">Nom de l&apos;adresse</Label>
                  <Input
                    id="na-label"
                    required
                    value={newAddress.label}
                    onChange={(e) => setNewAddress({ ...newAddress, label: e.target.value })}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="na-fullName">Nom complet</Label>
                  <Input
                    id="na-fullName"
                    required
                    value={newAddress.fullName}
                    onChange={(e) => setNewAddress({ ...newAddress, fullName: e.target.value })}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="na-street">Adresse</Label>
                  <Input
                    id="na-street"
                    required
                    value={newAddress.street}
                    onChange={(e) => setNewAddress({ ...newAddress, street: e.target.value })}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="na-city">Ville</Label>
                  <Input
                    id="na-city"
                    required
                    value={newAddress.city}
                    onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="na-phone">Téléphone</Label>
                  <Input
                    id="na-phone"
                    type="tel"
                    required
                    value={newAddress.phone}
                    onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })}
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Récapitulatif</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {groupedBySeller.map((group) => (
              <div key={group.sellerId}>
                <p className="text-sm font-medium">{group.sellerName}</p>
                <ul className="mt-1 flex flex-col gap-1 text-sm text-muted-foreground">
                  {group.items.map((item) => (
                    <li key={item.productId} className="flex justify-between">
                      <span>
                        {item.name} × {item.quantity}
                      </span>
                      <span className="font-mono">{formatHTG(item.priceHTG * item.quantity)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="self-start rounded-lg border border-border bg-card p-4">
        <div className="flex justify-between font-mono text-lg font-bold">
          <span>Total</span>
          <span>{formatHTG(total)}</span>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          Paiement MonCash/NatCash à l&apos;étape suivante.
        </p>
        {error && <p className="mt-3 text-sm text-destructive">{error}</p>}
        <Button type="submit" disabled={pending} className="mt-4 w-full">
          {pending ? "Création de la commande..." : "Confirmer la commande"}
        </Button>
      </div>
    </form>
  );
}
