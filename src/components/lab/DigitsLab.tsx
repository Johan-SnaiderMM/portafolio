"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type PointerEvent as ReactPointerEvent,
} from "react";
import type { DigitsLabText, Locale } from "../../i18n";
import {
  CONFIANZA_MINIMA,
  reconocerNumero,
  type NumeroReconocido,
} from "../../lib/lab/digitos/numero";
import { LADO } from "../../lib/lab/digitos/preprocesar";
import {
  cargarModelo,
  type Modelo,
  type ModeloJSON,
} from "../../lib/lab/digitos/red";
import { fill } from "../../lib/template";

const MODEL_URL = "/lab/modelo-digitos.json";
/** Alto interno del lienzo; el ancho cambia según la pantalla (3:1 grande, 2:1 celular). */
const HEIGHT = 280;
const WIDE = 840;
const NARROW = 560;
/** Grosor del trazo, en píxeles del lienzo. */
const STROKE = 22;
/** Pausa tras soltar el dedo antes de leer: deja terminar los dígitos de varios trazos (el 4, el 5). */
const PAUSE_MS = 450;
const PHONE_QUERY = "(max-width: 639px)";

/** `true` en pantallas angostas; en el servidor y en la primera pintura se asume pantalla grande. */
function useIsPhone(): boolean {
  return useSyncExternalStore(
    (notify) => {
      const query = window.matchMedia(PHONE_QUERY);
      query.addEventListener("change", notify);
      return () => query.removeEventListener("change", notify);
    },
    () => window.matchMedia(PHONE_QUERY).matches,
    () => false,
  );
}

function paintBackground(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return;
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

/** Los 28×28 píxeles que ve la red para un dígito. */
function Thumbnail({ input }: { input: Float32Array }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const image = ctx.createImageData(LADO, LADO);
    for (let i = 0; i < LADO * LADO; i++) {
      const value = Math.round(input[i] * 255);
      image.data[i * 4] = value;
      image.data[i * 4 + 1] = value;
      image.data[i * 4 + 2] = value;
      image.data[i * 4 + 3] = 255;
    }
    ctx.putImageData(image, 0, 0);
  }, [input]);
  return (
    <canvas
      ref={ref}
      width={LADO}
      height={LADO}
      aria-hidden="true"
      className="size-14 border border-trazo bg-black [image-rendering:pixelated]"
    />
  );
}

