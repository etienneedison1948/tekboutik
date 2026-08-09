import Link from "next/link";
import { prisma } from "@/lib/db";
import { formatHTG } from "@/lib/format";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata = { title: "Administration — TekBoutik" };
export const dynamic = "force-dynamic";

const PAID_STATUSES = ["PAYE", "EN_PREPARATION", "EXPEDIE", "LIVRE"] as const;

export default async function AdminPage() {
  const [
    userCount,
    sellerCount,
    productCount,
    categoryCount,
    settings,
    paidOrderCount,
    paidOrders,
    topItems,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.sellerProfile.count(),
    prisma.product.count(),
    prisma.category.count(),
    prisma.platformSettings.findUnique({ where: { id: 1 } }),
    prisma.order.count({ where: { status: { in: [...PAID_STATUSES] } } }),
    prisma.order.findMany({
      where: { status: { in: [...PAID_STATUSES] } },
      select: { total: true },
    }),
    prisma.orderItem.groupBy({
      by: ["productId"],
      where: { order: { status: { in: [...PAID_STATUSES] } } },
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: "desc" } },
      take: 5,
    }),
  ]);

  const revenue = paidOrders.reduce((sum, o) => sum + o.total, 0);
  const commissionRate = settings?.commissionRatePercent ?? 0;
  const commissionRevenue = Math.round((revenue * commissionRate) / 100);

  const topProducts = await prisma.product.findMany({
    where: { id: { in: topItems.map((i) => i.productId) } },
    select: { id: true, name: true, slug: true },
  });
  const topProductsWithQty = topItems.map((item) => ({
    ...topProducts.find((p) => p.id === item.productId)!,
    quantity: item._sum.quantity ?? 0,
  }));

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="font-heading text-2xl font-bold">Administration</h1>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Stat value={userCount} label="Utilisateurs" />
        <Stat value={sellerCount} label="Vendeurs" />
        <Stat value={productCount} label="Produits" />
        <Stat value={categoryCount} label="Catégories" />
        <Stat value={paidOrderCount} label="Commandes payées" />
        <Stat value={formatHTG(revenue)} label="Chiffre d'affaires" />
        <Stat value={`${commissionRate}%`} label="Taux de commission" />
        <Stat value={formatHTG(commissionRevenue)} label="Revenus plateforme" />
      </div>

      {topProductsWithQty.length > 0 && (
        <div className="mt-8">
          <h2 className="mb-3 font-heading text-lg font-bold">Meilleures ventes</h2>
          <div className="flex flex-col divide-y divide-border rounded-lg border border-border bg-card">
            {topProductsWithQty.map((p) => (
              <Link
                key={p.id}
                href={`/produits/${p.slug}`}
                className="flex items-center justify-between p-3 text-sm hover:bg-muted"
              >
                <span>{p.name}</span>
                <span className="font-mono text-muted-foreground">{p.quantity} vendus</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3">
        <AdminLink href="/admin/vendeurs" label="Vendeurs" />
        <AdminLink href="/admin/produits" label="Produits" />
        <AdminLink href="/admin/commandes" label="Commandes" />
        <AdminLink href="/admin/paiements" label="Paiements" />
        <AdminLink href="/admin/avis" label="Avis" />
        <AdminLink href="/admin/categories" label="Catégories" />
        <AdminLink href="/admin/parametres" label="Paramètres" />
      </div>
    </div>
  );
}

function Stat({ value, label }: { value: string | number; label: string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-mono text-2xl">{value}</CardTitle>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground">{label}</CardContent>
    </Card>
  );
}

function AdminLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="rounded-lg border border-border bg-card p-4 text-center text-sm font-medium hover:border-primary"
    >
      {label}
    </Link>
  );
}
