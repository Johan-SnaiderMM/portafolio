import Link from "next/link";
import { siteName } from "../content/projects";
import type { Dictionary, Locale } from "../i18n";
import { LangSwitch } from "./LangSwitch";
import { MobileMenu } from "./MobileMenu";

export function Header({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const items = [
    { href: `/${locale}#proyectos`, label: dict.nav.projects },
    { href: `/${locale}#laboratorio`, label: dict.nav.lab },
    { href: `/${locale}#agente`, label: dict.nav.agent },
    { href: `/${locale}#contacto`, label: dict.nav.contact },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-trazo/70 bg-tinta/80 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-6 px-5 sm:px-8">
        <Link
          href={`/${locale}`}
          className="flex items-center gap-2.5 font-mono text-[13px] text-hueso"
        >
          <span aria-hidden="true" className="size-2 bg-ambar" />
          {siteName}
        </Link>

        <div className="flex items-center gap-7">
          <nav aria-label={dict.common.mainNav} className="hidden md:block">
            <ul className="flex items-center gap-7 font-mono text-[13px]">
              {items.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-ceniza transition-colors hover:text-hueso"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <LangSwitch
            current={locale}
            navLabel={dict.common.languageNav}
            switchLabel={dict.common.switchLanguage}
          />

          <MobileMenu
            items={items}
            navLabel={dict.common.mainNav}
            openLabel={dict.common.openMenu}
            closeLabel={dict.common.closeMenu}
          />
        </div>
      </div>
    </header>
  );
}
