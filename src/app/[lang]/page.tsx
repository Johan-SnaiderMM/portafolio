import { notFound } from "next/navigation";
import { AgentChat } from "../../components/agent/AgentChat";
import { Hero } from "../../components/Hero";
import { Lab } from "../../components/Lab";
import { Panel } from "../../components/Panel";
import { Projects } from "../../components/Projects";
import { Section } from "../../components/Section";
import { profileLinks } from "../../content/projects";
import { getDictionary, hasLocale } from "../../i18n";

export default async function HomePage({ params }: PageProps<"/[lang]">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();

  const dict = getDictionary(lang);
  const { opensInNewTab } = dict.common;

  return (
    <main id="contenido">
      <Hero dict={dict} />
      <Projects dict={dict} locale={lang} />

      <Section id="laboratorio" label={dict.nav.lab}>
        <Lab dict={dict} locale={lang} />
      </Section>

      <Section id="agente" label={dict.nav.agent}>
        <h3 className="max-w-[30rem] text-2xl/9 font-medium tracking-tight text-hueso sm:text-3xl/10">
          {dict.agent.heading}
        </h3>
        <p className="mt-4 max-w-[30rem] text-ceniza">{dict.agent.text}</p>
        <div className="mt-10 max-w-3xl">
          <AgentChat
            text={dict.agent}
            locale={lang}
            contactHref={profileLinks.linkedin}
          />
        </div>
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
