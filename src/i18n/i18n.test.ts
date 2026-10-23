import { describe, expect, it } from "vitest";
import { loadQuests } from "../content";
import { STORY_WORD_IDS } from "../learning/generators/phonics";
import { OBJECTIVE_IDS } from "../learning/objectives";
import enUS from "./locales/en-US.json";
import esUS from "./locales/es-US.json";

function flatten(obj: object, prefix = ""): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [key, value] of Object.entries(obj)) {
    const path = prefix ? `${prefix}.${key}` : key;
    if (value && typeof value === "object") Object.assign(out, flatten(value as object, path));
    else out[path] = String(value);
  }
  return out;
}

const en = flatten(enUS);
const es = flatten(esUS);
const placeholders = (s: string) => [...s.matchAll(/\{\{(\w+)\}\}/g)].map((m) => m[1]).sort();

describe("locales", () => {
  it("have identical key sets", () => {
    expect(Object.keys(es).sort()).toEqual(Object.keys(en).sort());
  });

  it("use the same interpolation placeholders", () => {
    for (const key of Object.keys(en)) {
      expect(placeholders(es[key] ?? ""), key).toEqual(placeholders(en[key] ?? ""));
    }
  });

  it("have no empty strings", () => {
    for (const [key, value] of Object.entries({ ...en, ...es })) expect(value.trim().length > 0, key).toBe(true);
  });

  it("cover every i18n key referenced by quest content and reward kinds", () => {
    for (const quest of loadQuests()) {
      for (const key of [quest.titleKey, quest.introKey, ...quest.rewards.map((r) => r.nameKey)]) {
        expect(en[key], `en-US missing ${key}`).toBeDefined();
      }
      for (const reward of quest.rewards) {
        expect(en[`reward.earnedByKind.${reward.kind}`]).toBeDefined();
        expect(es[`reward.earnedByKind.${reward.kind}`]).toBeDefined();
      }
    }
  });

  it("define objective-specific hint1, hint2, and hint3 strings for every curriculum objective", () => {
    const enHint1Set = new Set<string>();
    const enHint2Set = new Set<string>();
    for (const objectiveId of OBJECTIVE_IDS) {
      const h1 = en[`feedback.byObjective.${objectiveId}.hint1`];
      const h2 = en[`feedback.byObjective.${objectiveId}.hint2`];
      const h3 = en[`feedback.byObjective.${objectiveId}.hint3`];
      expect(h1, `missing hint1 for ${objectiveId}`).toBeDefined();
      expect(h2, `missing hint2 for ${objectiveId}`).toBeDefined();
      expect(h3, `missing hint3 for ${objectiveId}`).toBeDefined();
      enHint1Set.add(h1!);
      enHint2Set.add(h2!);
    }
    // Every objective teaches something specific rather than sharing generic copy
    expect(enHint1Set.size).toBe(OBJECTIVE_IDS.length);
    expect(enHint2Set.size).toBe(OBJECTIVE_IDS.length);
  });

  it("keep phonics word icons aligned across locales and omit icons from choice labels", () => {
    for (const id of STORY_WORD_IDS) {
      const enIcon = en[`challenge.phonics.word.${id}.icon`];
      const esIcon = es[`challenge.phonics.word.${id}.icon`];
      const enLabel = en[`challenge.phonics.word.${id}.label`];
      const esLabel = es[`challenge.phonics.word.${id}.label`];
      const enWord = en[`challenge.phonics.word.${id}.word`];
      const esWord = es[`challenge.phonics.word.${id}.word`];

      expect(enIcon).toBe(esIcon);
      // Choice labels must be word-only (no emoji icon) so children read rather than icon-match
      expect(enLabel).toBe(enWord);
      expect(esLabel).toBe(esWord);
      expect(enLabel?.includes(enIcon!)).toBe(false);
      expect(esLabel?.includes(esIcon!)).toBe(false);
    }
    expect(en["challenge.phonics.word.11.word"]).toBe("SUN");
    expect(es["challenge.phonics.word.11.word"]).toBe("SOL");
  });
});
