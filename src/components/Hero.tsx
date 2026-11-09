import { siteName } from "../content/projects";
import type { Dictionary } from "../i18n";
import { NetworkDiagram } from "./NetworkDiagram";

export function Hero({ dict }: { dict: Dictionary }) {
  const { hero } = dict;
  const [first, ...rest] = siteName.split(" ");

  return (
    <section
      id="inicio"
      aria-label={siteName}
      className="relative isolate overflow-hidden"
    >
      {/* Un único resplandor tenue, como el brillo de un monitor de fósforo. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-40 -top-40 -z-10 size-[44rem] rounded-full bg-[radial-gradient(closest-side,rgb(255_176_32/0.09),transparent)]"
      />

      <div className="mx-auto grid max-w-6xl items-center gap-14 px-5 pb-24 pt-16 sm:px-8 sm:pt-24 lg:grid-cols-[1.1fr_0.9fr] lg:gap-10 lg:pb-32 lg:pt-28">
        <div>
          <p
            className="rise font-mono text-[13px] text-ceniza"
            style={{ "--i": 0 } as React.CSSProperties}
          >
            {hero.status}
          </p>

          <h1
            className="rise mt-6 font-mono text-[clamp(3rem,11.5vw,7.25rem)] font-light leading-[0.92] tracking-[-0.055em] text-hueso [font-stretch:88%]"
            style={{ "--i": 1 } as React.CSSProperties}
          >
            <span className="block">{first}</span>{" "}
            <span className="block">{rest.join(" ")}</span>
          </h1>

          <p
            className="rise mt-9 max-w-[34rem] text-lg/8 text-hueso/85"
            style={{ "--i": 2 } as React.CSSProperties}
          >
            {hero.lead}
          </p>

          <div
            className="rise mt-10 flex flex-wrap gap-3 font-mono text-[13px]"
            style={{ "--i": 3 } as React.CSSProperties}
          >
            <a
              href="#proyectos"
              className="bg-ambar px-5 py-3 font-medium text-tinta transition-colors hover:bg-hueso"
            >
              {hero.ctaProjects}
            </a>
            <a
              href="#contacto"
              className="border border-trazo px-5 py-3 text-hueso transition-colors hover:border-ambar hover:text-ambar"
            >
              {hero.ctaContact}
            </a>
          </div>

          <p
            className="rise mt-10 flex max-w-[34rem] items-start gap-3 text-sm/6 text-ceniza"
            style={{ "--i": 4 } as React.CSSProperties}
          >
            <span aria-hidden="true" className="mt-2 size-1.5 shrink-0 bg-ambar" />
            {hero.availability}
          </p>
        </div>

        <div
          className="rise justify-self-start lg:justify-self-end"
          style={{ "--i": 2 } as React.CSSProperties}
        >
          <NetworkDiagram
            label={hero.networkLabel}
            caption={hero.networkCaption}
          />
        </div>
      </div>
    </section>
  );
}
