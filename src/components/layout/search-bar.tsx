"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";

type Suggestion = { id: string; name: string; slug: string };

export function SearchBar() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!query.trim()) return;
    const timeout = setTimeout(() => {
      fetch(`/api/recherche/suggestions?q=${encodeURIComponent(query)}`)
        .then((res) => res.json())
        .then((data) => setSuggestions(data.suggestions ?? []))
        .catch(() => setSuggestions([]));
    }, 200);
    return () => clearTimeout(timeout);
  }, [query]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function goToCatalogue() {
    setOpen(false);
    router.push(`/catalogue?q=${encodeURIComponent(query)}`);
  }

  return (
    <div ref={containerRef} className="relative w-full max-w-sm">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          goToCatalogue();
        }}
      >
        <div className="flex items-center gap-2 rounded-lg border border-input px-2.5 py-1.5">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            type="search"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            placeholder="Rechercher un produit..."
            className="w-full bg-transparent text-sm outline-none"
          />
        </div>
      </form>

      {open && query.trim() && suggestions.length > 0 && (
        <div className="absolute z-30 mt-1 w-full rounded-lg border border-border bg-popover shadow-md">
          {suggestions.map((s) => (
            <a
              key={s.id}
              href={`/produits/${s.slug}`}
              className="block px-3 py-2 text-sm hover:bg-muted"
              onClick={() => setOpen(false)}
            >
              {s.name}
            </a>
          ))}
          <button
            type="button"
            onClick={goToCatalogue}
            className="block w-full border-t border-border px-3 py-2 text-left text-sm text-primary hover:bg-muted"
          >
            Voir tous les résultats pour « {query} »
          </button>
        </div>
      )}
    </div>
  );
}
