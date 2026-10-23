import { z } from "zod";
import { ObjectiveIdSchema } from "../content/schemas";

export const MasteryStateSchema = z.object({
  objectiveId: ObjectiveIdSchema,
  attempts: z.number().int().min(0),
  independentSuccesses: z.number().int().min(0),
  supportedSuccesses: z.number().int().min(0),
  recentErrors: z.number().int().min(0),
  streak: z.number().int().min(0),
  nextDifficulty: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4)]),
});

export const EvidenceRecordSchema = z.object({
  attemptId: z.string(),
  skillId: ObjectiveIdSchema,
  contentVersion: z.string(),
  locale: z.enum(["en-US", "es-US"]),
  itemId: z.string(),
  itemFamily: z.string(),
  timestamp: z.string(),
  difficulty: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4)]),
  stage: z.enum(["modeling", "guided", "independent", "transfer", "retention"]),
  representation: z.enum(["objects", "symbols", "number-line"]),
  modality: z.enum(["visual-dom", "canvas-manipulative", "listening", "independent-reading"]),
  independent: z.boolean(),
  incorrectSubmissions: z.number().int().min(0),
  hintsRequested: z.number().int().min(0),
  hintTypes: z.array(z.enum(["rule-out", "visual-demo", "guided-solution"])),
  errorClassifications: z.array(z.string()),
  unseenItem: z.boolean(),
  isTransfer: z.boolean(),
  isRetention: z.boolean(),
  correct: z.boolean(),
  completed: z.boolean(),
  assessmentMode: z.enum([
    "standard",
    "baseline",
    "independent-check",
    "mixed-review",
    "delayed-retention",
    "transfer-check",
  ]),
});

export const ReviewScheduleEntrySchema = z.object({
  skillId: ObjectiveIdSchema,
  stageIndex: z.union([z.literal(0), z.literal(1), z.literal(2), z.literal(3), z.literal(4)]),
  lastPracticedIso: z.string(),
  nextReviewIso: z.string(),
  lastIndependentSuccessIso: z.string().optional(),
  priorIndependentSuccessIso: z.string().optional(),
});

/**
 * Everything the game remembers about a player. Deliberately contains no
 * name, age, identifier or free text — see PRIVACY.md before adding fields.
 */
export const PlayerProgressSchema = z.object({
  schemaVersion: z.union([z.literal(1), z.literal(2)]),
  lastUpdated: z.string(),
  unlockedQuestIds: z.array(z.string()),
  completedQuestIds: z.array(z.string()),
  rewardIds: z.array(z.string()),
  objectives: z.partialRecord(ObjectiveIdSchema, MasteryStateSchema),
  evidenceLog: z.array(EvidenceRecordSchema).optional(),
  reviewSchedule: z.partialRecord(ObjectiveIdSchema, ReviewScheduleEntrySchema).optional(),
  seenItemSignatures: z.array(z.string()).optional(),
  placedSkills: z.array(ObjectiveIdSchema).optional(),
  legacyMigratedFromV1: z.boolean().optional(),
});

export type PlayerProgress = z.infer<typeof PlayerProgressSchema>;

/**
 * Persistence boundary. The MVP implementation is device-local; a future
 * parent-controlled cloud sync must implement this same interface so no
 * networking concerns leak into scenes.
 */
export interface ProgressRepository {
  load(): Promise<PlayerProgress | null>;
  save(progress: PlayerProgress): Promise<void>;
  clear(): Promise<void>;
}

export function emptyProgress(firstQuestId: string, now: Date = new Date()): PlayerProgress {
  return {
    schemaVersion: 2,
    lastUpdated: now.toISOString(),
    unlockedQuestIds: [firstQuestId],
    completedQuestIds: [],
    rewardIds: [],
    objectives: {},
  };
}
