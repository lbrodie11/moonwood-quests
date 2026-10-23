import type { ChallengeSpec } from "../challenge";
import type { Difficulty } from "../objectives";
import { randomInt, type RandomSource } from "../random";
import { buildChoices } from "./choices";

export const COMPREHENSION_ITEM_IDS = [1, 2, 3, 4, 5, 6, 7, 8] as const;
export type ComprehensionItemId = (typeof COMPREHENSION_ITEM_IDS)[number];

const POOLS_BY_DIFFICULTY: Readonly<Record<Difficulty, readonly ComprehensionItemId[]>> = {
  1: [1, 2],
  2: [3, 4],
  3: [5, 6],
  4: [7, 8],
};

const FAMILY_BY_ID: Readonly<Record<ComprehensionItemId, string>> = {
  1: "literal-detail-comprehension",
  2: "character-and-main-idea",
  3: "story-sequencing",
  4: "story-sequencing",
  5: "cause-and-effect",
  6: "cause-and-effect",
  7: "simple-inference-and-prediction",
  8: "simple-inference-and-prediction",
};

/**
 * Storykeeper Quests (RL.1.1, RL.1.2, RL.1.3; NC 2017 ELA RL.1.1; NC 2026 ELA 1.RC.L):
 * Original decodable and early-reader Moonwood stories assessing literal detail,
 * character/main idea, sequencing, cause & effect, and inference/prediction.
 *
 * Listening comprehension vs. independent reading comprehension is tracked
 * separately via response modality in the evidence engine.
 */
export function createReadingComprehension(
  rng: RandomSource,
  difficulty: Difficulty,
): ChallengeSpec {
  const pool = POOLS_BY_DIFFICULTY[difficulty];
  const itemId = pool[randomInt(rng, 0, pool.length - 1)] ?? 1;
  const distractor1 = ((itemId % 8) + 1) as ComprehensionItemId;
  const distractor2 = (((itemId + 2) % 8) + 1) as ComprehensionItemId;

  return {
    objectiveId: "reading-comprehension",
    difficulty,
    promptKey: `challenge.comprehension.item.${itemId}.prompt`,
    operator: "comprehension",
    operands: [itemId, difficulty],
    correctAnswer: itemId,
    choiceKeyPrefix: "challenge.comprehension.item",
    choices: buildChoices(rng, itemId, {
      min: 1,
      max: 8,
      likelyErrors: [distractor1, distractor2],
    }),
    meta: {
      itemFamily: FAMILY_BY_ID[itemId],
      standardCode: "RL.1.1",
      passageKey: `challenge.comprehension.item.${itemId}.passage`,
      reflectionPromptKey: "workshop.reflection.whatHelped",
      distractorErrors: {
        [distractor1]: "confused-story-detail-or-sequence",
        [distractor2]: "reversed-cause-and-effect",
      },
    },
  };
}
