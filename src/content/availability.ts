import type { QuestDefinition } from "./schemas";

export type QuestAvailability = "available" | "completed" | "locked" | "planned";

export function questAvailability(
  quest: QuestDefinition,
  progress: { unlockedQuestIds: readonly string[]; completedQuestIds: readonly string[] },
): QuestAvailability {
  if (quest.status === "planned") return "planned";
  if (progress.completedQuestIds.includes(quest.id)) return "completed";
  const unlockedByPrereq =
    quest.prerequisiteQuestId !== undefined && progress.completedQuestIds.includes(quest.prerequisiteQuestId);
  return progress.unlockedQuestIds.includes(quest.id) || unlockedByPrereq ? "available" : "locked";
}

export function isPlayable(state: QuestAvailability): boolean {
  return state === "available" || state === "completed";
}
