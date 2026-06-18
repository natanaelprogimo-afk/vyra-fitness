const rawApiBase =
  process.env.EXPO_PUBLIC_API_URL?.trim() ??
  process.env.EXPO_PUBLIC_BACKEND_URL?.trim() ??
  '';

const normalizedApiBase = rawApiBase.replace(/\/+$/, '');

export const API_BASE_URL = normalizedApiBase ? `${normalizedApiBase}/api` : '';

export default {
  API_BASE_URL,
};
