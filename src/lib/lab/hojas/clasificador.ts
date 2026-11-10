import { CLASES } from "./clases";
import { LADO, rgbaATensor, softmax } from "./preparar";

export interface Resultado {
  /** Probabilidad de cada clase, en el orden de CLASES. */
  probabilidades: number[];
  /** Índice de la clase más probable. */
  indice: number;
  confianza: number;
}

export interface Clasificador {
  /** `rgba`: píxeles de una foto ya recortada y reducida a LADO×LADO (lo que entrega canvas.getImageData). */
  ejecutar(rgba: Uint8ClampedArray | Uint8Array): Promise<Resultado>;
  /** Logits crudos (antes del softmax), para comparar con PyTorch en las pruebas. */
  logits(rgba: Uint8ClampedArray | Uint8Array): Promise<Float32Array>;
}

type ModuloOrt = typeof import("onnxruntime-web/wasm");

/**
 * Carga el modelo ONNX con onnxruntime-web (WebAssembly, sin servidor).
 * `origen`: URL del modelo (en el navegador) o sus bytes (en las pruebas con Node).
 * `configurar`: ajustes de `ort.env` antes de crear la sesión (rutas de los .wasm, número de hilos...).
 */
export async function crearClasificador(origen: string | Uint8Array, configurar?: (ort: ModuloOrt) => void): Promise<Clasificador> {
  // «/wasm» es la variante solo-CPU: usa ort-wasm-simd-threaded.wasm (≈ 15 MB). La importación por defecto pide además la
  // variante WebGPU (jsep, ≈ 30 MB), que esta demo no necesita.
  const ort = await import("onnxruntime-web/wasm");
  configurar?.(ort);
  const opciones = { executionProviders: ["wasm"], graphOptimizationLevel: "all" } as const;
  const sesion = typeof origen === "string" ? await ort.InferenceSession.create(origen, opciones) : await ort.InferenceSession.create(origen, opciones);
  const entrada = sesion.inputNames[0];
  const salida = sesion.outputNames[0];

  const logits = async (rgba: Uint8ClampedArray | Uint8Array) => {
    const tensor = new ort.Tensor("float32", rgbaATensor(rgba), [1, 3, LADO, LADO]);
    const resultado = await sesion.run({ [entrada]: tensor });
    return Float32Array.from(resultado[salida].data as Float32Array);
  };

  return {
    logits,
    async ejecutar(rgba) {
      const probabilidades = softmax(await logits(rgba));
      if (probabilidades.length !== CLASES.length) throw new Error(`El modelo devolvió ${probabilidades.length} clases y se esperaban ${CLASES.length}.`);
      let indice = 0;
      probabilidades.forEach((p, i) => {
        if (p > probabilidades[indice]) indice = i;
      });
      return { probabilidades, indice, confianza: probabilidades[indice] };
    },
  };
}
