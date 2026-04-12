import { Colors } from '@/constants/colors';
import { Routes } from '@/constants/routes';
import type { MentalEntry } from '@/hooks/useMental';
import { calculateMentalScore } from '@/utils/calculations';

export type MentalTabKey = 'checkin' | 'insights' | 'history' | 'settings';
export type MentalFilterKey = 'score' | 'mood' | 'energy' | 'stress' | 'motivation';
export type MentalScaleKey = 'energy' | 'stress' | 'motivation';

export const MENTAL_TABS = [
  { key: 'checkin' as const, label: 'Check-in', route: Routes.mental.index },
  { key: 'insights' as const, label: 'Insights', route: Routes.mental.insights },
  { key: 'history' as const, label: 'Historial', route: Routes.mental.history },
  { key: 'settings' as const, label: 'Ajustes', route: Routes.mental.settings },
] as const;

export const MENTAL_MOOD_OPTIONS = [
  { value: 1, label: 'Agotado', icon: 'thunderstorm-outline', accent: '#F472B6' },
  { value: 2, label: 'Bajo', icon: 'cloudy-outline', accent: '#FB923C' },
  { value: 3, label: 'OK', icon: 'partly-sunny-outline', accent: '#AAB8CF' },
  { value: 4, label: 'Bien', icon: 'sunny-outline', accent: '#7BC67E' },
  { value: 5, label: 'Fluido', icon: 'sparkles-outline', accent: Colors.mental },
] as const;

export const MENTAL_CONTEXT_CHIPS = [
  'dormi mal',
  'mucho trabajo',
  'dia social',
  'mucho ruido',
  'me movi',
  'necesito bajar un cambio',
] as const;

export const MENTAL_FILTERS = [
  { key: 'score' as const, label: 'Score', max: 100, accent: Colors.mental },
  { key: 'mood' as const, label: 'Humor', max: 5, accent: '#F472B6' },
  { key: 'energy' as const, label: 'Energia', max: 3, accent: Colors.warning },
  { key: 'stress' as const, label: 'Estres', max: 3, accent: Colors.error },
  { key: 'motivation' as const, label: 'Motivacion', max: 3, accent: Colors.steps },
] as const;

export function getMoodOption(value?: number | null) {
  return MENTAL_MOOD_OPTIONS.find((item) => item.value === value) ?? MENTAL_MOOD_OPTIONS[2];
}

export function getMetricTone(metric: MentalScaleKey, value: number) {
  if (metric === 'stress') {
    if (value <= 1) return { short: 'Calma', long: 'presion baja' };
    if (value === 2) return { short: 'Media', long: 'presion media' };
    return { short: 'Alta', long: 'presion alta' };
  }

  if (value <= 1) return { short: 'Baja', long: `${metric} baja` };
  if (value === 2) return { short: 'Media', long: `${metric} media` };
  return { short: 'Alta', long: `${metric} alta` };
}

export function getMentalMetricValue(entry: MentalEntry, key: MentalFilterKey) {
  switch (key) {
    case 'score':
      return calculateMentalScore(entry.mood, entry.energy, entry.stress, entry.motivation);
    case 'mood':
      return entry.mood;
    case 'energy':
      return entry.energy;
    case 'stress':
      return entry.stress;
    case 'motivation':
      return entry.motivation;
    default:
      return 0;
  }
}

export function getMetricLabel(key: MentalFilterKey, entry: MentalEntry) {
  if (key === 'score') {
    return `${getMentalMetricValue(entry, key)}/100`;
  }
  if (key === 'mood') {
    return `${getMentalMetricValue(entry, key)}/5`;
  }
  return `${getMentalMetricValue(entry, key)}/3`;
}

function average(entries: MentalEntry[], selector: (entry: MentalEntry) => number) {
  if (!entries.length) return 0;
  return entries.reduce((sum, entry) => sum + selector(entry), 0) / entries.length;
}

