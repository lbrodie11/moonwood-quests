# Educational Evidence & Honest Limitations — Moonwood Quests

This document summarizes what **Moonwood Quests** is designed to teach, what evidence its local progress engine captures, and what claims the game intentionally avoids.

---

## 1. Ten Core Developmental Pillars Supported

1. **Confident Independent Reading (`phonics-words`, `RF.1.2`, `RF.1.3`, `1.F.PWS`)**: Prerequisite-ordered English and Spanish phonics across 6 prompt mechanics (`sound-recognition`, `sound-blending`, `phoneme-segmentation`, `word-building`, `decoding`, `connected-reading`) with real-word minimal-pair distractors and Elkonin sound boxes (`▢ ▢ ▢`).
2. **Strong Foundational Mathematics (`add-within-20`, `subtract-within-20`, `unknown-number-equations`, `tens-and-ones`, `compare-lengths`, `compose-shapes`, `star-patterns`)**: Concrete-to-representational-to-abstract (CRA) progression across `1.OA.C.6`, `1.OA.D.8`, `1.NBT.B.2`, `1.MD.A.2`, `1.G.A.2`, and `1.NBT.A.1` with diagnostic misconception detection.
3. **Reading Comprehension (`reading-comprehension`, `RL.1.1`, `1.RC.L`)**: Original decodable and early-reader Moonwood stories (*Storykeeper Hollow*) assessing literal details, sequencing, cause/effect, and inference—with separate tracking for independent reading vs. audio narration.
4. **Vocabulary & Oral Language (`vocabulary-oral`, `L.1.5`)**: Contextual word meaning, category sorting, shades of meaning, and parent-assisted oral conversation prompts (*Creature Conversations*).
5. **Writing & Spelling (`spelling-writing`, `L.1.2`, `RF.1.3`)**: Word encoding choices, sentence word order, capitalization/punctuation conventions, and paper-and-pencil companion prompts (*The Rune Journal*).
6. **Logical Reasoning (`logical-reasoning`, `MP.1`)**: Clue elimination, multi-step path planning, and hypothesis testing (*The Wizard's Workshop*).
7. **Problem-Solving Strategies (`1.OA.B.3`, `1.OA.B.4`)**: Explicit make-ten, count-on, think-addition, and balance-scale equation strategies.
8. **Curiosity & Foundational Science (`science-nature`, `K-LS1-1`, `1-ESS1-2`)**: Living vs. nonliving things, animal habitats, plant survival needs, and explicitly distinguishing story magic from real-world science (*Naturekeeper Glade*).
9. **Creative Thinking (`creative-construction`, `1.G.A.2`, `MP.1`)**: Bridge, habitat, and tower design choices (*Moonwood Builder's Workshop*).
10. **Independent Learning & Metacognition**: Post-solution strategy reflection cards (*"What helped you solve that?"*) and calm, hint-free *Starlight Independent Checks*.

---

## 2. Mastery & Spaced-Review Integrity Rules

- **Provisional vs. Retained Mastery (`evaluateSkillEvidence`)**:
  - `provisional-mastery` requires at least 5 truly independent unseen successes (`85%` accuracy hypothesis) across $\ge 3$ task families and $\ge 2$ representations, without Hint 3 answer revelation (`guided-solution`).
  - `retained-mastery` additionally requires transfer evidence (`isTransfer: true`) **and** delayed-retention evidence (`hasDelayedRetentionEvidence: true`), which is only awarded when an item is served in a dedicated review slot (`isRetention: true`) at least `MIN_RETENTION_DELAY_HOURS` (default `20` hours) after the skill's most recent prior independent success.
- **Session-Gap Protection (`spacedReview.ts`)**:
  - Stage 0 (`0`-day interval after a supported attempt) means *"offer a review item next session"*, enforced via `MIN_SESSION_GAP_HOURS` (default `4` hours) before `getDueReviewSkills()` returns the skill.
  - Only dedicated review slots in `QuestRunner` receive `stage: "retention"`; guided warm-up items (`modeling` / `guided`) and transfer mini-boss items (`transfer`) keep their stages.

---

## 3. What Moonwood Quests Does NOT Claim

- **No IQ or "Smartest in Class" Claims**: Moonwood Quests never claims to raise IQ scores or rank a child against classmates.
- **Starting Heuristics, Not Clinical Cutoffs**: The provisional mastery threshold (`85%` accuracy across $\ge 5$ independent unseen items) and spaced-review intervals (`[0, 1, 3, 7, 14]` days) are documented engineering heuristics, not psychometric norms.
- **Multiple-Choice Interaction Scope**: Literary, reasoning, science, and workshop modes use structured 3-choice selection rather than free-form drag-and-drop construction or automated speech/handwriting grading.
