// ============================================================
// VYRA FITNESS — i18n bootstrap (i18next + react-i18next)
// ============================================================

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as ES from '@/constants/strings.es';
import * as EN from '@/constants/strings.en';
import * as PT from '@/constants/strings.pt';
import * as RU from '@/constants/strings.ru';
import * as HI from '@/constants/strings.hi';
import * as ZH from '@/constants/strings.zh';
import * as FR from '@/constants/strings.fr';
import * as DE from '@/constants/strings.de';
import * as IT from '@/constants/strings.it';
import * as AR from '@/constants/strings.ar';
import * as JA from '@/constants/strings.ja';
import * as KO from '@/constants/strings.ko';
import * as ID from '@/constants/strings.id';
import * as TR from '@/constants/strings.tr';
import * as VI from '@/constants/strings.vi';
import * as PL from '@/constants/strings.pl';
import * as NL from '@/constants/strings.nl';
import * as SV from '@/constants/strings.sv';
import * as EL from '@/constants/strings.el';
import * as TH from '@/constants/strings.th';
import * as HE from '@/constants/strings.he';
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
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  require('@formatjs/intl-pluralrules/locale-data/ru.js');
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  require('@formatjs/intl-pluralrules/locale-data/hi.js');
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  require('@formatjs/intl-pluralrules/locale-data/zh.js');
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  require('@formatjs/intl-pluralrules/locale-data/fr.js');
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  require('@formatjs/intl-pluralrules/locale-data/de.js');
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  require('@formatjs/intl-pluralrules/locale-data/it.js');
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  require('@formatjs/intl-pluralrules/locale-data/ar.js');
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  require('@formatjs/intl-pluralrules/locale-data/ja.js');
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  require('@formatjs/intl-pluralrules/locale-data/ko.js');
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  require('@formatjs/intl-pluralrules/locale-data/id.js');
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  require('@formatjs/intl-pluralrules/locale-data/tr.js');
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  require('@formatjs/intl-pluralrules/locale-data/vi.js');
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  require('@formatjs/intl-pluralrules/locale-data/pl.js');
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  require('@formatjs/intl-pluralrules/locale-data/nl.js');
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  require('@formatjs/intl-pluralrules/locale-data/sv.js');
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  require('@formatjs/intl-pluralrules/locale-data/el.js');
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  require('@formatjs/intl-pluralrules/locale-data/th.js');
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  require('@formatjs/intl-pluralrules/locale-data/he.js');
}

const resources = {
  es: { translation: ES },
  en: { translation: EN },
  pt: { translation: PT },
  ru: { translation: RU },
  hi: { translation: HI },
  zh: { translation: ZH },
  fr: { translation: FR },
  de: { translation: DE },
  it: { translation: IT },
  ar: { translation: AR },
  ja: { translation: JA },
  ko: { translation: KO },
  id: { translation: ID },
  tr: { translation: TR },
  vi: { translation: VI },
  pl: { translation: PL },
  nl: { translation: NL },
  sv: { translation: SV },
  el: { translation: EL },
  th: { translation: TH },
  he: { translation: HE },
} as const;

if (!i18n.isInitialized) {
  i18n.use(initReactI18next).init({
    resources,
    lng: 'es',
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
