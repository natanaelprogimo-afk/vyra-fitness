import { useMemo } from 'react';
import { useNetInfo } from '@react-native-community/netinfo';

export function useNetwork() {
  const netInfo = useNetInfo();

  return useMemo(
    () => ({
      ...netInfo,
      isOnline: Boolean(netInfo.isConnected ?? netInfo.isInternetReachable ?? false),
    }),
    [netInfo],
  );
}
