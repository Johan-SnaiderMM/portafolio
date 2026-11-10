import { createRng } from "./rng";

export type Vec3 = readonly [number, number, number];

/**
 * Nodos por capa. La entrada es una «imagen» de 6×6 que simboliza los 784
 * píxeles de MNIST; luego dos capas ocultas y los 10 dígitos de salida.
 */
export const LAYER_SIZES = [36, 20, 14, 10] as const;
export const LAYER_COUNT = LAYER_SIZES.length;
/** Pasos entre capas (entrada→oculta 1, oculta 1→oculta 2, oculta 2→salida). */
export const TRANSITIONS = LAYER_COUNT - 1;
/** Puntos sueltos del fondo que dan profundidad. */
export const DUST_COUNT = 70;
/** Ancho aproximado del esquema ordenado, en unidades de la escena. */
export const NETWORK_WIDTH = 3.5;

/** Nodos en la dimensión de profundidad (z) de cada capa. */
const COLUMNS = [6, 4, 2, 1] as const;
const ROW_GAP = [0.3, 0.3, 0.24, 0.2] as const;
const COLUMN_GAP = [0.28, 0.26, 0.3, 0] as const;
const LAYER_X = [-1.65, -0.55, 0.55, 1.65] as const;
/** Nodo de la capa de entrada donde empieza el camino iluminado. */
const PATH_START = 14;

export interface NetworkNode {
  /** 0 = entrada … 3 = salida; −1 = polvo de fondo. */
  layer: number;
  /** Posición cuando la red está ordenada en capas. */
  ordered: Vec3;
  /** Posición cuando la red es una nube suelta. */
  cloud: Vec3;
  /** Número en [0, 1) para desfasar movimientos y brillos. */
  seed: number;
  onPath: boolean;
}

export interface NetworkEdge {
  from: number;
  to: number;
  /** Paso entre capas al que pertenece: 0, 1 o 2. */
  transition: number;
  /** Número en [0, 1) para que cada conexión dispare en su momento. */
  phase: number;
  onPath: boolean;
}

export interface NetworkLayout {
  /** Primero los nodos de la red (por capas) y después el polvo. */
  nodes: NetworkNode[];
  edges: NetworkEdge[];
  /** Un nodo por capa: el camino que se ilumina. El último es la salida ganadora. */
  path: number[];
  /** Cuántos de `nodes` son de la red (el resto es polvo). */
  networkCount: number;
}

function rowsOf(layer: number): number {
  return Math.ceil(LAYER_SIZES[layer] / COLUMNS[layer]);
}

function orderedPosition(layer: number, index: number): Vec3 {
  const columns = COLUMNS[layer];
  const rows = rowsOf(layer);
  const row = Math.floor(index / columns);
  const column = index % columns;
  return [
    LAYER_X[layer],
    ((rows - 1) / 2 - row) * ROW_GAP[layer],
    (column - (columns - 1) / 2) * COLUMN_GAP[layer],
  ];
}

/** Coordenadas (y, z) de un nodo normalizadas a [−1, 1] dentro de su capa. */
function planePosition(layer: number, ordered: Vec3): [number, number] {
  const halfY = ((rowsOf(layer) - 1) / 2) * ROW_GAP[layer];
  const halfZ = ((COLUMNS[layer] - 1) / 2) * COLUMN_GAP[layer];
  return [
    halfY > 0 ? ordered[1] / halfY : 0,
    halfZ > 0 ? ordered[2] / halfZ : 0,
  ];
}

function cloudPosition(rng: () => number, ordered: Vec3): Vec3 {
  // Punto dentro de una esfera por rechazo, estirada como un elipsoide.
  let x: number;
  let y: number;
  let z: number;
  do {
    x = rng() * 2 - 1;
    y = rng() * 2 - 1;
    z = rng() * 2 - 1;
  } while (x * x + y * y + z * z > 1);
  // Conserva buena parte de la posición ordenada: así las conexiones no cruzan
  // toda la nube y esta «cristaliza» en capas sin caos.
  return [
    ordered[0] * 0.55 + x * 1.35,
    ordered[1] * 0.55 + y * 1.0,
    ordered[2] * 0.55 + z * 0.95,
  ];
}

export function generateNetwork(seed = 7): NetworkLayout {
  const rng = createRng(seed);
  const nodes: NetworkNode[] = [];
  const layerStart: number[] = [];

  for (let layer = 0; layer < LAYER_COUNT; layer++) {
    layerStart.push(nodes.length);
    for (let index = 0; index < LAYER_SIZES[layer]; index++) {
      const ordered = orderedPosition(layer, index);
      nodes.push({
        layer,
        ordered,
        cloud: cloudPosition(rng, ordered),
        seed: rng(),
        onPath: false,
      });
    }
  }
  const networkCount = nodes.length;

  // Conexiones: cada nodo se une a sus 2 vecinos más cercanos de la capa
  // siguiente y a uno al azar; después se asegura que ninguno quede sin entrada.
  const edges: NetworkEdge[] = [];
  const seen = new Set<string>();
  const addEdge = (from: number, to: number, transition: number) => {
    const key = `${from}-${to}`;
    if (seen.has(key)) return;
    seen.add(key);
    edges.push({ from, to, transition, phase: rng(), onPath: false });
  };

  for (let transition = 0; transition < TRANSITIONS; transition++) {
    const sources = range(layerStart[transition], LAYER_SIZES[transition]);
    const targets = range(layerStart[transition + 1], LAYER_SIZES[transition + 1]);

    const distance = (a: number, b: number) => {
      const [ay, az] = planePosition(transition, nodes[a].ordered);
      const [by, bz] = planePosition(transition + 1, nodes[b].ordered);
      return Math.hypot(ay - by, az - bz);
    };

    for (const source of sources) {
      const ranked = [...targets].sort(
        (a, b) => distance(source, a) - distance(source, b) || a - b,
      );
      addEdge(source, ranked[0], transition);
      addEdge(source, ranked[1], transition);
      const rest = ranked.slice(2);
      addEdge(source, rest[Math.floor(rng() * rest.length)], transition);
    }

    for (const target of targets) {
      if (edges.some((edge) => edge.to === target)) continue;
      const nearest = [...sources].sort(
        (a, b) => distance(a, target) - distance(b, target) || a - b,
      )[0];
      addEdge(nearest, target, transition);
    }
  }

  // Camino iluminado: de un nodo de entrada hasta una salida, siguiendo conexiones reales.
  const path = [layerStart[0] + PATH_START];
  for (let transition = 0; transition < TRANSITIONS; transition++) {
    const current = path[path.length - 1];
    const outgoing = edges.filter((edge) => edge.from === current);
    const chosen = outgoing[Math.floor(rng() * outgoing.length)];
    chosen.onPath = true;
    path.push(chosen.to);
  }
  for (const index of path) nodes[index].onPath = true;

  // Polvo de fondo.
  for (let i = 0; i < DUST_COUNT; i++) {
    const position: Vec3 = [
      (rng() * 2 - 1) * 3.4,
      (rng() * 2 - 1) * 2.4,
      -2.2 + rng() * 3.0,
    ];
    nodes.push({
      layer: -1,
      ordered: position,
      cloud: position,
      seed: rng(),
      onPath: false,
    });
  }

  return { nodes, edges, path, networkCount };
}

function range(start: number, count: number): number[] {
  return Array.from({ length: count }, (_, i) => start + i);
}
