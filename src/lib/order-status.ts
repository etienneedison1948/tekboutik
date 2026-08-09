export const ORDER_STATUS_LABEL: Record<string, string> = {
  EN_ATTENTE_PAIEMENT: "En attente de paiement",
  PAYE: "Payée",
  EN_PREPARATION: "En préparation",
  EXPEDIE: "Expédiée",
  LIVRE: "Livrée",
  ANNULE: "Annulée",
};

export const ORDER_STATUS_VARIANT: Record<string, "default" | "secondary" | "destructive"> = {
  EN_ATTENTE_PAIEMENT: "secondary",
  PAYE: "default",
  EN_PREPARATION: "default",
  EXPEDIE: "default",
  LIVRE: "default",
  ANNULE: "destructive",
};
