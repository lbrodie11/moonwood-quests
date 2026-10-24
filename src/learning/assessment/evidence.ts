import { MIN_RETENTION_DELAY_HOURS } from "../adaptation/spacedReview";
import type { LearningStage, Representation } from "../challenge";
import type { Difficulty, ObjectiveId } from "../objectives";

export { MIN_RETENTION_DELAY_HOURS };

export type ResponseModality =
  | "visual-dom"
  | "canvas-manipulative"
  | "listening"
  | "independent-reading";

export type HintCategory = "rule-out" | "visual-demo" | "guided-solution";

export type AssessmentMode =
  | "standard"
  | "baseline"
  | "independent-check"
  | "mixed-review"
  | "delayed-retention"
  | "transfer-check";

export type MasteryClassification =
  | "not-started"
  | "introduced"
  | "practicing"
  | "needs-support"
  | "legacy-unverified"
  | "provisional-mastery"
  | "retained-mastery";

/**
 * Structured, local-only evidence record for a single challenge attempt or
 * intermediate incorrect submission (Phase 3.4).
 * Contains zero PII or device identifiers.
 */
export interface EvidenceRecord {
  attemptId: string;
  skillId: ObjectiveId;
  contentVersion: string;
  locale: "en-US" | "es-US";
  itemId: string;
  itemFamily: string;
  timestamp: string;
  difficulty: Difficulty;
  stage: LearningStage;
  representation: Representation;
  modality: ResponseModality;
  independent: boolean;
  incorrectSubmissions: number;
  hintsRequested: number;
  hintTypes: readonly HintCategory[];
  errorClassifications: readonly string[];
  unseenItem: boolean;
  isTransfer: boolean;
  isRetention: boolean;
  correct: boolean;
  completed: boolean;
  assessmentMode: AssessmentMode;
}

export interface MasteryEvaluationConfig {
  /**
   * Starting accuracy hypothesis for independent unseen attempts (default 0.85).
   * Documented as an engineering heuristic requiring empirical calibration,
   * NOT a universal psychometric constant.
   */
  provisionalAccuracyThreshold: number;
  minIndependentUnseenAttempts: number;
  minDistinctFamilies: number;
  minDistinctRepresentations: number;
  misconceptionAlertThreshold: number;
  /**
   * Minimum hours since the most recent prior independent success before a
   * review item counts as delayed retention evidence (default 20).
   */
  minRetentionDelayHours?: number | undefined;
}

export const DEFAULT_MASTERY_CONFIG: MasteryEvaluationConfig = {
  provisionalAccuracyThreshold: 0.85,
  minIndependentUnseenAttempts: 5,
  minDistinctFamilies: 3,
  minDistinctRepresentations: 2,
  misconceptionAlertThreshold: 2,
  minRetentionDelayHours: MIN_RETENTION_DELAY_HOURS,
};

export interface SkillEvidenceSummary {
  skillId: ObjectiveId;
  classification: MasteryClassification;
  currentStage: LearningStage;
  totalCompletedAttempts: number;
  independentUnseenAttempts: number;
  independentUnseenCorrect: number;
  independentAccuracy: number | null;
  assistedCompletions: number;
  distinctFamiliesPracticed: readonly string[];
  distinctRepresentationsPracticed: readonly Representation[];
  detectedMisconceptions: Readonly<Record<string, number>>;
  hasTransferEvidence: boolean;
  hasDelayedRetentionEvidence: boolean;
  listeningOnlyCount: number;
  independentReadingCount: number;
  sampleSizeWarning: string;
}

/**
 * Evaluates all recorded local evidence for a skill (filtered by language when
 * evaluating language-specific skills like `phonics-words`).
 */
