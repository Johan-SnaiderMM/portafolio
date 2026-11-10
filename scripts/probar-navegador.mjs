// Prueba el sitio en un Chrome o Edge real y sin cabeza, por el protocolo CDP.
// No usa librerías: solo Node 22+ (WebSocket integrado) y un navegador Chromium.
//
//   npm run build && npm start            (en otra terminal)
//   node scripts/probar-navegador.mjs escritorio
//
// Escenarios: smoke | escritorio | movil | puntero | alternativas
// Variables:
//   BASE         dirección del sitio (por defecto http://localhost:3000)
//   OUT          carpeta de las capturas (por defecto ./capturas)
//   CHROME_PATH  ruta del navegador, si no está en un lugar habitual
//   GPU=1        usa la tarjeta gráfica real; sin eso, WebGL por software
//                (SwiftShader), mucho más lento que cualquier GPU: sirve para
//                probar la alternativa lenta, no para medir cuadros por segundo.
import { spawn, spawnSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const BASE = process.env.BASE ?? "http://localhost:3000";
const OUT = process.env.OUT ?? "capturas";
const GPU = Boolean(process.env.GPU);
const IS_WINDOWS = process.platform === "win32";
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function findBrowser() {
  const candidates = [
    process.env.CHROME_PATH,
    "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
    "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
    "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge",
    "/usr/bin/google-chrome",
    "/usr/bin/chromium",
  ];
  const found = candidates.find((path) => path && existsSync(path));
  if (!found) {
    console.error("No encontré Chrome ni Edge. Indica la ruta con CHROME_PATH.");
    process.exit(1);
  }
  return found;
}

async function launch(extraArgs = []) {
  const port = 9300 + Math.floor(Math.random() * 500);
  const profile = mkdtempSync(join(tmpdir(), "portafolio-cdp-"));
  spawn(
    findBrowser(),
    [
      `--remote-debugging-port=${port}`,
      "--headless=new",
      `--user-data-dir=${profile}`,
      "--no-first-run",
      "--no-default-browser-check",
      "--hide-scrollbars",
      "--mute-audio",
      "--ignore-gpu-blocklist",
      ...(GPU
        ? ["--enable-gpu-rasterization"]
        : ["--use-angle=swiftshader", "--enable-unsafe-swiftshader"]),
      ...extraArgs,
      "about:blank",
    ],
    { stdio: "ignore", detached: !IS_WINDOWS },
  );
  for (let i = 0; i < 80; i++) {
    try {
      if ((await fetch(`http://127.0.0.1:${port}/json/version`)).ok) break;
    } catch {
      // el navegador todavía está arrancando
    }
    await sleep(250);
  }
  return { port, profile };
}

/**
 * Cierra todos los procesos del navegador que usan este perfil. En Windows el
 * proceso que se lanza es un intermediario: el navegador de verdad es otro, y
 * `proc.kill()` no lo alcanza, así que se busca por la carpeta del perfil.
 */
function killProfile(profile) {
  const name = profile.split(/[\\/]/).pop();
  if (IS_WINDOWS) {
    spawnSync(
      "powershell.exe",
      [
        "-NoProfile",
        "-Command",
        `Get-CimInstance Win32_Process | Where-Object { $_.CommandLine -like '*${name}*' } | ForEach-Object { Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue }`,
      ],
      { stdio: "ignore" },
    );
  } else {
    spawnSync("pkill", ["-f", name], { stdio: "ignore" });
  }
}

async function connect(port) {
  let page;
  for (let i = 0; i < 40 && !page; i++) {
    const targets = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
    page = targets.find((target) => target.type === "page");
    if (!page) await sleep(250);
  }
  const socket = new WebSocket(page.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => {
    socket.onopen = resolve;
    socket.onerror = reject;
  });

  let nextId = 0;
  const pending = new Map();
  const listeners = new Map();
  socket.onmessage = (event) => {
    const message = JSON.parse(event.data);
    if (message.id && pending.has(message.id)) {
      const { resolve, reject } = pending.get(message.id);
      pending.delete(message.id);
      if (message.error) reject(new Error(message.error.message));
      else resolve(message.result);
    } else if (message.method) {
      (listeners.get(message.method) ?? []).forEach((fn) => fn(message.params));
    }
  };
  return {
    send(method, params = {}) {
      return new Promise((resolve, reject) => {
        const id = ++nextId;
        pending.set(id, { resolve, reject });
        socket.send(JSON.stringify({ id, method, params }));
      });
    },
    on(method, fn) {
      listeners.set(method, [...(listeners.get(method) ?? []), fn]);
    },
    close: () => socket.close(),
  };
}

async function session(extraArgs = []) {
  const { port, profile } = await launch(extraArgs);
  const cdp = await connect(port);
  const logs = [];
  const text = (args) => args.map((a) => a.value ?? a.description ?? "").join(" ").slice(0, 400);
  cdp.on("Runtime.consoleAPICalled", (p) => logs.push(`[${p.type}] ${text(p.args)}`));
  cdp.on("Runtime.exceptionThrown", (p) =>
    logs.push(`[EXCEPCIÓN] ${(p.exceptionDetails.exception?.description ?? p.exceptionDetails.text).slice(0, 500)}`),
  );
  cdp.on("Log.entryAdded", (p) => logs.push(`[log:${p.entry.level}] ${p.entry.text.slice(0, 300)}`));
  await cdp.send("Page.enable");
  await cdp.send("Runtime.enable");
  await cdp.send("Log.enable");
  mkdirSync(OUT, { recursive: true });

  const s = {
    cdp,
    logs,
    async viewport(width, height, { dpr = 1, mobile = false } = {}) {
      await cdp.send("Emulation.setDeviceMetricsOverride", { width, height, deviceScaleFactor: dpr, mobile });
      if (mobile) await cdp.send("Emulation.setTouchEmulationEnabled", { enabled: true });
    },
    async goto(url) {
      const loaded = new Promise((resolve) => cdp.on("Page.loadEventFired", resolve));
      await cdp.send("Page.navigate", { url });
      await Promise.race([loaded, sleep(15000)]);
    },
    async run(expression) {
      const r = await cdp.send("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true });
      if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description ?? r.exceptionDetails.text);
      return r.result.value;
    },
    async shot(name) {
      const { data } = await cdp.send("Page.captureScreenshot", { format: "png" });
      writeFileSync(join(OUT, `${name}.png`), Buffer.from(data, "base64"));
    },
    scrollTo(y) {
      return s.run(`document.documentElement.style.scrollBehavior = 'auto'; window.scrollTo(0, ${y}); window.scrollY`);
    },
    /** Lee el contador que muestra `?fps` (más fiable que medir con rAF sin cabeza). */
    async overlay(wait = 2500) {
      await sleep(wait);
      return s.run(`[...document.body.children].find((e) => e.style && e.style.zIndex === '60')?.textContent ?? null`);
    },
    state() {
      return s.run(`(() => {
        const canvas = document.querySelector('canvas');
        const probe = document.createElement('canvas');
        const gl = probe.getContext('webgl2') || probe.getContext('webgl');
        const info = gl && gl.getExtension('WEBGL_debug_renderer_info');
        const renderer = info ? gl.getParameter(info.UNMASKED_RENDERER_WEBGL) : gl ? 'sin información' : null;
        gl?.getExtension('WEBGL_lose_context')?.loseContext();
        return {
          network: document.documentElement.dataset.network ?? null,
          canvas: canvas ? { w: canvas.width, h: canvas.height } : null,
          canvases: document.querySelectorAll('canvas').length,
          svgVisible: getComputedStyle(document.querySelector('.network-static')).visibility,
          scrollY: Math.round(scrollY),
          docHeight: document.documentElement.scrollHeight,
          hero: document.getElementById('inicio')?.offsetHeight,
          cores: navigator.hardwareConcurrency,
          memoryGB: navigator.deviceMemory,
          webgl: renderer,
        };
      })()`);
    },
    printLogs(label = "mensajes de la consola") {
      console.log(`${label}:\n${logs.join("\n") || "(ninguno)"}`);
    },
    async close() {
      // Primero se pide el cierre ordenado; después se mata lo que haya quedado.
      try {
        await Promise.race([cdp.send("Browser.close"), sleep(1500)]);
      } catch {
        // el navegador cierra el canal antes de responder
      }
      try {
        cdp.close();
      } catch {
        // ya estaba cerrado
      }
      await sleep(400);
      killProfile(profile);
    },
  };
  return s;
}

const scenarios = {
  async smoke() {
    const s = await session();
    await s.viewport(1280, 800);
    await s.goto(`${BASE}/es?3d=on&fps`);
    await sleep(3500);
    console.log("estado:", JSON.stringify(await s.state()));
    await s.shot("smoke");
    s.printLogs();
    await s.close();
  },

  async escritorio() {
    const s = await session();
    await s.viewport(1280, 800);
    await s.goto(`${BASE}/es?3d=on&fps`);
    await sleep(3500);
    const state = await s.state();
    console.log("estado:", JSON.stringify(state));
    const stops = [0, Math.round(state.hero * 0.35), Math.round(state.hero * 0.7), state.hero + 200, Math.round(state.docHeight / 2), state.docHeight - 800];
    for (const [i, y] of stops.entries()) {
      await s.scrollTo(y);
      await sleep(1800);
      await s.shot(`escritorio-${i}-y${y}`);
    }
    await s.scrollTo(0);
    console.log("cuadros (arriba):", await s.overlay());
    await s.scrollTo(state.docHeight - 800);
    console.log("cuadros (contacto):", await s.overlay());
    s.printLogs();
    await s.close();
  },

  async puntero() {
    const s = await session();
    await s.viewport(1280, 800);
    await s.goto(`${BASE}/es?3d=on`);
    await sleep(3500);
    await s.shot("puntero-0-sin");
    for (const [x, y] of [[300, 400], [940, 470]]) {
      await s.cdp.send("Input.dispatchMouseEvent", { type: "mouseMoved", x, y });
      await sleep(900);
      await s.shot(`puntero-${x}x${y}`);
    }
    s.printLogs();
    await s.close();
  },

  async movil() {
    const s = await session();
    await s.viewport(390, 844, { dpr: 2, mobile: true });
    await s.cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 });
    await s.goto(`${BASE}/es?3d=on&fps`);
    await sleep(4500);
    const state = await s.state();
    console.log("estado:", JSON.stringify(state));
    const stops = [0, Math.round(state.hero * 0.5), state.hero + 100, Math.round(state.docHeight / 2), state.docHeight - 844];
    for (const [i, y] of stops.entries()) {
      await s.scrollTo(y);
      await sleep(2200);
      await s.shot(`movil-${i}-y${y}`);
    }
    await s.scrollTo(0);
    console.log("cuadros (móvil con CPU 4× más lenta):", await s.overlay(3500));
    s.printLogs();
    await s.close();
  },

  /** Cambia el tamaño de la ventana con la escena en marcha: el lienzo debe seguirla. */
  async redimensionar() {
    const s = await session();
    await s.viewport(1280, 800);
    await s.goto(`${BASE}/es?3d=on`);
    await sleep(3000);
    for (const [width, height, mobile] of [[900, 700, false], [390, 844, true], [1600, 900, false], [1920, 1080, false]]) {
      await s.viewport(width, height, { mobile });
      await sleep(1500);
      const state = await s.state();
      await s.scrollTo(1300);
      await sleep(1800);
      console.log(`${width}x${height}`, JSON.stringify({ canvas: state.canvas, network: state.network }));
      await s.shot(`redim-${width}x${height}`);
      await s.scrollTo(0);
    }
    s.printLogs();
    await s.close();
  },

  /**
   * Sin `?3d=on` y con GPU=1: simula un equipo lento haciendo que cada cuadro
   * tarde 40 ms y comprueba que la escena baja la calidad y, si sigue lenta,
   * se retira sola.
   */
  async gobernador() {
    const s = await session();
    await s.viewport(1280, 800);
    await s.goto(`${BASE}/es?fps`);
    await sleep(3500);
    const brief = async () => {
      const state = await s.state();
      return JSON.stringify({ network: state.network, canvas: Boolean(state.canvas), svg: state.svgVisible });
    };
    console.log("antes:", await brief(), (await s.overlay(0)) ?? "");
    // El «lastre» va dentro de requestAnimationFrame: cada cuadro tarda al menos 40 ms.
    await s.run(`(function hog() { const t = performance.now(); while (performance.now() - t < 40) {} requestAnimationFrame(hog); })(); 0`);
    for (let elapsed = 3; elapsed <= 60; elapsed += 3) {
      await sleep(3000);
      const state = await brief();
      console.log(`t=${elapsed}s`, state, (await s.overlay(0)) ?? "");
      if (!JSON.parse(state).canvas) break;
    }
    await s.shot("gobernador-final");
    s.printLogs();
    await s.close();
  },

  async alternativas() {
    const report = async (label, url, { args = [], reducedMotion = false, wait = 3000 } = {}) => {
      const s = await session(args);
      await s.viewport(1280, 800);
      if (reducedMotion) {
        await s.cdp.send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-motion", value: "reduce" }] });
      }
      await s.goto(url);
      await sleep(wait);
      console.log(`${label}:`, JSON.stringify(await s.state()));
      await s.shot(`alt-${label.replace(/\W+/g, "-")}`);
      if (s.logs.length) s.printLogs(`  consola (${label})`);
      await s.close();
    };
    await report("menos movimiento", `${BASE}/es`, { reducedMotion: true });
    await report("3d=off", `${BASE}/es?3d=off`);
    await report("sin WebGL", `${BASE}/es?3d=on`, { args: ["--disable-3d-apis", "--disable-gpu"] });
    await report("por defecto", `${BASE}/es`, { wait: 3500 });
  },
};

const name = process.argv[2] ?? "smoke";
if (!scenarios[name]) {
  console.error(`Escenarios: ${Object.keys(scenarios).join(", ")}`);
  process.exit(1);
}
const timeout = setTimeout(() => {
  console.error("Tiempo agotado (3 min).");
  process.exit(2);
}, 180000);
await scenarios[name]();
clearTimeout(timeout);
process.exit(0);
