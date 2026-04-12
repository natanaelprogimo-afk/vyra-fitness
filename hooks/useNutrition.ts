// ============================================================
// VYRA FITNESS — useNutrition Hook
// Log de comidas por tipo (breakfast/lunch/dinner/snack),
// totales diarios de macros, búsqueda de alimentos, historial
// ============================================================

import { useCallback, useRef, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';
import { useUIStore } from '@/stores/uiStore';
import { addCoins, addXP } from '@/services/supabase/profiles';
import { captureError } from '@/lib/sentry';
import { trackLogCreated } from '@/lib/analytics';
import { todayISO, daysAgoISO } from '@/utils/dates';
import { calculateMacros } from '@/utils/calculations';
import { decryptSensitiveText } from '@/lib/sensitive-crypto';
import { resolveFemalePhaseFromRecord } from '@/lib/female-phase';
import { Colors } from '@/constants/colors';
import {
  getNutritionMode,
  getNutritionModeOption,
  withNutritionMode,
  type NutritionMode,
} from '@/lib/nutrition-mode';

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export const MEAL_TYPES: Record<MealType, { label: string; emoji: string; hour: number }> = {
  breakfast: { label: 'Desayuno', emoji: '🌅', hour: 8  },
  lunch:     { label: 'Almuerzo', emoji: '☀️',  hour: 13 },
  dinner:    { label: 'Cena',     emoji: '🌙',  hour: 20 },
  snack:     { label: 'Snack',    emoji: '🍎',  hour: 16 },
};

export interface MealEntry {
  id:         string;
  meal_type:  MealType;
  food_name:  string;
  food_id:    string | null;
  calories:   number;
  protein_g:  number;
  carbs_g:    number;
  fat_g:      number;
  fiber_g:    number;
  sodium_mg?: number | null;
  amount_g:   number;
  logged_at:  string;
  source?:    MealSource;
}

export type MealSource = 'manual' | 'barcode' | 'photo_ai' | 'voice' | 'recipe';

export interface FoodItem {
  id:                string;
  name:              string;
  brand:             string | null;
  barcode:           string | null;
  calories_per_100g: number;
  protein_g:         number;
  carbs_g:           number;
  fat_g:             number;
  fiber_g:           number;
}

export interface LogMealInput {
  meal_type: MealType;
  food_name: string;
  food_id?:  string;
  amount_g:  number;
  calories:  number;
  protein_g: number;
  carbs_g:   number;
  fat_g:     number;
  fiber_g:   number;
  source?:   MealSource;
}

export interface FrequentMeal {
  key: string;
  meal_type: MealType;
  food_name: string;
  food_id: string | null;
  amount_g: number;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  fiber_g: number;
  uses: number;
}

export interface NutritionSleepEnergyCorrelation {
  insight: string | null;
  avgSleepHighNutrition: number | null;
  avgSleepLowNutrition: number | null;
  avgEnergyHighNutrition: number | null;
  avgEnergyLowNutrition: number | null;
  sampleHigh: number;
  sampleLow: number;
}

function average(values: number[]): number | null {
  if (!values.length) return null;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

export function useNutrition() {
  const queryClient = useQueryClient();
  const profile     = useAuthStore(s => s.profile);
  const updateProfile = useAuthStore(s => s.updateProfile);
  const showToast   = useUIStore(s => s.showToast);
  const isOnline    = useUIStore(s => s.isOnline);
  const userId      = profile?.id ?? '';
  const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isSavingNutritionMode, setIsSavingNutritionMode] = useState(false);
  const [isSavingCompetitionCheckin, setIsSavingCompetitionCheckin] = useState(false);
  const coachMemory =
    profile?.coach_memory_json && typeof profile.coach_memory_json === 'object'
      ? (profile.coach_memory_json as Record<string, unknown>)
      : {};

  const calorieGoal = profile?.calorie_goal ?? 2000;
  const macroGoals  = calculateMacros(calorieGoal, (profile?.goal as any) ?? 'health');

  // ─── Comidas de hoy ──────────────────────────────────────
  const { data: todayMeals = [], isLoading, refetch } = useQuery<MealEntry[]>({
    queryKey: ['meals_today', userId, todayISO()],
    queryFn: async () => {
      if (!userId) return [];
      const { data } = await supabase
        .from('meals')
        .select('*')
        .eq('user_id', userId)
        .gte('logged_at', `${todayISO()}T00:00:00`)
        .lte('logged_at', `${todayISO()}T23:59:59`)
        .order('logged_at', { ascending: true });
      return data ?? [];
    },
    enabled:   !!userId,
    staleTime: 60 * 1000,
  });

  // ─── Totales del día ─────────────────────────────────────
  const totals = todayMeals.reduce(
    (acc, m) => ({
      calories: acc.calories + m.calories,
      protein:  acc.protein  + m.protein_g,
      carbs:    acc.carbs    + m.carbs_g,
      fat:      acc.fat      + m.fat_g,
      fiber:    acc.fiber    + m.fiber_g,
      sodium:   acc.sodium   + Number(m.sodium_mg ?? 0),
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, sodium: 0 }
  );

  const caloriePct = Math.min(100, (totals.calories / calorieGoal) * 100);
  const remaining  = Math.max(0, calorieGoal - totals.calories);

  // Meals agrupadas por tipo
  const mealsByType = (Object.keys(MEAL_TYPES) as MealType[]).reduce((acc, type) => {
    acc[type] = todayMeals.filter(m => m.meal_type === type);
    return acc;
  }, {} as Record<MealType, MealEntry[]>);

  // Comida más reciente por tipo (para el check-icon del grid)
  const hasEaten = (Object.keys(MEAL_TYPES) as MealType[]).reduce((acc, type) => {
    acc[type] = mealsByType[type].length > 0;
    return acc;
  }, {} as Record<MealType, boolean>);

  // ─── Historial 7 días ────────────────────────────────────
  const { data: weeklyData = [] } = useQuery({
    queryKey: ['nutrition_weekly', userId],
    queryFn: async () => {
      if (!userId || !isOnline) return [];
      const from = `${daysAgoISO(6)}T00:00:00`;
      const { data } = await supabase
        .from('meals')
        .select('logged_at, calories, protein_g, carbs_g, fat_g')
        .eq('user_id', userId)
        .gte('logged_at', from)
        .order('logged_at');

      // Agrupar por fecha
      const byDate: Record<string, { calories: number; protein: number; carbs: number; fat: number }> = {};
      for (const m of data ?? []) {
        const date = m.logged_at.split('T')[0];
        if (!byDate[date]) byDate[date] = { calories: 0, protein: 0, carbs: 0, fat: 0 };
        byDate[date].calories += m.calories;
        byDate[date].protein  += m.protein_g;
        byDate[date].carbs    += m.carbs_g;
        byDate[date].fat      += m.fat_g;
      }
      return Object.entries(byDate).map(([date, v]) => ({ date, ...v }));
    },
    enabled:   !!userId && isOnline,
    staleTime: 5 * 60 * 1000,
  });

  // ─── Buscar alimentos ─────────────────────────────────────
  const searchFoods = useCallback(async (query: string): Promise<FoodItem[]> => {
    if (!query.trim() || query.length < 2) return [];

    return new Promise((resolve) => {
      if (searchDebounceRef.current) {
        clearTimeout(searchDebounceRef.current);
      }

      searchDebounceRef.current = setTimeout(async () => {
        const { data } = await supabase
          .from('foods')
          .select('id, name, brand, barcode, calories_per_100g, protein_g, carbs_g, fat_g, fiber_g')
          .or(`is_global.eq.true,created_by.eq.${userId}`)
          .ilike('name', `%${query.trim()}%`)
          .limit(20);

        resolve(data ?? []);
      }, 300);
    });
  }, [userId]);

  const { data: frequentMeals = [] } = useQuery<FrequentMeal[]>({
    queryKey: ['nutrition_frequent_meals', userId],
    queryFn: async () => {
      if (!userId || !isOnline) return [];
      const from = `${daysAgoISO(59)}T00:00:00`;
      const { data } = await supabase
        .from('meals')
        .select('meal_type, food_name, food_id, amount_g, calories, protein_g, carbs_g, fat_g, fiber_g, logged_at')
        .eq('user_id', userId)
        .gte('logged_at', from)
        .order('logged_at', { ascending: false })
        .limit(500);

      const map = new Map<string, FrequentMeal>();
      for (const row of data ?? []) {
        const key = `${row.meal_type}::${row.food_name.trim().toLowerCase()}`;
        const existing = map.get(key);
        if (!existing) {
          map.set(key, {
            key,
            meal_type: row.meal_type as MealType,
            food_name: row.food_name,
            food_id: row.food_id ?? null,
            amount_g: row.amount_g,
            calories: row.calories,
            protein_g: row.protein_g,
            carbs_g: row.carbs_g,
            fat_g: row.fat_g,
            fiber_g: row.fiber_g,
            uses: 1,
          });
          continue;
        }
        existing.uses += 1;
      }

      return [...map.values()]
        .sort((a, b) => b.uses - a.uses)
        .slice(0, 10);
    },
    enabled: !!userId && isOnline,
    staleTime: 10 * 60 * 1000,
  });

  const { data: nutritionSleepEnergyCorrelation = {
    insight: null,
    avgSleepHighNutrition: null,
    avgSleepLowNutrition: null,
    avgEnergyHighNutrition: null,
    avgEnergyLowNutrition: null,
    sampleHigh: 0,
    sampleLow: 0,
  } } = useQuery<NutritionSleepEnergyCorrelation>({
    queryKey: ['nutrition_sleep_energy_corr', userId],
    queryFn: async () => {
      if (!userId || !isOnline) {
        return {
          insight: null,
          avgSleepHighNutrition: null,
          avgSleepLowNutrition: null,
          avgEnergyHighNutrition: null,
          avgEnergyLowNutrition: null,
          sampleHigh: 0,
          sampleLow: 0,
        };
      }

      const from = daysAgoISO(20);
      const [scoresRes, mentalRes] = await Promise.all([
        supabase
          .from('daily_scores')
          .select('date, nutrition_pct, sleep_pct')
          .eq('user_id', userId)
          .gte('date', from)
          .order('date', { ascending: true }),
        supabase
          .from('mental_checkins')
          .select('*')
          .eq('user_id', userId)
          .gte('check_date', from)
          .order('check_date', { ascending: true }),
      ]);

      const energyByDate = new Map<string, number>();
      for (const row of mentalRes.data ?? []) {
        const decryptedEnergy = await decryptSensitiveText(
          typeof row.energy_encrypted === 'string' ? row.energy_encrypted : null,
        );
        const energy = Number(decryptedEnergy ?? row.energy ?? 0);
        if (energy > 0) {
          energyByDate.set(row.check_date, energy);
        }
      }

      const rows = (scoresRes.data ?? [])
        .map((row) => ({
          nutrition: Number(row.nutrition_pct ?? 0),
          sleep: Number(row.sleep_pct ?? 0),
          energy: energyByDate.get(row.date) ?? null,
        }))
        .filter((row) => row.nutrition > 0 && row.sleep > 0);

      const highNutrition = rows.filter((row) => row.nutrition >= 70);
      const lowNutrition = rows.filter((row) => row.nutrition < 50);

      const avgSleepHigh = average(highNutrition.map((row) => row.sleep));
      const avgSleepLow = average(lowNutrition.map((row) => row.sleep));
      const avgEnergyHigh = average(
        highNutrition
          .map((row) => row.energy)
          .filter((value): value is number => typeof value === 'number'),
      );
      const avgEnergyLow = average(
        lowNutrition
          .map((row) => row.energy)
          .filter((value): value is number => typeof value === 'number'),
      );

      let insight: string | null = null;
      if (highNutrition.length >= 4 && lowNutrition.length >= 4) {
        const sleepDiff = (avgSleepHigh ?? 0) - (avgSleepLow ?? 0);
        const energyDiff = (avgEnergyHigh ?? 0) - (avgEnergyLow ?? 0);
        const hasSleepSignal = Math.abs(sleepDiff) >= 5;
        const hasEnergySignal = Math.abs(energyDiff) >= 1;

        if (hasSleepSignal && hasEnergySignal) {
          insight =
            sleepDiff >= 0 && energyDiff >= 0
              ? `Con nutricion alta, tu sueno sube ~${Math.round(sleepDiff)} pts y tu energia ~${energyDiff.toFixed(1)} pts.`
              : `En dias de nutricion baja, sueno y energia tienden a caer (sueno ${Math.round(Math.abs(sleepDiff))} pts, energia ${Math.abs(energyDiff).toFixed(1)} pts).`;
        } else if (hasSleepSignal) {
          insight =
            sleepDiff >= 0
              ? `Cuando comes mejor, tu sueno mejora ~${Math.round(sleepDiff)} puntos.`
              : `Cuando baja tu calidad nutricional, tu sueno cae ~${Math.round(Math.abs(sleepDiff))} puntos.`;
        } else if (hasEnergySignal) {
          insight =
            energyDiff >= 0
              ? `Con mejor nutricion, tu energia reportada sube ~${energyDiff.toFixed(1)} puntos.`
              : `Con nutricion baja, tu energia reportada cae ~${Math.abs(energyDiff).toFixed(1)} puntos.`;
        }
      }

      return {
        insight,
        avgSleepHighNutrition: avgSleepHigh !== null ? Math.round(avgSleepHigh) : null,
        avgSleepLowNutrition: avgSleepLow !== null ? Math.round(avgSleepLow) : null,
        avgEnergyHighNutrition: avgEnergyHigh !== null ? Math.round(avgEnergyHigh * 10) / 10 : null,
        avgEnergyLowNutrition: avgEnergyLow !== null ? Math.round(avgEnergyLow * 10) / 10 : null,
        sampleHigh: highNutrition.length,
        sampleLow: lowNutrition.length,
      };
    },
    enabled: !!userId && isOnline,
    staleTime: 10 * 60 * 1000,
  });

  const { data: femaleCyclePhase = null } = useQuery({
    queryKey: ['nutrition_cycle_phase', userId],
    queryFn: async () => {
      if (!userId || !isOnline || !profile?.female_health_enabled) return null;
      const { data } = await supabase
        .from('female_health_logs')
        .select('*')
        .eq('user_id', userId)
        .order('logged_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      const phase = await resolveFemalePhaseFromRecord(data as Record<string, unknown> | null | undefined);
      if (phase === 'menstrual' || phase === 'follicular' || phase === 'ovulation' || phase === 'luteal') {
        return phase as 'menstrual' | 'follicular' | 'ovulation' | 'luteal';
      }
      return null;
    },
    enabled: !!userId && isOnline && Boolean(profile?.female_health_enabled),
    staleTime: 60 * 60 * 1000,
  });

  const cycleNutritionGuidance = (() => {
    if (femaleCyclePhase === 'menstrual') {
      return 'Fase menstrual: prioriza hierro y omega-3 (espinaca, legumbres, pescado azul).';
    }
    if (femaleCyclePhase === 'follicular') {
      return 'Fase folicular: buena ventana para subir proteina y zinc y apoyar recuperacion.';
    }
    if (femaleCyclePhase === 'ovulation') {
      return 'Fase ovulatoria: reforza antioxidantes y carbos de calidad para sostener rendimiento.';
    }
    if (femaleCyclePhase === 'luteal') {
      return 'Fase lutea: suma magnesio y carbos complejos para energia estable y menos ansiedad.';
    }
    return null;
  })();

  const { data: activitySnapshot = { stepCalories: 0, workoutCalories: 0 } } = useQuery({
    queryKey: ['nutrition_activity_snapshot', userId, todayISO()],
    queryFn: async () => {
      if (!userId || !isOnline) return { stepCalories: 0, workoutCalories: 0 };
      const today = todayISO();
      const [stepsRes, workoutRes] = await Promise.all([
        supabase
          .from('step_logs')
          .select('calories')
          .eq('user_id', userId)
          .eq('logged_date', today),
        supabase
          .from('workout_sessions')
          .select('estimated_calories, started_at')
          .eq('user_id', userId)
          .gte('started_at', `${today}T00:00:00`)
          .lte('started_at', `${today}T23:59:59`),
      ]);

      const stepCalories = (stepsRes.data ?? []).reduce((sum, row) => sum + Number(row.calories ?? 0), 0);
      const workoutCalories = (workoutRes.data ?? []).reduce(
        (sum, row) => sum + Number((row as any).estimated_calories ?? 0),
        0,
      );

      return { stepCalories, workoutCalories };
    },
    enabled: !!userId,
    staleTime: 60 * 1000,
  });

  const { data: trackedWeightLogs = 0 } = useQuery({
    queryKey: ['nutrition_weight_logs_count', userId],
    queryFn: async () => {
      if (!userId || !isOnline) return 0;
      const from = `${daysAgoISO(29)}T00:00:00`;
      const { count } = await supabase
        .from('weight_logs')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId)
        .gte('logged_at', from);
      return count ?? 0;
    },
    enabled: !!userId,
    staleTime: 10 * 60 * 1000,
  });

  const activityCalories = Math.max(
    0,
    Math.round(Number(activitySnapshot.stepCalories ?? 0) + Number(activitySnapshot.workoutCalories ?? 0)),
  );
  const nutritionMode = getNutritionMode(profile);
  const nutritionModeOption = getNutritionModeOption(nutritionMode);
  const proteinBoost =
    nutritionMode === 'competition'
      ? 20
      : nutritionMode === 'athlete'
        ? Math.max(10, Math.round(activityCalories / 150))
        : Math.round(activityCalories / 250);
  const calorieBudget = Math.max(
    calorieGoal,
    Math.round(
      calorieGoal +
        (nutritionMode === 'competition'
          ? activityCalories * 0.45
          : nutritionMode === 'athlete'
            ? activityCalories * 0.35
            : activityCalories * 0.2),
    ),
  );
  const displayMacroGoals = {
    protein: Math.round(
      (macroGoals.protein ?? 0) +
        proteinBoost +
        (nutritionMode === 'competition' ? 15 : nutritionMode === 'awareness' ? -5 : 0),
    ),
    carbs: Math.max(
      60,
      Math.round(
        (macroGoals.carbs ?? 0) +
          (nutritionMode === 'athlete'
            ? activityCalories / 12
            : nutritionMode === 'competition'
              ? activityCalories / 10
              : nutritionMode === 'simple'
                ? activityCalories / 18
                : activityCalories / 20),
      ),
    ),
    fat: Math.max(35, Math.round((macroGoals.fat ?? 0) + (nutritionMode === 'awareness' ? 4 : 0))),
  };

  const fastingIntegration = (() => {
    const activeFast =
      typeof coachMemory.fasting_active === 'boolean'
        ? Boolean(coachMemory.fasting_active)
        : false;
    if (!activeFast && !profile?.fasting_protocol) return null;

    const protocolLabel =
      typeof coachMemory.fasting_protocol_label === 'string'
        ? (coachMemory.fasting_protocol_label as string)
        : profile?.fasting_protocol ?? 'protocolo activo';
    const blocked = activeFast;

    return {
      active: activeFast,
      blocked,
      message: blocked
        ? `Ayuno activo: mantén el plan simple hasta romper ${protocolLabel}.`
        : `Ayuno configurado: ${protocolLabel}. Ajusta la primera comida según hambre y horario real.`,
      steps: blocked
        ? [
            'Prioriza agua, cafe o infusiones sin calorías.',
            'Rompe el ayuno solo si el contexto del día lo justifica.',
            'Cuando abras la ventana, empieza con proteína y comida simple.',
          ]
        : ['Proteína primero.', 'Carbos alrededor del esfuerzo.', 'Cierra el día sin improvisar.'],
    };
  })();

  const adaptivePlan = {
    message:
      nutritionMode === 'competition'
        ? 'VYRA está priorizando precisión y consistencia para que el peso diario tenga contexto real.'
        : nutritionMode === 'athlete'
          ? 'VYRA está ajustando el presupuesto del día con más foco en rendimiento y recuperación.'
          : nutritionMode === 'awareness'
            ? 'VYRA está simplificando el día para que comer bien sea sostenible y rápido.'
            : 'VYRA usa tu actividad y la consistencia reciente para que el plan no se quede estático.',
    recommendedCalories: calorieBudget,
    trackedMealDays: weeklyData.length,
    trackedWeightLogs,
  };

  const simpleTargets = {
    calories: calorieBudget,
    protein: displayMacroGoals.protein,
    carbs: displayMacroGoals.carbs,
    fat: displayMacroGoals.fat,
  };

  const nutritionStreakDays = (() => {
    if (!weeklyData.length) return 0;
    const dayMap = new Map(weeklyData.map((row) => [row.date, Number(row.calories ?? 0)]));
    let streak = 0;
    for (let offset = 0; offset < 30; offset += 1) {
      const date = new Date();
      date.setDate(date.getDate() - offset);
      const key = date.toISOString().split('T')[0] ?? '';
      if ((dayMap.get(key) ?? 0) > 0) {
        streak += 1;
      } else {
        break;
      }
    }
    return streak;
  })();

  const competitionCheckin =
    coachMemory.nutrition_competition_checkin && typeof coachMemory.nutrition_competition_checkin === 'object'
      ? (coachMemory.nutrition_competition_checkin as {
          sodium_mg: number;
          water_ml: number;
          fiber_g: number;
          carbs_g: number | null;
          weight_kg: number | null;
          notes: string | null;
          date?: string;
        })
      : null;

  const mealLoggingBlockReason = fastingIntegration?.blocked
    ? 'Hay un ayuno activo. Si vas a registrar comida, primero termina o actualiza la ventana.'
    : '';
  const isMealLoggingBlocked = Boolean(fastingIntegration?.blocked);

  const recipeTemplates = [
    {
      id: 'protein-breakfast',
      meal_type: 'breakfast' as MealType,
      title: 'Desayuno limpio',
      subtitle: 'Proteína alta y salida simple.',
      food_name: 'Yogur griego + fruta + whey',
      rationale: 'Rápido, alto en proteína y fácil de repetir incluso en días ocupados.',
      calories: 420,
      protein_g: 38,
      carbs_g: 36,
      fat_g: 11,
      fiber_g: 6,
      accent: Colors.nutrition,
      tags: ['rápido', 'proteína', 'repetible'],
    },
    {
      id: 'simple-lunch',
      meal_type: 'lunch' as MealType,
      title: 'Almuerzo base',
      subtitle: 'Proteína, carbos y cero ruido.',
      food_name: 'Pollo + arroz + verduras',
      rationale: 'La receta base para cumplir calorías sin improvisar demasiado.',
      calories: 620,
      protein_g: 45,
      carbs_g: 68,
      fat_g: 15,
      fiber_g: 7,
      accent: Colors.coach,
      tags: ['base', 'volumen', 'fácil'],
    },
    {
      id: 'easy-dinner',
      meal_type: 'dinner' as MealType,
      title: 'Cena estable',
      subtitle: 'Ligera pero suficiente.',
      food_name: 'Tortilla + ensalada + papa',
      rationale: 'Ayuda a cerrar el día con proteína y saciedad sin caer pesada.',
      calories: 510,
      protein_g: 30,
      carbs_g: 42,
      fat_g: 19,
      fiber_g: 8,
      accent: Colors.sleep,
      tags: ['cierre', 'ligera', 'saciedad'],
    },
  ];

  // ─── Buscar por código de barras (Open Food Facts API) ────
  const searchByBarcode = useCallback(async (barcode: string): Promise<FoodItem | null> => {
    const trimmedBarcode = barcode.trim();
    if (!trimmedBarcode) return null;

    try {
      const apiBase = process.env.EXPO_PUBLIC_API_URL ?? process.env.EXPO_PUBLIC_BACKEND_URL ?? '';
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData.session?.access_token ?? null;

      if (apiBase && accessToken) {
        const response = await fetch(
          `${apiBase}/api/food/barcode/${encodeURIComponent(trimmedBarcode)}`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          },
        );

        const raw = await response.text();
        const payload = raw.trim() ? JSON.parse(raw) : {};

        if (response.ok) {
          return (payload.food ?? null) as FoodItem | null;
        }

        if (response.status === 404) {
          return null;
        }

        throw new Error(
          typeof payload?.error === 'string'
            ? payload.error
            : 'No pudimos consultar el código de barras.',
        );
      }

      const { data: existingFood } = await supabase
        .from('foods')
        .select('id, name, brand, barcode, calories_per_100g, protein_g, carbs_g, fat_g, fiber_g')
        .eq('barcode', trimmedBarcode)
        .maybeSingle();

      if (existingFood) return existingFood as FoodItem;

      const response = await fetch(`https://world.openfoodfacts.org/api/v0/product/${trimmedBarcode}.json`);
      if (!response.ok) return null;

      const offData = await response.json();
      if (!offData.product) return null;

      const product = offData.product;
      return {
        id: `off_${trimmedBarcode}`,
        name: product.product_name || 'Alimento desconocido',
        brand: product.brands || null,
        barcode: trimmedBarcode,
        calories_per_100g: product.nutriments?.['energy-kcal_100g'] || 0,
        protein_g: product.nutriments?.['proteins_100g'] || 0,
        carbs_g: product.nutriments?.['carbohydrates_100g'] || 0,
        fat_g: product.nutriments?.['fat_100g'] || 0,
        fiber_g: product.nutriments?.['fiber_100g'] || 0,
      };
    } catch (err) {
      captureError(err instanceof Error ? err : new Error(String(err)), { action: 'useNutrition.searchByBarcode' });
      throw err;
    }
  }, []);

  // ─── Log comida ──────────────────────────────────────────
  const { mutate: logMeal, mutateAsync: logMealAsync, isPending: isLogging } = useMutation({
    mutationFn: async (input: LogMealInput) => {
      if (!userId) throw new Error('No user');
      const { data, error } = await supabase.from('meals').insert({
        user_id:   userId,
        meal_type: input.meal_type,
        food_name: input.food_name,
        food_id:   input.food_id ?? null,
        calories:  Math.round(input.calories),
        protein_g: Math.round(input.protein_g * 10) / 10,
        carbs_g:   Math.round(input.carbs_g   * 10) / 10,
        fat_g:     Math.round(input.fat_g     * 10) / 10,
        fiber_g:   Math.round(input.fiber_g   * 10) / 10,
        amount_g:  input.amount_g,
        logged_at: new Date().toISOString(),
        source:    input.source ?? 'manual',
      }).select('id').single();
      if (error) throw error;
      return data.id;
    },
    onSuccess: async (_, input) => {
      // Coins por primer log de cada tipo de comida del día
      const isFirst = mealsByType[input.meal_type].length === 0;
      if (isFirst) {
        await addCoins(userId, 3, 'nutrition_log', `${MEAL_TYPES[input.meal_type].label} registrado`);
        await addXP(userId, 20);
      }

      queryClient.invalidateQueries({ queryKey: ['meals_today'] });
      queryClient.invalidateQueries({ queryKey: ['nutrition_weekly'] });
      queryClient.invalidateQueries({ queryKey: ['nutrition_frequent_meals'] });
      queryClient.invalidateQueries({ queryKey: ['nutrition_sleep_energy_corr'] });
      queryClient.invalidateQueries({ queryKey: ['today_summary'] });

      showToast(`+${Math.round(input.calories)} kcal — ${input.food_name}`, 'success');
      trackLogCreated('nutrition', 'manual', Date.now());

      if (isOnline) void supabase.rpc('calculate_daily_score', { p_user_id: userId });
    },
    onError: (err) => {
      captureError(err instanceof Error ? err : new Error(String(err)), { action: "'logMeal'" });
      showToast('No se pudo guardar la comida.', 'error');
    },
  });

  // ─── Borrar comida ───────────────────────────────────────
  const { mutate: deleteMeal } = useMutation({
    mutationFn: async (mealId: string) => {
      const { error } = await supabase.from('meals').delete().eq('id', mealId).eq('user_id', userId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meals_today'] });
      showToast('Comida eliminada', 'info');
    },
  });

  const checkBarcodeLimit = useCallback(async () => {
    if (!userId) return { allowed: false, remaining: 0, limit: 5 };
    if (profile?.is_premium) return { allowed: true, remaining: Infinity, limit: Infinity };

    const { count } = await supabase
      .from('meals')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('source', 'barcode')
      .gte('logged_at', `${todayISO()}T00:00:00`)
      .lte('logged_at', `${todayISO()}T23:59:59`);

    const used = count ?? 0;
    const remaining = Math.max(0, 5 - used);
    return {
      allowed: remaining > 0,
      remaining,
      limit: 5,
    };
  }, [profile?.is_premium, userId]);

  const logRecipeTemplateAsync = useCallback(async (recipe: {
    meal_type: MealType;
    food_name: string;
    calories: number;
    protein_g: number;
    carbs_g: number;
    fat_g: number;
    fiber_g: number;
  }) => {
    if (isMealLoggingBlocked) {
      throw new Error(mealLoggingBlockReason || 'Registro bloqueado temporalmente.');
    }
    return logMealAsync({
      meal_type: recipe.meal_type,
      food_name: recipe.food_name,
      amount_g: 100,
      calories: recipe.calories,
      protein_g: recipe.protein_g,
      carbs_g: recipe.carbs_g,
      fat_g: recipe.fat_g,
      fiber_g: recipe.fiber_g,
      source: 'recipe',
    });
  }, [isMealLoggingBlocked, logMealAsync, mealLoggingBlockReason]);

  const setNutritionMode = useCallback(async (mode: NutritionMode): Promise<boolean> => {
    if (!userId || mode === nutritionMode) return true;
    setIsSavingNutritionMode(true);
    const nextMemory = withNutritionMode(coachMemory, mode);
    const previousMemory = coachMemory;
    updateProfile({ coach_memory_json: nextMemory });
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ coach_memory_json: nextMemory, updated_at: new Date().toISOString() })
        .eq('id', userId);
      if (error) throw error;
      showToast(`Modo ${getNutritionModeOption(mode).shortTitle.toLowerCase()} activado.`, 'success');
      return true;
    } catch (err) {
      updateProfile({ coach_memory_json: previousMemory });
      captureError(err instanceof Error ? err : new Error(String(err)), { action: 'useNutrition.setNutritionMode' });
      showToast('No pudimos actualizar el modo ahora mismo.', 'warning');
      return false;
    } finally {
      setIsSavingNutritionMode(false);
    }
  }, [coachMemory, nutritionMode, showToast, updateProfile, userId]);

  const saveCompetitionCheckin = useCallback(async (input: {
    sodium_mg: number;
    water_ml: number;
    fiber_g: number;
    carbs_g: number | null;
    weight_kg: number | null;
    notes: string | null;
  }): Promise<boolean> => {
    if (!userId) return false;
    setIsSavingCompetitionCheckin(true);
    const nextMemory = {
      ...coachMemory,
      nutrition_competition_checkin: {
        ...input,
        date: todayISO(),
      },
    };
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ coach_memory_json: nextMemory, updated_at: new Date().toISOString() })
        .eq('id', userId);
      if (error) throw error;
      updateProfile({ coach_memory_json: nextMemory });
      showToast('Check-in guardado.', 'success');
      return true;
    } catch (err) {
      captureError(err instanceof Error ? err : new Error(String(err)), { action: 'useNutrition.saveCompetitionCheckin' });
      showToast('No pudimos guardar el check-in.', 'error');
      return false;
    } finally {
      setIsSavingCompetitionCheckin(false);
    }
  }, [coachMemory, showToast, updateProfile, userId]);

  return {
    todayMeals, mealsByType, hasEaten,
    totals, caloriePct, remaining,
    calorieGoal, macroGoals,
    calorieBudget,
    activityCalories,
    proteinBoost,
    weeklyData,
    frequentMeals,
    nutritionSleepEnergyCorrelation,
    cycleNutritionGuidance,
    nutritionMode,
    nutritionModeOption,
    displayMacroGoals,
    fastingIntegration,
    adaptivePlan,
    simpleTargets,
    recipeTemplates,
    logRecipeTemplateAsync,
    competitionCheckin,
    saveCompetitionCheckin,
    isSavingCompetitionCheckin,
    nutritionStreakDays,
    isMealLoggingBlocked,
    mealLoggingBlockReason,
    setNutritionMode,
    isSavingNutritionMode,
    isLoading, isLogging,
    addMeal: (input: LogMealInput) => logMeal(input),
    logFrequentMeal: (meal: FrequentMeal) =>
      logMeal({
        meal_type: meal.meal_type,
        food_name: meal.food_name,
        food_id: meal.food_id ?? undefined,
        amount_g: meal.amount_g,
        calories: meal.calories,
        protein_g: meal.protein_g,
        carbs_g: meal.carbs_g,
        fat_g: meal.fat_g,
        fiber_g: meal.fiber_g,
      }),
    getDailyMacros: () => ({ ...totals }),
    checkBarcodeLimit,
    logMeal, deleteMeal,
    searchFoods, searchByBarcode, refetch,
  };
}
