import type { SkillEvidenceSummary } from "../assessment/evidence";
import { SKILLS_GRAPH } from "../curriculum/skills";
import { OBJECTIVE_IDS, type ObjectiveId } from "../objectives";

/**
 * Spaced review interval heuristics in days (Phase 3.6):
 * - Stage 0: next relevant session (`0` days, after `MIN_SESSION_GAP_HOURS`)
 * - Stage 1: ~1 day later
 * - Stage 2: ~3 days later
 * - Stage 3: ~7 days later
 * - Stage 4: ~14 days later
 *
 * These are engineering scheduling heuristics, not fixed cognitive laws.
 */
export const REVIEW_INTERVAL_DAYS = [0, 1, 3, 7, 14] as const;

/** Minimum hours between sessions before a stage-0 ("next session") review item is due. */
export const MIN_SESSION_GAP_HOURS = 4;

/** Minimum hours since the skill's most recent prior independent success for a review item to count as delayed retention. */
export const MIN_RETENTION_DELAY_HOURS = 20;

const HOUR_MS = 60 * 60 * 1000;
const DAY_MS = 24 * HOUR_MS;

export interface ReviewScheduleEntry {
  skillId: ObjectiveId;
  stageIndex: 0 | 1 | 2 | 3 | 4;
  lastPracticedIso: string;
  nextReviewIso: string;
}

/**
 * Updates a skill's spaced-review schedule after an attempt.
 * Handles local clock drift (if `now` is earlier than `lastPracticedIso`),
 * enforces a minimum session gap (`MIN_SESSION_GAP_HOURS`) for stage-0 reviews,
 * and handles long absences (> 30 days) gently without punishment.
 */
export function advanceReviewSchedule(
  previous: ReviewScheduleEntry | undefined,
  skillId: ObjectiveId,
  independentSuccess: boolean,
  now: Date = new Date(),
  options: { sessionGapHours?: number | undefined } = {},
): ReviewScheduleEntry {
  const sessionGapHours = options.sessionGapHours ?? MIN_SESSION_GAP_HOURS;
  const sessionGapMs = sessionGapHours * HOUR_MS;
  const nowMs = now.getTime();
  const nowIso = new Date(nowMs).toISOString();
  const prevMs = previous ? Date.parse(previous.lastPracticedIso) : nowMs;
  const rawDeltaMs = Number.isFinite(prevMs) ? nowMs - prevMs : 0;
  // Guard against backwards local system clocks or invalid timestamps
  const safeElapsedMs = Math.max(0, rawDeltaMs);
  const longAbsence = safeElapsedMs > 30 * DAY_MS;
  const sameDayRepeat =
    previous !== undefined &&
    previous.stageIndex >= 1 &&
    safeElapsedMs < 0.5 * DAY_MS;

  let nextStageIndex: 0 | 1 | 2 | 3 | 4 = previous?.stageIndex ?? 0;

  if (!independentSuccess) {
    // Gentle step back by 1 interval for extra review — never resets to zero punitively
    nextStageIndex = Math.max(0, nextStageIndex - 1) as 0 | 1 | 2 | 3 | 4;
  } else if (sameDayRepeat) {
    // Prevent a single sitting or same-day repeat from collapsing the multi-day review ladder.
    // Preserve lastPracticedIso and nextReviewIso from the sitting start so same-day holds do not shift timestamps.
    return {
      skillId,
      stageIndex: previous.stageIndex,
      lastPracticedIso: previous.lastPracticedIso,
      nextReviewIso: previous.nextReviewIso,
    };
  } else if (longAbsence) {
    // Returning after a long absence refreshes from at most stage 2 (3 days)
    nextStageIndex = Math.min(2, nextStageIndex + 1) as 0 | 1 | 2 | 3 | 4;
  } else {
    nextStageIndex = Math.min(4, nextStageIndex + 1) as 0 | 1 | 2 | 3 | 4;
  }

  const intervalDays = REVIEW_INTERVAL_DAYS[nextStageIndex] ?? 1;
  const delayMs = intervalDays === 0 ? sessionGapMs : intervalDays * DAY_MS;
  const nextReviewMs = nowMs + delayMs;

  return {
    skillId,
    stageIndex: nextStageIndex,
    lastPracticedIso: nowIso,
    nextReviewIso: new Date(nextReviewMs).toISOString(),
  };
}

/**
 * Returns which skills are currently due for spaced review at `now`.
 * A stage-0 ("next session") interval requires at least `sessionGapHours`
 * (default `MIN_SESSION_GAP_HOURS = 4`) since `lastPracticedIso`.
 */
