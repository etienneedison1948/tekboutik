type Category = { slug: string; name: string };
type Seller = { slug: string; shopName: string };
type Params = {
  q?: string;
  categorie?: string;
  prixMin?: string;
  prixMax?: string;
  noteMin?: string;
  vendeur?: string;
  disponible?: string;
  tri?: string;
};

const selectClass =
  "w-full rounded-lg border border-input bg-transparent px-2.5 py-1.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

// Formulaire natif (GET) : aucune interactivité JS nécessaire, l'URL porte
// tous les filtres — donc partageable et compatible avec le rendu serveur.
export function CatalogueFilters({
  categories,
  sellers,
  params,
}: {
  categories: Category[];
  sellers: Seller[];
  params: Params;
}) {
  return (
    <form method="get" action="/catalogue" className="flex flex-col gap-4 self-start">
      {params.q && <input type="hidden" name="q" value={params.q} />}

      <div className="flex flex-col gap-1.5">
        <label htmlFor="categorie" className="text-sm font-medium">
          Catégorie
        </label>
        <select
          id="categorie"
          name="categorie"
          defaultValue={params.categorie ?? ""}
          className={selectClass}
        >
          <option value="">Toutes les catégories</option>
          {categories.map((c) => (
            <option key={c.slug} value={c.slug}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1.5">
        <span className="text-sm font-medium">Prix (HTG)</span>
        <div className="flex items-center gap-2">
          <input
            type="number"
            name="prixMin"
            min={0}
            placeholder="Min"
            defaultValue={params.prixMin}
            className={selectClass}
          />
          <span className="text-muted-foreground">–</span>
          <input
            type="number"
            name="prixMax"
            min={0}
            placeholder="Max"
            defaultValue={params.prixMax}
            className={selectClass}
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="noteMin" className="text-sm font-medium">
          Note minimale
        </label>
        <select
          id="noteMin"
          name="noteMin"
          defaultValue={params.noteMin ?? ""}
          className={selectClass}
        >
          <option value="">Toutes les notes</option>
          <option value="4">4 étoiles et plus</option>
          <option value="3">3 étoiles et plus</option>
          <option value="2">2 étoiles et plus</option>
          <option value="1">1 étoile et plus</option>
        </select>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="vendeur" className="text-sm font-medium">
          Vendeur
        </label>
        <select
          id="vendeur"
          name="vendeur"
          defaultValue={params.vendeur ?? ""}
          className={selectClass}
        >
          <option value="">Tous les vendeurs</option>
          {sellers.map((s) => (
            <option key={s.slug} value={s.slug}>
              {s.shopName}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="tri" className="text-sm font-medium">
          Trier par
        </label>
        <select id="tri" name="tri" defaultValue={params.tri ?? ""} className={selectClass}>
          <option value="">
            {params.q ? "Pertinence" : "Plus récents"}
          </option>
          <option value="prix-asc">Prix croissant</option>
          <option value="prix-desc">Prix décroissant</option>
          <option value="note">Meilleures notes</option>
        </select>
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          name="disponible"
          value="1"
          defaultChecked={params.disponible === "1"}
          className="h-4 w-4 rounded border-input"
        />
        En stock uniquement
      </label>

      <div className="flex flex-col gap-2">
        <button
          type="submit"
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/80"
        >
          Appliquer les filtres
        </button>
        <a
          href="/catalogue"
          className="text-center text-sm text-muted-foreground hover:text-foreground"
        >
          Réinitialiser
        </a>
      </div>
    </form>
  );
}
