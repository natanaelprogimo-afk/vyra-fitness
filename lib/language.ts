export const SUPPORTED_LANGUAGES = ['es', 'en', 'pt'] as const;

export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

export function resolveSupportedLanguage(locale: string | null | undefined): SupportedLanguage {
  const normalized = (locale ?? '').trim().toLowerCase();

  if (normalized.startsWith('pt')) return 'pt';
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
