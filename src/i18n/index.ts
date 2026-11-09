import { en } from "./en";
import { es } from "./es";
import type { Locale } from "./locales";
import type { Dictionary } from "./types";

const dictionaries: Record<Locale, Dictionary> = { es, en };

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale];
}

export { defaultLocale, hasLocale, locales, type Locale } from "./locales";
export type { Dictionary } from "./types";
