import "dotenv/config";
import { randomBytes } from "node:crypto";
import pg from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";
import { PrismaClient } from "../src/generated/prisma/client.js";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

async function main() {
  await prisma.platformSettings.upsert({
    where: { id: 1 },
    update: {},
    create: { id: 1, commissionRatePercent: 10 },
  });

  const adminEmail = "admin@tekboutik.local";
  const existingAdmin = await prisma.user.findUnique({ where: { email: adminEmail } });

  if (!existingAdmin) {
    const password = randomBytes(9).toString("base64url");
    const passwordHash = await bcrypt.hash(password, 10);

    await prisma.user.create({
      data: {
        name: "Administrateur TekBoutik",
        email: adminEmail,
        passwordHash,
        role: "ADMIN",
      },
    });

    console.log("\n=== COMPTE ADMIN CRÉÉ ===");
    console.log(`Email    : ${adminEmail}`);
    console.log(`Mot de passe : ${password}`);
    console.log("Notez ce mot de passe maintenant, il ne sera plus jamais affiché.\n");
  } else {
    console.log("Le compte admin existe déjà, aucune action.");
  }

  const categories = [
    { name: "Téléphones", slug: "telephones" },
    { name: "Ordinateurs", slug: "ordinateurs" },
    { name: "Tablettes", slug: "tablettes" },
    { name: "Téléviseurs", slug: "televiseurs" },
    { name: "Audio", slug: "audio" },
    { name: "Gaming", slug: "gaming" },
    { name: "Caméras", slug: "cameras" },
    { name: "Accessoires", slug: "accessoires" },
  ];

  for (const category of categories) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: {},
      create: category,
    });
  }
  console.log(`Catégories prêtes : ${categories.length}`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
