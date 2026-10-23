import type { ChallengeSpec } from "../challenge";
import type { Difficulty } from "../objectives";
import { randomInt, type RandomSource } from "../random";
import { buildChoices } from "./choices";

export const SCIENCE_ITEM_IDS = [1, 2, 3, 4, 5, 6, 7, 8] as const;
export type ScienceItemId = (typeof SCIENCE_ITEM_IDS)[number];

const POOLS_BY_DIFFICULTY: Readonly<Record<Difficulty, readonly ScienceItemId[]>> = {
  1: [1, 2],
  2: [3, 4],
  3: [5, 6],
  4: [7, 8],
};

const FAMILY_BY_ID: Readonly<Record<ScienceItemId, string>> = {
  1: "living-vs-nonliving",
  2: "habitat-matching",
  3: "plant-needs-and-lifecycle",
  4: "plant-needs-and-lifecycle",
  5: "seasons-and-materials",
  6: "seasons-and-materials",
  7: "magic-vs-real-science",
  8: "magic-vs-real-science",
};

/**
 * Naturekeeper Quests (NGSS K-LS1-1, 1-ESS1-2):
 * Teaches living vs. nonliving things, animal habitats, plant life cycles and
 * survival needs (water, sunlight, air, soil), seasons/weather, and observable
 * material properties while explicitly distinguishing story magic from real science.
 */
export function createScienceNature(rng: RandomSource, difficulty: Difficulty): ChallengeSpec {
  const pool = POOLS_BY_DIFFICULTY[difficulty];
  const itemId = pool[randomInt(rng, 0, pool.length - 1)] ?? 1;

  return {
    objectiveId: "science-nature",
    difficulty,
    promptKey: `challenge.science.item.${itemId}.prompt`,
    operator: "science",
    operands: [itemId, difficulty],
    correctAnswer: 1,
    choiceKeyPrefix: `challenge.science.item.${itemId}.choice`,
    choices: buildChoices(rng, 1, {
      min: 1,
      max: 3,
      likelyErrors: [2, 3],
    }),
    meta: {
      itemFamily: FAMILY_BY_ID[itemId],
      standardCode: itemId >= 5 && itemId <= 6 ? "1-ESS1-2" : "K-LS1-1",
      parentGuideKey: "challenge.science.familyHandsOnTip",
      distractorErrors: {
        2: "confused-story-magic-with-real-plant-need",
        3: "misclassified-nonliving-as-living",
      },
    },
  };
}
