import { getProfileContextMemory } from '@/lib/profile-context';
import type { UserProfile } from '@/types/user';

import type { ModuleId } from '@/constants/modules';



export type KoraMood =

  | 'radiant'

  | 'happy'

  | 'calm'

  | 'focused'

  | 'tired'

  | 'worried'

  | 'thirsty'

  | 'hungry'

  | 'cold'

  | 'powerful'

  | 'festive'

  | 'sleeping'

  | 'mysterious';



export type KoraStage = 'cub' | 'young' | 'adult' | 'master' | 'legendary';



export interface KoraStateDescriptor {

  mood: KoraMood;

  title: string;

  subtitle: string;

  accent: string;

  glyph: string;

  aura: string;

  signature: string;

}



export interface KoraStageDescriptor {

  stage: KoraStage;

  title: string;

  tagline: string;

  motif: string;

  focus: string;

}



export type KoraCosmeticId =

  | 'bow'

  | 'wood_collar'

  | 'backpack'

  | 'hero_cape'

  | 'flower_crown'

  | 'headphones'

  | 'mystic_staff'

  | 'star_cloak'

  | 'cosmic_rabbit';



export interface KoraCosmetic {

  id: KoraCosmeticId;

  name: string;

  description: string;

  stage: KoraStage;

  glyph: string;

}



export interface KoraCosmeticEntry extends KoraCosmetic {

  unlocked: boolean;

}



const STAGE_ORDER: Record<KoraStage, number> = {

  cub: 0,

  young: 1,

  adult: 2,

  master: 3,

  legendary: 4,

};



const KORA_COSMETICS: KoraCosmetic[] = [

  {

    id: 'bow',

    name: 'Lazo pequeño',

    description: 'Primer detalle desbloqueado al inicio.',

    stage: 'cub',

    glyph: 'BOW',

  },

  {

    id: 'wood_collar',

    name: 'Collar de madera',

    description: 'Recuerdo del primer mes sostenido.',

    stage: 'young',

    glyph: 'WOOD',

  },

  {

    id: 'backpack',

    name: 'Mochila mini',

    description: 'Marca de crecimiento y autonomía.',

    stage: 'young',

    glyph: 'PACK',

  },

  {

    id: 'hero_cape',

    name: 'Capa de héroe',

    description: 'Para semanas donde rompiste tu techo.',

    stage: 'adult',

    glyph: 'HERO',

  },

  {

    id: 'flower_crown',

    name: 'Corona de flores',

    description: 'Modo calmado con energía estable.',

    stage: 'adult',

    glyph: 'FLO',

  },

  {

    id: 'headphones',

    name: 'Auriculares',

    description: 'Entrenos con enfoque y ritmo.',

    stage: 'adult',

    glyph: 'MUS',

  },

  {

    id: 'mystic_staff',

    name: 'Bastón místico',

    description: 'Viste desbloqueada al entrar en etapa maestra.',

    stage: 'master',

    glyph: 'STAFF',

  },

  {

    id: 'star_cloak',

    name: 'Capa estelar',

    description: 'Recuerdo de consistencia larga.',

    stage: 'master',

    glyph: 'STAR',

  },

  {

    id: 'cosmic_rabbit',

    name: 'Forma cósmica',

    description: 'Estado legendario para un año completo.',

    stage: 'legendary',

    glyph: 'COS',

  },

];



const COSMETIC_IDS = new Set<KoraCosmeticId>(KORA_COSMETICS.map((cosmetic) => cosmetic.id));



function isValidCosmeticId(value: unknown): value is KoraCosmeticId {

  return typeof value === 'string' && COSMETIC_IDS.has(value as KoraCosmeticId);

}



export function getKoraCosmetics(stage: KoraStage): KoraCosmeticEntry[] {

  const stageRank = STAGE_ORDER[stage];

  return KORA_COSMETICS.map((cosmetic) => ({

    ...cosmetic,

    unlocked: STAGE_ORDER[cosmetic.stage] <= stageRank,

  }));

}



export function getKoraCosmeticById(id: KoraCosmeticId | null | undefined): KoraCosmetic | null {

  if (!id) return null;

  return KORA_COSMETICS.find((cosmetic) => cosmetic.id === id) ?? null;

}



export function getEquippedCosmeticId(profile: UserProfile | null): KoraCosmeticId | null {

  const memory = getProfileContextMemory(profile);

  const raw = memory.kora_cosmetic_id;

  return isValidCosmeticId(raw) ? raw : null;

}



