import Link from "next/link";
import type { Dictionary, Locale } from "../i18n";

export function Footer({ dict, locale }: { dict: Dictionary; locale: Locale }) {
  return (
    <footer className="border-t border-trazo">
      <div className="mx-auto flex max-w-6xl flex-col gap-2 px-5 py-10 font-mono text-xs text-ceniza sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <p>{dict.footer.rights}</p>
        <Link
          href={`/${locale}/rapida`}
          className="text-ambar underline-offset-4 hover:underline"
        >
          {dict.quick.link}
        </Link>
        <p>{dict.footer.built}</p>
      </div>
    </footer>
  );
}
