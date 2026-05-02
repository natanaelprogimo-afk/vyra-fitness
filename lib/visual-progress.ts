export function visibleProgressPercent(value: number, minVisiblePercent = 8): number {
  if (!Number.isFinite(value) || value <= 0) return 0;
  return Math.max(minVisiblePercent, Math.min(100, value));
}

export function visibleRatioPercent(
  current: number,
  total: number,
  minVisiblePercent = 8,
): number {
  if (!Number.isFinite(current) || current <= 0) return 0;
  if (!Number.isFinite(total) || total <= 0) return 0;
  return visibleProgressPercent((current / total) * 100, minVisiblePercent);
}
