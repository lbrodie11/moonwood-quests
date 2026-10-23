import type { ChallengeSpec } from "../challenge";
import type { Difficulty } from "../objectives";
import { randomInt, type RandomSource } from "../random";
import { buildChoices } from "./choices";

interface Band {
  minSum: number;
  maxSum: number;
  minAddend: number;
  maxAddend: number;
}

/**
 * Difficulty bands are design parameters, not calibrated psychometrics.
 * Review them with a Grade 1 educator and adjust from playtest evidence.
 */
export const ADDITION_BANDS: Readonly<Record<Difficulty, Band>> = {
  1: { minSum: 2, maxSum: 10, minAddend: 1, maxAddend: 9 }, // within 10
  2: { minSum: 6, maxSum: 15, minAddend: 1, maxAddend: 10 },
  3: { minSum: 11, maxSum: 20, minAddend: 2, maxAddend: 10 }, // crosses ten
  4: { minSum: 13, maxSum: 18, minAddend: 6, maxAddend: 9 }, // make-ten strategy
};

/** Returns [a, b] with a + b inside the band for the given difficulty. */
export function additionFact(rng: RandomSource, difficulty: Difficulty): [number, number] {
  const band = ADDITION_BANDS[difficulty];
  const sum = randomInt(rng, band.minSum, band.maxSum);
  const lo = Math.max(band.minAddend, sum - band.maxAddend);
  const hi = Math.min(band.maxAddend, sum - band.minAddend);
  const a = randomInt(rng, lo, hi);
  return [a, sum - a];
}

/** "The gate needs blue mana and gold mana. How much mana altogether?" */
export function createAddition(rng: RandomSource, difficulty: Difficulty): ChallengeSpec {
  const [a, b] = additionFact(rng, difficulty);
  const answer = a + b;
  return {
    objectiveId: "add-within-20",
    difficulty,
    promptKey: "challenge.addition.combineMana",
    operator: "+",
    operands: [a, b],
    correctAnswer: answer,
    choices: buildChoices(rng, answer, {
      min: 0,
      max: 20,
      likelyErrors: [answer - 1, answer + 1, Math.abs(a - b)],
    }),
  };
}

/** "There were n crystals. The spell used a. How many are left?" */
export function createSubtraction(rng: RandomSource, difficulty: Difficulty): ChallengeSpec {
  const [a, b] = additionFact(rng, difficulty);
  const whole = a + b;
  return {
    objectiveId: "subtract-within-20",
    difficulty,
    promptKey: "challenge.subtraction.spendMana",
    operator: "-",
    operands: [whole, a],
    correctAnswer: b,
    choices: buildChoices(rng, b, {
      min: 0,
      max: 20,
      likelyErrors: [b - 1, b + 1, whole + a],
    }),
  };
}
