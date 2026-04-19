import Constants from 'expo-constants';
import type { KoraMood, KoraStage } from '@/lib/kora';

function getBaseUrl(): string {
  const envUrl = process.env.EXPO_PUBLIC_KORA_ASSETS_BASE_URL;
  const extraUrl = (Constants.expoConfig?.extra as Record<string, unknown> | undefined)?.koraAssetsBaseUrl;
  const raw = typeof envUrl === 'string' && envUrl.trim().length > 0
    ?  envUrl
    : typeof extraUrl === 'string'
      ?  extraUrl
      : '';
  return raw.replace(/\/+$/, '');
}

export function getKoraAssetUrl(mood: KoraMood, stage: KoraStage): string | null {
  const base = getBaseUrl();
  if (!base) return null;
  return `${base}/${stage}/${mood}.json`;
}
