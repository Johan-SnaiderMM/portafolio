import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import {
  COVER_SIZE,
  coverPath,
  featuredProjects,
  type FeaturedId,
} from "../content/projects";
import type { Dictionary, Locale } from "../i18n";
import { ArrowHorizontal } from "./icons";
import { LinkButton } from "./LinkButton";
import { Metric } from "./Metric";

function Row({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section
      aria-labelledby={id}
      className="grid gap-4 border-t border-trazo py-10 lg:grid-cols-[11rem_1fr] lg:gap-12"
    >
      <h2 id={id} className="font-mono text-[13px] text-ceniza">
        {title}
      </h2>
      <div>{children}</div>
    </section>
  );
}

export function ProjectDetail({
  dict,
  locale,
  projectId,
}: {
  dict: Dictionary;
  locale: Locale;
  projectId: FeaturedId;
}) {
  const { projects, common } = dict;
  const { detail } = projects;
  const index = featuredProjects.findIndex((p) => p.id === projectId);
  const project = featuredProjects[index];
  const text = projects.featured[projectId];
  const previous = featuredProjects[index - 1];
  const next = featuredProjects[index + 1];

  return (
    <article className="mx-auto max-w-6xl px-5 pb-24 pt-10 sm:px-8 sm:pt-14">
      <Link
        href={`/${locale}#proyectos`}
        className="group/back inline-flex items-center gap-2 font-mono text-[13px] text-ceniza transition-colors hover:text-ambar"
      >
        <ArrowHorizontal
          direction="left"
          className="size-3.5 transition-transform group-hover/back:-translate-x-0.5"
        />
        {detail.back}
      </Link>

      <h1 className="mt-10 font-mono text-[clamp(2.25rem,6.5vw,4.5rem)] font-light leading-[1.02] tracking-[-0.045em] text-hueso [font-stretch:88%]">
        {text.name}
      </h1>
      <p className="mt-6 max-w-2xl text-xl/8 text-hueso/90">{text.lead}</p>

      <div className="mt-10 flex flex-wrap items-end gap-x-14 gap-y-8">
        <Metric value={text.metricValue} label={text.metricLabel} large />
        <div className="flex flex-wrap gap-3">
          {project.links.map((link, i) => (
            <LinkButton
              key={link.href}
              href={link.href}
              srText={common.opensInNewTab}
              variant={i === 0 ? "primary" : "secondary"}
            >
              {common.links[link.kind]}
            </LinkButton>
          ))}
        </div>
      </div>

      <figure className="mt-14 border border-trazo bg-hollin">
        <Image
          src={coverPath(projectId)}
          alt={text.coverAlt}
          width={COVER_SIZE.width}
          height={COVER_SIZE.height}
          sizes="(min-width: 1152px) 1088px, 100vw"
          priority
          className="h-auto w-full"
        />
      </figure>

      <div className="mt-14">
        <Row id="detalle-que-hace" title={detail.highlightsTitle}>
          <ul className="max-w-2xl space-y-4">
            {text.highlights.map((item) => (
              <li
                key={item}
                className="relative pl-6 text-[15px]/7 text-hueso/90 before:absolute before:left-0 before:top-[0.65rem] before:size-1.5 before:bg-ambar"
              >
                {item}
              </li>
            ))}
          </ul>
        </Row>

        <Row id="detalle-tecnologias" title={detail.stackTitle}>
          <ul className="flex flex-wrap gap-2 font-mono text-xs text-hueso">
            {project.stack.map((tech) => (
              <li key={tech} className="border border-trazo px-3 py-1.5">
                {tech}
              </li>
            ))}
          </ul>
        </Row>

        <Row id="detalle-limites" title={detail.limitsTitle}>
          <p className="max-w-2xl text-[15px]/7 text-ceniza">{text.limits}</p>
        </Row>
      </div>

      <nav
        aria-label={detail.navLabel}
        className="grid gap-px border-y border-trazo bg-trazo sm:grid-cols-2"
      >
        {[
          { target: previous, label: detail.previous, direction: "left" as const },
          { target: next, label: detail.next, direction: "right" as const },
        ].map(({ target, label, direction }) =>
          target ? (
            <Link
              key={direction}
              href={`/${locale}/projects/${target.id}`}
              className={`group/nav flex flex-col gap-1 bg-tinta px-5 py-6 transition-colors hover:bg-hollin ${
                direction === "right" ? "sm:items-end sm:text-right" : ""
              }`}
            >
              <span className="inline-flex items-center gap-2 font-mono text-xs text-ceniza">
                {direction === "left" && <ArrowHorizontal direction="left" className="size-3" />}
                {label}
                {direction === "right" && <ArrowHorizontal direction="right" className="size-3" />}
              </span>
              <span className="text-lg font-medium text-hueso transition-colors group-hover/nav:text-ambar">
                {projects.featured[target.id].name}
              </span>
            </Link>
          ) : (
            <div key={direction} className="hidden bg-tinta sm:block" />
          ),
        )}
      </nav>
    </article>
  );
}
