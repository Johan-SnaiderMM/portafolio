import type { ReactNode } from "react";

interface ExternalLinkProps {
  href: string;
  /** Texto para lectores de pantalla, p. ej. «se abre en una pestaña nueva». */
  srText: string;
  children: ReactNode;
  className?: string;
}

/**
 * Enlace a otro sitio. La flecha va en línea con el texto (no en un flex) para
 * que, si el texto ocupa dos renglones, la flecha quede pegada al final.
 */
export function ExternalLink({
  href,
  srText,
  children,
  className = "",
}: ExternalLinkProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`group/link text-hueso underline decoration-trazo decoration-1 underline-offset-[5px] transition-colors hover:text-ambar hover:decoration-ambar ${className}`}
    >
      {children}
      <svg
        aria-hidden="true"
        viewBox="0 0 12 12"
        className="ml-1.5 inline-block size-3 align-baseline transition-transform group-hover/link:-translate-y-px group-hover/link:translate-x-px"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M3 9l6-6M4.5 3H9v4.5" />
      </svg>
      <span className="sr-only"> ({srText})</span>
    </a>
  );
}
