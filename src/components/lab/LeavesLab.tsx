"use client";

import { useRef, useState, type ChangeEvent } from "react";
import type { LeavesLabText, Locale } from "../../i18n";
import { CLASES, EJEMPLOS } from "../../lib/lab/hojas/clases";
import {
  crearClasificador,
  type Clasificador,
  type Resultado,
} from "../../lib/lab/hojas/clasificador";
import { LADO, recorteCentrado } from "../../lib/lab/hojas/preparar";
import summary from "../../../public/lab/hojas/resumen.json";
import { fill } from "../../lib/template";

/** Por debajo de esta probabilidad se avisa que el modelo no está seguro. */
const MIN_CONFIDENCE = 0.7;

type State =
  | { kind: "idle" }
  | { kind: "working"; message: string }
  | { kind: "done"; result: Resultado }
  | { kind: "error"; message: string };

export function LeavesLab({
  text,
  locale,
}: {
  text: LeavesLabText;
  locale: Locale;
}) {
  const view = useRef<HTMLCanvasElement>(null);
  const classifier = useRef<Promise<Clasificador> | null>(null);
  const [state, setState] = useState<State>({ kind: "idle" });
  const [hasPhoto, setHasPhoto] = useState(false);

  const number = (value: number, digits: number, style?: "percent") =>
    new Intl.NumberFormat(locale, {
      style,
      minimumFractionDigits: digits,
      maximumFractionDigits: digits,
    }).format(value);

  /** El modelo (~9 MB) y el WebAssembly (~15 MB) se descargan solo la primera vez que se analiza una foto. */
  const getClassifier = () => {
    classifier.current ??= crearClasificador("/lab/hojas/modelo.onnx", (ort) => {
      ort.env.wasm.wasmPaths = "/lab/ort/";
      ort.env.wasm.numThreads = 1; // varios hilos exigen cabeceras especiales (aislamiento de origen); uno basta para una foto
    }).catch((error: unknown) => {
      classifier.current = null; // permite reintentar
      throw error;
    });
    return classifier.current;
  };

  const analyze = async (photo: Blob) => {
    const loaded = classifier.current !== null;
    setState({
      kind: "working",
      message: loaded ? text.analyzing : text.preparing,
    });
    try {
      // Recorte cuadrado centrado y reducción a 224×224; "from-image" respeta la orientación EXIF de las fotos del celular.
      const bitmap = await createImageBitmap(photo, {
        imageOrientation: "from-image",
      });
      const { x, y, lado } = recorteCentrado(bitmap.width, bitmap.height);
      const ctx = view.current?.getContext("2d", { willReadFrequently: true });
      if (!ctx) throw new Error(text.errorImage);
      ctx.drawImage(bitmap, x, y, lado, lado, 0, 0, LADO, LADO);
      bitmap.close();
      setHasPhoto(true);
      const pixels = ctx.getImageData(0, 0, LADO, LADO).data;
      const result = await (await getClassifier()).ejecutar(pixels);
      setState({ kind: "done", result });
    } catch (error) {
      setState({
        kind: "error",
        message:
          error instanceof Error && error.message === text.errorImage
            ? text.errorImage
            : text.errorAnalyze,
      });
    }
  };

  const onPick = (event: ChangeEvent<HTMLInputElement>) => {
    const photo = event.target.files?.[0];
    event.target.value = ""; // permite elegir la misma foto otra vez
    if (photo) void analyze(photo);
  };

  const tryExample = async (file: string) => {
    try {
      const response = await fetch(file);
      if (!response.ok) throw new Error(String(response.status));
      await analyze(await response.blob());
    } catch {
      setState({ kind: "error", message: text.errorExample });
    }
  };

  const result = state.kind === "done" ? state.result : null;
  const winner = result ? CLASES[result.indice] : null;
  const sorted = result
    ? CLASES.map((clase, i) => ({ clase, p: result.probabilidades[i] })).sort(
        (a, b) => b.p - a.p,
      )
    : [];
  const [low, high] = summary.precision_prueba_ic95;
  const buttonBase =
    "inline-flex min-h-11 cursor-pointer items-center justify-center px-5 font-mono text-[13px] transition-colors active:translate-y-px focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-ambar";

  return (
    <div className="border border-trazo bg-hollin p-4 sm:p-6">
      <p className="font-mono text-xs text-ambar">{text.kicker}</p>
      <h3 className="mt-2 text-xl font-medium tracking-tight text-hueso sm:text-2xl">
        {text.title}
      </h3>
      <p className="mt-2 max-w-2xl text-[15px]/7 text-ceniza">{text.intro}</p>

      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap gap-3">
            <label className={`${buttonBase} bg-ambar font-medium text-tinta hover:bg-hueso`}>
              {text.takePhoto}
              <input
                type="file"
                accept="image/*"
                capture="environment"
                className="sr-only"
                onChange={onPick}
              />
            </label>
            <label
              className={`${buttonBase} border border-trazo text-hueso hover:border-ambar hover:text-ambar`}
            >
              {text.pickImage}
              <input
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={onPick}
              />
            </label>
          </div>
          <p className="max-w-sm text-xs/5 text-ceniza">{text.downloadNote}</p>

          <div className="relative w-full max-w-xs">
            <canvas
              ref={view}
              width={LADO}
              height={LADO}
              aria-label={text.canvasLabel}
              className={`aspect-square w-full border border-trazo bg-tinta ${hasPhoto ? "" : "invisible"}`}
            />
            {!hasPhoto && (
              <p className="absolute inset-0 grid place-items-center border border-dashed border-trazo p-4 text-center text-sm text-ceniza">
                {text.placeholder}
              </p>
            )}
          </div>

          <div>
            <p className="mb-2 text-sm text-ceniza">{text.examplesHint}</p>
            <ul className="flex flex-wrap gap-2">
              {EJEMPLOS.map((example) => (
                <li key={example.clase}>
                  <button
                    type="button"
                    onClick={() => void tryExample(example.archivo)}
                    className="flex min-h-12 items-center gap-2 border border-trazo py-1 pr-3 pl-1 text-left text-sm text-hueso transition-colors hover:border-ambar"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element -- miniaturas estáticas de 224 px */}
                    <img
                      src={example.archivo}
                      alt=""
                      loading="lazy"
                      width={40}
                      height={40}
                      className="size-10 object-cover"
                    />
                    <span>{text.classes[example.clase].short}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div aria-live="polite" className="flex flex-col gap-4 md:min-h-48">
          {state.kind === "idle" && (
            <p className="text-ceniza">{text.idle}</p>
          )}
          {state.kind === "working" && (
            <p className="text-ceniza">{state.message}</p>
          )}
          {state.kind === "error" && (
            <p className="text-hueso">{state.message}</p>
          )}

          {result && winner && (
            <>
              <div>
                <p className="text-sm text-ceniza">{text.thinksIt}</p>
                <p className="text-2xl font-medium text-ambar">
                  {text.classes[winner].name}
                </p>
                <p className="mt-1 text-[15px]/7 text-ceniza">
                  {text.classes[winner].description}
                </p>
                {result.confianza < MIN_CONFIDENCE && (
                  <p className="mt-2 text-sm text-hueso">
                    {fill(text.lowConfidence, {
                      pct: number(result.confianza, 0, "percent"),
                    })}
                  </p>
                )}
              </div>
              <ul className="flex flex-col gap-1.5" aria-label={text.probsLabel}>
                {sorted.map(({ clase, p }) => (
                  <li key={clase} className="flex items-center gap-3">
                    <span
                      className={`w-32 shrink-0 text-sm ${clase === winner ? "font-medium text-hueso" : "text-ceniza"}`}
                    >
                      {text.classes[clase].short}
                    </span>
                    <div className="h-2.5 flex-1 bg-trazo/70" aria-hidden="true">
                      <div
                        className={`h-full ${clase === winner ? "bg-ambar" : "bg-ceniza/60"}`}
                        style={{ width: `${(p * 100).toFixed(1)}%` }}
                      />
                    </div>
                    <span className="w-[4.5rem] shrink-0 whitespace-nowrap text-right font-mono text-sm tabular-nums text-ceniza">
                      {number(p, 1, "percent")}
                    </span>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      </div>

      <p className="mt-6 border-t border-trazo pt-3 font-mono text-xs/5 text-ceniza">
        {fill(text.model, {
          acc: number(summary.precision_prueba, 1, "percent"),
          n: summary.fotos_de_prueba,
          low: number(low, 1, "percent"),
          high: number(high, 1, "percent"),
          f1: number(summary.f1_macro_prueba, 2),
          params: number(summary.parametros / 1e6, 1),
        })}
      </p>

      <div className="mt-5 border border-trazo p-4">
        <h4 className="text-sm font-medium text-hueso">{text.limitsTitle}</h4>
        <ul className="mt-3 flex flex-col gap-2 text-sm/6 text-ceniza">
          {text.limits.map((item) => (
            <li
              key={item}
              className="relative pl-5 before:absolute before:left-0 before:top-[0.6rem] before:size-1.5 before:bg-ambar"
            >
              {fill(item, { n: summary.fotos_de_prueba })}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
