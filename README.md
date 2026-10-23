# Moonwood Quests

A browser-first 2D fantasy learning adventure for ages six to seven. Children
help **Apprentice Aria** and **Pip the Owl** restore the fallen stars of Moonwood
across four illustrated regions—solving Grade 1 mathematics, early reading /
phonics, and skip-counting pattern quests with friendly creature companions.

Built on Phaser 4.2.1 + TypeScript + Vite 8 with a pure learning domain, an
accessible DOM shell synchronized with the Phaser canvas, bilingual English and
Spanish (`en-US` / `es-US`) support, and local-only progress with zero accounts,
ads, analytics, or network calls.

## Quick start

```bash
nvm use            # Node 24 (>= 22 works)
npm install
npm run dev        # http://localhost:5173
```

Add `?seed=42` to the URL to make every challenge reproducible.

| Script | What it does |
|---|---|
| `npm run dev` | Vite dev server with HMR |
| `npm run build` / `preview` | Production build (with CSP) / serve it on :4173 |
| `npm run typecheck` | `tsc --noEmit` for app and tooling configs |
| `npm run lint` | ESLint, including the privacy, DOM-boundary, and layering rules |
| `npm test` | Vitest unit tests: generators, mastery, quest runner, content, locales, storage |
| `npm run test:e2e` | Playwright: Chromium, Firefox, WebKit, iPad viewport |
| `npm run check` | typecheck + lint + test + build (what CI runs) |
| `npm run skills:install` | Installs the pinned game-dev agent skills (see `.agents/skills/README.md`) |

## What's playable

- **Story Banner & Exploratory World Map**:
  - Introductory story banner ("The Starlight of Moonwood") with "Begin/Continue Adventure".
  - Interactive World Map where Aria & Pip travel between 4 regions, talk to 5 friendly companion guides (**Pip the Owl**, **Moss the Forest Sprite**, **Bramble the Crystal Mole**, **Luma the Librarian Fox**, **Astra the Starlight Sprite**), and discover 4 optional **Star-Treasures**.
- **Four Complete Regions (12 Quests + Finale)**:
  1. **Whispering Woods** (*Guide: Moss the Forest Sprite*):
     - *The Whispering Gate* (`forest-gate`) — Addition within 20 (`add-within-20`).
     - *The Lantern Bridge* (`lantern-bridge`) — Addition within 20 (`add-within-20`).
     - *The Heartwood Tree* (`moss-grove`) — Addition & subtraction within 20 (`add-within-20`, `subtract-within-20`).
  2. **Crystal Caves** (*Guide: Bramble the Crystal Mole*):
     - *Crystal Caves* (`crystal-caves`) — Tens & ones place value (`tens-and-ones`).
     - *The Echo Minecart* (`echo-forge`) — Subtraction within 20 (`subtract-within-20`).
     - *The Prism Vault* (`prism-sanctum`) — Tens & ones and subtraction (`tens-and-ones`, `subtract-within-20`).
  3. **The Enchanted Library** (*Guide: Luma the Librarian Fox*):
     - *The Ravine Bridge* (`ravine-bridge`) — Length comparison (`compare-lengths`).
     - *The Enchanted Library* (`enchanted-library`) — Early reading & phonics decoding (`phonics-words`).
     - *The Living Storybook* (`living-storybook`) — Phonics decoding & length comparison (`phonics-words`, `compare-lengths`).
  4. **Starfall Tower** (*Guide: Astra the Starlight Sprite*):
     - *Sigil Temple* (`sigil-temple`) — Shape composition (`compose-shapes`).
     - *The Starlight Astrolabe* (`star-observatory`) — Skip-counting star sequences (`star-patterns`).
     - *The Crown of Moonwood* (`starfall-crown`) — Capstone synthesis (`star-patterns`, `add-within-20`, `tens-and-ones`, `phonics-words`, `compose-shapes`) + unlocks **The Grand Starlight Celebration** (`EndingScene`).
