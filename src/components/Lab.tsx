import Link from "next/link";
import { featuredProjects, type FeaturedId } from "../content/projects";
import type { Dictionary, Locale } from "../i18n";
import { ExternalLink } from "./ExternalLink";
import { DigitsLab } from "./lab/DigitsLab";
import { LeavesLab } from "./lab/LeavesLab";

const DATASET_URL = "https://doi.org/10.17632/9tb7k297ff.1";

/** Enlaces de cada demo: la página del proyecto y su código. */
function DemoLinks({
  id,
  seeProject,
  dict,
  locale,
  children,
}: {
  id: FeaturedId;
  seeProject: string;
  dict: Dictionary;
  locale: Locale;
  children?: React.ReactNode;
}) {
  const code = featuredProjects
    .find((project) => project.id === id)
    ?.links.find((link) => link.kind === "code");
  return (
    <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-3 font-mono text-[13px]">
      <Link
        href={`/${locale}/projects/${id}`}
        className="text-ambar underline-offset-4 hover:underline"
      >
        {seeProject} →
      </Link>
      {code && (
        <ExternalLink href={code.href} srText={dict.common.opensInNewTab}>
          {dict.common.links.code}
        </ExternalLink>
      )}
      {children}
    </div>
  );
}

/** Sección «Laboratorio»: demos que corren en el navegador de quien visita. */
export function Lab({ dict, locale }: { dict: Dictionary; locale: Locale }) {
  const { lab } = dict;
  return (
    <>
      {/* Ancho limitado: a la derecha vive la red 3D y no debe pisar el texto. */}
      <h3 className="max-w-[30rem] text-2xl/9 font-medium tracking-tight text-hueso sm:text-3xl/10">
        {lab.heading}
      </h3>
      <p className="mt-4 max-w-[30rem] text-ceniza">{lab.text}</p>

      <div className="mt-10">
        <DigitsLab text={lab.digits} locale={locale} />
        <DemoLinks
          id="red-neuronal"
          seeProject={lab.digits.seeProject}
          dict={dict}
          locale={locale}
        />
      </div>

      <div className="mt-14">
        <LeavesLab text={lab.leaves} locale={locale} />
        <DemoLinks
          id="hojas-banano"
          seeProject={lab.leaves.seeProject}
          dict={dict}
          locale={locale}
        >
          <ExternalLink href={DATASET_URL} srText={dict.common.opensInNewTab}>
            doi:10.17632/9tb7k297ff.1
          </ExternalLink>
        </DemoLinks>
        <p className="mt-3 max-w-3xl text-xs/5 text-ceniza">
          {lab.leaves.credit}
        </p>
      </div>
    </>
  );
}
