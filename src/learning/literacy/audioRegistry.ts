/**
 * Typed instructional audio registry for structured literacy (Phase 2.3).
 *
 * Browser speech synthesizers (Web Speech API) are designed for whole words and
 * connected sentences; they cannot reliably utter isolated phonemes (for example,
 * passing "M - OO - N" causes TTS to read letter names or hyphens aloud).
 *
 * This registry:
 * 1. Associates every phoneme, grapheme, word, and decodable sentence with
 *    structured pronunciation metadata.
 * 2. Prevents raw hyphenated phoneme breakdowns from being sent to browser TTS
 *    as if they were verified phoneme recordings.
 * 3. Provides explicit parent-assisted pronunciation instructions (`parentTipEn` /
 *    `parentTipEs`) whenever isolated phoneme audio assets are not bundled.
 */

export type AudioAssetKind = "phoneme" | "grapheme" | "word" | "sentence";

export interface InstructionalAudioEntry {
  id: string;
  locale: "en-US" | "es-US";
  kind: AudioAssetKind;
  grapheme: string;
  ipa: string;
  /** Whole-word or connected-sentence text safe for on-device Web Speech synthesis. */
  ttsSafeText: string;
  /** True only if a verified studio phoneme recording is bundled under `public/assets/audio/`. */
  hasVerifiedRecording: boolean;
  /** Clear adult guidance for modeling the pure phoneme sound without adding an "/uh/" schwa. */
  parentPronunciationTip: string;
}

