"use client";

import { useEffect, useRef } from "react";
import { decideMode } from "../../lib/network/capability";
import { hasWebGL } from "./webgl";

/** Pistas del navegador que TypeScript todavía no conoce. */
type NavigatorWithHints = Navigator & {
  connection?: { saveData?: boolean };
  deviceMemory?: number;
};

/**
 * Fondo fijo con la red 3D. Es decoración: el contenido y el esquema SVG de
 * la portada funcionan sin él. Solo se carga (con `import()` diferido) si el
 * equipo y las preferencias lo permiten; en cualquier otro caso no hace nada.
 *
 * Direcciones de prueba: `?3d=off` fuerza la versión estática, `?3d=on` se
 * salta las pruebas de equipo y `?fps` muestra los cuadros por segundo.
 */
export function NetworkBackdrop() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const root = document.documentElement;
    const params = new URLSearchParams(window.location.search);
    const hints = navigator as NavigatorWithHints;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    let disposed = false;
    let timer: number | undefined;
    let scene: { dispose: () => void } | null = null;

    function stop() {
      scene?.dispose();
      scene = null;
      root.removeAttribute("data-network");
    }

    function start() {
      if (disposed || scene) return;
      const decision = decideMode({
        reducedMotion: reducedMotion.matches,
        saveData: hints.connection?.saveData === true,
        deviceMemory: hints.deviceMemory,
        hardwareConcurrency: hints.hardwareConcurrency,
        override: params.get("3d"),
      });
      if (decision.mode === "static") return;

      const forced = params.get("3d") === "on";
      // Sin WebGL (o sin aceleración) no hay nada que cargar: queda el esquema SVG.
      if (!hasWebGL(forced)) return;

      import("./NetworkScene").then(({ createNetworkScene }) => {
        if (disposed || scene) return;
        scene = createNetworkScene({
          container: container as HTMLElement,
          force: forced,
          showFps: params.has("fps"),
          onReady: () => root.setAttribute("data-network", "3d"),
          onFallback: () => {
            scene = null;
            root.removeAttribute("data-network");
          },
        });
      });
    }

    const onMotionChange = () => (reducedMotion.matches ? stop() : start());
    reducedMotion.addEventListener("change", onMotionChange);

    // Espera a que termine de cargar la página para no competir con el primer pintado.
    const schedule = () => {
      timer = window.setTimeout(start, 300);
    };
    if (document.readyState === "complete") schedule();
    else window.addEventListener("load", schedule, { once: true });

    return () => {
      disposed = true;
      window.clearTimeout(timer);
      window.removeEventListener("load", schedule);
      reducedMotion.removeEventListener("change", onMotionChange);
      stop();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-x-0 top-0 -z-10 h-[100lvh]"
    />
  );
}
