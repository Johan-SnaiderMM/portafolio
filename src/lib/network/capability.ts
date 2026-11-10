export interface CapabilityInput {
  /** `prefers-reduced-motion: reduce` */
  reducedMotion: boolean;
  /** `navigator.connection.saveData` */
  saveData: boolean;
  /** `navigator.deviceMemory` (solo Chromium), en GB. */
  deviceMemory?: number;
  /** `navigator.hardwareConcurrency` */
  hardwareConcurrency?: number;
  /** Valor de `?3d=` en la dirección: «on», «off» o nada. */
  override: string | null;
}

export type CapabilityReason =
  | "ok"
  | "override-on"
  | "override-off"
  | "reduced-motion"
  | "save-data"
  | "low-memory"
  | "few-cores";

export interface CapabilityDecision {
  mode: "3d" | "static";
  reason: CapabilityReason;
}

/**
 * Decide si se carga la versión 3D o se deja el esquema estático.
 * Las preferencias de la persona (menos movimiento, ahorro de datos) siempre
 * ganan; `?3d=on` solo se salta las pruebas de equipo, y `?3d=off` fuerza la
 * versión estática.
 */
export function decideMode(input: CapabilityInput): CapabilityDecision {
  if (input.override === "off") return { mode: "static", reason: "override-off" };
  if (input.reducedMotion) return { mode: "static", reason: "reduced-motion" };
  if (input.saveData) return { mode: "static", reason: "save-data" };
  if (input.override === "on") return { mode: "3d", reason: "override-on" };
  if (input.deviceMemory !== undefined && input.deviceMemory <= 2) {
    return { mode: "static", reason: "low-memory" };
  }
  if (
    input.hardwareConcurrency !== undefined &&
    input.hardwareConcurrency <= 2
  ) {
    return { mode: "static", reason: "few-cores" };
  }
  return { mode: "3d", reason: "ok" };
}
