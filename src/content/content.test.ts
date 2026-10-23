import { describe, expect, it } from "vitest";
import { GENERATORS } from "../learning/generators";
import { emptyProgress } from "../storage/ProgressRepository";
import { completeQuest } from "../storage/progress";
import { questAvailability } from "./availability";
import { FINAL_QUEST_ID, FIRST_QUEST_ID, loadQuests, RAW_QUESTS, REGIONS } from "./index";
import { QuestSchema } from "./schemas";

const quests = loadQuests();
const ids = new Set(quests.map((q) => q.id));

describe("quest content", () => {
  it("parses every bundled quest", () => {
    expect(quests).toHaveLength(RAW_QUESTS.length);
  });

  it("has unique ids and a playable first quest", () => {
    expect(ids.size).toBe(quests.length);
    expect(quests.find((q) => q.id === FIRST_QUEST_ID)?.status).toBe("playable");
  });

  it("only unlocks quests that exist", () => {
    for (const quest of quests) {
      for (const unlock of quest.unlocks) expect(ids, `${quest.id} unlocks ${unlock}`).toContain(unlock);
    }
  });

  it("forms a single reachable 12-quest critical path across all four regions to the finale", () => {
    let progress = emptyProgress(FIRST_QUEST_ID);
    const visited: string[] = [];

    while (true) {
      const available = quests.filter((q) => questAvailability(q, progress) === "available");
      if (available.length === 0) break;
      // Exactly one next quest is unlocked at each step of the linear campaign
      expect(available).toHaveLength(1);
      const current = available[0]!;
      if (current.id === FINAL_QUEST_ID) {
        // The finale is only reachable after completing all 11 preceding quests
        expect(visited).toHaveLength(quests.length - 1);
      }
      visited.push(current.id);
      progress = completeQuest(progress, current, {});
    }

    expect(visited).toEqual(quests.map((q) => q.id));
    const visitedRegions = new Set(quests.filter((q) => visited.includes(q.id)).map((q) => q.regionId));
    expect([...visitedRegions].sort()).toEqual(REGIONS.map((r) => r.id).sort());
  });

  it("has a challenge generator for every objective in a playable quest", () => {
    for (const quest of quests.filter((q) => q.status === "playable")) {
      for (const objective of quest.objectiveIds) {
        expect(GENERATORS[objective], `${quest.id} → ${objective}`).toBeDefined();
      }
    }
  });

  it("keeps quests near the 10-minute pacing target", () => {
    for (const quest of quests) {
      const challenges = quest.phases.reduce((n, p) => n + p.count, 0);
      expect(challenges).toBeGreaterThanOrEqual(3);
      expect(challenges).toBeLessThanOrEqual(10);
    }
  });

  it("rejects malformed content", () => {
    expect(QuestSchema.safeParse({ id: "Bad Id!" }).success).toBe(false);
    expect(
      QuestSchema.safeParse({ ...RAW_QUESTS[0] as object, objectiveIds: ["multiply-fractions"] }).success,
    ).toBe(false);
    expect(
      QuestSchema.safeParse({
        ...RAW_QUESTS[0] as object,
        phases: [{ kind: "guided", count: 2, difficultyFloor: 4, difficultyCap: 1 }],
      }).success,
    ).toBe(false);
  });
});
