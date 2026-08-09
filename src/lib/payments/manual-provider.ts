import { prisma } from "@/lib/db";
import type { PaymentMethod, PaymentStatus } from "@/generated/prisma/enums";
import type { PaymentInitiation, PaymentProvider } from "./provider";

// Mode "confirmation manuelle" : l'acheteur envoie l'argent vers le numéro
// MonCash/NatCash de la plateforme depuis son téléphone, puis colle la
// référence de transaction reçue par SMS. Un administrateur vérifie ensuite
// la réception réelle des fonds et confirme la commande.
export class ManualPaymentProvider implements PaymentProvider {
  constructor(private method: PaymentMethod) {}

  async initiatePayment(orderId: string, amount: number): Promise<PaymentInitiation> {
    const settings = await prisma.platformSettings.findUnique({ where: { id: 1 } });
    const number =
      this.method === "MONCASH" ? settings?.moncashNumber : settings?.natcashNumber;

    return {
      mode: "manual",
      instructions: {
        label: this.method === "MONCASH" ? "MonCash" : "NatCash",
        number: number ?? "Non configuré — contactez l'administrateur",
        amount,
      },
    };
  }

  async confirmPayment(orderId: string, reference: string): Promise<void> {
    await prisma.payment.upsert({
      where: { orderId },
      update: { method: this.method, transactionRef: reference, status: "EN_ATTENTE" },
      create: { orderId, method: this.method, transactionRef: reference, status: "EN_ATTENTE" },
    });
  }

  async checkStatus(orderId: string): Promise<PaymentStatus> {
    const payment = await prisma.payment.findUnique({ where: { orderId } });
    return payment?.status ?? "EN_ATTENTE";
  }
}
