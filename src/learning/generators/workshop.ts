import type { ChallengeSpec } from "../challenge";
import type { Difficulty } from "../objectives";
import { randomInt, type RandomSource } from "../random";
import { buildChoices } from "./choices";

export const WORKSHOP_ITEM_IDS = [1, 2, 3, 4, 5, 6, 7, 8] as const;
export type WorkshopItemId = (typeof WORKSHOP_ITEM_IDS)[number];

const POOLS_BY_DIFFICULTY: Readonly<Record<Difficulty, readonly WorkshopItemId[]>> = {
  1: [1, 2],
  2: [3, 4],
  3: [5, 6],
  4: [7, 8],
};

const FAMILY_BY_ID: Readonly<Record<WorkshopItemId, string>> = {
  1: "bridge-span-design",
  2: "bridge-span-design",
  3: "creature-habitat-design",
  4: "creature-habitat-design",
  5: "magical-tower-composition",
  6: "magical-tower-composition",
  7: "pattern-stone-mosaic",
  8: "pattern-stone-mosaic",
};

/**
 * Moonwood Workshop (1.G.A.2, MP.1, Engineering Design):
 * Open-ended creative construction with engineering constraints (multiple valid
 * ways to span a bridge, design a cozy creature habitat, compose a tower from
 * shapes, or arrange a stone mosaic).
 */
export function createCreativeConstruction(
  rng: RandomSource,
  difficulty: Difficulty,
): ChallengeSpec {
  const pool = POOLS_BY_DIFFICULTY[difficulty];
  const itemId = pool[randomInt(rng, 0, pool.length - 1)] ?? 1;

  return {
    objectiveId: "creative-construction",
    difficulty,
    promptKey: `challenge.workshop.item.${itemId}.prompt`,
    operator: "workshop",
    operands: [itemId, difficulty],
    correctAnswer: 1,
    choiceKeyPrefix: `challenge.workshop.item.${itemId}.choice`,
    choices: buildChoices(rng, 1, {
      min: 1,
      max: 3,
      likelyErrors: [2, 3],
    }),
    meta: {
      itemFamily: FAMILY_BY_ID[itemId],
      standardCode: "1.G.A.2",
      reflectionPromptKey: "workshop.reflection.bridgeWork",
      distractorErrors: {
        2: "constraint-mismatch",
        3: "unstable-base-or-missing-shelter",
      },
    },
  };
}
