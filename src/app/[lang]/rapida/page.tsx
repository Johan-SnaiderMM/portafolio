import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ExternalLink } from "../../../components/ExternalLink";
import {
  featuredProjects,
  otherProjects,
  profileLinks,
  siteName,
} from "../../../content/projects";
import { getDictionary, hasLocale } from "../../../i18n";

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/rapida">): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const { quick } = getDictionary(lang);
  return {
    title: quick.metaTitle,
    description: quick.metaDescription,
    alternates: {
      canonical: `/${lang}/rapida`,
      languages: { es: "/es/rapida", en: "/en/rapida", "x-default": "/es/rapida" },
    },
  };
}

/**
 * «Versión rápida»: toda la información esencial en una página de texto, sin animaciones, sin 3D y sin JavaScript propio.
 * Pensada para quien solo quiere leer rápido (reclutamiento) o para conexiones lentas.
 */
export default async function QuickPage({ params }: PageProps<"/[lang]/rapida">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();

  const dict = getDictionary(lang);
  const { quick, hero, common } = dict;
  const opens = common.opensInNewTab;

  return (
    <main id="contenido" className="mx-auto max-w-3xl px-5 pb-24 pt-12 sm:px-8 sm:pt-16">
      <p className="font-mono text-[13px] text-ceniza">{quick.intro}</p>
      <h1 className="mt-4 font-mono text-4xl font-light tracking-[-0.04em] text-hueso sm:text-5xl">
        {siteName}
      </h1>
      <p className="mt-3 font-mono text-[13px] text-ceniza">{hero.status}</p>
      <p className="mt-6 text-lg/8 text-hueso/90">{hero.lead}</p>
      <p className="mt-4 text-[15px]/7 text-ceniza">{hero.availability}</p>

      <p className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 font-mono text-[13px]">
        <a
          href={dict.contact.cvFile}
          download
          className="bg-ambar px-4 py-2.5 font-medium text-tinta hover:bg-hueso"
        >
          {quick.cv} ↓
        </a>
        <ExternalLink href={profileLinks.linkedin} srText={opens}>
          {dict.contact.linkedinLabel}
        </ExternalLink>
        <ExternalLink href={profileLinks.github} srText={opens}>
          {dict.contact.githubLabel}
        </ExternalLink>
      </p>

      <h2 className="mt-14 border-t border-trazo pt-8 font-mono text-[13px] text-ceniza">
        {quick.projectsTitle}
      </h2>
      <ul className="mt-6 space-y-9">
        {featuredProjects.map((project) => {
          const text = dict.projects.featured[project.id];
          return (
            <li key={project.id}>
              <h3 className="text-xl font-medium text-hueso">{text.name}</h3>
              <p className="mt-2 text-[15px]/7 text-ceniza">{text.summary}</p>
              <p className="mt-2 text-[15px]/7 text-hueso">
                <span className="font-mono text-ambar">{text.metricValue}</span>{" "}
                {text.metricLabel}
              </p>
              <p className="mt-1 font-mono text-xs text-ceniza">
                {project.stack.join(" · ")}
              </p>
              <p className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 font-mono text-[13px]">
                <Link
                  href={`/${lang}/projects/${project.id}`}
                  className="text-ambar underline-offset-4 hover:underline"
                >
                  {quick.seeProject} →
                </Link>
                {project.links.map((link) => (
                  <ExternalLink key={link.href} href={link.href} srText={opens}>
                    {common.links[link.kind]}
                  </ExternalLink>
                ))}
              </p>
            </li>
          );
        })}
      </ul>

      <h2 className="mt-14 border-t border-trazo pt-8 font-mono text-[13px] text-ceniza">
        {quick.otherTitle}
      </h2>
      <ul className="mt-6 space-y-4">
        {otherProjects.map((project) => {
          const text = dict.projects.other[project.id];
          return (
            <li key={project.id} className="text-[15px]/7">
              <span className="font-medium text-hueso">{text.name}</span>
              <span className="text-ceniza"> — {text.description}</span>
              <span className="ml-3 inline-flex flex-wrap gap-x-4 font-mono text-[13px]">
                {project.links.map((link) => (
                  <ExternalLink key={link.href} href={link.href} srText={opens}>
                    {common.links[link.kind]}
                  </ExternalLink>
                ))}
              </span>
            </li>
          );
        })}
      </ul>

      <h2 className="mt-14 border-t border-trazo pt-8 font-mono text-[13px] text-ceniza">
        {quick.contactTitle}
      </h2>
      <p className="mt-4 max-w-xl text-[15px]/7 text-hueso/90">{quick.contactText}</p>
      <p className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-3 font-mono text-[13px]">
        <Link
          href={`/${lang}#contacto`}
          className="text-ambar underline-offset-4 hover:underline"
        >
          {quick.contactLink} →
        </Link>
        <Link
          href={`/${lang}`}
          className="text-ceniza underline-offset-4 hover:text-ambar hover:underline"
        >
          {quick.fullSite} →
        </Link>
      </p>
    </main>
  );
}
