import { redirect } from "next/navigation";
import { Star } from "lucide-react";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { ReplyForm } from "./reply-form";

export const metadata = { title: "Avis clients — TekBoutik" };
export const dynamic = "force-dynamic";

export default async function VendeurAvisPage() {
  const session = await auth();
  const sellerProfile = await prisma.sellerProfile.findUnique({
    where: { userId: session!.user.id },
  });
  if (!sellerProfile || sellerProfile.status !== "APPROUVE") redirect("/vendeur");

  const reviews = await prisma.review.findMany({
    where: { product: { sellerId: sellerProfile.id } },
    include: { product: { select: { name: true, slug: true } }, buyer: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="font-heading text-2xl font-bold">Avis clients</h1>

      {reviews.length === 0 ? (
        <p className="mt-6 text-muted-foreground">Aucun avis pour vos produits pour le moment.</p>
      ) : (
        <div className="mt-6 flex flex-col gap-4">
          {reviews.map((review) => (
            <div key={review.id} className="rounded-lg border border-border bg-card p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">
                  {review.product.name} — {review.buyer.name}
                </p>
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
                <p className="mt-1 text-sm text-muted-foreground">{review.comment}</p>
              )}
              <ReplyForm reviewId={review.id} existingReply={review.sellerReply} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
