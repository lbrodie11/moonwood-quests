import { describe, expect, it } from "vitest";
import { mulberry32, randomInt, shuffle } from "./random";

describe("mulberry32", () => {
  it("is reproducible and stays in [0, 1)", () => {
    const a = mulberry32(42);
    const b = mulberry32(42);
    for (let i = 0; i < 1000; i++) {
      const x = a.next();
      expect(x).toBe(b.next());
      expect(x).toBeGreaterThanOrEqual(0);
      expect(x).toBeLessThan(1);
    }
  });
});

describe("randomInt", () => {
  it("covers the inclusive range", () => {
    const rng = mulberry32(7);
    const seen = new Set<number>();
    for (let i = 0; i < 500; i++) seen.add(randomInt(rng, 1, 6));
    expect([...seen].sort()).toEqual([1, 2, 3, 4, 5, 6]);
  });

  it("rejects inverted or non-integer ranges", () => {
    expect(() => randomInt(mulberry32(1), 5, 1)).toThrow(RangeError);
    expect(() => randomInt(mulberry32(1), 0.5, 2)).toThrow(RangeError);
  });
});

describe("shuffle", () => {
  it("returns a permutation without mutating the input", () => {
    const input = [1, 2, 3, 4, 5];
    const out = shuffle(mulberry32(3), input);
    expect(input).toEqual([1, 2, 3, 4, 5]);
    expect([...out].sort()).toEqual(input);
  });
});
