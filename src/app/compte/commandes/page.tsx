import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { formatHTG } from "@/lib/format";
import { ORDER_STATUS_LABEL, ORDER_STATUS_VARIANT } from "@/lib/order-status";
import { Badge } from "@/components/ui/badge";

export const metadata = { title: "Mes commandes — TekBoutik" };
export const dynamic = "force-dynamic";

export default async function CommandesPage() {
  const session = await auth();
  const orders = await prisma.order.findMany({
    where: { buyerId: session!.user.id },
    include: { items: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="font-heading text-2xl font-bold">Mes commandes</h1>

      {orders.length === 0 ? (
        <p className="mt-6 text-muted-foreground">Vous n&apos;avez pas encore de commande.</p>
      ) : (
        <div className="mt-6 flex flex-col gap-3">
          {orders.map((order) => {
            const itemCount = order.items.reduce((sum, i) => sum + i.quantity, 0);
            return (
              <Link
                key={order.id}
                href={`/compte/commandes/${order.id}`}
                className="flex items-center justify-between rounded-lg border border-border bg-card p-4 hover:border-primary"
              >
                <div>
                  <p className="text-sm font-medium">
                    Commande du{" "}
                    {new Date(order.createdAt).toLocaleDateString("fr-HT", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {itemCount} article{itemCount > 1 ? "s" : ""} · {formatHTG(order.total)}
                  </p>
                </div>
                <Badge variant={ORDER_STATUS_VARIANT[order.status]}>
                  {ORDER_STATUS_LABEL[order.status]}
                </Badge>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
