import type {
  AssessmentMode,
  EvidenceRecord,
  HintCategory,
  ResponseModality,
} from "./assessment/evidence";
import type { Challenge, ChallengeSpec, LearningStage } from "./challenge";
import { firstUnmetPrerequisite } from "./curriculum/skills";
import { generatorFor } from "./generators";
import { createPhonicsWords } from "./generators/phonics";
import {
  chooseRepresentation,
  initialMastery,
  recordAttempt,
  type LearningAttempt,
  type MasteryState,
} from "./mastery";
import { clampDifficulty, type Difficulty, type ObjectiveId } from "./objectives";
import type { RandomSource } from "./random";

export type HintLevel = 1 | 2 | 3;

/** The slice of a quest definition the learning engine needs. */
export interface QuestPlan {
  id: string;
  objectiveIds: readonly ObjectiveId[];
  phases: readonly QuestPhase[];
  assessmentMode?: AssessmentMode | undefined;
  locale?: "en-US" | "es-US" | undefined;
  seenItemSignatures?: readonly string[] | undefined;
  placedSkills?: readonly ObjectiveId[] | undefined;
  dueReviewSkills?: readonly ObjectiveId[] | undefined;
}

export interface QuestPhase {
  kind: "guided" | "independent" | "mini-boss";
  count: number;
  difficultyFloor?: number | undefined;
  difficultyCap?: number | undefined;
  stage?: LearningStage | undefined;
}

export type MasteryMap = Partial<Record<ObjectiveId, MasteryState>>;

export type SubmitResult =
  | {
      kind: "correct";
      attempt: LearningAttempt;
      questComplete: boolean;
    }
  | {
      kind: "incorrect";
      hintLevel: HintLevel;
      ruledOut: number;
      /** True when an independent assessment gently transitions after an error without revealing the answer. */
      assessmentTransitioned?: boolean | undefined;
      questComplete?: boolean | undefined;
    }
  | { kind: "ignored" };

const HINT_CATEGORY_BY_LEVEL: Readonly<Record<HintLevel, HintCategory>> = {
  1: "rule-out",
  2: "visual-demo",
  3: "guided-solution",
};

/**
 * Runs one quest's sequence of challenges. Knows nothing about Phaser or the
 * DOM: a scene asks for `current`, renders it, and passes answers to `submit`.
 *
 * Records structured `EvidenceRecord` entries for both incorrect submissions
 * (when they happen) and completed challenges, enforces prerequisite scaffolding,
 * and supports hint-free independent/delayed assessments.
 */
export class QuestRunner {
  private readonly steps: QuestPhase[];
  private readonly mastery: MasteryMap;
  private readonly evidenceLog: EvidenceRecord[] = [];
  private readonly seenSignatures: Set<string>;
  private readonly servedReviewSkills = new Set<ObjectiveId>();
  private readonly assessmentMode: AssessmentMode;
  private readonly locale: "en-US" | "es-US";

  private index = 0;
  private active: Challenge | null = null;
  private tries = 0;
  private hintsUsed = 0;
  private hintCategories: HintCategory[] = [];
  private currentErrorTags: string[] = [];
  private currentUnseen = true;
  private currentIsReviewSlot = false;
  private currentModality: ResponseModality = "visual-dom";
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
    this.assessmentMode = plan.assessmentMode ?? "standard";
    this.locale = plan.locale ?? "en-US";
    this.seenSignatures = new Set(plan.seenItemSignatures ?? []);
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

  get recordedEvidence(): readonly EvidenceRecord[] {
    return this.evidenceLog;
  }

  get knownItemSignatures(): readonly string[] {
    return [...this.seenSignatures];
  }

  masterySnapshot(): MasteryMap {
    return { ...this.mastery };
  }

  /**
   * Allows the UI to record whether the child listened to full story narration
   * (`"listening"`) vs. read independently (`"independent-reading"`).
   */
  setResponseModality(modality: ResponseModality): void {
    this.currentModality = modality;
  }

