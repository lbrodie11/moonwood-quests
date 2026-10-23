import type { ChallengeSpec } from "../challenge";
import type { Difficulty } from "../objectives";
import { randomInt, type RandomSource } from "../random";
import { buildChoices } from "./choices";

export const REASONING_ITEM_IDS = [1, 2, 3, 4, 5, 6, 7, 8] as const;
export type ReasoningItemId = (typeof REASONING_ITEM_IDS)[number];

const POOLS_BY_DIFFICULTY: Readonly<Record<Difficulty, readonly ReasoningItemId[]>> = {
  1: [1, 2],
  2: [3, 4],
  3: [5, 6],
  4: [7, 8],
};

const FAMILY_BY_ID: Readonly<Record<ReasoningItemId, string>> = {
  1: "deductive-rule-elimination",
  2: "deductive-rule-elimination",
  3: "multi-step-path-planning",
  4: "multi-step-path-planning",
  5: "hypothesis-testing",
  6: "hypothesis-testing",
  7: "metacognitive-strategy-reflection",
  8: "metacognitive-strategy-reflection",
};

/**
 * The Wizard's Workshop (MP.1, MP.2, MP.7):
 * Logical deduction by clue elimination, multi-step planning, testing and
 * revising hypotheses, and choosing better representations.
 * Includes non-graded metacognitive reflection prompts ("What helped you solve that?").
 */
export function createLogicalReasoning(rng: RandomSource, difficulty: Difficulty): ChallengeSpec {
  const pool = POOLS_BY_DIFFICULTY[difficulty];
  const itemId = pool[randomInt(rng, 0, pool.length - 1)] ?? 1;
  const distractor1 = ((itemId % 8) + 1) as ReasoningItemId;
  const distractor2 = (((itemId + 3) % 8) + 1) as ReasoningItemId;

  return {
    objectiveId: "logical-reasoning",
    difficulty,
    promptKey: `challenge.reasoning.item.${itemId}.prompt`,
    operator: "reasoning",
    operands: [itemId, difficulty],
    correctAnswer: itemId,
    choiceKeyPrefix: "challenge.reasoning.item",
    choices: buildChoices(rng, itemId, {
      min: 1,
      max: 8,
      likelyErrors: [distractor1, distractor2],
    }),
    meta: {
      itemFamily: FAMILY_BY_ID[itemId],
      standardCode: "MP.1",
      reflectionPromptKey: "workshop.reflection.whatHelped",
      distractorErrors: {
        [distractor1]: "ignored-negative-clue-constraint",
        [distractor2]: "reversed-step-order",
      },
    },
  };
}
