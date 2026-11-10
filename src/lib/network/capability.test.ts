import { describe, expect, it } from "vitest";
import { decideMode, type CapabilityInput } from "./capability";

const base: CapabilityInput = {
  reducedMotion: false,
  saveData: false,
  deviceMemory: 8,
  hardwareConcurrency: 8,
  override: null,
};

describe("decideMode", () => {
  it("usa 3D en un equipo normal", () => {
    expect(decideMode(base)).toEqual({ mode: "3d", reason: "ok" });
  });

  it("usa 3D si el navegador no informa memoria ni núcleos (Safari, Firefox)", () => {
    expect(
      decideMode({ ...base, deviceMemory: undefined, hardwareConcurrency: undefined }),
    ).toEqual({ mode: "3d", reason: "ok" });
  });

  it("respeta «menos movimiento»", () => {
    expect(decideMode({ ...base, reducedMotion: true })).toEqual({
      mode: "static",
      reason: "reduced-motion",
    });
  });

  it("respeta el ahorro de datos", () => {
    expect(decideMode({ ...base, saveData: true })).toEqual({
      mode: "static",
      reason: "save-data",
    });
  });

  it("deja el esquema estático en equipos de poca memoria o pocos núcleos", () => {
    expect(decideMode({ ...base, deviceMemory: 2 }).reason).toBe("low-memory");
    expect(decideMode({ ...base, deviceMemory: 0.5 }).reason).toBe("low-memory");
    expect(decideMode({ ...base, deviceMemory: 4 }).mode).toBe("3d");
    expect(decideMode({ ...base, hardwareConcurrency: 2 }).reason).toBe(
      "few-cores",
    );
    expect(decideMode({ ...base, hardwareConcurrency: 4 }).mode).toBe("3d");
  });

  it("?3d=off fuerza la versión estática", () => {
    expect(decideMode({ ...base, override: "off" })).toEqual({
      mode: "static",
      reason: "override-off",
    });
  });

  it("?3d=on se salta las pruebas de equipo", () => {
    expect(
      decideMode({ ...base, deviceMemory: 1, hardwareConcurrency: 1, override: "on" }),
    ).toEqual({ mode: "3d", reason: "override-on" });
  });

  it("?3d=on nunca pasa por encima de las preferencias de la persona", () => {
    expect(decideMode({ ...base, reducedMotion: true, override: "on" }).mode).toBe(
      "static",
    );
    expect(decideMode({ ...base, saveData: true, override: "on" }).mode).toBe(
      "static",
    );
  });

  it("ignora valores raros de ?3d=", () => {
    expect(decideMode({ ...base, override: "quizas" }).reason).toBe("ok");
  });
});
