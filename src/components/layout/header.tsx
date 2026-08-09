"use client";

import { useState } from "react";
import Link from "next/link";
import { ShoppingCart, Menu, X } from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart-context";
import { SearchBar } from "./search-bar";

function NavLinks({ role, onNavigate }: { role?: string; onNavigate?: () => void }) {
  return (
    <>
      <Link href="/catalogue" className="hover:text-primary" onClick={onNavigate}>
        Catalogue
      </Link>
      {role === "BUYER" && (
        <Link href="/devenir-vendeur" className="hover:text-primary" onClick={onNavigate}>
          Devenir vendeur
        </Link>
      )}
      {role === "SELLER" && (
        <>
          <Link href="/vendeur" className="hover:text-primary" onClick={onNavigate}>
            Espace vendeur
          </Link>
          <Link href="/vendeur/commandes" className="hover:text-primary" onClick={onNavigate}>
            Commandes
          </Link>
          <Link href="/vendeur/avis" className="hover:text-primary" onClick={onNavigate}>
            Avis
          </Link>
        </>
      )}
      {role === "ADMIN" && (
        <>
          <Link href="/admin" className="hover:text-primary" onClick={onNavigate}>
            Administration
          </Link>
          <Link href="/admin/vendeurs" className="hover:text-primary" onClick={onNavigate}>
            Vendeurs
          </Link>
          <Link href="/admin/produits" className="hover:text-primary" onClick={onNavigate}>
            Produits
          </Link>
          <Link href="/admin/commandes" className="hover:text-primary" onClick={onNavigate}>
            Commandes
          </Link>
          <Link href="/admin/paiements" className="hover:text-primary" onClick={onNavigate}>
            Paiements
          </Link>
          <Link href="/admin/avis" className="hover:text-primary" onClick={onNavigate}>
            Avis
          </Link>
          <Link href="/admin/categories" className="hover:text-primary" onClick={onNavigate}>
            Catégories
          </Link>
          <Link href="/admin/parametres" className="hover:text-primary" onClick={onNavigate}>
            Paramètres
          </Link>
        </>
      )}
    </>
  );
}

export function Header() {
  const { data: session, status } = useSession();
  const { count } = useCart();
  const role = session?.user?.role;
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-20 border-b border-border bg-card/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/" className="font-heading text-xl font-bold text-foreground">
          Tek<span className="text-primary">Boutik</span>
        </Link>

        <nav className="hidden items-center gap-6 text-sm font-medium sm:flex">
          <NavLinks role={role} />
        </nav>

        <div className="hidden sm:block">
          <SearchBar />
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/panier"
            className="relative flex items-center gap-1.5 rounded-lg border border-border px-2.5 py-1.5 text-sm font-medium hover:border-primary hover:text-primary"
            aria-label="Panier"
          >
            <ShoppingCart className="h-4 w-4" />
            {count > 0 && (
              <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                {count}
              </span>
            )}
          </Link>

          <div className="hidden items-center gap-2 sm:flex">
            {status === "loading" ? null : session ? (
              <>
                <Link href="/compte" className="text-sm font-medium hover:text-primary">
                  {session.user.name}
                </Link>
                <Button variant="outline" size="sm" onClick={() => signOut({ redirectTo: "/" })}>
                  Se déconnecter
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  nativeButton={false}
                  render={<Link href="/connexion">Connexion</Link>}
                />
                <Button
                  size="sm"
                  nativeButton={false}
                  render={<Link href="/inscription">Créer un compte</Link>}
                />
              </>
            )}
          </div>

          <button
            type="button"
            className="rounded-lg border border-border p-2 sm:hidden"
            aria-label={menuOpen ? "Fermer le menu" : "Ouvrir le menu"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((v) => !v)}
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="border-t border-border px-4 py-4 sm:hidden">
          <SearchBar />
          <nav className="mt-4 flex flex-col gap-3 text-sm font-medium">
            <NavLinks role={role} onNavigate={() => setMenuOpen(false)} />
          </nav>
          <div className="mt-4 flex flex-col gap-2 border-t border-border pt-4">
            {status === "loading" ? null : session ? (
              <>
                <Link
                  href="/compte"
                  className="text-sm font-medium hover:text-primary"
                  onClick={() => setMenuOpen(false)}
                >
                  {session.user.name}
                </Link>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-fit"
                  onClick={() => {
                    setMenuOpen(false);
                    signOut({ redirectTo: "/" });
                  }}
                >
                  Se déconnecter
                </Button>
              </>
            ) : (
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  nativeButton={false}
                  render={
                    <Link href="/connexion" onClick={() => setMenuOpen(false)}>
                      Connexion
                    </Link>
                  }
                />
                <Button
                  size="sm"
                  nativeButton={false}
                  render={
                    <Link href="/inscription" onClick={() => setMenuOpen(false)}>
                      Créer un compte
                    </Link>
                  }
                />
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
