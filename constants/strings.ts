import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import i18n from '@/lib/i18n';
import { resolveSupportedLanguage, type SupportedLanguage } from '@/lib/language';
import * as ES from './strings.es';
import * as EN from './strings.en';
import * as PT from './strings.pt';

type StringsDictionary = typeof ES;
type StringsNamespace = keyof StringsDictionary;

const STRINGS_BY_LANGUAGE = {
  es: ES,
  en: EN,
  pt: PT,
} as unknown as Record<SupportedLanguage, StringsDictionary>;

function getResolvedLanguage(language?: string | null): SupportedLanguage {
  return resolveSupportedLanguage(language ?? i18n.resolvedLanguage ?? i18n.language);
}

export function getLocalizedStrings(language?: string | null): StringsDictionary {
  return STRINGS_BY_LANGUAGE[getResolvedLanguage(language)];
}

function createNamespaceProxy<Key extends StringsNamespace>(namespace: Key): StringsDictionary[Key] {
  return new Proxy({} as StringsDictionary[Key], {
    get(_target, prop) {
      return getLocalizedStrings()[namespace][prop as keyof StringsDictionary[Key]];
    },
    ownKeys() {
      return Reflect.ownKeys(getLocalizedStrings()[namespace]);
    },
    getOwnPropertyDescriptor() {
      return {
        configurable: true,
        enumerable: true,
      };
    },
  });
}

export function useLocalizedStrings() {
  const { i18n: i18next } = useTranslation();

  return useMemo(
    () => getLocalizedStrings(i18next.resolvedLanguage ?? i18next.language),
    [i18next.language, i18next.resolvedLanguage],
  );
}

export const ErrorMessages = createNamespaceProxy('ErrorMessages');
export const AuthStrings = createNamespaceProxy('AuthStrings');
export const OnboardingStrings = createNamespaceProxy('OnboardingStrings');
export const DashboardStrings = createNamespaceProxy('DashboardStrings');
export const ModuleNames = createNamespaceProxy('ModuleNames');
export const ModuleEmojis = createNamespaceProxy('ModuleEmojis');
export const Disclaimers = createNamespaceProxy('Disclaimers');
export const NotificationStrings = createNamespaceProxy('NotificationStrings');
export const General = createNamespaceProxy('General');
export const ValidationMessages = createNamespaceProxy('ValidationMessages');
export const FastingLabels = createNamespaceProxy('FastingLabels');
export const FemaleHealthLabels = createNamespaceProxy('FemaleHealthLabels');
export const WorkoutLabels = createNamespaceProxy('WorkoutLabels');
export const TabBarCopy = createNamespaceProxy('TabBarCopy');
export const BmiCategories = createNamespaceProxy('BmiCategories');
export const ComponentMessages = createNamespaceProxy('ComponentMessages');
export const MentalLabels = createNamespaceProxy('MentalLabels');
export const ReadinessLabels = createNamespaceProxy('ReadinessLabels');
export const ReferralMessages = createNamespaceProxy('ReferralMessages');
export const NotificationMessages = createNamespaceProxy('NotificationMessages');
export const PrivacyTexts = createNamespaceProxy('PrivacyTexts');
export const ExplorePageStrings = createNamespaceProxy('ExplorePageStrings');
export const HomePageStrings = createNamespaceProxy('HomePageStrings');
export const ProgressPageStrings = createNamespaceProxy('ProgressPageStrings');
export const HomeDetailStrings = createNamespaceProxy('HomeDetailStrings');
export const WaterHydrationMessages = createNamespaceProxy('WaterHydrationMessages');
export const StepsProgressMessages = createNamespaceProxy('StepsProgressMessages');
export const ForgotPasswordStrings = createNamespaceProxy('ForgotPasswordStrings');
export const FastingMetabolicZones = createNamespaceProxy('FastingMetabolicZones');
export const FemaleSymptoms = createNamespaceProxy('FemaleSymptoms');
export const FemaleMoods = createNamespaceProxy('FemaleMoods');
export const SupplementUnitLabels = createNamespaceProxy('SupplementUnitLabels');
export const SupplementFrequencyLabels = createNamespaceProxy('SupplementFrequencyLabels');
export const SupplementTimeSlots = createNamespaceProxy('SupplementTimeSlots');
export const WorkoutDifficultyLevels = createNamespaceProxy('WorkoutDifficultyLevels');
export const BiometricLabels = createNamespaceProxy('BiometricLabels');
export const ShellStrings = createNamespaceProxy('ShellStrings');
export const NutritionModule = createNamespaceProxy('NutritionModule');
export const FemaleModule = createNamespaceProxy('FemaleModule');
export const FastingModule = createNamespaceProxy('FastingModule');
export const WaterModule = createNamespaceProxy('WaterModule');
