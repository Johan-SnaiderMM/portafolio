// Comprueba que todos los enlaces de proyectos y del perfil responden.
//   node scripts/revisar-enlaces.mjs
// Usa el «type stripping» de Node 22.18+/24 para leer los datos en TypeScript.
import { featuredProjects, otherProjects, profileLinks, labDemoUrl } from "../src/content/projects.ts";

const links = new Map();
const add = (label, href) => links.set(href, [...(links.get(href) ?? []), label]);
for (const project of [...featuredProjects, ...otherProjects]) {
  for (const link of project.links) add(`${project.id} (${link.kind})`, link.href);
}
for (const [name, href] of Object.entries(profileLinks)) add(`perfil ${name}`, href);
add("laboratorio", labDemoUrl);

async function check(href) {
  const attempt = async (method) => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 20000);
    try {
      return await fetch(href, {
        method,
        redirect: "follow",
        signal: controller.signal,
        headers: { "user-agent": "Mozilla/5.0 (revisor de enlaces del portafolio)" },
      });
    } finally {
      clearTimeout(timer);
    }
  };
  try {
    let response = await attempt("HEAD");
    if (response.status >= 400) response = await attempt("GET");
    return { status: response.status, final: response.url };
  } catch (error) {
    return { status: 0, error: error.name === "AbortError" ? "tiempo agotado" : error.message };
  }
}

let failures = 0;
const results = await Promise.all([...links.keys()].map(async (href) => [href, await check(href)]));
for (const [href, result] of results) {
  // LinkedIn responde 999 a cualquier revisor automático aunque el perfil exista.
  const blockedByLinkedIn = href.includes("linkedin.com") && result.status === 999;
  const ok = (result.status >= 200 && result.status < 400) || blockedByLinkedIn;
  if (!ok) failures += 1;
  const moved = result.final && result.final !== href ? `  → ${result.final}` : "";
  console.log(`${ok ? "OK " : "FALLA"} ${result.status || result.error}  ${href}  [${links.get(href).join(", ")}]${moved}`);
}
console.log(failures ? `\n${failures} enlace(s) con problemas.` : `\nLos ${links.size} enlaces responden.`);
process.exit(failures ? 1 : 0);
