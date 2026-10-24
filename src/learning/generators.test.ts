import { describe, expect, it } from "vitest";
import en from "../i18n/locales/en-US.json";
import es from "../i18n/locales/es-US.json";
import { getWordAudioEntry } from "./literacy/audioRegistry";
import {
  ENGLISH_PHONICS_UNITS,
  PHONICS_WORD_BANK,
  SPANISH_PHONICS_UNITS,
  type PhonicsMechanic,
} from "./literacy/phonicsCurriculum";
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
  it("selects valid story words and offers three distinct minimal-pair word choices", () => {
    for (const seed of SEEDS) {
      for (const d of DIFFICULTIES) {
        const c = createPhonicsWords(mulberry32(seed), d);
        const [wordId] = c.operands;
        expect(STORY_WORD_IDS).toContain(wordId);
        expect(c.correctAnswer).toBe(1);
        expect(c.choiceKeyPrefix).toBe(`challenge.phonics.word.${wordId}.choice`);
        expect(c.choices).toContain(c.correctAnswer);
        expect(new Set(c.choices).size).toBe(3);
      }
    }
  });

  it("prompt, equation, grown-up tip, canvas labels, and spoken prompt never reveal the answer across all generators including phonics (A2 regression)", () => {
    const lookup = (obj: unknown, path: string): string => {
      const val = path.split(".").reduce<unknown>((acc, part) => {
        if (acc && typeof acc === "object" && part in (acc as Record<string, unknown>)) {
          return (acc as Record<string, unknown>)[part];
        }
        return undefined;
      }, obj);
      return typeof val === "string" ? val : "";
    };

    const interpolate = (template: string, vars: Record<string, string | number>): string =>
      template.replace(/\{\{(\w+)\}\}/g, (_, k: string) => String(vars[k] ?? ""));

    const containsWholeWord = (haystack: string, word: string): boolean => {
      const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      return new RegExp(`(^|[^\\p{L}])${escaped}([^\\p{L}]|$)`, "iu").test(haystack);
    };

    const mechanics: PhonicsMechanic[] = [
      "sound-recognition",
      "sound-blending",
      "phoneme-segmentation",
      "word-building",
      "decoding",
      "connected-reading",
    ];
    const promptKeyByMechanic: Record<PhonicsMechanic, string> = {
      "sound-recognition": "challenge.phonics.soundRecognition",
      "sound-blending": "challenge.phonics.soundMatch",
      "phoneme-segmentation": "challenge.phonics.segmentWord",
      "word-building": "challenge.phonics.buildWord",
      decoding: "challenge.phonics.storyClue",
      "connected-reading": "challenge.phonics.storySentence",
    };

    for (const locale of ["en-US", "es-US"] as const) {
      const dict = locale === "es-US" ? es : en;
      for (const wordId of STORY_WORD_IDS) {
        const entry = PHONICS_WORD_BANK[wordId]!;
        const targetWord = locale === "es-US" ? entry.esWord : entry.enWord;
        const icon = lookup(dict, `challenge.phonics.word.${wordId}.icon`);
        const rawSounds = lookup(dict, `challenge.phonics.word.${wordId}.sounds`);
        const clue = lookup(dict, `challenge.phonics.word.${wordId}.clue`);
        const sentence = lookup(dict, `challenge.phonics.word.${wordId}.sentence`);
        const audioEntry = getWordAudioEntry(wordId, locale);
        const parts = rawSounds
          .split("-")
          .map((s) => s.trim())
          .filter(Boolean);
        const elkonin = parts.map(() => "▢").join(" ");
        const soundCount = parts.length;

        // Verify minimal-pair choice labels are 3 distinct real words
        const c1 = lookup(dict, `challenge.phonics.word.${wordId}.choice.1.label`);
        const c2 = lookup(dict, `challenge.phonics.word.${wordId}.choice.2.label`);
        const c3 = lookup(dict, `challenge.phonics.word.${wordId}.choice.3.label`);
        expect(c1).toBe(targetWord);
        expect(new Set([c1, c2, c3]).size).toBe(3);

        for (const mechanic of mechanics) {
          const promptKey = promptKeyByMechanic[mechanic];
          const isStoryPhonics = promptKey.includes("story");
          const promptTemplate = lookup(dict, promptKey);

          const renderedPrompt = interpolate(promptTemplate, {
            elkonin,
            soundCount,
            clue: isStoryPhonics ? "" : clue,
            sentence,
          });
          const spokenPrompt = interpolate(promptTemplate, {
            elkonin: "",
            soundCount,
            clue: isStoryPhonics ? "" : clue,
            sentence,
          })
            .replace(/\(\s*,?\s*/g, "(")
            .replace(/\(\s*\)/g, "")
            .replace(/\s{2,}/g, " ")
            .trim();
          const equationText = interpolate(lookup(dict, "challenge.phonics.equation"), {
            icon: elkonin,
          });
          const activeGrownUpTip = `💡 ${lookup(dict, "challenge.phonics.parentPronunciationGuide")}`;
          const canvasClueBadge = isStoryPhonics ? "📜" : "🔤";
          const canvasElkoninProp = elkonin;

          // 1. Prompt text never reveals target word, phoneme letters, emoji, or false "listen/escucha" claims
          expect(containsWholeWord(renderedPrompt, targetWord)).toBe(false);
          expect(renderedPrompt).not.toContain(rawSounds);
          expect(renderedPrompt).not.toContain(icon);
          expect(renderedPrompt.toLowerCase()).not.toContain("listen");
          expect(renderedPrompt.toLowerCase()).not.toContain("escucha");
          if (mechanic === "decoding" || mechanic === "connected-reading") {
            expect(renderedPrompt).not.toContain(clue);
          }

          // 2. Equation text uses Elkonin boxes and never reveals target word or emoji
          expect(equationText).toContain("▢");
          expect(equationText).not.toContain(icon);
          expect(containsWholeWord(equationText, targetWord)).toBe(false);

          // 3. Active grown-up tip never reveals word-specific IPA or pronunciation tip (-> word)
          expect(activeGrownUpTip).not.toContain(audioEntry.ipa);
          expect(activeGrownUpTip).not.toContain(audioEntry.parentPronunciationTip);
          expect(containsWholeWord(activeGrownUpTip, targetWord)).toBe(false);

          // 4. Canvas non-choice labels show generic badge + visible Elkonin boxes, never emoji or target word
          expect(canvasClueBadge).not.toBe(icon);
          expect(canvasElkoninProp).toBe(elkonin);
          expect(containsWholeWord(canvasElkoninProp, targetWord)).toBe(false);

          // 5. Spoken prompt never utters the target word or raw hyphenated letters
          expect(containsWholeWord(spokenPrompt, targetWord)).toBe(false);
          expect(containsWholeWord(spokenPrompt, audioEntry.ttsSafeText)).toBe(false);
          expect(spokenPrompt).not.toContain(rawSounds);
          expect(spokenPrompt.toLowerCase()).not.toContain("listen");
          expect(spokenPrompt.toLowerCase()).not.toContain("escucha");
        }
      }

      // Check all non-phonics choice-based generators never reveal their answer label in the prompt
      for (const id of OBJECTIVE_IDS) {
        if (id === "phonics-words") continue;
        const gen = GENERATORS[id];
        for (const d of DIFFICULTIES) {
          for (const seed of SEEDS.slice(0, 25)) {
            const spec = gen(mulberry32(seed), d);
            if (!spec.choiceKeyPrefix) continue;
            const promptText = lookup(dict, spec.promptKey);
            const answerLabel = lookup(dict, `${spec.choiceKeyPrefix}.${spec.correctAnswer}.label`);
            expect(promptText.toUpperCase()).not.toContain(answerLabel.toUpperCase());
          }
        }
      }
    }

    // Also verify unit pattern membership for EN and ES
    expect(ENGLISH_PHONICS_UNITS.find((u) => u.id === "unit-2-blends-floss")?.wordIds).not.toContain(2);
    expect(ENGLISH_PHONICS_UNITS.find((u) => u.id === "unit-4-connected")?.wordIds).toContain(2);
    expect(SPANISH_PHONICS_UNITS.find((u) => u.id === "es-unit-3-digrafos")?.wordIds).toEqual([9, 2]);
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
