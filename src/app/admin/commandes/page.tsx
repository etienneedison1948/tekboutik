import Link from "next/link";
import { prisma } from "@/lib/db";
import { formatHTG } from "@/lib/format";
import { ORDER_STATUS_LABEL, ORDER_STATUS_VARIANT } from "@/lib/order-status";
import { Badge } from "@/components/ui/badge";

export const metadata = { title: "Commandes — Administration TekBoutik" };
export const dynamic = "force-dynamic";

export default async function AdminCommandesPage() {
  const orders = await prisma.order.findMany({
    include: {
      buyer: { select: { name: true, email: true } },
      items: { select: { quantity: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="font-heading text-2xl font-bold">Commandes</h1>
      <p className="mt-1 text-sm text-muted-foreground">{orders.length} commande(s) au total</p>

      <div className="mt-6 flex flex-col gap-3">
        {orders.map((order) => {
          const itemCount = order.items.reduce((sum, i) => sum + i.quantity, 0);
          return (
            <Link
              key={order.id}
              href={`/admin/commandes/${order.id}`}
              className="flex items-center justify-between gap-4 rounded-lg border border-border bg-card p-4 hover:border-primary"
            >
              <div>
                <p className="text-sm font-medium">
                  {order.buyer.name} — {formatHTG(order.total)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {itemCount} article{itemCount > 1 ? "s" : ""} ·{" "}
                  {new Date(order.createdAt).toLocaleDateString("fr-HT")}
                </p>
              </div>
              <Badge variant={ORDER_STATUS_VARIANT[order.status]}>
                {ORDER_STATUS_LABEL[order.status]}
              </Badge>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
