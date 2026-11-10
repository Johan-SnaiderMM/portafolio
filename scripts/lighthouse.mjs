// Mide el sitio con Lighthouse usando el Edge/Chrome ya instalado.
//
//   node scripts/lighthouse.mjs [URL] [movil|escritorio]
//
// Lighthouse se baja con npx (no es dependencia del proyecto). Deja el informe en capturas/lighthouse-*.json y muestra
// las notas y las métricas principales. Cierra el navegador que abrió (solo el suyo, por su carpeta de perfil).
import { spawn, spawnSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const url = process.argv[2] ?? "https://johan-moreno.vercel.app/es";
const mode = process.argv[3] === "escritorio" ? "desktop" : "mobile";
const port = 9400 + Math.floor(Math.random() * 400);
const isWindows = process.platform === "win32";

const browser = [
  process.env.CHROME_PATH,
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
  "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "/usr/bin/google-chrome",
].find((path) => path && existsSync(path));
if (!browser) {
  console.error("No encontré Chrome ni Edge. Indica la ruta con CHROME_PATH.");
  process.exit(1);
}

const profile = mkdtempSync(join(tmpdir(), "lighthouse-perfil-"));
mkdirSync("capturas", { recursive: true });
const report = join("capturas", `lighthouse-${mode}.json`);

const child = spawn(
  browser,
  [
    `--remote-debugging-port=${port}`,
    `--user-data-dir=${profile}`,
    "--headless=new",
    "--no-first-run",
    "--disable-extensions",
    "about:blank",
  ],
  { stdio: "ignore", detached: false },
);
await new Promise((resolve) => setTimeout(resolve, 4000));

const args = [
  "--yes",
  "lighthouse",
  url,
  `--port=${port}`,
  "--output=json",
  `--output-path=${report}`,
  "--only-categories=performance,accessibility,best-practices,seo",
  "--quiet",
];
if (mode === "desktop") args.push("--preset=desktop");
const run = spawnSync(isWindows ? "npx.cmd" : "npx", args, { stdio: "inherit", shell: isWindows });

// Cierra solo el navegador de esta medición (en Windows el lanzado es un intermediario).
if (isWindows) {
  spawnSync(
    "powershell",
    [
      "-NoProfile",
      "-Command",
      `Get-CimInstance Win32_Process -Filter "Name='msedge.exe' OR Name='chrome.exe'" | Where-Object { $_.CommandLine -like '*${profile.replace(/\\/g, "\\\\")}*' } | ForEach-Object { Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue }`,
    ],
    { stdio: "ignore" },
  );
}
child.kill();

if (run.status !== 0 || !existsSync(report)) {
  console.error("Lighthouse no terminó.");
  process.exit(1);
}

const data = JSON.parse(readFileSync(report, "utf8"));
console.log(`\n${url} (${mode})`);
for (const [key, category] of Object.entries(data.categories)) {
  console.log(`  ${category.title}: ${Math.round(category.score * 100)}`);
  void key;
}
const metrics = ["first-contentful-paint", "largest-contentful-paint", "total-blocking-time", "cumulative-layout-shift", "speed-index", "interactive"];
for (const id of metrics) {
  const audit = data.audits[id];
  if (audit) console.log(`  ${audit.title}: ${audit.displayValue}`);
}
const failing = Object.values(data.audits)
  .filter((a) => a.score !== null && a.score < 0.9 && a.scoreDisplayMode !== "informative" && a.scoreDisplayMode !== "notApplicable")
  .sort((a, b) => a.score - b.score);
if (failing.length) {
  console.log("\nAuditorías por debajo de 0,9:");
  for (const a of failing.slice(0, 20)) console.log(`  [${a.score}] ${a.id}: ${a.title}${a.displayValue ? " — " + a.displayValue : ""}`);
}
