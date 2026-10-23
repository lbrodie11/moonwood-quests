import type { ChallengeSpec } from "../challenge";
import type { Difficulty } from "../objectives";
import { randomInt, type RandomSource } from "../random";
import { buildChoices } from "./choices";

const MAX_SPAN: Readonly<Record<Difficulty, number>> = {
  1: 8,
  2: 12,
  3: 16,
  4: 20,
};

/**
 * Bridge builder (1.MD.A.1 & 1.MD.A.2):
 * Measure and compare wooden bridge planks in whole moon-tile units.
 *
 * At difficulty 1–2, children join two measured plank segments end-to-end
 * (`a + b` moon-tiles). At difficulty 3–4, children compare a full ravine
 * span (`whole` moon-tiles) against an existing plank (`a` moon-tiles) to
 * find the missing plank length (`whole - a`).
 */
export function createCompareLengths(rng: RandomSource, difficulty: Difficulty): ChallengeSpec {
  const maxSpan = MAX_SPAN[difficulty];
  const span = randomInt(rng, difficulty <= 2 ? 3 : 7, maxSpan);
  const firstPlank = randomInt(rng, 1, span - 1);
  const secondPlank = span - firstPlank;

  if (difficulty <= 2) {
    return {
      objectiveId: "compare-lengths",
      difficulty,
      promptKey: "challenge.length.joinPlanks",
      operator: "length",
      operands: [firstPlank, secondPlank],
      correctAnswer: span,
      choices: buildChoices(rng, span, {
        min: 1,
        max: 20,
        likelyErrors: [span - 1, span + 1, Math.abs(firstPlank - secondPlank)],
      }),
    };
  }

  return {
    objectiveId: "compare-lengths",
    difficulty,
    promptKey: "challenge.length.missingPlank",
    operator: "length",
    operands: [span, firstPlank],
    correctAnswer: secondPlank,
    choices: buildChoices(rng, secondPlank, {
      min: 1,
      max: 20,
      likelyErrors: [secondPlank - 1, secondPlank + 1, Math.min(20, span + firstPlank)],
    }),
  };
}
