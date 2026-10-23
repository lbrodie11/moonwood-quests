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

const TILES_BY_ID: Readonly<Record<WorkshopItemId, readonly string[]>> = {
  1: ["Plank 4 + Plank 4", "Plank 5 + Plank 3", "Plank 6 + Plank 2"],
  2: ["Plank 5 + Plank 5", "Plank 6 + Plank 4", "Plank 7 + Plank 3"],
  3: ["Pond Water", "Hollow Log Shelter", "Leafy Shade"],
  4: ["Dry Moss Bed", "High Tree Branch", "Moonberry Bush"],
  5: ["Square Base", "Rectangle Pillar", "Triangle Roof"],
  6: ["Two Trapezoids -> Hexagon", "Four Squares -> Big Square", "Two Triangles -> Rhombus"],
  7: ["Blue - Gold - Blue - Gold", "Star - Star - Moon - Star - Star - Moon"],
  8: ["Turn North -> East -> North", "Bridge -> Lantern -> Gate"],
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
  const distractor1 = ((itemId % 8) + 1) as WorkshopItemId;
  const distractor2 = (((itemId + 2) % 8) + 1) as WorkshopItemId;

  return {
    objectiveId: "creative-construction",
    difficulty,
    promptKey: `challenge.workshop.item.${itemId}.prompt`,
    operator: "workshop",
    operands: [itemId, difficulty],
    correctAnswer: itemId,
    choiceKeyPrefix: "challenge.workshop.item",
    choices: buildChoices(rng, itemId, {
      min: 1,
      max: 8,
      likelyErrors: [distractor1, distractor2],
    }),
    meta: {
      itemFamily: FAMILY_BY_ID[itemId],
      standardCode: "1.G.A.2",
      interactiveTiles: TILES_BY_ID[itemId],
      reflectionPromptKey: "workshop.reflection.bridgeWork",
      distractorErrors: {
        [distractor1]: "constraint-mismatch",
        [distractor2]: "unstable-base-or-missing-shelter",
      },
    },
  };
}
