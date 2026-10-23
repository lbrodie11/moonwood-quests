import type { ChallengeSpec } from "../challenge";
import {
  ENGLISH_PHONICS_UNITS,
  PHONICS_WORD_BANK,
  SPANISH_PHONICS_UNITS,
  type PhonicsMechanic,
} from "../literacy/phonicsCurriculum";
import type { Difficulty } from "../objectives";
import { randomInt, type RandomSource } from "../random";
import { buildChoices } from "./choices";

/**
 * Storybook vocabulary & systematic phonics entries (RF.1.2 & RF.1.3).
 * IDs 1..12 map to localized words, phoneme/syllable breakdowns, icons, clues,
 * and decodable sentences in `src/i18n/locales/*.json` under `challenge.phonics.word.<id>.*`
 * and structured linguistic metadata in `PHONICS_WORD_BANK`.
 */
export const STORY_WORD_IDS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] as const;
export type StoryWordId = (typeof STORY_WORD_IDS)[number];

const PROMPT_KEY_BY_MECHANIC: Readonly<Record<PhonicsMechanic, string>> = {
  "sound-recognition": "challenge.phonics.soundRecognition",
  "sound-blending": "challenge.phonics.soundMatch",
  "phoneme-segmentation": "challenge.phonics.segmentWord",
  "word-building": "challenge.phonics.buildWord",
  decoding: "challenge.phonics.storyClue",
  "connected-reading": "challenge.phonics.storySentence",
};

/**
 * Enchanted Library (RF.1.2, RF.1.3, NC 2017 ELA RF.1.3, NC 2026 ELA 1.F.PWS):
 * Generates prerequisite-ordered phonics challenges across six distinct mechanics:
 * 1. `sound-recognition`: match spoken/target phoneme to grapheme/word
 * 2. `sound-blending`: blend isolated phonemes into a word
 * 3. `phoneme-segmentation`: segment a word into Elkonin phoneme boxes
 * 4. `word-building`: arrange grapheme tiles to encode the word
 * 5. `decoding`: read words using taught spelling patterns without picture giveaways
 * 6. `connected-reading`: read a decodable sentence and verify meaning
 */
export function createPhonicsWords(
  rng: RandomSource,
  difficulty: Difficulty,
  languageScope: "en" | "es" = "en",
): ChallengeSpec {
  const units = languageScope === "es" ? SPANISH_PHONICS_UNITS : ENGLISH_PHONICS_UNITS;
  const unit = units[difficulty - 1] ?? units[0]!;
  const pool = unit.wordIds;
  const wordId = pool[randomInt(rng, 0, pool.length - 1)] ?? 10;
  const mechanic =
    unit.mechanics[randomInt(rng, 0, unit.mechanics.length - 1)] ?? "sound-blending";
  const entry = PHONICS_WORD_BANK[wordId] ?? PHONICS_WORD_BANK[10]!;
  const promptKey = PROMPT_KEY_BY_MECHANIC[mechanic];

  // Choose phonetically plausible distractors from the same or prior units
  const distractor1 = ((wordId % 12) + 1) as StoryWordId;
  const distractor2 = (((wordId + 2) % 12) + 1) as StoryWordId;

  return {
    objectiveId: "phonics-words",
    difficulty,
    promptKey,
    operator: "phonics",
    operands: [wordId, difficulty],
    correctAnswer: wordId,
    choiceKeyPrefix: "challenge.phonics.word",
    choices: buildChoices(rng, wordId, {
      min: 1,
      max: 12,
      likelyErrors: [distractor1, distractor2],
    }),
    meta: {
      itemFamily: mechanic,
      standardCode:
        mechanic === "sound-recognition" ||
        mechanic === "sound-blending" ||
        mechanic === "phoneme-segmentation"
          ? "RF.1.2"
          : "RF.1.3",
      phonicsMechanic: mechanic,
      languageScope,
      targetBlueprint: `${unit.id}:${mechanic}:${languageScope === "es" ? entry.esWord : entry.enWord}`,
      parentGuideKey: "challenge.phonics.parentPronunciationGuide",
      distractorErrors: {
        [distractor1]: "vowel-or-initial-grapheme-confusion",
        [distractor2]: "blending-or-pattern-error",
      },
    },
  };
}
