import { describe, expect, it } from "vitest";
import en from "../i18n/locales/en-US.json";
import es from "../i18n/locales/es-US.json";
import {
  advanceReviewSchedule,
  buildParentRecommendations,
  getDueReviewSkills,
  REVIEW_INTERVAL_DAYS,
} from "./adaptation/spacedReview";
import { evaluateSkillEvidence, type EvidenceRecord } from "./assessment/evidence";
import {
  arePrerequisitesMet,
  firstUnmetPrerequisite,
  SKILLS_GRAPH,
  validateSkillGraph,
} from "./curriculum/skills";
import { STANDARDS_REGISTRY, validateStandardsRegistry } from "./curriculum/standards";
import { GENERATORS } from "./generators";
import { createUnknownNumberEquations } from "./generators/unknownEquations";
import { getWordAudioEntry, PHONEME_AUDIO_REGISTRY } from "./literacy/audioRegistry";
import {
  ENGLISH_PHONICS_UNITS,
  PHONICS_WORD_BANK,
  SPANISH_PHONICS_UNITS,
  validatePhonicsCurriculum,
} from "./literacy/phonicsCurriculum";
import { OBJECTIVE_IDS, OBJECTIVES, type Difficulty } from "./objectives";
import { mulberry32 } from "./random";
import { QuestRunner, type QuestPlan } from "./session";

const DIFFICULTIES: Difficulty[] = [1, 2, 3, 4];
const SEEDS = Array.from({ length: 120 }, (_, i) => i * 3571 + 17);

function lookupKey(obj: unknown, dotPath: string): unknown {
  return dotPath.split(".").reduce<unknown>((acc, part) => {
    if (acc && typeof acc === "object" && part in (acc as Record<string, unknown>)) {
      return (acc as Record<string, unknown>)[part];
    }
    return undefined;
  }, obj);
}

describe("Phase 1 & 4 — Standards Crosswalk & Skill Graph Validation", () => {
  it("validates the versioned standards registry with zero errors", () => {
    expect(validateStandardsRegistry()).toEqual({ valid: true, errors: [] });
  });

  it("maps 1.OA.D.8 to unknown-number-equations and 1.NBT.A.1 to star-patterns", () => {
    expect(OBJECTIVES["unknown-number-equations"].standard).toBe("1.OA.D.8");
    expect(OBJECTIVES["unknown-number-equations"].ncStandard).toBe("NC.1.OA.8");
    expect(OBJECTIVES["star-patterns"].standard).toBe("1.NBT.A.1");
    expect(OBJECTIVES["star-patterns"].ncStandard).toBe("NC.1.NBT.1");
    const oa8 = STANDARDS_REGISTRY.find((s) => s.id === "CCSS.MATH.1.OA.D.8");
    expect(oa8?.skillsAddressed).toContain("unknown-number-equations");
    expect(oa8?.skillsAddressed).not.toContain("star-patterns");
  });

  it("includes both NC 2017 ELA (2026-27) and NC 2026 ELA (2027-28) standards", () => {
    const editions = new Set(STANDARDS_REGISTRY.map((s) => s.edition));
    expect(editions).toContain("CCSS-MATH-2010");
    expect(editions).toContain("CCSS-ELA-2010");
    expect(editions).toContain("NC-MATH-2018");
    expect(editions).toContain("NC-ELA-2017 (effective 2026-27)");
    expect(editions).toContain("NC-ELA-2026 (effective 2027-28)");
    expect(editions).toContain("NGSS-NC-SCI-2023");
  });

  it("validates the 14-skill prerequisite graph and ensures >=4 item families per skill", () => {
    expect(validateSkillGraph()).toEqual({ valid: true, errors: [] });
    for (const id of OBJECTIVE_IDS) {
      const node = SKILLS_GRAPH[id];
      expect(node.itemFamilies.length).toBeGreaterThanOrEqual(4);
      expect(node.stages).toEqual(["modeling", "guided", "independent", "transfer", "retention"]);
    }
  });

  it("identifies unmet prerequisites and unlocks dependent skills once mastered", () => {
    expect(arePrerequisitesMet("subtract-within-20", {})).toBe(false);
    expect(firstUnmetPrerequisite("subtract-within-20", {})).toBe("add-within-20");
    expect(
      arePrerequisitesMet("subtract-within-20", {
        "add-within-20": { independentSuccesses: 2 },
      }),
    ).toBe(true);
  });
});

describe("Phase 2 — Systematic English & Spanish Phonics Curriculum & Audio Registry", () => {
  it("validates English and Spanish phonics scope-and-sequence units and mechanics", () => {
    expect(validatePhonicsCurriculum()).toEqual({ valid: true, errors: [] });
    expect(ENGLISH_PHONICS_UNITS.length).toBe(4);
    expect(SPANISH_PHONICS_UNITS.length).toBe(4);
    expect(Object.keys(PHONICS_WORD_BANK)).toHaveLength(12);
  });

  it("includes phoneme and word pronunciation entries with parent guidance for en and es", () => {
    expect(Object.keys(PHONEME_AUDIO_REGISTRY)).toHaveLength(24);
    expect(getWordAudioEntry(1, "en-US").grapheme).toBe("MOON");
    expect(getWordAudioEntry(1, "es-US").grapheme).toBe("LUNA");
  });
});

