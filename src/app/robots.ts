import type { MetadataRoute } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3001";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/vendeur", "/compte", "/panier", "/commande", "/api"],
    },
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
