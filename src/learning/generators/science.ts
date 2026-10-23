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
 * Naturekeeper Quests (NGSS 1-LS1-1, 1-ESS1-2; NC Science LS.1.1):
 * Teaches living vs. nonliving things, animal habitats, plant life cycles and
 * survival needs (water, sunlight, air, soil), seasons/weather, and observable
 * material properties while explicitly distinguishing story magic from real science.
 */
export function createScienceNature(rng: RandomSource, difficulty: Difficulty): ChallengeSpec {
  const pool = POOLS_BY_DIFFICULTY[difficulty];
  const itemId = pool[randomInt(rng, 0, pool.length - 1)] ?? 1;
  const distractor1 = ((itemId % 8) + 1) as ScienceItemId;
  const distractor2 = (((itemId + 2) % 8) + 1) as ScienceItemId;

  return {
    objectiveId: "science-nature",
    difficulty,
    promptKey: `challenge.science.item.${itemId}.prompt`,
    operator: "science",
    operands: [itemId, difficulty],
    correctAnswer: itemId,
    choiceKeyPrefix: "challenge.science.item",
    choices: buildChoices(rng, itemId, {
      min: 1,
      max: 8,
      likelyErrors: [distractor1, distractor2],
    }),
    meta: {
      itemFamily: FAMILY_BY_ID[itemId],
      standardCode: "1-LS1-1",
      parentGuideKey: "challenge.science.familyHandsOnTip",
      distractorErrors: {
        [distractor1]: "confused-story-magic-with-real-plant-need",
        [distractor2]: "misclassified-nonliving-as-living",
      },
    },
  };
}
