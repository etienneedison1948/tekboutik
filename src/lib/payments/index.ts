import type { PaymentMethod } from "@/generated/prisma/enums";
import type { PaymentProvider } from "./provider";
import { ManualPaymentProvider } from "./manual-provider";

export type { PaymentProvider, PaymentInitiation } from "./provider";

// Point d'entrée unique pour obtenir le provider de paiement d'une méthode.
// Aujourd'hui : toujours le mode manuel. Pour activer la vraie API MonCash
// une fois les identifiants marchands disponibles, remplacez la branche
// MONCASH par `new MonCashAPIProvider()` — rien d'autre n'a besoin de changer.
export function getPaymentProvider(method: PaymentMethod): PaymentProvider {
  return new ManualPaymentProvider(method);
}
