import { Platform } from 'react-native';
import {
  SdkAvailabilityStatus,
  aggregateRecord,
  getGrantedPermissions,
  getSdkStatus,
  initialize,
  openHealthConnectSettings,
  readRecords,
  requestPermission,
  type Permission,
} from 'react-native-health-connect';

export type HealthConnectStepsStatus =
  | 'unsupported'
  | 'unavailable'
  | 'provider_update_required'
  | 'permissions_missing'
  | 'ready'
  | 'error';

export interface HealthConnectStepsResult {
  status: HealthConnectStepsStatus;
  permissionsGranted: boolean;
  steps: number;
  message: string | null;
  dataOrigins: string[];
}

type StepsAggregateResult = {
  COUNT_TOTAL?: number;
  dataOrigins?: string[];
};

type StepPermission = Permission | { accessType: string; recordType: string };

type StepsReadRecord = {
  count?: number | null;
  metadata?: {
    dataOrigin?: string | null;
  } | null;
};

type StepsReadResult = {
  records?: StepsReadRecord[];
};

type StepsSnapshot = {
  steps: number;
  dataOrigins: string[];
};

const NATIVE_TIMEOUT_MS = 4500;
const PERMISSION_TIMEOUT_MS = 15000;

function hasStepsReadPermission(permissions: StepPermission[]) {
  return permissions.some((permission) => permission.accessType === 'read' && permission.recordType === 'Steps');
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

function normalizeOrigins(origins: Array<string | null | undefined>): string[] {
  return Array.from(
    new Set(
      origins
        .map((origin) => origin?.trim())
        .filter((origin): origin is string => Boolean(origin)),
    ),
  );
}

async function readStepsSnapshot(startTime: string, endTime: string): Promise<StepsSnapshot | null> {
  const aggregate = await withTimeout(
    aggregateRecord({
      recordType: 'Steps',
      timeRangeFilter: {
        operator: 'between',
        startTime,
        endTime,
      },
    }).catch((e) => {
      console.debug?.('[health-connect-steps] aggregateRecord failed', e);
      return null;
    }) as Promise<StepsAggregateResult | null>,
    NATIVE_TIMEOUT_MS,
    null,
  );

  if (aggregate && typeof aggregate.COUNT_TOTAL === 'number') {
    return {
      steps: Math.max(0, Math.round(aggregate.COUNT_TOTAL)),
      dataOrigins: normalizeOrigins(aggregate.dataOrigins ?? []),
    };
  }

  const readStepsRecords = readRecords as unknown as (
    recordType: 'Steps',
    options: {
      timeRangeFilter: { operator: 'between'; startTime: string; endTime: string };
      ascendingOrder?: boolean;
      pageSize?: number;
    },
  ) => Promise<StepsReadResult>;

  const recordsResult = await withTimeout(
    readStepsRecords('Steps', {
      timeRangeFilter: {
        operator: 'between',
        startTime,
        endTime,
      },
      ascendingOrder: false,
      pageSize: 400,
    }).catch((e) => {
      console.debug?.('[health-connect-steps] readRecords failed', e);
      return null;
    }),
    NATIVE_TIMEOUT_MS,
    null,
  );

  if (!recordsResult) {
    return null;
  }

  const records = Array.isArray(recordsResult.records) ? recordsResult.records : [];
  return {
    steps: Math.max(
      0,
      Math.round(
        records.reduce((total, record) => total + Math.max(0, record.count ?? 0), 0),
      ),
    ),
    dataOrigins: normalizeOrigins(records.map((record) => record.metadata?.dataOrigin ?? null)),
  };
}

export function openHealthConnectStepsSettings(): void {
  if (Platform.OS !== 'android') return;
  openHealthConnectSettings();
}

export async function readTodayStepsFromHealthConnect(options?: {
  promptForPermissions?: boolean;
}): Promise<HealthConnectStepsResult> {
  if (Platform.OS !== 'android') {
    return {
      status: 'unsupported',
      permissionsGranted: false,
      steps: 0,
      message: 'Health Connect solo está disponible en Android.',
      dataOrigins: [],
    };
  }

  try {
    const sdkStatus = await withTimeout(
      getSdkStatus().catch((e) => {
        console.debug?.('[health-connect-steps] getSdkStatus failed', e);
        return SdkAvailabilityStatus.SDK_UNAVAILABLE;
      }),
      NATIVE_TIMEOUT_MS,
      SdkAvailabilityStatus.SDK_UNAVAILABLE,
    );
    if (sdkStatus === SdkAvailabilityStatus.SDK_UNAVAILABLE_PROVIDER_UPDATE_REQUIRED) {
      return {
        status: 'provider_update_required',
        permissionsGranted: false,
        steps: 0,
        message: 'Actualiza Health Connect para leer pasos automáticamente.',
        dataOrigins: [],
      };
    }

    if (sdkStatus !== SdkAvailabilityStatus.SDK_AVAILABLE) {
      return {
        status: 'unavailable',
        permissionsGranted: false,
        steps: 0,
        message: 'Health Connect no está disponible en este dispositivo.',
        dataOrigins: [],
      };
    }

    const initialized = await withTimeout(
      initialize().catch((e) => {
        console.debug?.('[health-connect-steps] initialize failed', e);
        return false;
      }),
      NATIVE_TIMEOUT_MS,
      false,
    );
    if (!initialized) {
      return {
        status: 'error',
        permissionsGranted: false,
        steps: 0,
        message: 'No se pudo inicializar Health Connect.',
        dataOrigins: [],
      };
    }

    let grantedPermissions: StepPermission[] = await withTimeout(
      getGrantedPermissions().catch((e) => {
        console.debug?.('[health-connect-steps] getGrantedPermissions failed', e);
        return [] as StepPermission[];
      }),
      PERMISSION_TIMEOUT_MS,
      [],
    );
    let granted = hasStepsReadPermission(grantedPermissions);

    if (!granted && options?.promptForPermissions) {
      const requestedPermissions = await withTimeout(
        requestPermission([
          { accessType: 'read', recordType: 'Steps' },
        ]).catch((e) => {
          console.debug?.('[health-connect-steps] requestPermission failed', e);
          return [] as StepPermission[];
        }),
        PERMISSION_TIMEOUT_MS,
        [],
      );
      grantedPermissions = requestedPermissions;
      granted = hasStepsReadPermission(requestedPermissions);

      if (!granted) {
        grantedPermissions = await withTimeout(
          getGrantedPermissions().catch((e) => {
            console.debug?.('[health-connect-steps] getGrantedPermissions (2) failed', e);
            return [] as StepPermission[];
          }),
          PERMISSION_TIMEOUT_MS,
          [],
        );
        granted = hasStepsReadPermission(grantedPermissions);
      }
    }

    if (!granted) {
      return {
        status: 'permissions_missing',
        permissionsGranted: false,
        steps: 0,
        message: 'Permite lectura de pasos en Health Connect para recuperar actividad aunque cierres la app.',
        dataOrigins: [],
      };
    }

    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const snapshot = await readStepsSnapshot(start.toISOString(), new Date().toISOString());

    if (snapshot) {
      return {
        status: 'ready',
        permissionsGranted: true,
        steps: snapshot.steps,
        message: null,
        dataOrigins: snapshot.dataOrigins,
      };
    }

    if (!granted) {
      return {
        status: 'permissions_missing',
        permissionsGranted: false,
        steps: 0,
        message: 'Permite lectura de pasos en Health Connect para recuperar actividad aúnque cierres la app.',
        dataOrigins: [],
      };
    }

    return {
      status: 'error',
      permissionsGranted: granted,
      steps: 0,
      message: 'No se pudo leer pasos desde Health Connect.',
      dataOrigins: [],
    };
  } catch (error) {
    return {
      status: 'error',
      permissionsGranted: false,
      steps: 0,
      message: error instanceof Error ? error.message : 'No se pudo leer pasos desde Health Connect.',
      dataOrigins: [],
    };
  }
}



