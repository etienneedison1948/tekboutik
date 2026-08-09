"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { replyToReview } from "@/lib/actions/reviews";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export function ReplyForm({ reviewId, existingReply }: { reviewId: string; existingReply: string | null }) {
  const router = useRouter();
  const [reply, setReply] = useState(existingReply ?? "");
  const [editing, setEditing] = useState(!existingReply);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);
    const result = await replyToReview(reviewId, reply);
    setPending(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    setEditing(false);
    router.refresh();
  }

  if (!editing && existingReply) {
    return (
      <div className="mt-2 rounded-md bg-muted p-2 text-xs">
        <span className="font-medium">Votre réponse : </span>
        {existingReply}
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="ml-2 text-primary hover:underline"
        >
          Modifier
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-2 flex flex-col gap-2">
      <Textarea
        value={reply}
        onChange={(e) => setReply(e.target.value)}
        placeholder="Répondre à cet avis..."
        rows={2}
      />
      {error && <p className="text-xs text-destructive">{error}</p>}
      <Button type="submit" size="sm" disabled={pending} className="w-fit">
        {pending ? "Envoi..." : "Répondre"}
      </Button>
    </form>
  );
}
