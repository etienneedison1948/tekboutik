"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ProductFormResult } from "@/lib/actions/products";

type Category = { id: string; name: string };
type ExistingProduct = {
  name: string;
  categoryId: string;
  description: string;
  priceHTG: number;
  oldPriceHTG: number | null;
  priceUSD: number | null;
  stock: number;
  images: string[];
  specs: unknown;
};

function specsToPairs(specs: unknown): { key: string; value: string }[] {
  if (!specs || typeof specs !== "object") return [{ key: "", value: "" }];
  const entries = Object.entries(specs as Record<string, string>);
  return entries.length > 0 ? entries.map(([key, value]) => ({ key, value })) : [{ key: "", value: "" }];
}

export function ProductForm({
  categories,
  product,
  action,
  submitLabel,
}: {
  categories: Category[];
  product?: ExistingProduct;
  action: (formData: FormData) => Promise<ProductFormResult>;
  submitLabel: string;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [specs, setSpecs] = useState(specsToPairs(product?.specs));
  const [keptImages, setKeptImages] = useState(product?.images ?? []);
  const [categoryId, setCategoryId] = useState(product?.categoryId ?? "");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setPending(true);

    const formData = new FormData(e.currentTarget);
    const result = await action(formData);

    setPending(false);
    if (result?.error) {
      setError(result.error);
      return;
    }
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="name">Nom du produit</Label>
        <Input id="name" name="name" defaultValue={product?.name} required />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="categoryId">Catégorie</Label>
        <input type="hidden" name="categoryId" value={categoryId} />
        <Select value={categoryId} onValueChange={(value) => setCategoryId(value ?? "")}>
          <SelectTrigger id="categoryId">
            <SelectValue placeholder="Choisir une catégorie">
              {(value: string | null) =>
                categories.find((c) => c.id === value)?.name ?? "Choisir une catégorie"
              }
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {categories.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          rows={4}
          defaultValue={product?.description}
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="priceHTG">Prix (HTG)</Label>
          <Input
            id="priceHTG"
            name="priceHTG"
            type="number"
            min={1}
            defaultValue={product?.priceHTG}
            required
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="oldPriceHTG">Ancien prix (optionnel)</Label>
          <Input
            id="oldPriceHTG"
            name="oldPriceHTG"
            type="number"
            min={1}
            defaultValue={product?.oldPriceHTG ?? undefined}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="priceUSD">Prix (USD, optionnel)</Label>
          <Input
            id="priceUSD"
            name="priceUSD"
            type="number"
            step="0.01"
            min={0}
            defaultValue={product?.priceUSD ?? undefined}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="stock">Stock</Label>
          <Input
            id="stock"
            name="stock"
            type="number"
            min={0}
            defaultValue={product?.stock ?? 0}
            required
          />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label>Caractéristiques (optionnel)</Label>
        {specs.map((spec, i) => (
          <div key={i} className="flex gap-2">
            <Input
              name="specKey"
              placeholder="Ex: Mémoire"
              value={spec.key}
              onChange={(e) => {
                const next = [...specs];
                next[i] = { ...next[i], key: e.target.value };
                setSpecs(next);
              }}
            />
            <Input
              name="specValue"
              placeholder="Ex: 128 Go"
              value={spec.value}
              onChange={(e) => {
                const next = [...specs];
                next[i] = { ...next[i], value: e.target.value };
                setSpecs(next);
              }}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="Retirer cette caractéristique"
              onClick={() => setSpecs(specs.filter((_, j) => j !== i))}
            >
              ✕
            </Button>
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="w-fit"
          onClick={() => setSpecs([...specs, { key: "", value: "" }])}
        >
          + Ajouter une caractéristique
        </Button>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="images">Photos</Label>
        {keptImages.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {keptImages.map((url) => (
              <div key={url} className="relative">
                <input type="hidden" name="keptImages" value={url} />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt="" className="h-20 w-20 rounded-md border border-border object-cover" />
                <button
                  type="button"
                  onClick={() => setKeptImages(keptImages.filter((u) => u !== url))}
                  aria-label="Retirer cette photo"
                  className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-xs text-white"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
        <Input id="images" name="images" type="file" accept="image/*" multiple />
        <p className="text-xs text-muted-foreground">JPG, PNG, WEBP ou GIF — 5 Mo max par photo.</p>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}
      <Button type="submit" disabled={pending} className="w-fit">
        {pending ? "Enregistrement..." : submitLabel}
      </Button>
    </form>
  );
}
