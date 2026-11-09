import { defaultLocale, locales, type Locale } from "./locales";

/**
 * Elige el idioma a partir de la cabecera `Accept-Language`.
 * Toma el primero de mayor preferencia que sea uno de los idiomas del sitio;
 * si ninguno lo es, devuelve el idioma por defecto.
 */
export function negotiateLocale(header: string | null | undefined): Locale {
  if (!header) return defaultLocale;

  const ranked = header
    .split(",")
    .map((part, index) => {
      const [rawTag, ...params] = part.trim().split(";");
      const qParam = params.map((p) => p.trim()).find((p) => p.startsWith("q="));
      const quality = qParam ? Number.parseFloat(qParam.slice(2)) : 1;
      return {
        tag: rawTag.trim().toLowerCase(),
        quality: Number.isNaN(quality) ? 0 : quality,
        index,
      };
    })
    .filter((entry) => entry.tag.length > 0 && entry.quality > 0)
    .sort((a, b) => b.quality - a.quality || a.index - b.index);

  for (const { tag } of ranked) {
    const primary = tag.split("-")[0];
    const match = locales.find((locale) => locale === primary);
    if (match) return match;
  }

  return defaultLocale;
}
