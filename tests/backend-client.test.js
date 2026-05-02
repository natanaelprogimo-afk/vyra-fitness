jest.mock('../lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: jest.fn(),
      getUser: jest.fn(),
    },
  },
}));

jest.mock('../stores/authStore', () => ({
  useAuthStore: {
    getState: jest.fn(),
  },
}));

jest.mock('expo/virtual/env', () => ({
  env: process.env,
}), { virtual: true });

process.env.EXPO_PUBLIC_API_URL = 'https://api.vyra.test';

const { supabase } = require('../lib/supabase');
const { useAuthStore } = require('../stores/authStore');
const { getAuthHeaders, getCurrentUserId, requestJson } = require('../services/backend/client');
const { getReferralOverview } = require('../services/backend/referrals');

describe('backend client auth fallback', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useAuthStore.getState.mockReturnValue({ session: null, user: null });
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('falls back to the auth store token when Supabase session is still null', async () => {
    supabase.auth.getSession.mockResolvedValue({ data: { session: null } });
    useAuthStore.getState.mockReturnValue({
      session: { access_token: 'store-token' },
      user: { id: 'store-user' },
    });

    await expect(getAuthHeaders()).resolves.toEqual({
      'Content-Type': 'application/json',
      Authorization: 'Bearer store-token',
    });
  });

  test('falls back to the auth store user id when Supabase user is still null', async () => {
    supabase.auth.getUser.mockResolvedValue({ data: { user: null } });
    useAuthStore.getState.mockReturnValue({
      session: null,
      user: { id: 'store-user' },
    });

    await expect(getCurrentUserId()).resolves.toBe('store-user');
  });

  test('requestJson keeps empty 200 responses parse-safe', async () => {
    global.fetch.mockResolvedValue({
      ok: true,
      status: 200,
      text: jest.fn().mockResolvedValue(''),
    });

    await expect(requestJson('/health', { method: 'GET' })).resolves.toEqual({
      ok: true,
      status: 200,
      data: null,
      text: '',
    });
  });

  test('requestJson aborts slow backend calls with a stable timeout error', async () => {
    jest.useFakeTimers();
    global.fetch.mockImplementation((_url, init = {}) => new Promise((_, reject) => {
      init.signal?.addEventListener('abort', () => reject(new Error('aborted by test signal')), { once: true });
    }));

    const request = requestJson('/slow', { method: 'GET', timeoutMs: 50 });
    const assertion = expect(request).rejects.toThrow('Request timed out after 50ms');
    await jest.advanceTimersByTimeAsync(50);

    await assertion;
  });

  test('referral overview degrades gracefully when the backend returns 200 with an empty body', async () => {
    supabase.auth.getSession.mockResolvedValue({ data: { session: { access_token: 'session-token' } } });
    global.fetch.mockResolvedValue({
      ok: true,
      status: 200,
      text: jest.fn().mockResolvedValue(''),
    });

    await expect(getReferralOverview()).resolves.toEqual({
      ok: false,
      error: 'Invitaciones respondio sin datos utiles. Reintenta en unos segundos.',
      status: 200,
      reason: 'unavailable',
      retryable: true,
    });
  });
});
