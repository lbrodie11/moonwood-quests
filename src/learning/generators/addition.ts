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
  1: { minSum: 2, maxSum: 10, minAddend: 1, maxAddend: 9 }, // fluency within 10
  2: { minSum: 6, maxSum: 15, minAddend: 1, maxAddend: 10 }, // counting on & doubles
  3: { minSum: 11, maxSum: 20, minAddend: 2, maxAddend: 10 }, // crosses ten
  4: { minSum: 13, maxSum: 18, minAddend: 6, maxAddend: 9 }, // make-ten decomposition strategy
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

function classifyAdditionStrategy(a: number, b: number, difficulty: Difficulty): {
  itemFamily: string;
  standardCode: string;
  targetBlueprint: string;
} {
  const sum = a + b;
  if (difficulty === 1 || sum <= 10) {
    return {
      itemFamily: "fluency-within-10",
      standardCode: "1.OA.C.6",
      targetBlueprint: `ten-frame:${a}+${b}=${sum}`,
    };
  }
  if (a === b || Math.abs(a - b) === 1) {
    return {
      itemFamily: "doubles-near-doubles",
      standardCode: "1.OA.C.6",
      targetBlueprint: `doubles:${Math.min(a, b)}+${Math.min(a, b)}${a === b ? "" : "+1"}`,
    };
  }
  if (difficulty >= 3 && sum > 10 && Math.max(a, b) < 10) {
    const needForTen = 10 - a;
    const remainder = b - needForTen;
    return {
      itemFamily: "make-ten-addition",
      standardCode: "1.OA.B.3",
      targetBlueprint: `make-ten:${a}+${needForTen}=10, 10+${remainder}=${sum}`,
    };
  }
  return {
    itemFamily: "counting-on-addition",
    standardCode: "1.OA.C.6",
    targetBlueprint: `count-on:start-${Math.max(a, b)}-jump-${Math.min(a, b)}`,
  };
}

/** "The gate needs blue mana and gold mana. How much mana altogether?" */
export function createAddition(rng: RandomSource, difficulty: Difficulty): ChallengeSpec {
  const [a, b] = additionFact(rng, difficulty);
  const answer = a + b;
  const wrongDiff = Math.abs(a - b);
  const strategy = classifyAdditionStrategy(a, b, difficulty);

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
      likelyErrors: [answer - 1, answer + 1, wrongDiff],
    }),
    meta: {
      itemFamily: strategy.itemFamily,
      standardCode: strategy.standardCode,
      targetBlueprint: strategy.targetBlueprint,
      reflectionPromptKey: "workshop.reflection.whatHelped",
      distractorErrors: {
        [answer - 1]: "off-by-one",
        [answer + 1]: "off-by-one",
        [wrongDiff]: "wrong-operation-subtracted",
      },
    },
  };
}

/** "There were n crystals. The spell used a. How many are left?" */
export function createSubtraction(rng: RandomSource, difficulty: Difficulty): ChallengeSpec {
  const [a, b] = additionFact(rng, difficulty);
  const whole = a + b;
  const wrongSum = Math.min(20, whole + a);
  const itemFamily =
    difficulty === 1
      ? "take-from-within-10"
      : difficulty === 2
        ? "think-addition-for-subtraction"
        : difficulty === 3
          ? "decompose-to-ten-subtraction"
          : "compare-difference-within-20";
  const standardCode = difficulty === 2 ? "1.OA.B.4" : "1.OA.C.6";

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
      likelyErrors: [b - 1, b + 1, wrongSum],
    }),
    meta: {
      itemFamily,
      standardCode,
      targetBlueprint: `think-addition:${a}+${b}=${whole}`,
      reflectionPromptKey: "workshop.reflection.anotherWay",
      distractorErrors: {
        [b - 1]: "off-by-one",
        [b + 1]: "off-by-one",
        [wrongSum]: "wrong-operation-added",
      },
    },
  };
}
