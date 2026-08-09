import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { formatHTG } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const metadata = { title: "Mes produits — TekBoutik" };
export const dynamic = "force-dynamic";

const STATUS_VARIANT = {
  ACTIF: "default",
  INACTIF: "secondary",
  EN_RUPTURE: "destructive",
} as const;

const STATUS_LABEL = {
  ACTIF: "Actif",
  INACTIF: "Inactif",
  EN_RUPTURE: "En rupture",
};

export default async function VendeurProduitsPage() {
  const session = await auth();
  const sellerProfile = await prisma.sellerProfile.findUnique({
    where: { userId: session!.user.id },
  });

  if (!sellerProfile || sellerProfile.status !== "APPROUVE") {
    redirect("/vendeur");
  }

  const products = await prisma.product.findMany({
    where: { sellerId: sellerProfile.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-bold">Mes produits</h1>
        <Button nativeButton={false} render={<Link href="/vendeur/produits/nouveau">+ Nouveau produit</Link>} />
      </div>

      {products.length === 0 ? (
        <p className="mt-8 text-muted-foreground">Vous n&apos;avez pas encore de produit.</p>
      ) : (
        <div className="mt-6 flex flex-col divide-y divide-border rounded-lg border border-border bg-card">
          {products.map((product) => (
            <Link
              key={product.id}
              href={`/vendeur/produits/${product.id}`}
              className="flex items-center justify-between gap-4 p-4 hover:bg-muted"
            >
              <div className="flex items-center gap-3">
                {product.images[0] ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={product.images[0]}
                    alt=""
                    className="h-12 w-12 rounded-md border border-border object-cover"
                  />
                ) : (
                  <div className="h-12 w-12 rounded-md border border-border bg-muted" />
                )}
                <div>
                  <p className="font-medium">{product.name}</p>
                  <p className="font-mono text-sm text-muted-foreground">
                    {formatHTG(product.priceHTG)} · Stock : {product.stock}
                  </p>
                </div>
              </div>
              <Badge variant={STATUS_VARIANT[product.status]}>
                {STATUS_LABEL[product.status]}
              </Badge>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
