import { useEffect, useState } from 'react';
import { AccessibilityInfo } from 'react-native';
import { useSettingsStore } from '@/stores/settingsStore';

export function useAccessibilityPreferences() {
  const reduceMotionPreference = useSettingsStore((state) => state.reduceMotion);
  const screenReaderMode = useSettingsStore((state) => state.screenReaderMode);
  const [systemReduceMotion, setSystemReduceMotion] = useState(false);
  const [systemScreenReaderEnabled, setSystemScreenReaderEnabled] = useState(false);

  useEffect(() => {
    let mounted = true;

    AccessibilityInfo.isReduceMotionEnabled()
      .then((value) => {
        if (mounted) setSystemReduceMotion(value);
      })
      .catch((e) => {
        console.debug?.('[useAccessibilityPreferences] isReduceMotionEnabled failed', e);
      });

    AccessibilityInfo.isScreenReaderEnabled()
      .then((value) => {
        if (mounted) setSystemScreenReaderEnabled(value);
      })
      .catch((e) => {
        console.debug?.('[useAccessibilityPreferences] isScreenReaderEnabled failed', e);
      });

    const reduceMotionSubscription = AccessibilityInfo.addEventListener(
      'reduceMotionChanged',
      (value) => setSystemReduceMotion(value),
    );
    const screenReaderSubscription = AccessibilityInfo.addEventListener(
      'screenReaderChanged',
      (value) => setSystemScreenReaderEnabled(value),
    );

    return () => {
      mounted = false;
      reduceMotionSubscription.remove();
      screenReaderSubscription.remove();
    };
  }, []);

  return {
    reduceMotionEnabled: reduceMotionPreference || systemReduceMotion,
    screenReaderEnabled: screenReaderMode || systemScreenReaderEnabled,
  };
}

export default useAccessibilityPreferences;
