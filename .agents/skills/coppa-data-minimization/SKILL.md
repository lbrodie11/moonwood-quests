---
name: coppa-data-minimization
description: Use before adding any storage field, network request, third-party script or SDK, identifier, analytics, input field, account, media capture or deployment change in Moonwood Quests. The game is child-directed (ages 6–7) and local-only by design; this skill blocks changes that would collect children's personal information without a review.
---

# COPPA data minimisation

Moonwood Quests is **child-directed**. Under COPPA, personal information
includes persistent identifiers (IP addresses, device IDs, cookie IDs), images,
voice recordings, precise geolocation and free-text that could identify a
child. The MVP avoids all of it by architecture, not by policy text.

This is engineering guidance, not legal advice.

## Invariants — do not break without an explicit architecture review

1. **No network calls from the child experience.** No `fetch`, XHR, WebSocket,
   EventSource or `sendBeacon` in `src/`. ESLint enforces this
   (`no-restricted-globals` in `eslint.config.js`).
2. **No third-party scripts, SDKs, embeds, fonts or CDNs.** The CSP
   (`vite.config.ts`, `public/_headers`) only allows `'self'`.
3. **No identifiers.** No user IDs, device IDs, fingerprinting, cookies.
4. **No free-text from children.** No name fields, chat, search or notes.
5. **No camera, microphone, location or contacts.** (ESLint + Permissions-Policy.)
6. **No analytics, ads, attribution or crash-reporting SDKs.**
7. **Progress stays on the device.** `PlayerProgressSchema` has a fixed set of
   fields; `storage.test.ts` fails if a field is added without updating it.
8. **Speech synthesis uses local voices only** (`Narrator.ts`).

## If a change seems to need one of these

Stop and ask the human. Write down, in the PR description:

- What exactly would be collected or sent, and to whom
- Whether the product can be improved *without* collecting it (default: yes)
- Retention period and deletion path
- Whether verifiable parental consent would be required

Then the human decides, ideally with child-privacy counsel. Do not proceed on
an agent's judgement alone.

## Allowed without review

- New fields in `PlayerProgress` that are learning state (counts, ids of
  quests/rewards) — update the schema, the privacy test and `PRIVACY.md`.
- New device-local settings.
- Same-origin static assets.

## Future cloud sync (not in the MVP)

Only as a parent-owned account; children never type an email or password.
Implement `ProgressRepository`; never call the network from scenes. Requires
direct parental notice, verifiable consent where required, access/export/
delete controls, a written retention policy, a written security program and
vendor review. A UI "grown-up gate" (`ParentGate.ts`) is **not** consent.

## Verify

- `npm run lint` (network/identifier bans)
- `npm test` (`privacy invariant` test)
- E2E "makes no third-party network requests" test
