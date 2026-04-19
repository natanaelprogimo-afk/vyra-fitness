import { useCallback, useMemo } from 'react';

import { useMutation, useQuery } from '@tanstack/react-query';

import { buildProfileContextUpdate, getProfileContextMemory } from '@/lib/profile-context';
import { supabase } from '@/lib/supabase';

import { useAuthStore } from '@/stores/authStore';

import { useUIStore } from '@/stores/uiStore';

import { useDashboard } from '@/hooks/useDashboard';

import { useWorkout } from '@/hooks/useWorkout';

import { getActiveModules } from '@/lib/active-modules';

import {

  buildKoraJournal,

  buildKoraPatternSummary,

  deriveKoraMood,

  describeKoraState,

  describeKoraStage,

  getEquippedCosmeticId,

  getKoraCosmeticById,

  getKoraCosmetics,

  getKoraName,

  getKoraStage,

  getKoraStageProgress,

  withKoraCosmetic,

  withKoraName,

  type KoraCosmeticId,

  type KoraJournal,

  type KoraWeekRow,

} from '@/lib/kora';

import { captureError } from '@/lib/sentry';



function buildTodayTruth(params: {

  mood: ReturnType<typeof describeKoraState>;

  score: number | null;

  strongestWeekday: string | null;

  streak: number;

  daysSinceCreated: number | null;

  hasAnyLog: boolean;

  hasWorkoutLog: boolean;

  hasSleepLog: boolean;

  hasMealsLog: boolean;

  waterComplete: boolean;

  language: 'es' | 'en';

}): string {

  const {

    mood,

    score,

    strongestWeekday,

    streak,

    daysSinceCreated,

    hasAnyLog,

    hasWorkoutLog,

    hasSleepLog,

    hasMealsLog,

    waterComplete,

    language,

  } = params;



  const isMilestone = FESTIVE_STREAKS.has(streak);

  const isEnglish = language === 'en';



  if (isMilestone && hasAnyLog) {

    if (streak === 7) return isEnglish ? '🔥 7 days in a row. This is identity now.' : '🔥 7 dias seguidos. Esto ya es identidad.';

    return isEnglish

      ?  `${streak} days straight. It is no longer motivation, it is a system.`

      : `${streak} dias seguidos. Ya no es motivacion, es sistema.`;

  }



  if (hasWorkoutLog) {

    return isEnglish ? 'That was strong. Your discipline went up today.' : '¡Eso estuvo brutal! Hoy tu disciplina subio.';

  }



  if (waterComplete) {

    return isEnglish ? 'Perfect. Your body thanks you.' : 'Perfecto. Tu cuerpo te lo agradece.';

  }



  if (hasSleepLog && score !== null && score >= 70) {

    return isEnglish ? 'You slept well: your body is ready today.' : 'Dormiste bien: hoy tu cuerpo esta listo para rendir.';

  }



  if (hasMealsLog) {

    return isEnglish ? 'Meal logged. Stable energy, easier decisions.' : 'Comida registrada. Energia estable, decisiones mas faciles.';

  }



  if (streak === 0 && !hasAnyLog && (daysSinceCreated ?? 0) >= 3) {

    return isEnglish ? 'Hey… I missed you yesterday. Back today?' : 'Ey… te extrañe ayer. ¿Volvemos hoy?';

  }



  if (score !== null && score < 45) {

    return isEnglish

      ? 'Today is not lying: it is a low day. Start with one simple real action.'

      : 'Hoy no te va a mentir: el dia viene flojo. Empieza por una sola accion simple y real.';

  }



  if (score !== null && score >= 85) {

    return isEnglish

      ?  `Today feels ${mood.title.toLowerCase()}. If you hold it, the day can end among your best.`

      : `Hoy viene ${mood.title.toLowerCase()}. Si sostienes esto, el cierre del dia puede quedar entre tus mejores recientes.`;

  }



  if (strongestWeekday) {
    return isEnglish
      ?  `You usually do better on ${strongestWeekday}s. Today wants that version.`
      : `Suele verte mejor los ${strongestWeekday}. Hoy quiere que repitas esa version.`;
  }
  return isEnglish

    ? 'No push for no reason: today it just wants you to hold what matters.'

    : 'No te empuja por empujarte: solo quiere que hoy sostengas lo que importa.';

}



const FESTIVE_STREAKS = new Set([7, 14, 21, 30, 45, 60, 90, 100, 120, 180, 365]);



function isWithinSleepWindow(wake: number | null | undefined, sleep: number | null | undefined): boolean {

  if (typeof wake !== 'number' || typeof sleep !== 'number') return false;

  if (wake === sleep) return false;

  const nowMinutes = new Date().getHours() * 60 + new Date().getMinutes();

  if (sleep < wake) {

    return nowMinutes >= sleep && nowMinutes < wake;

  }

  return nowMinutes >= sleep || nowMinutes < wake;

}



function isBirthdayToday(dob: string | null | undefined): boolean {

  if (!dob) return false;

  const date = new Date(dob);

  if (Number.isNaN(date.getTime())) return false;

  const now = new Date();

  return date.getUTCDate() === now.getUTCDate() && date.getUTCMonth() === now.getUTCMonth();

}



