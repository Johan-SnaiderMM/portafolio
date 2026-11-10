import { describe, expect, it } from "vitest";
import { buildBuffers } from "./buffers";
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

    expect(lines.vertexCount).toBe(layout.edges.length * 2);
    expect(lines.cloud).toHaveLength(lines.vertexCount * 3);
    expect(lines.ordered).toHaveLength(lines.vertexCount * 3);
    for (const name of [
      "seed",
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

  it("marca origen (0) y destino (1) de cada conexión", () => {
    for (let i = 0; i < lines.vertexCount; i += 2) {
      expect(lines.t[i]).toBe(0);
      expect(lines.t[i + 1]).toBe(1);
      expect(lines.from[i]).toBe(lines.from[i + 1]);
    }
  });

  it("usa la posición del nodo en cada extremo de la conexión", () => {
    layout.edges.forEach((edge, i) => {
      const from = layout.nodes[edge.from];
      const to = layout.nodes[edge.to];
      expect(Array.from(lines.ordered.slice(i * 6, i * 6 + 3))).toEqual(
        from.ordered.map((v) => Math.fround(v)),
      );
      expect(Array.from(lines.cloud.slice(i * 6 + 3, i * 6 + 6))).toEqual(
        to.cloud.map((v) => Math.fround(v)),
      );
    });
  });

  it("marca las conexiones que llegan a la salida", () => {
    layout.edges.forEach((edge, i) => {
      const expected = edge.transition === 2 ? 1 : 0;
      expect(lines.toOutput[i * 2]).toBe(expected);
      expect(lines.toOutput[i * 2 + 1]).toBe(expected);
    });
  });
});
