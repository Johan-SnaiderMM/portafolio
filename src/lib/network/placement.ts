/**
 * Dónde y cómo se ve la red según el scroll: anclada al hueco de la portada,
 * luego acoplada a un lado como fondo tenue y, al llegar al contacto,
 * adelante y con la salida encendida. Todo son funciones puras para poder
 * probarlas sin navegador.
 */

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface PlacementInput {
  scrollY: number;
  viewportW: number;
  viewportH: number;
  /** Hueco de la portada donde nace la red (coordenadas de la ventana). */
  slot: Rect | null;
  /** Alto de la portada en píxeles. */
  heroHeight: number;
  /** Cuánto ha entrado la sección de contacto: 0 = fuera, 1 = dentro. */
  contactIn: number;
}

export interface Placement {
  /** Centro de la red en píxeles de la ventana. */
  cx: number;
  cy: number;
  /** Ancho en pantalla del esquema ordenado, en píxeles. */
  widthPx: number;
  /** 0 = nube suelta, 1 = capas ordenadas. */
  morph: number;
  /** 0 = anclada a la portada, 1 = acoplada al fondo. */
  dock: number;
  /** 0 = salida apagada, 1 = salida encendida. */
  output: number;
  /** Opacidad general. */
  alpha: number;
}

export const clamp01 = (value: number) => Math.min(1, Math.max(0, value));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
/** Suaviza una rampa de 0 a 1 (entra y sale despacio). */
export const smooth = (t: number) => {
  const x = clamp01(t);
  return x * x * (3 - 2 * x);
};

interface Anchor {
  cx: number;
  cy: number;
  widthPx: number;
  alpha: number;
}

/** Pantallas anchas dejan la red a un lado; las angostas la ponen detrás del texto. */
export function isWide(viewportW: number, viewportH: number): boolean {
  return viewportW >= 900 && viewportW / viewportH >= 1.1;
}

/** Ancho del contenido de la página (max-w-6xl = 72 rem). */
const CONTENT_WIDTH = 1152;

function railAnchor(w: number, h: number): Anchor {
  if (!isWide(w, h)) {
    return { cx: w * 0.5, cy: h * 0.5, widthPx: w, alpha: 0.1 };
  }
  // Con margen libre a los lados la red vive ahí, bien visible; si no lo hay,
  // queda detrás del texto, muy tenue, para no estorbar las cifras.
  const margin = Math.max(0, (w - CONTENT_WIDTH) / 2);
  if (margin >= 200) {
    return {
      cx: w - margin / 2,
      cy: h * 0.5,
      widthPx: Math.min(margin * 0.9, 420),
      alpha: 0.55,
    };
  }
  return { cx: w * 0.84, cy: h * 0.52, widthPx: w * 0.3, alpha: 0.16 };
}

function contactAnchor(w: number, h: number): Anchor {
  return isWide(w, h)
    ? { cx: w * 0.8, cy: h * 0.5, widthPx: Math.min(w * 0.34, 520), alpha: 1 }
    : { cx: w * 0.5, cy: h * 0.74, widthPx: Math.min(w * 0.92, 520), alpha: 0.8 };
}

export function computePlacement(input: PlacementInput): Placement {
  const { viewportW: w, viewportH: h, slot } = input;

  const heroOut = clamp01(input.scrollY / Math.max(1, input.heroHeight * 0.9));
  const dock = smooth(heroOut / 0.7);
  const morph = smooth((heroOut - 0.05) / 0.8);
  const contact = smooth(input.contactIn);

  const rail = railAnchor(w, h);
  const hero: Anchor = slot
    ? {
        cx: slot.x + slot.width / 2,
        cy: slot.y + slot.height / 2,
        widthPx: slot.width,
        alpha: isWide(w, h) ? 1 : 0.95,
      }
    : rail;
  const end = contactAnchor(w, h);

  const docked = {
    cx: lerp(hero.cx, rail.cx, dock),
    cy: lerp(hero.cy, rail.cy, dock),
    widthPx: lerp(hero.widthPx, rail.widthPx, dock),
    alpha: lerp(hero.alpha, rail.alpha, dock),
  };

  return {
    cx: lerp(docked.cx, end.cx, contact),
    cy: lerp(docked.cy, end.cy, contact),
    widthPx: lerp(docked.widthPx, end.widthPx, contact),
    alpha: lerp(docked.alpha, end.alpha, contact),
    morph,
    dock,
    output: contact,
  };
}

/** Cuánto ha entrado la sección de contacto según el scroll. */
export function contactProgress(
  scrollY: number,
  viewportH: number,
  contactTop: number,
): number {
  return clamp01((scrollY + viewportH * 0.85 - contactTop) / (viewportH * 0.5));
}
