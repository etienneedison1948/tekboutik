"use client";

import { useTransition } from "react";
import { deleteReviewAsAdmin } from "@/lib/actions/reviews";
import { Button } from "@/components/ui/button";

export function DeleteReviewButton({ reviewId }: { reviewId: string }) {
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      disabled={isPending}
      onClick={() => {
        if (confirm("Supprimer cet avis ?")) {
          startTransition(() => deleteReviewAsAdmin(reviewId));
        }
      }}
    >
      Supprimer
    </Button>
  );
}
