import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  Group,
  LineSegments,
  PerspectiveCamera,
  Points,
  Scene,
  ShaderMaterial,
  Vector2,
  WebGLRenderer,
  type IUniform,
} from "three";
import { buildBuffers } from "../../lib/network/buffers";
import { createGovernor } from "../../lib/network/governor";
import { NETWORK_WIDTH, generateNetwork } from "../../lib/network/layout";
import {
  computePlacement,
  contactProgress,
  type Rect,
} from "../../lib/network/placement";
import {
  LINE_FRAGMENT,
  LINE_VERTEX,
  POINT_FRAGMENT,
  POINT_VERTEX,
} from "./shaders";

const FOV = 32;
const DISTANCE = 7;
const HALF_HEIGHT = DISTANCE * Math.tan((FOV * Math.PI) / 360);
/** Color de fondo de la página (--color-tinta): el lienzo es opaco para que el brillo sea aditivo. */
const BACKGROUND = 0x0b0a08;

export interface NetworkSceneOptions {
  container: HTMLElement;
  /** Salta el control de rendimiento (pruebas y `?3d=on`). */
  force: boolean;
  /** Muestra un contador de cuadros por segundo (`?fps`). */
  showFps: boolean;
  /** Se llama tras pintar el primer cuadro. */
  onReady: () => void;
  /** Se llama cuando la escena se retira sola y hay que volver al esquema estático. */
  onFallback: (reason: string) => void;
}

export interface NetworkSceneHandle {
  dispose: () => void;
}

const toRect = (r: DOMRect): Rect => ({
  x: r.left,
  y: r.top,
  width: r.width,
  height: r.height,
});

