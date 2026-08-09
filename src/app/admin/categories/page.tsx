import { prisma } from "@/lib/db";
import { CategoryRow } from "./category-row";
import { NewCategoryForm } from "./new-category-form";

export const metadata = { title: "Catégories — Administration TekBoutik" };
export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage() {
  const categories = await prisma.category.findMany({
    include: { _count: { select: { products: true } } },
    orderBy: { name: "asc" },
  });

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="font-heading text-2xl font-bold">Catégories</h1>

      <div className="mt-6 flex flex-col gap-3">
        {categories.map((category) => (
          <CategoryRow
            key={category.id}
            category={category}
            allCategories={categories}
            productCount={category._count.products}
          />
        ))}
      </div>

      <div className="mt-6 rounded-lg border border-dashed border-border p-4">
        <p className="mb-2 text-sm font-medium">Nouvelle catégorie</p>
        <NewCategoryForm categories={categories} />
      </div>
    </div>
  );
}
