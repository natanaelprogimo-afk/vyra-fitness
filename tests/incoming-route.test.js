const { extractRouteFromIncomingUrl, normalizeIncomingRoute } = require('../lib/incoming-route');

describe('extractRouteFromIncomingUrl', () => {
  it('extracts premium routes from Expo-style deep links', () => {
    expect(
      extractRouteFromIncomingUrl(
        'vyrafitness://premium/paywall?subscription_status=cancelled&subscription_id=I-123',
      ),
    ).toBe('/premium/paywall?subscription_status=cancelled&subscription_id=I-123');
  });

  it('extracts premium routes from single-slash redirects', () => {
    expect(
      extractRouteFromIncomingUrl(
        'vyrafitness:/premium/paywall?subscription_status=pending&plan=monthly',
      ),
    ).toBe('/premium/paywall?subscription_status=pending&plan=monthly');
  });

  it('normalizes home-style aliases to the tab root', () => {
    expect(extractRouteFromIncomingUrl('vyrafitness://home')).toBe('/(tabs)');
    expect(extractRouteFromIncomingUrl('vyrafitness://(tabs)')).toBe('/(tabs)');
    expect(normalizeIncomingRoute('/(tabs)/index')).toBe('/(tabs)');
  });

  it('normalizes public explore and progress aliases', () => {
    expect(extractRouteFromIncomingUrl('vyrafitness://explore')).toBe('/(tabs)/explore');
    expect(extractRouteFromIncomingUrl('vyrafitness://progress')).toBe('/(tabs)/progress');
  });

  it('ignores plain web urls', () => {
    expect(extractRouteFromIncomingUrl('https://vyra-backend-5fd9.onrender.com/mercadopago/cancel')).toBeNull();
  });
});
