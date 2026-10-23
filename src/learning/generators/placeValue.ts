import type { ChallengeSpec } from "../challenge";
import type { Difficulty } from "../objectives";
import { randomInt, type RandomSource } from "../random";
import { buildChoices } from "./choices";

const MAX_TENS: Readonly<Record<Difficulty, number>> = { 1: 1, 2: 4, 3: 9, 4: 11 };

/**
 * Rune inventory: "You have 3 rune packs of ten and 4 loose crystals.
 * How many crystals?" (1.NBT.B.2; difficulty 4 extends toward 120, 1.NBT.A.1)
 */
export function createTensAndOnes(rng: RandomSource, difficulty: Difficulty): ChallengeSpec {
  const tens = randomInt(rng, 1, MAX_TENS[difficulty]);
  const ones = randomInt(rng, 0, 9);
  const answer = tens * 10 + ones;
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
      // Swapped digits and off-by-ten are the classic place-value errors.
      likelyErrors: [ones * 10 + tens, answer + 10, answer - 10, tens + ones],
    }),
  };
}
