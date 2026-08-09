"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateCategory, deleteCategory } from "@/lib/actions/categories";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Category = { id: string; name: string; parentId: string | null };

export function CategoryRow({
  category,
  allCategories,
  productCount,
}: {
  category: Category;
  allCategories: Category[];
  productCount: number;
}) {
  const router = useRouter();
  const [name, setName] = useState(category.name);
  const [parentId, setParentId] = useState(category.parentId ?? "");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);
    const formData = new FormData();
    formData.set("name", name);
    formData.set("parentId", parentId);
    const result = await updateCategory(category.id, formData);
    setPending(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    router.refresh();
  }

  async function handleDelete() {
    if (!confirm(`Supprimer la catégorie "${category.name}" ?`)) return;
    setError(null);
    setPending(true);
    const result = await deleteCategory(category.id);
    setPending(false);
    if (result.error) setError(result.error);
    else router.refresh();
  }

  return (
    <form onSubmit={handleSave} className="flex flex-col gap-2 rounded-lg border border-border bg-card p-3">
      <div className="flex flex-wrap items-center gap-2">
        <Input value={name} onChange={(e) => setName(e.target.value)} className="w-48" />
        <select
          value={parentId}
          onChange={(e) => setParentId(e.target.value)}
          className="rounded-lg border border-input bg-transparent px-2.5 py-1.5 text-sm"
        >
          <option value="">Aucune (catégorie principale)</option>
          {allCategories
            .filter((c) => c.id !== category.id)
            .map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
        </select>
        <span className="text-xs text-muted-foreground">{productCount} produit(s)</span>
        <Button type="submit" size="sm" disabled={pending}>
          Enregistrer
        </Button>
        <Button type="button" size="sm" variant="outline" disabled={pending} onClick={handleDelete}>
          Supprimer
        </Button>
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </form>
  );
}
