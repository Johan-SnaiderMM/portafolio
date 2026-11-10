import type { MetadataRoute } from "next";
import { featuredProjects } from "../content/projects";
import { locales } from "../i18n";
import { siteUrl } from "../lib/site";

/** Páginas del sitio con sus versiones en cada idioma (para buscadores; solo útil cuando el sitio es indexable). */
export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteUrl().origin;
  const paths = ["", "/rapida", ...featuredProjects.map((p) => `/projects/${p.id}`)];
  return paths.flatMap((path) =>
    locales.map((lang) => ({
      url: `${base}/${lang}${path}`,
      alternates: {
        languages: Object.fromEntries(locales.map((l) => [l, `${base}/${l}${path}`])),
      },
    })),
  );
}
