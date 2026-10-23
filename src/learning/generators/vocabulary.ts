import type { ChallengeSpec } from "../challenge";
import type { Difficulty } from "../objectives";
import { randomInt, type RandomSource } from "../random";
import { buildChoices } from "./choices";

export const VOCABULARY_ITEM_IDS = [1, 2, 3, 4, 5, 6, 7, 8] as const;
export type VocabularyItemId = (typeof VOCABULARY_ITEM_IDS)[number];

const POOLS_BY_DIFFICULTY: Readonly<Record<Difficulty, readonly VocabularyItemId[]>> = {
  1: [1, 2],
  2: [3, 4],
  3: [5, 6],
  4: [7, 8],
};

const FAMILY_BY_ID: Readonly<Record<VocabularyItemId, string>> = {
  1: "word-meaning-in-context",
  2: "word-meaning-in-context",
  3: "category-sorting",
  4: "category-sorting",
  5: "synonym-antonym-comparison",
  6: "synonym-antonym-comparison",
  7: "parent-assisted-oral-explanation",
  8: "parent-assisted-oral-explanation",
};

/**
 * Creature Conversations (L.1.4, L.1.5, SL.1.1):
 * Vocabulary in context, category sorting, shades of meaning / synonyms & antonyms,
 * and parent-assisted oral explanation prompts with Moss, Pip, Bramble, Luma, and Astra.
 * Never records or uploads child speech.
 */
export function createVocabularyOral(rng: RandomSource, difficulty: Difficulty): ChallengeSpec {
  const pool = POOLS_BY_DIFFICULTY[difficulty];
  const itemId = pool[randomInt(rng, 0, pool.length - 1)] ?? 1;

  return {
    objectiveId: "vocabulary-oral",
    difficulty,
    promptKey: `challenge.vocabulary.item.${itemId}.prompt`,
    operator: "vocabulary",
    operands: [itemId, difficulty],
    correctAnswer: 1,
    choiceKeyPrefix: `challenge.vocabulary.item.${itemId}.choice`,
    choices: buildChoices(rng, 1, {
      min: 1,
      max: 3,
      likelyErrors: [2, 3],
    }),
    meta: {
      itemFamily: FAMILY_BY_ID[itemId],
      standardCode: "L.1.5",
      parentGuideKey: "challenge.vocabulary.parentOralPrompt",
      distractorErrors: {
        2: "category-or-attribute-mismatch",
        3: "opposite-meaning-confusion",
      },
    },
  };
}
