import { prisma } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SettingsForm } from "./settings-form";

export const metadata = { title: "Paramètres — Administration TekBoutik" };
export const dynamic = "force-dynamic";

export default async function ParametresPage() {
  const settings = await prisma.platformSettings.upsert({
    where: { id: 1 },
    update: {},
    create: { id: 1 },
  });

  return (
    <div className="mx-auto max-w-lg px-4 py-10">
      <h1 className="font-heading text-2xl font-bold">Paramètres de la plateforme</h1>
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-base">Commission et réception des paiements</CardTitle>
        </CardHeader>
        <CardContent>
          <SettingsForm settings={settings} />
        </CardContent>
      </Card>
    </div>
  );
}
