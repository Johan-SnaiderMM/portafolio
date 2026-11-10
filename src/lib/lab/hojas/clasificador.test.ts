import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { beforeAll, describe, expect, it } from "vitest";
import { CLASES } from "./clases";
import { crearClasificador, type Clasificador } from "./clasificador";
import ejemplos from "./__fixtures__/ejemplos.json";
import { LADO } from "./preparar";

const raiz = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..", "..");
let clasificador: Clasificador;

/** Las fotos de prueba vienen como RGB crudo (base64) tal como las vio PyTorch; se pasan a RGBA como lo haría un canvas. */
function rgbaDesdeRgb(base64: string): Uint8Array {
  const rgb = Buffer.from(base64, "base64");
  expect(rgb.length).toBe(LADO * LADO * 3);
  const rgba = new Uint8Array(LADO * LADO * 4);
  for (let i = 0; i < LADO * LADO; i++) {
    rgba[i * 4] = rgb[i * 3];
    rgba[i * 4 + 1] = rgb[i * 3 + 1];
    rgba[i * 4 + 2] = rgb[i * 3 + 2];
    rgba[i * 4 + 3] = 255;
  }
  return rgba;
}

beforeAll(async () => {
  // En Node, onnxruntime-web corre el mismo modelo ONNX que el navegador, con el backend WebAssembly.
  clasificador = await crearClasificador(new Uint8Array(readFileSync(join(raiz, "public", "lab", "hojas", "modelo.onnx"))), (ort) => {
    ort.env.wasm.numThreads = 1;
  });
});

describe("modelo ONNX en JavaScript", () => {
  it("hay una foto de prueba por clase, en el orden de CLASES", () => {
    expect(ejemplos.map((e) => e.clase)).toEqual([...CLASES]);
  });

  it("da los mismos logits que PyTorch (paridad PyTorch ↔ onnxruntime-web)", async () => {
    for (const e of ejemplos) {
      const obtenidos = await clasificador.logits(rgbaDesdeRgb(e.rgb_base64));
      expect(obtenidos).toHaveLength(CLASES.length);
      e.logits.forEach((esperado, i) => expect(Math.abs(obtenidos[i] - esperado)).toBeLessThan(0.02));
    }
  });

  it("elige la misma clase que PyTorch y devuelve probabilidades que suman 1", async () => {
    for (const e of ejemplos) {
      const r = await clasificador.ejecutar(rgbaDesdeRgb(e.rgb_base64));
      expect(r.indice).toBe(e.logits.indexOf(Math.max(...e.logits)));
      expect(r.probabilidades.reduce((a, b) => a + b, 0)).toBeCloseTo(1, 5);
      expect(r.confianza).toBe(r.probabilidades[r.indice]);
    }
  });

  it("rechaza una imagen con tamaño equivocado", async () => {
    await expect(clasificador.ejecutar(new Uint8Array(100))).rejects.toThrow(/RGBA/);
  });
});
