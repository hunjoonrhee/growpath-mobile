import { getLocales } from 'expo-localization';
import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';

import de from '@/locales/de.json';
import en from '@/locales/en.json';
import ko from '@/locales/ko.json';

const SUPPORTED_LANGUAGES = ['ko', 'de', 'en'] as const;
type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

function resolveDeviceLanguage(): SupportedLanguage {
  const deviceLanguageCode = getLocales()[0]?.languageCode;
  return (SUPPORTED_LANGUAGES as readonly string[]).includes(deviceLanguageCode ?? '')
    ? (deviceLanguageCode as SupportedLanguage)
    : 'ko';
}

// this is i18next's documented API (i18next.use(...).init(...)), not a mixed-up named import
// eslint-disable-next-line import/no-named-as-default-member
void i18next.use(initReactI18next).init({
  compatibilityJSON: 'v4',
  lng: resolveDeviceLanguage(),
  fallbackLng: 'ko',
  resources: {
    ko: { translation: ko },
    de: { translation: de },
    en: { translation: en },
  },
  interpolation: {
    escapeValue: false,
  },
});

export default i18next;
