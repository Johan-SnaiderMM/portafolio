import { describe, expect, it } from "vitest";
import { createGovernor } from "./governor";

function feed(governor: ReturnType<typeof createGovernor>, ms: number, n: number) {
  return Array.from({ length: n }, () => governor.push(ms));
}

describe("createGovernor", () => {
  it("no se queja con 60 cuadros por segundo", () => {
    const governor = createGovernor({ windowSize: 30 });
    expect(feed(governor, 16.7, 120)).not.toContain("slow");
  });

  it("avisa cuando el promedio de la ventana es lento", () => {
    const governor = createGovernor({ windowSize: 30, slowMs: 28 });
    const verdicts = feed(governor, 45, 30);
    expect(verdicts.slice(0, 29)).not.toContain("slow");
    expect(verdicts[29]).toBe("slow");
  });

  it("solo decide al completar cada ventana y empieza otra", () => {
    const governor = createGovernor({ windowSize: 10, slowMs: 28 });
    expect(feed(governor, 50, 10).filter((v) => v === "slow")).toHaveLength(1);
    expect(feed(governor, 10, 10).filter((v) => v === "slow")).toHaveLength(0);
  });

  it("ignora pausas largas (pestaña oculta) y valores inválidos", () => {
    const governor = createGovernor({ windowSize: 10, slowMs: 28 });
    const verdicts = [
      ...feed(governor, 5000, 20),
      ...feed(governor, 1500, 20),
      ...feed(governor, 0, 5),
      ...feed(governor, -3, 5),
    ];
    expect(verdicts).not.toContain("slow");
    // Esas muestras no contaron: hacen falta 10 buenas para cerrar la ventana.
    expect(feed(governor, 16, 10).pop()).toBe("ok");
  });

  it("un pico aislado no basta si el promedio es bueno", () => {
    const governor = createGovernor({ windowSize: 20, slowMs: 28 });
    feed(governor, 16, 19);
    expect(governor.push(900)).toBe("ok");
  });

  it("un equipo que dibuja a 3 cuadros por segundo cuenta como lento", () => {
    const governor = createGovernor({ windowSize: 30, slowMs: 28 });
    const verdicts = feed(governor, 333, 30);
    expect(verdicts[29]).toBe("slow");
  });

  it("cada cuadro pesa como máximo el tope", () => {
    const governor = createGovernor({ windowSize: 10, slowMs: 28, capMs: 100 });
    // 9 cuadros de 10 ms y uno de 900 ms: con tope 100 el promedio es 19 ms.
    feed(governor, 10, 9);
    expect(governor.push(900)).toBe("ok");
  });

  it("reset descarta lo acumulado", () => {
    const governor = createGovernor({ windowSize: 10, slowMs: 28 });
    feed(governor, 80, 9);
    governor.reset();
    expect(governor.push(80)).toBe("ok");
  });
});
