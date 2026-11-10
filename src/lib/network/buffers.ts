import { LAYER_COUNT, type NetworkLayout } from "./layout";

/** Tamaño de cada punto, en píxeles de referencia, según su capa. */
const LAYER_POINT_SIZE = [4.5, 5.5, 5.5, 7.5] as const;
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

export interface LineBuffers {
  /** Dos vértices por conexión. */
  vertexCount: number;
  cloud: Float32Array;
  ordered: Float32Array;
  seed: Float32Array;
  /** 0 en el nodo de origen, 1 en el de destino. */
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

  const vertexCount = edges.length * 2;
  const lines: LineBuffers = {
    vertexCount,
    cloud: new Float32Array(vertexCount * 3),
    ordered: new Float32Array(vertexCount * 3),
    seed: new Float32Array(vertexCount),
    t: new Float32Array(vertexCount),
    from: new Float32Array(vertexCount),
    phase: new Float32Array(vertexCount),
    path: new Float32Array(vertexCount),
    toOutput: new Float32Array(vertexCount),
  };

  edges.forEach((edge, i) => {
    const toOutput = nodes[edge.to].layer === LAYER_COUNT - 1 ? 1 : 0;
    [edge.from, edge.to].forEach((nodeIndex, end) => {
      const v = i * 2 + end;
      const node = nodes[nodeIndex];
      lines.cloud.set(node.cloud, v * 3);
      lines.ordered.set(node.ordered, v * 3);
      lines.seed[v] = node.seed;
      lines.t[v] = end;
      lines.from[v] = edge.transition;
      lines.phase[v] = edge.phase;
      lines.path[v] = edge.onPath ? 1 : 0;
      lines.toOutput[v] = toOutput;
    });
  });

  return { points, lines };
}
