import * as Location from 'expo-location';
import type { WaterClimate } from '@/lib/water-context';

export type WaterWeatherSnapshot = {
  climate: WaterClimate;
  temperatureC: number;
  humidityPct: number;
  apparentTemperatureC: number | null;
  fetchedAt: string;
  source: 'open-meteo' | 'openweather';
  latitude: number;
  longitude: number;
};

function resolveClimate(tempC: number, humidityPct: number, apparentC: number | null): WaterClimate {
  const felt = Number.isFinite(Number(apparentC ?? NaN)) ? (apparentC as number) : tempC;
  if (felt >= 34) return 'hot';
  if (felt >= 28) return 'warm';
  if (humidityPct >= 75) return 'humid';
  if (humidityPct <= 30) return 'dry';
  return 'normal';
}

async function getCoords(): Promise<{ latitude: number; longitude: number } | null> {
  const permission = await Location.requestForegroundPermissionsAsync().catch(() => null);
  if (!permission?.granted) return null;

  const lastKnown = await Location.getLastKnownPositionAsync().catch(() => null);
  if (lastKnown?.coords?.latitude && lastKnown?.coords?.longitude) {
    return {
      latitude: lastKnown.coords.latitude,
      longitude: lastKnown.coords.longitude,
    };
  }

  const current = await Location.getCurrentPositionAsync({
    accuracy: Location.Accuracy.Lowest,
  }).catch(() => null);

  if (!current?.coords?.latitude || !current?.coords?.longitude) return null;
  return {
    latitude: current.coords.latitude,
    longitude: current.coords.longitude,
  };
}

export async function fetchAutoWaterClimate(): Promise<WaterWeatherSnapshot | null> {
  const coords = await getCoords();
  if (!coords) return null;

  const openWeatherKey = process.env.EXPO_PUBLIC_OPENWEATHER_API_KEY;
  if (openWeatherKey) {
    try {
      const url =
        `https://api.openweathermap.org/data/2.5/weather?lat=${coords.latitude}` +
        `&lon=${coords.longitude}` +
        `&units=metric&appid=${openWeatherKey}`;
      const res = await fetch(url);
      if (res.ok) {
        const payload = await res.json().catch(() => null);
        const tempC = Number(payload?.main?.temp);
        const humidityPct = Number(payload?.main?.humidity);
        const feelsLikeC = Number(payload?.main?.feels_like);
        if (Number.isFinite(tempC) && Number.isFinite(humidityPct)) {
          const apparentTemperatureC = Number.isFinite(feelsLikeC) ? feelsLikeC : null;
          const climate = resolveClimate(tempC, humidityPct, apparentTemperatureC);
          return {
            climate,
            temperatureC: tempC,
            humidityPct,
            apparentTemperatureC,
            fetchedAt: new Date().toISOString(),
            source: 'openweather',
            latitude: coords.latitude,
            longitude: coords.longitude,
          };
        }
      }
    } catch {
      // fallback to open-meteo below
    }
  }

  try {
    const url =
      `https://api.open-meteo.com/v1/forecast?latitude=${coords.latitude}` +
      `&longitude=${coords.longitude}` +
      `&current=temperature_2m,relative_humidity_2m,apparent_temperature` +
      `&timezone=auto`;

    const res = await fetch(url);
    if (!res.ok) return null;
    const payload = await res.json().catch(() => null);
    const current = payload?.current;
    if (!current) return null;

    const temperatureC = Number(current.temperature_2m);
    const humidityPct = Number(current.relative_humidity_2m);
    const apparentTemperatureC = Number.isFinite(Number(current.apparent_temperature))
      ? Number(current.apparent_temperature)
      : null;

    if (!Number.isFinite(temperatureC) || !Number.isFinite(humidityPct)) return null;

    const climate = resolveClimate(temperatureC, humidityPct, apparentTemperatureC);

    return {
      climate,
      temperatureC,
      humidityPct,
      apparentTemperatureC,
      fetchedAt: new Date().toISOString(),
      source: 'open-meteo',
      latitude: coords.latitude,
      longitude: coords.longitude,
    };
  } catch {
    return null;
  }
}
