# Curriculum Validation & Automated Quality Gates

This document describes the automated educational and content validation checks enforced by `src/learning/curriculumValidation.test.ts`, `src/learning/generators.test.ts`, `src/content/content.test.ts`, and `src/i18n/i18n.test.ts`.

---

## 1. Automated Invariants Verified on Every Build (`npm run check`)

1. **Standards Registry Integrity (`validateStandardsRegistry()`)**:
   - Every `StandardMapping` has a unique ID, official `https://` source URL, non-empty `skillsAddressed`, and non-empty `supportedTaskTypes`.
   - `1.OA.D.8` / `NC.1.OA.8` never maps to `star-patterns` (`1.NBT.A.1`).
2. **Skill Prerequisite Graph (`validateSkillGraph()`)**:
   - All 14 skills in `SKILLS_GRAPH` have valid prerequisites, zero circular dependencies (verified by DFS cycle detection), 5 learning stages, and at least 4 distinct item families.
3. **Bilingual Phonics Scope & Sequence (`validatePhonicsCurriculum()`)**:
   - Every word in `PHONICS_WORD_BANK` (`1..12`) reconstructs identically from its English (`enGraphemeTiles`) and Spanish (`esGraphemeTiles`) tiles and appears inside its decodable sentence.
   - Prerequisite units in `ENGLISH_PHONICS_UNITS` and `SPANISH_PHONICS_UNITS` are strictly ordered.
4. **Generator Property & Locale Verification (120+ Seeds × 4 Difficulties × 14 Objectives)**:
   - Every generated challenge has exactly 3 unique choices containing `correctAnswer`.
   - Every `promptKey`, `choiceKeyPrefix`, and `meta.passageKey` resolves to a non-empty string in **both** `src/i18n/locales/en-US.json` and `src/i18n/locales/es-US.json`.
5. **Assessment & Mastery Honesty**:
   - Hint 3 (`"guided-solution"`) attempts never increment `independentUnseenCorrect` or trigger `provisional-mastery`.
   - Listening comprehension (`modality: "listening"`) never inflates independent reading comprehension mastery.
   - Legacy v0/v1 saves without `evidenceLog` are classified as `"legacy-unverified"`.
   - Privacy invariant test (`src/storage/storage.test.ts`) verifies that `PlayerProgressSchema` contains only academic progress fields and zero PII.
