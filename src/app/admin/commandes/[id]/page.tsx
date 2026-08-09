import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { formatHTG } from "@/lib/format";
import { ORDER_STATUS_LABEL, ORDER_STATUS_VARIANT } from "@/lib/order-status";
import { Badge } from "@/components/ui/badge";

export const metadata = { title: "Détail de la commande — Administration TekBoutik" };

export default async function AdminCommandeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      buyer: { select: { name: true, email: true, phone: true } },
      payment: true,
      items: {
        include: {
          product: { select: { name: true, slug: true } },
          seller: { select: { shopName: true } },
        },
      },
    },
  });

  if (!order) notFound();

  const shippingAddress = order.shippingAddress as {
    fullName: string;
    street: string;
    city: string;
    phone: string;
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-bold">Commande</h1>
        <Badge variant={ORDER_STATUS_VARIANT[order.status]}>
          {ORDER_STATUS_LABEL[order.status]}
        </Badge>
      </div>
      <p className="mt-1 font-mono text-xs text-muted-foreground">{order.id}</p>

      <section className="mt-6 rounded-lg border border-border bg-card p-4 text-sm">
        <h2 className="font-medium">Acheteur</h2>
        <p className="mt-1 text-muted-foreground">
          {order.buyer.name} · {order.buyer.email}
          {order.buyer.phone && ` · ${order.buyer.phone}`}
        </p>
      </section>

      <section className="mt-4 rounded-lg border border-border bg-card p-4 text-sm">
        <h2 className="font-medium">Livraison</h2>
        <p className="mt-1 text-muted-foreground">
          {shippingAddress.fullName}
          <br />
          {shippingAddress.street}, {shippingAddress.city}
          <br />
          {shippingAddress.phone}
        </p>
      </section>

      {order.payment && (
        <section className="mt-4 rounded-lg border border-border bg-card p-4 text-sm">
          <h2 className="font-medium">Paiement</h2>
          <p className="mt-1 text-muted-foreground">
            {order.payment.method === "MONCASH" ? "MonCash" : "NatCash"} · {order.payment.status}
            <br />
            Référence : <span className="font-mono">{order.payment.transactionRef}</span>
          </p>
        </section>
      )}

      <section className="mt-4 flex flex-col gap-3">
        {order.items.map((item) => (
          <div key={item.id} className="flex items-center justify-between rounded-lg border border-border bg-card p-3 text-sm">
            <div>
              <Link href={`/produits/${item.product.slug}`} className="font-medium hover:text-primary">
                {item.product.name}
              </Link>
              <p className="text-xs text-muted-foreground">
                {item.seller.shopName} · × {item.quantity}
              </p>
            </div>
            <span className="font-mono">{formatHTG(item.unitPrice * item.quantity)}</span>
          </div>
        ))}
      </section>

      <div className="mt-6 flex justify-between border-t border-border pt-4 font-mono text-lg font-bold">
        <span>Total</span>
        <span>{formatHTG(order.total)}</span>
      </div>
    </div>
  );
}
