export const DEFAULT_NOTIFICATION_QUIET_HOUR_START = 22;
export const DEFAULT_NOTIFICATION_QUIET_HOUR_END = 7;

export function clampQuietHour(hour: number, fallback: number) {
  if (!Number.isFinite(hour)) return fallback;
  return Math.max(0, Math.min(23, Math.round(hour)));
}

function isWithinWrappedWindow(minutes: number, startMinutes: number, endMinutes: number) {
  if (startMinutes === endMinutes) return false;
  if (startMinutes < endMinutes) {
    return minutes >= startMinutes && minutes <= endMinutes;
  }
  return minutes >= startMinutes || minutes <= endMinutes;
}

export function isWithinQuietHoursWindow(
  minutes: number,
  startHour = DEFAULT_NOTIFICATION_QUIET_HOUR_START,
  endHour = DEFAULT_NOTIFICATION_QUIET_HOUR_END,
  enabled = true,
) {
  if (!enabled) return false;

  const safeMinutes = Math.max(0, Math.min(24 * 60 - 1, Math.round(minutes)));
  const startMinutes = clampQuietHour(startHour, DEFAULT_NOTIFICATION_QUIET_HOUR_START) * 60;
  const endMinutes = clampQuietHour(endHour, DEFAULT_NOTIFICATION_QUIET_HOUR_END) * 60;

  return isWithinWrappedWindow(safeMinutes, startMinutes, endMinutes);
}
