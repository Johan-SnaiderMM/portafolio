import { describe, expect, it } from "vitest";
import { LADO, recorteCentrado, rgbaATensor, softmax } from "./preparar";

describe("rgbaATensor", () => {
  it("ordena los canales como NCHW (todo el R, luego todo el G, luego todo el B) y escala a [0, 1]", () => {
    const lado = 2;
    // 4 píxeles RGBA: rojo puro, verde puro, azul puro, gris 51 con alfa 0 (el alfa debe ignorarse)
    const rgba = new Uint8ClampedArray([255, 0, 0, 255, 0, 255, 0, 255, 0, 0, 255, 255, 51, 51, 51, 0]);
    const t = rgbaATensor(rgba, lado);
    expect(t).toHaveLength(3 * 4);
    const cerca = (real: Float32Array, esperado: number[]) => esperado.forEach((v, i) => expect(real[i]).toBeCloseTo(v, 6));
    cerca(t.slice(0, 4), [1, 0, 0, 0.2]); // canal R
    cerca(t.slice(4, 8), [0, 1, 0, 0.2]); // canal G
    cerca(t.slice(8, 12), [0, 0, 1, 0.2]); // canal B (float32 guarda 51/255 como 0,2000000029…)
  });

  it("rechaza imágenes que no son de LADO×LADO", () => {
    expect(() => rgbaATensor(new Uint8ClampedArray(10))).toThrow(/224/);
    expect(rgbaATensor(new Uint8ClampedArray(LADO * LADO * 4))).toHaveLength(3 * LADO * LADO);
  });
});

describe("recorteCentrado", () => {
  it("toma el cuadrado central de una foto horizontal, vertical o cuadrada", () => {
    expect(recorteCentrado(400, 300)).toEqual({ x: 50, y: 0, lado: 300 });
    expect(recorteCentrado(300, 400)).toEqual({ x: 0, y: 50, lado: 300 });
    expect(recorteCentrado(224, 224)).toEqual({ x: 0, y: 0, lado: 224 });
  });
});

describe("softmax", () => {
  it("suma 1, conserva el orden y no se desborda con logits enormes", () => {
    const p = softmax([1000, 1001, 999, -1000]);
    expect(p.every(Number.isFinite)).toBe(true);
    expect(p.reduce((a, b) => a + b, 0)).toBeCloseTo(1, 10);
    expect(p[1]).toBeGreaterThan(p[0]);
    expect(p[0]).toBeGreaterThan(p[2]);
  });
});
