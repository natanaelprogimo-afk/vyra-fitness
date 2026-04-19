declare module 'react-native-health-connect' {
  export const SdkAvailabilityStatus: {
    readonly SDK_UNAVAILABLE: number;
    readonly SDK_UNAVAILABLE_PROVIDER_UPDATE_REQUIRED: number;
    readonly SDK_AVAILABLE: number;
  };

  export const SleepStageType: {
    readonly UNKNOWN: number;
    readonly AWAKE: number;
    readonly SLEEPING: number;
    readonly OUT_OF_BED: number;
    readonly LIGHT: number;
    readonly DEEP: number;
    readonly REM: number;
  };

  export type Permission = {
    accessType: 'read' | 'write' | string;
    recordType: string;
  };

  export type ReadRecordsOptions = {
    timeRangeFilter:
      | { operator: 'between'; startTime: string; endTime: string }
      | { operator: 'after'; startTime: string }
      | { operator: 'before'; endTime: string };
    dataOriginFilter?: string[];
    ascendingOrder?: boolean;
    pageSize?: number;
    pageToken?: string;
  };

  export type SleepSessionRecordResult = {
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

  export function getSdkStatus(): Promise<number>;
  export function initialize(): Promise<boolean>;
  export function openHealthConnectSettings(): void;
  export function getGrantedPermissions(): Promise<Array<Permission>>;
  export function requestPermission(permissions: Array<Permission>): Promise<Array<Permission>>;
  export function aggregateRecord(opts: unknown): Promise<unknown>;
  export function readRecords(
    recordType: 'SleepSession',
    options: ReadRecordsOptions,
  ): Promise<{ records: SleepSessionRecordResult[]; pageToken?: string }>;
}