export function withKoraCosmetic(

  memory: Record<string, unknown> | null | undefined,

  cosmeticId: KoraCosmeticId | null,

): Record<string, unknown> {

  const next = { ...(memory ?? {}) } as Record<string, unknown>;

  if (cosmeticId) {

    next.kora_cosmetic_id = cosmeticId;

  } else {

    delete next.kora_cosmetic_id;

  }

  return next;

}



export interface KoraWeekRow {

  date: string;

  total_score: number;

  hydration_pct: number;

  sleep_pct: number;

  activity_pct: number;

  nutrition_pct: number;

  mental_pct: number;

}



export interface KoraJournal {

  title: string;

  narrative: string;

  bestMoment: string;

  gentleWarning: string;

  comparedToLastWeek: string;

  nextWeekHint: string;

}



export interface KoraPatternSummary {

  strongestWeekday: string | null;

  weakestWeekday: string | null;

  strongestMetric: string | null;

}



export const KORA_DEFAULT_NAME = 'Kora';



const DAY_NAMES_ES = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];

const DAY_NAMES_EN = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];



export function getKoraName(profile: UserProfile | null): string {

  const memory = getProfileContextMemory(profile);

  const raw = memory.kora_name;

  if (typeof raw === 'string' && raw.trim().length > 0) {

    return raw.trim();

  }

  return KORA_DEFAULT_NAME;

}



export function withKoraName(

  memory: Record<string, unknown> | null | undefined,

  name: string,

): Record<string, unknown> {

  return {

    ...(memory ?? {}),

    kora_name: name.trim(),

  };

}



export function getKoraStage(profile: UserProfile | null): KoraStage {

  if (!profile?.created_at) return 'cub';

  const created = new Date(profile.created_at);

  const now = new Date();

  const diffDays = Math.max(0, Math.floor((now.getTime() - created.getTime()) / 86_400_000));



  if (diffDays >= 365) return 'legendary';

  if (diffDays >= 181) return 'master';

  if (diffDays >= 91) return 'adult';

  if (diffDays >= 31) return 'young';

  return 'cub';

}



export function getKoraStageProgress(profile: UserProfile | null): { current: number; target: number | null } {

  if (!profile?.created_at) return { current: 0, target: 30 };

  const created = new Date(profile.created_at);

  const diffDays = Math.max(0, Math.floor((Date.now() - created.getTime()) / 86_400_000));



  if (diffDays < 31) return { current: diffDays, target: 30 };

  if (diffDays < 91) return { current: diffDays - 30, target: 60 };

  if (diffDays < 181) return { current: diffDays - 90, target: 90 };

  if (diffDays < 365) return { current: diffDays - 180, target: 184 };

  return { current: diffDays, target: null };

}



