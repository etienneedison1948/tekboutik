import { prisma } from "@/lib/db";

// Recherche plein texte PostgreSQL (to_tsvector / plainto_tsquery) sur le nom
// et la description des produits actifs. Renvoie les identifiants triés par
// pertinence — à combiner ensuite avec d'autres filtres via Prisma.
export async function searchProductIds(query: string): Promise<Map<string, number>> {
  if (!query.trim()) return new Map();

  const rows = await prisma.$queryRaw<{ id: string; rank: number }[]>`
    SELECT id, ts_rank(
      to_tsvector('french', name || ' ' || description),
      plainto_tsquery('french', ${query})
    ) as rank
    FROM "Product"
    WHERE status = 'ACTIF'
      AND to_tsvector('french', name || ' ' || description) @@ plainto_tsquery('french', ${query})
    ORDER BY rank DESC
    LIMIT 200
  `;

  return new Map(rows.map((r) => [r.id, r.rank]));
}

export async function searchSuggestions(query: string, limit = 6) {
  if (!query.trim()) return [];

  return prisma.$queryRaw<{ id: string; name: string; slug: string }[]>`
    SELECT id, name, slug
    FROM "Product"
    WHERE status = 'ACTIF'
      AND to_tsvector('french', name || ' ' || description) @@ plainto_tsquery('french', ${query})
    ORDER BY ts_rank(
      to_tsvector('french', name || ' ' || description),
      plainto_tsquery('french', ${query})
    ) DESC
    LIMIT ${limit}
  `;
}
