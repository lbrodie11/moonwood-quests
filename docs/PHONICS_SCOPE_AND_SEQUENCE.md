# Phonics & Structured Literacy Scope and Sequence (`en-US` & `es-US`)

Moonwood Quests implements **two prerequisite-ordered phonics progressions** (`src/learning/literacy/phonicsCurriculum.ts`) for English (`en-US`) and Spanish (`es-US`), paired with real-word minimal-pair distractors so children must attend to orthographic patterns rather than guessing from an emoji or word length.

> **Honest Scope Note**: All six phonics task families currently use a 3-choice word selection control (`1..3`) with visible Elkonin sound boxes (`▢ ▢ ▢`) rather than free-form drag-and-drop grapheme-tile construction.

---

## 1. Per-Mechanic Presentation & Narration Specification

Across all six mechanics:
- **Never shown while the question is active**: the target word itself, the word's emoji (`{{icon}}`), raw hyphenated phoneme strings (`C - A - T`), or the word-specific pronunciation guide (`audioEntry.ipa` and `audioEntry.parentPronunciationTip` ending in `-> cat`). Word-specific pronunciation notes are appended to the Grown-up tip **only after** a correct answer (`feedback.kind === "correct"`).
- **No false audio claims**: Prompts never say `"Listen"` or `"Escucha"` because Narrator is off by default.
- **When Narrator is ON (`spokenPromptText()`)**: Web Speech synthesis reads the prompt text (with visual `▢` box symbols stripped) and **never** utters the target word (`audioEntry.ttsSafeText`) or raw hyphenated letters before the child answers.

| Mechanic (`PhonicsMechanic`) | Prompt Key | Shown in DOM Prompt | Shown in DOM Equation & Canvas Stage | Spoken When Narrator Is ON (`spokenPromptText()`) | Choice Buttons (`choices: [1, 2, 3]` shuffled) |
|---|---|---|---|---|---|
| `sound-recognition` | `challenge.phonics.soundRecognition` | Elkonin boxes (`{{elkonin}}`), phoneme count (`{{soundCount}}`), and meaning context (`{{clue}}`). No emoji (`{{icon}}`). | DOM equation: `▢ ▢ ▢ = ?`<br>Canvas badge: `🔤`<br>Canvas Elkonin prop: `▢ ▢ ▢` (visible) | Prompt with `{{soundCount}}` and `{{clue}}` (visual `▢` boxes omitted; target word never spoken). | Target word + 2 real-word minimal-pair / near-miss distractors. |
| `sound-blending` | `challenge.phonics.soundMatch` | Elkonin boxes (`{{elkonin}}`), phoneme count (`{{soundCount}}`), and meaning context (`{{clue}}`). No emoji (`{{icon}}`). | DOM equation: `▢ ▢ ▢ = ?`<br>Canvas badge: `🔤`<br>Canvas Elkonin prop: `▢ ▢ ▢` (visible) | Prompt with `{{soundCount}}` and `{{clue}}` (target word never spoken). | Target word + 2 real-word minimal-pair / near-miss distractors. |
| `phoneme-segmentation` | `challenge.phonics.segmentWord` | Elkonin boxes (`{{elkonin}}`), phoneme count (`{{soundCount}}`), and meaning context (`{{clue}}`). No emoji (`{{icon}}`). | DOM equation: `▢ ▢ ▢ = ?`<br>Canvas badge: `🔤`<br>Canvas Elkonin prop: `▢ ▢ ▢` (visible) | Prompt with `{{soundCount}}` and `{{clue}}` (target word never spoken). | Target word + 2 real-word minimal-pair / near-miss distractors. |
| `word-building` | `challenge.phonics.buildWord` | Elkonin boxes (`{{elkonin}}`), phoneme count (`{{soundCount}}`), and meaning context (`{{clue}}`). No emoji (`{{icon}}`). | DOM equation: `▢ ▢ ▢ = ?`<br>Canvas badge: `🔤`<br>Canvas Elkonin prop: `▢ ▢ ▢` (visible) | Prompt with `{{soundCount}}` and `{{clue}}` (target word never spoken). | Target word + 2 real-word minimal-pair / near-miss distractors. |
| `decoding` | `challenge.phonics.storyClue` | Fill-in-the-blank sentence (`{{sentence}}`) **only** — no emoji (`{{icon}}`) and no meaning clue (`{{clue}}`). | DOM equation: `▢ ▢ ▢ = ?`<br>Canvas badge: `📜`<br>Canvas Elkonin prop: `▢ ▢ ▢` (visible) | Fill-in-the-blank sentence prompt only (target word never spoken). | Target word + 2 real-word minimal-pair / near-miss distractors. |
| `connected-reading` | `challenge.phonics.storySentence` | Connected-reading sentence (`{{sentence}}`) **only** — no emoji (`{{icon}}`) and no meaning clue (`{{clue}}`). | DOM equation: `▢ ▢ ▢ = ?`<br>Canvas badge: `📜`<br>Canvas Elkonin prop: `▢ ▢ ▢` (visible) | Connected-reading sentence prompt only (target word never spoken). | Target word + 2 real-word minimal-pair / near-miss distractors. |

---

