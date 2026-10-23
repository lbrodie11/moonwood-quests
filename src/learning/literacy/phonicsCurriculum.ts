import type { Difficulty } from "../objectives";

export type PhonicsMechanic =
  | "sound-recognition"
  | "sound-blending"
  | "phoneme-segmentation"
  | "word-building"
  | "decoding"
  | "connected-reading";

export type PhonicsPatternCategory =
  | "cvc-short-vowel"
  | "floss-or-digraph"
  | "consonant-blend"
  | "vowel-team-or-diphthong"
  | "r-controlled"
  | "es-silaba-abierta"
  | "es-silaba-trabada-cvc"
  | "es-hiato-h-muda"
  | "es-grupo-consonantico-digrafo";

export interface PhonicsWordEntry {
  wordId: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
  enWord: string;
  enPhonemes: readonly string[];
  enGraphemeTiles: readonly string[];
  enPattern: PhonicsPatternCategory;
  enLessonUnit: "unit-1-cvc" | "unit-2-blends-floss" | "unit-3-vowel-teams" | "unit-4-connected";
  enDecodableSentence: string;
  esWord: string;
  esSyllables: readonly string[];
  esPhonemes: readonly string[];
  esGraphemeTiles: readonly string[];
  esPattern: PhonicsPatternCategory;
  esLessonUnit: "es-unit-1-abiertas" | "es-unit-2-trabadas" | "es-unit-3-digrafos" | "es-unit-4-oraciones";
  esDecodableSentence: string;
}

export interface PhonicsLessonUnit {
  id: string;
  locale: "en" | "es";
  title: string;
  prerequisites: readonly string[];
  difficulty: Difficulty;
  taughtGraphemes: readonly string[];
  heartWords: readonly string[];
  wordIds: readonly (1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12)[];
  mechanics: readonly PhonicsMechanic[];
}

/**
 * Complete bilingual word & pattern bank for Story Word IDs 1..12.
 * Notice how English and Spanish follow their own linguistic structures:
 * - English progresses from transparent 3-sound CVC words (`CAT`, `SUN`, `FOX`, `GEM`)
 *   to FLOSS/blends (`BELL`, `FROG`, `STAR`) and vowel teams/diphthongs (`MOON`, `TREE`, `BOOK`, `OWL`, `CROWN`).
 * - Spanish progresses from open CV syllables (`LUNA`, `GATO`, `RANA`, `GEMA`, `CORONA`)
 *   to CVC/closed syllables (`SOL`, `ÁRBOL`, `CAMPANA`) and digraphs/clusters (`ZORRO`, `BÚHO`, `LIBRO`, `ESTRELLA`).
 */