export function evaluateSkillEvidence(
  skillId: ObjectiveId,
  records: readonly EvidenceRecord[],
  options: {
    locale?: "en-US" | "es-US" | undefined;
    legacyAttempts?: number | undefined;
    config?: MasteryEvaluationConfig | undefined;
  } = {},
): SkillEvidenceSummary {
  const config = options.config ?? DEFAULT_MASTERY_CONFIG;
  const relevant = records.filter((r) => {
    if (r.skillId !== skillId) return false;
    // Do not conflate English and Spanish phonics mastery (Phase 2.4)
    if (skillId === "phonics-words" && options.locale && r.locale !== options.locale) {
      return false;
    }
    return true;
  });

  const completed = relevant.filter((r) => r.completed);
  const families = new Set<string>();
  const representations = new Set<Representation>();
  const misconceptions: Record<string, number> = {};

  const minRetentionDelayMs =
    (config.minRetentionDelayHours ?? MIN_RETENTION_DELAY_HOURS) * 60 * 60 * 1000;

  let independentUnseenAttempts = 0;
  let independentUnseenCorrect = 0;
  let assistedCompletions = 0;
  let hasTransferEvidence = false;
  let hasDelayedRetentionEvidence = false;
  let listeningOnlyCount = 0;
  let independentReadingCount = 0;
  let lastIndependentSuccessMs: number | null = null;

  for (const r of relevant) {
    if (!r.correct) {
      for (const err of r.errorClassifications) {
        if (err === "general-calculation-or-decoding-error") continue;
        misconceptions[err] = (misconceptions[err] ?? 0) + 1;
      }
    }
  }

  for (const r of completed) {
    families.add(r.itemFamily);
    representations.add(r.representation);

    if (r.modality === "listening") {
      listeningOnlyCount += 1;
    } else if (r.modality === "independent-reading") {
      independentReadingCount += 1;
    }

    const revealedAnswer = r.hintTypes.includes("guided-solution");
    const trulyIndependent =
      r.independent &&
      !revealedAnswer &&
      r.incorrectSubmissions === 0 &&
      r.hintsRequested === 0 &&
      (skillId !== "reading-comprehension" || r.modality !== "listening");

    if (r.unseenItem) {
      if (trulyIndependent && r.correct) {
        independentUnseenAttempts += 1;
        independentUnseenCorrect += 1;
        if (r.isTransfer) hasTransferEvidence = true;
        const rMs = Date.parse(r.timestamp);
        if (
          r.isRetention &&
          lastIndependentSuccessMs !== null &&
          !Number.isNaN(rMs) &&
          rMs - lastIndependentSuccessMs >= minRetentionDelayMs
        ) {
          hasDelayedRetentionEvidence = true;
        }
        if (r.stage !== "modeling" && r.stage !== "guided" && !Number.isNaN(rMs)) {
          lastIndependentSuccessMs = rMs;
        }
      } else {
        independentUnseenAttempts += 1;
        if (r.correct) assistedCompletions += 1;
      }
    } else if (r.correct && !trulyIndependent) {
      assistedCompletions += 1;
    } else if (trulyIndependent && r.correct) {
      const rMs = Date.parse(r.timestamp);
      if (r.stage !== "modeling" && r.stage !== "guided" && !Number.isNaN(rMs)) {
        lastIndependentSuccessMs = rMs;
      }
    }
  }

  const independentAccuracy =
    independentUnseenAttempts > 0 ? independentUnseenCorrect / independentUnseenAttempts : null;

  const repeatedMisconception = Object.values(misconceptions).some(
    (count) => count >= config.misconceptionAlertThreshold,
  );

  let classification: MasteryClassification;
  if (completed.length === 0) {
    if ((options.legacyAttempts ?? 0) > 0) {
      classification = "legacy-unverified";
    } else {
      classification = "not-started";
    }
  } else if (repeatedMisconception && (independentAccuracy ?? 0) < config.provisionalAccuracyThreshold) {
    classification = "needs-support";
  } else if (completed.length < 3) {
    classification = "introduced";
  } else if (
    independentUnseenAttempts >= config.minIndependentUnseenAttempts &&
    (independentAccuracy ?? 0) >= config.provisionalAccuracyThreshold &&
    families.size >= config.minDistinctFamilies &&
    representations.size >= config.minDistinctRepresentations
  ) {
    if (hasDelayedRetentionEvidence && hasTransferEvidence) {
      classification = "retained-mastery";
    } else {
      classification = "provisional-mastery";
    }
  } else {
    classification = "practicing";
  }

  const currentStage: LearningStage =
    classification === "not-started" || classification === "introduced"
      ? "modeling"
      : classification === "needs-support"
        ? "guided"
        : classification === "practicing"
          ? "independent"
          : classification === "provisional-mastery" && !hasTransferEvidence
            ? "transfer"
            : "retention";

  const sampleSizeWarning =
    independentUnseenAttempts < config.minIndependentUnseenAttempts
      ? `Based on ${independentUnseenAttempts} independent unseen item(s) (minimum ${config.minIndependentUnseenAttempts} across ${config.minDistinctFamilies} task families needed before provisional mastery).`
      : `Based on ${independentUnseenAttempts} independent unseen items across ${families.size} task families.`;

  return {
    skillId,
    classification,
    currentStage,
    totalCompletedAttempts: completed.length,
    independentUnseenAttempts,
    independentUnseenCorrect,
    independentAccuracy,
    assistedCompletions,
    distinctFamiliesPracticed: [...families],
    distinctRepresentationsPracticed: [...representations],
    detectedMisconceptions: misconceptions,
    hasTransferEvidence,
    hasDelayedRetentionEvidence,
    listeningOnlyCount,
    independentReadingCount,
    sampleSizeWarning,
  };
}
