/** Entrada del modelo: lado×lado píxeles RGB en [0, 1], orden NCHW (la normalización de ImageNet ya va dentro del modelo). */
export const LADO = 224;

/**
 * Convierte píxeles RGBA (lo que entrega un canvas, `ImageData.data`) de LADO×LADO en el tensor [1, 3, LADO, LADO].
 * El alfa se ignora: las fotos no tienen transparencia.
 */
export function rgbaATensor(rgba: Uint8ClampedArray | Uint8Array, lado: number = LADO): Float32Array {
  const pixeles = lado * lado;
  if (rgba.length !== pixeles * 4) {
    throw new Error(`Se esperaban ${pixeles * 4} valores RGBA (${lado}×${lado}) y llegaron ${rgba.length}.`);
  }
  const tensor = new Float32Array(3 * pixeles);
  for (let i = 0; i < pixeles; i++) {
    tensor[i] = rgba[i * 4] / 255; // canal R
    tensor[pixeles + i] = rgba[i * 4 + 1] / 255; // canal G
    tensor[2 * pixeles + i] = rgba[i * 4 + 2] / 255; // canal B
  }
  return tensor;
}

/** Recorte cuadrado centrado de una foto de ancho×alto (como "cover"): evita deformar la hoja al volverla cuadrada. */
export function recorteCentrado(ancho: number, alto: number): { x: number; y: number; lado: number } {
  const lado = Math.min(ancho, alto);
  return { x: Math.floor((ancho - lado) / 2), y: Math.floor((alto - lado) / 2), lado };
}

/** Convierte logits en probabilidades (softmax estable). */
export function softmax(logits: ArrayLike<number>): number[] {
  const maximo = Math.max(...Array.from(logits));
  const exps = Array.from(logits, (v) => Math.exp(v - maximo));
  const suma = exps.reduce((a, b) => a + b, 0);
  return exps.map((v) => v / suma);
}
