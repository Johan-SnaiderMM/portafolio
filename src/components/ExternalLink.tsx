import type { ReactNode } from "react";
import { ArrowUpRight } from "./icons";

interface ExternalLinkProps {
  href: string;
  /** Texto para lectores de pantalla, p. ej. «se abre en una pestaña nueva». */
  srText: string;
  children: ReactNode;
  className?: string;
}

const ARROW = (
  <ArrowUpRight className="ml-1.5 inline-block size-3 align-baseline transition-transform group-hover/link:-translate-y-px group-hover/link:translate-x-px" />
);

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
  // La flecha va pegada a la última palabra: si el texto ocupa dos renglones,
  // nunca queda sola en el segundo.
  let label: ReactNode;
  if (typeof children === "string" && children.includes(" ")) {
    const cut = children.lastIndexOf(" ");
    label = (
      <>
        {children.slice(0, cut)}{" "}
        <span className="whitespace-nowrap">
          {children.slice(cut + 1)}
          {ARROW}
        </span>
      </>
    );
  } else {
    label = (
      <>
        {children}
        {ARROW}
      </>
    );
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`group/link text-hueso underline decoration-trazo decoration-1 underline-offset-[5px] transition-colors hover:text-ambar hover:decoration-ambar ${className}`}
    >
      {label}
      <span className="sr-only"> ({srText})</span>
    </a>
  );
}
