import { ExternalLink } from "./ExternalLink";
import { StatusChip } from "./StatusChip";

interface PanelProps {
  heading: string;
  text: string;
  status: string;
  links: readonly { label: string; href: string }[];
  opensInNewTab: string;
}

/** Cuerpo de las secciones que todavía están en construcción. */
export function Panel({
  heading,
  text,
  status,
  links,
  opensInNewTab,
}: PanelProps) {
  return (
    <>
      {/* Ancho limitado: a la derecha vive la red 3D y no debe pisar el texto. */}
      <h3 className="max-w-[30rem] text-2xl/9 font-medium tracking-tight text-hueso sm:text-3xl/10">
        {heading}
      </h3>
      <p className="mt-4 max-w-[30rem] text-ceniza">{text}</p>
      <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-4 font-mono text-[13px]">
        <StatusChip>{status}</StatusChip>
        {links.map((link) => (
          <ExternalLink
            key={link.href}
            href={link.href}
            srText={opensInNewTab}
          >
            {link.label}
          </ExternalLink>
        ))}
      </div>
    </>
  );
}
