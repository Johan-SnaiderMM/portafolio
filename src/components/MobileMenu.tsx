"use client";

import { useEffect, useState } from "react";

interface MobileMenuProps {
  items: readonly { href: string; label: string }[];
  navLabel: string;
  openLabel: string;
  closeLabel: string;
}

export function MobileMenu({
  items,
  navLabel,
  openLabel,
  closeLabel,
}: MobileMenuProps) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  return (
    <div className="md:hidden">
      <button
        type="button"
        aria-expanded={open}
        aria-controls="menu-movil"
        onClick={() => setOpen((value) => !value)}
        className="-mr-2 flex size-10 items-center justify-center text-hueso transition-colors hover:text-ambar"
      >
        <span className="sr-only">{open ? closeLabel : openLabel}</span>
        <svg
          aria-hidden="true"
          viewBox="0 0 20 20"
          className="size-5"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        >
          {open ? (
            <path d="M4 4l12 12M16 4L4 16" />
          ) : (
            <path d="M3 6.5h14M3 13.5h14" />
          )}
        </svg>
      </button>

      {open && (
        <nav
          id="menu-movil"
          aria-label={navLabel}
          className="absolute inset-x-0 top-full border-b border-trazo bg-tinta px-5 pb-5 pt-2"
        >
          <ul className="font-mono text-sm">
            {items.map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="block border-b border-trazo/60 py-3.5 text-hueso transition-colors hover:text-ambar"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </div>
  );
}
