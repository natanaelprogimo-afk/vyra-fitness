import { Linking, Platform } from 'react-native';
import {
  SdkAvailabilityStatus,
  SleepStageType,
  getGrantedPermissions,
  getSdkStatus,
  initialize,
  openHealthConnectSettings,
  readRecords,
  requestPermission,
  type Permission,
} from 'react-native-health-connect';

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

type SleepPermission = Permission | { accessType: string; recordType: string };

type HealthConnectSleepRecord = {
  startTime: string;
  endTime: string;
  stages?: Array<{
    startTime: string;
    endTime: string;
    stage: number;
  }>;
  metadata?: {
    id?: string;
    dataOrigin?: string;
    device?: {
      manufacturer?: string;
      model?: string;
      type?: number;
    };
  };
};

const HEALTH_CONNECT_WEB_URL =
  'https://play.google.com/store/apps/details?id=com.google.android.apps.healthdata';
const NATIVE_TIMEOUT_MS = 4500;
const PERMISSION_TIMEOUT_MS = 15000;

type SleepReadResult = {
  records?: HealthConnectSleepRecord[];
};

function hasSleepReadPermission(
  permissions: SleepPermission[],
): boolean {
  return permissions.some(
    (permission) =>
      permission.accessType === 'read' && permission.recordType === 'SleepSession',
  );
}

async function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  fallbackValue: T,
): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | null = null;

  try {
    return await Promise.race<T>([
      promise,
      new Promise<T>((resolve) => {
        timer = setTimeout(() => resolve(fallbackValue), timeoutMs);
      }),
    ]);
  } finally {
    if (timer) {
      clearTimeout(timer);
    }
  }
}

function durationMinutes(startTime: string, endTime: string): number {
  const startMs = Date.parse(startTime);
  const endMs = Date.parse(endTime);
  if (!Number.isFinite(startMs) || !Number.isFinite(endMs) || endMs <= startMs) {
    return 0;
  }
  return Math.max(0, Math.round((endMs - startMs) / 60000));
}

function stageMinutes(
  stages: HealthConnectSleepRecord['stages'],
  stageType: number,
): number {
  return (stages ?? []).reduce((total, stage) => {
    if (stage.stage !== stageType) return total;
    return total + durationMinutes(stage.startTime, stage.endTime);
  }, 0);
}

function buildSourceDevice(record: HealthConnectSleepRecord): string | null {
  const manufacturer = record.metadata?.device?.manufacturer?.trim();
  const model = record.metadata?.device?.model?.trim();
  const parts = [manufacturer, model].filter(Boolean);
  return parts.length ? parts.join(' ') : null;
}

function resolveSource(
  origin: string | null,
  deviceName: string | null,
): HealthConnectSleepSession['source'] {
  const raw = `${origin ?? ''} ${deviceName ?? ''}`.toLowerCase();
  if (raw.includes('fit')) return 'google_fit';
  if (
    raw.includes('wear') ||
    raw.includes('watch') ||
    raw.includes('band') ||
    raw.includes('ring')
  ) {
    return 'wearable';
  }
  return 'health_connect';
}

function buildQualityScore(
  durationMin: number,
  deepMin: number,
  remMin: number,
  awakeMin: number,
): number {
  if (durationMin <= 0) return 0;

  const durationScore = Math.min(1, durationMin / (8 * 60));
  const deepScore = Math.min(1, deepMin / Math.max(1, durationMin * 0.18));
  const remScore = Math.min(1, remMin / Math.max(1, durationMin * 0.2));
  const awakePenalty = Math.max(0, 1 - awakeMin / Math.max(1, durationMin * 0.12));

  return Math.max(
    0,
    Math.min(
      100,
      Math.round(durationScore * 45 + deepScore * 20 + remScore * 20 + awakePenalty * 15),
    ),
  );
}

function mapSleepRecord(record: HealthConnectSleepRecord): HealthConnectSleepSession {
  const deepMin = stageMinutes(record.stages, SleepStageType.DEEP);
  const remMin = stageMinutes(record.stages, SleepStageType.REM);
  const awakeMin =
    stageMinutes(record.stages, SleepStageType.AWAKE) +
    stageMinutes(record.stages, SleepStageType.OUT_OF_BED);
  const lightMin =
    stageMinutes(record.stages, SleepStageType.LIGHT) +
    stageMinutes(record.stages, SleepStageType.SLEEPING);
  const durationMin = durationMinutes(record.startTime, record.endTime);
  const sourceOrigin = record.metadata?.dataOrigin ?? null;
  const sourceDevice = buildSourceDevice(record);

  return {
    source: resolveSource(sourceOrigin, sourceDevice),
    sourceRecordId:
      record.metadata?.id ??
      `${record.startTime}-${record.endTime}-${sourceOrigin ?? 'health-connect'}`,
    sourceOrigin,
    sourceDevice,
    startTime: record.startTime,
    endTime: record.endTime,
    durationMin,
    deepMin,
    remMin,
    lightMin,
    awakeMin,
    qualityScore: buildQualityScore(durationMin, deepMin, remMin, awakeMin),
  };
}

