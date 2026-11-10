// Genera las cinco portadas (1200×630) en public/projects a partir de
// scripts/portadas/portada.html y las capturas de scripts/portadas/fuentes.
//
//   node scripts/generar-portadas.mjs [id ...]
//
// Usa el arnés scripts/probar-navegador.mjs (escenario «demo») con Edge o Chrome.
import { spawnSync } from "node:child_process";
import { mkdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const template = join(root, "scripts", "portadas", "portada.html");
const out = join(root, "public", "projects");
const all = ["mesa-ayuda", "red-neuronal", "hojas-banano", "origenes", "comanda"];
const ids = process.argv.length > 2 ? process.argv.slice(2) : all;

mkdirSync(out, { recursive: true });
for (const id of ids) {
  const result = spawnSync(
    process.execPath,
    [join(root, "scripts", "probar-navegador.mjs"), "demo"],
    {
      cwd: root,
      stdio: "inherit",
      env: {
        ...process.env,
        URL: `${pathToFileURL(template).href}#${id}`,
        NOMBRE: id,
        OUT: out,
        ANCHO: "1200",
        ALTO: "630",
        DPR: "1",
        ESPERA: "2500",
      },
    },
  );
  if (result.status !== 0) process.exit(result.status ?? 1);
}
console.log(`Portadas en ${out}`);
