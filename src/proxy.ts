import { NextResponse } from "next/server";
import { auth } from "@/auth";

// Protège les sections par rôle. Next.js 16 a renommé "middleware" en "proxy"
// (même mécanisme, nouveau nom de fichier/convention).
export default auth((req) => {
  const { pathname } = req.nextUrl;
  const role = req.auth?.user?.role;

  const isAuthPage = pathname === "/connexion" || pathname === "/inscription";
  if (isAuthPage) {
    if (req.auth) return NextResponse.redirect(new URL("/", req.url));
    return;
  }

  if (pathname.startsWith("/compte") && !req.auth) {
    return NextResponse.redirect(new URL("/connexion", req.url));
  }

  if (pathname.startsWith("/commande") && !req.auth) {
    const url = new URL("/connexion", req.url);
    url.searchParams.set("next", "/commande");
    return NextResponse.redirect(url);
  }

  if (pathname.startsWith("/devenir-vendeur")) {
    if (!req.auth) return NextResponse.redirect(new URL("/connexion", req.url));
    if (role !== "BUYER") return NextResponse.redirect(new URL("/vendeur", req.url));
  }

  if (pathname.startsWith("/vendeur")) {
    if (!req.auth) return NextResponse.redirect(new URL("/connexion", req.url));
    if (role !== "SELLER") return NextResponse.redirect(new URL("/", req.url));
  }

  if (pathname.startsWith("/admin")) {
    if (!req.auth) return NextResponse.redirect(new URL("/connexion", req.url));
    if (role !== "ADMIN") return NextResponse.redirect(new URL("/", req.url));
  }
});

export const config = {
  matcher: [
    "/compte/:path*",
    "/vendeur/:path*",
    "/admin/:path*",
    "/devenir-vendeur",
    "/commande/:path*",
    "/connexion",
    "/inscription",
  ],
};
