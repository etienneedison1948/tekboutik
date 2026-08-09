import Link from "next/link";
import Image from "next/image";
import { Star } from "lucide-react";
import { formatHTG } from "@/lib/format";
import { CategoryIcon } from "@/lib/category-icons";
import { Badge } from "@/components/ui/badge";
import { AddToCartButton } from "./add-to-cart-button";

export type ProductCardData = {
  id: string;
  name: string;
  slug: string;
  priceHTG: number;
  oldPriceHTG: number | null;
  images: string[];
  stock: number;
  avgRating: number;
  reviewCount: number;
  category: { slug: string; name: string };
  seller: { id: string; shopName: string; slug: string };
};

export function ProductCard({ product }: { product: ProductCardData }) {
  const image = product.images[0];

  return (
    <div className="group flex flex-col overflow-hidden rounded-lg border border-border bg-card transition hover:shadow-md">
      <Link href={`/produits/${product.slug}`} className="flex flex-1 flex-col">
        <div className="relative flex h-40 items-center justify-center bg-muted">
          {image ? (
            <Image
              src={image}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-cover"
            />
          ) : (
            <CategoryIcon
              slug={product.category.slug}
              className="h-12 w-12 text-muted-foreground"
              strokeWidth={1.25}
            />
          )}
          {product.oldPriceHTG && (
            <Badge className="absolute left-2 top-2 bg-[var(--color-signal)] text-[var(--color-ink)]">
              Promo
            </Badge>
          )}
          {product.stock === 0 && (
            <Badge variant="secondary" className="absolute right-2 top-2">
              Rupture
            </Badge>
          )}
        </div>
        <div className="flex flex-1 flex-col gap-1 p-3">
          <span className="text-xs uppercase tracking-wide text-primary">
            {product.category.name}
          </span>
          <h3 className="line-clamp-2 text-sm font-medium">{product.name}</h3>
          <p className="text-xs text-muted-foreground">{product.seller.shopName}</p>

          {product.reviewCount > 0 && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Star className="h-3.5 w-3.5 fill-[var(--color-signal)] text-[var(--color-signal)]" />
              <span>
                {product.avgRating.toFixed(1)} ({product.reviewCount})
              </span>
            </div>
          )}

          <div className="mt-auto flex items-baseline gap-2 pt-2 font-mono">
            <span className="font-semibold">{formatHTG(product.priceHTG)}</span>
            {product.oldPriceHTG && (
              <span className="text-xs text-muted-foreground line-through">
                {formatHTG(product.oldPriceHTG)}
              </span>
            )}
          </div>
        </div>
      </Link>
      <div className="px-3 pb-3">
        <AddToCartButton product={product} className="w-full" />
      </div>
    </div>
  );
}