export function describeKoraState(mood: KoraMood): KoraStateDescriptor {

  switch (mood) {

    case 'radiant':

      return {

        mood,

        title: 'Radiante',

        subtitle: 'Te siente en ritmo y con energía alta.',

        accent: '#59E3B3',

        glyph: 'RAY',

        aura: 'Pulso alto',

        signature: 'Cuando todo conecta, se expande.',

      };

    case 'happy':

      return {

        mood,

        title: 'Feliz',

        subtitle: 'Día ordenado, sin drama, con buena tracción.',

        accent: '#8CF0CD',

        glyph: 'JOY',

        aura: 'Calma limpia',

        signature: 'No hace ruido cuando el día va bien.',

      };

    case 'calm':

      return {

        mood,

        title: 'Tranquila',

        subtitle: 'No hace falta forzar: toca sostener.',

        accent: '#7D9BFF',

        glyph: 'CALM',

        aura: 'Base estable',

        signature: 'Hoy vale más sostener que exagerar.',

      };

    case 'focused':

      return {

        mood,

        title: 'Enfocada',

        subtitle: 'Tu mente está en modo acción y técnica.',

        accent: '#8B5CF6',

        glyph: 'FOCUS',

        aura: 'Precisión',

        signature: 'Cuando estás presente, el progreso es inevitable.',

      };

    case 'tired':

      return {

        mood,

        title: 'Cansada',

        subtitle: 'Hoy tu cuerpo pide bajar un cambio.',

        accent: '#FDBA52',

        glyph: 'REST',

        aura: 'Carga alta',

        signature: 'No todo día tiene que ser de empuje.',

      };

    case 'worried':

      return {

        mood,

        title: 'Preocupada',

        subtitle: 'Detecta varios frentes flojos al mismo tiempo.',

        accent: '#FF7568',

        glyph: 'ALRT',

        aura: 'Frágil',

        signature: 'Necesita que vuelvas a lo básico.',

      };

    case 'thirsty':

      return {

        mood,

        title: 'Sedienta',

        subtitle: 'El agua viene demasiado atrás para esta hora.',

        accent: '#3BC9FF',

        glyph: 'WAVE',

        aura: 'Seca',

        signature: 'Primero agua, después decisiones más finas.',

      };

    case 'hungry':

      return {

        mood,

        title: 'Hambrienta',

        subtitle: 'Tu energía de comida se quedó corta.',

        accent: '#FF7CA8',

        glyph: 'FUEL',

        aura: 'Energía baja',

        signature: 'No quiere que cierres el día vacío.',

      };

    case 'cold':

      return {

        mood,

        title: 'Fría',

        subtitle: 'La hidratación viene baja desde hace días.',

        accent: '#60A5FA',

        glyph: 'COLD',

        aura: 'Baja energía',

        signature: 'Hoy primero agua, después todo lo demás.',

      };

    case 'powerful':

      return {

        mood,

        title: 'Poderosa',

        subtitle: 'Hoy hay margen para apretar de verdad.',

        accent: '#FFD166',

        glyph: 'MAX',

        aura: 'Ventana alta',

        signature: 'Hoy si vale convertir impulso en avance.',

      };

    case 'festive':

      return {

        mood,

        title: 'Festiva',

        subtitle: 'Hoy hay un motivo real para celebrar.',

        accent: '#F472B6',

        glyph: 'FEST',

        aura: 'Celebración',

        signature: 'Las victorias también se guardan.',

      };

    case 'sleeping':

      return {

        mood,

        title: 'Dormida',

        subtitle: 'Está guardando energía para mañana.',

        accent: '#94A3B8',

        glyph: 'SLEEP',

        aura: 'Silencio',

        signature: 'Dormir también es progreso.',

      };

    case 'mysterious':

      return {

        mood,

        title: 'Misteriosa',

        subtitle: 'Estado secreto desbloqueado por consistencia real.',

        accent: '#A78BFA',

        glyph: 'MYST',

        aura: 'Secreto',

        signature: 'Cuando sostienes, aparecen cosas nuevas.',

      };

    default:

      return {

        mood: 'calm',

        title: 'Tranquila',

        subtitle: 'Toca sostener el ritmo.',

        accent: '#7D9BFF',

        glyph: 'CALM',

        aura: 'Base estable',

        signature: 'Hoy vale más sostener que exagerar.',

      };

  }

}



export function describeKoraStage(stage: KoraStage): KoraStageDescriptor {

  switch (stage) {

    case 'young':

      return {

        stage,

        title: 'Joven',

        tagline: 'Ya reconoce patrones y empieza a responder con más personalidad.',

        motif: 'Primer mapa',

        focus: 'Consistencia de 30 a 90 días',

      };

    case 'adult':

      return {

        stage,

        title: 'Adulta',

        tagline: 'Tiene memoria larga y una lectura más clara de lo que te sube o te derrumba.',

        motif: 'Memoria viva',

        focus: 'Bloques sostenidos y comparación semanal',

      };

    case 'master':

      return {

        stage,

        title: 'Maestra',

        tagline: 'Ya no solo observa: interpreta tendencia, ritmo y desgaste.',

        motif: 'Lectura fina',

        focus: 'Precisión larga y decisiones más inteligentes',

      };

    case 'legendary':

      return {

        stage,

        title: 'Legendaria',

        tagline: 'Su identidad ya se siente parte de Vyra y de tu propio sistema.',

        motif: 'Huella propia',

        focus: 'Companion premium de largo plazo',

      };

    case 'cub':

    default:

      return {

        stage,

        title: 'Cría',

        tagline: 'Todavía está aprendiendo quién eres cuando estás bien y cuando te sales del ritmo.',

        motif: 'Primeras huellas',

        focus: 'Base diaria y patrones iniciales',

      };

  }

}



