import type { PlayerProgress } from "../storage/ProgressRepository";
import type { QuestDefinition } from "./schemas";

export type QuestAvailability = "available" | "completed" | "locked" | "planned";

export function questAvailability(quest: QuestDefinition, progress: PlayerProgress): QuestAvailability {
  if (quest.status === "planned") return "planned";
  if (progress.completedQuestIds.includes(quest.id)) return "completed";
  if (quest.isSanctuary || progress.unlockedQuestIds.includes(quest.id)) return "available";
  return "locked";
}

export function isPlayable(availability: QuestAvailability): boolean {
  return availability === "available" || availability === "completed";
}
