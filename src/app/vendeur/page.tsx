import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { formatHTG } from "@/lib/format";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const metadata = { title: "Espace vendeur — TekBoutik" };
export const dynamic = "force-dynamic";

export default async function VendeurPage() {
  const session = await auth();
  const sellerProfile = await prisma.sellerProfile.findUnique({
    where: { userId: session!.user.id },
    include: { _count: { select: { products: true } } },
  });

  if (!sellerProfile) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <p className="text-muted-foreground">Aucun profil vendeur trouvé.</p>
      </div>
    );
  }

  if (sellerProfile.status === "EN_ATTENTE") {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16">
        <Card>
          <CardHeader>
            <CardTitle className="font-heading text-2xl">Candidature en attente</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            <p>
              Votre boutique <strong>{sellerProfile.shopName}</strong> a bien été soumise.
              Un administrateur doit l&apos;approuver avant que vous puissiez ajouter des
              produits.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (sellerProfile.status === "SUSPENDU") {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16">
        <Card>
          <CardHeader>
            <CardTitle className="font-heading text-2xl text-destructive">
              Boutique suspendue
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            <p>
              Votre boutique <strong>{sellerProfile.shopName}</strong> est actuellement
              suspendue. Contactez l&apos;administration pour plus d&apos;informations.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const paidItems = await prisma.orderItem.findMany({
    where: {
      sellerId: sellerProfile.id,
      order: { status: { notIn: ["EN_ATTENTE_PAIEMENT", "ANNULE"] } },
    },
    select: { unitPrice: true, quantity: true, orderId: true },
  });
  const revenue = paidItems.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);
  const orderCount = new Set(paidItems.map((i) => i.orderId)).size;

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-bold">{sellerProfile.shopName}</h1>
        <div className="flex gap-2">
          <Button
            variant="outline"
            nativeButton={false}
            render={<Link href="/vendeur/commandes">Commandes</Link>}
          />
          <Button nativeButton={false} render={<Link href="/vendeur/produits">Mes produits</Link>} />
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="font-mono text-2xl">{sellerProfile._count.products}</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">Produits</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="font-mono text-2xl">{orderCount}</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">Commandes payées</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="font-mono text-2xl">{formatHTG(revenue)}</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">Revenus (avant commission)</CardContent>
        </Card>
      </div>
    </div>
  );
}
