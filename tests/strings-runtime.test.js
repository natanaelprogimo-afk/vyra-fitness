const i18nModule = require('../lib/i18n');
const {
  getLocalizedStrings,
  AuthStrings,
  ErrorMessages,
} = require('../constants/strings');

describe('runtime localized strings', () => {
  afterEach(async () => {
    await i18nModule.default.changeLanguage('es');
  });

  test('returns Portuguese strings when locale is pt-BR', () => {
    const strings = getLocalizedStrings('pt-BR');

    expect(strings.AuthStrings.welcome.cta).toBe('Comecar gratis');
    expect(strings.General.settings).toBe('Ajustes');
  });

  test('proxy namespaces follow the active i18n language', async () => {
    await i18nModule.default.changeLanguage('en');
    expect(AuthStrings.welcome.cta).toBe('Start free');
    expect(ErrorMessages.loginFailed).toBe(
      'I could not sign you in. Check your details and try again.',
    );

    await i18nModule.default.changeLanguage('pt');
    expect(AuthStrings.welcome.cta).toBe('Comecar gratis');
    expect(ErrorMessages.loginFailed).toBe(
      'Nao consegui entrar. Revise seus dados e tente novamente.',
    );
  });
});
