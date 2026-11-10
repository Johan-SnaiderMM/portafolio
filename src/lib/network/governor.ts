export interface GovernorOptions {
  /** Cuadros que se promedian antes de decidir. */
  windowSize?: number;
  /** Si el promedio supera estos milisegundos, la escena va lenta. */
  slowMs?: number;
  /** Las pausas más largas que esto (pestaña oculta, suspensión) no cuentan. */
  ignoreAboveMs?: number;
  /** Cada cuadro cuenta como máximo esto: un tirón aislado no debe pesar de más. */
  capMs?: number;
}

export type GovernorVerdict = "ok" | "slow";

/**
 * Vigila el tiempo entre cuadros. Cada `windowSize` cuadros dice si el
 * promedio fue demasiado lento; quien lo usa decide cuánto bajar la calidad.
 *
 * Un equipo que dibuja a 3 cuadros por segundo debe contar como lento (por eso
 * los cuadros largos suman, con un tope), mientras que una pausa de varios
 * segundos (la pestaña estuvo oculta) no es una muestra y se descarta.
 */
export function createGovernor(options: GovernorOptions = {}) {
  const windowSize = options.windowSize ?? 90;
  const slowMs = options.slowMs ?? 28;
  const ignoreAboveMs = options.ignoreAboveMs ?? 1000;
  const capMs = options.capMs ?? 100;
  let sum = 0;
  let count = 0;

  return {
    push(deltaMs: number): GovernorVerdict {
      if (deltaMs <= 0 || deltaMs > ignoreAboveMs) return "ok";
      sum += Math.min(deltaMs, capMs);
      count += 1;
      if (count < windowSize) return "ok";
      const average = sum / count;
      sum = 0;
      count = 0;
      return average > slowMs ? "slow" : "ok";
    },
    reset() {
      sum = 0;
      count = 0;
    },
  };
}
