import { describe, expect, it } from "vitest";
import { GENERATORS } from "../learning/generators";
import { FIRST_QUEST_ID, loadQuests, RAW_QUESTS } from "./index";
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
