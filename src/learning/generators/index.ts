import type { ChallengeSpec } from "../challenge";
import type { Difficulty, ObjectiveId } from "../objectives";
import type { RandomSource } from "../random";
import { createAddition, createSubtraction } from "./addition";
import { createReadingComprehension } from "./comprehension";
import { createComposeShapes } from "./geometry";
import { createCompareLengths } from "./measurement";
import { createStarPatterns } from "./patterns";
import { createPhonicsWords } from "./phonics";
import { createTensAndOnes } from "./placeValue";
import { createLogicalReasoning } from "./reasoning";
import { createScienceNature } from "./science";
import { createSpellingWriting } from "./spelling";
import { createUnknownNumberEquations } from "./unknownEquations";
import { createVocabularyOral } from "./vocabulary";
import { createCreativeConstruction } from "./workshop";

export type ChallengeGenerator = (rng: RandomSource, difficulty: Difficulty) => ChallengeSpec;

/**
 * Every curriculum objective across the four regions of Moonwood has a pure,
 * deterministic generator.
 */
export const GENERATORS: Readonly<Record<ObjectiveId, ChallengeGenerator>> = {
  "add-within-20": createAddition,
  "subtract-within-20": createSubtraction,
  "unknown-number-equations": createUnknownNumberEquations,
  "tens-and-ones": createTensAndOnes,
  "compare-lengths": createCompareLengths,
  "compose-shapes": createComposeShapes,
  "phonics-words": createPhonicsWords,
  "star-patterns": createStarPatterns,
  "reading-comprehension": createReadingComprehension,
  "vocabulary-oral": createVocabularyOral,
  "spelling-writing": createSpellingWriting,
  "logical-reasoning": createLogicalReasoning,
  "science-nature": createScienceNature,
  "creative-construction": createCreativeConstruction,
};

export function generatorFor(objectiveId: ObjectiveId): ChallengeGenerator {
  const generator = GENERATORS[objectiveId];
  if (!generator) {
    throw new Error(`No challenge generator for objective "${objectiveId}"`);
  }
  return generator;
}
