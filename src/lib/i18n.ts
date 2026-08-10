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

// Guards against the cold-start read below resolving *after* the user has
// already picked a language via setAppLanguage - without this, that stale
// read would silently overwrite their just-made choice.
let userHasOverriddenLanguage = false;

// A language chosen on the Profile screen overrides the device-detected
// default once this resolves - async, so there's a brief flash of the
// device-detected language on cold start before it applies.
AsyncStorage.getItem(LANGUAGE_STORAGE_KEY)
  .then((stored) => {
    if (!userHasOverriddenLanguage && isSupportedLanguage(stored)) {
      // this is i18next's documented instance API, not a mixed-up named import
      // eslint-disable-next-line import/no-named-as-default-member
      void i18next.changeLanguage(stored);
    }
  })
  .catch(() => {
    // Storage read failed - keep the device-detected language already set above.
  });

// Serializes overlapping calls so two rapid picks (e.g. tapping "Deutsch"
// then "English" before the first write lands) apply in invocation order
// instead of racing - without this, whichever call's AsyncStorage write
// happens to resolve last could persist a language other than the one the
// UI ends up showing, and that mismatch would only surface on next cold
// start. This promise is a pure "previous call is done" signal (only ever
// resolved, never rejected) so one call's failure can't fail the next.
let languageWriteQueue: Promise<void> = Promise.resolve();

export async function setAppLanguage(language: SupportedLanguage): Promise<void> {
  userHasOverriddenLanguage = true;
  const previous = languageWriteQueue;
  let release!: () => void;
  languageWriteQueue = new Promise((resolve) => {
    release = resolve;
  });
  await previous;
  try {
    // Persist before applying, so a storage failure leaves the UI language
    // unchanged - matching the error alert the caller shows on rejection,
    // instead of visibly switching languages and then reporting failure.
    await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, language);
    // eslint-disable-next-line import/no-named-as-default-member
    await i18next.changeLanguage(language);
  } catch (error) {
    // The override attempt failed, so don't leave the cold-start restore
    // permanently suppressed - let it still apply if it hasn't resolved yet.
    userHasOverriddenLanguage = false;
    throw error;
  } finally {
    release();
  }
}

export default i18next;
