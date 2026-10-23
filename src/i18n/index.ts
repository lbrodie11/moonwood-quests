import i18next, { type TOptions } from "i18next";
import enUS from "./locales/en-US.json";
import esUS from "./locales/es-US.json";

export const LANGUAGE_CODES = ["en-US", "es-US"] as const;

export type LanguageCode = (typeof LANGUAGE_CODES)[number];

/** Labels are shown in their own language so anyone can find theirs. */
export const LANGUAGES: readonly { code: LanguageCode; label: string }[] = [
  { code: "en-US", label: "English" },
  { code: "es-US", label: "Español" },
];

export const DEFAULT_LANGUAGE: LanguageCode = "en-US";

export function isLanguage(value: unknown): value is LanguageCode {
  return LANGUAGES.some((l) => l.code === value);
}

/** Resources are bundled: no runtime fetching of translation files. */
export async function initI18n(language: LanguageCode): Promise<void> {
  await i18next.init({
    lng: language,
    fallbackLng: DEFAULT_LANGUAGE,
    resources: {
      "en-US": { translation: enUS },
      "es-US": { translation: esUS },
    },
    // We only ever write text via textContent, never innerHTML.
    interpolation: { escapeValue: false },
  });
  document.documentElement.lang = language;
}

export async function setLanguage(language: LanguageCode): Promise<void> {
  await i18next.changeLanguage(language);
  document.documentElement.lang = language;
}

export function t(key: string, options?: TOptions): string {
  return i18next.t(key, options) as string;
}

export function currentLanguage(): LanguageCode {
  return isLanguage(i18next.language) ? i18next.language : DEFAULT_LANGUAGE;
}
