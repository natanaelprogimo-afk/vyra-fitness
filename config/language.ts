export const SUPPORTED_LANGUAGES = ['es', 'en', 'pt', 'ru', 'hi', 'zh', 'fr', 'de', 'it', 'ar', 'ja', 'ko', 'id', 'tr', 'vi', 'pl', 'nl', 'sv', 'el', 'th', 'he'] as const;

export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

export function resolveSupportedLanguage(locale: string | null | undefined): SupportedLanguage {
  const normalized = (locale ?? '').trim().toLowerCase();

  if (normalized.startsWith('pt')) return 'pt';
  if (normalized.startsWith('ru')) return 'ru';
  if (normalized.startsWith('hi')) return 'hi';
  if (normalized.startsWith('zh')) return 'zh';
  if (normalized.startsWith('fr')) return 'fr';
  if (normalized.startsWith('de')) return 'de';
  if (normalized.startsWith('it')) return 'it';
  if (normalized.startsWith('ar')) return 'ar';
  if (normalized.startsWith('ja')) return 'ja';
  if (normalized.startsWith('ko')) return 'ko';
  if (normalized.startsWith('id')) return 'id';
  if (normalized.startsWith('tr')) return 'tr';
  if (normalized.startsWith('vi')) return 'vi';
  if (normalized.startsWith('pl')) return 'pl';
  if (normalized.startsWith('nl')) return 'nl';
  if (normalized.startsWith('sv')) return 'sv';
  if (normalized.startsWith('el')) return 'el';
  if (normalized.startsWith('th')) return 'th';
  if (normalized.startsWith('he')) return 'he';
  if (normalized.startsWith('en')) return 'en';
  return 'es';
}

export function detectDeviceLanguage(): SupportedLanguage {
  try {
    const locale = Intl.DateTimeFormat().resolvedOptions().locale ?? 'es';
    return resolveSupportedLanguage(locale);
  } catch {
    return 'es';
  }
}
