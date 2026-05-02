// ============================================================
// VYRA FITNESS — i18n bootstrap (i18next + react-i18next)
// ============================================================

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as ES from '@/constants/strings.es';
import * as EN from '@/constants/strings.en';
import * as PT from '@/constants/strings.pt';
import { detectDeviceLanguage, type SupportedLanguage } from '@/lib/language';

if (!Intl.PluralRules) {
  // Polyfill for Hermes / older Android Intl
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  require('@formatjs/intl-pluralrules/polyfill.js');
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  require('@formatjs/intl-pluralrules/locale-data/es.js');
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  require('@formatjs/intl-pluralrules/locale-data/en.js');
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  require('@formatjs/intl-pluralrules/locale-data/pt.js');
}

const resources = {
  es: { translation: ES },
  en: { translation: EN },
  pt: { translation: PT },
} as const;

if (!i18n.isInitialized) {
  i18n.use(initReactI18next).init({
    resources,
    lng: detectDeviceLanguage(),
    fallbackLng: 'es',
    interpolation: {
      escapeValue: false,
    },
  });
}

export function setI18nLanguage(language: SupportedLanguage | 'system') {
  const next = language === 'system' ? detectDeviceLanguage() : language;
  if (i18n.language !== next) {
    i18n.changeLanguage(next);
  }
}

export default i18n;
