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
  amount_g:   number;
  logged_at:  string;
}

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
}

export function useNutrition() {
  const queryClient = useQueryClient();
  const profile     = useAuthStore(s => s.profile);
  const showToast   = useUIStore(s => s.showToast);
  const isOnline    = useUIStore(s => s.isOnline);
  const userId      = profile?.id ?? '';
  const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 }
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

  // ─── Buscar por código de barras (Open Food Facts API) ────
  const searchByBarcode = useCallback(async (barcode: string): Promise<FoodItem | null> => {
    try {
      // Primero verificar en nuestra base de datos
      const { data: existingFood } = await supabase
        .from('foods')
        .select('*')
        .eq('barcode', barcode)
        .single();

      if (existingFood) return existingFood as FoodItem;

      // Si no existe, consultar Open Food Facts API
      const response = await fetch(`https://world.openfoodfacts.org/api/v0/product/${barcode}.json`);
      if (!response.ok) return null;

      const offData = await response.json();
      if (!offData.product) return null;

      const product = offData.product;
      return {
        id: `off_${barcode}`,
        name: product.product_name || 'Alimento desconocido',
        brand: product.brands || null,
        barcode,
        calories_per_100g: product.nutriments?.['energy-kcal_100g'] || 0,
        protein_g: product.nutriments?.['proteins_100g'] || 0,
        carbs_g: product.nutriments?.['carbohydrates_100g'] || 0,
        fat_g: product.nutriments?.['fat_100g'] || 0,
        fiber_g: product.nutriments?.['fiber_100g'] || 0,
      };
    } catch (err) {
      captureError(err instanceof Error ? err : new Error(String(err)), { action: "useNutrition.searchByBarcode" });
      return null;
    }
  }, [userId]);

  // ─── Log comida ──────────────────────────────────────────
  const { mutate: logMeal, isPending: isLogging } = useMutation({
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

  return {
    todayMeals, mealsByType, hasEaten,
    totals, caloriePct, remaining,
    calorieGoal, macroGoals,
    weeklyData,
    isLoading, isLogging,
    addMeal: (input: LogMealInput) => logMeal(input),
    getDailyMacros: () => ({ ...totals }),
    checkBarcodeLimit,
    logMeal, deleteMeal,
    searchFoods, searchByBarcode, refetch,
  };
}