export function deriveKoraMood(params: {

  score: number | null;

  hydrationPct: number | null;

  sleepPct: number | null;

  nutritionPct: number | null;

  streak: number;

  hour: number;

  activeModules: ModuleId[];

  isWorkoutActive?: boolean;

  isSleepWindow?: boolean;

  isFestive?: boolean;

  isMysterious?: boolean;

  lowHydrationDays?: number;

}): KoraMood {

  const {

    score,

    hydrationPct,

    sleepPct,

    nutritionPct,

    streak,

    hour,

    activeModules,

    isWorkoutActive,

    isSleepWindow,

    isFestive,

    isMysterious,

    lowHydrationDays,

  } = params;



  if (isMysterious) return 'mysterious';

  if (isFestive) return 'festive';

  if (isWorkoutActive) return 'focused';

  if (isSleepWindow) return 'sleeping';

  if (

    activeModules.includes('water') &&

    hydrationPct !== null &&

    hydrationPct < 30 &&

    (lowHydrationDays ?? 0) >= 2 &&

    hour >= 12

  ) return 'cold';

  if (score !== null && score >= 92 && streak >= 3) return 'powerful';

  if (score !== null && score >= 82) return 'radiant';

  if (activeModules.includes('water') && hydrationPct !== null && hydrationPct < 35 && hour >= 12) return 'thirsty';

  if (activeModules.includes('nutrition') && nutritionPct !== null && nutritionPct < 35 && hour >= 15) return 'hungry';

  if (sleepPct !== null && sleepPct < 45) return 'tired';

  if (score !== null && score < 42) return 'worried';

  if (score !== null && score >= 68) return 'happy';

  return 'calm';

}



export function buildKoraPatternSummary(rows: KoraWeekRow[], language: 'es' | 'en' = 'es'): KoraPatternSummary {

  if (!rows.length) {

    return { strongestWeekday: null, weakestWeekday: null, strongestMetric: null };

  }

  const dayNames = language === 'en' ? DAY_NAMES_EN : DAY_NAMES_ES;



  const weekdayMap = new Map<number, { total: number; count: number }>();

  const metrics = {

    hydration: averageMetric(rows.map((row) => row.hydration_pct)),

    sleep: averageMetric(rows.map((row) => row.sleep_pct)),

    activity: averageMetric(rows.map((row) => row.activity_pct)),

    nutrition: averageMetric(rows.map((row) => row.nutrition_pct)),

    mental: averageMetric(rows.map((row) => row.mental_pct)),

  };



  for (const row of rows) {

    const day = new Date(`${row.date}T00:00:00`).getDay();

    const current = weekdayMap.get(day) ?? { total: 0, count: 0 };

    current.total += row.total_score;

    current.count += 1;

    weekdayMap.set(day, current);

  }



  const weekdayScores = [...weekdayMap.entries()].map(([day, entry]) => ({

    day,

    avg: entry.total / entry.count,

  }));



  weekdayScores.sort((a, b) => b.avg - a.avg);

  const strongestWeekday = weekdayScores[0] ? dayNames[weekdayScores[0].day] : null;

  const weakestWeekday = weekdayScores[weekdayScores.length - 1]

    ?  dayNames[weekdayScores[weekdayScores.length - 1].day]

    : null;



  const strongestMetric =

    Object.entries(metrics).sort((a, b) => (b[1] ?? 0) - (a[1] ?? 0))[0]?.[0] ?? null;



  return { strongestWeekday, weakestWeekday, strongestMetric };

}



