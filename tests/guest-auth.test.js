const {
  buildManagedGuestCredentials,
  buildManagedGuestMetadata,
  isGuestAuthUser,
  normalizeManagedGuestName,
} = require('../lib/guest-auth');

describe('guest auth helpers', () => {
  test('treats anonymous Supabase sessions as guest users', () => {
    expect(
      isGuestAuthUser({
        is_anonymous: true,
        user_metadata: {},
      }),
    ).toBe(true);
  });

  test('treats managed guest metadata as guest until an upgrade identity is linked', () => {
    expect(
      isGuestAuthUser({
        is_anonymous: false,
        user_metadata: { vyra_guest: true },
        identities: [{ provider: 'email' }],
      }),
    ).toBe(true);

    expect(
      isGuestAuthUser({
        is_anonymous: false,
        user_metadata: { vyra_guest: true },
        identities: [{ provider: 'email' }, { provider: 'google' }],
      }),
    ).toBe(false);
  });

  test('builds local guest credentials with a disposable domain', () => {
    const credentials = buildManagedGuestCredentials(1777234727216);

    expect(credentials.email).toMatch(/^guest\.1777234727216\d{6}@vyra-guest\.example$/);
    expect(credentials.password).toMatch(/^VyraGuest!\d{10}$/);
  });

  test('normalizes legacy guest labels to the current display name', () => {
    expect(normalizeManagedGuestName('Invitado Vyra')).toBe('Invitado');
    expect(buildManagedGuestMetadata().name).toBe('Invitado');
  });
});
