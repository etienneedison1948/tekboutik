import type { PaymentStatus } from "@/generated/prisma/enums";

export type PaymentInitiation =
  | { mode: "redirect"; redirectUrl: string }
  | { mode: "manual"; instructions: { label: string; number: string; amount: number } };

// Interface commune à toute méthode de paiement (MonCash, NatCash, futures
// méthodes). Une implémentation "manuelle" existe déjà (ManualPaymentProvider).
// Une implémentation basée sur la vraie API MonCash Business peut être
// branchée plus tard sans changer le reste de l'application — voir
// moncash-api-provider.ts.
export interface PaymentProvider {
  /** Démarre un paiement : redirection vers une passerelle, ou instructions à afficher. */
  initiatePayment(orderId: string, amount: number): Promise<PaymentInitiation>;

  /**
   * Enregistre la preuve de paiement transmise par l'acheteur (référence de
   * transaction). Ne confirme PAS le paiement — passe simplement la commande
   * en attente de vérification humaine (vendeur/admin) ou automatique (API).
   */
  confirmPayment(orderId: string, reference: string): Promise<void>;

  /** Renvoie le statut actuel du paiement pour cette commande. */
  checkStatus(orderId: string): Promise<PaymentStatus>;
}
