import type { QuestDefinition } from "../content/schemas";
import { advanceReviewSchedule, type ReviewScheduleEntry } from "../learning/adaptation/spacedReview";
import type { EvidenceRecord } from "../learning/assessment/evidence";
import type { ObjectiveId } from "../learning/objectives";
import type { MasteryMap } from "../learning/session";
import type { PlayerProgress } from "./ProgressRepository";

const union = (a: readonly string[], b: readonly string[]) => [...new Set([...a, ...b])];

const MAX_EVIDENCE_RECORDS = 250;
const MAX_SEEN_SIGNATURES = 500;

function mergeEvidenceAndSchedule(
  progress: PlayerProgress,
  newEvidence: readonly EvidenceRecord[] | undefined,
  newSignatures: readonly string[] | undefined,
  now: Date,
): Pick<PlayerProgress, "evidenceLog" | "reviewSchedule" | "seenItemSignatures"> {
  const existingLog = progress.evidenceLog ?? [];
  const existingSchedules = { ...(progress.reviewSchedule ?? {}) } as Partial<
    Record<ObjectiveId, ReviewScheduleEntry>
  >;
  const existingSigs = progress.seenItemSignatures ?? [];

  if ((!newEvidence || newEvidence.length === 0) && (!newSignatures || newSignatures.length === 0)) {
    return {
      ...(progress.evidenceLog ? { evidenceLog: progress.evidenceLog } : {}),
      ...(progress.reviewSchedule ? { reviewSchedule: progress.reviewSchedule } : {}),
      ...(progress.seenItemSignatures ? { seenItemSignatures: progress.seenItemSignatures } : {}),
    };
  }

  const seenAttemptIds = new Set(existingLog.map((e) => e.attemptId));
  const mergedLog = [...existingLog];

  for (const record of newEvidence ?? []) {
    if (!seenAttemptIds.has(record.attemptId)) {
      seenAttemptIds.add(record.attemptId);
      mergedLog.push({
        ...record,
        hintTypes: [...record.hintTypes],
        errorClassifications: [...record.errorClassifications],
      });
      if (record.completed) {
        existingSchedules[record.skillId] = advanceReviewSchedule(
          existingSchedules[record.skillId],
          record.skillId,
          record.independent && record.correct,
          now,
        );
      }
    }
  }

  const mergedSigs = union(existingSigs, newSignatures ?? []).slice(-MAX_SEEN_SIGNATURES);

  return {
    evidenceLog: mergedLog.slice(-MAX_EVIDENCE_RECORDS),
    reviewSchedule: existingSchedules,
    seenItemSignatures: mergedSigs,
  };
}

/** Pure update applied when a quest is completed. */
export function completeQuest(
  progress: PlayerProgress,
  quest: QuestDefinition,
  mastery: MasteryMap,
  now: Date = new Date(),
  newEvidence?: readonly EvidenceRecord[],
  newSignatures?: readonly string[],
): PlayerProgress {
  return {
    ...progress,
    lastUpdated: now.toISOString(),
    completedQuestIds: union(progress.completedQuestIds, [quest.id]),
    unlockedQuestIds: union(progress.unlockedQuestIds, quest.unlocks),
    rewardIds: union(progress.rewardIds, quest.rewards.map((r) => r.id)),
    objectives: { ...progress.objectives, ...mastery },
    ...mergeEvidenceAndSchedule(progress, newEvidence, newSignatures, now),
  };
}

/** Saves mastery and learning evidence mid-quest so a closed tab doesn't lose learning evidence. */
export function updateMastery(
  progress: PlayerProgress,
  mastery: MasteryMap,
  now: Date = new Date(),
  newEvidence?: readonly EvidenceRecord[],
  newSignatures?: readonly string[],
): PlayerProgress {
  return {
    ...progress,
    lastUpdated: now.toISOString(),
    objectives: { ...progress.objectives, ...mastery },
    ...mergeEvidenceAndSchedule(progress, newEvidence, newSignatures, now),
  };
}

/** Records a discovered optional Star-Treasure collectible on the world map. */
export function discoverTreasure(
  progress: PlayerProgress,
  treasureId: string,
  now: Date = new Date(),
): PlayerProgress {
  return {
    ...progress,
    lastUpdated: now.toISOString(),
    rewardIds: union(progress.rewardIds, [treasureId]),
  };
}
