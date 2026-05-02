const mockCanOpenURL = jest.fn();
const mockOpenURL = jest.fn();
const mockGetGrantedPermissions = jest.fn();
const mockGetSdkStatus = jest.fn();
const mockInitialize = jest.fn();
const mockOpenHealthConnectSettings = jest.fn();
const mockReadRecords = jest.fn();
const mockRequestPermission = jest.fn();

jest.mock('react-native', () => ({
  Platform: { OS: 'android' },
  Linking: {
    canOpenURL: (...args) => mockCanOpenURL(...args),
    openURL: (...args) => mockOpenURL(...args),
  },
}));

jest.mock('react-native-health-connect', () => ({
  SdkAvailabilityStatus: {
    SDK_AVAILABLE: 'available',
    SDK_UNAVAILABLE: 'unavailable',
    SDK_UNAVAILABLE_PROVIDER_UPDATE_REQUIRED: 'provider_update_required',
  },
  SleepStageType: {
    DEEP: 1,
    REM: 2,
    AWAKE: 3,
    OUT_OF_BED: 4,
    LIGHT: 5,
    SLEEPING: 6,
  },
  getGrantedPermissions: (...args) => mockGetGrantedPermissions(...args),
  getSdkStatus: (...args) => mockGetSdkStatus(...args),
  initialize: (...args) => mockInitialize(...args),
  openHealthConnectSettings: (...args) => mockOpenHealthConnectSettings(...args),
  readRecords: (...args) => mockReadRecords(...args),
  requestPermission: (...args) => mockRequestPermission(...args),
}));

const { syncSleepSessionsFromHealthConnect } = require('../lib/health-connect-sleep');
const { SdkAvailabilityStatus } = require('react-native-health-connect');

describe('health connect sleep import', () => {
  beforeEach(() => {
    jest.useRealTimers();
    jest.clearAllMocks();
    mockCanOpenURL.mockResolvedValue(false);
    mockOpenURL.mockResolvedValue(undefined);
    mockGetSdkStatus.mockResolvedValue(SdkAvailabilityStatus.SDK_AVAILABLE);
    mockInitialize.mockResolvedValue(true);
    mockOpenHealthConnectSettings.mockReturnValue(undefined);
    mockReadRecords.mockResolvedValue({ records: [] });
    mockRequestPermission.mockResolvedValue([]);
  });

  test('rechecks granted permissions after the permission prompt flow', async () => {
    mockGetGrantedPermissions
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([{ accessType: 'read', recordType: 'SleepSession' }]);

    const result = await syncSleepSessionsFromHealthConnect({
      promptForPermissions: true,
      daysBack: 14,
    });

    expect(mockRequestPermission).toHaveBeenCalledWith([
      { accessType: 'read', recordType: 'SleepSession' },
    ]);
    expect(mockGetGrantedPermissions).toHaveBeenCalledTimes(2);
    expect(result).toMatchObject({
      status: 'ready',
      permissionsGranted: true,
      records: [],
    });
  });

  test('returns an honest error when record reading times out', async () => {
    jest.useFakeTimers();
    mockGetGrantedPermissions.mockResolvedValue([
      { accessType: 'read', recordType: 'SleepSession' },
    ]);
    mockReadRecords.mockImplementation(
      () =>
        new Promise(() => {
          // Intentionally unresolved to simulate a native hang.
        }),
    );

    const promise = syncSleepSessionsFromHealthConnect({ promptForPermissions: false });
    await jest.advanceTimersByTimeAsync(5000);
    const result = await promise;

    expect(result).toMatchObject({
      status: 'error',
      permissionsGranted: true,
      records: [],
    });
    expect(result.message).toContain('No se pudo leer');
  });
});
