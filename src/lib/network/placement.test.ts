import { describe, expect, it } from "vitest";
import {
  clamp01,
  computePlacement,
  contactProgress,
  isWide,
  lerp,
  smooth,
  type PlacementInput,
} from "./placement";

const wide: PlacementInput = {
  scrollY: 0,
  viewportW: 1280,
  viewportH: 800,
  slot: { x: 700, y: 300, width: 480, height: 340 },
  heroHeight: 760,
  contactIn: 0,
};

const narrow: PlacementInput = {
  scrollY: 0,
  viewportW: 390,
  viewportH: 844,
  slot: { x: 20, y: 640, width: 350, height: 250 },
  heroHeight: 1100,
  contactIn: 0,
};

describe("ayudas numéricas", () => {
  it("clamp01 y lerp", () => {
    expect(clamp01(-3)).toBe(0);
    expect(clamp01(4)).toBe(1);
    expect(clamp01(0.4)).toBe(0.4);
    expect(lerp(10, 20, 0.25)).toBe(12.5);
  });

  it("smooth sube de 0 a 1 sin pasarse", () => {
    expect(smooth(-1)).toBe(0);
    expect(smooth(0)).toBe(0);
    expect(smooth(0.5)).toBe(0.5);
    expect(smooth(1)).toBe(1);
    expect(smooth(2)).toBe(1);
  });

  it("isWide distingue escritorio de celular", () => {
    expect(isWide(1280, 800)).toBe(true);
    expect(isWide(390, 844)).toBe(false);
    expect(isWide(1000, 1000)).toBe(false);
    expect(isWide(820, 1180)).toBe(false);
  });
});

describe("computePlacement en pantalla ancha", () => {
  it("arriba del todo nace en el hueco de la portada, sin ordenar", () => {
    const p = computePlacement(wide);
    expect(p.dock).toBe(0);
    expect(p.morph).toBe(0);
    expect(p.output).toBe(0);
    expect(p.cx).toBe(940);
    expect(p.cy).toBe(470);
    expect(p.widthPx).toBe(480);
    expect(p.alpha).toBe(1);
  });

  it("al salir la portada queda ordenada y acoplada detrás del texto, muy tenue", () => {
    const p = computePlacement({ ...wide, scrollY: 2000 });
    expect(p.dock).toBe(1);
    expect(p.morph).toBe(1);
    expect(p.cx).toBeCloseTo(1280 * 0.84);
    expect(p.alpha).toBeCloseTo(0.16);
    expect(p.output).toBe(0);
  });

  it("en pantallas muy anchas se acopla en el margen libre, más visible", () => {
    const p = computePlacement({
      ...wide,
      viewportW: 1920,
      viewportH: 1080,
      scrollY: 3000,
    });
    const margin = (1920 - 1152) / 2;
    expect(p.cx).toBeCloseTo(1920 - margin / 2);
    expect(p.widthPx).toBeCloseTo(Math.min(margin * 0.9, 420));
    expect(p.alpha).toBeCloseTo(0.55);
    // La red cabe entera dentro del margen derecho, sin tocar el contenido.
    expect(p.cx - p.widthPx / 2).toBeGreaterThanOrEqual(1920 - margin);
  });

  it("se ordena de forma continua y sin retroceder al bajar", () => {
    let previous = -1;
    for (let scrollY = -100; scrollY <= 1200; scrollY += 25) {
      const { morph, dock } = computePlacement({ ...wide, scrollY });
      expect(morph).toBeGreaterThanOrEqual(previous);
      expect(morph).toBeGreaterThanOrEqual(0);
      expect(morph).toBeLessThanOrEqual(1);
      expect(dock).toBeGreaterThanOrEqual(0);
      expect(dock).toBeLessThanOrEqual(1);
      previous = morph;
    }
  });

  it("en el contacto enciende la salida y se adelanta", () => {
    const p = computePlacement({ ...wide, scrollY: 4000, contactIn: 1 });
    expect(p.output).toBe(1);
    expect(p.alpha).toBe(1);
    expect(p.cx).toBeCloseTo(1280 * 0.8);
    expect(p.widthPx).toBeCloseTo(Math.min(1280 * 0.34, 520));
  });

  it("recorta valores fuera de rango", () => {
    const above = computePlacement({ ...wide, scrollY: -500, contactIn: 7 });
    expect(above.output).toBe(1);
    expect(above.morph).toBe(0);
  });

  it("sin hueco usa la posición de fondo", () => {
    const p = computePlacement({ ...wide, slot: null });
    expect(p.cx).toBeCloseTo(1280 * 0.84);
    expect(p.alpha).toBeCloseTo(0.16);
  });

  it("con la portada medida en 0 se acopla de inmediato", () => {
    const p = computePlacement({ ...wide, heroHeight: 0, scrollY: 1 });
    expect(p.dock).toBe(1);
    expect(p.morph).toBe(1);
  });
});

describe("computePlacement en celular", () => {
  it("nace en el hueco bajo el texto", () => {
    const p = computePlacement(narrow);
    expect(p.cx).toBe(195);
    expect(p.cy).toBe(765);
    expect(p.widthPx).toBe(350);
    expect(p.alpha).toBeCloseTo(0.95);
  });

  it("acoplada queda muy tenue y centrada detrás del texto", () => {
    const p = computePlacement({ ...narrow, scrollY: 3000 });
    expect(p.cx).toBe(195);
    expect(p.cy).toBe(422);
    expect(p.alpha).toBeCloseTo(0.1);
  });

  it("en el contacto baja a la parte inferior y sube su opacidad", () => {
    const p = computePlacement({ ...narrow, scrollY: 5000, contactIn: 1 });
    expect(p.cy).toBeCloseTo(844 * 0.74);
    expect(p.alpha).toBeCloseTo(0.8);
    expect(p.widthPx).toBeCloseTo(390 * 0.92);
    expect(p.output).toBe(1);
  });

  it("en una tableta vertical no crece más de 520 px", () => {
    const p = computePlacement({
      ...narrow,
      viewportW: 820,
      viewportH: 1180,
      scrollY: 5000,
      contactIn: 1,
    });
    expect(p.widthPx).toBe(520);
  });
});

describe("contactProgress", () => {
  it("es 0 hasta que el contacto asoma y 1 cuando ya entró", () => {
    const top = 5000;
    const h = 800;
    expect(contactProgress(top - h * 0.85 - 10, h, top)).toBe(0);
    expect(contactProgress(top - h * 0.85 + h * 0.25, h, top)).toBeCloseTo(0.5);
    expect(contactProgress(top - h * 0.85 + h * 0.5, h, top)).toBe(1);
    expect(contactProgress(top + 999, h, top)).toBe(1);
  });
});