export function getDueReviewSkills(
  schedules: Readonly<Partial<Record<ObjectiveId, ReviewScheduleEntry>>>,
  now: Date = new Date(),
  options: { sessionGapHours?: number | undefined } = {},
): ObjectiveId[] {
  const sessionGapMs = (options.sessionGapHours ?? MIN_SESSION_GAP_HOURS) * HOUR_MS;
  const nowMs = now.getTime();
  const due: ObjectiveId[] = [];

  for (const id of OBJECTIVE_IDS) {
    const entry = schedules[id];
    if (!entry) continue;
    const dueMs = Date.parse(entry.nextReviewIso);
    const practicedMs = Date.parse(entry.lastPracticedIso);
    const sessionGapMet = !Number.isFinite(practicedMs) || nowMs - practicedMs >= sessionGapMs;
    if ((!Number.isFinite(dueMs) || nowMs >= dueMs) && sessionGapMet) {
      due.push(id);
    }
  }
  return due;
}

export interface ParentRecommendation {
  skillId: ObjectiveId;
  reasonKey: string;
  activityKey: string;
}

const OFFLINE_ACTIVITY_KEY_BY_SKILL: Readonly<Record<ObjectiveId, string>> = {
  "add-within-20": "parent.offline.addWithin20",
  "subtract-within-20": "parent.offline.subtractWithin20",
  "unknown-number-equations": "parent.offline.unknownEquations",
  "tens-and-ones": "parent.offline.tensAndOnes",
  "compare-lengths": "parent.offline.compareLengths",
  "compose-shapes": "parent.offline.composeShapes",
  "phonics-words": "parent.offline.phonicsWords",
  "star-patterns": "parent.offline.starPatterns",
  "reading-comprehension": "parent.offline.readingComprehension",
  "vocabulary-oral": "parent.offline.vocabularyOral",
  "spelling-writing": "parent.offline.spellingWriting",
  "logical-reasoning": "parent.offline.logicalReasoning",
  "science-nature": "parent.offline.scienceNature",
  "creative-construction": "parent.offline.creativeConstruction",
};

/**
 * Generates actionable, offline parent recommendations linked to the child's
 * demonstrated learning evidence (Phase 11).
 */
export function buildParentRecommendations(
  summaries: readonly SkillEvidenceSummary[],
): ParentRecommendation[] {
  const recommendations: ParentRecommendation[] = [];

  // 1. Prioritize skills flagged as needing support or having detected misconceptions
  for (const s of summaries) {
    if (
      s.classification === "needs-support" ||
      Object.keys(s.detectedMisconceptions).length > 0
    ) {
      recommendations.push({
        skillId: s.skillId,
        reasonKey: "parent.recommendReason.needsSupport",
        activityKey: OFFLINE_ACTIVITY_KEY_BY_SKILL[s.skillId],
      });
    }
  }

  // 2. Next, recommend skills in active practice or ready for transfer/retention
  for (const s of summaries) {
    if (
      recommendations.length < 4 &&
      (s.classification === "practicing" || s.classification === "introduced")
    ) {
      if (!recommendations.some((r) => r.skillId === s.skillId)) {
        recommendations.push({
          skillId: s.skillId,
          reasonKey: "parent.recommendReason.practicing",
          activityKey: OFFLINE_ACTIVITY_KEY_BY_SKILL[s.skillId],
        });
      }
    }
  }

  // 3. If no skills practiced yet, recommend the foundational entry skills
  if (recommendations.length === 0) {
    for (const id of ["add-within-20", "phonics-words", "compare-lengths"] as const) {
      recommendations.push({
        skillId: id,
        reasonKey: "parent.recommendReason.nextSkill",
        activityKey: OFFLINE_ACTIVITY_KEY_BY_SKILL[id],
      });
    }
  }

  return recommendations.slice(0, 4);
}

/**
 * Recommends the next curriculum skills whose prerequisites are satisfied.
 */
export function recommendNextSkills(
  summaries: readonly SkillEvidenceSummary[],
): ObjectiveId[] {
  const byId = new Map(summaries.map((s) => [s.skillId, s]));
  const ready: ObjectiveId[] = [];

  for (const id of OBJECTIVE_IDS) {
    const summary = byId.get(id);
    if (
      summary?.classification === "provisional-mastery" ||
      summary?.classification === "retained-mastery"
    ) {
      continue;
    }
    const prereqs = SKILLS_GRAPH[id].prerequisites;
    const prereqsReady = prereqs.every((p) => {
      const ps = byId.get(p);
      return (ps?.independentUnseenCorrect ?? 0) >= 2;
    });
    if (prereqsReady) {
      ready.push(id);
    }
  }

  return ready.slice(0, 4);
}
