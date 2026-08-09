"use client";

import Link from "next/link";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { ShoppingBasket } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { formatHTG } from "@/lib/format";
import { CategoryIcon } from "@/lib/category-icons";
import { Button } from "@/components/ui/button";

export default function PanierPage() {
  const { groupedBySeller, updateQuantity, removeItem, total, count, loaded } = useCart();
  const { data: session } = useSession();

  if (!loaded) return null;

  if (count === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <ShoppingBasket className="mx-auto h-12 w-12 text-muted-foreground" strokeWidth={1} />
        <h1 className="mt-4 font-heading text-xl font-bold">Votre panier est vide</h1>
        <Button className="mt-6" nativeButton={false} render={<Link href="/catalogue">Voir le catalogue</Link>} />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="mb-6 font-heading text-2xl font-bold">Votre panier</h1>

      <div className="flex flex-col gap-6">
        {groupedBySeller.map((group) => (
          <div key={group.sellerId} className="rounded-lg border border-border bg-card">
            <div className="border-b border-border px-4 py-2.5 text-sm font-medium">
              Vendu par {group.sellerName}
            </div>
            <div className="flex flex-col divide-y divide-border">
              {group.items.map((item) => {
                return (
                  <div key={item.productId} className="flex items-center gap-4 p-4">
                    <div className="relative flex h-16 w-16 shrink-0 items-center justify-center rounded-md border border-border bg-muted">
                      {item.image ? (
                        <Image
                          src={item.image}
                          alt=""
                          fill
                          sizes="64px"
                          className="rounded-md object-cover"
                        />
                      ) : (
                        <CategoryIcon
                          slug={item.categorySlug}
                          className="h-6 w-6 text-muted-foreground"
                          strokeWidth={1.25}
                        />
                      )}
                    </div>
                    <div className="flex-1">
                      <Link href={`/produits/${item.slug}`} className="text-sm font-medium hover:text-primary">
                        {item.name}
                      </Link>
                      <p className="font-mono text-sm text-muted-foreground">
                        {formatHTG(item.priceHTG)} / unité
                      </p>
                    </div>
                    <div className="flex items-center rounded-lg border border-input">
                      <button
                        type="button"
                        className="px-3 py-1.5"
                        aria-label={`Diminuer la quantité de ${item.name}`}
                        onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                      >
                        −
                      </button>
                      <span className="w-8 text-center text-sm" aria-live="polite">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        className="px-3 py-1.5"
                        aria-label={`Augmenter la quantité de ${item.name}`}
                        disabled={item.quantity >= item.maxStock}
                        onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                      >
                        +
                      </button>
                    </div>
                    <span className="w-24 text-right font-mono text-sm font-semibold">
                      {formatHTG(item.priceHTG * item.quantity)}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeItem(item.productId)}
                      className="text-muted-foreground hover:text-destructive"
                      aria-label="Retirer"
                    >
                      ✕
                    </button>
                  </div>
                );
              })}
            </div>
            <div className="flex justify-end border-t border-border px-4 py-2.5 text-sm">
              Sous-total : <span className="ml-2 font-mono font-semibold">{formatHTG(group.subtotal)}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 flex flex-col items-end gap-3 border-t border-border pt-6">
        <div className="font-mono text-xl font-bold">Total : {formatHTG(total)}</div>
        <Button
          size="lg"
          nativeButton={false}
          render={<Link href={session ? "/commande" : "/connexion?next=/commande"}>Passer la commande</Link>}
        />
      </div>
    </div>
  );
}
