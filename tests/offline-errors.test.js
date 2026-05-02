const { isRecoverableOfflineError } = require('../lib/offline-errors');

describe('offline error helpers', () => {
  test('detects fetch-style network failures as recoverable', () => {
    expect(isRecoverableOfflineError(new Error('TypeError: Network request failed'))).toBe(true);
    expect(isRecoverableOfflineError(new Error('Failed to fetch'))).toBe(true);
    expect(isRecoverableOfflineError(new Error('Socket timeout while saving'))).toBe(true);
  });

  test('does not hide non-network application errors', () => {
    expect(isRecoverableOfflineError(new Error('duplicate key value violates unique constraint'))).toBe(false);
    expect(isRecoverableOfflineError(new Error('permission denied'))).toBe(false);
  });
});
