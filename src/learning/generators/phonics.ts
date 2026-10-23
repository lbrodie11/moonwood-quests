import type { ChallengeSpec } from "../challenge";
import type { Difficulty } from "../objectives";
import { randomInt, type RandomSource } from "../random";
import { buildChoices } from "./choices";

/**
 * Storybook vocabulary & phonics entries (RF.1.2 & RF.1.3).
 * IDs 1..12 map to localized words, phonetic breakdowns, icons, and clues in
 * `src/i18n/locales/*.json` under `challenge.phonics.word.<id>.*`.
 */
export const STORY_WORD_IDS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] as const;
export type StoryWordId = (typeof STORY_WORD_IDS)[number];

const BAND_POOLS: Readonly<Record<Difficulty, readonly StoryWordId[]>> = {
  1: [1, 2, 3, 4, 5, 6],
  2: [1, 2, 3, 4, 5, 6, 7, 8, 9],
  3: [4, 5, 6, 7, 8, 9, 10, 11, 12],
  4: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
};

/**
 * Enchanted Library (RF.1.3):
 * Match letter-sounds, CVC/CVCE words, and spoken story clues to restore
 * scattered pages in the Enchanted Library.
 */
export function createPhonicsWords(rng: RandomSource, difficulty: Difficulty): ChallengeSpec {
  const pool = BAND_POOLS[difficulty];
  const wordId = pool[randomInt(rng, 0, pool.length - 1)] ?? 1;
  const promptKey =
    difficulty === 1
      ? "challenge.phonics.soundMatch"
      : difficulty === 2
        ? "challenge.phonics.buildWord"
        : "challenge.phonics.storyClue";

  return {
    objectiveId: "phonics-words",
    difficulty,
    promptKey,
    operator: "phonics",
    operands: [wordId, difficulty],
    correctAnswer: wordId,
    choiceKeyPrefix: "challenge.phonics.word",
    choices: buildChoices(rng, wordId, {
      min: 1,
      max: 12,
      likelyErrors: [((wordId % 12) + 1), (((wordId + 2) % 12) + 1)],
    }),
  };
}