  /**
   * Progressive 3-level hint request (1: gentle clue, 2: visual demonstration,
   * 3: guided solution) without requiring a wrong answer first.
   * Disabled (`returns null`) during independent assessments (Phase 3.7).
   */
  requestHint(): HintLevel | null {
    if (!this.active) return null;
    if (this.isIndependentAssessment()) return null;
    this.hintsUsed += 1;
    const level = Math.min(3, this.hintsUsed) as HintLevel;
    const category = HINT_CATEGORY_BY_LEVEL[level];
    if (!this.hintCategories.includes(category)) {
      this.hintCategories.push(category);
    }
    return level;
  }

  submit(value: number): SubmitResult {
    const challenge = this.active;
    if (!challenge) return { kind: "ignored" };

    this.tries += 1;

    if (value !== challenge.correctAnswer) {
      const errorTag =
        challenge.meta?.distractorErrors?.[value] ?? "general-calculation-or-decoding-error";
      this.currentErrorTags.push(errorTag);

      // During an independent check, do not reveal answers or hints; record the
      // attempt as an unsuccessful independent check item and advance gently.
      if (this.isIndependentAssessment()) {
        const evidence = this.buildEvidenceRecord(challenge, false, true, [errorTag]);
        this.evidenceLog.push(evidence);
        this.index += 1;
        const questComplete = this.index >= this.steps.length;
        this.active = questComplete ? null : this.createChallenge();
        return {
          kind: "incorrect",
          hintLevel: 1,
          ruledOut: value,
          assessmentTransitioned: true,
          questComplete,
        };
      }

      this.hintsUsed += 1;
      const hintLevel: HintLevel = Math.min(3, this.hintsUsed) as HintLevel;
      const category = HINT_CATEGORY_BY_LEVEL[hintLevel];
      if (!this.hintCategories.includes(category)) {
        this.hintCategories.push(category);
      }

      // Record the intermediate incorrect submission immediately (Phase 3.4)
      // with ONLY the single errorTag for this specific wrong submission so errors are never double-counted.
      const incorrectEvidence = this.buildEvidenceRecord(challenge, false, false, [errorTag]);
      this.evidenceLog.push(incorrectEvidence);

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
      itemFamily: challenge.meta?.itemFamily,
      stage: challenge.stage,
      errorClassifications: [...this.currentErrorTags],
      locale: this.locale,
      modality: this.currentModality,
    };

    // Never infer independent mastery if Hint 3 (answer revelation) was used
    this.mastery[challenge.objectiveId] = recordAttempt(
      this.masteryFor(challenge.objectiveId),
      attempt,
    );

    const completedEvidence = this.buildEvidenceRecord(challenge, true, true, []);
    this.evidenceLog.push(completedEvidence);

    this.index += 1;
    const questComplete = this.index >= this.steps.length;
    this.active = questComplete ? null : this.createChallenge();
    return { kind: "correct", attempt, questComplete };
  }

  private isIndependentAssessment(): boolean {
    return (
      this.assessmentMode === "baseline" ||
      this.assessmentMode === "independent-check" ||
      this.assessmentMode === "delayed-retention" ||
      this.assessmentMode === "transfer-check"
    );
  }

  private buildEvidenceRecord(
    challenge: Challenge,
    correct: boolean,
    completed: boolean,
    stepErrorTags: readonly string[] = [],
  ): EvidenceRecord {
    const nowMs = this.now();
    const revealedAnswer = this.hintCategories.includes("guided-solution");
    const listeningOnly =
      challenge.objectiveId === "reading-comprehension" && this.currentModality === "listening";
    const independent =
      correct &&
      this.tries === 1 &&
      this.hintsUsed === 0 &&
      !revealedAnswer &&
      !listeningOnly;

    return {
      attemptId: `${challenge.id}:${challenge.operands.join("-")}:try${this.tries}:${nowMs}`,
      skillId: challenge.objectiveId,
      contentVersion: "2.0.0",
      locale: this.locale,
      itemId: challenge.id,
      itemFamily: challenge.meta?.itemFamily ?? `${challenge.objectiveId}-default`,
      timestamp: new Date(nowMs).toISOString(),
      difficulty: challenge.difficulty,
      stage: challenge.stage ?? "independent",
      representation: challenge.representation,
      modality: this.currentModality,
      independent,
      incorrectSubmissions: correct ? this.tries - 1 : this.tries,
      hintsRequested: this.hintsUsed,
      hintTypes: [...this.hintCategories],
      errorClassifications: [...stepErrorTags],
      unseenItem: this.currentUnseen,
      isTransfer:
        challenge.stage === "transfer" || this.assessmentMode === "transfer-check",
      isRetention:
        challenge.stage === "retention" ||
        this.currentIsReviewSlot ||
        (this.assessmentMode === "delayed-retention" &&
          challenge.stage !== "modeling" &&
          challenge.stage !== "guided"),
      correct,
      completed,
      assessmentMode: this.assessmentMode,
    };
  }