export function DigitsLab({
  text,
  locale,
}: {
  text: DigitsLabText;
  locale: Locale;
}) {
  const panel = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const last = useRef<{ x: number; y: number } | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const width = useIsPhone() ? NARROW : WIDE;

  const [wantModel, setWantModel] = useState(false);
  const [model, setModel] = useState<Modelo | null>(null);
  const [loadError, setLoadError] = useState(false);
  // Se guarda con el ancho del lienzo en que se leyó: si la pantalla gira, el lienzo se vacía y la lectura vieja ya no vale.
  const [reading, setReading] = useState<{
    number: NumeroReconocido;
    width: number;
  } | null>(null);
  const number = reading && reading.width === width ? reading.number : null;
  const [picked, setPicked] = useState(0);

  // Los pesos (~0,6 MB) se descargan cuando el laboratorio está por aparecer, no antes.
  useEffect(() => {
    const element = panel.current;
    if (!element || wantModel) return;
    if (typeof IntersectionObserver === "undefined") {
      // Navegador sin IntersectionObserver: se descarga ya, fuera del cuerpo del efecto.
      const fallback = setTimeout(() => setWantModel(true), 0);
      return () => clearTimeout(fallback);
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setWantModel(true);
          observer.disconnect();
        }
      },
      { rootMargin: "600px 0px" },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [wantModel]);

  useEffect(() => {
    if (!wantModel) return;
    let active = true;
    fetch(MODEL_URL)
      .then((response) => {
        if (!response.ok) throw new Error(String(response.status));
        return response.json() as Promise<ModeloJSON>;
      })
      .then((json) => active && setModel(cargarModelo(json)))
      .catch(() => active && setLoadError(true));
    return () => {
      active = false;
    };
  }, [wantModel]);

  // Cambiar el ancho vacía el lienzo: se vuelve a pintar el fondo.
  useEffect(() => {
    if (canvas.current) paintBackground(canvas.current);
  }, [width]);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  const read = useCallback(() => {
    const ctx = canvas.current?.getContext("2d", { willReadFrequently: true });
    if (!ctx || !model) return;
    const pixels = ctx.getImageData(0, 0, width, HEIGHT).data;
    const ink = new Float32Array(width * HEIGHT);
    for (let i = 0; i < ink.length; i++) ink[i] = pixels[i * 4] / 255;
    const result = reconocerNumero(model, ink, width, HEIGHT);
    setReading(result ? { number: result, width } : null);
    setPicked((previous) =>
      result ? Math.min(previous, result.digitos.length - 1) : 0,
    );
  }, [model, width]);

  // Si el modelo termina de cargar con algo ya dibujado, se lee de una vez.
  useEffect(() => {
    if (model) read();
  }, [model, read]);

  const scheduleRead = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(read, PAUSE_MS);
  }, [read]);

  const position = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    return {
      x: ((event.clientX - rect.left) * width) / rect.width,
      y: ((event.clientY - rect.top) * HEIGHT) / rect.height,
    };
  };

  const stroke = (
    from: { x: number; y: number },
    to: { x: number; y: number },
  ) => {
    const ctx = canvas.current?.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = STROKE;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(to.x, to.y);
    ctx.stroke();
  };

  const onDown = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    try {
      event.currentTarget.setPointerCapture(event.pointerId); // sigue el trazo aunque el dedo salga del lienzo
    } catch {
      // Algunos navegadores lanzan si el puntero ya no está activo: se dibuja igual mientras siga dentro.
    }
    if (timer.current) clearTimeout(timer.current); // sigue escribiendo: aún no hay que leer
    drawing.current = true;
    const point = position(event);
    last.current = point;
    const ctx = canvas.current?.getContext("2d", { willReadFrequently: true });
    if (ctx) {
      ctx.fillStyle = "#fff";
      ctx.beginPath();
      ctx.arc(point.x, point.y, STROKE / 2, 0, Math.PI * 2);
      ctx.fill();
    }
  };

  const onMove = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    if (!drawing.current || !last.current) return;
    const point = position(event);
    stroke(last.current, point);
    last.current = point;
  };

  const onUp = () => {
    if (!drawing.current) return;
    drawing.current = false;
    last.current = null;
    scheduleRead();
  };

  const clear = () => {
    if (timer.current) clearTimeout(timer.current);
    if (canvas.current) paintBackground(canvas.current);
    setReading(null);
    setPicked(0);
  };

  const digits = number?.digitos ?? [];
  const index = Math.min(picked, Math.max(digits.length - 1, 0));
  const current = digits[index] ?? null;
  const allGlued = digits.length > 0 && digits.every((d) => d.pegado);
  const doubtful = digits
    .map((d, i) => (d.dudoso && !d.pegado ? i + 1 : 0))
    .filter(Boolean);

  const formatPercent = (fraction: number, decimals: number) =>
    new Intl.NumberFormat(locale, {
      style: "percent",
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(fraction);

  return (
    <div ref={panel} className="border border-trazo bg-hollin p-4 sm:p-6">
      <p className="font-mono text-xs text-ambar">{text.kicker}</p>
      <h3 className="mt-2 text-xl font-medium tracking-tight text-hueso sm:text-2xl">
        {text.title}
      </h3>
      <p className="mt-2 max-w-2xl text-[15px]/7 text-ceniza">{text.intro}</p>

      <p id="digitos-ayuda" className="mt-6 text-sm text-ceniza">
        {text.help}
      </p>
      <div className="relative mt-2">
        <canvas
          ref={canvas}
          width={width}
          height={HEIGHT}
          aria-label={text.canvasLabel}
          aria-describedby="digitos-ayuda"
          style={{ aspectRatio: `${width} / ${HEIGHT}` }}
          className="w-full cursor-crosshair touch-none border border-trazo bg-black"
          onPointerDown={onDown}
          onPointerMove={onMove}
          onPointerUp={onUp}
          onPointerCancel={onUp}
        />
        {number && (
          <svg
            viewBox={`0 0 ${width} ${HEIGHT}`}
            className="pointer-events-none absolute inset-0 size-full"
            aria-hidden="true"
          >
            {number.digitos.map((digit, i) => {
              const color = digit.dudoso ? "#8c8576" : "#ffb020";
              return (
                <g key={i}>
                  <rect
                    x={digit.caja.izquierda - 6}
                    y={digit.caja.arriba - 6}
                    width={digit.caja.ancho + 12}
                    height={digit.caja.alto + 12}
                    fill="none"
                    stroke={color}
                    strokeWidth={i === index ? 5 : 3}
                    strokeDasharray={digit.dudoso ? "10 7" : undefined}
                  />
                  <text
                    x={digit.caja.izquierda - 2}
                    y={Math.max(digit.caja.arriba - 12, 22)}
                    fontSize={22}
                    fontWeight={700}
                    fill={color}
                  >
                    {i + 1}
                  </text>
                </g>
              );
            })}
          </svg>
        )}
      </div>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={clear}
          className="min-h-11 border border-trazo px-5 font-mono text-[13px] text-hueso transition-colors hover:border-ambar hover:text-ambar active:translate-y-px"
        >
          {text.clear}
        </button>
        <p className="font-mono text-xs text-ceniza">{text.privacy}</p>
      </div>

      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <div aria-live="polite" className="md:min-h-24">
          {loadError ? (
            <p className="text-hueso">{text.loadError}</p>
          ) : !model ? (
            <p className="text-ceniza">{text.loading}</p>
          ) : number ? (
            <div className="flex flex-col gap-2">
              {!allGlued && (
                <p>
                  <span className="text-ceniza">
                    {number.digitos.length === 1
                      ? text.readsOne
                      : text.readsMany}{" "}
                  </span>
                  <strong className="align-middle font-mono text-5xl font-medium tracking-wider text-ambar">
                    {number.texto}
                  </strong>
                </p>
              )}
              {number.hayPegados && (
                <p className="text-sm text-hueso">{text.glued}</p>
              )}
              {doubtful.length > 0 && (
                <p className="text-sm text-hueso">
                  {fill(
                    doubtful.length === 1 ? text.doubtOne : text.doubtMany,
                    { list: doubtful.join(", ") },
                  )}
                </p>
              )}
            </div>
          ) : (
            <p className="text-ceniza">{text.empty}</p>
          )}
        </div>

        {number && (
          <ul className="flex flex-wrap gap-2" aria-label={text.detectedLabel}>
            {number.digitos.map((digit, i) => (
              <li key={i}>
                <button
                  type="button"
                  onClick={() => setPicked(i)}
                  aria-pressed={i === index}
                  className={`flex min-h-12 items-center gap-2 border px-2 py-1.5 text-left transition-colors hover:border-ambar ${
                    i === index ? "border-ambar bg-tinta" : "border-trazo"
                  }`}
                >
                  <Thumbnail input={digit.entrada} />
                  <span className="flex flex-col leading-tight">
                    <span className="text-xs text-ceniza">
                      {fill(text.digitN, { n: i + 1 })}
                    </span>
                    <span
                      className={`font-mono text-xl font-medium ${digit.dudoso ? "text-hueso" : "text-ambar"}`}
                    >
                      {digit.pegado ? "?" : digit.clasificacion.prediccion}
                    </span>
                    <span className="font-mono text-xs tabular-nums text-ceniza">
                      {digit.pegado
                        ? text.unreliable
                        : formatPercent(digit.clasificacion.confianza, 0)}
                    </span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {current?.pegado && (
        <p className="mt-6 text-sm text-ceniza">{text.gluedBox}</p>
      )}

      {current && !current.pegado && number && (
        <div className="mt-6">
          <h4 className="mb-2 text-sm font-medium text-hueso">
            {fill(text.probsTitle, { n: index + 1 })}
            {number.digitos.length > 1 ? ` ${text.probsHint}` : ""}
          </h4>
          <ul className="flex flex-col gap-1.5" aria-label={text.probsLabel}>
            {Array.from({ length: 10 }, (_, d) => {
              const probability = current.clasificacion.probabilidades[d] ?? 0;
              const wins = current.clasificacion.prediccion === d;
              return (
                <li key={d} className="flex items-center gap-3">
                  <span
                    className={`w-4 text-center font-mono ${wins ? "font-medium text-ambar" : "text-ceniza"}`}
                  >
                    {d}
                  </span>
                  <div
                    className="h-2.5 flex-1 bg-trazo/70"
                    aria-hidden="true"
                  >
                    <div
                      className={`h-full transition-[width] duration-150 ${wins ? "bg-ambar" : "bg-ceniza/60"}`}
                      style={{ width: `${(probability * 100).toFixed(1)}%` }}
                    />
                  </div>
                  <span className="w-[4.5rem] shrink-0 whitespace-nowrap text-right font-mono text-sm tabular-nums text-ceniza">
                    {formatPercent(probability, 1)}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {number && (
        <p className="mt-6 max-w-3xl text-sm/6 text-ceniza">
          {fill(text.how, { pct: formatPercent(CONFIANZA_MINIMA, 0) })}
        </p>
      )}

      {model && (
        <p className="mt-5 border-t border-trazo pt-3 font-mono text-xs/5 text-ceniza">
          {fill(text.model, {
            arch: model.arquitectura.join("-"),
            params: model.parametros.toLocaleString(locale),
            acc: formatPercent(model.precisionPrueba, 1),
          })}
        </p>
      )}
    </div>
  );
}
