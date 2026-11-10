import { describe, expect, it } from "vitest";
import { fill } from "./template";

describe("fill", () => {
  it("reemplaza las marcas y deja intactas las que no tienen valor", () => {
    expect(fill("Dígito {n} de {total}", { n: 2 })).toBe("Dígito 2 de {total}");
  });

  it("reemplaza una marca repetida", () => {
    expect(fill("{x}-{x}", { x: "a" })).toBe("a-a");
  });
});
