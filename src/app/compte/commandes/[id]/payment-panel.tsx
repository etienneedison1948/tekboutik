"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { submitPaymentReference, getPaymentInstructions } from "@/lib/actions/payments";
import { formatHTG } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Payment = { method: "MONCASH" | "NATCASH"; status: string; transactionRef: string | null } | null;

const PAYMENT_STATUS_LABEL: Record<string, string> = {
  EN_ATTENTE: "En attente de vérification",
  CONFIRME: "Confirmé",
  REJETE: "Rejeté — vérifiez la référence et réessayez",
};

export function PaymentPanel({
  orderId,
  total,
  payment,
}: {
  orderId: string;
  total: number;
  payment: Payment;
}) {
  const router = useRouter();
  const [method, setMethod] = useState<"MONCASH" | "NATCASH">(payment?.method ?? "MONCASH");
  const [reference, setReference] = useState("");
  const [instructions, setInstructions] = useState<{ label: string; number: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const showForm = !payment || payment.status === "REJETE";

  useEffect(() => {
    if (!showForm) return;
    getPaymentInstructions(orderId, method).then((result) => {
      if (result.mode === "manual") setInstructions(result.instructions);
    });
  }, [orderId, method, showForm]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);
    const result = await submitPaymentReference({ orderId, method, reference });
    setPending(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    router.refresh();
  }

  if (!showForm && payment) {
    return (
      <div className="mt-4 rounded-lg border border-border bg-muted p-4 text-sm">
        <p className="font-medium">
          Paiement {payment.method === "MONCASH" ? "MonCash" : "NatCash"} :{" "}
          {PAYMENT_STATUS_LABEL[payment.status]}
        </p>
        {payment.transactionRef && (
          <p className="mt-1 font-mono text-xs text-muted-foreground">
            Référence : {payment.transactionRef}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="mt-4 rounded-lg border border-border bg-card p-4">
      <h2 className="text-sm font-medium">Payer cette commande</h2>

      {payment?.status === "REJETE" && (
        <p className="mt-2 text-sm text-destructive">
          Votre référence précédente n&apos;a pas pu être vérifiée. Réessayez avec la bonne
          référence, ou contactez le support.
        </p>
      )}

      <div className="mt-3 flex gap-2">
        <button
          type="button"
          onClick={() => setMethod("MONCASH")}
          className={`rounded-lg border px-3 py-1.5 text-sm ${
            method === "MONCASH" ? "border-primary bg-primary/10 text-primary" : "border-border"
          }`}
        >
          📲 MonCash
        </button>
        <button
          type="button"
          onClick={() => setMethod("NATCASH")}
          className={`rounded-lg border px-3 py-1.5 text-sm ${
            method === "NATCASH" ? "border-primary bg-primary/10 text-primary" : "border-border"
          }`}
        >
          💳 NatCash
        </button>
      </div>

      {instructions && (
        <ol className="mt-3 list-decimal space-y-1 pl-5 text-sm text-muted-foreground">
          <li>Ouvrez votre application {instructions.label}.</li>
          <li>
            Envoyez <strong className="font-mono text-foreground">{formatHTG(total)}</strong> au
            numéro <strong className="text-foreground">{instructions.number}</strong>.
          </li>
          <li>Copiez la référence de transaction reçue par SMS.</li>
          <li>Collez-la ci-dessous et confirmez.</li>
        </ol>
      )}

      <form onSubmit={handleSubmit} className="mt-3 flex flex-col gap-2">
        <Label htmlFor="reference">Référence de transaction</Label>
        <Input
          id="reference"
          value={reference}
          onChange={(e) => setReference(e.target.value)}
          required
        />
        {error && <p className="text-sm text-destructive">{error}</p>}
        <Button type="submit" disabled={pending} className="mt-1 w-fit">
          {pending ? "Envoi..." : "J'ai payé, vérifier ma référence"}
        </Button>
      </form>
    </div>
  );
}
