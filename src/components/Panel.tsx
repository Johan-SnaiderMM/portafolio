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
      <h3 className="max-w-xl text-2xl/9 font-medium tracking-tight text-hueso sm:text-3xl/10">
        {heading}
      </h3>
      <p className="mt-4 max-w-xl text-ceniza">{text}</p>
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
