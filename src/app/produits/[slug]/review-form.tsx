"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Star } from "lucide-react";
import { submitReview } from "@/lib/actions/reviews";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export function ReviewForm({
  productId,
  existingReview,
}: {
  productId: string;
  existingReview: { rating: number; comment: string | null } | null;
}) {
  const router = useRouter();
  const [rating, setRating] = useState(existingReview?.rating ?? 5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState(existingReview?.comment ?? "");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setPending(true);
    const result = await submitReview({ productId, rating, comment: comment || undefined });
    setPending(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    setSuccess(true);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-lg border border-border bg-card p-4">
      <p className="text-sm font-medium">
        {existingReview ? "Modifier mon avis" : "Laisser un avis"}
      </p>
      <div className="mt-2 flex gap-1">
        {Array.from({ length: 5 }).map((_, i) => {
          const value = i + 1;
          return (
            <button
              key={value}
              type="button"
              onClick={() => setRating(value)}
              onMouseEnter={() => setHoverRating(value)}
              onMouseLeave={() => setHoverRating(0)}
              aria-label={`${value} étoile${value > 1 ? "s" : ""}`}
            >
              <Star
                className={`h-6 w-6 ${
                  value <= (hoverRating || rating)
                    ? "fill-[var(--color-signal)] text-[var(--color-signal)]"
                    : "text-border"
                }`}
              />
            </button>
          );
        })}
      </div>
      <Textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Votre avis (optionnel)"
        rows={3}
        className="mt-3"
      />
      {error && <p className="mt-2 text-sm text-destructive">{error}</p>}
      {success && <p className="mt-2 text-sm text-primary">Merci pour votre avis !</p>}
      <Button type="submit" disabled={pending} size="sm" className="mt-3">
        {pending ? "Envoi..." : existingReview ? "Mettre à jour" : "Publier mon avis"}
      </Button>
    </form>
  );
}
