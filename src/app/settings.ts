import { z } from "zod";
import { DEFAULT_LANGUAGE, LANGUAGE_CODES, LANGUAGES } from "../i18n";
import { safeLocalStorage, type KeyValueStore } from "../storage/LocalProgressRepository";

z.config({ jitless: true });

export const SettingsSchema = z.object({
  language: z.enum(LANGUAGE_CODES),
  sound: z.boolean(),
  reducedMotion: z.boolean(),
  narration: z.boolean(),
});

export type Settings = z.infer<typeof SettingsSchema>;

const KEY = "flg.settings.v1";

export function defaultSettings(): Settings {
  const prefersReducedMotion =
    typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches;
  const browserLanguage = typeof navigator === "undefined" ? "" : navigator.language;
  const language = LANGUAGES.find((l) => browserLanguage.startsWith(l.code.slice(0, 2)))?.code ?? DEFAULT_LANGUAGE;
  return { language, sound: true, reducedMotion: prefersReducedMotion, narration: true };
}

/** Device-local settings, validated on load. */
export class SettingsRepository {
  constructor(private readonly store: KeyValueStore | null = safeLocalStorage()) {}

  load(): Settings {
    const fallback = defaultSettings();
    try {
      const raw = this.store?.getItem(KEY);
      if (!raw) return fallback;
      const parsed = SettingsSchema.safeParse({ ...fallback, ...JSON.parse(raw) });
      return parsed.success ? parsed.data : fallback;
    } catch {
      return fallback;
    }
  }

  save(settings: Settings): void {
    try {
      this.store?.setItem(KEY, JSON.stringify(SettingsSchema.parse(settings)));
    } catch {
      // Storage unavailable: settings still apply for this session.
    }
  }
}
