interface MetricProps {
  value: string;
  label: string;
  /** Más grande, para la página de detalle. */
  large?: boolean;
}

/** Cifra del proyecto: un número corto va grande; un texto largo, más pequeño. */
export function Metric({ value, label, large = false }: MetricProps) {
  const compact = value.length > 8;
  const size = large
    ? compact
      ? "text-2xl/8"
      : "text-5xl"
    : compact
      ? "text-xl/7"
      : "text-4xl";

  return (
    <div>
      <p className={`font-mono leading-none tracking-tight text-ambar ${size}`}>
        {value}
      </p>
      <p className="mt-2 max-w-[16rem] text-sm/5 text-ceniza">{label}</p>
    </div>
  );
}
