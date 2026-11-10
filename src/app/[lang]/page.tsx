import { notFound } from "next/navigation";
import { Hero } from "../../components/Hero";
import { Panel } from "../../components/Panel";
import { Projects } from "../../components/Projects";
import { Section } from "../../components/Section";
import { labDemoUrl, profileLinks } from "../../content/projects";
import { getDictionary, hasLocale } from "../../i18n";

export default async function HomePage({ params }: PageProps<"/[lang]">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();

  const dict = getDictionary(lang);
  const { opensInNewTab } = dict.common;

  return (
    <main id="contenido">
      <Hero dict={dict} />
      <Projects dict={dict} />

      <Section id="laboratorio" label={dict.nav.lab}>
        <Panel
          heading={dict.lab.heading}
          text={dict.lab.text}
          status={dict.lab.status}
          links={[{ label: dict.lab.linkLabel, href: labDemoUrl }]}
          opensInNewTab={opensInNewTab}
        />
      </Section>

      <Section id="agente" label={dict.nav.agent}>
        <Panel
          heading={dict.agent.heading}
          text={dict.agent.text}
          status={dict.agent.status}
          links={[{ label: dict.agent.linkLabel, href: profileLinks.linkedin }]}
          opensInNewTab={opensInNewTab}
        />
      </Section>

      {/* En pantallas angostas la red 3D se enciende debajo del contacto: se le deja sitio. */}
      <Section id="contacto" label={dict.nav.contact} className="max-lg:pb-80">
        <Panel
          heading={dict.contact.heading}
          text={dict.contact.text}
          status={dict.contact.status}
          links={[
            { label: dict.contact.linkedinLabel, href: profileLinks.linkedin },
            { label: dict.contact.githubLabel, href: profileLinks.github },
          ]}
          opensInNewTab={opensInNewTab}
        />
      </Section>
    </main>
  );
}
