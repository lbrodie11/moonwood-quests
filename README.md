# Moonwood Quests

A browser-first 2D fantasy learning adventure for ages six to seven. Children
help **Apprentice Aria** and her owl **Pip** restore the fallen stars of Moonwood
across four illustrated regions—solving Grade 1 mathematics, early reading /
phonics, and logic pattern quests with friendly creature companions.

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
| `npm run lint` | ESLint, including the privacy and layering rules |
| `npm test` | Vitest unit tests: generators, mastery, quest runner, content, locales, storage |
| `npm run test:e2e` | Playwright: Chromium, Firefox, WebKit, iPad viewport |
| `npm run check` | typecheck + lint + test + build (what CI runs) |
| `npm run skills:install` | Installs the pinned game-dev agent skills (see `.agents/skills/README.md`) |

## What's playable

- **Story Banner & Exploratory World Map**:
  - Introductory story banner ("The Night the Stars Fell") with "Continue Adventure".
  - Interactive World Map where Aria & Pip travel between 4 regions, talk to 5 friendly companion guides (**Moss**, **Glimmer**, **Barnaby**, **Lumi**, **Astra**), and discover 4 optional **Star-Treasures**.
- **Four Complete Regions (12 Quests + Finale)**:
  1. **Whispering Woods** (*Guide: Moss the Forest Sprite*):
     - *The Whispering Gate* (`forest-gate`) — Addition within 20 (`add-within-20`).
     - *The Lantern Bridge* (`lantern-bridge`) — Addition within 20 (`add-within-20`).
     - *The Dewdrop Grove* (`moss-grove`) — Subtraction within 20 (`subtract-within-20`).
  2. **Crystal Caves** (*Guide: Glimmer the Crystal Fox*):
     - *The Crystal Caves* (`crystal-caves`) — Tens & ones place value (`tens-and-ones`).
     - *The Echo Forge* (`echo-forge`) — Subtraction within 20 (`subtract-within-20`).
     - *The Prism Sanctum* (`prism-sanctum`) — Tens & ones place value (`tens-and-ones`).
  3. **The Enchanted Library** (*Guides: Barnaby the Badger & Lumi the Moth*):
     - *The Ravine Bridge* (`ravine-bridge`) — Length comparison (`compare-lengths`).
     - *The Enchanted Library* (`enchanted-library`) — Addition & subtraction fluency (`add-within-20`).
     - *The Living Storybook* (`living-storybook`) — Early reading, phonics & bilingual picture-words (`phonics-words`).
  4. **Starfall Tower** (*Guide: Astra the Star-Weaver*):
     - *The Sigil Temple* (`sigil-temple`) — Shape composition (`compose-shapes`).
     - *The Star Observatory* (`star-observatory`) — Star sequence & pattern completion (`star-patterns`).
     - *The Crown of Starfall* (`starfall-crown`) — Capstone synthesis (`tens-and-ones`) + unlocks the **Grand Starlight Celebration** (`EndingScene`).
- **3-Level Progressive Hint Ladder**:
  - Wrong answers never punish the child. Choice buttons are gently ruled out, and hints progress from a conceptual strategy (Hint 1) to visual counting/grouping (Hint 2) to a step-by-step guided solution (Hint 3), also accessible anytime via the **Ask for a hint** button.
- **Settings**: sound, read-aloud (on-device voices only), calm motion, English / Español.
- **Grown-ups area** (behind a ×-table gate): privacy statement, learning summary across all 7 curriculum objectives, and two-step erase all progress.

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

- **Scenes never own learning rules.** `ForestQuestScene` asks `QuestRunner`
  for the current challenge, renders its region-themed visuals and props, and
  forwards answers from the DOM or canvas.
- **Canvas/DOM parity.** Every quest node, guide, hidden treasure, answer, hint
  button, menu, ending celebration, and parent control is real DOM (`#panel`),
  so it works with screen readers, keyboards, and switch access.
- **Persistence with migration & backup recovery.** `LocalProgressRepository`
  migrates legacy v0 saves to v1 and maintains a `.bak` slot in `localStorage`
  to recover cleanly if primary JSON is corrupted.
- **Layering is enforced.** ESLint blocks `src/learning`, `src/content` and
  `src/storage` from importing Phaser or presentation code, and bans network
  APIs everywhere in `src/`.

## Curriculum map

| Objective | Standard | Mechanic | Playable Quests |
|---|---|---|---|
| `add-within-20` | CCSS.MATH.1.OA.C.6 | `spell-crafting` | `forest-gate`, `lantern-bridge`, `enchanted-library` |
| `subtract-within-20` | CCSS.MATH.1.OA.C.6 | `spell-crafting` | `moss-grove`, `echo-forge` |
| `tens-and-ones` | CCSS.MATH.1.NBT.B.2 | `rune-inventory` | `crystal-caves`, `prism-sanctum`, `starfall-crown` |
| `compare-lengths` | CCSS.MATH.1.MD.A.1 | `bridge-builder` | `ravine-bridge` |
| `compose-shapes` | CCSS.MATH.1.G.A.2 | `ancient-sigils` | `sigil-temple` |
| `phonics-words` | CCSS.ELA-LITERACY.RF.1.3 | `story-pages` | `living-storybook` |
| `star-patterns` | CCSS.MATH.1.OA.D.8 | `star-sequence` | `star-observatory` |

## Budgets & Verification Status

| Metric | Target | Verified |
|---|---|---|
| First playable route | ≤ 3–5 MB compressed | ≈ 423 KB gzipped JS + 2.08 KB gzipped CSS |
| Primary controls | ≥ 64 CSS px (≥ 48 px secondary) | 80 px answer buttons, ≥ 48 px secondary buttons |
| Typecheck (`npm run typecheck`) | 0 errors | Pass (`tsc --noEmit`) |
| Lint (`npm run lint`) | 0 errors | Pass (`eslint .`) |
| Unit tests (`npm test`) | 100% pass | 53/53 passing (7 test files) |
| E2E tests (`npm run test:e2e`) | Chromium, Firefox, WebKit, Tablet | 44/44 passing (11 specs × 4 projects) |

See `PRIVACY.md` for the data inventory, `assets/ART_DIRECTION.md` for the visual
style guide, `assets/ATTRIBUTION.md` for asset provenance, and `AGENTS.md` for
coding-agent rules.
