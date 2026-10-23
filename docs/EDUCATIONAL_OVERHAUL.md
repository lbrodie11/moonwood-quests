# ARGON — Moonwood Quests Educational Excellence Overhaul Checklist

## Phase 0 — Baseline Audit & Regression Baseline
- [x] Inspect repository architecture (`src/learning`, `src/content`, `src/storage`, `src/game`, `src/app`, `src/i18n`, `tests/e2e`).
- [x] Verify baseline checks (`npm run check` and `npm run test:e2e`).
- [x] Document initial instructional audit findings (conflated `1.OA.D.8` standard on `star-patterns`, single-step phonics word matching, lack of structured item-level evidence log, lack of reading comprehension/vocabulary/spelling/reasoning/science/workshop modes).

## Phase 1 — Versioned Standards Crosswalk (`src/learning/curriculum/standards.ts`)
- [x] Map Common Core Grade 1 Math (`1.OA.*`, `1.NBT.*`, `1.MD.*`, `1.G.*`, `MP.1`) and ELA (`RF.1.*`, `RL.1.*`, `L.1.*`).
- [x] Map North Carolina Grade 1 Math (`NC.1.OA.*`, `NC.1.NBT.*`, `NC.1.MD.*`, `NC.1.G.*`).
- [x] Map both North Carolina 2017 ELA (effective 2026–27) and North Carolina 2026 ELA (effective 2027–28).
- [x] Map NGSS / NC Early Elementary Science (`K-LS1-1`, `1-LS1-1`, `1-ESS1-1`, `1-ESS1-2`, `2-PS1-2`, `LS.1.1`).
- [x] Enforce honest `coverageLevel` (`full` | `partial` | `enrichment`), `reviewStatus` (`requires-educator-review` | `requires-bilingual-review`), and `validateStandardsRegistry()`.

## Phase 2 — Systematic Bilingual Phonics & Audio Registry
- [x] Build prerequisite-ordered English (`ENGLISH_PHONICS_UNITS`) and Spanish (`SPANISH_PHONICS_UNITS`) scope-and-sequence units in `src/learning/literacy/phonicsCurriculum.ts` with strict unit-to-word membership validation.
- [x] Support all 6 phonics mechanics (`sound-recognition`, `sound-blending`, `phoneme-segmentation`, `word-building`, `decoding`, `connected-reading`) with 6 distinct instructional prompt templates.
- [x] Wire typed instructional audio & parent pronunciation registry (`src/learning/literacy/audioRegistry.ts`) into `AccessibleChallengeUI.ts` so Web Speech TTS reads `ttsSafeText` and never utters raw hyphenated phoneme strings aloud.
- [x] Track English (`en-US`) and Spanish (`es-US`) phonics evidence separately.

## Phase 3 — Learning Progression, Evidence Engine & Spaced Review
- [x] Separate **Skill** (`SKILLS_GRAPH`), **Difficulty** (`1..4`), and **Mastery** (`MasteryClassification`) across 5 learning stages (`modeling`, `guided`, `independent`, `transfer`, `retention`).
- [x] Record structured `EvidenceRecord` entries for both intermediate wrong submissions and completed challenges (`src/learning/assessment/evidence.ts`) without double-counting misconception tags.
- [x] Ensure Hint 3 answer revelation (`guided-solution`) never counts as independent mastery.
- [x] Implement spaced review (`REVIEW_INTERVAL_DAYS = [0, 1, 3, 7, 14]`) with same-day repeat protection, clock-drift safety, and long-absence protection (`src/learning/adaptation/spacedReview.ts`), wired into `ForestQuestScene.ts` for `delayed-retention` checks.
- [x] Implement hint-free `independent-check` and `delayed-retention` assessment modes (`Starlight Independent Check`).

## Phase 4 — Deepened Mathematics Curriculum
- [x] Separate `unknown-number-equations` (`1.OA.D.8` / `NC.1.OA.8`) from `star-patterns` (`1.NBT.A.1` / `NC.1.NBT.1`) with all 4 equation structures (`a + ? = c`, `? + b = c`, `c - ? = a`, `a = ? - b`).
- [x] Tag addition, subtraction, place-value, measurement, and geometry items with problem-structure item families and diagnostic distractor error classifications.

## Phases 5–10 & 12 — Six New Integrated Fantasy Learning Modes & Sanctuaries
- [x] **Storykeeper Hollow** (`reading-comprehension`, question-specific distractors, separate `independent-reading` vs. `listening` tracking).
- [x] **Creature Conversations** (`vocabulary-oral`, receptive categorization/context with question-specific distractors + parent-assisted oral prompts).
- [x] **The Rune Journal** (`spelling-writing`, non-answer-revealing orthographic & sentence-order choices, capitalization/punctuation mechanics, paper-and-pencil companion prompt).
- [x] **The Wizard's Workshop** (`logical-reasoning`, clue elimination, multi-step planning, post-attempt strategy reflection cards).
- [x] **Naturekeeper Glade** (`science-nature`, living vs. nonliving, habitats, plant needs, real science vs. story magic).
- [x] **Moonwood Builder's Workshop** (`creative-construction`, constraint-based bridge, habitat, and tower design).
- [x] **Alchemist's Equation Forge** (`unknown-number-equations`) & **Starlight Independent Check** (`starlight-check`).

## Phases 11 & 13 — Versioned Storage Migration & Trustworthy Parent Dashboard
- [x] Upgrade `PlayerProgressSchema` to `schemaVersion: 2` with per-skill pruned `evidenceLog` (`pruneEvidenceLogBySkill`), `reviewSchedule`, `seenItemSignatures`, `placedSkills`, and `legacyMigratedFromV1` honesty flag (`src/storage/ProgressRepository.ts`, `src/storage/LocalProgressRepository.ts`).
- [x] Upgrade `ParentGate.ts` with standards/stage/status breakdown, sample-size warnings, reading vs. listening modality count, confidence limitations disclosure, targeted offline parent-child activities, and local JSON file download (`moonwood-learning-report.json`).

## Phases 14–17 — Automated Validation, Cross-Browser E2E & Documentation
- [x] Automated curriculum validation suite (`src/learning/curriculumValidation.test.ts` — 22/22 passing; 79/79 total unit tests passing).
- [x] Cross-browser Playwright E2E suite (`tests/e2e/quest.spec.ts` across `chromium`, `firefox`, `webkit`, and `tablet-landscape`).
- [x] Complete educator & parent documentation in `docs/`.