export const PHONICS_WORD_BANK: Readonly<Record<number, PhonicsWordEntry>> = {
  10: {
    wordId: 10,
    enWord: "CAT",
    enPhonemes: ["/k/", "/ă/", "/t/"],
    enGraphemeTiles: ["C", "A", "T"],
    enPattern: "cvc-short-vowel",
    enLessonUnit: "unit-1-cvc",
    enDecodableSentence: "The cat sat on a mat.",
    esWord: "GATO",
    esSyllables: ["GA", "TO"],
    esPhonemes: ["/g/", "/a/", "/t/", "/o/"],
    esGraphemeTiles: ["G", "A", "T", "O"],
    esPattern: "es-silaba-abierta",
    esLessonUnit: "es-unit-1-abiertas",
    esDecodableSentence: "El gato salta en la loma.",
  },
  11: {
    wordId: 11,
    enWord: "SUN",
    enPhonemes: ["/s/", "/ŭ/", "/n/"],
    enGraphemeTiles: ["S", "U", "N"],
    enPattern: "cvc-short-vowel",
    enLessonUnit: "unit-1-cvc",
    enDecodableSentence: "The warm sun is up.",
    esWord: "SOL",
    esSyllables: ["SOL"],
    esPhonemes: ["/s/", "/o/", "/l/"],
    esGraphemeTiles: ["S", "O", "L"],
    esPattern: "es-silaba-trabada-cvc",
    esLessonUnit: "es-unit-2-trabadas",
    esDecodableSentence: "El sol sale en la mañana.",
  },
  9: {
    wordId: 9,
    enWord: "FOX",
    enPhonemes: ["/f/", "/ŏ/", "/ks/"],
    enGraphemeTiles: ["F", "O", "X"],
    enPattern: "cvc-short-vowel",
    enLessonUnit: "unit-1-cvc",
    enDecodableSentence: "A red fox ran in the den.",
    esWord: "ZORRO",
    esSyllables: ["ZO", "RRO"],
    esPhonemes: ["/s/", "/o/", "/rr/", "/o/"],
    esGraphemeTiles: ["Z", "O", "RR", "O"],
    esPattern: "es-grupo-consonantico-digrafo",
    esLessonUnit: "es-unit-3-digrafos",
    esDecodableSentence: "El zorro corre por el monte.",
  },
  8: {
    wordId: 8,
    enWord: "GEM",
    enPhonemes: ["/j/", "/ĕ/", "/m/"],
    enGraphemeTiles: ["G", "E", "M"],
    enPattern: "cvc-short-vowel",
    enLessonUnit: "unit-1-cvc",
    enDecodableSentence: "Pip set the red gem in the box.",
    esWord: "GEMA",
    esSyllables: ["GE", "MA"],
    esPhonemes: ["/x/", "/e/", "/m/", "/a/"],
    esGraphemeTiles: ["G", "E", "M", "A"],
    esPattern: "es-silaba-abierta",
    esLessonUnit: "es-unit-1-abiertas",
    esDecodableSentence: "La gema brilla en la mesa.",
  },
  12: {
    wordId: 12,
    enWord: "BELL",
    enPhonemes: ["/b/", "/ĕ/", "/l/"],
    enGraphemeTiles: ["B", "E", "LL"],
    enPattern: "floss-or-digraph",
    enLessonUnit: "unit-2-blends-floss",
    enDecodableSentence: "Ring the silver bell at the gate.",
    esWord: "CAMPANA",
    esSyllables: ["CAM", "PA", "NA"],
    esPhonemes: ["/k/", "/a/", "/m/", "/p/", "/a/", "/n/", "/a/"],
    esGraphemeTiles: ["C", "A", "M", "P", "A", "N", "A"],
    esPattern: "es-silaba-trabada-cvc",
    esLessonUnit: "es-unit-2-trabadas",
    esDecodableSentence: "La campana suena en la torre.",
  },
  4: {
    wordId: 4,
    enWord: "FROG",
    enPhonemes: ["/f/", "/r/", "/ŏ/", "/g/"],
    enGraphemeTiles: ["F", "R", "O", "G"],
    enPattern: "consonant-blend",
    enLessonUnit: "unit-2-blends-floss",
    enDecodableSentence: "A green frog hops on the log.",
    esWord: "RANA",
    esSyllables: ["RA", "NA"],
    esPhonemes: ["/rr/", "/a/", "/n/", "/a/"],
    esGraphemeTiles: ["R", "A", "N", "A"],
    esPattern: "es-silaba-abierta",
    esLessonUnit: "es-unit-1-abiertas",
    esDecodableSentence: "La rana salta en la laguna.",
  },
  2: {
    wordId: 2,
    enWord: "STAR",
    enPhonemes: ["/s/", "/t/", "/ar/"],
    enGraphemeTiles: ["S", "T", "AR"],
    enPattern: "r-controlled",
    enLessonUnit: "unit-2-blends-floss",
    enDecodableSentence: "One bright star shines in the dark.",
    esWord: "ESTRELLA",
    esSyllables: ["ES", "TRE", "LLA"],
    esPhonemes: ["/e/", "/s/", "/t/", "/r/", "/e/", "/ʝ/", "/a/"],
    esGraphemeTiles: ["E", "S", "T", "R", "E", "LL", "A"],
    esPattern: "es-grupo-consonantico-digrafo",
    esLessonUnit: "es-unit-4-oraciones",
    esDecodableSentence: "Una estrella ilumina la torre.",
  },
  1: {
    wordId: 1,
    enWord: "MOON",
    enPhonemes: ["/m/", "/oo/", "/n/"],
    enGraphemeTiles: ["M", "OO", "N"],
    enPattern: "vowel-team-or-diphthong",
    enLessonUnit: "unit-3-vowel-teams",
    enDecodableSentence: "The full moon glows over the wood.",
    esWord: "LUNA",
    esSyllables: ["LU", "NA"],
    esPhonemes: ["/l/", "/u/", "/n/", "/a/"],
    esGraphemeTiles: ["L", "U", "N", "A"],
    esPattern: "es-silaba-abierta",
    esLessonUnit: "es-unit-1-abiertas",
    esDecodableSentence: "La luna sale en la noche.",
  },
  5: {
    wordId: 5,
    enWord: "TREE",
    enPhonemes: ["/t/", "/r/", "/ē/"],
    enGraphemeTiles: ["T", "R", "EE"],
    enPattern: "vowel-team-or-diphthong",
    enLessonUnit: "unit-3-vowel-teams",
    enDecodableSentence: "Moss sleeps by the tall green tree.",
    esWord: "ÁRBOL",
    esSyllables: ["ÁR", "BOL"],
    esPhonemes: ["/a/", "/r/", "/b/", "/o/", "/l/"],
    esGraphemeTiles: ["Á", "R", "B", "O", "L"],
    esPattern: "es-silaba-trabada-cvc",
    esLessonUnit: "es-unit-2-trabadas",
    esDecodableSentence: "El árbol alto da sombra.",
  },
  6: {
    wordId: 6,
    enWord: "BOOK",
    enPhonemes: ["/b/", "/ʊ/", "/k/"],
    enGraphemeTiles: ["B", "OO", "K"],
    enPattern: "vowel-team-or-diphthong",
    enLessonUnit: "unit-3-vowel-teams",
    enDecodableSentence: "Luma opens the old spell book.",
    esWord: "LIBRO",
    esSyllables: ["LI", "BRO"],
    esPhonemes: ["/l/", "/i/", "/b/", "/r/", "/o/"],
    esGraphemeTiles: ["L", "I", "B", "R", "O"],
    esPattern: "es-grupo-consonantico-digrafo",
    esLessonUnit: "es-unit-3-digrafos",
    esDecodableSentence: "Luma lee el libro mágico.",
  },
  3: {
    wordId: 3,
    enWord: "OWL",
    enPhonemes: ["/ow/", "/l/"],
    enGraphemeTiles: ["OW", "L"],
    enPattern: "vowel-team-or-diphthong",
    enLessonUnit: "unit-4-connected",
    enDecodableSentence: "Pip the owl flies to the high branch.",
    esWord: "BÚHO",
    esSyllables: ["BÚ", "HO"],
    esPhonemes: ["/b/", "/u/", "/o/"],
    esGraphemeTiles: ["B", "Ú", "H", "O"],
    esPattern: "es-hiato-h-muda",
    esLessonUnit: "es-unit-3-digrafos",
    esDecodableSentence: "El búho sabio mira el bosque.",
  },
  7: {
    wordId: 7,
    enWord: "CROWN",
    enPhonemes: ["/k/", "/r/", "/ow/", "/n/"],
    enGraphemeTiles: ["C", "R", "OW", "N"],
    enPattern: "vowel-team-or-diphthong",
    enLessonUnit: "unit-4-connected",
    enDecodableSentence: "The starlight crown shines on the tower.",
    esWord: "CORONA",
    esSyllables: ["CO", "RO", "NA"],
    esPhonemes: ["/k/", "/o/", "/r/", "/o/", "/n/", "/a/"],
    esGraphemeTiles: ["C", "O", "R", "O", "N", "A"],
    esPattern: "es-silaba-abierta",
    esLessonUnit: "es-unit-4-oraciones",
    esDecodableSentence: "La corona dorada brilla arriba.",
  },
};

