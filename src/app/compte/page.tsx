import Link from "next/link";
import { auth } from "@/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const metadata = { title: "Mon compte — TekBoutik" };

const ROLE_LABEL: Record<string, string> = {
  BUYER: "Acheteur",
  SELLER: "Vendeur",
  ADMIN: "Administrateur",
};

export default async function ComptePage() {
  const session = await auth();

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="font-heading text-2xl font-bold">Mon compte</h1>
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>{session?.user.name}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2 text-sm">
          <p>Email : {session?.user.email}</p>
          <p>
            Rôle : <Badge variant="secondary">{ROLE_LABEL[session?.user.role ?? "BUYER"]}</Badge>
          </p>
        </CardContent>
      </Card>

      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
        <Link
          href="/compte/adresses"
          className="flex-1 rounded-lg border border-border bg-card p-4 text-sm font-medium hover:border-primary"
        >
          📍 Mes adresses de livraison
        </Link>
        <Link
          href="/compte/commandes"
          className="flex-1 rounded-lg border border-border bg-card p-4 text-sm font-medium hover:border-primary"
        >
          📦 Mes commandes
        </Link>
      </div>
    </div>
  );
}
