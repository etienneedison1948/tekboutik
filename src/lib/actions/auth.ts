"use server";

import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";

const registerSchema = z.object({
  name: z.string().min(2, "Le nom est trop court."),
  email: z.email("Adresse email invalide."),
  phone: z.string().min(8, "Numéro de téléphone invalide."),
  password: z.string().min(8, "Le mot de passe doit contenir au moins 8 caractères."),
});

export type RegisterResult = { error: string } | { error?: undefined };

// Crée le compte acheteur. La connexion se fait ensuite côté client
// (voir app/(auth)/inscription/page.tsx) pour que la session du
// navigateur (useSession) se mette à jour immédiatement.
export async function registerBuyer(formData: FormData): Promise<RegisterResult> {
  const parsed = registerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Données invalides." };
  }

  const { name, email, phone, password } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { error: "Un compte existe déjà avec cet email." };
  }

  const passwordHash = await bcrypt.hash(password, 10);

  await prisma.user.create({
    data: { name, email, phone, passwordHash, role: "BUYER" },
  });

  return {};
}
