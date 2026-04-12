import Constants from 'expo-constants';

export interface SleepSoundItem {
  id: string;
  title: string;
  subtitle: string;
  filename: string;
}

const SOUND_LIBRARY: SleepSoundItem[] = [
 { id: 'rain', title: 'Lluvia suave', subtitle: 'Fondo constante para dormir', filename: 'rain.mp3' },
 { id: 'forest', title: 'Bosque nocturno', subtitle: 'Grillos, brisa y calma', filename: 'forest.mp3' },
 { id: 'ocean', title: 'Olas lentas', subtitle: 'Ritmo estable y profundo', filename: 'ocean.mp3' },
 { id: 'white', title: 'Ruido blanco', subtitle: 'Bloquea distracciones', filename: 'white.mp3' },
];

function getBaseUrl(): string {
  const envUrl = process.env.EXPO_PUBLIC_SLEEP_SOUNDS_BASE_URL;
  const extraUrl = (Constants.expoConfig?.extra as Record<string, unknown> | undefined)?.sleepSoundsBaseUrl;
  const raw =
    typeof envUrl === 'string' && envUrl.trim().length > 0
      ? envUrl
      : typeof extraUrl === 'string'
        ? extraUrl
        : '';
  return raw.replace(/\/+$/, '');
}

export function getSleepSoundLibrary(): { baseUrl: string; sounds: SleepSoundItem[] } {
  return {
    baseUrl: getBaseUrl(),
    sounds: SOUND_LIBRARY,
  };
}

export function getSleepSoundUrl(filename: string): string | null {
  const base = getBaseUrl();
  if (!base) return null;
  return `${base}/${filename}`;
}
