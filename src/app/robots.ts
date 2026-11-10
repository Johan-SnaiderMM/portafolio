import type { MetadataRoute } from "next";
import { isIndexable, siteUrl } from "../lib/site";

/** Antes del lanzamiento se pide a los buscadores que no entren; con SITE_INDEXABLE=true se abre y se anuncia el sitemap. */
export default function robots(): MetadataRoute.Robots {
  if (!isIndexable()) return { rules: { userAgent: "*", disallow: "/" } };
  return {
    rules: { userAgent: "*", allow: "/", disallow: "/api/" },
    sitemap: `${siteUrl().origin}/sitemap.xml`,
  };
}
