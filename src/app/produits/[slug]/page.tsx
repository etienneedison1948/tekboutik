import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Star } from "lucide-react";
import { prisma } from "@/lib/db";
import { auth } from "@/auth";
import { formatHTG, formatUSD } from "@/lib/format";
import { CategoryIcon } from "@/lib/category-icons";
import { ProductCard } from "@/components/product/product-card";
import { AddToCartButton } from "@/components/product/add-to-cart-button";
import { ReviewForm } from "./review-form";
import { Badge } from "@/components/ui/badge";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await prisma.product.findUnique({ where: { slug }, select: { name: true, description: true } });
  if (!product) return {};
  return { title: `${product.name} — TekBoutik`, description: product.description };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const product = await prisma.product.findUnique({
    where: { slug },
    include: {
      category: true,
      seller: true,
      reviews: {
        include: { buyer: { select: { name: true } } },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!product || product.status !== "ACTIF") notFound();

  const session = await auth();
  let canReview = false;
  let myReview: { rating: number; comment: string | null } | null = null;
  if (session) {
    const purchase = await prisma.orderItem.findFirst({
      where: {
        productId: product.id,
        order: { buyerId: session.user.id, status: { notIn: ["EN_ATTENTE_PAIEMENT", "ANNULE"] } },
      },
    });
    canReview = Boolean(purchase);
    if (canReview) {
      const existing = product.reviews.find((r) => r.buyerId === session.user.id);
      if (existing) myReview = { rating: existing.rating, comment: existing.comment };
    }
  }

  const similar = await prisma.product.findMany({
    where: {
      categoryId: product.categoryId,
      id: { not: product.id },
      status: "ACTIF",
    },
    take: 4,
    select: {
      id: true,
      name: true,
      slug: true,
      priceHTG: true,
      oldPriceHTG: true,
      images: true,
      stock: true,
      avgRating: true,
      reviewCount: true,
      category: { select: { slug: true, name: true } },
      seller: { select: { id: true, shopName: true, slug: true } },
    },
  });

  const specs = (product.specs ?? {}) as Record<string, string>;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="grid gap-8 sm:grid-cols-2">
        <div>
          <div className="relative flex h-80 items-center justify-center rounded-lg border border-border bg-muted">
            {product.images[0] ? (
              <Image
                src={product.images[0]}
                alt={product.name}
                fill
                sizes="(max-width: 640px) 100vw, 50vw"
                priority
                className="rounded-lg object-cover"
              />
            ) : (
              <CategoryIcon
                slug={product.category.slug}
                className="h-24 w-24 text-muted-foreground"
                strokeWidth={1}
              />
            )}
          </div>
          {product.images.length > 1 && (
            <div className="mt-2 flex gap-2">
              {product.images.slice(1).map((img) => (
                <Image
                  key={img}
                  src={img}
                  alt=""
                  width={64}
                  height={64}
                  className="h-16 w-16 rounded-md border border-border object-cover"
                />
              ))}
            </div>
          )}
        </div>

        <div>
          <span className="text-xs font-medium uppercase tracking-wide text-primary">
            {product.category.name}
          </span>
          <h1 className="mt-1 font-heading text-2xl font-bold">{product.name}</h1>

          {product.reviewCount > 0 && (
            <div className="mt-2 flex items-center gap-1.5 text-sm">
              <Star className="h-4 w-4 fill-[var(--color-signal)] text-[var(--color-signal)]" />
              <span className="font-medium">{product.avgRating.toFixed(1)}</span>
              <span className="text-muted-foreground">({product.reviewCount} avis)</span>
            </div>
          )}

          <div className="mt-4 flex items-baseline gap-3">
            <span className="font-mono text-2xl font-bold">{formatHTG(product.priceHTG)}</span>
            {product.oldPriceHTG && (
              <span className="font-mono text-muted-foreground line-through">
                {formatHTG(product.oldPriceHTG)}
              </span>
            )}
          </div>
          {product.priceUSD && (
            <p className="font-mono text-sm text-muted-foreground">
              ≈ {formatUSD(product.priceUSD)}
            </p>
          )}

          <p className="mt-2 text-sm">
            {product.stock > 0 ? (
              <span className="text-primary">En stock ({product.stock} disponibles)</span>
            ) : (
              <Badge variant="destructive">Rupture de stock</Badge>
            )}
          </p>

          <div className="mt-4">
            <AddToCartButton product={product} size="lg" />
          </div>

          <p className="mt-4 text-sm text-muted-foreground">{product.description}</p>

          {Object.keys(specs).length > 0 && (
            <table className="mt-6 w-full text-sm">
              <tbody>
                {Object.entries(specs).map(([key, value]) => (
                  <tr key={key} className="border-b border-border">
                    <td className="py-1.5 pr-4 font-medium">{key}</td>
                    <td className="py-1.5 text-muted-foreground">{value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          <Link
            href={`/catalogue?vendeur=${product.seller.slug}`}
            className="mt-6 flex items-center gap-3 rounded-lg border border-border bg-card p-3 hover:border-primary"
          >
            <div>
              <p className="text-sm font-medium">{product.seller.shopName}</p>
              <p className="text-xs text-muted-foreground">Voir tous les produits de ce vendeur</p>
            </div>
          </Link>
        </div>
      </div>

      <section className="mt-12">
        <h2 className="mb-4 font-heading text-lg font-bold">
          Avis clients {product.reviewCount > 0 && `(${product.reviewCount})`}
        </h2>

        {canReview && (
          <div className="mb-6">
            <ReviewForm productId={product.id} existingReview={myReview} />
          </div>
        )}

        {product.reviews.length === 0 ? (
          <p className="text-sm text-muted-foreground">Aucun avis pour ce produit pour le moment.</p>
        ) : (
          <div className="flex flex-col gap-4">
            {product.reviews.map((review) => (
              <div key={review.id} className="rounded-lg border border-border bg-card p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">{review.buyer.name}</p>
                  <div className="flex">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`h-3.5 w-3.5 ${
                          i < review.rating
                            ? "fill-[var(--color-signal)] text-[var(--color-signal)]"
                            : "text-border"
                        }`}
                      />
                    ))}
                  </div>
                </div>
                {review.comment && (
                  <p className="mt-2 text-sm text-muted-foreground">{review.comment}</p>
                )}
                {review.sellerReply && (
                  <div className="mt-3 rounded-md bg-muted p-2 text-xs">
                    <span className="font-medium">Réponse du vendeur : </span>
                    {review.sellerReply}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {similar.length > 0 && (
        <section className="mt-12">
          <h2 className="mb-4 font-heading text-lg font-bold">Produits similaires</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {similar.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
