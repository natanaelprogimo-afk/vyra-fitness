let ignoreNextSignedOutEvent = false;
let qaBridgeRuntimeMode = false;
type QaBridgePayload = {
  access_token?: string;
  refresh_token?: string;
  email?: string;
  password?: string;
  next?: string;
  hold?: string;
};
let qaBridgePayload: QaBridgePayload | null = null;

function normalizeQaBridgePath(url: URL) {
  return `${url.host || ''}${url.pathname || ''}`.replace(/^\/+|\/+$/g, '');
}

export function extractQaBridgePayload(url: string | null | undefined): QaBridgePayload | null {
  if (!url) return null;

  try {
    const parsed = new URL(url);
    if (normalizeQaBridgePath(parsed) !== 'session-bridge') return null;

    const payload: QaBridgePayload = {};
    const keys: Array<keyof QaBridgePayload> = [
      'access_token',
      'refresh_token',
      'email',
      'password',
      'next',
      'hold',
    ];

    for (const key of keys) {
      const value = parsed.searchParams.get(key);
      if (!value) continue;

      const normalized = value.trim();
      if (!normalized) continue;
      payload[key] = normalized;
    }

    return payload;
  } catch {
    return null;
  }
}

export function armQaBridgeSignedOutBypass() {
  ignoreNextSignedOutEvent = true;
}

export function consumeQaBridgeSignedOutBypass() {
  if (!ignoreNextSignedOutEvent) return false;
  ignoreNextSignedOutEvent = false;
  return true;
}

export function armQaBridgeRuntimeMode() {
  qaBridgeRuntimeMode = true;
}

export function clearQaBridgeRuntimeMode() {
  qaBridgeRuntimeMode = false;
}

export function isQaBridgeRuntimeModeEnabled() {
  return qaBridgeRuntimeMode;
}

export function setQaBridgePayload(payload: QaBridgePayload | null) {
  qaBridgePayload = payload;
}

export function getQaBridgePayload() {
  return qaBridgePayload;
}

export function clearQaBridgePayload() {
  qaBridgePayload = null;
}
