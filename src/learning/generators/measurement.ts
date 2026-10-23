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
 * Measure and compare wooden bridge planks in equal-size moon-tile units laid
 * end-to-end with no gaps or overlaps.
 *
 * - Difficulty 1: Measure end-to-end moon-tile units (`1.MD.A.2`, `measure-end-to-end-unit-tiles`)
 * - Difficulty 2: Order three bridge planks shortest-to-longest and verify total end-to-end span (`1.MD.A.1`, `order-three-objects-by-length`)
 * - Difficulty 3: Indirect comparison of two planks using a third reference crystal rod (`1.MD.A.1`, `indirect-length-comparison-via-reference`)
 * - Difficulty 4: Identify valid end-to-end measurement (no gaps or overlaps) to complete the missing bridge span (`1.MD.A.2`, `identify-invalid-gap-or-overlap-measurement`)
 */
export function createCompareLengths(rng: RandomSource, difficulty: Difficulty): ChallengeSpec {
  const maxSpan = MAX_SPAN[difficulty];
  const span = randomInt(rng, difficulty <= 2 ? 3 : 7, maxSpan);
  const firstPlank = randomInt(rng, 1, span - 1);
  const secondPlank = span - firstPlank;

  if (difficulty <= 2) {
    const itemFamily =
      difficulty === 1 ? "measure-end-to-end-unit-tiles" : "order-three-objects-by-length";
    const standardCode = difficulty === 1 ? "1.MD.A.2" : "1.MD.A.1";
    const thirdReference = Math.max(1, Math.min(firstPlank, secondPlank) - 1);
    const orderedPlanks = [thirdReference, Math.min(firstPlank, secondPlank), Math.max(firstPlank, secondPlank)];

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
      meta: {
        itemFamily,
        standardCode,
        interactiveTiles: orderedPlanks.map((len) => `plank-${len}`),
        targetBlueprint: `end-to-end-no-gaps:${firstPlank}+${secondPlank}=${span} (ordered:${orderedPlanks.join("<")})`,
        reflectionPromptKey: "workshop.reflection.bridgeWork",
        distractorErrors: {
          [span - 1]: "gap-or-overlap-miscount",
          [span + 1]: "gap-or-overlap-miscount",
          [Math.abs(firstPlank - secondPlank)]: "compared-difference-instead-of-end-to-end-span",
        },
      },
    };
  }

  const itemFamily =
    difficulty === 3
      ? "indirect-length-comparison-via-reference"
      : "identify-invalid-gap-or-overlap-measurement";
  const standardCode = difficulty === 3 ? "1.MD.A.1" : "1.MD.A.2";

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
    meta: {
      itemFamily,
      standardCode,
      interactiveTiles: [`reference-span-${span}`, `known-plank-${firstPlank}`, `unit-tile-1`],
      targetBlueprint: `align-left-no-gaps:span-${span}-minus-plank-${firstPlank}=missing-${secondPlank}`,
      reflectionPromptKey: "workshop.reflection.bridgeWork",
      distractorErrors: {
        [secondPlank - 1]: "overlap-error-undermeasured",
        [secondPlank + 1]: "gap-error-overmeasured",
        [Math.min(20, span + firstPlank)]: "added-reference-and-plank",
      },
    },
  };
}
