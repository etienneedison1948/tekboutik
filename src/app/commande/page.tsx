import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { CheckoutForm } from "./checkout-form";

export const metadata = { title: "Commande — TekBoutik" };
export const dynamic = "force-dynamic";

export default async function CommandePage() {
  const session = await auth();
  const addresses = await prisma.address.findMany({
    where: { userId: session!.user.id },
    orderBy: { isDefault: "desc" },
  });

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="mb-6 font-heading text-2xl font-bold">Passer la commande</h1>
      <CheckoutForm addresses={addresses} />
    </div>
  );
}
