import type { ChallengeSpec } from "../challenge";
import type { Difficulty } from "../objectives";
import { randomInt, type RandomSource } from "../random";
import { buildChoices } from "./choices";

/**
 * Ancient sigils (1.G.A.1, 1.G.A.2 & 1.G.A.3):
 * - Difficulty 1 (`1.G.A.1`, `identify-defining-vs-nondefining-attributes`):
 *   Distinguish defining attributes (closed, 3 straight sides for triangles, 4 equal sides for rhombuses/squares)
 *   from non-defining attributes (color, rotation, size) while placing sigil tiles.
 * - Difficulty 2 (`1.G.A.2`, `compose-2d-composite-shape`):
 *   Compose 2D composite sigils (hexagon from triangles/trapezoids, larger square from triangles/squares).
 * - Difficulty 3 (`1.G.A.3`, `partition-halves-and-fourths`):
 *   Partition circular and rectangular sun-stones into equal halves (2 equal shares) and fourths/quarters (4 equal shares).
 * - Difficulty 4 (`1.G.A.2`, `interactive-sigil-tile-placement`):
 *   Multi-step composite sigil construction with click-to-select, rotate, and place tiles.
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
        itemFamily: "identify-defining-vs-nondefining-attributes",
        standardCode: "1.G.A.1",
        interactiveTiles: ["triangle-3-sides", "rhombus-4-sides", "rotated-triangle-3-sides"],
        targetBlueprint: `composite-arch:${triangles}-triangles+${diamonds}-rhombuses`,
        distractorErrors: {
          [answer - 1]: "missed-rotated-shape-nondefining-attribute",
          [answer + 1]: "counted-open-non-shape",
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
        itemFamily: "compose-2d-composite-shape",
        standardCode: "1.G.A.2",
        interactiveTiles: ["triangle", "square", "trapezoid", "hexagon-frame"],
        targetBlueprint: `compose-hexagon-and-tower:${triangles}-triangles+${squares}-squares`,
        distractorErrors: {
          [answer - 1]: "incomplete-composite-fill",
          [answer + 1]: "overlapping-shape-piece",
        },
      },
    };
  }

  // Difficulty 3-4: Equal-shares partitioning (1.G.A.3) and multi-piece composite sigil construction (1.G.A.2)
  const shardPool = difficulty === 3 ? [2, 4, 6] : [4, 5, 6, 8];
  const a = shardPool[randomInt(rng, 0, shardPool.length - 1)] ?? 4;
  const b = shardPool[randomInt(rng, 0, shardPool.length - 1)] ?? 4;
  const answer = a + b;
  const itemFamily =
    difficulty === 3 ? "partition-halves-and-fourths" : "interactive-sigil-tile-placement";
  const standardCode = difficulty === 3 ? "1.G.A.3" : "1.G.A.2";

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
      standardCode,
      interactiveTiles:
        difficulty === 3
          ? ["circle-halves-2", "rectangle-fourths-4", "equal-quarters-4"]
          : ["triangle-rot0", "triangle-rot60", "rhombus-rot30", "trapezoid-top"],
      targetBlueprint:
        difficulty === 3
          ? `equal-shares:${a}-halves-or-fourths+${b}-equal-parts`
          : `star-sigil-blueprint:${a}+${b}`,
      distractorErrors: {
        [answer - 1]: "unequal-share-or-missing-shard",
        [answer + 1]: "extra-unequal-partition",
      },
    },
  };
}
