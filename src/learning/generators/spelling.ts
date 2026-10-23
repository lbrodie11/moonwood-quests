import type { ChallengeSpec } from "../challenge";
import type { Difficulty } from "../objectives";
import { randomInt, type RandomSource } from "../random";
import { buildChoices } from "./choices";

export const SPELLING_ITEM_IDS = [1, 2, 3, 4, 5, 6, 7, 8] as const;
export type SpellingItemId = (typeof SPELLING_ITEM_IDS)[number];

const POOLS_BY_DIFFICULTY: Readonly<Record<Difficulty, readonly SpellingItemId[]>> = {
  1: [1, 2],
  2: [3, 4],
  3: [5, 6],
  4: [7, 8],
};

const FAMILY_BY_ID: Readonly<Record<SpellingItemId, string>> = {
  1: "letter-tile-encoding",
  2: "letter-tile-encoding",
  3: "letter-tile-encoding",
  4: "letter-tile-encoding",
  5: "sentence-ordering",
  6: "sentence-ordering",
  7: "capitalization-and-end-punctuation",
  8: "creative-writing-starter",
};

/**
 * Rune Journal (L.1.1, L.1.2, RF.1.3):
 * Letter-tile word encoding, word order in sentences, capitalization and ending
 * punctuation conventions, and self/parent-reviewed creative writing starters
 * (including a physical paper-and-pencil companion prompt).
 */
export function createSpellingWriting(rng: RandomSource, difficulty: Difficulty): ChallengeSpec {
  const pool = POOLS_BY_DIFFICULTY[difficulty];
  const itemId = pool[randomInt(rng, 0, pool.length - 1)] ?? 1;

  return {
    objectiveId: "spelling-writing",
    difficulty,
    promptKey: `challenge.spelling.item.${itemId}.prompt`,
    operator: "spelling",
    operands: [itemId, difficulty],
    correctAnswer: 1,
    choiceKeyPrefix: `challenge.spelling.item.${itemId}.choice`,
    choices: buildChoices(rng, 1, {
      min: 1,
      max: 3,
      likelyErrors: [2, 3],
    }),
    meta: {
      itemFamily: FAMILY_BY_ID[itemId],
      standardCode: itemId <= 4 ? "RF.1.3" : "L.1.2",
      parentGuideKey: "challenge.spelling.paperCompanionPrompt",
      distractorErrors: {
        2: "vowel-or-letter-order-inversion",
        3: "missing-capital-or-end-punctuation",
      },
    },
  };
}
