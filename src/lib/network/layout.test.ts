import { describe, expect, it } from "vitest";
import {
  DUST_COUNT,
  LAYER_SIZES,
  TRANSITIONS,
  generateNetwork,
} from "./layout";

const layout = generateNetwork(7);
const networkTotal = LAYER_SIZES.reduce((sum, n) => sum + n, 0);

describe("generateNetwork", () => {
  it("es determinista: la misma semilla da la misma red", () => {
    expect(JSON.stringify(generateNetwork(7))).toBe(JSON.stringify(layout));
  });

  it("cambia con otra semilla", () => {
    const other = generateNetwork(8);
    expect(JSON.stringify(other.nodes)).not.toBe(JSON.stringify(layout.nodes));
  });

  it("tiene los nodos de cada capa y el polvo de fondo", () => {
    expect(layout.networkCount).toBe(networkTotal);
    expect(layout.nodes).toHaveLength(networkTotal + DUST_COUNT);
    LAYER_SIZES.forEach((size, layer) => {
      expect(layout.nodes.filter((n) => n.layer === layer)).toHaveLength(size);
    });
    expect(layout.nodes.filter((n) => n.layer === -1)).toHaveLength(DUST_COUNT);
  });

  it("ordena las capas de izquierda a derecha", () => {
    const xs = LAYER_SIZES.map(
      (_, layer) => layout.nodes.find((n) => n.layer === layer)!.ordered[0],
    );
    expect([...xs].sort((a, b) => a - b)).toEqual(xs);
  });

  it("deja el polvo quieto: su posición ordenada es la de la nube", () => {
    for (const node of layout.nodes.filter((n) => n.layer === -1)) {
      expect(node.ordered).toEqual(node.cloud);
    }
  });

  it("no produce coordenadas inválidas ni desbordadas", () => {
    for (const node of layout.nodes) {
      for (const value of [...node.cloud, ...node.ordered]) {
        expect(Number.isFinite(value)).toBe(true);
        expect(Math.abs(value)).toBeLessThan(5);
      }
      expect(node.seed).toBeGreaterThanOrEqual(0);
      expect(node.seed).toBeLessThan(1);
    }
  });
});

describe("conexiones", () => {
  it("unen solo capas consecutivas, sin repetirse", () => {
    const keys = new Set<string>();
    for (const edge of layout.edges) {
      expect(layout.nodes[edge.from].layer).toBe(edge.transition);
      expect(layout.nodes[edge.to].layer).toBe(edge.transition + 1);
      const key = `${edge.from}-${edge.to}`;
      expect(keys.has(key)).toBe(false);
      keys.add(key);
    }
  });

  it("dejan a todos los nodos conectados", () => {
    layout.nodes.slice(0, layout.networkCount).forEach((node, index) => {
      if (node.layer > 0) {
        expect(layout.edges.some((e) => e.to === index)).toBe(true);
      }
      if (node.layer < LAYER_SIZES.length - 1) {
        expect(layout.edges.some((e) => e.from === index)).toBe(true);
      }
    });
  });

  it("son pocas: cada nodo tiene unas tres salidas, no todas contra todas", () => {
    const allToAll = LAYER_SIZES.slice(0, -1).reduce(
      (sum, n, i) => sum + n * LAYER_SIZES[i + 1],
      0,
    );
    expect(layout.edges.length).toBeGreaterThan(150);
    expect(layout.edges.length).toBeLessThan(allToAll / 2);
  });

  it("tienen una fase en [0, 1)", () => {
    for (const edge of layout.edges) {
      expect(edge.phase).toBeGreaterThanOrEqual(0);
      expect(edge.phase).toBeLessThan(1);
    }
  });
});

describe("camino iluminado", () => {
  it("tiene un nodo por capa, en orden", () => {
    expect(layout.path).toHaveLength(LAYER_SIZES.length);
    layout.path.forEach((index, layer) => {
      expect(layout.nodes[index].layer).toBe(layer);
    });
  });

  it("sigue conexiones reales marcadas como del camino", () => {
    const pathEdges = layout.edges.filter((edge) => edge.onPath);
    expect(pathEdges).toHaveLength(TRANSITIONS);
    pathEdges.forEach((edge) => {
      expect(layout.path[edge.transition]).toBe(edge.from);
      expect(layout.path[edge.transition + 1]).toBe(edge.to);
    });
  });

  it("marca como del camino solo a sus nodos", () => {
    const marked = layout.nodes
      .map((node, index) => (node.onPath ? index : -1))
      .filter((index) => index >= 0);
    expect(marked).toEqual([...layout.path].sort((a, b) => a - b));
  });
});
