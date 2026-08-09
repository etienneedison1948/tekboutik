import type { PaymentStatus } from "@/generated/prisma/enums";
import type { PaymentInitiation, PaymentProvider } from "./provider";

// Squelette prêt à être branché sur la vraie API MonCash Business (Digicel)
// une fois les identifiants marchands obtenus. Non utilisé tant que
// MONCASH_CLIENT_ID / MONCASH_CLIENT_SECRET ne sont pas configurés (voir
// getPaymentProvider() dans index.ts, qui retombe sur ManualPaymentProvider).
//
// Documentation officielle MonCash (flux REST) :
//   1. POST /Api/oauth/token          → jeton d'accès (Basic Auth client_id:client_secret)
//   2. POST /Api/v1/CreatePayment     → crée le paiement, renvoie un payment_token
//      → rediriger l'acheteur vers /Moncash-middleware/Payment/Redirect?token=...
//   3. MonCash redirige l'acheteur vers la "Return URL" configurée dans le
//      tableau de bord marchand (pas passée par requête).
//   4. POST /Api/v1/RetrieveOrderPayment → vérifie le statut réel du paiement
//      (ne jamais faire confiance aux seuls paramètres d'URL du retour).
export class MonCashAPIProvider implements PaymentProvider {
  async initiatePayment(_orderId: string, _amount: number): Promise<PaymentInitiation> {
    // TODO : authentifier via /Api/oauth/token puis appeler /Api/v1/CreatePayment
    // avec { orderId, amount }, puis renvoyer { mode: "redirect", redirectUrl }
    // construite à partir du payment_token retourné.
    throw new Error(
      "MonCashAPIProvider n'est pas encore implémenté — configurez MONCASH_CLIENT_ID/SECRET " +
        "et complétez ce fichier, ou utilisez ManualPaymentProvider en attendant."
    );
  }

  async confirmPayment(_orderId: string, _reference: string): Promise<void> {
    // TODO : dans ce mode, la confirmation arrive normalement via le callback
    // /api/moncash/callback après redirection, pas via une saisie manuelle.
    throw new Error("MonCashAPIProvider.confirmPayment n'est pas encore implémenté.");
  }

  async checkStatus(_orderId: string): Promise<PaymentStatus> {
    // TODO : appeler /Api/v1/RetrieveOrderPayment avec { orderId } et mapper
    // la réponse ("successful" | autre) vers CONFIRME | EN_ATTENTE | REJETE.
    throw new Error("MonCashAPIProvider.checkStatus n'est pas encore implémenté.");
  }
}
