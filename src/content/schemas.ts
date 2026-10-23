import { z } from "zod";
import { OBJECTIVE_IDS } from "../learning/objectives";

// Disable Zod 4's Function() JIT compilation so strict CSP ("script-src 'self'")
// never logs a blocked-eval console error in Firefox.
z.config({ jitless: true });

export const ObjectiveIdSchema = z.enum(OBJECTIVE_IDS);

const i18nKey = z.string().regex(/^[a-zA-Z][\w]*(\.[\w]+)+$/, "Must be a dotted i18n key");

export const QuestPhaseSchema = z
  .object({
    kind: z.enum(["guided", "independent", "mini-boss"]),
    count: z.number().int().min(1).max(10),
    difficultyFloor: z.number().int().min(1).max(4).optional(),
    difficultyCap: z.number().int().min(1).max(4).optional(),
  })
  .refine((p) => (p.difficultyFloor ?? 1) <= (p.difficultyCap ?? 4), {
    message: "difficultyFloor must not exceed difficultyCap",
  });

export const RewardSchema = z.object({
  id: z.string().min(1),
  kind: z.enum(["cosmetic", "story", "companion"]),
  nameKey: i18nKey,
});

export const RegionIdSchema = z.enum([
  "whispering-woods",
  "crystal-caves",
  "enchanted-library",
  "starfall-tower",
]);
export type RegionId = z.infer<typeof RegionIdSchema>;

export const GuideIdSchema = z.enum(["pip", "moss", "bramble", "luma", "astra"]);
export type GuideId = z.infer<typeof GuideIdSchema>;

export const QuestSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/),
  status: z.enum(["playable", "planned"]),
  regionId: RegionIdSchema.default("whispering-woods"),
  guideId: GuideIdSchema.default("pip"),
  titleKey: i18nKey,
  introKey: i18nKey,
  /** Phaser scene key that presents this quest's mechanic. */
  sceneKey: z.string().min(1),
  objectiveIds: z.array(ObjectiveIdSchema).min(1),
  recommendedMinutes: z.number().int().positive().max(20),
  phases: z.array(QuestPhaseSchema).min(1),
  rewards: z.array(RewardSchema),
  /** Quests that become available when this one is completed. */
  unlocks: z.array(z.string()),
  /** Position on the 960×540 world map. */
  map: z.object({ x: z.number().min(0).max(960), y: z.number().min(0).max(540) }),
});

export type QuestDefinition = z.infer<typeof QuestSchema>;
