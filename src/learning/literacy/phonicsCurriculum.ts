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
  | "es-digrafo"
  | "es-grupo-consonantico";

export interface PhonicsWordEntry {
  wordId: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
  enWord: string;
  enPhonemes: readonly string[];
  enGraphemeTiles: readonly string[];
  enPattern: PhonicsPatternCategory;
  enLessonUnit: "unit-1-cvc" | "unit-2-blends-floss" | "unit-3-vowel-teams" | "unit-4-connected";
  enDecodableSentence: string;
  enDistractors: readonly [string, string];
  esWord: string;
  esSyllables: readonly string[];
  esPhonemes: readonly string[];
  esGraphemeTiles: readonly string[];
  esPattern: PhonicsPatternCategory;
  esLessonUnit: "es-unit-1-abiertas" | "es-unit-2-trabadas" | "es-unit-3-digrafos" | "es-unit-4-oraciones";
  esDecodableSentence: string;
  esDistractors: readonly [string, string];
}

export interface PhonicsLessonUnit {
  id: string;
  locale: "en" | "es";
  title: string;
  prerequisites: readonly string[];
  difficulty: Difficulty;
  allowedPatterns: readonly PhonicsPatternCategory[];
  taughtGraphemes: readonly string[];
  heartWords: readonly string[];
  wordIds: readonly (1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12)[];
  mechanics: readonly PhonicsMechanic[];
}

