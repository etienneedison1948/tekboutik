// Script ponctuel pour peupler des produits de démonstration.
// Usage : npx tsx prisma/seed-demo-products.ts
import "dotenv/config";
import pg from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";
import { PrismaClient } from "../src/generated/prisma/client.js";
import { slugify } from "../src/lib/slug";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

async function findOrCreateDemoSeller(shopName: string, email: string) {
  const existing = await prisma.sellerProfile.findFirst({ where: { shopName } });
  if (existing) return existing;

  const user = await prisma.user.upsert({
    where: { email },
    update: {},
    create: {
      name: shopName,
      email,
      passwordHash: await bcrypt.hash("motdepasse123", 10),
      role: "SELLER",
    },
  });

  return prisma.sellerProfile.create({
    data: {
      userId: user.id,
      shopName,
      slug: slugify(shopName),
      status: "APPROUVE",
    },
  });
}

async function main() {
  const paul = await findOrCreateDemoSeller("Paul Électro", "paul.demo@example.com");
  const marie = await findOrCreateDemoSeller("Electro Marie", "marie.demo@example.com");

  const categories = await prisma.category.findMany();
  const catBySlug = Object.fromEntries(categories.map((c) => [c.slug, c]));

  // Acheteuse de démo pour les avis
  const buyerEmail = "sophie.demo@example.com";
  let buyer = await prisma.user.findUnique({ where: { email: buyerEmail } });
  if (!buyer) {
    buyer = await prisma.user.create({
      data: {
        name: "Sophie Démo",
        email: buyerEmail,
        passwordHash: await bcrypt.hash("motdepasse123", 10),
        role: "BUYER",
      },
    });
  }

  const products = [
    {
      name: "Smartphone Galaxy A15 128GB",
      category: "telephones",
      seller: paul,
      priceHTG: 18500,
      oldPriceHTG: 21000,
      stock: 14,
      description: "Écran 6.5\" AMOLED, triple caméra 50MP, batterie 5000mAh.",
      specs: { "Stockage": "128 Go", "RAM": "4 Go", "Écran": "6.5 pouces AMOLED" },
      review: { rating: 5, comment: "Très bon téléphone, livraison rapide." },
      image: "https://images.pexels.com/photos/818043/pexels-photo-818043.jpeg?auto=compress&cs=tinysrgb&w=800",
    },
    {
      name: "Smartphone Redmi Note 13",
      category: "telephones",
      seller: marie,
      priceHTG: 15900,
      stock: 9,
      description: "Performance solide, charge rapide 33W, écran 90Hz fluide.",
      specs: { "Stockage": "128 Go", "Charge": "33W" },
      review: null,
      image: "https://images.pexels.com/photos/3945691/pexels-photo-3945691.jpeg?auto=compress&cs=tinysrgb&w=800",
    },
    {
      name: "Écouteurs sans fil TWS Pro",
      category: "audio",
      seller: marie,
      priceHTG: 2500,
      oldPriceHTG: 3200,
      stock: 30,
      description: "Réduction de bruit, autonomie 24h avec boîtier de charge.",
      specs: { "Autonomie": "24h", "Bluetooth": "5.3" },
      review: { rating: 4, comment: "Bon son, un peu serré aux oreilles au début." },
      image: "https://images.pexels.com/photos/8858287/pexels-photo-8858287.jpeg?auto=compress&cs=tinysrgb&w=800",
    },
    {
      name: "Enceinte Bluetooth portable",
      category: "audio",
      seller: paul,
      priceHTG: 3800,
      stock: 20,
      description: "Son puissant 360°, étanche IPX7, jusqu'à 12h d'autonomie.",
      specs: { "Étanchéité": "IPX7", "Autonomie": "12h" },
      review: { rating: 5, comment: "Excellente qualité sonore pour le prix." },
      image: "https://images.pexels.com/photos/4917455/pexels-photo-4917455.jpeg?auto=compress&cs=tinysrgb&w=800",
    },
    {
      name: "Ordinateur portable 15.6\" 8GB/256GB",
      category: "ordinateurs",
      seller: paul,
      priceHTG: 42000,
      oldPriceHTG: 46500,
      stock: 6,
      description: "Processeur rapide, SSD 256GB, idéal pour le travail et les études.",
      specs: { "RAM": "8 Go", "Stockage": "256 Go SSD", "Écran": "15.6 pouces" },
      review: null,
      image: "https://images.pexels.com/photos/8534240/pexels-photo-8534240.jpeg?auto=compress&cs=tinysrgb&w=800",
    },
    {
      name: "Tablette 10.1\" 64GB Wi-Fi",
      category: "tablettes",
      seller: marie,
      priceHTG: 12500,
      stock: 0,
      description: "Grand écran HD, léger et portable, parfaite pour lire et naviguer.",
      specs: { "Stockage": "64 Go", "Écran": "10.1 pouces" },
      review: null,
      image: "https://images.pexels.com/photos/6373051/pexels-photo-6373051.jpeg?auto=compress&cs=tinysrgb&w=800",
    },
    {
      name: "Manette gaming filaire",
      category: "gaming",
      seller: paul,
      priceHTG: 2200,
      stock: 25,
      description: "Compatible PC, précise et confortable pour de longues sessions.",
      specs: { "Connexion": "USB filaire" },
      review: { rating: 3, comment: "Correcte mais le câble est un peu court." },
      image: "https://images.pexels.com/photos/4522994/pexels-photo-4522994.jpeg?auto=compress&cs=tinysrgb&w=800",
    },
    {
      name: "Caméra de sécurité Wi-Fi",
      category: "cameras",
      seller: marie,
      priceHTG: 4500,
      stock: 12,
      description: "Vision nocturne, détection de mouvement, application mobile.",
      specs: { "Résolution": "1080p", "Vision nocturne": "Oui" },
      review: null,
      image: "https://images.pexels.com/photos/4740157/pexels-photo-4740157.jpeg?auto=compress&cs=tinysrgb&w=800",
    },
  ];

  for (const p of products) {
    const category = catBySlug[p.category];
    if (!category) continue;
    const slug = slugify(p.name);

    const product = await prisma.product.upsert({
      where: { slug },
      update: {},
      create: {
        sellerId: p.seller.id,
        categoryId: category.id,
        name: p.name,
        slug,
        description: p.description,
        specs: p.specs,
        priceHTG: p.priceHTG,
        oldPriceHTG: p.oldPriceHTG,
        stock: p.stock,
        images: [p.image],
        status: "ACTIF",
      },
    });

    if (p.review) {
      const existingReview = await prisma.review.findUnique({
        where: { productId_buyerId: { productId: product.id, buyerId: buyer.id } },
      });
      if (!existingReview) {
        await prisma.review.create({
          data: {
            productId: product.id,
            buyerId: buyer.id,
            rating: p.review.rating,
            comment: p.review.comment,
          },
        });
        await prisma.product.update({
          where: { id: product.id },
          data: { avgRating: p.review.rating, reviewCount: 1 },
        });
      }
    }
  }

  console.log(`${products.length} produits de démonstration prêts.`);
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
