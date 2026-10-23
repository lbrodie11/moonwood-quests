import type { ChallengeSpec } from "../challenge";
import type { Difficulty } from "../objectives";
import { randomInt, type RandomSource } from "../random";
import { buildChoices } from "./choices";

/**
 * Ancient sigils (1.G.A.2 partial — composite shape piece totals):
 * Composes composite sigils from smaller geometric pieces (triangles, rhombuses,
 * squares, and shards). Full interactive spatial rotation/drag-placement and
 * 1.G.A.3 circle/rectangle partitioning are tracked in Moonwood Builder's Workshop
 * (`creative-construction`) and marked partial in the standards registry.
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
      meta: {
        itemFamily: "compose-triangles-and-rhombuses",
        standardCode: "1.G.A.2",
        targetBlueprint: `composite-arch:${triangles}-triangles+${diamonds}-rhombuses`,
        distractorErrors: {
          [answer - 1]: "miscounted-shape-pieces",
          [answer + 1]: "miscounted-shape-pieces",
          [Math.abs(triangles - diamonds)]: "subtracted-shape-groups",
        },
      },
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
      meta: {
        itemFamily: "compose-triangles-and-squares",
        standardCode: "1.G.A.2",
        targetBlueprint: `compose-hexagon-and-tower:${triangles}-triangles+${squares}-squares`,
        distractorErrors: {
          [answer - 1]: "incomplete-composite-count",
          [answer + 1]: "extra-piece-count",
        },
      },
    };
  }

  const shardPool = difficulty === 3 ? [2, 4, 6] : [4, 5, 6, 8];
  const a = shardPool[randomInt(rng, 0, shardPool.length - 1)] ?? 4;
  const b = shardPool[randomInt(rng, 0, shardPool.length - 1)] ?? 4;
  const answer = a + b;
  const itemFamily =
    difficulty === 3 ? "compose-multi-piece-sigil" : "compose-symmetric-star-sigil";

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
    meta: {
      itemFamily,
      standardCode: "1.G.A.2",
      targetBlueprint: `star-sigil-blueprint:${a}+${b}`,
      distractorErrors: {
        [answer - 1]: "missing-shard-count",
        [answer + 1]: "extra-shard-count",
      },
    },
  };
}
