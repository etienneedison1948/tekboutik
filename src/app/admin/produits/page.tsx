import { prisma } from "@/lib/db";
import { formatHTG } from "@/lib/format";
import { ProductStatusToggle } from "./product-status-toggle";

export const metadata = { title: "Produits — Administration TekBoutik" };
export const dynamic = "force-dynamic";

export default async function AdminProduitsPage() {
  const products = await prisma.product.findMany({
    include: {
      seller: { select: { shopName: true } },
      category: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="font-heading text-2xl font-bold">Produits</h1>
      <p className="mt-1 text-sm text-muted-foreground">{products.length} produit(s) au total</p>

      <div className="mt-6 flex flex-col divide-y divide-border rounded-lg border border-border bg-card">
        {products.map((product) => (
          <div key={product.id} className="flex items-center justify-between gap-4 p-4">
            <div>
              <p className="text-sm font-medium">{product.name}</p>
              <p className="text-xs text-muted-foreground">
                {product.seller.shopName} · {product.category.name} · {formatHTG(product.priceHTG)}
              </p>
            </div>
            <ProductStatusToggle productId={product.id} status={product.status} />
          </div>
        ))}
      </div>
    </div>
  );
}
