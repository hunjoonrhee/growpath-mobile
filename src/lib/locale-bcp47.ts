import { SUPPORTED_LANGUAGES, type SupportedLanguage } from '@/lib/i18n';

/** BCP-47 tags expo-speech-recognition (and Apple's Speech framework under it) expect - our SUPPORTED_LANGUAGES codes alone aren't valid locale identifiers. */
const BCP47_BY_LANGUAGE: Record<SupportedLanguage, string> = {
  ko: 'ko-KR',
  de: 'de-DE',
  en: 'en-US',
};

// i18n.language is a plain string in react-i18next's types (it can carry a
// region suffix like "en-US" depending on the device), not narrowed to our
// SupportedLanguage union - falls back to Korean same as i18n.ts's own
// device-language resolution.
export function toBcp47(language: string): string {
  const base = language.split('-')[0];
  const match = SUPPORTED_LANGUAGES.find((lang) => lang === base);
  return BCP47_BY_LANGUAGE[match ?? 'ko'];
}
