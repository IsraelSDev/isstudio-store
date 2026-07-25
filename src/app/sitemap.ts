import type { MetadataRoute } from "next";
import { categories, products } from "@/lib/catalog";
import { absoluteUrl } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    "",
    "/catalogo",
    "/categorias",
    "/assinaturas",
    "/checkout",
  ].map((path) => ({
    url: absoluteUrl(path || "/"),
    lastModified: now,
    changeFrequency: path === "" ? "daily" : "weekly",
    priority: path === "" ? 1 : path === "/catalogo" ? 0.9 : 0.7,
  }));

  const categoryRoutes: MetadataRoute.Sitemap = categories.map((c) => ({
    url: absoluteUrl(`/categorias/${c.slug}`),
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const productRoutes: MetadataRoute.Sitemap = products.map((p) => ({
    url: absoluteUrl(`/produto/${p.slug}`),
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.85,
  }));

  return [...staticRoutes, ...categoryRoutes, ...productRoutes];
}
