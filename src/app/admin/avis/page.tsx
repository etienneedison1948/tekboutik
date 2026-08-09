import { Star } from "lucide-react";
import { prisma } from "@/lib/db";
import { DeleteReviewButton } from "./delete-review-button";

export const metadata = { title: "Avis — Administration TekBoutik" };
export const dynamic = "force-dynamic";

export default async function AdminAvisPage() {
  const reviews = await prisma.review.findMany({
    include: {
      product: { select: { name: true, slug: true } },
      buyer: { select: { name: true, email: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="font-heading text-2xl font-bold">Modération des avis</h1>

      {reviews.length === 0 ? (
        <p className="mt-6 text-muted-foreground">Aucun avis sur la plateforme.</p>
      ) : (
        <div className="mt-6 flex flex-col gap-3">
          {reviews.map((review) => (
            <div
              key={review.id}
              className="flex items-start justify-between gap-4 rounded-lg border border-border bg-card p-4"
            >
              <div>
                <p className="text-sm font-medium">
                  {review.product.name} — {review.buyer.name} ({review.buyer.email})
                </p>
                <div className="mt-1 flex">
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
                {review.comment && (
                  <p className="mt-1 text-sm text-muted-foreground">{review.comment}</p>
                )}
              </div>
              <DeleteReviewButton reviewId={review.id} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