## 2. English Scope & Sequence (`ENGLISH_PHONICS_UNITS`)

Pattern membership is enforced by `validatePhonicsCurriculum()` against each unit's `allowedPatterns`:

| Unit ID | Difficulty | Prerequisite | Allowed Patterns (`allowedPatterns`) | Taught Graphemes | Target Words (`wordIds`) | Real-Word Minimal-Pair Distractors |
|---|---|---|---|---|---|---|
| `unit-1-cvc` | 1 | None | `cvc-short-vowel` | `c, a, t, s, u, n, f, o, x, g, e, m` | `CAT` (10), `SUN` (11), `FOX` (9), `GEM` (8) | `CAT`: `COT`, `CAP`<br>`SUN`: `RUN`, `SAP`<br>`FOX`: `BOX`, `FIX`<br>`GEM`: `GUM`, `HEM` |
| `unit-2-blends-floss` | 2 | `unit-1-cvc` | `floss-or-digraph`, `consonant-blend` | `b, ll, fr, r` | `BELL` (12), `FROG` (4) | `BELL`: `BALL`, `BILL`<br>`FROG`: `FROM`, `FLAG` |
| `unit-3-vowel-teams` | 3 | `unit-2-blends-floss` | `vowel-team-or-diphthong` | `m, oo, tr, ee, k` | `MOON` (1), `TREE` (5), `BOOK` (6) | `MOON`: `SOON`, `NOON`<br>`TREE`: `FREE`, `MEET`<br>`BOOK`: `LOOK`, `BACK` |
| `unit-4-connected` | 4 | `unit-3-vowel-teams` | `r-controlled`, `vowel-team-or-diphthong` | `st, ar, ow, l, cr, n` | `STAR` (2), `OWL` (3), `CROWN` (7) | `STAR`: `SCAR`, `CART`<br>`OWL`: `HOWL`, `FOWL`<br>`CROWN`: `CLOWN`, `BROWN` |

---

## 3. Spanish Scope & Sequence (`SPANISH_PHONICS_UNITS`)

Spanish literacy progresses from open CV syllables and silent `h` (`es-silaba-abierta`, `es-hiato-h-muda`) to closed CVC syllables (`es-silaba-trabada-cvc`), true digraphs (`rr`, `ll` under `es-digrafo`), and consonant clusters / connected sentences (`br` under `es-grupo-consonantico`):

| Unit ID | Difficulty | Prerequisite | Allowed Patterns (`allowedPatterns`) | Taught Graphemes | Target Words (`wordIds`) | Real-Word Minimal-Pair Distractors |
|---|---|---|---|---|---|---|
| `es-unit-1-abiertas` | 1 | None | `es-silaba-abierta`, `es-hiato-h-muda` | `a, e, i, o, u, l, n, g, t, r, m, b, ú, h` | `LUNA` (1), `GATO` (10), `RANA` (4), `GEMA` (8), `BÚHO` (3) | `LUNA`: `CUNA`, `LUPA`<br>`GATO`: `PATO`, `GALO`<br>`RANA`: `RAMA`, `LANA`<br>`GEMA`: `YEMA`, `REMA`<br>`BÚHO`: `BUZO`, `CUBO` |
| `es-unit-2-trabadas` | 2 | `es-unit-1-abiertas` | `es-silaba-trabada-cvc` | `s, b, c, p, á` | `SOL` (11), `ÁRBOL` (5), `CAMPANA` (12) | `SOL`: `SAL`, `SUR`<br>`ÁRBOL`: `ARCO`, `FAROL`<br>`CAMPANA`: `VENTANA`, `CAMINO` |
| `es-unit-3-digrafos` | 3 | `es-unit-2-trabadas` | `es-digrafo` | `z, rr, tr, ll` | `ZORRO` (9), `ESTRELLA` (2) | `ZORRO`: `CORRO`, `GORRO`<br>`ESTRELLA`: `ESTELA`, `ESPUELA` |
| `es-unit-4-oraciones` | 4 | `es-unit-3-digrafos` | `es-grupo-consonantico`, `es-silaba-abierta` | `br, c` | `LIBRO` (6), `CORONA` (7) | `LIBRO`: `LIBRE`, `LITRO`<br>`CORONA`: `COLINA`, `CORO` |

---

## 4. Instructional Audio & Parent Pronunciation Architecture

Browser Web Speech API synthesizers read hyphenated strings like `"M - OO - N"` as letter names or punctuation rather than pure phonemes. To prevent both distorted phoneme modeling and premature answer leaks:
- `src/learning/literacy/audioRegistry.ts` (`PHONEME_AUDIO_REGISTRY`) stores IPA transcriptions and explicit `parentPronunciationTip` guidance.
- While a phonics question is active, `AccessibleChallengeUI.ts` displays only the general `parentPronunciationGuide` tip and omits `audioEntry.ipa`, `audioEntry.parentPronunciationTip`, and `audioEntry.ttsSafeText`. Once the child answers correctly (`feedback.kind === "correct"`), the word-specific IPA and pronunciation tip are revealed for grown-up modeling.
- English (`en-US`) and Spanish (`es-US`) phonics evidence records are evaluated separately in `evaluateSkillEvidence()`.
