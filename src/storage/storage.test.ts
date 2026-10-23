import { describe, expect, it } from "vitest";
import { loadQuests } from "../content";
import { initialMastery } from "../learning/mastery";
import { LocalProgressRepository, MemoryStore, PROGRESS_KEY } from "./LocalProgressRepository";
import { emptyProgress, PlayerProgressSchema } from "./ProgressRepository";
import { completeQuest, discoverTreasure } from "./progress";

const forest = loadQuests().find((q) => q.id === "forest-gate")!;

describe("LocalProgressRepository", () => {
  it("round-trips progress", async () => {
    const repo = new LocalProgressRepository(new MemoryStore());
    const progress = emptyProgress("forest-gate", new Date("2026-10-23T00:00:00Z"));
    await repo.save(progress);
    expect(await repo.load()).toEqual(progress);
  });

  it("treats corrupt or foreign data as no progress", async () => {
    const store = new MemoryStore();
    const repo = new LocalProgressRepository(store);
    store.setItem(PROGRESS_KEY, "{not json");
    expect(await repo.load()).toBeNull();
    store.setItem(PROGRESS_KEY, JSON.stringify({ schemaVersion: 99 }));
    expect(await repo.load()).toBeNull();
  });

  it("migrates legacy v0 and v1 saves to v2 with legacyMigratedFromV1 flag and recovers from backup if primary is corrupted", async () => {
    const store = new MemoryStore();
    const repo = new LocalProgressRepository(store);
    store.setItem(
      PROGRESS_KEY,
      JSON.stringify({
        unlockedQuestIds: ["forest-gate"],
        completedQuestIds: ["forest-gate"],
        objectives: {
          "unknown-old-id": { attempts: 1 },
          "add-within-20": {
            objectiveId: "add-within-20",
            attempts: 4,
            independentSuccesses: 3,
            supportedSuccesses: 1,
            streak: 3,
            nextDifficulty: 2,
          },
        },
      }),
    );
    const migrated = await repo.load();
    expect(migrated?.schemaVersion).toBe(2);
    expect(migrated?.legacyMigratedFromV1).toBe(true);
    expect(migrated?.completedQuestIds).toEqual(["forest-gate"]);
    expect(migrated?.objectives["add-within-20"]?.attempts).toBe(4);
    expect(migrated?.objectives["unknown-old-id" as "add-within-20"]).toBeUndefined();

    await repo.save(migrated!);
    const updated = discoverTreasure(migrated!, "treasure.whispering-seed");
    await repo.save(updated);
    // Corrupt primary slot: repository recovers the previous valid backup
    store.setItem(PROGRESS_KEY, "{corrupted");
    const recovered = await repo.load();
    expect(recovered?.completedQuestIds).toEqual(["forest-gate"]);
  });

  it("clears progress", async () => {
    const repo = new LocalProgressRepository(new MemoryStore());
    await repo.save(emptyProgress("forest-gate"));
    await repo.clear();
    expect(await repo.load()).toBeNull();
  });

  it("works with no storage available", async () => {
    const repo = new LocalProgressRepository(null);
    await repo.save(emptyProgress("forest-gate"));
    expect(await repo.load()).toBeNull();
  });
});

describe("completeQuest", () => {
  it("unlocks follow-on quests, grants rewards and merges mastery", () => {
    const before = emptyProgress("forest-gate");
    const mastery = { "add-within-20": { ...initialMastery("add-within-20"), attempts: 6 } };
    const after = completeQuest(before, forest, mastery);

    expect(after.completedQuestIds).toEqual(["forest-gate"]);
    expect(after.unlockedQuestIds).toEqual(["forest-gate", "lantern-bridge"]);
    expect(after.rewardIds).toEqual(["companion.moss"]);
    expect(after.objectives["add-within-20"]?.attempts).toBe(6);
    expect(PlayerProgressSchema.safeParse(after).success).toBe(true);
  });

  it("is idempotent for repeated completions", () => {
    const once = completeQuest(emptyProgress("forest-gate"), forest, {});
    const twice = completeQuest(once, forest, {});
    expect(twice.completedQuestIds).toEqual(once.completedQuestIds);
    expect(twice.rewardIds).toEqual(once.rewardIds);
  });
});

describe("privacy invariant", () => {
  it("stores no personal fields", () => {
    const allowed = [
      "schemaVersion",
      "lastUpdated",
      "unlockedQuestIds",
      "completedQuestIds",
      "rewardIds",
      "objectives",
      "evidenceLog",
      "reviewSchedule",
      "seenItemSignatures",
      "placedSkills",
      "legacyMigratedFromV1",
    ];
    expect(Object.keys(PlayerProgressSchema.shape).sort()).toEqual(allowed.sort());
  });
});
