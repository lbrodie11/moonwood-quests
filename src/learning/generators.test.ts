import { describe, expect, it } from "vitest";
import { createAddition, createSubtraction, ADDITION_BANDS } from "./generators/addition";
import { buildChoices } from "./generators/choices";
import { createComposeShapes } from "./generators/geometry";
import { GENERATORS } from "./generators";
import { createCompareLengths } from "./generators/measurement";
import { createStarPatterns } from "./generators/patterns";
import { createPhonicsWords, STORY_WORD_IDS } from "./generators/phonics";
import { createTensAndOnes } from "./generators/placeValue";
import { OBJECTIVE_IDS, type Difficulty } from "./objectives";
import { mulberry32 } from "./random";

const DIFFICULTIES: Difficulty[] = [1, 2, 3, 4];
const SEEDS = Array.from({ length: 200 }, (_, i) => i * 7919 + 1);

describe("createAddition", () => {
  it.each(DIFFICULTIES)("stays inside its band at difficulty %i", (difficulty) => {
    const band = ADDITION_BANDS[difficulty];
    for (const seed of SEEDS) {
      const c = createAddition(mulberry32(seed), difficulty);
      const [a, b] = c.operands as [number, number];
      expect(a + b).toBe(c.correctAnswer);
      expect(c.correctAnswer).toBeGreaterThanOrEqual(band.minSum);
      expect(c.correctAnswer).toBeLessThanOrEqual(Math.min(20, band.maxSum));
      expect(a).toBeGreaterThanOrEqual(band.minAddend);
      expect(b).toBeGreaterThanOrEqual(band.minAddend);
    }
  });

  it("always offers three unique choices including the answer", () => {
    for (const seed of SEEDS) {
      for (const d of DIFFICULTIES) {
        const c = createAddition(mulberry32(seed), d);
        expect(c.choices).toHaveLength(3);
        expect(new Set(c.choices).size).toBe(3);
        expect(c.choices).toContain(c.correctAnswer);
        for (const choice of c.choices) {
          expect(choice).toBeGreaterThanOrEqual(0);
          expect(choice).toBeLessThanOrEqual(20);
        }
      }
    }
  });

  it("is deterministic for a given seed", () => {
    expect(createAddition(mulberry32(10473), 3)).toEqual(createAddition(mulberry32(10473), 3));
  });

  it("difficulty 3+ crosses ten", () => {
    for (const seed of SEEDS) {
      expect(createAddition(mulberry32(seed), 3).correctAnswer).toBeGreaterThan(10);
    }
  });
});

describe("createSubtraction", () => {
  it("never produces a negative or out-of-range answer", () => {
    for (const seed of SEEDS) {
      for (const d of DIFFICULTIES) {
        const c = createSubtraction(mulberry32(seed), d);
        const [whole, part] = c.operands as [number, number];
        expect(whole - part).toBe(c.correctAnswer);
        expect(c.correctAnswer).toBeGreaterThanOrEqual(0);
        expect(whole).toBeLessThanOrEqual(20);
      }
    }
  });
});

describe("createTensAndOnes", () => {
  it("composes tens and ones correctly and stays within 120", () => {
    for (const seed of SEEDS) {
      for (const d of DIFFICULTIES) {
        const c = createTensAndOnes(mulberry32(seed), d);
        const [tens, ones] = c.operands as [number, number];
        expect(c.correctAnswer).toBe(tens * 10 + ones);
        expect(c.correctAnswer).toBeLessThanOrEqual(120);
        expect(new Set(c.choices).size).toBe(c.choices.length);
      }
    }
  });
});

describe("buildChoices", () => {
  it("prefers likely errors when they are in range", () => {
    const choices = buildChoices(mulberry32(1), 12, { min: 0, max: 20, likelyErrors: [11, 13] });
    expect([...choices].sort((x, y) => x - y)).toEqual([11, 12, 13]);
  });

  it("fills from the range when near misses run out", () => {
    const choices = buildChoices(mulberry32(5), 0, { min: 0, max: 2 });
    expect([...choices].sort()).toEqual([0, 1, 2]);
  });

  it("rejects impossible requests", () => {
    expect(() => buildChoices(mulberry32(1), 25, { min: 0, max: 20 })).toThrow(RangeError);
    expect(() => buildChoices(mulberry32(1), 1, { min: 0, max: 1 })).toThrow(RangeError);
  });
});

describe("createCompareLengths", () => {
  it("measures and compares bridge plank lengths within 20", () => {
    for (const seed of SEEDS) {
      for (const d of DIFFICULTIES) {
        const c = createCompareLengths(mulberry32(seed), d);
        const [a, b] = c.operands as [number, number];
        if (d <= 2) {
          expect(c.correctAnswer).toBe(a + b);
        } else {
          expect(c.correctAnswer).toBe(a - b);
        }
        expect(c.correctAnswer).toBeGreaterThanOrEqual(1);
        expect(c.correctAnswer).toBeLessThanOrEqual(20);
        expect(c.choices).toContain(c.correctAnswer);
        expect(new Set(c.choices).size).toBe(3);
      }
    }
  });
});

describe("createComposeShapes", () => {
  it("composes shapes and counts sides/pieces accurately", () => {
    for (const seed of SEEDS) {
      for (const d of DIFFICULTIES) {
        const c = createComposeShapes(mulberry32(seed), d);
        const [a, b] = c.operands as [number, number];
        expect(c.correctAnswer).toBe(a + b);
        expect(c.choices).toContain(c.correctAnswer);
        expect(new Set(c.choices).size).toBe(3);
      }
    }
  });
});

describe("createPhonicsWords", () => {
  it("selects valid story words and offers three distinct word choices", () => {
    for (const seed of SEEDS) {
      for (const d of DIFFICULTIES) {
        const c = createPhonicsWords(mulberry32(seed), d);
        expect(STORY_WORD_IDS).toContain(c.correctAnswer);
        expect(c.choiceKeyPrefix).toBe("challenge.phonics.word");
        expect(c.choices).toContain(c.correctAnswer);
        expect(new Set(c.choices).size).toBe(3);
      }
    }
  });
});

describe("createStarPatterns", () => {
  it("generates Grade 1 skip-counting star sequences (steps of 1, 2, 5, 10) with a valid next term", () => {
    for (const seed of SEEDS) {
      for (const d of DIFFICULTIES) {
        const c = createStarPatterns(mulberry32(seed), d);
        const [first, second, third, step] = c.operands as [number, number, number, number];
        expect([1, 2, 5, 10]).toContain(step);
        expect(second - first).toBe(step);
        expect(third - second).toBe(step);
        expect(c.correctAnswer).toBe(third + step);
        expect(c.choices).toContain(c.correctAnswer);
        expect(new Set(c.choices).size).toBe(3);
      }
    }
  });
});

describe("generator registry", () => {
  it("covers all curriculum objectives", () => {
    expect(Object.keys(GENERATORS).sort()).toEqual([...OBJECTIVE_IDS].sort());
  });
});