export const ENGLISH_PHONICS_UNITS: readonly PhonicsLessonUnit[] = [
  {
    id: "unit-1-cvc",
    locale: "en",
    title: "Unit 1: Short-Vowel CVC Words & Phoneme Blending",
    prerequisites: [],
    difficulty: 1,
    taughtGraphemes: ["c", "a", "t", "s", "u", "n", "f", "o", "x", "g", "e", "m"],
    heartWords: ["the", "a", "is", "in", "on"],
    wordIds: [10, 11, 9, 8],
    mechanics: ["sound-recognition", "sound-blending"],
  },
  {
    id: "unit-2-blends-floss",
    locale: "en",
    title: "Unit 2: Consonant Blends, FLOSS Double Consonants & R-Controlled Vowels",
    prerequisites: ["unit-1-cvc"],
    difficulty: 2,
    taughtGraphemes: ["b", "ll", "fr", "r", "st", "ar"],
    heartWords: ["the", "a", "is", "in", "on", "to", "at"],
    wordIds: [12, 4, 2],
    mechanics: ["phoneme-segmentation", "word-building"],
  },
  {
    id: "unit-3-vowel-teams",
    locale: "en",
    title: "Unit 3: Common Vowel Teams (oo, ee)",
    prerequisites: ["unit-2-blends-floss"],
    difficulty: 3,
    taughtGraphemes: ["m", "oo", "tr", "ee", "k"],
    heartWords: ["the", "a", "is", "in", "on", "to", "by", "over"],
    wordIds: [1, 5, 6],
    mechanics: ["decoding"],
  },
  {
    id: "unit-4-connected",
    locale: "en",
    title: "Unit 4: Diphthongs (ow) & Connected Decodable Reading",
    prerequisites: ["unit-3-vowel-teams"],
    difficulty: 4,
    taughtGraphemes: ["ow", "l", "cr", "n"],
    heartWords: ["the", "a", "is", "in", "on", "to", "by", "over", "said"],
    wordIds: [3, 7],
    mechanics: ["connected-reading"],
  },
];