export function buildMentalCoachSummary(
  entry: MentalEntry | null,
  score: number | null,
  streak: number,
  driftMessage: string | null,
) {
  if (!entry || score === null) {
    return {
      title: 'Hoy conviene un check-in corto y honesto.',
      body: 'Tres pasos bastan para leer como viene el dia sin meterte en un scroll largo.',
      ctaLabel: 'Hacer check-in ahora',
      ctaRoute: Routes.mental.index,
    };
  }

  if (driftMessage) {
    return {
      title: 'Hay senal de cansancio acumulado.',
      body: driftMessage,
      ctaLabel: 'Ver insights',
      ctaRoute: Routes.mental.insights,
    };
  }

  if (entry.stress === 3) {
    return {
      title: 'Hoy toca bajar presion antes de pedir mas.',
      body: 'Si ya estas arriba de carga, lo mas util es una accion corta y volver al ritmo mas tarde.',
      ctaLabel: 'Ver historial',
      ctaRoute: Routes.mental.history,
    };
  }

  if (entry.energy === 1) {
    return {
      title: 'La energia viene corta y eso cambia el plan.',
      body: 'Protege una tarea importante y saca friccion del resto para no gastar de mas.',
      ctaLabel: 'Abrir insights',
      ctaRoute: Routes.mental.insights,
    };
  }

  if (score >= 80) {
    return {
      title: 'El tono del dia esta bastante estable.',
      body: 'No hace falta empujar mas: sostene lo que ya funciona y mira si la racha se puede afirmar.',
      ctaLabel: 'Ver historial',
      ctaRoute: Routes.mental.history,
    };
  }

  if (streak >= 3) {
    return {
      title: 'La racha ya esta dando contexto real.',
      body: 'Con varios dias seguidos, ahora conviene leer patron y no solo el estado de hoy.',
      ctaLabel: 'Abrir insights',
      ctaRoute: Routes.mental.insights,
    };
  }

  return {
    title: 'Hoy conviene registrar y seguir liviano.',
    body: 'Un solo check-in bien hecho vale mas que cinco paneles diciendo lo mismo.',
    ctaLabel: 'Ver historial',
    ctaRoute: Routes.mental.history,
  };
}

export function buildMentalTips(history: MentalEntry[]) {
  const last7 = history.slice(-7);
  const suggestions: string[] = [];
  const avgStress = average(last7, (entry) => entry.stress);
  const avgEnergy = average(last7, (entry) => entry.energy);
  const avgMood = average(last7, (entry) => entry.mood);

  if (history.length < 7) {
    suggestions.push('Registra 7 dias seguidos para pasar de sensacion a patron real.');
  }
  if (avgStress >= 2.2) {
    suggestions.push('Cuando la presion sube varios dias, baja una exigencia antes de sumar otra.');
  }
  if (avgEnergy <= 1.7) {
    suggestions.push('Tu energia viene corta: sueno y comida simple suelen mover mas que otro empuje.');
  }
  if (avgMood >= 4) {
    suggestions.push('Hay una base buena: repetila temprano para que el resto del dia no dependa de memoria.');
  }
  if (!suggestions.length) {
    suggestions.push('Mantene el check-in corto y consistente. La utilidad aparece cuando dejas de negociar con el dia.');
  }

  return suggestions.slice(0, 3);
}

export function buildMentalCorrelation(history: MentalEntry[]) {
  if (history.length < 14) return null;

  const lowStressDays = history.filter((entry) => entry.stress === 1);
  const highStressDays = history.filter((entry) => entry.stress === 3);
  if (lowStressDays.length >= 3 && highStressDays.length >= 3) {
    const lowStressMood = average(lowStressDays, (entry) => entry.mood);
    const highStressMood = average(highStressDays, (entry) => entry.mood);
    const diff = lowStressMood - highStressMood;
    if (diff >= 0.6) {
      return {
        title: 'Tu humor cae cuando la presion se sostiene arriba.',
        body: `En dias de calma, tu humor sube ${diff.toFixed(1)} pts en promedio frente a los dias de estres alto.`,
      };
    }
  }

  const highMoodDays = history.filter((entry) => entry.mood >= 4);
  const lowMoodDays = history.filter((entry) => entry.mood <= 2);
  if (highMoodDays.length >= 3 && lowMoodDays.length >= 3) {
    const energyDiff = average(highMoodDays, (entry) => entry.energy) - average(lowMoodDays, (entry) => entry.energy);
    if (energyDiff >= 0.5) {
      return {
        title: 'Cuando el humor acompana, tu energia tambien responde.',
        body: `En dias con mejor humor, la energia sube ${energyDiff.toFixed(1)} pts en promedio.`,
      };
    }
  }

  return {
    title: 'Todavia no hay un patron fuerte, pero la base ya aparece.',
    body: 'Sostene dos semanas de check-in y las correlaciones van a empezar a dejar de ser intuicion.',
  };
}

