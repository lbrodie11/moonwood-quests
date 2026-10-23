import type { Difficulty, ObjectiveId } from "./objectives";

/**
 * How a challenge is represented to the child (Concrete -> Representational -> Abstract).
 * - "objects": concrete manipulatives (crystals, bundles of 10, interactive tiles/shapes)
 * - "number-line": structured linear/sequence or ten-frame/part-whole diagram representation
 * - "symbols": abstract numeral equations and written words
 */
export type Representation = "objects" | "symbols" | "number-line";

export type Operator =
  | "+"
  | "-"
  | "unknown-equation"
  | "tens-ones"
  | "length"
  | "shapes"
  | "phonics"
  | "pattern"
  | "comprehension"
  | "vocabulary"
  | "spelling"
  | "reasoning"
  | "science"
  | "workshop";

export type LearningStage =
  | "modeling"
  | "guided"
  | "independent"
  | "transfer"
  | "retention";

/**
 * Interactive task metadata that lets the Phaser canvas and AccessibleChallengeUI
 * present authentic manipulations (shape placement/rotation, bridge plank measurement,
 * letter-tile word building, story passages, strategy reflection cards, etc.).
 */
export interface InteractiveTaskMeta {
  /** Sub-skill or task family identifier used for evidence and misconception tracking. */
  itemFamily?: string | undefined;
  /** Standard code specifically assessed by this item (e.g. "1.MD.A.1" vs "1.MD.A.2"). */
  standardCode?: string | undefined;
  /** Whether this item is an extension beyond standard Grade 1 range (e.g. >99 place value). */
  isExtension?: boolean | undefined;
  /** Phonics mechanic kind when `objectiveId === "phonics-words"`. */
  phonicsMechanic?:
    | "sound-recognition"
    | "sound-blending"
    | "phoneme-segmentation"
    | "word-building"
    | "decoding"
    | "connected-reading"
    | undefined;
  /** Language scope when phonics/literacy items are generated ("en" | "es"). */
  languageScope?: "en" | "es" | undefined;
  /** Interactive letter tiles or shape pieces for manipulation/encoding tasks. */
  interactiveTiles?: readonly string[] | undefined;
  /** Target slots or composite blueprint description for construction/encoding tasks. */
  targetBlueprint?: string | undefined;
  /** Optional story passage i18n key for reading comprehension or connected reading. */
  passageKey?: string | undefined;
  /** Optional metacognitive reflection prompt key (non-graded). */
  reflectionPromptKey?: string | undefined;
  /** Optional parent-assisted note key (e.g. phoneme pronunciation guide or expressive prompt). */
  parentGuideKey?: string | undefined;
  /** Error classification map from distractor value to misconception tag. */
  distractorErrors?: Readonly<Record<number, string>> | undefined;
}

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
   * vocabulary words, named shapes, story answers, or concepts.
   */
  choiceKeyPrefix?: string | undefined;
  /** Optional rich instructional metadata for authentic interactions and evidence tracking. */
  meta?: InteractiveTaskMeta | undefined;
}

export interface Challenge extends ChallengeSpec {
  id: string;
  representation: Representation;
  stage?: LearningStage | undefined;
  isAssessment?: boolean | undefined;
}
