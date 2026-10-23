import type { Challenge, ChallengeSpec } from "./challenge";
import { generatorFor } from "./generators";
import { chooseRepresentation, initialMastery, recordAttempt, type LearningAttempt, type MasteryState } from "./mastery";
import { clampDifficulty, type Difficulty, type ObjectiveId } from "./objectives";
import type { RandomSource } from "./random";

export type HintLevel = 1 | 2 | 3;

/** The slice of a quest definition the learning engine needs. */
export interface QuestPlan {
  id: string;
  objectiveIds: readonly ObjectiveId[];
  phases: readonly QuestPhase[];
}

export interface QuestPhase {
  kind: "guided" | "independent" | "mini-boss";
  count: number;
  difficultyFloor?: number | undefined;
  difficultyCap?: number | undefined;
}

export type MasteryMap = Partial<Record<ObjectiveId, MasteryState>>;

export type SubmitResult =
  | { kind: "correct"; attempt: LearningAttempt; questComplete: boolean }
  | { kind: "incorrect"; hintLevel: HintLevel; ruledOut: number }
  | { kind: "ignored" };

/**
 * Runs one quest's sequence of challenges. Knows nothing about Phaser or the
 * DOM: a scene asks for `current`, renders it, and passes answers to `submit`.
 * Difficulty adapts between challenges using the mastery model.
 */
export class QuestRunner {
  private readonly steps: QuestPhase[];
  private readonly mastery: MasteryMap;
  private index = 0;
  private active: Challenge | null = null;
  private tries = 0;
  private hintsUsed = 0;
  private startedAt = 0;
  private lastSignature = "";

  constructor(
    private readonly plan: QuestPlan,
    mastery: MasteryMap,
    private readonly rng: RandomSource,
    private readonly now: () => number = () => Date.now(),
  ) {
    if (plan.objectiveIds.length === 0) throw new Error(`Quest "${plan.id}" has no objectives`);
    this.mastery = { ...mastery };
    this.steps = plan.phases.flatMap((phase) => Array.from({ length: phase.count }, () => phase));
    this.active = this.steps.length > 0 ? this.createChallenge() : null;
  }

  get total(): number {
    return this.steps.length;
  }

  /** Number of challenges solved so far. */
  get solved(): number {
    return this.index;
  }

  get current(): Challenge | null {
    return this.active;
  }

  get phase(): QuestPhase | null {
    return this.steps[this.index] ?? null;
  }

  masterySnapshot(): MasteryMap {
    return { ...this.mastery };
  }

  /**
   * Progressive 3-level hint request (1: gentle clue, 2: visual demonstration,
   * 3: guided solution) without requiring a wrong answer first.
   */
  requestHint(): HintLevel | null {
    if (!this.active) return null;
    this.hintsUsed += 1;
    return Math.min(3, this.hintsUsed) as HintLevel;
  }

  submit(value: number): SubmitResult {
    const challenge = this.active;
    if (!challenge) return { kind: "ignored" };

    this.tries += 1;

    if (value !== challenge.correctAnswer) {
      this.hintsUsed += 1;
      const hintLevel: HintLevel = this.tries >= 3 ? 3 : this.tries === 2 ? 2 : 1;
      return { kind: "incorrect", hintLevel, ruledOut: value };
    }

    const attempt: LearningAttempt = {
      objectiveId: challenge.objectiveId,
      itemId: challenge.id,
      difficulty: challenge.difficulty,
      tries: this.tries,
      hintsUsed: this.hintsUsed,
      responseMs: Math.max(0, this.now() - this.startedAt),
      representation: challenge.representation,
    };
    this.mastery[challenge.objectiveId] = recordAttempt(this.masteryFor(challenge.objectiveId), attempt);

    this.index += 1;
    const questComplete = this.index >= this.steps.length;
    this.active = questComplete ? null : this.createChallenge();
    return { kind: "correct", attempt, questComplete };
  }

  private masteryFor(objectiveId: ObjectiveId): MasteryState {
    return this.mastery[objectiveId] ?? initialMastery(objectiveId);
  }

  private createChallenge(): Challenge {
    const phase = this.steps[this.index];
    if (!phase) throw new Error("No phase for challenge index");

    const objectiveId = this.plan.objectiveIds[this.index % this.plan.objectiveIds.length] as ObjectiveId;
    const state = this.masteryFor(objectiveId);
    const difficulty = this.difficultyFor(phase, state.nextDifficulty);
    const generate = generatorFor(objectiveId);
    let spec = generate(this.rng, difficulty);
    for (let retry = 0; retry < 4 && this.lastSignature === this.signatureOf(spec); retry++) {
      spec = generate(this.rng, difficulty);
    }
    this.lastSignature = this.signatureOf(spec);

    this.tries = 0;
    this.hintsUsed = 0;
    this.startedAt = this.now();

    return {
      ...spec,
      id: `${this.plan.id}:${this.index}`,
      representation: phase.kind === "guided" ? "objects" : chooseRepresentation(state, difficulty),
    };
  }

  private signatureOf(spec: ChallengeSpec): string {
    return `${spec.objectiveId}:${spec.promptKey}:${spec.operands.join(",")}`;
  }

  private difficultyFor(phase: QuestPhase, preferred: Difficulty): Difficulty {
    const floor = phase.difficultyFloor ?? 1;
    const cap = phase.difficultyCap ?? 4;
    return clampDifficulty(Math.min(cap, Math.max(floor, preferred)));
  }
}
