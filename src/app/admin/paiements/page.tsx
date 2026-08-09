import { prisma } from "@/lib/db";
import { formatHTG } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { PaymentActions } from "./payment-actions";

export const metadata = { title: "Paiements — Administration TekBoutik" };
export const dynamic = "force-dynamic";

const STATUS_LABEL: Record<string, string> = {
  EN_ATTENTE: "En attente",
  CONFIRME: "Confirmé",
  REJETE: "Rejeté",
};

const STATUS_VARIANT: Record<string, "secondary" | "default" | "destructive"> = {
  EN_ATTENTE: "secondary",
  CONFIRME: "default",
  REJETE: "destructive",
};

export default async function AdminPaiementsPage() {
  const payments = await prisma.payment.findMany({
    include: { order: { include: { buyer: { select: { name: true, email: true } } } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="font-heading text-2xl font-bold">Paiements</h1>

      {payments.length === 0 ? (
        <p className="mt-6 text-muted-foreground">Aucun paiement soumis pour le moment.</p>
      ) : (
        <div className="mt-6 flex flex-col gap-3">
          {payments.map((payment) => (
            <div
              key={payment.id}
              className="flex items-center justify-between gap-4 rounded-lg border border-border bg-card p-4"
            >
              <div>
                <p className="text-sm font-medium">
                  {payment.order.buyer.name} — {formatHTG(payment.order.total)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {payment.method === "MONCASH" ? "MonCash" : "NatCash"} · réf.{" "}
                  <span className="font-mono">{payment.transactionRef}</span>
                </p>
                <p className="text-xs text-muted-foreground">
                  {new Date(payment.createdAt).toLocaleString("fr-HT")}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant={STATUS_VARIANT[payment.status]}>
                  {STATUS_LABEL[payment.status]}
                </Badge>
                {payment.status === "EN_ATTENTE" && (
                  <PaymentActions orderId={payment.orderId} />
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
