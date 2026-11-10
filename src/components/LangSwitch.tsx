import Link from "next/link";
import { locales, type Locale } from "../i18n/locales";

interface LangSwitchProps {
  current: Locale;
  navLabel: string;
  /** Texto accesible del enlace al otro idioma, p. ej. «Cambiar a inglés». */
  switchLabel: string;
}

export function LangSwitch({ current, navLabel, switchLabel }: LangSwitchProps) {
  return (
    <nav aria-label={navLabel}>
      <ul className="flex items-center font-mono text-xs">
        {locales.map((locale, index) => {
          const isCurrent = locale === current;
          return (
            <li key={locale} className="flex items-center">
              {index > 0 && (
                <span aria-hidden="true" className="px-1.5 text-trazo">
                  /
                </span>
              )}
              <Link
                href={`/${locale}`}
                lang={locale}
                hrefLang={locale}
                aria-current={isCurrent ? "true" : undefined}
                aria-label={isCurrent ? undefined : `${locale.toUpperCase()}: ${switchLabel}`}
                className={`px-1 py-2 uppercase transition-colors ${
                  isCurrent ? "text-ambar" : "text-ceniza hover:text-hueso"
                }`}
              >
                {locale}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
