import { describe, expect, it } from "vitest";
import { LINE_SEGMENTS, buildBuffers } from "./buffers";
import { generateNetwork } from "./layout";

const layout = generateNetwork(7);
const { points, lines } = buildBuffers(layout);

describe("buildBuffers", () => {
  it("genera un vértice por nodo y dos por conexión", () => {
    expect(points.count).toBe(layout.nodes.length);
    expect(points.cloud).toHaveLength(points.count * 3);
    expect(points.ordered).toHaveLength(points.count * 3);
    for (const name of ["layer", "seed", "size", "path", "winner"] as const) {
      expect(points[name]).toHaveLength(points.count);
    }

    expect(lines.vertexCount).toBe(layout.edges.length * LINE_SEGMENTS * 2);
    for (const name of ["cloudA", "cloudB", "orderedA", "orderedB"] as const) {
      expect(lines[name]).toHaveLength(lines.vertexCount * 3);
    }
    for (const name of [
      "seedA",
      "seedB",
      "t",
      "from",
      "phase",
      "path",
      "toOutput",
    ] as const) {
      expect(lines[name]).toHaveLength(lines.vertexCount);
    }
  });

  it("tiene una sola neurona ganadora y es la salida del camino", () => {
    const winners = Array.from(points.winner).flatMap((v, i) => (v ? [i] : []));
    expect(winners).toEqual([layout.path[layout.path.length - 1]]);
  });

  it("da tamaño positivo a todos los puntos", () => {
    for (const size of points.size) expect(size).toBeGreaterThan(0);
  });

  it("reparte los tramos de cada conexión de 0 a 1 sin huecos", () => {
    const perEdge = LINE_SEGMENTS * 2;
    layout.edges.forEach((edge, i) => {
      const base = i * perEdge;
      expect(lines.t[base]).toBe(0);
      expect(lines.t[base + perEdge - 1]).toBe(1);
      for (let segment = 0; segment < LINE_SEGMENTS; segment++) {
        const start = base + segment * 2;
        expect(lines.t[start]).toBeCloseTo(segment / LINE_SEGMENTS, 6);
        expect(lines.t[start + 1]).toBeCloseTo((segment + 1) / LINE_SEGMENTS, 6);
        // El final de un tramo es el principio del siguiente.
        if (segment > 0) expect(lines.t[start]).toBe(lines.t[start - 1]);
      }
      expect(lines.from[base]).toBe(edge.transition);
    });
  });

  it("guarda en cada vértice las posiciones y semillas de los dos nodos de la conexión", () => {
    layout.edges.forEach((edge, i) => {
      const from = layout.nodes[edge.from];
      const to = layout.nodes[edge.to];
      for (const v of [i * LINE_SEGMENTS * 2, (i + 1) * LINE_SEGMENTS * 2 - 1]) {
        expect(Array.from(lines.orderedA.slice(v * 3, v * 3 + 3))).toEqual(
          from.ordered.map((x) => Math.fround(x)),
        );
        expect(Array.from(lines.cloudB.slice(v * 3, v * 3 + 3))).toEqual(
          to.cloud.map((x) => Math.fround(x)),
        );
        expect(lines.seedA[v]).toBeCloseTo(from.seed, 6);
        expect(lines.seedB[v]).toBeCloseTo(to.seed, 6);
      }
    });
  });

  it("marca las conexiones que llegan a la salida", () => {
    layout.edges.forEach((edge, i) => {
      const expected = edge.transition === 2 ? 1 : 0;
      const base = i * LINE_SEGMENTS * 2;
      expect(lines.toOutput[base]).toBe(expected);
      expect(lines.toOutput[base + LINE_SEGMENTS * 2 - 1]).toBe(expected);
    });
  });
});
