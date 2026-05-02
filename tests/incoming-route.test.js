const { extractRouteFromIncomingUrl } = require('../lib/incoming-route');

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

  it('ignores plain web urls', () => {
    expect(extractRouteFromIncomingUrl('https://vyra-backend-5fd9.onrender.com/mercadopago/cancel')).toBeNull();
  });
});