/**
 * Complete bilingual word & pattern bank for Story Word IDs 1..12.
 * Notice how English and Spanish follow their own linguistic structures:
 * - English progresses from transparent 3-sound CVC words (`CAT`, `SUN`, `FOX`, `GEM`)
 *   to FLOSS/blends (`BELL`, `FROG`), vowel teams (`MOON`, `TREE`, `BOOK`), and
 *   r-controlled/diphthongs (`STAR`, `OWL`, `CROWN`).
 * - Spanish progresses from open CV syllables & silent h (`LUNA`, `GATO`, `RANA`, `GEMA`, `BÚHO`)
 *   to CVC/closed syllables (`SOL`, `ÁRBOL`, `CAMPANA`), true digraphs (`ZORRO`, `ESTRELLA`),
 *   and consonant clusters / multi-syllable connected reading (`LIBRO`, `CORONA`).
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
    enDistractors: ["COT", "CAP"],
    esWord: "GATO",
    esSyllables: ["GA", "TO"],
    esPhonemes: ["/g/", "/a/", "/t/", "/o/"],
    esGraphemeTiles: ["G", "A", "T", "O"],
    esPattern: "es-silaba-abierta",
    esLessonUnit: "es-unit-1-abiertas",
    esDecodableSentence: "El gato salta en la loma.",
    esDistractors: ["PATO", "GALO"],
  },
  11: {
    wordId: 11,
    enWord: "SUN",
    enPhonemes: ["/s/", "/ŭ/", "/n/"],
    enGraphemeTiles: ["S", "U", "N"],
    enPattern: "cvc-short-vowel",
    enLessonUnit: "unit-1-cvc",
    enDecodableSentence: "The warm sun is up.",
    enDistractors: ["RUN", "SAP"],
    esWord: "SOL",
    esSyllables: ["SOL"],
    esPhonemes: ["/s/", "/o/", "/l/"],
    esGraphemeTiles: ["S", "O", "L"],
    esPattern: "es-silaba-trabada-cvc",
    esLessonUnit: "es-unit-2-trabadas",
    esDecodableSentence: "El sol sale en la mañana.",
    esDistractors: ["SAL", "SUR"],
  },
  9: {
    wordId: 9,
    enWord: "FOX",
    enPhonemes: ["/f/", "/ŏ/", "/ks/"],
    enGraphemeTiles: ["F", "O", "X"],
    enPattern: "cvc-short-vowel",
    enLessonUnit: "unit-1-cvc",
    enDecodableSentence: "A red fox ran in the den.",
    enDistractors: ["BOX", "FIX"],
    esWord: "ZORRO",
    esSyllables: ["ZO", "RRO"],
    esPhonemes: ["/s/", "/o/", "/rr/", "/o/"],
    esGraphemeTiles: ["Z", "O", "RR", "O"],
    esPattern: "es-digrafo",
    esLessonUnit: "es-unit-3-digrafos",
    esDecodableSentence: "El zorro corre por el monte.",
    esDistractors: ["CORRO", "GORRO"],
  },
  8: {
    wordId: 8,
    enWord: "GEM",
    enPhonemes: ["/j/", "/ĕ/", "/m/"],
    enGraphemeTiles: ["G", "E", "M"],
    enPattern: "cvc-short-vowel",
    enLessonUnit: "unit-1-cvc",
    enDecodableSentence: "Pip set the red gem in the box.",
    enDistractors: ["GUM", "HEM"],
    esWord: "GEMA",
    esSyllables: ["GE", "MA"],
    esPhonemes: ["/x/", "/e/", "/m/", "/a/"],
    esGraphemeTiles: ["G", "E", "M", "A"],
    esPattern: "es-silaba-abierta",
    esLessonUnit: "es-unit-1-abiertas",
    esDecodableSentence: "La gema brilla en la mesa.",
    esDistractors: ["YEMA", "REMA"],
  },
  12: {
    wordId: 12,
    enWord: "BELL",
    enPhonemes: ["/b/", "/ĕ/", "/l/"],
    enGraphemeTiles: ["B", "E", "LL"],
    enPattern: "floss-or-digraph",
    enLessonUnit: "unit-2-blends-floss",
    enDecodableSentence: "Ring the silver bell at the gate.",
    enDistractors: ["BALL", "BILL"],
    esWord: "CAMPANA",
    esSyllables: ["CAM", "PA", "NA"],
    esPhonemes: ["/k/", "/a/", "/m/", "/p/", "/a/", "/n/", "/a/"],
    esGraphemeTiles: ["C", "A", "M", "P", "A", "N", "A"],
    esPattern: "es-silaba-trabada-cvc",
    esLessonUnit: "es-unit-2-trabadas",
    esDecodableSentence: "La campana suena en la torre.",
    esDistractors: ["CABAÑA", "CAMINO"],
  },
  4: {
    wordId: 4,
    enWord: "FROG",
    enPhonemes: ["/f/", "/r/", "/ŏ/", "/g/"],
    enGraphemeTiles: ["F", "R", "O", "G"],
    enPattern: "consonant-blend",
    enLessonUnit: "unit-2-blends-floss",
    enDecodableSentence: "A green frog hops on the log.",
    enDistractors: ["FOG", "FLAG"],
    esWord: "RANA",
    esSyllables: ["RA", "NA"],
    esPhonemes: ["/rr/", "/a/", "/n/", "/a/"],
    esGraphemeTiles: ["R", "A", "N", "A"],
    esPattern: "es-silaba-abierta",
    esLessonUnit: "es-unit-1-abiertas",
    esDecodableSentence: "La rana salta en la laguna.",
    esDistractors: ["RAMA", "LANA"],
  },
  2: {
    wordId: 2,
    enWord: "STAR",
    enPhonemes: ["/s/", "/t/", "/ar/"],
    enGraphemeTiles: ["S", "T", "AR"],
    enPattern: "r-controlled",
    enLessonUnit: "unit-4-connected",
    enDecodableSentence: "One bright star shines in the dark.",
    enDistractors: ["SCAR", "STIR"],
    esWord: "ESTRELLA",
    esSyllables: ["ES", "TRE", "LLA"],
    esPhonemes: ["/e/", "/s/", "/t/", "/r/", "/e/", "/ʝ/", "/a/"],
    esGraphemeTiles: ["E", "S", "T", "R", "E", "LL", "A"],
    esPattern: "es-digrafo",
    esLessonUnit: "es-unit-3-digrafos",
    esDecodableSentence: "Una estrella ilumina la torre.",
    esDistractors: ["ESTELA", "ESPUELA"],
  },
  1: {
    wordId: 1,
    enWord: "MOON",
    enPhonemes: ["/m/", "/oo/", "/n/"],
    enGraphemeTiles: ["M", "OO", "N"],
    enPattern: "vowel-team-or-diphthong",
    enLessonUnit: "unit-3-vowel-teams",
    enDecodableSentence: "The full moon glows over the wood.",
    enDistractors: ["SOON", "NOON"],
    esWord: "LUNA",
    esSyllables: ["LU", "NA"],
    esPhonemes: ["/l/", "/u/", "/n/", "/a/"],
    esGraphemeTiles: ["L", "U", "N", "A"],
    esPattern: "es-silaba-abierta",
    esLessonUnit: "es-unit-1-abiertas",
    esDecodableSentence: "La luna sale en la noche.",
    esDistractors: ["CUNA", "LUPA"],
  },
  5: {
    wordId: 5,
    enWord: "TREE",
    enPhonemes: ["/t/", "/r/", "/ē/"],
    enGraphemeTiles: ["T", "R", "EE"],
    enPattern: "vowel-team-or-diphthong",
    enLessonUnit: "unit-3-vowel-teams",
    enDecodableSentence: "Moss sleeps by the tall green tree.",
    enDistractors: ["FREE", "TRAY"],
    esWord: "ÁRBOL",
    esSyllables: ["ÁR", "BOL"],
    esPhonemes: ["/a/", "/r/", "/b/", "/o/", "/l/"],
    esGraphemeTiles: ["Á", "R", "B", "O", "L"],
    esPattern: "es-silaba-trabada-cvc",
    esLessonUnit: "es-unit-2-trabadas",
    esDecodableSentence: "El árbol alto da sombra.",
    esDistractors: ["ARCO", "FAROL"],
  },
  6: {
    wordId: 6,
    enWord: "BOOK",
    enPhonemes: ["/b/", "/ʊ/", "/k/"],
    enGraphemeTiles: ["B", "OO", "K"],
    enPattern: "vowel-team-or-diphthong",
    enLessonUnit: "unit-3-vowel-teams",
    enDecodableSentence: "Luma opens the old spell book.",
    enDistractors: ["LOOK", "BACK"],
    esWord: "LIBRO",
    esSyllables: ["LI", "BRO"],
    esPhonemes: ["/l/", "/i/", "/b/", "/r/", "/o/"],
    esGraphemeTiles: ["L", "I", "B", "R", "O"],
    esPattern: "es-grupo-consonantico",
    esLessonUnit: "es-unit-4-oraciones",
    esDecodableSentence: "Luma lee el libro mágico.",
    esDistractors: ["LIBRE", "LITRO"],
  },
  3: {
    wordId: 3,
    enWord: "OWL",
    enPhonemes: ["/ow/", "/l/"],
    enGraphemeTiles: ["OW", "L"],
    enPattern: "vowel-team-or-diphthong",
    enLessonUnit: "unit-4-connected",
    enDecodableSentence: "Pip the owl flies to the high branch.",
    enDistractors: ["HOWL", "FOWL"],
    esWord: "BÚHO",
    esSyllables: ["BÚ", "HO"],
    esPhonemes: ["/b/", "/u/", "/o/"],
    esGraphemeTiles: ["B", "Ú", "H", "O"],
    esPattern: "es-hiato-h-muda",
    esLessonUnit: "es-unit-1-abiertas",
    esDecodableSentence: "El búho sabio mira el bosque.",
    esDistractors: ["BUZO", "CUBO"],
  },
  7: {
    wordId: 7,
    enWord: "CROWN",
    enPhonemes: ["/k/", "/r/", "/ow/", "/n/"],
    enGraphemeTiles: ["C", "R", "OW", "N"],
    enPattern: "vowel-team-or-diphthong",
    enLessonUnit: "unit-4-connected",
    enDecodableSentence: "The starlight crown shines on the tower.",
    enDistractors: ["CLOWN", "BROWN"],
    esWord: "CORONA",
    esSyllables: ["CO", "RO", "NA"],
    esPhonemes: ["/k/", "/o/", "/r/", "/o/", "/n/", "/a/"],
    esGraphemeTiles: ["C", "O", "R", "O", "N", "A"],
    esPattern: "es-silaba-abierta",
    esLessonUnit: "es-unit-4-oraciones",
    esDecodableSentence: "La corona dorada brilla arriba.",
    esDistractors: ["COLINA", "CORO"],
  },
};

export const ENGLISH_PHONICS_UNITS: readonly PhonicsLessonUnit[] = [
  {
    id: "unit-1-cvc",
    locale: "en",
    title: "Unit 1: Short-Vowel CVC Words & Phoneme Blending",
    prerequisites: [],
    difficulty: 1,
    allowedPatterns: ["cvc-short-vowel"],
    taughtGraphemes: ["c", "a", "t", "s", "u", "n", "f", "o", "x", "g", "e", "m"],
    heartWords: ["the", "a", "is", "in", "on"],
    wordIds: [10, 11, 9, 8],
    mechanics: ["sound-recognition", "sound-blending"],
  },
  {
    id: "unit-2-blends-floss",
    locale: "en",
    title: "Unit 2: Consonant Blends & FLOSS Double Consonants",
    prerequisites: ["unit-1-cvc"],
    difficulty: 2,
    allowedPatterns: ["floss-or-digraph", "consonant-blend"],
    taughtGraphemes: ["b", "ll", "fr", "r"],
    heartWords: ["the", "a", "is", "in", "on", "to", "at"],
    wordIds: [12, 4],
    mechanics: ["phoneme-segmentation", "word-building"],
  },
  {
    id: "unit-3-vowel-teams",
    locale: "en",
    title: "Unit 3: Common Vowel Teams (oo, ee)",
    prerequisites: ["unit-2-blends-floss"],
    difficulty: 3,
    allowedPatterns: ["vowel-team-or-diphthong"],
    taughtGraphemes: ["m", "oo", "tr", "ee", "k"],
    heartWords: ["the", "a", "is", "in", "on", "to", "by", "over"],
    wordIds: [1, 5, 6],
    mechanics: ["decoding"],
  },
  {
    id: "unit-4-connected",
    locale: "en",
    title: "Unit 4: R-Controlled Vowels (ar), Diphthongs (ow) & Connected Decodable Reading",
    prerequisites: ["unit-3-vowel-teams"],
    difficulty: 4,
    allowedPatterns: ["r-controlled", "vowel-team-or-diphthong"],
    taughtGraphemes: ["st", "ar", "ow", "l", "cr", "n"],
    heartWords: ["the", "a", "is", "in", "on", "to", "by", "over", "said"],
    wordIds: [2, 3, 7],
    mechanics: ["connected-reading"],
  },
];

export const SPANISH_PHONICS_UNITS: readonly PhonicsLessonUnit[] = [
  {
    id: "es-unit-1-abiertas",
    locale: "es",
    title: "Unidad 1: Vocales, Sílabas Directas Abiertas (CV) y H Muda (búho)",
    prerequisites: [],
    difficulty: 1,
    allowedPatterns: ["es-silaba-abierta", "es-hiato-h-muda"],
    taughtGraphemes: ["a", "e", "i", "o", "u", "l", "n", "g", "t", "r", "m", "b", "ú", "h"],
    heartWords: ["el", "la", "en"],
    wordIds: [1, 10, 4, 8, 3],
    mechanics: ["sound-recognition", "sound-blending"],
  },
  {
    id: "es-unit-2-trabadas",
    locale: "es",
    title: "Unidad 2: Sílabas Trabadas (CVC) y Palabras Multisilábicas",
    prerequisites: ["es-unit-1-abiertas"],
    difficulty: 2,
    allowedPatterns: ["es-silaba-trabada-cvc"],
    taughtGraphemes: ["s", "b", "c", "p", "á"],
    heartWords: ["el", "la", "en", "por", "da"],
    wordIds: [11, 5, 12],
    mechanics: ["phoneme-segmentation", "word-building"],
  },
  {
    id: "es-unit-3-digrafos",
    locale: "es",
    title: "Unidad 3: Dígrafos (rr, ll)",
    prerequisites: ["es-unit-2-trabadas"],
    difficulty: 3,
    allowedPatterns: ["es-digrafo"],
    taughtGraphemes: ["z", "rr", "tr", "ll"],
    heartWords: ["el", "la", "en", "por", "una"],
    wordIds: [9, 2],
    mechanics: ["decoding"],
  },
  {
    id: "es-unit-4-oraciones",
    locale: "es",
    title: "Unidad 4: Grupos Consonánticos (br) y Lectura Conectada",
    prerequisites: ["es-unit-3-digrafos"],
    difficulty: 4,
    allowedPatterns: ["es-grupo-consonantico", "es-silaba-abierta"],
    taughtGraphemes: ["br", "c"],
    heartWords: ["el", "la", "una", "en", "lee", "arriba"],
    wordIds: [6, 7],
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
    if (
      entry.enDistractors.length !== 2 ||
      new Set([entry.enWord, ...entry.enDistractors]).size !== 3
    ) {
      errors.push(`English distractors for ${entry.enWord} must be 2 distinct words different from target`);
    }
    if (
      entry.esDistractors.length !== 2 ||
      new Set([entry.esWord, ...entry.esDistractors]).size !== 3
    ) {
      errors.push(`Spanish distractors for ${entry.esWord} must be 2 distinct words different from target`);
    }
  }

  for (const unit of ENGLISH_PHONICS_UNITS) {
    for (const wid of unit.wordIds) {
      const entry = PHONICS_WORD_BANK[wid];
      if (!entry) continue;
      if (entry.enLessonUnit !== unit.id) {
        errors.push(`English word ${wid} (${entry.enWord}) has enLessonUnit=${entry.enLessonUnit}, not ${unit.id}`);
      }
      if (!unit.allowedPatterns.includes(entry.enPattern)) {
        errors.push(
          `English word ${wid} (${entry.enWord}) has pattern ${entry.enPattern}, which is not allowed in ${unit.id}`,
        );
      }
    }
  }

  for (const unit of SPANISH_PHONICS_UNITS) {
    for (const wid of unit.wordIds) {
      const entry = PHONICS_WORD_BANK[wid];
      if (!entry) continue;
      if (entry.esLessonUnit !== unit.id) {
        errors.push(`Spanish word ${wid} (${entry.esWord}) has esLessonUnit=${entry.esLessonUnit}, not ${unit.id}`);
      }
      if (!unit.allowedPatterns.includes(entry.esPattern)) {
        errors.push(
          `Spanish word ${wid} (${entry.esWord}) has pattern ${entry.esPattern}, which is not allowed in ${unit.id}`,
        );
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
