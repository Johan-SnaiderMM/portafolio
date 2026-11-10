import type { ReactNode } from "react";

interface SectionProps {
  id: string;
  /** Nombre de la sección; va en la columna izquierda y nombra la región. */
  label: string;
  children: ReactNode;
  /** Clases extra para el contenedor interno (p. ej. más espacio abajo). */
  className?: string;
}

export function Section({ id, label, children, className = "" }: SectionProps) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-label`}
      className="border-t border-trazo"
    >
      <div
        className={`mx-auto grid max-w-6xl gap-8 px-5 py-20 sm:px-8 sm:py-28 lg:grid-cols-[11rem_1fr] lg:gap-12 ${className}`}
      >
        <h2
          id={`${id}-label`}
          className="font-mono text-[13px] text-ceniza lg:sticky lg:top-24 lg:self-start"
        >
          {label}
        </h2>
        <div>{children}</div>
      </div>
    </section>
  );
}