export const PHONEME_AUDIO_REGISTRY: Readonly<Record<string, InstructionalAudioEntry>> = {
  "en.word.1": {
    id: "en.word.1",
    locale: "en-US",
    kind: "word",
    grapheme: "MOON",
    ipa: "/m/ /uː/ /n/",
    ttsSafeText: "moon",
    hasVerifiedRecording: false,
    parentPronunciationTip: "Stretch the continuous /mmm/ and /ooo/ sounds smoothly into /nnn/ without adding 'uh': mmm-ooo-nnn -> moon.",
  },
  "en.word.2": {
    id: "en.word.2",
    locale: "en-US",
    kind: "word",
    grapheme: "STAR",
    ipa: "/s/ /t/ /ɑːr/",
    ttsSafeText: "star",
    hasVerifiedRecording: false,
    parentPronunciationTip: "Blend the initial /s/ and /t/ crisp sounds into the r-controlled vowel /ar/: s-t-ar -> star.",
  },
  "en.word.3": {
    id: "en.word.3",
    locale: "en-US",
    kind: "word",
    grapheme: "OWL",
    ipa: "/aʊ/ /l/",
    ttsSafeText: "owl",
    hasVerifiedRecording: false,
    parentPronunciationTip: "Model the diphthong /ow/ (spelled ow) followed by /lll/: ow-l -> owl.",
  },
  "en.word.4": {
    id: "en.word.4",
    locale: "en-US",
    kind: "word",
    grapheme: "FROG",
    ipa: "/f/ /r/ /ɒ/ /g/",
    ttsSafeText: "frog",
    hasVerifiedRecording: false,
    parentPronunciationTip: "Point to each sound in the 4-sound CCVC blend: /f/ - /r/ - /ŏ/ - /g/ -> frog.",
  },
  "en.word.5": {
    id: "en.word.5",
    locale: "en-US",
    kind: "word",
    grapheme: "TREE",
    ipa: "/t/ /r/ /iː/",
    ttsSafeText: "tree",
    hasVerifiedRecording: false,
    parentPronunciationTip: "Show how vowel team 'ee' makes the long /ē/ sound: /t/ - /r/ - /ē/ -> tree.",
  },
  "en.word.6": {
    id: "en.word.6",
    locale: "en-US",
    kind: "word",
    grapheme: "BOOK",
    ipa: "/b/ /ʊ/ /k/",
    ttsSafeText: "book",
    hasVerifiedRecording: false,
    parentPronunciationTip: "Clip /b/ cleanly (no 'buh'), then short /oo/ as in foot, then /k/: /b/ - /ʊ/ - /k/ -> book.",
  },
  "en.word.7": {
    id: "en.word.7",
    locale: "en-US",
    kind: "word",
    grapheme: "CROWN",
    ipa: "/k/ /r/ /aʊ/ /n/",
    ttsSafeText: "crown",
    hasVerifiedRecording: false,
    parentPronunciationTip: "Tap all 4 phonemes: /k/ - /r/ - /ow/ - /n/ -> crown.",
  },
  "en.word.8": {
    id: "en.word.8",
    locale: "en-US",
    kind: "word",
    grapheme: "GEM",
    ipa: "/dʒ/ /ɛ/ /m/",
    ttsSafeText: "gem",
    hasVerifiedRecording: false,
    parentPronunciationTip: "Note that 'g' before 'e' makes the soft /j/ sound: /j/ - /ĕ/ - /m/ -> gem.",
  },
  "en.word.9": {
    id: "en.word.9",
    locale: "en-US",
    kind: "word",
    grapheme: "FOX",
    ipa: "/f/ /ɒ/ /ks/",
    ttsSafeText: "fox",
    hasVerifiedRecording: false,
    parentPronunciationTip: "Stretch /fff/ into short /ŏ/, then final letter x (/ks/): /f/ - /ŏ/ - /ks/ -> fox.",
  },
  "en.word.10": {
    id: "en.word.10",
    locale: "en-US",
    kind: "word",
    grapheme: "CAT",
    ipa: "/k/ /æ/ /t/",
    ttsSafeText: "cat",
    hasVerifiedRecording: false,
    parentPronunciationTip: "Classic 3-sound CVC word: clip /k/ and /t/ cleanly without 'uh': /k/ - /ă/ - /t/ -> cat.",
  },
  "en.word.11": {
    id: "en.word.11",
    locale: "en-US",
    kind: "word",
    grapheme: "SUN",
    ipa: "/s/ /ʌ/ /n/",
    ttsSafeText: "sun",
    hasVerifiedRecording: false,
    parentPronunciationTip: "Continuous blending CVC word: hold /sss/ into short /ŭ/ and /nnn/: sss-ŭŭŭ-nnn -> sun.",
  },
  "en.word.12": {
    id: "en.word.12",
    locale: "en-US",
    kind: "word",
    grapheme: "BELL",
    ipa: "/b/ /ɛ/ /l/",
    ttsSafeText: "bell",
    hasVerifiedRecording: false,
    parentPronunciationTip: "Double 'll' after a short vowel (FLOSS rule) makes one /l/ sound: /b/ - /ĕ/ - /l/ -> bell.",
  },
  "es.word.1": {
    id: "es.word.1",
    locale: "es-US",
    kind: "word",
    grapheme: "LUNA",
    ipa: "/l/ /u/ /n/ /a/",
    ttsSafeText: "luna",
    hasVerifiedRecording: false,
    parentPronunciationTip: "Sílabas directas abiertas: lu - na (/l/ /u/ - /n/ /a/).",
  },
  "es.word.2": {
    id: "es.word.2",
    locale: "es-US",
    kind: "word",
    grapheme: "ESTRELLA",
    ipa: "/e/ /s/ /t/ /r/ /e/ /ʝ/ /a/",
    ttsSafeText: "estrella",
    hasVerifiedRecording: false,
    parentPronunciationTip: "Dígrafo 'll' y grupo consonántico 'tr': es - tre - lla.",
  },
  "es.word.3": {
    id: "es.word.3",
    locale: "es-US",
    kind: "word",
    grapheme: "BÚHO",
    ipa: "/b/ /u/ /o/",
    ttsSafeText: "búho",
    hasVerifiedRecording: false,
    parentPronunciationTip: "La 'h' intercalada es muda en español: bú - ho.",
  },
  "es.word.4": {
    id: "es.word.4",
    locale: "es-US",
    kind: "word",
    grapheme: "RANA",
    ipa: "/r/ /a/ /n/ /a/",
    ttsSafeText: "rana",
    hasVerifiedRecording: false,
    parentPronunciationTip: "Sonido vibrante fuerte inicial de 'r': ra - na.",
  },
  "es.word.5": {
    id: "es.word.5",
    locale: "es-US",
    kind: "word",
    grapheme: "ÁRBOL",
    ipa: "/a/ /r/ /b/ /o/ /l/",
    ttsSafeText: "árbol",
    hasVerifiedRecording: false,
    parentPronunciationTip: "Sílaba trabada con tilde en la primera sílaba: ár - bol.",
  },
  "es.word.6": {
    id: "es.word.6",
    locale: "es-US",
    kind: "word",
    grapheme: "LIBRO",
    ipa: "/l/ /i/ /b/ /r/ /o/",
    ttsSafeText: "libro",
    hasVerifiedRecording: false,
    parentPronunciationTip: "Grupo consonántico 'br': li - bro.",
  },
  "es.word.7": {
    id: "es.word.7",
    locale: "es-US",
    kind: "word",
    grapheme: "CORONA",
    ipa: "/k/ /o/ /r/ /o/ /n/ /a/",
    ttsSafeText: "corona",
    hasVerifiedRecording: false,
    parentPronunciationTip: "Tres sílabas abiertas: co - ro - na.",
  },
  "es.word.8": {
    id: "es.word.8",
    locale: "es-US",
    kind: "word",
    grapheme: "GEMA",
    ipa: "/x/ /e/ /m/ /a/",
    ttsSafeText: "gema",
    hasVerifiedRecording: false,
    parentPronunciationTip: "La 'g' ante 'e' suena fuerte: ge - ma.",
  },
  "es.word.9": {
    id: "es.word.9",
    locale: "es-US",
    kind: "word",
    grapheme: "ZORRO",
    ipa: "/s/ /o/ /r/ /o/",
    ttsSafeText: "zorro",
    hasVerifiedRecording: false,
    parentPronunciationTip: "Dígrafo 'rr' vibrante múltiple entre vocales: zo - rro.",
  },
  "es.word.10": {
    id: "es.word.10",
    locale: "es-US",
    kind: "word",
    grapheme: "GATO",
    ipa: "/g/ /a/ /t/ /o/",
    ttsSafeText: "gato",
    hasVerifiedRecording: false,
    parentPronunciationTip: "Dos sílabas abiertas con 'g' suave ante 'a': ga - to.",
  },
  "es.word.11": {
    id: "es.word.11",
    locale: "es-US",
    kind: "word",
    grapheme: "SOL",
    ipa: "/s/ /o/ /l/",
    ttsSafeText: "sol",
    hasVerifiedRecording: false,
    parentPronunciationTip: "Palabra monosílaba CVC transparente: /s/ - /o/ - /l/ -> sol.",
  },
  "es.word.12": {
    id: "es.word.12",
    locale: "es-US",
    kind: "word",
    grapheme: "CAMPANA",
    ipa: "/k/ /a/ /m/ /p/ /a/ /n/ /a/",
    ttsSafeText: "campana",
    hasVerifiedRecording: false,
    parentPronunciationTip: "Tres sílabas (usa 'm' antes de 'p'): cam - pa - na.",
  },
};

export function getWordAudioEntry(wordId: number, locale: "en-US" | "es-US"): InstructionalAudioEntry {
  const prefix = locale === "es-US" ? "es" : "en";
  return (
    PHONEME_AUDIO_REGISTRY[`${prefix}.word.${wordId}`] ??
    PHONEME_AUDIO_REGISTRY["en.word.10"]!
  );
}
