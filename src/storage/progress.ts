import type { QuestDefinition } from "../content/schemas";
import type { MasteryMap } from "../learning/session";
import type { PlayerProgress } from "./ProgressRepository";

const union = (a: readonly string[], b: readonly string[]) => [...new Set([...a, ...b])];

/** Pure update applied when a quest is completed. */
export function completeQuest(
  progress: PlayerProgress,
  quest: QuestDefinition,
  mastery: MasteryMap,
  now: Date = new Date(),
): PlayerProgress {
  return {
    ...progress,
    lastUpdated: now.toISOString(),
    completedQuestIds: union(progress.completedQuestIds, [quest.id]),
    unlockedQuestIds: union(progress.unlockedQuestIds, quest.unlocks),
    rewardIds: union(progress.rewardIds, quest.rewards.map((r) => r.id)),
    objectives: { ...progress.objectives, ...mastery },
  };
}

/** Saves mastery mid-quest so a closed tab doesn't lose learning evidence. */
export function updateMastery(progress: PlayerProgress, mastery: MasteryMap, now: Date = new Date()): PlayerProgress {
  return { ...progress, lastUpdated: now.toISOString(), objectives: { ...progress.objectives, ...mastery } };
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
