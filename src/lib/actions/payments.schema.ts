// Schéma de validation isolé (aucune dépendance à Prisma/Auth) pour rester
// facilement testable — voir payments.schema.test.ts.
import { z } from "zod";

export const submitPaymentSchema = z.object({
  orderId: z.string(),
  method: z.enum(["MONCASH", "NATCASH"]),
  reference: z.string().min(3, "Merci de coller la référence de transaction reçue par SMS."),
});

export type SubmitPaymentInput = z.infer<typeof submitPaymentSchema>;
