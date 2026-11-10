import { featuredProjects, otherProjects, profileLinks } from "../../content/projects";
import { es } from "../../i18n/es";

/**
 * Lo ÚNICO que el asistente sabe de Johan. Solo datos que ya son públicos en este sitio, en su LinkedIn o en su GitHub:
 * sin teléfono, correo, dirección ni fechas de grado. Si un dato no está aquí, el asistente debe decir que no lo sabe.
 */
const PROFILE_FACTS = [
  "Johan Moreno es Ingeniero de Sistemas (Universidad Católica Luis Amigó), de Apartadó, Urabá (Antioquia, Colombia).",
  "Desde agosto de 2026 hace sus prácticas como Practicante de Sistemas y Soporte TI en COMTIC, en Apartadó.",
  "Busca su primer empleo como desarrollador junior (full stack) y toma proyectos freelance de apps para negocios pequeños.",
  "Enfoque: desarrollo web full stack (Next.js, React, TypeScript, Supabase, Angular, NestJS, Node.js) e IA aplicada (modelos de lenguaje, RAG, voz, redes neuronales, visión por computador, Python).",
  "En la universidad trabajó con Scrum: tiene familiaridad con la metodología, no experiencia laboral con ella.",
  "Aprendizaje automático: lo conoce por proyectos propios (la red neuronal escrita desde cero y el clasificador de hojas de banano). No tiene experiencia laboral en aprendizaje automático.",
  "Idiomas: español nativo; inglés nivel B2 (certificación EF SET).",
  "Comanda y Polo Air Cool tienen usuarios reales; Barberías, Servitecas y Consultorio de psicología son demos.",
  `Dónde encontrarlo: LinkedIn ${profileLinks.linkedin} y GitHub ${profileLinks.github}.`,
];

function projectBlock(id: (typeof featuredProjects)[number]["id"]): string {
  const project = featuredProjects.find((p) => p.id === id)!;
  const text = es.projects.featured[id];
  const links = project.links.map((l) => `${l.kind}: ${l.href}`).join("; ");
  return [
    `- ${text.name}. ${text.lead}`,
    `  Dato medido: ${text.metricValue} ${text.metricLabel}.`,
    `  Tecnologías: ${project.stack.join(", ")}.`,
    `  Límites: ${text.limits}`,
    `  Enlaces → ${links}`,
  ].join("\n");
}

/** Texto de conocimiento que se inserta en el prompt del sistema. */
export function buildKnowledge(): string {
  const featured = featuredProjects.map((p) => projectBlock(p.id)).join("\n");
  const others = otherProjects
    .map((p) => `- ${es.projects.other[p.id].name}: ${es.projects.other[p.id].description}`)
    .join("\n");
  return [
    "SOBRE JOHAN",
    ...PROFILE_FACTS.map((fact) => `- ${fact}`),
    "",
    "PROYECTOS DESTACADOS (con lo que se midió en cada uno)",
    featured,
    "",
    "OTROS PROYECTOS",
    others,
    "",
    "ESTE SITIO",
    "- Es su portafolio: portada con una red neuronal en 3D, proyectos, un laboratorio con dos demos que corren en el navegador (la red de dígitos y el clasificador de hojas), este asistente y un contacto. Está hecho con Next.js y Three.js y desplegado en Vercel.",
  ].join("\n");
}
