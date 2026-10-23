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

function classifyAdditionProblemStructure(a: number, b: number, difficulty: Difficulty): {
  itemFamily: string;
  standardCode: string;
  targetBlueprint: string;
} {
  const sum = a + b;
  if (difficulty === 1 || sum <= 10) {
    return {
      itemFamily: "within-10-sum",
      standardCode: "1.OA.C.6",
      targetBlueprint: `ten-frame:${a}+${b}=${sum}`,
    };
  }
  if (a === b || Math.abs(a - b) === 1) {
    return {
      itemFamily: "doubles-and-near-doubles-fact",
      standardCode: "1.OA.C.6",
      targetBlueprint: `doubles:${Math.min(a, b)}+${Math.min(a, b)}${a === b ? "" : "+1"}`,
    };
  }
  if (a === 10 || b === 10) {
    return {
      itemFamily: "ten-plus-ones-fact",
      standardCode: "1.OA.C.6",
      targetBlueprint: `ten-plus:${a}+${b}=${sum}`,
    };
  }
  return {
    itemFamily: "crossing-10-teen-sum",
    standardCode: "1.OA.C.6",
    targetBlueprint: `bridge-ten:${a}+${b}=${sum}`,
  };
}

/** "The gate needs blue mana and gold mana. How much mana altogether?" */
export function createAddition(rng: RandomSource, difficulty: Difficulty): ChallengeSpec {
  const [a, b] = additionFact(rng, difficulty);
  const answer = a + b;
  const wrongDiff = Math.abs(a - b);
  const structure = classifyAdditionProblemStructure(a, b, difficulty);

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
      itemFamily: structure.itemFamily,
      standardCode: structure.standardCode,
      targetBlueprint: structure.targetBlueprint,
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
    whole <= 10
      ? "within-10-subtraction"
      : a === 10 || b === 10
        ? "teen-minus-ten-or-ones"
        : whole > 10 && b < 10
          ? "crossing-10-subtraction"
          : "within-20-difference";

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
      standardCode: "1.OA.C.6",
      targetBlueprint: `subtract:${whole}-${a}=${b}`,
      reflectionPromptKey: "workshop.reflection.anotherWay",
      distractorErrors: {
        [b - 1]: "off-by-one",
        [b + 1]: "off-by-one",
        [wrongSum]: "wrong-operation-added",
      },
    },
  };
}
