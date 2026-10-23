import type { Representation } from "./challenge";
import { clampDifficulty, type Difficulty, type ObjectiveId } from "./objectives";

/** Learning evidence for one challenge. Kept separate from any game score. */
export interface LearningAttempt {
  objectiveId: ObjectiveId;
  itemId: string;
  difficulty: Difficulty;
  /** Answers submitted before the correct one, plus one. 1 = first try. */
  tries: number;
  hintsUsed: number;
  responseMs: number;
  representation: Representation;
}

export interface MasteryState {
  objectiveId: ObjectiveId;
  attempts: number;
  independentSuccesses: number;
  supportedSuccesses: number;
  /** Decays on independent successes; drives demotion and extra support. */
  recentErrors: number;
  /** Consecutive independent successes at the current difficulty. */
  streak: number;
  nextDifficulty: Difficulty;
}

/**
 * Design parameters, deliberately simple. Do not present these as calibrated
 * mastery scores; tune them with an elementary educator and playtest data.
 */
export const MASTERY_RULES = {
  promoteAfterStreak: 3,
  demoteAfterErrors: 3,
  maxRecentErrors: 5,
  objectsSupportAtErrors: 2,
} as const;

export function initialMastery(objectiveId: ObjectiveId): MasteryState {
  return {
    objectiveId,
    attempts: 0,
    independentSuccesses: 0,
    supportedSuccesses: 0,
    recentErrors: 0,
    streak: 0,
    nextDifficulty: 1,
  };
}

/** Pure reducer: returns a new state. */
export function recordAttempt(state: MasteryState, attempt: LearningAttempt): MasteryState {
  const independent = attempt.tries === 1 && attempt.hintsUsed === 0;
  const errors = attempt.tries - 1;

  let next: MasteryState = {
    ...state,
    attempts: state.attempts + 1,
    independentSuccesses: state.independentSuccesses + (independent ? 1 : 0),
    supportedSuccesses: state.supportedSuccesses + (independent ? 0 : 1),
    recentErrors: independent
      ? Math.max(0, state.recentErrors - 1)
      : Math.min(MASTERY_RULES.maxRecentErrors, state.recentErrors + Math.max(1, errors)),
    streak: independent ? state.streak + 1 : 0,
  };

  if (next.streak >= MASTERY_RULES.promoteAfterStreak && next.nextDifficulty < 4) {
    next = { ...next, nextDifficulty: clampDifficulty(next.nextDifficulty + 1), streak: 0 };
  } else if (next.recentErrors >= MASTERY_RULES.demoteAfterErrors && next.nextDifficulty > 1) {
    next = { ...next, nextDifficulty: clampDifficulty(next.nextDifficulty - 1), recentErrors: 0 };
  }

  return next;
}

/** Should the next problem lean on manipulatives with counting support? */
export function chooseRepresentation(state: MasteryState, difficulty: Difficulty): Representation {
  if (difficulty === 1 || state.recentErrors >= MASTERY_RULES.objectsSupportAtErrors) {
    return "objects";
  }
  return "symbols";
}
