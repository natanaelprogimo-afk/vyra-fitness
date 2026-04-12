import { Linking, Platform } from 'react-native';

export type HealthConnectSleepStatus =
  | 'unsupported'
  | 'unavailable'
  | 'provider_update_required'
  | 'permissions_missing'
  | 'ready'
  | 'error';

export interface HealthConnectSleepSession {
  source: 'health_connect' | 'google_fit' | 'wearable';
  sourceRecordId: string;
  sourceOrigin: string | null;
  sourceDevice: string | null;
  startTime: string;
  endTime: string;
  durationMin: number;
  deepMin: number;
  remMin: number;
  lightMin: number;
  awakeMin: number;
  qualityScore: number;
}

export interface HealthConnectSleepSyncResult {
  status: HealthConnectSleepStatus;
  permissionsGranted: boolean;
  records: HealthConnectSleepSession[];
  message: string | null;
}

const HEALTH_CONNECT_WEB_URL =
  'https://play.google.com/store/apps/details?id=com.google.android.apps.healthdata';

export async function openHealthConnectApp(): Promise<void> {
  if (Platform.OS !== 'android') return;
  const canOpen = await Linking.canOpenURL(HEALTH_CONNECT_WEB_URL).catch(() => false);
  if (canOpen) {
    await Linking.openURL(HEALTH_CONNECT_WEB_URL);
  }
}

export async function syncSleepSessionsFromHealthConnect(_options?: {
  promptForPermissions?: boolean;
  daysBack?: number;
}): Promise<HealthConnectSleepSyncResult> {
  if (Platform.OS !== 'android') {
    return {
      status: 'unsupported',
      permissionsGranted: false,
      records: [],
      message: 'Health Connect solo esta disponible en Android.',
    };
  }

  return {
    status: 'unavailable',
    permissionsGranted: false,
    records: [],
    message:
      'La sincronizacion automatica con Health Connect esta temporalmente desactivada en esta compilacion. Puedes seguir registrando tu sueno manualmente.',
  };
}
