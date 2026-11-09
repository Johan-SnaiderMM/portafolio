import { describe, expect, it } from "vitest";
import { negotiateLocale } from "./negotiate";

describe("negotiateLocale", () => {
  it("usa español si no hay cabecera", () => {
    expect(negotiateLocale(null)).toBe("es");
    expect(negotiateLocale(undefined)).toBe("es");
    expect(negotiateLocale("")).toBe("es");
  });

  it("elige inglés cuando es la primera preferencia", () => {
    expect(negotiateLocale("en-US,en;q=0.9,es;q=0.8")).toBe("en");
  });

  it("elige español cuando es la primera preferencia", () => {
    expect(negotiateLocale("es-CO,es;q=0.9,en;q=0.8")).toBe("es");
  });

  it("respeta los pesos q aunque no estén en orden", () => {
    expect(negotiateLocale("es;q=0.3,en;q=0.9")).toBe("en");
  });

  it("salta idiomas que el sitio no ofrece", () => {
    expect(negotiateLocale("fr-FR,fr;q=0.9,en;q=0.5")).toBe("en");
  });

  it("vuelve a español si ningún idioma coincide", () => {
    expect(negotiateLocale("fr-FR,fr;q=0.9,de;q=0.5")).toBe("es");
    expect(negotiateLocale("*")).toBe("es");
  });

  it("ignora los idiomas con peso cero", () => {
    expect(negotiateLocale("en;q=0,es;q=0.5")).toBe("es");
  });

  it("no se rompe con basura", () => {
    expect(negotiateLocale(";;;,,,q=")).toBe("es");
  });
});
