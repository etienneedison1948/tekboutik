import { prisma } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SellerStatusControls } from "./seller-status-controls";

export const metadata = { title: "Vendeurs — Administration TekBoutik" };
export const dynamic = "force-dynamic";

export default async function AdminVendeursPage() {
  const sellers = await prisma.sellerProfile.findMany({
    include: { user: true, _count: { select: { products: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="font-heading text-2xl font-bold">Vendeurs</h1>

      {sellers.length === 0 ? (
        <p className="mt-6 text-muted-foreground">Aucune candidature vendeur pour le moment.</p>
      ) : (
        <div className="mt-6 flex flex-col gap-4">
          {sellers.map((seller) => (
            <Card key={seller.id}>
              <CardHeader className="flex flex-row items-start justify-between gap-4">
                <div>
                  <CardTitle>{seller.shopName}</CardTitle>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {seller.user.name} · {seller.user.email}
                  </p>
                </div>
                <SellerStatusControls sellerId={seller.id} status={seller.status} />
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                <p>{seller.description}</p>
                <div className="mt-3 flex flex-wrap gap-4 font-mono text-xs">
                  {seller.moncashNumber && <span>MonCash : {seller.moncashNumber}</span>}
                  {seller.natcashNumber && <span>NatCash : {seller.natcashNumber}</span>}
                  <span>{seller._count.products} produit(s)</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
