import { describe, expect, it } from "vitest";
import { loadQuests } from "../content";
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

  it("cover every i18n key referenced by quest content", () => {
    for (const quest of loadQuests()) {
      for (const key of [quest.titleKey, quest.introKey, ...quest.rewards.map((r) => r.nameKey)]) {
        expect(en[key], `en-US missing ${key}`).toBeDefined();
      }
    }
  });
});
