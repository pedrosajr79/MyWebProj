import { describe, it, expect } from "vitest";
import { cn } from "@/lib/utils";

describe("cn (classname utility)", () => {
  it("combina classes simples", () => {
    expect(cn("a", "b")).toBe("a b");
  });

  it("ignora valores falsy", () => {
    expect(cn("a", false, undefined, null, "b")).toBe("a b");
  });

  it("resolve conflitos de Tailwind (último prevalece)", () => {
    const result = cn("text-white", "text-black");
    expect(result).toBe("text-black");
  });

  it("suporta objetos condicionais", () => {
    expect(cn({ "text-red-500": true, "text-blue-500": false })).toBe("text-red-500");
  });
});
