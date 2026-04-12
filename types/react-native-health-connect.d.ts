declare module 'react-native-health-connect' {
  export enum SdkAvailabilityStatus {
    SDK_AVAILABLE = 'SDK_AVAILABLE',
    SDK_UNAVAILABLE = 'SDK_UNAVAILABLE',
    SDK_UNAVAILABLE_PROVIDER_UPDATE_REQUIRED = 'SDK_UNAVAILABLE_PROVIDER_UPDATE_REQUIRED',
  }

  export type Permission = {
    accessType: 'read' | 'write' | string;
    recordType: string;
  } | any;

  export function getSdkStatus(): Promise<SdkAvailabilityStatus>;
  export function initialize(): Promise<boolean>;
  export function openHealthConnectSettings(): void;
  export function getGrantedPermissions(): Promise<Array<Permission>>;
  export function requestPermission(permissions: Array<Permission>): Promise<Array<Permission>>;
  export function aggregateRecord(opts: any): Promise<any>;

  // convenience type alias
  export type SdkAvailabilityStatusType = SdkAvailabilityStatus;
}
