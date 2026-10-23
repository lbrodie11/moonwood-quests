import type { ChallengeSpec } from "../challenge";
import type { Difficulty } from "../objectives";
import { randomInt, type RandomSource } from "../random";
import { buildChoices } from "./choices";

/**
 * Ancient sigils (1.G.A.1 & 1.G.A.2):
 * Compose 2D geometric sigils from triangles (3 sides), squares/diamonds (4 sides),
 * and hexagons (6 triangles) and count total sigil shards or sides.
 */
export function createComposeShapes(rng: RandomSource, difficulty: Difficulty): ChallengeSpec {
  if (difficulty === 1) {
    const triangles = randomInt(rng, 1, 5);
    const diamonds = randomInt(rng, 1, 5);
    const answer = triangles + diamonds;
    return {
      objectiveId: "compose-shapes",
      difficulty,
      promptKey: "challenge.shapes.composeSigil",
      operator: "shapes",
      operands: [triangles, diamonds],
      correctAnswer: answer,
      choices: buildChoices(rng, answer, {
        min: 2,
        max: 14,
        likelyErrors: [answer - 1, answer + 1, Math.abs(triangles - diamonds)],
      }),
    };
  }

  if (difficulty === 2) {
    const triangles = randomInt(rng, 2, 7);
    const squares = randomInt(rng, 2, 7);
    const answer = triangles + squares;
    return {
      objectiveId: "compose-shapes",
      difficulty,
      promptKey: "challenge.shapes.composeSigil",
      operator: "shapes",
      operands: [triangles, squares],
      correctAnswer: answer,
      choices: buildChoices(rng, answer, {
        min: 2,
        max: 16,
        likelyErrors: [answer - 1, answer + 1, Math.abs(triangles - squares)],
      }),
    };
  }

  // Difficulty 3-4: Compose larger composite star sigils from triangle and diamond shards.
  const shardPool = difficulty === 3 ? [3, 4, 5, 6] : [4, 5, 6, 8];
  const a = shardPool[randomInt(rng, 0, shardPool.length - 1)] ?? 3;
  const b = shardPool[randomInt(rng, 0, shardPool.length - 1)] ?? 4;
  const answer = a + b;
  return {
    objectiveId: "compose-shapes",
    difficulty,
    promptKey: "challenge.shapes.countSides",
    operator: "shapes",
    operands: [a, b],
    correctAnswer: answer,
    choices: buildChoices(rng, answer, {
      min: 3,
      max: 20,
      likelyErrors: [answer - 1, answer + 1, answer - 2, Math.abs(a - b)],
    }),
  };
}
