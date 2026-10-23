import { OBJECTIVE_IDS } from "../learning/objectives";
import { PlayerProgressSchema, type PlayerProgress, type ProgressRepository } from "./ProgressRepository";

/** The subset of the Web Storage API we use; injectable for tests. */
export type KeyValueStore = Pick<Storage, "getItem" | "setItem" | "removeItem">;

export const PROGRESS_KEY = "flg.progress.v1";

/**
 * Migrates legacy (v0, v1, or partial v2) save payloads while rejecting
 * unknown future versions (e.g. schemaVersion 99).
 *
 * When a legacy v0/v1 save with objective attempts is migrated without an
 * `evidenceLog`, `legacyMigratedFromV1` is preserved so the Parent Dashboard
 * honestly reports legacy completions as unverified rather than validated mastery.
 */
export function migrateRawProgress(raw: unknown): unknown {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return raw;
  const record = raw as Record<string, unknown>;
  const version = record.schemaVersion;
  if (version !== undefined && version !== 0 && version !== 1 && version !== 2) {
    return raw;
  }

  const validObjectives = new Set<string>(OBJECTIVE_IDS);
  const rawObjectives =
    record.objectives && typeof record.objectives === "object" && !Array.isArray(record.objectives)
      ? (record.objectives as Record<string, unknown>)
      : {};
  const cleanedObjectives: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(rawObjectives)) {
    if (validObjectives.has(k) && v && typeof v === "object") {
      const m = v as Record<string, unknown>;
      if (typeof m.objectiveId === "string" && typeof m.attempts === "number") {
        cleanedObjectives[k] = {
          objectiveId: m.objectiveId,
          attempts: m.attempts,
          independentSuccesses: typeof m.independentSuccesses === "number" ? m.independentSuccesses : 0,
          supportedSuccesses: typeof m.supportedSuccesses === "number" ? m.supportedSuccesses : 0,
          recentErrors: typeof m.recentErrors === "number" ? m.recentErrors : 0,
          streak: typeof m.streak === "number" ? m.streak : 0,
          nextDifficulty: typeof m.nextDifficulty === "number" ? m.nextDifficulty : 1,
        };
      }
    }
  }

  const hasLegacyObjectivesWithoutEvidence =
    Object.keys(cleanedObjectives).length > 0 && !Array.isArray(record.evidenceLog);

  const result: Record<string, unknown> = {
    schemaVersion: 2,
    lastUpdated: typeof record.lastUpdated === "string" ? record.lastUpdated : new Date(0).toISOString(),
    unlockedQuestIds: Array.isArray(record.unlockedQuestIds) ? record.unlockedQuestIds : ["forest-gate"],
    completedQuestIds: Array.isArray(record.completedQuestIds) ? record.completedQuestIds : [],
    rewardIds: Array.isArray(record.rewardIds) ? record.rewardIds : [],
    objectives: cleanedObjectives,
  };

  if (Array.isArray(record.evidenceLog)) {
    result.evidenceLog = record.evidenceLog.slice(-250);
  }
  if (record.reviewSchedule && typeof record.reviewSchedule === "object" && !Array.isArray(record.reviewSchedule)) {
    result.reviewSchedule = record.reviewSchedule;
  }
  if (Array.isArray(record.seenItemSignatures)) {
    result.seenItemSignatures = record.seenItemSignatures.slice(-500);
  }
  if (Array.isArray(record.placedSkills)) {
    result.placedSkills = record.placedSkills.filter((id) => validObjectives.has(String(id)));
  }
  if (record.legacyMigratedFromV1 === true || hasLegacyObjectivesWithoutEvidence) {
    result.legacyMigratedFromV1 = true;
  }

  return result;
}

/**
 * Stores progress in this browser only. Nothing leaves the device.
 * Corrupt or unrecognised data falls back to a backup slot or "no progress"
 * rather than crashing the game.
 */
export class LocalProgressRepository implements ProgressRepository {
  constructor(
    private readonly store: KeyValueStore | null = safeLocalStorage(),
    private readonly key: string = PROGRESS_KEY,
  ) {}

  private get backupKey(): string {
    return `${this.key}.bak`;
  }

  async load(): Promise<PlayerProgress | null> {
    const primary = this.parseSlot(this.store?.getItem(this.key) ?? null);
    if (primary) return primary;
    return this.parseSlot(this.store?.getItem(this.backupKey) ?? null);
  }

  async save(progress: PlayerProgress): Promise<void> {
    const valid = PlayerProgressSchema.parse(progress);
    const serialized = JSON.stringify(valid);
    try {
      const existing = this.store?.getItem(this.key);
      if (existing && this.parseSlot(existing)) {
        this.store?.setItem(this.backupKey, existing);
      }
      this.store?.setItem(this.key, serialized);
    } catch {
      // Quota exceeded or storage disabled: the game keeps working in memory.
    }
  }

  async clear(): Promise<void> {
    this.store?.removeItem(this.key);
    this.store?.removeItem(this.backupKey);
  }

  private parseSlot(raw: string | null): PlayerProgress | null {
    if (!raw) return null;
    try {
      const migrated = migrateRawProgress(JSON.parse(raw));
      const parsed = PlayerProgressSchema.safeParse(migrated);
      return parsed.success ? parsed.data : null;
    } catch {
      return null;
    }
  }
}

/** localStorage can throw (private mode, disabled site data); never let it crash the game. */
export function safeLocalStorage(): KeyValueStore | null {
  try {
    const store = globalThis.localStorage;
    const probe = "__flg_probe__";
    store.setItem(probe, probe);
    store.removeItem(probe);
    return store;
  } catch {
    return null;
  }
}

/** In-memory store for tests and as a fallback. */
export class MemoryStore implements KeyValueStore {
  private readonly data = new Map<string, string>();
  getItem(key: string): string | null {
    return this.data.get(key) ?? null;
  }
  setItem(key: string, value: string): void {
    this.data.set(key, value);
  }
  removeItem(key: string): void {
    this.data.delete(key);
  }
}
