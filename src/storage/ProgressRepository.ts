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

/**
 * Everything the game remembers about a player. Deliberately contains no
 * name, age, identifier or free text — see PRIVACY.md before adding fields.
 */
export const PlayerProgressSchema = z.object({
  schemaVersion: z.literal(1),
  lastUpdated: z.string(),
  unlockedQuestIds: z.array(z.string()),
  completedQuestIds: z.array(z.string()),
  rewardIds: z.array(z.string()),
  objectives: z.partialRecord(ObjectiveIdSchema, MasteryStateSchema),
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
    schemaVersion: 1,
    lastUpdated: now.toISOString(),
    unlockedQuestIds: [firstQuestId],
    completedQuestIds: [],
    rewardIds: [],
    objectives: {},
  };
}
