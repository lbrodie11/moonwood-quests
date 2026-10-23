import type { QuestDefinition } from "../content/schemas";
import { advanceReviewSchedule, type ReviewScheduleEntry } from "../learning/adaptation/spacedReview";
import type { EvidenceRecord } from "../learning/assessment/evidence";
import type { ObjectiveId } from "../learning/objectives";
import type { MasteryMap } from "../learning/session";
import type { PlayerProgress } from "./ProgressRepository";

const union = (a: readonly string[], b: readonly string[]) => [...new Set([...a, ...b])];

const MAX_EVIDENCE_PER_SKILL = 40;
const MAX_SEEN_SIGNATURES = 500;

/**
 * Retains up to `MAX_EVIDENCE_PER_SKILL` records per skill so practicing one
 * skill never evicts another skill's mastery, transfer, or retention evidence.
 */
export function pruneEvidenceLogBySkill<
  T extends {
    attemptId: string;
    skillId: ObjectiveId;
    isTransfer: boolean;
    isRetention: boolean;
  },
>(records: readonly T[], maxPerSkill: number = MAX_EVIDENCE_PER_SKILL): T[] {
  const bySkill = new Map<ObjectiveId, T[]>();
  for (const r of records) {
    const list = bySkill.get(r.skillId) ?? [];
    list.push(r);
    bySkill.set(r.skillId, list);
  }

  const keptIds = new Set<string>();
  for (const list of bySkill.values()) {
    if (list.length <= maxPerSkill) {
      for (const r of list) keptIds.add(r.attemptId);
      continue;
    }
    // Always preserve transfer & retention evidence records for this skill
    const milestoneRecords = list.filter((r) => r.isTransfer || r.isRetention);
    for (const r of milestoneRecords.slice(-10)) {
      keptIds.add(r.attemptId);
    }
    const tail = list.slice(-maxPerSkill);
    for (const r of tail) {
      keptIds.add(r.attemptId);
    }
  }

  return records.filter((r) => keptIds.has(r.attemptId));
}

function mergeEvidenceAndSchedule(
  progress: PlayerProgress,
  newEvidence: readonly EvidenceRecord[] | undefined,
  newSignatures: readonly string[] | undefined,
  now: Date,
  advanceSchedule: boolean,
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
  const skillOutcomesInQuest = new Map<ObjectiveId, boolean>();

  for (const record of newEvidence ?? []) {
    if (record.completed) {
      const prevOutcome = skillOutcomesInQuest.get(record.skillId) ?? true;
      skillOutcomesInQuest.set(
        record.skillId,
        prevOutcome && record.independent && record.correct,
      );
    }
    if (seenAttemptIds.has(record.attemptId)) continue;
    seenAttemptIds.add(record.attemptId);
    mergedLog.push({
      ...record,
      hintTypes: [...record.hintTypes],
      errorClassifications: [...record.errorClassifications],
    });
  }

  // Advance spaced review schedule once per skill when the quest session completes
  if (advanceSchedule) {
    for (const [skillId, allIndependent] of skillOutcomesInQuest.entries()) {
      existingSchedules[skillId] = advanceReviewSchedule(
        existingSchedules[skillId],
        skillId,
        allIndependent,
        now,
      );
    }
  }

  const mergedSigs = union(existingSigs, newSignatures ?? []).slice(-MAX_SEEN_SIGNATURES);

  return {
    evidenceLog: pruneEvidenceLogBySkill(mergedLog),
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
    ...mergeEvidenceAndSchedule(progress, newEvidence, newSignatures, now, true),
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
    ...mergeEvidenceAndSchedule(progress, newEvidence, newSignatures, now, false),
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
