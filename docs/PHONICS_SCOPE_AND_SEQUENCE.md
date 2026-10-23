# Phonics & Structured Literacy Scope and Sequence (`en-US` & `es-US`)

Moonwood Quests implements **two linguistically authentic, prerequisite-ordered phonics progressions** (`src/learning/literacy/phonicsCurriculum.ts`) rather than translating an English phonics sequence word-for-word into Spanish.

---

## 1. Six Structured Literacy Mechanics

Every phonics unit progresses across six instructional task families (`PhonicsMechanic`):

1. **`sound-recognition`**: Identifying initial, medial, or final phonemes/syllables in target words.
2. **`sound-blending`**: Blending segmented phonemes (`/k/ - /ă/ - /t/`) or syllables (`GA - TO`) into a spoken and written word.
3. **`phoneme-segmentation`**: Counting and ordering the individual phonemes or syllables that compose a word.
4. **`word-building`**: Constructing words from grapheme tiles (`C` + `A` + `T`, `F` + `R` + `O` + `G`, `B` + `E` + `LL`).
5. **`decoding`**: Reading target words without picture giveaways so children must attend to orthographic patterns rather than guessing from an emoji.
6. **`connected-reading`**: Reading a decodable sentence (`"The cat sat on a mat."` / `"La rana salta en la laguna."`) and selecting the word that completes the meaning.

---

## 2. English Scope & Sequence (`ENGLISH_PHONICS_UNITS`)

| Unit ID | Difficulty | Prerequisite | Focus Patterns & Graphemes | Target Decodable Words | High-Frequency "Heart Words" |
|---|---|---|---|---|---|
| `unit-1-cvc` | 1 | None | Short-vowel CVC words (`c, a, t, s, u, n, f, o, x, g, e, m`) | `CAT` (10), `SUN` (11), `FOX` (9), `GEM` (8) | `the, a, is, in, on` |
| `unit-2-blends-floss` | 2 | `unit-1-cvc` | Initial consonant blends (`fr, st`), FLOSS double consonants (`ll`), r-controlled (`ar`) | `BELL` (12), `FROG` (4), `STAR` (2) + spiral review | `to, at` |
| `unit-3-vowel-teams` | 3 | `unit-2-blends-floss` | Common vowel teams (`oo` as in *moon* and *book*, `ee` as in *tree*) | `MOON` (1), `TREE` (5), `BOOK` (6) + spiral review | `by, over` |
| `unit-4-connected` | 4 | `unit-3-vowel-teams` | Diphthongs (`ow` as in *owl* and *crown*) & connected decodable sentences | `OWL` (3), `CROWN` (7) + cumulative review | `said` |

---

## 3. Spanish Scope & Sequence (`SPANISH_PHONICS_UNITS`)

Spanish literacy begins with the five vowels (`a, e, i, o, u`) and open CV syllables (*sílabas directas abiertas*) before closed CVC syllables (*sílabas trabadas*), digraphs (`rr, ll, h muda`), and consonant clusters (`br, tr`).

| Unit ID | Difficulty | Prerequisite | Focus Patterns & Graphemes | Target Words & Syllables | Oraciones Decodificables |
|---|---|---|---|---|---|
| `es-unit-1-abiertas` | 1 | None | Vocales (`a, e, i, o, u`) y sílabas directas abiertas (`CV`) | `LUNA` (`LU-NA`), `GATO` (`GA-TO`), `RANA` (`RA-NA`), `GEMA` (`GE-MA`) | *La luna sale en la noche.* |
| `es-unit-2-trabadas` | 2 | `es-unit-1-abiertas` | Sílabas trabadas (`CVC`) y palabras multisilábicas | `SOL` (`SOL`), `ÁRBOL` (`ÁR-BOL`), `CAMPANA` (`CAM-PA-NA`) | *El sol sale en la mañana.* |
| `es-unit-3-digrafos` | 3 | `es-unit-2-trabadas` | Dígrafos (`rr`, `h` muda) y grupo consonántico (`br`) | `ZORRO` (`ZO-RRO`), `BÚHO` (`BÚ-HO`), `LIBRO` (`LI-BRO`) | *El búho sabio mira el bosque.* |
| `es-unit-4-oraciones` | 4 | `es-unit-3-digrafos` | Grupos consonánticos (`tr`), dígrafo (`ll`) y lectura conectada | `ESTRELLA` (`ES-TRE-LLA`), `CORONA` (`CO-RO-NA`) | *Una estrella ilumina la torre.* |

---

## 4. Instructional Audio & Parent Pronunciation Architecture

Browser Web Speech API synthesizers read hyphenated strings like `"M - OO - N"` as letter names or punctuation rather than pure phonemes. To prevent distorted phoneme modeling:
- `src/learning/literacy/audioRegistry.ts` (`PHONEME_AUDIO_REGISTRY`) provides `ttsSafeText` for whole-word/sentence narration alongside IPA transcriptions and explicit `parentPronunciationTip` guidance (modeling continuous sounds without adding an `"uh"` schwa to stop consonants).
- English and Spanish phonics evidence records carry `locale: "en-US" | "es-US"` and are evaluated **separately** in `evaluateSkillEvidence()` so mastery in one language never inflates or masks progress in the other.
