const {
  detectDeviceLanguage,
  resolveSupportedLanguage,
} = require('../lib/language');

describe('language helpers', () => {
  test('maps supported locales to es/en/pt', () => {
    expect(resolveSupportedLanguage('es-UY')).toBe('es');
    expect(resolveSupportedLanguage('en-US')).toBe('en');
    expect(resolveSupportedLanguage('pt-BR')).toBe('pt');
    expect(resolveSupportedLanguage('pt-PT')).toBe('pt');
  });

  test('falls back to spanish for unknown or empty locales', () => {
    expect(resolveSupportedLanguage('xx-XX')).toBe('es');
    expect(resolveSupportedLanguage('')).toBe('es');
    expect(resolveSupportedLanguage(null)).toBe('es');
    expect(resolveSupportedLanguage(undefined)).toBe('es');
  });

  test('detects current device language through Intl', () => {
    const original = Intl.DateTimeFormat;

    Intl.DateTimeFormat = jest.fn(() => ({
      resolvedOptions: () => ({ locale: 'pt-BR' }),
    }));

    expect(detectDeviceLanguage()).toBe('pt');

    Intl.DateTimeFormat = original;
  });
});
