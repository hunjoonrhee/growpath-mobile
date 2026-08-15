// Roleplay's setup screen takes the practice language as free text (any
// script, any name the user happens to type), not a fixed picker - Speech-
// to-Text needs a real BCP-47 tag instead. Covers the languages this app
// actually targets (CLAUDE.md: 한국 -> 독일 -> 일본 market order); an
// unrecognized name just means voice input isn't offered for that session,
// text input still works either way.
const ROLEPLAY_LANGUAGE_BCP47: Record<string, string> = {
  독일어: 'de-DE',
  german: 'de-DE',
  deutsch: 'de-DE',
  de: 'de-DE',
  영어: 'en-US',
  english: 'en-US',
  en: 'en-US',
  한국어: 'ko-KR',
  korean: 'ko-KR',
  한글: 'ko-KR',
  ko: 'ko-KR',
  일본어: 'ja-JP',
  japanese: 'ja-JP',
  日本語: 'ja-JP',
  ja: 'ja-JP',
};

export function roleplayLanguageToBcp47(language: string): string | null {
  return ROLEPLAY_LANGUAGE_BCP47[language.trim().toLowerCase()] ?? null;
}
