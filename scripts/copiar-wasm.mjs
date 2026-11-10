// Copia los archivos de WebAssembly de onnxruntime-web a public/lab/ort/ para servirlos como estáticos.
// Se corre solo después de `npm install` y antes de `next build` (ver package.json).
import { copyFileSync, existsSync, mkdirSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const raiz = join(dirname(fileURLToPath(import.meta.url)), "..");
const origen = join(raiz, "node_modules", "onnxruntime-web", "dist");
const destino = join(raiz, "public", "lab", "ort");

if (!existsSync(origen)) {
  console.log("onnxruntime-web todavía no está instalado: nada que copiar.");
  process.exit(0);
}
mkdirSync(destino, { recursive: true });
// Solo la variante que usa la demo (CPU con SIMD): el .wasm (≈ 15 MB) y su cargador .mjs. Las variantes jsep/asyncify/jspi (WebGPU) pesan el doble y no se usan.
const archivos = readdirSync(origen).filter((f) => /^ort-wasm-simd-threaded\.(wasm|mjs)$/.test(f));
for (const f of archivos) copyFileSync(join(origen, f), join(destino, f));
console.log(`public/lab/ort: ${archivos.length} archivo(s) copiado(s): ${archivos.join(", ")}`);
