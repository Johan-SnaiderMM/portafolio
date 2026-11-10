import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { getDictionary, locales } from "../i18n";
import { coverPath, featuredProjects } from "./projects";

describe("proyectos destacados", () => {
  it("son cinco y cada uno tiene su portada en public/projects", () => {
    expect(featuredProjects).toHaveLength(5);
    for (const project of featuredProjects) {
      const file = join(process.cwd(), "public", coverPath(project.id));
      expect(existsSync(file), file).toBe(true);
    }
  });

  it("tienen textos de detalle completos en todos los idiomas", () => {
    for (const locale of locales) {
      const dict = getDictionary(locale);
      for (const project of featuredProjects) {
        const text = dict.projects.featured[project.id];
        expect(text.lead.length, `${locale}/${project.id} lead`).toBeGreaterThan(40);
        expect(text.highlights.length, `${locale}/${project.id} highlights`).toBeGreaterThan(1);
        expect(text.limits.length, `${locale}/${project.id} limits`).toBeGreaterThan(20);
        expect(text.coverAlt.length, `${locale}/${project.id} coverAlt`).toBeGreaterThan(10);
      }
    }
  });

  it("todos los enlaces son https", () => {
    for (const project of featuredProjects) {
      for (const link of project.links) expect(link.href).toMatch(/^https:\/\//);
    }
  });
});
