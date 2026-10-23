# Mastery, Assessment & Spaced Review Architecture

This document explains how **Moonwood Quests** separates **Skill**, **Difficulty**, and **Mastery** (`src/learning/assessment/evidence.ts`, `src/learning/adaptation/spacedReview.ts`, and `src/learning/session.ts`).

---

## 1. Three Distinct Constructs

1. **Skill (`ObjectiveId`)**: One of the 14 curriculum skills in `SKILLS_GRAPH` (`src/learning/curriculum/skills.ts`), each with explicit prerequisites, 5 learning stages, and 4–6 task families.
2. **Difficulty (`1 | 2 | 3 | 4`)**: Within-skill complexity parameter controlling number ranges, equation structures, and representational scaffolding.
3. **Mastery (`MasteryClassification`)**: Evidence-based classification computed from structured `EvidenceRecord` entries:
   - `not-started`
   - `legacy-unverified` (migrated from v0/v1 save without item-level evidence)
   - `introduced` (< 3 completed attempts)
   - `needs-support` (repeated misconception tag $\ge 2$ with independent accuracy $< 0.85$)
   - `practicing` (active learning, building family/representation breadth)
   - `provisional-mastery` ($\ge 5$ independent unseen attempts, $\ge 85\%$ accuracy hypothesis, $\ge 3$ task families, $\ge 2$ representations)
   - `retained-mastery` (`provisional-mastery` + verified transfer item + verified delayed-retention check)

---

## 2. Five Learning Stages (`LearningStage`)

1. **`modeling`**: Concrete manipulatives (`objects`), guided introduction.
2. **`guided`**: Interactive practice with progressive hints available.
3. **`independent`**: Unassisted problem solving across varied task families.
4. **`transfer`**: Applying the skill in a novel context or mixed-objective challenge (`isTransfer: true`).
5. **`retention`**: Solving an unseen item during a spaced-review return (`isRetention: true`).

---

## 3. Strict Independence & Modality Rules

- **Hint 3 Answer Revelation Never Counts as Mastery**:
  - Requesting or triggering Hint 3 (`"guided-solution"`) teaches the child how to complete the step, marks `independent: false`, and increments `supportedSuccesses` (never `independentSuccesses`).
- **Intermediate Wrong Submissions Are Recorded Immediately**:
  - Every wrong answer creates an `EvidenceRecord` with `completed: false`, `correct: false`, and diagnostic `errorClassifications` even if the child leaves the quest before finishing.
- **Reading vs. Listening Modality Separation**:
  - In `reading-comprehension`, tapping **Listen to story aloud** sets `modality: "listening"`. Listening completions increment `listeningOnlyCount` and **never** count toward independent reading comprehension mastery.
- **Language-Separated Phonics Mastery**:
  - `phonics-words` evidence is filtered by `locale` (`"en-US"` vs. `"es-US"`) so English and Spanish decoding are tracked independently.

---

## 4. Spaced Review Heuristics (`REVIEW_INTERVAL_DAYS`)

- **Intervals**: `[0, 1, 3, 7, 14]` days (`src/learning/adaptation/spacedReview.ts`).
- **Gentle Adaptation**:
  - Assisted or incorrect attempts step back by 1 interval (`Math.max(0, stage - 1)`) rather than punitively resetting to 0.
  - Absences longer than 30 days cap the next interval at Stage 2 (`3` days) for a gentle refresher.
  - Backward local system clock jumps are guarded via `Math.max(0, nowMs - prevMs)`.
