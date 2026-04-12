import { Platform } from 'react-native';
import {
  SdkAvailabilityStatus,
  aggregateRecord,
  getGrantedPermissions,
  getSdkStatus,
  initialize,
  openHealthConnectSettings,
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

function hasStepsReadPermission(permissions: Array<Permission | { accessType: string; recordType: string }>) {
  return permissions.some((permission) => permission.accessType === 'read' && permission.recordType === 'Steps');
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
    const sdkStatus = await getSdkStatus().catch(() => SdkAvailabilityStatus.SDK_UNAVAILABLE);
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

    const initialized = await initialize().catch(() => false);
    if (!initialized) {
      return {
        status: 'error',
        permissionsGranted: false,
        steps: 0,
        message: 'No se pudo inicializar Health Connect.',
        dataOrigins: [],
      };
    }

    let grantedPermissions: Array<Permission | { accessType: string; recordType: string }> =
      await getGrantedPermissions().catch(() => []);
    let granted = hasStepsReadPermission(grantedPermissions);

    if (!granted && options?.promptForPermissions) {
      grantedPermissions = await requestPermission([
        { accessType: 'read', recordType: 'Steps' },
      ]).catch(() => []);
      granted = hasStepsReadPermission(grantedPermissions);
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
    const aggregate = await aggregateRecord({
      recordType: 'Steps',
      timeRangeFilter: {
        operator: 'between',
        startTime: start.toISOString(),
        endTime: new Date().toISOString(),
      },
    }).catch(() => null);

    return {
      status: 'ready',
      permissionsGranted: true,
      steps: Math.max(0, Math.round(aggregate?.COUNT_TOTAL ?? 0)),
      message: null,
      dataOrigins: aggregate?.dataOrigins ?? [],
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
