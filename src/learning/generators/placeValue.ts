import type { ChallengeSpec } from "../challenge";
import type { Difficulty } from "../objectives";
import { randomInt, type RandomSource } from "../random";
import { buildChoices } from "./choices";

const MAX_TENS: Readonly<Record<Difficulty, number>> = { 1: 1, 2: 4, 3: 9, 4: 11 };

/**
 * Rune inventory (1.NBT.B.2, 1.NBT.B.3; difficulty 4 items > 99 are flagged
 * as `isExtension: true` under 1.NBT.A.1 so they are never conflated with
 * two-digit place-value mastery):
 * - Bundling 10 loose crystals into 1 rune pack of ten (`difficulty === 1`)
 * - Composing and decomposing two-digit numbers (`difficulty 2..3`)
 * - Detecting swapped-digit (`34` vs `43`) and additive (`4 + 3 = 7`) misconceptions
 */
export function createTensAndOnes(rng: RandomSource, difficulty: Difficulty): ChallengeSpec {
  const tens = randomInt(rng, 1, MAX_TENS[difficulty]);
  const ones = randomInt(rng, 0, 9);
  const answer = tens * 10 + ones;
  const swapped = ones * 10 + tens;
  const additive = tens + ones;
  const isExtension = answer > 99;

  const itemFamily = isExtension
    ? "extended-bundle-count-above-99"
    : difficulty === 1
      ? "bundle-ten-ones"
      : difficulty === 2
        ? "compose-two-digit-tens-ones"
        : "decompose-two-digit-number";

  return {
    objectiveId: "tens-and-ones",
    difficulty,
    promptKey: "challenge.placeValue.countRunes",
    operator: "tens-ones",
    operands: [tens, ones],
    correctAnswer: answer,
    choices: buildChoices(rng, answer, {
      min: 0,
      max: 120,
      // Swapped digits, additive sum of digits, and off-by-ten are classic place-value errors.
      likelyErrors: [swapped, answer + 10, answer - 10, additive],
    }),
    meta: {
      itemFamily,
      standardCode: isExtension ? "1.NBT.A.1" : "1.NBT.B.2",
      isExtension,
      targetBlueprint: `${tens} tens (${tens * 10}) + ${ones} ones = ${answer}`,
      distractorErrors: {
        [swapped]: "swapped-tens-and-ones-digits",
        [additive]: "added-digits-without-place-value",
        [answer + 10]: "off-by-ten-bundle",
        [answer - 10]: "off-by-ten-bundle",
      },
    },
  };
}
