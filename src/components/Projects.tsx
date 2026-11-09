import {
  featuredProjects,
  otherProjects,
  type ProjectLink,
} from "../content/projects";
import type { Dictionary } from "../i18n";
import { ExternalLink } from "./ExternalLink";
import { Section } from "./Section";

function ProjectLinks({
  links,
  dict,
  className = "",
}: {
  links: readonly ProjectLink[];
  dict: Dictionary;
  className?: string;
}) {
  return (
    <p
      className={`flex flex-wrap gap-x-5 gap-y-2 font-mono text-[13px] ${className}`}
    >
      {links.map((link) => (
        <ExternalLink
          key={link.href}
          href={link.href}
          srText={dict.common.opensInNewTab}
        >
          {dict.common.links[link.kind]}
        </ExternalLink>
      ))}
    </p>
  );
}

export function Projects({ dict }: { dict: Dictionary }) {
  const { projects } = dict;

  return (
    <Section id="proyectos" label={dict.nav.projects}>
      <p className="max-w-2xl text-xl/8 text-hueso sm:text-2xl/9">
        {projects.intro}
      </p>

      <ul className="mt-12 border-t border-trazo">
        {featuredProjects.map((project) => {
          const text = projects.featured[project.id];
          const compact = text.metricValue.length > 8;

          return (
            <li key={project.id} className="reveal border-b border-trazo">
              <article className="grid gap-7 py-9 sm:py-11 md:grid-cols-[1fr_16rem] md:gap-12">
                <div>
                  <h3 className="text-2xl font-medium tracking-tight text-hueso sm:text-[1.75rem]/9">
                    {text.name}
                  </h3>
                  <p className="mt-3 max-w-xl text-[15px]/7 text-ceniza">
                    {text.summary}
                  </p>
                  <ul className="mt-5 flex flex-wrap gap-x-4 gap-y-1 font-mono text-xs text-ceniza">
                    {project.stack.map((tech) => (
                      <li key={tech}>{tech}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <p
                    className={`font-mono leading-none tracking-tight text-ambar ${
                      compact ? "text-xl/7" : "text-4xl"
                    }`}
                  >
                    {text.metricValue}
                  </p>
                  <p className="mt-2 text-sm/5 text-ceniza">
                    {text.metricLabel}
                  </p>
                  <ProjectLinks
                    links={project.links}
                    dict={dict}
                    className="mt-6"
                  />
                </div>
              </article>
            </li>
          );
        })}
      </ul>

      <p className="mt-6 max-w-2xl text-sm/6 text-ceniza">{projects.note}</p>

      <h3 className="mt-20 font-mono text-[13px] text-ceniza">
        {projects.otherTitle}
      </h3>
      <ul className="mt-5 divide-y divide-trazo border-y border-trazo">
        {otherProjects.map((project) => {
          const text = projects.other[project.id];
          return (
            <li
              key={project.id}
              className="grid gap-2 py-5 sm:grid-cols-[13rem_1fr] sm:gap-8"
            >
              <h4 className="font-medium text-hueso">{text.name}</h4>
              <div>
                <p className="max-w-xl text-[15px]/7 text-ceniza">
                  {text.description}
                </p>
                <ProjectLinks
                  links={project.links}
                  dict={dict}
                  className="mt-3"
                />
              </div>
            </li>
          );
        })}
      </ul>
    </Section>
  );
}
