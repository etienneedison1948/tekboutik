import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AddressForm } from "./address-form";
import { AddressControls } from "./address-controls";

export const metadata = { title: "Mes adresses — TekBoutik" };
export const dynamic = "force-dynamic";

export default async function AdressesPage() {
  const session = await auth();
  const addresses = await prisma.address.findMany({
    where: { userId: session!.user.id },
    orderBy: { isDefault: "desc" },
  });

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="font-heading text-2xl font-bold">Mes adresses de livraison</h1>

      <div className="mt-6 flex flex-col gap-3">
        {addresses.map((address) => (
          <Card key={address.id}>
            <CardHeader className="flex flex-row items-start justify-between gap-2">
              <CardTitle className="flex items-center gap-2 text-base">
                {address.label}
                {address.isDefault && <Badge>Par défaut</Badge>}
              </CardTitle>
              <AddressControls addressId={address.id} isDefault={address.isDefault} />
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              <p>{address.fullName}</p>
              <p>
                {address.street}, {address.city}
              </p>
              <p>{address.phone}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-base">Ajouter une adresse</CardTitle>
        </CardHeader>
        <CardContent>
          <AddressForm />
        </CardContent>
      </Card>
    </div>
  );
}
