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
- **Objective-Specific 3-Level Progressive Hint Ladder**:
  - Wrong answers never punish the child. Choice buttons are gently ruled out, and hints progress monotonically from an objective-specific strategy clue (Hint 1) to a visual counting/blending demonstration (Hint 2) to a guided step-by-step solution (Hint 3), also accessible anytime via **Ask friend for a hint**.
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

| Objective | Standard | Mechanic | Generator | Playable Quests |
|---|---|---|---|---|
| `add-within-20` | 1.OA.C.6 | `spell-crafting` | `createAddition` | `forest-gate`, `lantern-bridge`, `moss-grove`, `starfall-crown` |
| `subtract-within-20` | 1.OA.C.6 | `spell-crafting` | `createSubtraction` | `moss-grove`, `echo-forge`, `prism-sanctum` |
| `tens-and-ones` | 1.NBT.B.2 | `rune-inventory` | `createTensAndOnes` | `crystal-caves`, `prism-sanctum`, `starfall-crown` |
| `compare-lengths` | 1.MD.A.1 | `bridge-builder` | `createCompareLengths` | `ravine-bridge`, `living-storybook` |
| `compose-shapes` | 1.G.A.2 | `ancient-sigils` | `createComposeShapes` | `sigil-temple`, `starfall-crown` |
| `phonics-words` | RF.1.3 | `story-pages` | `createPhonicsWords` | `enchanted-library`, `living-storybook`, `starfall-crown` |
| `star-patterns` | 1.NBT.A.1 | `star-patterns` | `createStarPatterns` | `star-observatory`, `starfall-crown` |

## Budgets & Verification Status

| Metric | Target | Verified |
|---|---|---|
| First playable route | ≤ 3–5 MB compressed | ≈ 424 KB gzipped JS + 2.1 KB gzipped CSS |
| Primary controls | ≥ 64 CSS px (≥ 48 px secondary) | 80 px answer buttons, ≥ 48 px secondary buttons |
| Typecheck (`npm run typecheck`) | 0 errors | Pass (`tsc --noEmit`) |
| Lint (`npm run lint`) | 0 errors | Pass (`eslint .`) |
| Unit tests (`npm test`) | 100% pass | 57/57 passing (7 test files) |
| E2E tests (`npm run test:e2e`) | Chromium, Firefox, WebKit, Tablet | 48/48 passing (12 specs × 4 projects) |

See `PRIVACY.md` for the data inventory, `assets/ART_DIRECTION.md` for the visual
style guide, `assets/ATTRIBUTION.md` for asset provenance, and `AGENTS.md` for
coding-agent rules.
