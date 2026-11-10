import { LAYER_COUNT, type NetworkLayout } from "./layout";

/** Tamaño de cada punto, en píxeles de referencia, según su capa. */
const LAYER_POINT_SIZE = [5.2, 6.2, 6.2, 8.5] as const;
const DUST_POINT_SIZE = 2.4;
const WINNER_POINT_SIZE = 11;

export interface PointBuffers {
  count: number;
  cloud: Float32Array;
  ordered: Float32Array;
  layer: Float32Array;
  seed: Float32Array;
  size: Float32Array;
  path: Float32Array;
  winner: Float32Array;
}

/** Cada conexión se parte en tramos para que las señales (cometas) viajen de verdad a lo largo de ella. */
export const LINE_SEGMENTS = 8;

export interface LineBuffers {
  /** Dos vértices por tramo, `LINE_SEGMENTS` tramos por conexión. */
  vertexCount: number;
  /** Posición del nodo de origen (nube) en cada vértice; es el atributo `position`. */
  cloudA: Float32Array;
  cloudB: Float32Array;
  orderedA: Float32Array;
  orderedB: Float32Array;
  seedA: Float32Array;
  seedB: Float32Array;
  /** 0 en el nodo de origen y 1 en el de destino, a lo largo de toda la conexión. */
  t: Float32Array;
  /** Paso entre capas de la conexión. */
  from: Float32Array;
  phase: Float32Array;
  path: Float32Array;
  /** 1 si la conexión llega a la capa de salida. */
  toOutput: Float32Array;
}

/** Convierte la red en los arreglos planos que la GPU necesita. */
export function buildBuffers(layout: NetworkLayout): {
  points: PointBuffers;
  lines: LineBuffers;
} {
  const { nodes, edges, path } = layout;
  const winner = path[path.length - 1];

  const points: PointBuffers = {
    count: nodes.length,
    cloud: new Float32Array(nodes.length * 3),
    ordered: new Float32Array(nodes.length * 3),
    layer: new Float32Array(nodes.length),
    seed: new Float32Array(nodes.length),
    size: new Float32Array(nodes.length),
    path: new Float32Array(nodes.length),
    winner: new Float32Array(nodes.length),
  };

  nodes.forEach((node, i) => {
    points.cloud.set(node.cloud, i * 3);
    points.ordered.set(node.ordered, i * 3);
    points.layer[i] = node.layer;
    points.seed[i] = node.seed;
    points.size[i] =
      i === winner
        ? WINNER_POINT_SIZE
        : node.layer < 0
          ? DUST_POINT_SIZE
          : LAYER_POINT_SIZE[node.layer];
    points.path[i] = node.onPath ? 1 : 0;
    points.winner[i] = i === winner ? 1 : 0;
  });

  const vertexCount = edges.length * LINE_SEGMENTS * 2;
  const lines: LineBuffers = {
    vertexCount,
    cloudA: new Float32Array(vertexCount * 3),
    cloudB: new Float32Array(vertexCount * 3),
    orderedA: new Float32Array(vertexCount * 3),
    orderedB: new Float32Array(vertexCount * 3),
    seedA: new Float32Array(vertexCount),
    seedB: new Float32Array(vertexCount),
    t: new Float32Array(vertexCount),
    from: new Float32Array(vertexCount),
    phase: new Float32Array(vertexCount),
    path: new Float32Array(vertexCount),
    toOutput: new Float32Array(vertexCount),
  };

  edges.forEach((edge, i) => {
    const toOutput = nodes[edge.to].layer === LAYER_COUNT - 1 ? 1 : 0;
    const a = nodes[edge.from];
    const b = nodes[edge.to];
    for (let segment = 0; segment < LINE_SEGMENTS; segment++) {
      for (let end = 0; end < 2; end++) {
        const v = (i * LINE_SEGMENTS + segment) * 2 + end;
        lines.cloudA.set(a.cloud, v * 3);
        lines.cloudB.set(b.cloud, v * 3);
        lines.orderedA.set(a.ordered, v * 3);
        lines.orderedB.set(b.ordered, v * 3);
        lines.seedA[v] = a.seed;
        lines.seedB[v] = b.seed;
        lines.t[v] = (segment + end) / LINE_SEGMENTS;
        lines.from[v] = edge.transition;
        lines.phase[v] = edge.phase;
        lines.path[v] = edge.onPath ? 1 : 0;
        lines.toOutput[v] = toOutput;
      }
    }
  });

  return { points, lines };
}