describe("Phase 4–10 — All 14 Generators & Bilingual Locale Key Integrity", () => {
  it("generates valid unknown-number equations across all 4 structures (1.OA.D.8)", () => {
    const familiesSeen = new Set<string>();
    for (const seed of SEEDS) {
      for (const d of DIFFICULTIES) {
        const c = createUnknownNumberEquations(mulberry32(seed), d);
        const [a = 0, b = 0, code = 1] = c.operands;
        familiesSeen.add(c.meta?.itemFamily ?? "");
        if (code === 1) {
          // a + ? = b
          expect(a + c.correctAnswer).toBe(b);
        } else if (code === 2) {
          // ? + a = b
          expect(c.correctAnswer + a).toBe(b);
        } else if (code === 3) {
          // a - ? = b
          expect(a - c.correctAnswer).toBe(b);
        } else {
          // a = ? - b
          expect(c.correctAnswer - b).toBe(a);
        }
        expect(c.choices).toContain(c.correctAnswer);
        expect(new Set(c.choices).size).toBe(3);
      }
    }
    expect(familiesSeen).toEqual(
      new Set([
        "missing-second-addend",
        "missing-first-addend",
        "missing-subtrahend",
        "missing-minuend-reversed-equals",
      ]),
    );
  });

  it("verifies all 14 generators produce valid choices, metadata, and existing en-US/es-US keys", () => {
    for (const id of OBJECTIVE_IDS) {
      const gen = GENERATORS[id];
      for (const d of DIFFICULTIES) {
        for (const seed of SEEDS.slice(0, 30)) {
          const spec = gen(mulberry32(seed), d);
          expect(spec.objectiveId).toBe(id);
          expect(spec.choices).toHaveLength(3);
          expect(new Set(spec.choices).size).toBe(3);
          expect(spec.choices).toContain(spec.correctAnswer);
          expect(lookupKey(en, spec.promptKey), `Missing EN promptKey: ${spec.promptKey}`).toBeTypeOf(
            "string",
          );
          expect(lookupKey(es, spec.promptKey), `Missing ES promptKey: ${spec.promptKey}`).toBeTypeOf(
            "string",
          );
          if (spec.choiceKeyPrefix) {
            for (const choice of spec.choices) {
              const labelKey = `${spec.choiceKeyPrefix}.${choice}.label`;
              expect(lookupKey(en, labelKey), `Missing EN choice key: ${labelKey}`).toBeTypeOf(
                "string",
              );
              expect(lookupKey(es, labelKey), `Missing ES choice key: ${labelKey}`).toBeTypeOf(
                "string",
              );
            }
          }
          if (spec.meta?.passageKey) {
            expect(lookupKey(en, spec.meta.passageKey)).toBeTypeOf("string");
            expect(lookupKey(es, spec.meta.passageKey)).toBeTypeOf("string");
          }
        }
      }
    }
  });
});