function countLowHydrationStreak(rows: KoraWeekRow[], threshold = 35): number {

  if (!rows.length) return 0;

  let count = 0;

  let prevDate: string | null = null;



  for (let index = rows.length - 1; index >= 0; index -= 1) {

    const row = rows[index];

    if (!row) break;

    if (typeof row.hydration_pct !== 'number') break;

    if (row.hydration_pct >= threshold) break;

    if (prevDate) {

      const prev = new Date(`${prevDate}T00:00:00`);

      const current = new Date(`${row.date}T00:00:00`);

      if (prev.getTime() - current.getTime() !== 86_400_000) break;

    }

    count += 1;

    prevDate = row.date;

  }



  return count;

}



export function useKora() {

  const profile = useAuthStore((state) => state.profile);

  const updateProfile = useAuthStore((state) => state.updateProfile);

  const showToast = useUIStore((state) => state.showToast);

  const { todayData, dailyScore } = useDashboard();

  const { activeSession } = useWorkout();

  const userId = profile?.id ?? null;

  const activeModules = getActiveModules(profile);

  const koraName = getKoraName(profile);

  const stage = getKoraStage(profile);

  const stageProgress = getKoraStageProgress(profile);

  const streak = profile?.streak ?? profile?.current_streak ?? 0;

  // Kora todavia vive con una voz y un polish visual pensados primero para espanol.

  // Lo fijamos a `es` para evitar mezcla de idiomas en el primer fold

  // mientras cerramos el tramo final contra VERSION_2_VYRA.

  const language: 'es' | 'en' = 'es';


  const { data: scoreHistory = [] } = useQuery<KoraWeekRow[]>({

    queryKey: ['kora_history', userId],

    queryFn: async () => {

      if (!userId) return [];

      const { data, error } = await supabase

        .from('daily_scores')

        .select('date, total_score, hydration_pct, sleep_pct, activity_pct, nutrition_pct, mental_pct')

        .eq('user_id', userId)

        .gte('date', new Date(Date.now() - 90 * 86_400_000).toISOString().split('T')[0])

        .order('date', { ascending: true });



      if (error) throw error;

      return (data ?? []) as KoraWeekRow[];

    },

    enabled: Boolean(userId),

    staleTime: 5 * 60 * 1000,

  });



  const { data: weeklyJournal = null } = useQuery<KoraJournal | null>({

    queryKey: ['kora_journal', userId, scoreHistory.length, koraName, language],

    queryFn: async () => {

      if (!userId) return null;

      const currentWeek = scoreHistory.slice(-7);

      const previousWeek = scoreHistory.slice(-14, -7);

      return buildKoraJournal(koraName, currentWeek, previousWeek, language);

    },

    enabled: Boolean(userId),

    staleTime: 5 * 60 * 1000,

  });



  const patternSummary = buildKoraPatternSummary(scoreHistory, language);

  const lowHydrationDays = countLowHydrationStreak(scoreHistory);

  const isWorkoutActive = Boolean(activeSession);

  const isSleepWindow = isWithinSleepWindow(profile?.wake_time_minutes, profile?.sleep_time_minutes);

  const isFestive = isBirthdayToday(profile?.dob) || FESTIVE_STREAKS.has(streak);

  const isMysterious = streak >= 100;

  const equippedCosmeticId = getEquippedCosmeticId(profile);

  const cosmetics = useMemo(

    () =>

      getKoraCosmetics(stage).map((cosmetic) => ({

        ...cosmetic,

        equipped: cosmetic.id === equippedCosmeticId,

      })),

    [stage, equippedCosmeticId],

  );

  const unlockedCosmeticIds = useMemo(

    () => new Set(cosmetics.filter((cosmetic) => cosmetic.unlocked).map((cosmetic) => cosmetic.id)),

    [cosmetics],

  );

  const equippedCosmetic = unlockedCosmeticIds.has(equippedCosmeticId as KoraCosmeticId)

    ?  getKoraCosmeticById(equippedCosmeticId)

    : null;

  const mood = deriveKoraMood({

    score: dailyScore?.score ?? null,

    hydrationPct: dailyScore?.breakdown?.hydration ?? null,

    sleepPct: dailyScore?.breakdown?.sleep ?? null,

    nutritionPct: dailyScore?.breakdown?.nutrition ?? null,

    streak,

    hour: new Date().getHours(),

    activeModules,

    isWorkoutActive,

    isSleepWindow,

    isFestive,

    isMysterious,

    lowHydrationDays,

  });

  const descriptor = describeKoraState(mood);

  const stageDescriptor = describeKoraStage(stage);

  const daysSinceCreated = profile?.created_at

    ?  Math.floor((Date.now() - new Date(profile.created_at).getTime()) / 86_400_000)

    : null;

  const hasAnyLog = Boolean(

    dailyScore?.meta?.hasWaterLog ||

      dailyScore?.meta?.hasSleepLog ||

      dailyScore?.meta?.hasMealsLog ||

      dailyScore?.meta?.hasWorkoutLog ||

      dailyScore?.meta?.hasMentalCheckin ||

      (dailyScore?.meta?.steps ?? 0) > 0,

  );

  const waterGoal = Math.max(1, todayData?.water?.goal ?? profile?.water_goal_ml ?? 2500);

  const waterTotal = todayData?.water?.total ?? 0;

  const waterComplete = waterTotal >= waterGoal;



  const todayTruth = buildTodayTruth({

    mood: descriptor,

    score: dailyScore?.score ?? null,

    strongestWeekday: patternSummary.strongestWeekday,

    streak,

    daysSinceCreated,

    hasAnyLog,

    hasWorkoutLog: Boolean(dailyScore?.meta?.hasWorkoutLog),

    hasSleepLog: Boolean(dailyScore?.meta?.hasSleepLog),

    hasMealsLog: Boolean(dailyScore?.meta?.hasMealsLog),

    waterComplete,

    language,

  });



  const moduleMentions = useCallback(() => {

    const pieces: string[] = [];

    if (activeModules.includes('water') && todayData?.water) {
      const goal = Math.max(1, todayData.water.goal ?? 1);
      const pct = Math.round(((todayData.water.total ?? 0) / goal) * 100);
      pieces.push(`agua ${pct}%`);
    }
    if (activeModules.includes('steps') && todayData?.steps) {
      const goal = Math.max(1, todayData.stepGoal ?? profile?.step_goal ?? 10000);
      const pct = Math.round(((todayData.steps.steps ?? 0) / goal) * 100);
      pieces.push(`pasos ${pct}%`);
    }
    if (activeModules.includes('nutrition') && dailyScore?.breakdown?.nutrition !== undefined) {
      pieces.push(`nutricion ${Math.round(dailyScore?.breakdown?.nutrition ?? 0)}%`);
    }
    if (activeModules.includes('sleep') && dailyScore?.breakdown?.sleep !== undefined) {
      pieces.push(`sueno ${Math.round(dailyScore?.breakdown?.sleep ?? 0)}%`);
    }
    return pieces;

  }, [

    activeModules,

    dailyScore?.breakdown?.nutrition,

    dailyScore?.breakdown?.sleep,

    language,

    profile?.step_goal,

    todayData,

  ]);



  const { mutateAsync: renameKora, isPending: isSavingName } = useMutation({

    mutationFn: async (nextName: string) => {

      if (!profile?.id) throw new Error('No user');

      const sanitized = nextName.trim().slice(0, 24);

      if (!sanitized) throw new Error('Nombre invalido');

      const currentMemory = getProfileContextMemory(profile);

      const nextMemory = withKoraName(currentMemory, sanitized);

      const { error } = await supabase

        .from('profiles')

        .update({

          ...buildProfileContextUpdate({ memory: nextMemory }),

          updated_at: new Date().toISOString(),

        })

        .eq('id', profile.id);

      if (error) throw error;

      return { sanitized, nextMemory };

    },

    onSuccess: ({ sanitized, nextMemory }) => {

      updateProfile(buildProfileContextUpdate({ memory: nextMemory }));

      showToast(`${sanitized} ya quedo guardada.`, 'success');

    },

    onError: (error) => {

      captureError(error instanceof Error ? error : new Error(String(error)), { action: 'useKora.renameKora' });

      showToast('No se pudo guardar el nombre de Kora.', 'error');

    },

  });



  const { mutateAsync: equipCosmetic, isPending: isSavingCosmetic } = useMutation({

    mutationFn: async (nextId: KoraCosmeticId | null) => {

      if (!profile?.id) throw new Error('No user');

      if (nextId && !unlockedCosmeticIds.has(nextId)) {

        throw new Error('Cosmetic locked');

      }

      const currentMemory = getProfileContextMemory(profile);

      const nextMemory = withKoraCosmetic(currentMemory, nextId);

      const { error } = await supabase

        .from('profiles')

        .update({

          ...buildProfileContextUpdate({ memory: nextMemory }),

          updated_at: new Date().toISOString(),

        })

        .eq('id', profile.id);

      if (error) throw error;

      return { nextId, nextMemory };

    },

    onSuccess: ({ nextId, nextMemory }) => {

      updateProfile(buildProfileContextUpdate({ memory: nextMemory }));

      showToast(nextId ? 'Accesorio equipado.' : 'Accesorio removido.', 'success');

    },

    onError: (error) => {

      captureError(error instanceof Error ? error : new Error(String(error)), { action: 'useKora.equipCosmetic' });

      showToast('No se pudo actualizar el accesorio.', 'error');

    },

  });



  return {

    koraName,

    stage,

    stageProgress,

    mood,

    descriptor,

    stageDescriptor,

    weeklyJournal,

    patternSummary,

    todayTruth,

    cosmetics,

    equippedCosmetic,

    equippedCosmeticId,

    activeModules,

    moduleMentions: moduleMentions(),

    isSavingName,

    renameKora,

    isSavingCosmetic,

    equipCosmetic,

  };

}

