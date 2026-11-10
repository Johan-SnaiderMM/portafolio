import { describe, expect, it } from "vitest";
import { featuredProjects, otherProjects } from "../content/projects";
import { en } from "./en";
import { es } from "./es";

/** Aplana un objeto en pares «ruta → texto». */
function flatten(value: unknown, path = ""): [string, string][] {
  if (typeof value === "string") return [[path, value]];
  if (value && typeof value === "object") {
    return Object.entries(value).flatMap(([key, child]) =>
      flatten(child, path ? `${path}.${key}` : key),
    );
  }
  return [];
}

const spanish = flatten(es);
const english = flatten(en);

describe("diccionarios", () => {
  it("tienen exactamente las mismas claves en español e inglés", () => {
    expect(english.map(([path]) => path)).toEqual(spanish.map(([path]) => path));
  });

  it("no tienen textos vacíos ni marcas pendientes", () => {
    for (const [path, text] of [...spanish, ...english]) {
      expect(text.trim(), path).not.toBe("");
      expect(text, path).not.toMatch(/\b(?:TODO|FIXME)\b|[Ll]orem ipsum/);
    }
  });

  it("usan el formato de número de cada idioma en las cifras medidas", () => {
    const medidas = ["98,1", "98,5", "86,5"];
    for (const [path, text] of spanish) {
      for (const cifra of medidas) {
        expect(text, `es.${path}`).not.toContain(cifra.replace(",", "."));
      }
      expect(text, `es.${path}`).not.toContain("10,000");
    }
    for (const [path, text] of english) {
      for (const cifra of medidas) {
        expect(text, `en.${path}`).not.toContain(cifra);
      }
      expect(text, `en.${path}`).not.toContain("10 000");
    }
  });

  it("describen cada proyecto con texto en los dos idiomas", () => {
    for (const { id } of featuredProjects) {
      expect(es.projects.featured[id].name).toBeTruthy();
      expect(en.projects.featured[id].name).toBeTruthy();
    }
    for (const { id } of otherProjects) {
      expect(es.projects.other[id].name).toBeTruthy();
      expect(en.projects.other[id].name).toBeTruthy();
    }
  });
});

describe("datos de proyectos", () => {
  const all = [...featuredProjects, ...otherProjects];

  it("no repiten identificadores", () => {
    const ids = all.map((project) => project.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("solo enlazan por https y sin repetir enlaces dentro del proyecto", () => {
    for (const project of all) {
      const hrefs = project.links.map((link) => link.href);
      expect(new Set(hrefs).size, project.id).toBe(hrefs.length);
      for (const href of hrefs) {
        expect(href, project.id).toMatch(/^https:\/\//);
      }
    }
  });

  it("cada proyecto tiene al menos un enlace y una tecnología", () => {
    for (const project of all) {
      expect(project.links.length, project.id).toBeGreaterThan(0);
      expect(project.stack.length, project.id).toBeGreaterThan(0);
    }
  });
});
