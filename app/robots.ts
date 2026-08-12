import type { MetadataRoute } from "next";

const baseUrl = "https://ny-erin-ny-boky.com"; // ⚠️ à corriger selon confirmation

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/vendeur/dashboard", "/api/", "/client/panier", "/connexion", "/inscription"],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}