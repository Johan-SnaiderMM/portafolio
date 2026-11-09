/** URL pública del sitio, para las metas de compartir y los enlaces canónicos. */
export function siteUrl(): URL {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit) return new URL(explicit);

  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (vercel) return new URL(`https://${vercel}`);

  return new URL("http://localhost:3000");
}

/**
 * El sitio solo se deja indexar cuando `SITE_INDEXABLE=true`. Antes del
 * lanzamiento queda en `noindex` para que los buscadores no vean un borrador.
 */
export function isIndexable(): boolean {
  return process.env.SITE_INDEXABLE === "true";
}
