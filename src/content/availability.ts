import type { QuestDefinition } from "./schemas";

export type QuestAvailability = "available" | "completed" | "locked" | "planned";

export function questAvailability(
  quest: QuestDefinition,
  progress: { unlockedQuestIds: readonly string[]; completedQuestIds: readonly string[] },
): QuestAvailability {
  if (quest.status === "planned") return "planned";
  if (progress.completedQuestIds.includes(quest.id)) return "completed";
  return progress.unlockedQuestIds.includes(quest.id) ? "available" : "locked";
}

export function isPlayable(state: QuestAvailability): boolean {
  return state === "available" || state === "completed";
}