export function buildKoraJournal(

  name: string,

  currentWeek: KoraWeekRow[],

  previousWeek: KoraWeekRow[],

  language: 'es' | 'en' = 'es',

): KoraJournal {

  const safeCurrent = currentWeek.filter((row) => Number.isFinite(row.total_score));

  if (!safeCurrent.length) {

    return {

      title: language === 'en' ? `${name} is still observing` : `${name} todavía te está observando`,

      narrative:

        language === 'en'

          ?  `${name} still needs a full week to tell a real story. Give it a few more days and it will start remembering you.`

          : `${name} todavía no tiene suficiente semana para contarte una historia real. Dale unos días más de uso y va a empezar a recordarte de verdad.`,

      bestMoment: language === 'en' ? 'No highlight yet.' : 'Aún sin momento destacado.',

      gentleWarning: language === 'en' ? 'No weak pattern yet.' : 'Aún sin patrón débil claro.',

      comparedToLastWeek:

        language === 'en'

          ?  'There is still no complete previous week to compare.'

          : 'Todavía no se puede comparar con tu semana anterior.',

      nextWeekHint:

        language === 'en'

          ?  'Start by closing water, sleep, and one log per day.'

          : 'Empieza por sostener agua, sueño y un registro por día.',

    };

  }



  const bestDay = [...safeCurrent].sort((a, b) => b.total_score - a.total_score)[0]!;

  const weakDay = [...safeCurrent].sort((a, b) => a.total_score - b.total_score)[0]!;

  const currentAvg = averageMetric(safeCurrent.map((row) => row.total_score)) ?? 0;

  const previousAvg = averageMetric(previousWeek.map((row) => row.total_score)) ?? null;

  const delta = previousAvg === null ? null : Math.round(currentAvg - previousAvg);

  const dayNames = language === 'en' ? DAY_NAMES_EN : DAY_NAMES_ES;

  const bestName = dayNames[new Date(`${bestDay.date}T00:00:00`).getDay()] ?? (language === 'en' ? 'a day' : 'un día');

  const weakName = dayNames[new Date(`${weakDay.date}T00:00:00`).getDay()] ?? (language === 'en' ? 'a day' : 'un día');



  const bestMetric = dominantMetric(bestDay, language);

  const weakMetric = weakestMetric(weakDay, language);



  return {

    title: language === 'en' ? `${name} remembers this week` : `${name} recuerda esta semana`,

    narrative:

      language === 'en'

        ?  `This week ${name.toLowerCase()} saw you strongest on ${bestName}, when ${bestMetric}. The weakest point appeared on ${weakName}, where ${weakMetric}.`

        : `Esta semana ${name.toLowerCase()} te vio más fuerte el ${bestName}, cuando ${bestMetric}. El punto más flojo apareció el ${weakName}, donde ${weakMetric}.`,

    bestMoment:

      language === 'en'

        ?  `Your best moment was ${bestName} with ${bestDay.total_score} points.`

        : `Tu mejor momento fue el ${bestName} con ${bestDay.total_score} puntos.`,

    gentleWarning:

      language === 'en'

        ? `The most delicate pattern appeared on ${weakName}: ${weakMetric}.`

        : `El patrón más delicado apareció el ${weakName}: ${weakMetric}.`,

    comparedToLastWeek:

      delta === null
        ? language === 'en'
          ? 'There is still no complete previous week to compare.'
          : 'Todavía no hay una semana previa completa para comparar.'
        : delta >= 0
          ? language === 'en'
            ? `You are ${delta} points above last week.`
            : `Vas ${delta} puntos por encima de tu semana anterior.`

          : language === 'en'

            ?  `You are ${Math.abs(delta)} points below last week.`

            : `Quedaste ${Math.abs(delta)} puntos por debajo de la semana anterior.`,

    nextWeekHint:

      language === 'en'
        ? weakMetric.includes('agua')
          ? 'Next week start by closing water early.'
          : weakMetric.includes('sueno') || weakMetric.includes('sueño')
            ? "Next week protect your night so the rest doesn't fall."
            : 'Next week prioritize one basic action before noon.'
        : weakMetric.includes('agua')
          ? 'La semana que viene empieza cerrando el agua temprano.'
          : weakMetric.includes('sueno') || weakMetric.includes('sueño')
            ? 'La semana que viene protege más tu noche para que el resto no caiga.'

            : 'La semana que viene prioriza una acción básica antes del mediodía.',

  };

}



function dominantMetric(row: KoraWeekRow, language: 'es' | 'en' = 'es'): string {

  const metricLabels =

    language === 'en'

      ? { agua: 'water', sueno: 'sleep', actividad: 'activity', nutricion: 'nutrition', mental: 'mental' }

      : { agua: 'agua', sueno: 'sueño', actividad: 'actividad', nutricion: 'nutrición', mental: 'mental' };

  const ordered = [

    ['agua', row.hydration_pct],

    ['sueno', row.sleep_pct],

    ['actividad', row.activity_pct],

    ['nutricion', row.nutrition_pct],

    ['mental', row.mental_pct],

  ].sort((a, b) => Number(b[1]) - Number(a[1]));



  const label = metricLabels[(ordered[0]?.[0] ?? 'agua') as keyof typeof metricLabels] ?? metricLabels.agua;

  return language === 'en'

    ?  `you closed ${label} really well`

    : `cerraste muy bien ${label}`;

}



function weakestMetric(row: KoraWeekRow, language: 'es' | 'en' = 'es'): string {

  const metricLabels =

    language === 'en'

      ? { agua: 'water', sueno: 'sleep', actividad: 'activity', nutricion: 'nutrition', mental: 'mental' }

      : { agua: 'agua', sueno: 'sueño', actividad: 'actividad', nutricion: 'nutrición', mental: 'mental' };

  const ordered = [

    ['agua', row.hydration_pct],

    ['sueno', row.sleep_pct],

    ['actividad', row.activity_pct],

    ['nutricion', row.nutrition_pct],

    ['mental', row.mental_pct],

  ].sort((a, b) => Number(a[1]) - Number(b[1]));



  const label = metricLabels[(ordered[0]?.[0] ?? 'agua') as keyof typeof metricLabels] ?? metricLabels.agua;

  return language === 'en'

    ?  `${label} dropped`

    : `se cayó ${label}`;

}



function averageMetric(values: number[]): number | null {

  const safe = values.filter((value) => Number.isFinite(value));

  if (!safe.length) return null;

  return safe.reduce((sum, value) => sum + value, 0) / safe.length;

}