  private masteryFor(objectiveId: ObjectiveId): MasteryState {
    return this.mastery[objectiveId] ?? initialMastery(objectiveId);
  }

  private createChallenge(): Challenge {
    const phase = this.steps[this.index];
    if (!phase) throw new Error("No phase for challenge index");

    const unservedDueInQuest = (this.plan.dueReviewSkills ?? []).filter(
      (id) => this.plan.objectiveIds.includes(id) && !this.servedReviewSkills.has(id),
    );
    const isDedicatedReviewSlot =
      phase.stage === "retention" ||
      (phase.kind === "independent" &&
        (unservedDueInQuest.length > 0 || this.assessmentMode === "delayed-retention"));

    const requestedObjective = (
      isDedicatedReviewSlot && unservedDueInQuest.length > 0
        ? unservedDueInQuest[0]
        : this.plan.objectiveIds[this.index % this.plan.objectiveIds.length]
    ) as ObjectiveId;

    if (isDedicatedReviewSlot && unservedDueInQuest.includes(requestedObjective)) {
      this.servedReviewSkills.add(requestedObjective);
    }
    this.currentIsReviewSlot = isDedicatedReviewSlot;

    // Prerequisite scaffolding: if a child enters a quest whose target skill has
    // an unmet prerequisite during the guided phase:
    // - If the prerequisite is part of this quest's objectiveIds, practice it first;
    // - Otherwise, scaffold the target skill at Difficulty 1 with concrete representations
    //   so the child always experiences the sanctuary/quest's authentic mechanic.
    const unmetPrereq =
      phase.kind === "guided"
        ? firstUnmetPrerequisite(requestedObjective, this.mastery, this.plan.placedSkills ?? [])
        : null;
    const objectiveId =
      unmetPrereq && this.plan.objectiveIds.includes(unmetPrereq)
        ? unmetPrereq
        : requestedObjective;

    const state = this.masteryFor(objectiveId);
    const difficulty: Difficulty = unmetPrereq
      ? 1
      : this.difficultyFor(phase, state.nextDifficulty);
    const langScope = this.locale === "es-US" ? "es" : "en";

    const generate =
      objectiveId === "phonics-words"
        ? (rng: RandomSource, d: Difficulty) => createPhonicsWords(rng, d, langScope)
        : generatorFor(objectiveId);

    let spec = generate(this.rng, difficulty);
    for (let retry = 0; retry < 4 && this.lastSignature === this.signatureOf(spec); retry++) {
      spec = generate(this.rng, difficulty);
    }
    const sig = this.signatureOf(spec);
    this.lastSignature = sig;
    this.currentUnseen = !this.seenSignatures.has(sig);
    this.seenSignatures.add(sig);

    this.tries = 0;
    this.hintsUsed = 0;
    this.hintCategories = [];
    this.currentErrorTags = [];
    this.currentModality =
      objectiveId === "reading-comprehension" ? "independent-reading" : "visual-dom";
    this.startedAt = this.now();

    const stage: LearningStage =
      phase.stage ??
      (phase.kind === "guided"
        ? this.index === 0
          ? "modeling"
          : "guided"
        : phase.kind === "mini-boss"
          ? "transfer"
          : isDedicatedReviewSlot
            ? "retention"
            : "independent");

    return {
      ...spec,
      id: `${this.plan.id}:${this.index}`,
      representation:
        phase.kind === "guided"
          ? "objects"
          : chooseRepresentation(state, difficulty, objectiveId),
      stage,
      isAssessment: this.isIndependentAssessment(),
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
