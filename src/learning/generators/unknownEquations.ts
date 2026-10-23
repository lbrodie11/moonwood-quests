import type { ChallengeSpec } from "../challenge";
import type { Difficulty } from "../objectives";
import { randomInt, type RandomSource } from "../random";
import { additionFact } from "./addition";
import { buildChoices } from "./choices";

export type EquationStructure =
  | "missing-second-addend" // a + ? = c
  | "missing-first-addend" // ? + b = c
  | "missing-subtrahend" // c - ? = a
  | "missing-minuend-reversed-equals"; // a = ? - b

const STRUCTURES_BY_DIFFICULTY: Readonly<Record<Difficulty, readonly EquationStructure[]>> = {
  1: ["missing-second-addend"],
  2: ["missing-second-addend", "missing-first-addend"],
  3: ["missing-second-addend", "missing-first-addend", "missing-subtrahend"],
  4: [
    "missing-second-addend",
    "missing-first-addend",
    "missing-subtrahend",
    "missing-minuend-reversed-equals",
  ],
};

/**
 * Unknown-number equations (1.OA.D.8 / NC.1.OA.8):
 * Determines the unknown whole number in an addition or subtraction equation
 * relating three whole numbers:
 * - `6 + ? = 10` (`missing-second-addend`, operands: `[6, 10, 1]`, answer `4`)
 * - `? + 4 = 9`  (`missing-first-addend`, operands: `[4, 9, 2]`, answer `5`)
 * - `12 - ? = 7` (`missing-subtrahend`, operands: `[12, 7, 3]`, answer `5`)
 * - `8 = ? - 3`  (`missing-minuend-reversed-equals`, operands: `[8, 3, 4]`, answer `11`)
 */
export function createUnknownNumberEquations(
  rng: RandomSource,
  difficulty: Difficulty,
): ChallengeSpec {
  const [a, b] = additionFact(rng, difficulty);
  const whole = a + b;
  const structures = STRUCTURES_BY_DIFFICULTY[difficulty];
  const structure =
    structures[randomInt(rng, 0, structures.length - 1)] ?? "missing-second-addend";

  if (structure === "missing-second-addend") {
    // a + ? = whole -> unknown is b
    const wrongOp = Math.min(20, whole + a);
    return {
      objectiveId: "unknown-number-equations",
      difficulty,
      promptKey: "challenge.unknownEquation.missingSecondAddend",
      operator: "unknown-equation",
      operands: [a, whole, 1],
      correctAnswer: b,
      choices: buildChoices(rng, b, {
        min: 0,
        max: 20,
        likelyErrors: [wrongOp, b - 1, b + 1, whole],
      }),
      meta: {
        itemFamily: "missing-second-addend",
        standardCode: "1.OA.D.8",
        targetBlueprint: `${a} + ? = ${whole}`,
        distractorErrors: {
          [wrongOp]: "added-instead-of-finding-missing-addend",
          [b - 1]: "off-by-one",
          [b + 1]: "off-by-one",
        },
      },
    };
  }

  if (structure === "missing-first-addend") {
    // ? + b = whole -> unknown is a
    const wrongOp = Math.min(20, whole + b);
    return {
      objectiveId: "unknown-number-equations",
      difficulty,
      promptKey: "challenge.unknownEquation.missingFirstAddend",
      operator: "unknown-equation",
      operands: [b, whole, 2],
      correctAnswer: a,
      choices: buildChoices(rng, a, {
        min: 0,
        max: 20,
        likelyErrors: [wrongOp, a - 1, a + 1, whole],
      }),
      meta: {
        itemFamily: "missing-first-addend",
        standardCode: "1.OA.D.8",
        targetBlueprint: `? + ${b} = ${whole}`,
        distractorErrors: {
          [wrongOp]: "added-instead-of-finding-missing-addend",
          [a - 1]: "off-by-one",
          [a + 1]: "off-by-one",
        },
      },
    };
  }

  if (structure === "missing-subtrahend") {
    // whole - ? = a -> unknown is b
    const wrongOp = Math.min(20, whole + a);
    return {
      objectiveId: "unknown-number-equations",
      difficulty,
      promptKey: "challenge.unknownEquation.missingSubtrahend",
      operator: "unknown-equation",
      operands: [whole, a, 3],
      correctAnswer: b,
      choices: buildChoices(rng, b, {
        min: 0,
        max: 20,
        likelyErrors: [b - 1, b + 1, a, wrongOp],
      }),
      meta: {
        itemFamily: "missing-subtrahend",
        standardCode: "1.OA.D.8",
        targetBlueprint: `${whole} - ? = ${a}`,
        distractorErrors: {
          [wrongOp]: "added-minuend-and-difference",
          [b - 1]: "off-by-one",
          [b + 1]: "off-by-one",
        },
      },
    };
  }

  // missing-minuend-reversed-equals: a = ? - b -> unknown is whole (a + b)
  const wrongSubtract = Math.max(0, a - b);
  return {
    objectiveId: "unknown-number-equations",
    difficulty,
    promptKey: "challenge.unknownEquation.reversedMissingMinuend",
    operator: "unknown-equation",
    operands: [a, b, 4],
    correctAnswer: whole,
    choices: buildChoices(rng, whole, {
      min: 0,
      max: 20,
      likelyErrors: [wrongSubtract, whole - 1, whole + 1],
    }),
    meta: {
      itemFamily: "missing-minuend-reversed-equals",
      standardCode: "1.OA.D.8",
      targetBlueprint: `${a} = ? - ${b}`,
      distractorErrors: {
        [wrongSubtract]: "subtracted-instead-of-reconstructing-whole",
        [whole - 1]: "off-by-one",
        [whole + 1]: "off-by-one",
      },
    },
  };
}
