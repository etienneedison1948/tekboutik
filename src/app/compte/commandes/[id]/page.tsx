import { notFound } from "next/navigation";
import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { formatHTG } from "@/lib/format";
import { ORDER_STATUS_LABEL, ORDER_STATUS_VARIANT } from "@/lib/order-status";
import { Badge } from "@/components/ui/badge";
import { PaymentPanel } from "./payment-panel";

export const metadata = { title: "Détail de la commande — TekBoutik" };

export default async function CommandeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      items: {
        include: {
          product: { select: { name: true, slug: true, images: true } },
          seller: { select: { shopName: true } },
        },
      },
      payment: true,
    },
  });

  if (!order || order.buyerId !== session!.user.id) notFound();

  const shippingAddress = order.shippingAddress as {
    label: string;
    fullName: string;
    street: string;
    city: string;
    phone: string;
  };

  const bySeller = new Map<string, typeof order.items>();
  for (const item of order.items) {
    const list = bySeller.get(item.seller.shopName) ?? [];
    list.push(item);
    bySeller.set(item.seller.shopName, list);
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-bold">Commande</h1>
        <Badge variant={ORDER_STATUS_VARIANT[order.status]}>
          {ORDER_STATUS_LABEL[order.status]}
        </Badge>
      </div>
      <p className="mt-1 font-mono text-xs text-muted-foreground">{order.id}</p>

      {order.status !== "ANNULE" && (
        <PaymentPanel orderId={order.id} total={order.total} payment={order.payment} />
      )}

      <section className="mt-6 rounded-lg border border-border bg-card p-4">
        <h2 className="text-sm font-medium">Livraison</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {shippingAddress.fullName}
          <br />
          {shippingAddress.street}, {shippingAddress.city}
          <br />
          {shippingAddress.phone}
        </p>
      </section>

      <section className="mt-4 flex flex-col gap-4">
        {Array.from(bySeller.entries()).map(([sellerName, items]) => (
          <div key={sellerName} className="rounded-lg border border-border bg-card p-4">
            <p className="text-sm font-medium">{sellerName}</p>
            <ul className="mt-2 flex flex-col gap-1 text-sm text-muted-foreground">
              {items.map((item) => (
                <li key={item.id} className="flex justify-between">
                  <Link href={`/produits/${item.product.slug}`} className="hover:text-primary">
                    {item.product.name} × {item.quantity}
                  </Link>
                  <span className="font-mono">{formatHTG(item.unitPrice * item.quantity)}</span>
                </li>
              ))}
            </ul>
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
