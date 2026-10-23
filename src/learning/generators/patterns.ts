import type { ChallengeSpec } from "../challenge";
import type { Difficulty } from "../objectives";
import { randomInt, type RandomSource } from "../random";
import { buildChoices } from "./choices";

const STEPS_BY_DIFFICULTY: Readonly<Record<Difficulty, readonly number[]>> = {
  1: [1, 2],
  2: [1, 2, 5],
  3: [2, 5, 10],
  4: [2, 5, 10],
};

/**
 * Starfall Tower (1.NBT.A.1):
 * Identify the skip-counting pattern rule in a glowing constellation sequence
 * (`s1 → s2 → s3 → ?`) by 1s, 2s, 5s, or 10s and find the next star number.
 */
export function createStarPatterns(rng: RandomSource, difficulty: Difficulty): ChallengeSpec {
  const steps = STEPS_BY_DIFFICULTY[difficulty];
  const step = steps[randomInt(rng, 0, steps.length - 1)] ?? 2;
  const maxStart = difficulty === 1 ? 6 : difficulty === 2 ? 12 : 20;
  const first = randomInt(rng, 1, maxStart);
  const second = first + step;
  const third = first + step * 2;
  const answer = first + step * 3;

  return {
    objectiveId: "star-patterns",
    difficulty,
    promptKey: "challenge.pattern.nextStar",
    operator: "pattern",
    operands: [first, second, third, step],
    correctAnswer: answer,
    choices: buildChoices(rng, answer, {
      min: 1,
      max: 60,
      likelyErrors: [
        third + 1,
        answer + step,
        Math.max(1, answer - 1),
        Math.max(1, third + (step - 1)),
      ],
    }),
  };
}
