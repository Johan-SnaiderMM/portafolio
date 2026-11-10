import type { ReactNode } from "react";
import { ArrowUpRight } from "./icons";

interface LinkButtonProps {
  href: string;
  srText: string;
  /** `primary` es el botón ámbar; `secondary`, el de contorno. */
  variant: "primary" | "secondary";
  children: ReactNode;
}

/** Enlace externo con aspecto de botón (como los de la portada). */
export function LinkButton({ href, srText, variant, children }: LinkButtonProps) {
  const style =
    variant === "primary"
      ? "bg-ambar font-medium text-tinta hover:bg-hueso"
      : "border border-trazo text-hueso hover:border-ambar hover:text-ambar";

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`group/button inline-flex items-center gap-2 px-5 py-3 font-mono text-[13px] transition-colors ${style}`}
    >
      {children}
      <ArrowUpRight className="size-3 transition-transform group-hover/button:-translate-y-px group-hover/button:translate-x-px" />
      <span className="sr-only"> ({srText})</span>
    </a>
  );
}
