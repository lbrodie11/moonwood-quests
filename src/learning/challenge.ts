import type { Difficulty, ObjectiveId } from "./objectives";

/**
 * How a challenge is represented to the child.
 * - "objects": manipulatives with visible counting support
 * - "symbols": manipulatives without counting labels; the numeral sentence carries more weight
 * - "number-line": structured linear/sequence track
 */
export type Representation = "objects" | "symbols" | "number-line";

export type Operator = "+" | "-" | "tens-ones" | "length" | "shapes" | "phonics" | "pattern";

/** What a generator produces: pure data, no ids, no presentation. */
export interface ChallengeSpec {
  objectiveId: ObjectiveId;
  difficulty: Difficulty;
  /** i18n key for the spoken/written prompt. */
  promptKey: string;
  operator: Operator;
  operands: readonly number[];
  choices: readonly number[];
  correctAnswer: number;
  /**
   * Optional i18n key prefix for choice labels when choices represent
   * vocabulary words or named concepts (e.g. "challenge.phonics.word").
   */
  choiceKeyPrefix?: string | undefined;
}

export interface Challenge extends ChallengeSpec {
  id: string;
  representation: Representation;
}
