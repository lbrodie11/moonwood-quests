---
name: fantasy-learning-design
description: Use when designing or changing any quest, challenge generator, hint, reward or difficulty rule in Moonwood Quests. Enforces that the learning action causes the game action, wrong answers teach rather than punish, and difficulty stays inside Grade 1 objectives.
---

# Fantasy learning design

This game teaches Grade 1 mathematics to six- and seven-year-olds through
fantasy mechanics. Apply these rules to every gameplay or content change.

## Core rule: the learning action causes the game action

The child's mathematical act must *be* the mechanic, not a gate in front of it.

- Good: combining 7 blue and 5 gold crystals is what wakes the rune.
- Bad: walk to a door → a worksheet question pops up → the door opens.

If a feature can be described as "answer a question, then the game continues",
redesign it.

## Curriculum map (do not widen without an educator review)

| Objective id         | Standard  | Mechanic         | Generator               |
|----------------------|-----------|------------------|-------------------------|
| `add-within-20`      | 1.OA.C.6  | spell crafting   | `createAddition`        |
| `subtract-within-20` | 1.OA.C.6  | spell crafting   | `createSubtraction`     |
| `tens-and-ones`      | 1.NBT.B.2 | rune inventory   | `createTensAndOnes`     |
| `compare-lengths`    | 1.MD.A.1  | bridge builder   | `createCompareLengths`  |
| `compose-shapes`     | 1.G.A.2   | ancient sigils   | `createComposeShapes`   |
| `phonics-words`      | RF.1.3    | story pages      | `createPhonicsWords`    |
| `star-patterns`      | 1.NBT.A.1 | star patterns    | `createStarPatterns`    |

Generators live in `src/learning/generators/` and must stay pure: they take a
`RandomSource` and a `Difficulty` and return data. No Phaser, no DOM, no clock.

## Quest pacing (design targets — validate with playtests)

A quest is ~10 minutes and 3–10 challenges, expressed as phases in quest JSON:

1. `guided` — 1–2 easy items, manipulatives with counting labels, capped at difficulty 1
2. `independent` — difficulty follows the mastery model
3. `mini-boss` — one varied application, with a `difficultyFloor`

## Wrong answers produce information, not punishment

Never: health loss, buzzers, timers, score deductions, "Wrong!" text.

The hint ladder (implemented in `QuestRunner` + `ForestQuestScene.showHint`):

1. **Hint 1** — rule out the chosen answer, show count-on labels on every object.
2. **Hint 2** — simplify the representation (e.g. one combined row to count).
3. The child can always retry; the challenge never changes underneath them.

Distractors should reflect real misconceptions (off-by-one counting, wrong
operation, swapped digits) — see `likelyErrors` in the generators.

## Difficulty and mastery

`src/learning/mastery.ts` is a deliberately simple reducer. Its thresholds in
`MASTERY_RULES` are design parameters, **not calibrated psychometrics**. Never
present them to parents as scores or grades. Changes to bands or thresholds
need an educator to review and a note in the PR explaining the evidence.

## Rewards

Allowed: in-world consequences (runes glow, gates open), companions, cosmetics,
restoring parts of the world.

Not allowed: loot boxes or random paid rewards, countdown offers, streaks that
can be lost, leaderboards, social comparison, ads, infinite reward feeds.

## Checklist for any gameplay PR

- [ ] The maths act causes the in-world effect
- [ ] Hint levels 1 and 2 are defined and teach something specific
- [ ] Generator has unit tests over many seeds (range, uniqueness, determinism)
- [ ] Content JSON validates (`npm test` runs `content.test.ts`)
- [ ] New strings exist in every locale; no text rendered into images
- [ ] A human played it at least once