export function createNetworkScene(
  options: NetworkSceneOptions,
): NetworkSceneHandle {
  const { container, force, showFps, onReady, onFallback } = options;

  let renderer: WebGLRenderer;
  try {
    renderer = new WebGLRenderer({
      antialias: (window.devicePixelRatio || 1) < 2,
      alpha: false,
      depth: false,
      stencil: false,
      powerPreference: "low-power",
    });
  } catch {
    onFallback("no-webgl");
    return { dispose() {} };
  }
  renderer.setClearColor(BACKGROUND, 1);
  const canvas = renderer.domElement;
  canvas.style.cssText = "display:block;width:100%;height:100%";
  container.appendChild(canvas);

  const scene = new Scene();
  const camera = new PerspectiveCamera(FOV, 1, 0.1, 40);
  camera.position.set(0, 0, DISTANCE);

  // --- Geometría -----------------------------------------------------------
  const layout = generateNetwork();
  const { points, lines } = buildBuffers(layout);

  const uniforms: Record<string, IUniform> = {
    uTime: { value: 0 },
    uMorph: { value: 0 },
    uAspect: { value: 1 },
    uPointer: { value: new Vector2(10, 10) },
    uPointerStrength: { value: 0 },
    uPixelRatio: { value: 1 },
    uSizeScale: { value: 1 },
    uRefDepth: { value: DISTANCE },
    uAlpha: { value: 0 },
    uOutput: { value: 0 },
    uWave: { value: 0 },
    uLineBoost: { value: 1 },
    uPing: { value: -2 },
    uPingPower: { value: 0 },
  };

  const pointGeometry = new BufferGeometry();
  pointGeometry.setAttribute("position", new BufferAttribute(points.cloud, 3));
  pointGeometry.setAttribute("aOrdered", new BufferAttribute(points.ordered, 3));
  pointGeometry.setAttribute("aLayer", new BufferAttribute(points.layer, 1));
  pointGeometry.setAttribute("aSeed", new BufferAttribute(points.seed, 1));
  pointGeometry.setAttribute("aSize", new BufferAttribute(points.size, 1));
  pointGeometry.setAttribute("aPath", new BufferAttribute(points.path, 1));
  pointGeometry.setAttribute("aWinner", new BufferAttribute(points.winner, 1));

  const lineGeometry = new BufferGeometry();
  lineGeometry.setAttribute("position", new BufferAttribute(lines.cloudA, 3));
  lineGeometry.setAttribute("aCloudB", new BufferAttribute(lines.cloudB, 3));
  lineGeometry.setAttribute("aOrdA", new BufferAttribute(lines.orderedA, 3));
  lineGeometry.setAttribute("aOrdB", new BufferAttribute(lines.orderedB, 3));
  lineGeometry.setAttribute("aSeedA", new BufferAttribute(lines.seedA, 1));
  lineGeometry.setAttribute("aSeedB", new BufferAttribute(lines.seedB, 1));
  lineGeometry.setAttribute("aT", new BufferAttribute(lines.t, 1));
  lineGeometry.setAttribute("aFrom", new BufferAttribute(lines.from, 1));
  lineGeometry.setAttribute("aPhase", new BufferAttribute(lines.phase, 1));
  lineGeometry.setAttribute("aPath", new BufferAttribute(lines.path, 1));
  lineGeometry.setAttribute("aToOutput", new BufferAttribute(lines.toOutput, 1));

  const shared = {
    uniforms,
    transparent: true,
    depthTest: false,
    depthWrite: false,
    blending: AdditiveBlending,
  } as const;
  const pointMaterial = new ShaderMaterial({
    ...shared,
    vertexShader: POINT_VERTEX,
    fragmentShader: POINT_FRAGMENT,
  });
  const lineMaterial = new ShaderMaterial({
    ...shared,
    vertexShader: LINE_VERTEX,
    fragmentShader: LINE_FRAGMENT,
  });

  const lineMesh = new LineSegments(lineGeometry, lineMaterial);
  const pointMesh = new Points(pointGeometry, pointMaterial);
  // Las posiciones se mezclan en la GPU: la caja que calcula three no sirve.
  lineMesh.frustumCulled = false;
  pointMesh.frustumCulled = false;

  const group = new Group();
  group.add(lineMesh, pointMesh);
  scene.add(group);

  // --- Medidas de la página --------------------------------------------------
  let heroEl: HTMLElement | null = null;
  let contactEl: HTMLElement | null = null;
  let slotEl: HTMLElement | null = null;
  let heroHeight = 0;
  let contactTop = Number.POSITIVE_INFINITY;
  let width = 1;
  let height = 1;
  let maxPixelRatio = Math.min(window.devicePixelRatio || 1, 1.5);

  function measure() {
    heroHeight = heroEl ? heroEl.offsetHeight : 0;
    contactTop = contactEl
      ? contactEl.getBoundingClientRect().top + window.scrollY
      : Number.POSITIVE_INFINITY;
  }

  /** Busca los elementos de la página; si cambiaron (otra ruta), vuelve a medir. */
  function lookup() {
    const hero = document.getElementById("inicio");
    const contact = document.getElementById("contacto");
    const slot = document.querySelector<HTMLElement>("[data-network-slot]");
    if (hero === heroEl && contact === contactEl && slot === slotEl) return;
    heroEl = hero;
    contactEl = contact;
    slotEl = slot;
    measure();
  }

  function resize() {
    width = Math.max(1, container.clientWidth);
    height = Math.max(1, container.clientHeight);
    const pixelRatio = Math.min(window.devicePixelRatio || 1, maxPixelRatio);
    renderer.setPixelRatio(pixelRatio);
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    uniforms.uAspect.value = width / height;
    uniforms.uPixelRatio.value = pixelRatio;
    // Con más densidad de píxeles las líneas de 1 px se vuelven más finas: compensa.
    uniforms.uLineBoost.value = 1 + (pixelRatio - 1) * 0.7;
    measure();
  }

  // --- Cursor ------------------------------------------------------------------
  const pointerTarget = new Vector2(10, 10);
  const pointer = new Vector2(10, 10);
  let pointerWanted = 0;
  let pointerStrength = 0;
  let pushEnabled = true;

  const onPointerMove = (event: PointerEvent) => {
    if (event.pointerType === "touch") return;
    pointerTarget.set(
      (event.clientX / width) * 2 - 1,
      1 - (event.clientY / height) * 2,
    );
    if (pointerWanted === 0) pointer.copy(pointerTarget);
    pointerWanted = 1;
  };
  const onPointerLeave = () => {
    pointerWanted = 0;
  };

  // Un clic o un toque manda un frente de luz a traves de la red (entrada a salida).
  const PING_SECONDS = 1.1;
  let pingAge = Number.POSITIVE_INFINITY;
  const onPointerDown = (event: PointerEvent) => {
    // Solo si se toca la parte con la red; los clics en botones y campos no cuentan.
    const target = event.target as Element | null;
    if (target?.closest("a, button, input, textarea, select, label, canvas")) return;
    pingAge = 0;
  };

  // --- Estado animado -----------------------------------------------------------
  const state = {
    cx: Number.NaN,
    cy: 0,
    widthPx: 0,
    morph: 0,
    output: 0,
    alpha: 0,
    dock: 0,
  };
  let time = 0;
  let fadeIn = 0;
  let ready = false;
  let dockedFlag = false;

  function update(dt: number) {
    const scrollY = window.scrollY;
    const heroOut = scrollY / Math.max(1, heroHeight * 0.9);
    // Un hueco de ancho 0 (elemento recién quitado de la página) no sirve de ancla.
    const slotRect =
      slotEl && heroOut < 0.75 ? toRect(slotEl.getBoundingClientRect()) : null;
    const slot = slotRect && slotRect.width > 0 ? slotRect : null;
    const target = computePlacement({
      scrollY,
      viewportW: width,
      viewportH: height,
      slot,
      heroHeight,
      contactIn: contactProgress(scrollY, window.innerHeight, contactTop),
    });

    if (Number.isNaN(state.cx)) {
      Object.assign(state, target);
    } else {
      const move = 1 - Math.exp(-dt * 7);
      const fade = 1 - Math.exp(-dt * 5);
      state.cx += (target.cx - state.cx) * move;
      state.cy += (target.cy - state.cy) * move;
      state.widthPx += (target.widthPx - state.widthPx) * move;
      state.morph += (target.morph - state.morph) * fade;
      state.output += (target.output - state.output) * fade;
      state.alpha += (target.alpha - state.alpha) * fade;
      state.dock = target.dock;
    }

    // Avisa a la hoja de estilos cuando la red deja la portada (solo al cambiar).
    const docked = state.dock > 0.12;
    if (docked !== dockedFlag) {
      dockedFlag = docked;
      document.documentElement.toggleAttribute("data-network-dock", docked);
    }

    pointer.lerp(pointerTarget, 1 - Math.exp(-dt * 10));
    pointerStrength +=
      (pointerWanted * (pushEnabled ? 1 : 0) - pointerStrength) *
      (1 - Math.exp(-dt * 6));

    const aspect = width / height;
    const ndcX = (state.cx / width) * 2 - 1;
    const ndcY = 1 - (state.cy / height) * 2;
    group.position.set(ndcX * HALF_HEIGHT * aspect, ndcY * HALF_HEIGHT, 0);
    group.scale.setScalar(
      (state.widthPx * ((2 * HALF_HEIGHT) / height)) / NETWORK_WIDTH,
    );
    const sway = 1 - 0.5 * state.dock;
    group.rotation.y =
      pointer.x * 0.36 * pointerStrength + Math.sin(time * 0.23) * 0.2 * sway;
    group.rotation.x =
      -pointer.y * 0.18 * pointerStrength + Math.sin(time * 0.17) * 0.07 * sway;

    fadeIn = Math.min(1, fadeIn + dt / 0.8);
    uniforms.uTime.value = time;
    uniforms.uMorph.value = state.morph;
    uniforms.uOutput.value = state.output;
    uniforms.uAlpha.value = state.alpha * fadeIn;
    uniforms.uWave.value = (time * 0.2 - Math.floor(time * 0.2)) * 3.8 - 0.4;
    if (pingAge < PING_SECONDS) {
      pingAge += dt;
      const k = Math.min(1, pingAge / PING_SECONDS);
      uniforms.uPing.value = -0.4 + k * 4.0;
      uniforms.uPingPower.value = 1 - k * k;
    } else {
      uniforms.uPingPower.value = 0;
    }
    uniforms.uSizeScale.value = Math.min(1.35, Math.max(0.55, state.widthPx / 520));
    (uniforms.uPointer.value as Vector2).copy(pointer);
    uniforms.uPointerStrength.value = pointerStrength;
  }

  // --- Contador de cuadros (?fps) -----------------------------------------------
  let fpsBox: HTMLDivElement | null = null;
  let fpsFrames = 0;
  let fpsStart = 0;
  if (showFps) {
    fpsBox = document.createElement("div");
    fpsBox.setAttribute("aria-hidden", "true");
    fpsBox.style.cssText =
      "position:fixed;left:12px;bottom:12px;z-index:60;padding:6px 10px;" +
      "font:12px/1.4 ui-monospace,Menlo,Consolas,monospace;color:#ffb020;" +
      "background:rgba(11,10,8,.85);border:1px solid #2a261f;pointer-events:none";
    document.body.appendChild(fpsBox);
  }

  // --- Bucle ----------------------------------------------------------------------
  const governor = createGovernor();
  let level = 0;
  let frameCount = 0;
  let last = performance.now();
  let raf = 0;
  let disposed = false;

  function frame(now: number) {
    if (disposed) return;
    raf = requestAnimationFrame(frame);

    const deltaMs = now - last;
    last = now;
    frameCount += 1;
    // Por si cambió la página (otra ruta): revisa los anclajes unas veces por segundo.
    if (frameCount % 30 === 0) lookup();

    if (!force && frameCount > 30) {
      if (governor.push(deltaMs) === "slow") {
        if (level === 0) {
          // Primer escalón: menos píxeles y sin empuje del cursor.
          level = 1;
          maxPixelRatio = 1;
          pushEnabled = false;
          resize();
          governor.reset();
        } else {
          fallback("slow");
          return;
        }
      }
    }

    const dt = Math.min(deltaMs, 64) / 1000;
    time += dt;
    update(dt);

    if (uniforms.uAlpha.value > 0.002) renderer.render(scene, camera);

    if (!ready) {
      ready = true;
      onReady();
    }

    if (fpsBox) {
      fpsFrames += 1;
      if (now - fpsStart >= 500) {
        const fps = (fpsFrames * 1000) / (now - fpsStart);
        fpsBox.textContent =
          `${fps.toFixed(0)} fps · ${(1000 / fps).toFixed(1)} ms · ` +
          `${uniforms.uPixelRatio.value.toFixed(1)}x · nivel ${level}`;
        fpsFrames = 0;
        fpsStart = now;
      }
    }
  }

  // --- Eventos ----------------------------------------------------------------------
  const onContextLost = (event: Event) => {
    event.preventDefault();
    fallback("context-lost");
  };
  let resizeQueued = false;
  const queueResize = () => {
    if (resizeQueued) return;
    resizeQueued = true;
    requestAnimationFrame(() => {
      resizeQueued = false;
      if (!disposed) resize();
    });
  };
  const bodyObserver =
    typeof ResizeObserver === "undefined" ? null : new ResizeObserver(measure);

  canvas.addEventListener("webglcontextlost", onContextLost);
  window.addEventListener("resize", queueResize);
  window.addEventListener("pointermove", onPointerMove, { passive: true });
  window.addEventListener("pointerdown", onPointerDown, { passive: true });
  document.documentElement.addEventListener("mouseleave", onPointerLeave);
  bodyObserver?.observe(document.body);

  function dispose() {
    if (disposed) return;
    disposed = true;
    cancelAnimationFrame(raf);
    canvas.removeEventListener("webglcontextlost", onContextLost);
    window.removeEventListener("resize", queueResize);
    window.removeEventListener("pointermove", onPointerMove);
    window.removeEventListener("pointerdown", onPointerDown);
    document.documentElement.removeEventListener("mouseleave", onPointerLeave);
    bodyObserver?.disconnect();
    document.documentElement.removeAttribute("data-network-dock");
    pointGeometry.dispose();
    lineGeometry.dispose();
    pointMaterial.dispose();
    lineMaterial.dispose();
    renderer.dispose();
    renderer.forceContextLoss();
    canvas.remove();
    fpsBox?.remove();
  }

  function fallback(reason: string) {
    dispose();
    onFallback(reason);
  }

  lookup();
  resize();
  raf = requestAnimationFrame((now) => {
    last = now;
    fpsStart = now;
    frame(now);
  });

  return { dispose };
}