- **Eight Always-Open Regional Learning Sanctuaries & Workshops**:
  1. **Storykeeper Hollow** (`storykeeper-hollow`, Whispering Woods) — Reading comprehension (`reading-comprehension`, `RL.1.1`) with separate tracking for independent reading vs. audio listening.
  2. **Naturekeeper Glade** (`naturekeeper-glade`, Whispering Woods) — Science & nature (`science-nature`, `1-LS1-1`), distinguishing real science from story magic.
  3. **Alchemist's Equation Forge** (`equation-alchemy`, Crystal Caves) — Unknown-number equations in all positions (`unknown-number-equations`, `1.OA.D.8` / `NC.1.OA.8`).
  4. **Creature Conversations** (`creature-conversations`, Crystal Caves) — Vocabulary & parent-assisted oral language (`vocabulary-oral`, `L.1.5`).
  5. **The Rune Journal** (`rune-journal`, Enchanted Library) — Spelling, word encoding, sentence mechanics, and paper-and-pencil companion prompts (`spelling-writing`, `L.1.2`).
  6. **The Wizard's Workshop** (`wizards-workshop`, Enchanted Library) — Logical reasoning, clue elimination, and non-graded metacognitive reflection cards (`logical-reasoning`, `MP.1`).
  7. **Moonwood Builder's Workshop** (`moonwood-workshop`, Starfall Tower) — Constraint-based creative construction (`creative-construction`, `1.G.A.2`).
  8. **Starlight Independent Check** (`starlight-check`, Starfall Tower) — Calm, hint-free independent check across skills (`assessmentMode: "independent-check"`).
- **Objective-Specific 3-Level Progressive Hint Ladder**:
  - Wrong answers never punish the child. Choice buttons are gently ruled out, and hints progress monotonically from an objective-specific strategy clue (Hint 1) to a visual counting/blending demonstration (Hint 2) to a guided step-by-step solution (Hint 3), also accessible anytime via **Ask friend for a hint**. Hint 3 completions are recorded as assisted and never inflate independent mastery.
- **Settings**: sound, read-aloud (on-device voices only), calm motion, English / Español.
- **Grown-ups — Evidence & Learning Dashboard** (behind a ×-table gate): privacy statement, standards & learning stage summary (`CCSS` + `NC`), reading vs. listening modality count, confidence limitations disclosure, targeted offline parent-child activities, local JSON export, and two-step erase all progress.

## Architecture

```text
┌─ DOM shell (src/app) ─────────────────────────────────────────┐
│  toolbar · map explorer · AccessibleChallengeUI · dialogs     │
│                      ▲ typed events (src/game/bridge.ts)      │
│  ┌─ Phaser canvas (src/game) ───────────────────────────────┐ │
│  │  BootScene → WorldMapScene → ForestQuestScene            │ │
│  │                            → EndingScene                 │ │
│  └──────────────────────────────────────────────────────────┘ │
│                      ▲ asks for challenges, reports answers   │
│  Learning domain (src/learning)   ← no Phaser, no DOM         │
│    7 generators · mastery reducer · QuestRunner · seeded RNG  │
│  Content (src/content)            ← 12 Zod-validated quests   │
│  Storage (src/storage)            ← ProgressRepository (local)│
└───────────────────────────────────────────────────────────────┘
```

- **Scenes never own learning rules or DOM access.** `ForestQuestScene` asks
  `QuestRunner` for the current challenge, delegates region themes and
  per-operator manipulatives to `questRenderers.ts`, and communicates with the
  DOM shell exclusively via `GameBridge`.
- **Canvas/DOM parity.** Every quest node, guide, hidden treasure, answer, hint
  button, back-to-map button, ending celebration, and parent control is real DOM
  (`#panel`), so it works with screen readers, keyboards, and switch access.
- **Persistence with migration & backup recovery.** `LocalProgressRepository`
  migrates legacy v0 saves to v1 and maintains a `.bak` slot in `localStorage`
  to recover cleanly if primary JSON is corrupted.
- **Layering is enforced.** ESLint blocks `src/learning`, `src/content` and
  `src/storage` from importing Phaser or presentation code, blocks `src/game`
  from querying `document`, and bans network APIs everywhere in `src/`.

## Curriculum map

