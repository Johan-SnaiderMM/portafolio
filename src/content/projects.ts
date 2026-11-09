/**
 * Datos de los proyectos que no dependen del idioma (nombre de la tecnología,
 * enlaces). Los textos traducidos viven en `src/i18n`.
 * Fuente: README del perfil de GitHub (Johan-SnaiderMM) y perfil de LinkedIn.
 */

export type LinkKind = "demo" | "site" | "code";

export interface ProjectLink {
  kind: LinkKind;
  href: string;
}

interface ProjectData {
  id: string;
  stack: readonly string[];
  links: readonly ProjectLink[];
}

export const featuredProjects = [
  {
    id: "mesa-ayuda",
    stack: ["Angular", "NestJS", "Prisma", "PostgreSQL"],
    links: [
      { kind: "demo", href: "https://mesa-ayuda-ti-sandy.vercel.app" },
      { kind: "code", href: "https://github.com/Johan-SnaiderMM/mesa-ayuda-ti" },
    ],
  },
  {
    id: "red-neuronal",
    stack: ["Python", "NumPy", "Next.js", "TypeScript"],
    links: [
      { kind: "demo", href: "https://red-neuronal-desde-cero.vercel.app" },
      {
        kind: "code",
        href: "https://github.com/Johan-SnaiderMM/red-neuronal-desde-cero",
      },
    ],
  },
  {
    id: "hojas-banano",
    stack: ["Python", "PyTorch", "ONNX", "Next.js"],
    links: [
      { kind: "demo", href: "https://clasificador-hojas-banano.vercel.app" },
      {
        kind: "code",
        href: "https://github.com/Johan-SnaiderMM/clasificador-hojas-banano",
      },
    ],
  },
  {
    id: "origenes",
    stack: ["React", "Express", "Three.js", "Llama 3.3"],
    links: [
      { kind: "site", href: "https://www.aruma-origenes.com/login" },
      { kind: "code", href: "https://github.com/Johan-SnaiderMM/origenes" },
    ],
  },
  {
    id: "comanda",
    stack: ["Next.js", "TypeScript", "Supabase"],
    links: [
      { kind: "demo", href: "https://comandacomi.vercel.app" },
      { kind: "code", href: "https://github.com/Johan-SnaiderMM/comandacomi" },
    ],
  },
] as const satisfies readonly ProjectData[];

export type FeaturedId = (typeof featuredProjects)[number]["id"];

export const otherProjects = [
  {
    id: "polo-air-cool",
    stack: ["Next.js", "Supabase"],
    links: [
      { kind: "site", href: "https://polo-air-cool.vercel.app" },
      { kind: "code", href: "https://github.com/Johan-SnaiderMM/Air-Polo-Cool" },
    ],
  },
  {
    id: "barberias",
    stack: ["Next.js", "Supabase"],
    links: [
      { kind: "demo", href: "https://barberias-demo-lyart.vercel.app" },
      { kind: "code", href: "https://github.com/Johan-SnaiderMM/barberias" },
    ],
  },
  {
    id: "servitecas",
    stack: ["Next.js", "Supabase"],
    links: [
      { kind: "demo", href: "https://servitecas.vercel.app" },
      { kind: "code", href: "https://github.com/Johan-SnaiderMM/servitecas" },
    ],
  },
  {
    id: "consultorio",
    stack: ["Node.js", "PostgreSQL"],
    links: [
      { kind: "demo", href: "https://consultorio-psicologia-demo.vercel.app" },
      {
        kind: "code",
        href: "https://github.com/Johan-SnaiderMM/Consultorio_Psicologia",
      },
    ],
  },
  {
    id: "reporte-ambiental",
    stack: ["Vite", "Leaflet", "Supabase"],
    links: [
      { kind: "code", href: "https://github.com/Johan-SnaiderMM/Proyecto-Corpouraba" },
    ],
  },
] as const satisfies readonly ProjectData[];

export type OtherId = (typeof otherProjects)[number]["id"];

export const profileLinks = {
  github: "https://github.com/Johan-SnaiderMM",
  linkedin: "https://www.linkedin.com/in/johan-snaider-moreno-murillo-0168761b0",
} as const;

/** Demo completa de la red neuronal, mientras el laboratorio no esté listo. */
export const labDemoUrl = "https://red-neuronal-desde-cero.vercel.app";

export const siteName = "Johan Moreno";