export const SPANISH_PHONICS_UNITS: readonly PhonicsLessonUnit[] = [
  {
    id: "es-unit-1-abiertas",
    locale: "es",
    title: "Unidad 1: Vocales y Sílabas Directas Abiertas (CV)",
    prerequisites: [],
    difficulty: 1,
    taughtGraphemes: ["a", "e", "i", "o", "u", "l", "n", "g", "t", "r", "m"],
    heartWords: ["el", "la", "en"],
    wordIds: [1, 10, 4, 8],
    mechanics: ["sound-recognition", "sound-blending"],
  },
  {
    id: "es-unit-2-trabadas",
    locale: "es",
    title: "Unidad 2: Sílabas Trabadas (CVC) y Palabras Multisilábicas",
    prerequisites: ["es-unit-1-abiertas"],
    difficulty: 2,
    taughtGraphemes: ["s", "b", "c", "p", "á"],
    heartWords: ["el", "la", "en", "por", "da"],
    wordIds: [11, 5, 12],
    mechanics: ["phoneme-segmentation", "word-building"],
  },
  {
    id: "es-unit-3-digrafos",
    locale: "es",
    title: "Unidad 3: Dígrafos (rr), Hiato con H Muda (búho) y Grupos Consonánticos (br)",
    prerequisites: ["es-unit-2-trabadas"],
    difficulty: 3,
    taughtGraphemes: ["z", "rr", "h", "ú", "br"],
    heartWords: ["el", "la", "en", "por", "lee"],
    wordIds: [9, 3, 6],
    mechanics: ["decoding"],
  },
  {
    id: "es-unit-4-oraciones",
    locale: "es",
    title: "Unidad 4: Grupos Consonánticos (tr), Dígrafo (ll) y Lectura Conectada",
    prerequisites: ["es-unit-3-digrafos"],
    difficulty: 4,
    taughtGraphemes: ["tr", "ll"],
    heartWords: ["el", "la", "una", "en", "arriba"],
    wordIds: [2, 7],
    mechanics: ["connected-reading"],
  },
];

export function validatePhonicsCurriculum(): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  for (let id = 1; id <= 12; id++) {
    const entry = PHONICS_WORD_BANK[id];
    if (!entry) {
      errors.push(`Missing PHONICS_WORD_BANK entry for wordId ${id}`);
      continue;
    }
    if (entry.enGraphemeTiles.join("") !== entry.enWord) {
      errors.push(`English tiles for ${entry.enWord} do not reconstruct word`);
    }
    if (entry.esGraphemeTiles.join("") !== entry.esWord) {
      errors.push(`Spanish tiles for ${entry.esWord} do not reconstruct word`);
    }
    if (!entry.enDecodableSentence.toUpperCase().includes(entry.enWord)) {
      errors.push(`English decodable sentence for ${entry.enWord} does not contain target word`);
    }
    if (!entry.esDecodableSentence.toUpperCase().includes(entry.esWord)) {
      errors.push(`Spanish decodable sentence for ${entry.esWord} does not contain target word`);
    }
  }

  for (const unit of ENGLISH_PHONICS_UNITS) {
    for (const wid of unit.wordIds) {
      const entry = PHONICS_WORD_BANK[wid];
      if (entry?.enLessonUnit !== unit.id) {
        errors.push(`English word ${wid} (${entry?.enWord}) has enLessonUnit=${entry?.enLessonUnit}, not ${unit.id}`);
      }
    }
  }

  for (const unit of SPANISH_PHONICS_UNITS) {
    for (const wid of unit.wordIds) {
      const entry = PHONICS_WORD_BANK[wid];
      if (entry?.esLessonUnit !== unit.id) {
        errors.push(`Spanish word ${wid} (${entry?.esWord}) has esLessonUnit=${entry?.esLessonUnit}, not ${unit.id}`);
      }
    }
  }

  for (const unitList of [ENGLISH_PHONICS_UNITS, SPANISH_PHONICS_UNITS]) {
    const seen = new Set<string>();
    for (const unit of unitList) {
      for (const prereq of unit.prerequisites) {
        if (!seen.has(prereq)) {
          errors.push(`Phonics unit ${unit.id} requires ${prereq} before it is taught in sequence`);
        }
      }
      seen.add(unit.id);
    }
  }

  return { valid: errors.length === 0, errors };
}