describe("Phase 3 — Evidence Engine, Mastery Honesty, and Spaced Review", () => {
  function makeRecord(overrides: Partial<EvidenceRecord>): EvidenceRecord {
    return {
      attemptId: "att-1",
      skillId: "add-within-20",
      contentVersion: "2.0.0",
      locale: "en-US",
      itemId: "add:3+4",
      itemFamily: "count-on-from-larger",
      timestamp: "2026-10-23T12:00:00.000Z",
      difficulty: 2,
      stage: "independent",
      representation: "symbols",
      modality: "visual-dom",
      independent: true,
      incorrectSubmissions: 0,
      hintsRequested: 0,
      hintTypes: [],
      errorClassifications: [],
      unseenItem: true,
      isTransfer: false,
      isRetention: false,
      correct: true,
      completed: true,
      assessmentMode: "standard",
      ...overrides,
    };
  }

  it("never counts Hint 3 answer revelation toward independent mastery", () => {
    const assistedRecords = Array.from({ length: 6 }, (_, i) =>
      makeRecord({
        attemptId: `att-${i}`,
        itemId: `add:${i}+2`,
        itemFamily: `family-${(i % 3) + 1}`,
        representation: i % 2 === 0 ? "objects" : "symbols",
        independent: false,
        hintsRequested: 3,
        hintTypes: ["rule-out", "visual-demo", "guided-solution"],
      }),
    );
    const summary = evaluateSkillEvidence("add-within-20", assistedRecords);
    expect(summary.independentUnseenCorrect).toBe(0);
    expect(summary.assistedCompletions).toBe(6);
    expect(summary.classification).not.toBe("provisional-mastery");
    expect(summary.classification).not.toBe("retained-mastery");
  });

  it("reaches provisional-mastery and retained-mastery when unseen, family, representation, transfer, and retention criteria are met", () => {
    const records: EvidenceRecord[] = [
      makeRecord({ itemId: "1", itemFamily: "fam-1", representation: "objects" }),
      makeRecord({ itemId: "2", itemFamily: "fam-2", representation: "number-line" }),
      makeRecord({ itemId: "3", itemFamily: "fam-3", representation: "symbols" }),
      makeRecord({ itemId: "4", itemFamily: "fam-1", representation: "symbols", isTransfer: true }),
      makeRecord({
        itemId: "5",
        itemFamily: "fam-2",
        representation: "symbols",
        isRetention: true,
      }),
    ];
    const summary = evaluateSkillEvidence("add-within-20", records);
    expect(summary.independentUnseenCorrect).toBe(5);
    expect(summary.classification).toBe("retained-mastery");
  });

  it("separates listening comprehension from independent reading comprehension", () => {
    const listeningRecords = Array.from({ length: 5 }, (_, i) =>
      makeRecord({
        skillId: "reading-comprehension",
        itemId: `rc-${i}`,
        itemFamily: `fam-${(i % 3) + 1}`,
        representation: i % 2 === 0 ? "objects" : "symbols",
        modality: "listening",
        independent: false,
      }),
    );
    const summary = evaluateSkillEvidence("reading-comprehension", listeningRecords);
    expect(summary.listeningOnlyCount).toBe(5);
    expect(summary.independentReadingCount).toBe(0);
    expect(summary.independentUnseenCorrect).toBe(0);
    expect(summary.classification).toBe("practicing");
  });

  it("separates English and Spanish phonics evidence", () => {
    const enRecord = makeRecord({ skillId: "phonics-words", locale: "en-US", itemId: "en-1" });
    const esRecord = makeRecord({ skillId: "phonics-words", locale: "es-US", itemId: "es-1" });

    const enEval = evaluateSkillEvidence("phonics-words", [enRecord, esRecord], { locale: "en-US" });
    const esEval = evaluateSkillEvidence("phonics-words", [enRecord, esRecord], { locale: "es-US" });
    expect(enEval.totalCompletedAttempts).toBe(1);
    expect(esEval.totalCompletedAttempts).toBe(1);
  });

  it("detects repeated misconceptions and generates targeted offline parent recommendations", () => {
    const records = [
      makeRecord({
        correct: false,
        completed: false,
        independent: false,
        errorClassifications: ["subtracted-instead-of-added"],
      }),
      makeRecord({
        correct: false,
        completed: false,
        independent: false,
        errorClassifications: ["subtracted-instead-of-added"],
      }),
      makeRecord({
        correct: true,
        completed: true,
        independent: false,
        incorrectSubmissions: 2,
      }),
    ];
    const summary = evaluateSkillEvidence("add-within-20", records);
    expect(summary.classification).toBe("needs-support");
    expect(summary.detectedMisconceptions["subtracted-instead-of-added"]).toBe(2);

    const recs = buildParentRecommendations([summary]);
    expect(recs[0]?.skillId).toBe("add-within-20");
    expect(recs[0]?.reasonKey).toBe("parent.recommendReason.needsSupport");
  });

  it("marks legacy v1 saves honestly as legacy-unverified until new evidence is recorded", () => {
    const summary = evaluateSkillEvidence("add-within-20", [], { legacyAttempts: 6 });
    expect(summary.classification).toBe("legacy-unverified");
  });

  it("advances spaced review intervals [0, 1, 3, 7, 14] and handles clock drift & long absences safely", () => {
    expect(REVIEW_INTERVAL_DAYS).toEqual([0, 1, 3, 7, 14]);
    const t0 = new Date("2026-10-01T12:00:00.000Z");
    const s1 = advanceReviewSchedule(undefined, "add-within-20", true, t0);
    expect(s1.stageIndex).toBe(1);

    // Backwards local clock jump does not crash or produce NaN
    const backwards = new Date("2026-09-25T12:00:00.000Z");
    const s2 = advanceReviewSchedule(s1, "add-within-20", true, backwards);
    expect(s2.stageIndex).toBe(2);

    // Long absence (> 30 days) caps stage at 2 for gentle review refresh
    const s3 = advanceReviewSchedule(s2, "add-within-20", true, new Date("2026-11-15T12:00:00.000Z"));
    expect(s3.stageIndex).toBe(2);

    const due = getDueReviewSkills({ "add-within-20": s3 }, new Date("2026-11-20T12:00:00.000Z"));
    expect(due).toContain("add-within-20");
  });

  it("disables hints and advances calmly on wrong submissions during independent-check assessments", () => {
    const checkPlan: QuestPlan = {
      id: "starlight-check",
      objectiveIds: ["add-within-20", "unknown-number-equations"],
      assessmentMode: "independent-check",
      phases: [{ kind: "independent", count: 2 }],
    };
    const runner = new QuestRunner(checkPlan, {}, mulberry32(42));
    expect(runner.requestHint()).toBeNull();

    const first = runner.current!;
    const wrong = first.choices.find((c) => c !== first.correctAnswer)!;
    const res1 = runner.submit(wrong);
    // Advances without revealing the answer via Hint 3
    expect(res1).toMatchObject({ kind: "incorrect", assessmentTransitioned: true });
    expect(runner.recordedEvidence.some((r) => !r.correct && r.completed)).toBe(true);
  });
});
