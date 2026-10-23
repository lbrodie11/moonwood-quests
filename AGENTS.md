# Agent instructions

You are working on **Moonwood Quests**, a browser-first 2D fantasy maths game
for children aged 6–7 (Phaser 4 + TypeScript + Vite). Read `README.md` for
the architecture.

## Load the right skill first

| If the task touches… | Read |
|---|---|
| quests, generators, hints, rewards, difficulty | `.agents/skills/fantasy-learning-design/SKILL.md` |
| any UI, scene, animation, sound or input | `.agents/skills/child-accessibility-review/SKILL.md` |
| storage, network, identifiers, SDKs, inputs, deployment | `.agents/skills/coppa-data-minimization/SKILL.md` |
| art, audio, fonts, models | `.agents/skills/asset-license-audit/SKILL.md` |

Installed third-party skills (`npm run skills:install`) are general advice;
the project skills above win when they disagree.

## Hard rules

- `src/learning`, `src/content` and `src/storage` must not import Phaser, DOM or
  presentation code. Scenes ask the domain for challenges and render results.
- No network calls, identifiers, third-party scripts or free-text input from
  children. Ask the human before changing this.
- Every UI string goes in **both** `src/i18n/locales/*.json`. Never put text in images.
- Every tween goes through `animate()` so Calm motion works.
- Don't remove the focus ring or shrink controls below 48 px (64 px for primary).

## Workflow

1. Plan, and write or extend tests first (Vitest for domain, Playwright for flows).
2. Make a small change.
3. Run `npm run check`, then `npm run test:e2e`.
4. Say what a human should play-test; compiling is not validation for a game.

Use `?seed=<n>` for reproducible challenges when debugging.
