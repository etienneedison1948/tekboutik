import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { formatHTG } from "@/lib/format";
import { ORDER_STATUS_LABEL, ORDER_STATUS_VARIANT } from "@/lib/order-status";
import { Badge } from "@/components/ui/badge";
import { ItemStatusControl } from "./item-status-control";

export const metadata = { title: "Commandes reçues — TekBoutik" };
export const dynamic = "force-dynamic";

export default async function VendeurCommandesPage() {
  const session = await auth();
  const sellerProfile = await prisma.sellerProfile.findUnique({
    where: { userId: session!.user.id },
  });
  if (!sellerProfile || sellerProfile.status !== "APPROUVE") redirect("/vendeur");

  const items = await prisma.orderItem.findMany({
    where: { sellerId: sellerProfile.id },
    include: {
      product: { select: { name: true, slug: true } },
      order: { select: { id: true, status: true, createdAt: true, buyer: { select: { name: true } } } },
    },
    orderBy: { order: { createdAt: "desc" } },
  });

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="font-heading text-2xl font-bold">Commandes reçues</h1>

      {items.length === 0 ? (
        <p className="mt-6 text-muted-foreground">Aucune commande reçue pour le moment.</p>
      ) : (
        <div className="mt-6 flex flex-col gap-3">
          {items.map((item) => {
            const payable = !["EN_ATTENTE_PAIEMENT", "ANNULE"].includes(item.order.status);
            return (
              <div
                key={item.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-card p-4"
              >
                <div>
                  <p className="text-sm font-medium">
                    {item.product.name} × {item.quantity}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {item.order.buyer.name} ·{" "}
                    {new Date(item.order.createdAt).toLocaleDateString("fr-HT")} ·{" "}
                    {formatHTG(item.unitPrice * item.quantity)}
                  </p>
                  <Badge variant={ORDER_STATUS_VARIANT[item.order.status]} className="mt-1">
                    Commande : {ORDER_STATUS_LABEL[item.order.status]}
                  </Badge>
                </div>
                <ItemStatusControl orderItemId={item.id} status={item.status} payable={payable} />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