export async function openHealthConnectApp(): Promise<void> {
  if (Platform.OS !== 'android') return;

  try {
    openHealthConnectSettings();
    return;
  } catch (err) {
    const canOpen = await Linking.canOpenURL(HEALTH_CONNECT_WEB_URL).catch((e) => {
      console.debug?.('[health-connect-sleep] Linking.canOpenURL failed', e);
      return false;
    });
    if (canOpen) {
      await Linking.openURL(HEALTH_CONNECT_WEB_URL);
    }
  }
}

export async function syncSleepSessionsFromHealthConnect(options?: {
  promptForPermissions?: boolean;
  daysBack?: number;
}): Promise<HealthConnectSleepSyncResult> {
  if (Platform.OS !== 'android') {
    return {
      status: 'unsupported',
      permissionsGranted: false,
      records: [],
      message: 'Health Connect solo está disponible en Android.',
    };
  }

  try {
    const sdkStatus = await withTimeout(
      getSdkStatus().catch((e) => {
        console.debug?.('[health-connect-sleep] getSdkStatus failed', e);
        return SdkAvailabilityStatus.SDK_UNAVAILABLE;
      }),
      NATIVE_TIMEOUT_MS,
      SdkAvailabilityStatus.SDK_UNAVAILABLE,
    );
    if (sdkStatus === SdkAvailabilityStatus.SDK_UNAVAILABLE_PROVIDER_UPDATE_REQUIRED) {
      return {
        status: 'provider_update_required',
        permissionsGranted: false,
        records: [],
        message: 'Actualiza Health Connect para recuperar sueño automáticamente.',
      };
    }

    if (sdkStatus !== SdkAvailabilityStatus.SDK_AVAILABLE) {
      return {
        status: 'unavailable',
        permissionsGranted: false,
        records: [],
        message: 'Health Connect no está disponible en este dispositivo.',
      };
    }

    const initialized = await withTimeout(
      initialize().catch((e) => {
        console.debug?.('[health-connect-sleep] initialize failed', e);
        return false;
      }),
      NATIVE_TIMEOUT_MS,
      false,
    );
    if (!initialized) {
      return {
        status: 'error',
        permissionsGranted: false,
        records: [],
        message: 'No se pudo inicializar Health Connect.',
      };
    }

    let grantedPermissions: SleepPermission[] = await withTimeout(
      getGrantedPermissions().catch((e) => {
        console.debug?.('[health-connect-sleep] getGrantedPermissions failed', e);
        return [] as SleepPermission[];
      }),
      PERMISSION_TIMEOUT_MS,
      [],
    );
    let granted = hasSleepReadPermission(grantedPermissions);

    if (!granted && options?.promptForPermissions) {
      const requestedPermissions = await withTimeout(
        requestPermission([
          { accessType: 'read', recordType: 'SleepSession' },
        ]).catch((e) => {
          console.debug?.('[health-connect-sleep] requestPermission failed', e);
          return [] as SleepPermission[];
        }),
        PERMISSION_TIMEOUT_MS,
        [],
      );
      grantedPermissions = requestedPermissions;
      granted = hasSleepReadPermission(requestedPermissions);

      if (!granted) {
        grantedPermissions = await withTimeout(
          getGrantedPermissions().catch((e) => {
            console.debug?.('[health-connect-sleep] getGrantedPermissions (second) failed', e);
            return [] as SleepPermission[];
          }),
          PERMISSION_TIMEOUT_MS,
          [],
        );
        granted = hasSleepReadPermission(grantedPermissions);
      }
    }

    if (!granted) {
      return {
        status: 'permissions_missing',
        permissionsGranted: false,
        records: [],
        message:
          'Permite lectura de sueño en Health Connect para recuperar sesiones automáticamente.',
      };
    }

    const daysBack = Math.max(1, options?.daysBack ?? 7);
    const start = new Date();
    start.setDate(start.getDate() - daysBack);
    start.setHours(0, 0, 0, 0);

    const result = await withTimeout(
      readRecords('SleepSession', {
        timeRangeFilter: {
          operator: 'between',
          startTime: start.toISOString(),
          endTime: new Date().toISOString(),
        },
        ascendingOrder: false,
        pageSize: 30,
      }).catch((e) => {
        console.debug?.('[health-connect-sleep] readRecords SleepSession failed', e);
        return null;
      }) as Promise<SleepReadResult | null>,
      NATIVE_TIMEOUT_MS,
      null,
    );

    if (!result) {
      return {
        status: 'error',
        permissionsGranted: granted,
        records: [],
        message: 'No se pudo leer sueÃ±o desde Health Connect.',
      };
    }

    const records = (result.records ?? []).map((record) =>
      mapSleepRecord(record as HealthConnectSleepRecord),
    );

    return {
      status: 'ready',
      permissionsGranted: true,
      records,
      message:
        records.length > 0
          ? `Leímos ${records.length} sesión${records.length === 1 ? '' : 'es'} de sueño desde Health Connect.`
          : 'No encontramos sesiones de sueño en Health Connect para este periodo.',
    };
  } catch (error) {
    return {
      status: 'error',
      permissionsGranted: false,
      records: [],
      message:
        error instanceof Error
          ?  error.message
          : 'No se pudo leer sueño desde Health Connect.',
    };
  }
}

