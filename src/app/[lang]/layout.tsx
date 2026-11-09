import type { Metadata } from "next";
import { Instrument_Sans, Martian_Mono } from "next/font/google";
import { Footer } from "../../components/Footer";
import { Header } from "../../components/Header";
import {
  defaultLocale,
  getDictionary,
  hasLocale,
  locales,
  type Locale,
} from "../../i18n";
import { isIndexable, siteUrl } from "../../lib/site";
import "../globals.css";

const martian = Martian_Mono({
  variable: "--font-martian",
  subsets: ["latin"],
  axes: ["wdth"],
  display: "swap",
});

const instrument = Instrument_Sans({
  variable: "--font-instrument",
  subsets: ["latin"],
  display: "swap",
});

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export async function generateMetadata({
  params,
}: LayoutProps<"/[lang]">): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const { meta } = getDictionary(lang);

  return {
    metadataBase: siteUrl(),
    title: meta.title,
    description: meta.description,
    // Hasta el lanzamiento (fase 8) el sitio no se indexa: ver SITE_INDEXABLE.
    robots: isIndexable() ? undefined : { index: false, follow: false },
    alternates: {
      canonical: `/${lang}`,
      languages: { es: "/es", en: "/en", "x-default": "/es" },
    },
    openGraph: {
      type: "website",
      locale: lang === "es" ? "es_CO" : "en_US",
      title: meta.title,
      description: meta.description,
      url: `/${lang}`,
    },
  };
}

export default async function RootLayout({
  children,
  params,
}: LayoutProps<"/[lang]">) {
  const { lang } = await params;
  const locale: Locale = hasLocale(lang) ? lang : defaultLocale;
  const dict = getDictionary(locale);

  return (
    <html lang={locale} className={`${martian.variable} ${instrument.variable}`}>
      <body className="antialiased">
        <a
          href="#contenido"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:bg-ambar focus:px-4 focus:py-2 focus:font-mono focus:text-sm focus:text-tinta"
        >
          {dict.common.skipToContent}
        </a>
        <Header locale={locale} dict={dict} />
        {children}
        <Footer dict={dict} />
      </body>
    </html>
  );
}