| Objective | Standard (CCSS / NC) | Mechanic | Generator | Playable Quests & Sanctuaries |
|---|---|---|---|---|
| `add-within-20` | `1.OA.C.6` / `NC.1.OA.6` | `spell-crafting` | `createAddition` | `forest-gate`, `lantern-bridge`, `moss-grove`, `starfall-crown` |
| `subtract-within-20` | `1.OA.C.6` / `NC.1.OA.6` | `spell-crafting` | `createSubtraction` | `moss-grove`, `echo-forge`, `prism-sanctum` |
| `unknown-number-equations` | `1.OA.D.8` / `NC.1.OA.8` | `equation-alchemy` | `createUnknownNumberEquations` | `equation-alchemy`, `starlight-check` |
| `tens-and-ones` | `1.NBT.B.2` / `NC.1.NBT.2` | `rune-inventory` | `createTensAndOnes` | `crystal-caves`, `prism-sanctum`, `starfall-crown` |
| `compare-lengths` | `1.MD.A.1` / `NC.1.MD.1` | `bridge-builder` | `createCompareLengths` | `ravine-bridge`, `living-storybook` |
| `compose-shapes` | `1.G.A.2` / `NC.1.G.2` | `ancient-sigils` | `createComposeShapes` | `sigil-temple`, `starfall-crown` |
| `phonics-words` | `RF.1.3` / `1.F.PWS` | `story-pages` | `createPhonicsWords` | `enchanted-library`, `living-storybook`, `starfall-crown` |
| `star-patterns` | `1.NBT.A.1` / `NC.1.NBT.1` | `star-patterns` | `createStarPatterns` | `star-observatory`, `starfall-crown` |
| `reading-comprehension` | `RL.1.1` / `1.RC.L` | `storykeeper` | `createReadingComprehension` | `storykeeper-hollow`, `starlight-check` |
| `vocabulary-oral` | `L.1.5` / `1.V` | `creature-dialogue` | `createVocabularyOral` | `creature-conversations` |
| `spelling-writing` | `L.1.2` / `1.W.C` | `rune-journal` | `createSpellingWriting` | `rune-journal` |
| `logical-reasoning` | `MP.1` / `NC.MP.1` | `wizards-workshop` | `createLogicalReasoning` | `wizards-workshop`, `starlight-check` |
| `science-nature` | `1-LS1-1` / `LS.1.1` | `naturekeeper` | `createScienceNature` | `naturekeeper-glade`, `starlight-check` |
| `creative-construction` | `1.G.A.2` / `NC.1.G.2` | `moonwood-workshop` | `createCreativeConstruction` | `moonwood-workshop` |

## Educator & Parent Documentation (`docs/`)

- [`docs/EDUCATIONAL_OVERHAUL.md`](docs/EDUCATIONAL_OVERHAUL.md) — Complete implementation checklist
- [`docs/STANDARDS_CROSSWALK.md`](docs/STANDARDS_CROSSWALK.md) — CCSS, NC Math, NC 2017 ELA (2026–27), NC 2026 ELA (2027–28), and NGSS/NC Science crosswalk
- [`docs/PHONICS_SCOPE_AND_SEQUENCE.md`](docs/PHONICS_SCOPE_AND_SEQUENCE.md) — Independent English and Spanish phonics scope & sequence and audio registry
- [`docs/MATH_LEARNING_PROGRESSION.md`](docs/MATH_LEARNING_PROGRESSION.md) — Grade 1 math progressions, equation structures, and misconception models
- [`docs/MASTERY_AND_ASSESSMENT.md`](docs/MASTERY_AND_ASSESSMENT.md) — Separation of skill, difficulty, and mastery, evidence rules, and spaced review
- [`docs/CURRICULUM_VALIDATION.md`](docs/CURRICULUM_VALIDATION.md) — Automated curriculum and locale validation suite
- [`docs/EDUCATIONAL_EVIDENCE.md`](docs/EDUCATIONAL_EVIDENCE.md) — Evidence summary and honest scope/limitations
- [`docs/PARENT_PLAYTEST_GUIDE.md`](docs/PARENT_PLAYTEST_GUIDE.md) — 20-minute parent/child playtest protocol

## Budgets & Verification Status

| Metric | Target | Verified |
|---|---|---|
| First playable route | ≤ 3–5 MB compressed | ≈ 457 KB gzipped JS + 2.4 KB gzipped CSS |
| Primary controls | ≥ 64 CSS px (≥ 48 px secondary) | 80 px answer buttons, ≥ 48 px secondary buttons |
| Typecheck (`npm run typecheck`) | 0 errors | Pass (`tsc --noEmit`) |
| Lint (`npm run lint`) | 0 errors | Pass (`eslint .`) |
| Unit tests (`npm test`) | 100% pass | 74/74 passing (8 test files) |
| E2E tests (`npm run test:e2e`) | Chromium, Firefox, WebKit, Tablet | 52/52 passing (13 specs × 4 projects) |

See `PRIVACY.md` for the data inventory, `assets/ART_DIRECTION.md` for the visual
style guide, `assets/ATTRIBUTION.md` for asset provenance, and `AGENTS.md` for
coding-agent rules.
