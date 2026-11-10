/**
 * Límites de uso del asistente: por visitante (ventana deslizante) y un tope diario global.
 *
 * Viven en la memoria de la instancia. En Vercel (sin servidor) cada instancia tiene los suyos, así que esto es un freno
 * «de mejor esfuerzo» contra el abuso; el tope real lo ponen las cuotas gratuitas del proveedor, que además no cobran
 * nada. Si algún día hay abuso de verdad, el siguiente paso es un almacén compartido (p. ej. Upstash Redis).
 */

export interface LimiterConfig {
  /** Mensajes permitidos por visitante dentro de `windowMs`. */
  perVisitor: number;
  windowMs: number;
  /** Mensajes permitidos en total por día (día UTC). */
  perDay: number;
}

export type LimitResult =
  | { ok: true }
  | { ok: false; reason: "visitor" | "daily"; retryAfterSec: number };

export const DEFAULT_LIMITS: LimiterConfig = {
  perVisitor: 8,
  windowMs: 10 * 60 * 1000,
  perDay: 400,
};

const MAX_TRACKED_VISITORS = 5_000;

export function createLimiter(
  config: LimiterConfig = DEFAULT_LIMITS,
  now: () => number = Date.now,
) {
  const visits = new Map<string, number[]>();
  let day = Math.floor(now() / 86_400_000);
  let today = 0;

  return {
    check(visitor: string): LimitResult {
      const time = now();
      const currentDay = Math.floor(time / 86_400_000);
      if (currentDay !== day) {
        day = currentDay;
        today = 0;
      }
      if (today >= config.perDay) {
        const tomorrow = (day + 1) * 86_400_000;
        return {
          ok: false,
          reason: "daily",
          retryAfterSec: Math.ceil((tomorrow - time) / 1000),
        };
      }

      const recent = (visits.get(visitor) ?? []).filter(
        (t) => time - t < config.windowMs,
      );
      if (recent.length >= config.perVisitor) {
        visits.set(visitor, recent);
        return {
          ok: false,
          reason: "visitor",
          retryAfterSec: Math.max(
            1,
            Math.ceil((recent[0] + config.windowMs - time) / 1000),
          ),
        };
      }

      recent.push(time);
      visits.set(visitor, recent);
      today += 1;

      // Evita que el mapa crezca sin límite: se limpian los visitantes sin visitas recientes.
      if (visits.size > MAX_TRACKED_VISITORS) {
        for (const [key, times] of visits) {
          if (times.every((t) => time - t >= config.windowMs)) visits.delete(key);
        }
      }
      return { ok: true };
    },
  };
}
