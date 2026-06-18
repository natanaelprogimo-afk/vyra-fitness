export function formatDistance(valueKm: number | string, unit: 'km' | 'mi') {
  const numeric = typeof valueKm === 'number' ? valueKm : parseFloat(valueKm) || 0;
  const converted = unit === 'mi' ? numeric * 0.621371 : numeric;

  if (unit === 'km' && converted > 0 && converted < 1) {
    return `${Math.round(converted * 1000)} m`;
  }

  if (converted === 0) {
    return `0 ${unit}`;
  }

  return `${converted.toFixed(converted >= 10 ? 0 : 1)} ${unit}`;
}
