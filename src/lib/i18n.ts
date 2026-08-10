import AsyncStorage from '@react-native-async-storage/async-storage';
import { getLocales } from 'expo-localization';
import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';

import de from '@/locales/de.json';
import en from '@/locales/en.json';
import ko from '@/locales/ko.json';

export const SUPPORTED_LANGUAGES = ['ko', 'de', 'en'] as const;
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

const LANGUAGE_STORAGE_KEY = 'growpath.language';

function isSupportedLanguage(value: string | null | undefined): value is SupportedLanguage {
  return (SUPPORTED_LANGUAGES as readonly string[]).includes(value ?? '');
}

function resolveDeviceLanguage(): SupportedLanguage {
  const deviceLanguageCode = getLocales()[0]?.languageCode;
  return isSupportedLanguage(deviceLanguageCode) ? deviceLanguageCode : 'ko';
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

// A language chosen on the Profile screen overrides the device-detected
// default once this resolves - async, so there's a brief flash of the
// device-detected language on cold start before it applies.
AsyncStorage.getItem(LANGUAGE_STORAGE_KEY)
  .then((stored) => {
    if (isSupportedLanguage(stored)) {
      // this is i18next's documented instance API, not a mixed-up named import
      // eslint-disable-next-line import/no-named-as-default-member
      void i18next.changeLanguage(stored);
    }
  })
  .catch(() => {
    // Storage read failed - keep the device-detected language already set above.
  });

export async function setAppLanguage(language: SupportedLanguage): Promise<void> {
  // eslint-disable-next-line import/no-named-as-default-member
  await i18next.changeLanguage(language);
  await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, language);
}

export default i18next;
