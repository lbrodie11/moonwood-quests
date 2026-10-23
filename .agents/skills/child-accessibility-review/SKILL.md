---
name: child-accessibility-review
description: Use when adding or reviewing any UI, scene, animation, sound or input handling in Moonwood Quests. Checks WCAG 2.2 AA plus stricter child-focused rules (large targets, pre-reader support, calm motion, canvas/DOM parity).
---

# Child accessibility review

Players are six or seven, many are pre-readers, and some use switch access,
screen readers or keyboards. WCAG 2.2 AA is the floor, not the target.

## Canvas / DOM parity (most important)

Canvas pixels are invisible to assistive technology. Therefore:

- Every answer control, menu, instruction and parent/privacy flow exists as
  **semantic DOM** in `#panel` (see `src/app/`).
- The canvas may *also* be tappable (map nodes, crystals) but must never be the
  only way to do something.
- State changes the canvas shows (correct, hint, quest complete) are announced
  through the bridge to the DOM (`role="status"` / `aria-live`).
- Scenes never render essential text. Numerals on counting labels are fine.

## Targets and layout

- Primary actions ≥ 64 CSS px; every control ≥ 48 px (`--tap-primary`, `--tap-min`).
- One visually dominant action at a time.
- Icon **plus** text, never icon alone. Emoji icons get `aria-hidden="true"`.
- Visible focus ring on everything (`:focus-visible` in `styles.css`) — never remove it.
- Must work at 390 px wide (phone portrait) and on a 768 px tablet.

## Pre-readers

- Every prompt is available aloud via the Narrator ("Hear it again").
- The Narrator uses **local voices only** — never network speech services.
- Prefer showing over telling: demonstrations, not paragraphs of instructions.

## Motion, sound, flashing

- Every tween goes through `animate()` in `src/game/systems/motion.ts`, which
  applies the end state instantly when Calm motion is on.
- Default Calm motion from `prefers-reduced-motion`.
- Nothing flashes more than 3 times per second.
- Sound is never the only feedback channel; Sound can be turned off.

## Colour

- No information by colour alone: blue mana is a diamond, gold mana is round;
  ruled-out answers are struck through and dashed; quest status has text.
- Text contrast ≥ 4.5:1 against its background.

## Input

- Keyboard, pointer, touch. No drag-only interactions without a tap alternative.
- No time limits on answers.
- Focus moves predictably: new challenge → first choice (only if the user was
  already in the choices); quest complete → "Back to the map".

## How to verify

1. `npm run test:e2e` (includes keyboard operation test).
2. Tab through the whole flow with no mouse.
3. Turn on a screen reader (VoiceOver / NVDA) and complete one quest.
4. Enable Calm motion and OS reduced motion; confirm nothing moves.
5. Consider adding `@axe-core/playwright` scans to the E2E suite.
