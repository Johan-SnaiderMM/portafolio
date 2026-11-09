/**
 * Esquema de la red 784-128-64-10 de la portada. Es estático (sin WebGL) y
 * determinista, así que también sirve de alternativa a la versión 3D.
 */
const LAYERS = [4, 6, 6, 3] as const;
const LABELS = ["784", "128", "64", "10"] as const;
const XS = [64, 208, 352, 496] as const;
const GAPS = [76, 56, 56, 92] as const;
/** Nodo activo de cada capa: el camino que se ilumina. */
const ACTIVE = [1, 3, 2, 1] as const;

const WIDTH = 560;
const HEIGHT = 400;
const CENTER_Y = 184;

const nodes = LAYERS.map((count, layer) =>
  Array.from({ length: count }, (_, index) => ({
    x: XS[layer],
    y: CENTER_Y + (index - (count - 1) / 2) * GAPS[layer],
  })),
);

const edges = nodes.slice(0, -1).flatMap((from, layer) =>
  from.flatMap((a, i) =>
    nodes[layer + 1].map((b, j) => ({ key: `${layer}-${i}-${j}`, a, b })),
  ),
);

const activePoints = ACTIVE.map((index, layer) => nodes[layer][index]);
const activePath = activePoints
  .map((point, i) => `${i === 0 ? "M" : "L"}${point.x} ${point.y}`)
  .join(" ");

export function NetworkDiagram({
  label,
  caption,
}: {
  label: string;
  caption: string;
}) {
  return (
    <figure className="w-full max-w-[34rem]">
      <svg
        role="img"
        aria-label={label}
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="h-auto w-full overflow-visible"
      >
        <g className="stroke-trazo" strokeWidth="1">
          {edges.map(({ key, a, b }) => (
            <line key={key} x1={a.x} y1={a.y} x2={b.x} y2={b.y} />
          ))}
        </g>

        <path
          d={activePath}
          fill="none"
          className="stroke-ambar/30"
          strokeWidth="1.4"
          strokeLinejoin="round"
        />
        <path
          d={activePath}
          pathLength={100}
          fill="none"
          className="net-pulse stroke-ambar"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {nodes.map((layer, layerIndex) =>
          layer.map((point, index) => {
            const active = ACTIVE[layerIndex] === index;
            return (
              <circle
                key={`${layerIndex}-${index}`}
                cx={point.x}
                cy={point.y}
                r={active ? 6 : 5}
                strokeWidth="1.2"
                className={
                  active
                    ? "fill-ambar stroke-ambar"
                    : "fill-tinta stroke-ceniza/50"
                }
              />
            );
          }),
        )}

        {/* Halo de la neurona de salida que gana. */}
        <circle
          cx={activePoints[3].x}
          cy={activePoints[3].y}
          r="14"
          fill="none"
          className="stroke-ambar/35"
          strokeWidth="1"
        />

        {LABELS.map((text, layer) => (
          <text
            key={text}
            x={XS[layer]}
            y={HEIGHT - 12}
            textAnchor="middle"
            className="fill-ceniza font-mono text-[12px]"
          >
            {text}
          </text>
        ))}
      </svg>
      <figcaption className="mt-3 font-mono text-xs text-ceniza">
        {caption}
      </figcaption>
    </figure>
  );
}
