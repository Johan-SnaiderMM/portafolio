const base = {
  "aria-hidden": true,
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.4,
  strokeLinecap: "round",
  strokeLinejoin: "round",
} as const;

/** Flecha hacia arriba y a la derecha: marca los enlaces que salen del sitio. */
export function ArrowUpRight({ className = "size-3" }: { className?: string }) {
  return (
    <svg viewBox="0 0 12 12" className={className} {...base}>
      <path d="M3 9l6-6M4.5 3H9v4.5" />
    </svg>
  );
}

/** Flecha horizontal; `direction` dice hacia dónde apunta. */
export function ArrowHorizontal({
  direction,
  className = "size-3.5",
}: {
  direction: "left" | "right";
  className?: string;
}) {
  return (
    <svg viewBox="0 0 14 14" className={className} {...base}>
      <path d={direction === "left" ? "M12 7H2M6 3L2 7l4 4" : "M2 7h10M8 3l4 4-4 4"} />
    </svg>
  );
}
