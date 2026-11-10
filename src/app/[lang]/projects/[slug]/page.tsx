import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProjectDetail } from "../../../../components/ProjectDetail";
import {
  coverPath,
  featuredProjects,
  siteName,
  type FeaturedId,
} from "../../../../content/projects";
import { getDictionary, hasLocale, locales } from "../../../../i18n";

export function generateStaticParams() {
  return locales.flatMap((lang) =>
    featuredProjects.map((project) => ({ lang, slug: project.id })),
  );
}

function findProject(slug: string): FeaturedId | null {
  return featuredProjects.find((project) => project.id === slug)?.id ?? null;
}

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/projects/[slug]">): Promise<Metadata> {
  const { lang, slug } = await params;
  const id = findProject(slug);
  if (!hasLocale(lang) || !id) return {};

  const text = getDictionary(lang).projects.featured[id];
  const title = `${text.name} · ${siteName}`;
  const path = `/${lang}/projects/${id}`;

  return {
    title,
    description: text.lead,
    alternates: {
      canonical: path,
      languages: {
        es: `/es/projects/${id}`,
        en: `/en/projects/${id}`,
        "x-default": `/es/projects/${id}`,
      },
    },
    openGraph: {
      type: "article",
      locale: lang === "es" ? "es_CO" : "en_US",
      title,
      description: text.lead,
      url: path,
      images: [{ url: coverPath(id), width: 1200, height: 630, alt: text.coverAlt }],
    },
  };
}

export default async function ProjectPage({
  params,
}: PageProps<"/[lang]/projects/[slug]">) {
  const { lang, slug } = await params;
  const id = findProject(slug);
  if (!hasLocale(lang) || !id) notFound();

  return (
    <main id="contenido">
      <ProjectDetail dict={getDictionary(lang)} locale={lang} projectId={id} />
    </main>
  );
}
