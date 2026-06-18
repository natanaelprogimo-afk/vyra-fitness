import * as Haptics from 'expo-haptics';
import { useSettingsStore } from '@/stores/settingsStore';

export type ImpactHaptic = 'light' | 'medium' | 'heavy';
export type NotificationHaptic = 'success' | 'warning' | 'error';

function canUseHaptics() {
  return useSettingsStore.getState().hapticsEnabled;
}

export async function triggerImpactHaptic(style: ImpactHaptic = 'light') {
  if (!canUseHaptics()) return;

  const nativeStyle =
    style === 'heavy'
      ? Haptics.ImpactFeedbackStyle.Heavy
      : style === 'medium'
        ? Haptics.ImpactFeedbackStyle.Medium
        : Haptics.ImpactFeedbackStyle.Light;

  await Haptics.impactAsync(nativeStyle).catch((e) => {
    console.debug?.('[haptics] impactAsync failed', e);
  });
}

export async function triggerNotificationHaptic(type: NotificationHaptic) {
  if (!canUseHaptics()) return;

  const nativeType =
    type === 'error'
      ? Haptics.NotificationFeedbackType.Error
      : type === 'warning'
        ? Haptics.NotificationFeedbackType.Warning
        : Haptics.NotificationFeedbackType.Success;

  await Haptics.notificationAsync(nativeType).catch((e) => {
    console.debug?.('[haptics] notificationAsync failed', e);
  });
}

export async function triggerSelectionHaptic() {
  if (!canUseHaptics()) return;
  await Haptics.selectionAsync().catch((e) => {
    console.debug?.('[haptics] selectionAsync failed', e);
  });
}

