import * as SecureStore from 'expo-secure-store';

const SENSITIVE_KEY_ALIAS = 'vyra_sensitive_key_v1';
const ENCRYPTION_PREFIX = 'enc_v1';

function randomString(length: number): string {
  const alphabet = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let out = '';
  for (let i = 0; i < length; i += 1) {
    const idx = Math.floor(Math.random() * alphabet.length);
    out += alphabet[idx] ?? 'x';
  }
  return out;
}

async function getOrCreateKey(): Promise<string> {
  const existing = await SecureStore.getItemAsync(SENSITIVE_KEY_ALIAS);
  if (existing && existing.length >= 16) return existing;

  const created = randomString(64);
  await SecureStore.setItemAsync(SENSITIVE_KEY_ALIAS, created);
  return created;
}

function utf8ToBytes(value: string): number[] {
  const encoded = encodeURIComponent(value);
  const bytes: number[] = [];

  for (let i = 0; i < encoded.length; i += 1) {
    const ch = encoded[i];
    if (ch === '%' && i + 2 < encoded.length) {
      bytes.push(parseInt(encoded.slice(i + 1, i + 3), 16));
      i += 2;
    } else {
      bytes.push(ch.charCodeAt(0));
    }
  }

  return bytes;
}

function bytesToUtf8(bytes: number[]): string {
  let encoded = '';
  for (const byte of bytes) {
    if (byte >= 0x20 && byte <= 0x7e && byte !== 0x25) {
      encoded += String.fromCharCode(byte);
    } else {
      encoded += `%${byte.toString(16).padStart(2, '0').toUpperCase()}`;
    }
  }
  return decodeURIComponent(encoded);
}

function toHex(bytes: number[]): string {
  return bytes.map((byte) => byte.toString(16).padStart(2, '0')).join('');
}

function fromHex(hex: string): number[] {
  const safe = hex.trim().toLowerCase();
  const bytes: number[] = [];
  for (let i = 0; i < safe.length; i += 2) {
    const pair = safe.slice(i, i + 2);
    const value = parseInt(pair, 16);
    if (Number.isNaN(value)) return [];
    bytes.push(value);
  }
  return bytes;
}

function xorBytes(data: number[], key: number[]): number[] {
  if (!key.length) return [...data];
  return data.map((byte, index) => byte ^ key[index % key.length]!);
}

function decodeNonceFromHex(value: string): string {
  const decoded = bytesToUtf8(fromHex(value));
  return decoded || '';
}

export function isEncryptedSensitiveValue(value: unknown): boolean {
  return typeof value === 'string' && value.startsWith(`${ENCRYPTION_PREFIX}:`);
}

export async function encryptSensitiveText(value: string | null | undefined): Promise<string | null> {
  if (!value) return null;
  if (isEncryptedSensitiveValue(value)) return value;

  const key = await getOrCreateKey();
  const nonce = randomString(12);
  const source = utf8ToBytes(value);
  const stream = utf8ToBytes(`${key}:${nonce}`);
  const encrypted = xorBytes(source, stream);
  const nonceHex = toHex(utf8ToBytes(nonce));

  return `${ENCRYPTION_PREFIX}:${nonceHex}:${toHex(encrypted)}`;
}

export async function decryptSensitiveText(value: string | null | undefined): Promise<string | null> {
  if (!value) return null;
  if (!isEncryptedSensitiveValue(value)) return value;

  const parts = value.split(':');
  if (parts.length !== 3) return value;

  const nonce = decodeNonceFromHex(parts[1] ?? '');
  const encryptedBytes = fromHex(parts[2] ?? '');
  if (!nonce || !encryptedBytes.length) return value;

  const key = await getOrCreateKey();
  const stream = utf8ToBytes(`${key}:${nonce}`);
  const plain = xorBytes(encryptedBytes, stream);

  try {
    return bytesToUtf8(plain);
  } catch {
    return null;
  }
}

export async function encryptSensitiveStringArray(values: string[] | null | undefined): Promise<string[]> {
  if (!Array.isArray(values) || values.length === 0) return [];
  const result: string[] = [];
  for (const value of values) {
    const encrypted = await encryptSensitiveText(value);
    if (encrypted) result.push(encrypted);
  }
  return result;
}

export async function decryptSensitiveStringArray(values: string[] | null | undefined): Promise<string[]> {
  if (!Array.isArray(values) || values.length === 0) return [];
  const result: string[] = [];
  for (const value of values) {
    const decrypted = await decryptSensitiveText(value);
    if (decrypted) result.push(decrypted);
  }
  return result;
}
