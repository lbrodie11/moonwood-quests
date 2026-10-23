# Privacy and data inventory

Moonwood Quests is directed at children aged six to seven. The game is built so
that it collects **no personal information**: there are no accounts, no
network calls, no identifiers, no analytics, no ads and no chat.

This document is the engineering data inventory. It is not legal advice and
not a public privacy policy; have child-privacy counsel review before any
change that would collect personal information, and before launch.

## What is stored, and where

All storage is `localStorage` in the player's own browser. Nothing is sent
anywhere.

| Key | Contents | Schema | Personal info? |
|---|---|---|---|
| `flg.progress.v1` | Unlocked/completed quest ids, reward/treasure ids, per-objective learning counts and next difficulty | `PlayerProgressSchema` in `src/storage/ProgressRepository.ts` | No |
| `flg.progress.v1.bak` | Last known-good backup copy of `flg.progress.v1` for corruption recovery (erased alongside primary save) | `PlayerProgressSchema` in `src/storage/ProgressRepository.ts` | No |
| `flg.settings.v1` | Language, sound, calm motion, narration | `SettingsSchema` in `src/app/settings.ts` | No |

Grown-ups can erase progress from the Grown-ups area (which removes both primary
and backup keys); clearing site data in the browser also removes everything.

## What is never collected

Names, ages, birthdays, email addresses, photos, voice, location, device or
advertising identifiers, cookies, IP-based logs from the app, free text, or
behavioural analytics.

## How this is enforced

| Mechanism | Where |
|---|---|
| ESLint bans `fetch`, XHR, WebSocket, `sendBeacon`, geolocation, media devices, cookies | `eslint.config.js` |
| Content Security Policy allows only same-origin resources | `vite.config.ts`, `public/_headers` |
| Permissions-Policy disables camera, microphone, geolocation | `public/_headers` |
| A unit test fails if a field is added to saved progress | `src/storage/storage.test.ts` |
| An E2E test fails on any third-party network request | `tests/e2e/quest.spec.ts` |
| Speech uses only on-device voices | `src/app/Narrator.ts` |
| Agent policy for any data-related change | `.agents/skills/coppa-data-minimization/SKILL.md` |

## Hosting

Static hosting providers may keep standard server access logs (including IP
addresses) outside the app. Review and minimise the host's logging and
retention settings before launch, and describe them in the public policy.

## Before adding cloud sync

Parent-owned accounts only; direct parental notice; verifiable parental consent
where required; parental access, export and deletion; written retention and
security policies; vendor review. The Grown-ups gate in the app is a UI guard
against accidental taps, **not** parental consent.
