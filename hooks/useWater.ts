// ============================================================
// VYRA FITNESS — useWater Hook
// Lógica completa del módulo de hidratación.
// Escribe en WatermelonDB (offline-first) + sincroniza a Supabase.
// Calcula hidratación equivalente según tipo de bebida.
// ============================================================

import { useCallback, useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';
import { useUIStore } from '@/stores/uiStore';
import { database } from '@/database/watermelon';
import { captureError } from '@/lib/sentry';
import { todayISO } from '@/utils/dates';
import { calculateHydrationEquivalent } from '@/utils/calculations';
import { addCoins } from '@/services/supabase/profiles';
import { trackLogCreated } from '@/lib/analytics';
import type { WaterLog, DrinkTypeId } from '@/types/modules';
import { ErrorMessages } from '@/constants/strings';
import { DRINK_TYPES } from '@/constants/modules';

// Metas de alerta por rango horario
function getHydrationAlert(current: number, goal: number, hour: number): string | null {
  const pct = current / goal;
  if (pct >= 1)    return null;
  if (hour >= 18 && pct < 0.5) return '¡Tomaste menos de la mitad! Intentá tomar 2 vasos ahora 💧';
  if (hour >= 14 && pct < 0.3) return 'Ya es la tarde y tomaste poco. Acordate de hidratarte 💧';
  return null;
}

export function useWater() {
  const queryClient = useQueryClient();
  const profile     = useAuthStore((s) => s.profile);
  const showToast   = useUIStore((s) => s.showToast);
  const isOnline    = useUIStore((s) => s.isOnline);
  const userId      = profile?.id ?? '';
  const goal        = profile?.water_goal_ml ?? 2500;

  // ─── Logs del día (desde Supabase cuando hay conexión, WDB offline) ──
  const { data: logs = [], isLoading, refetch } = useQuery<WaterLog[]>({
    queryKey: ['water_logs', userId, todayISO()],
    queryFn:  async () => {
      if (!userId) return [];

      if (isOnline) {
        const { data, error } = await supabase
          .from('water_logs')
          .select('*')
          .eq('user_id', userId)
          .gte('logged_at', `${todayISO()}T00:00:00`)
          .order('logged_at', { ascending: true });

        if (error) throw error;
        return data ?? [];
      }

      // Offline: leer de WatermelonDB
      const localLogs = await database.get('water_logs').query().fetch();
      return (localLogs as any[])
        .filter((l: any) => !l.deleted && l.user_id === userId && l.logged_date === todayISO())
        .map((l: any) => ({
          id:                       l.id,
          user_id:                  l.user_id,
          amount_ml:                l.amount_ml,
          drink_type:               l.drink_type,
          hydration_equivalent_ml:  l.hydration_equivalent_ml,
          logged_at:                new Date(l.logged_at).toISOString(),
          created_at:               new Date(l.created_at).toISOString(),
        }));
    },
    enabled:        !!userId,
    staleTime:      30 * 1000,
    refetchInterval: 60 * 1000,
  });

  // ─── Totales del día ─────────────────────────────────────
  const totalMl     = logs.reduce((s, l) => s + (l.amount_ml ?? 0), 0);
  const totalHydro  = logs.reduce((s, l) => s + (l.hydration_equivalent_ml ?? 0), 0);
  const progressPct = Math.min(100, (totalHydro / goal) * 100);
  const remaining   = Math.max(0, goal - totalHydro);

  // ─── Alerta según hora del día ───────────────────────────
  const hydrationAlert = getHydrationAlert(totalHydro, goal, new Date().getHours());

  // ─── Log de agua ─────────────────────────────────────────
  const { mutate: logWater, isPending: isLogging } = useMutation({
    mutationFn: async ({
      amountMl,
      drinkType = 'water',
    }: {
      amountMl:  number;
      drinkType?: DrinkTypeId;
    }) => {
      if (!userId) throw new Error('No user');
      if (amountMl <= 0 || amountMl > 5000) throw new Error('Cantidad inválida');

      const hydrationEquivalent = calculateHydrationEquivalent(amountMl, drinkType);
      const loggedAt            = Date.now();

      const payload = {
        amount_ml:               amountMl,
        drink_type:              drinkType,
        hydration_equivalent_ml: hydrationEquivalent,
        logged_at:               loggedAt,
        logged_date:             todayISO(),
        deleted:                 false,
      };

      if (isOnline) {
        // Escribir directo a Supabase
        const { data, error } = await supabase
          .from('water_logs')
          .insert({
            user_id:                 userId,
            amount_ml:               amountMl,
            drink_type:              drinkType,
            hydration_equivalent_ml: hydrationEquivalent,
            logged_at:               new Date(loggedAt).toISOString(),
          })
          .select('id')
          .single();

        if (error) throw error;
        return data.id;
      } else {
        // Offline: escribir en WatermelonDB
        const id = `${userId}_${Date.now()}`;
        await database.write(async () => {
          const table = database.get('water_logs');
          await table.create((log: any) => {
            Object.assign(log, payload);
            (log as any).id = id;
          });
        });
        return id;
      }
    },

    onSuccess: async (_, { amountMl, drinkType = 'water' }) => {
      queryClient.invalidateQueries({ queryKey: ['water_logs'] });
      queryClient.invalidateQueries({ queryKey: ['today_summary'] });
      queryClient.invalidateQueries({ queryKey: ['daily_score'] });

      const hydro = calculateHydrationEquivalent(amountMl, drinkType);
      const newTotal = totalHydro + hydro;

      // Feedback positivo
      const drink = DRINK_TYPES[drinkType];
      showToast(`+${amountMl}ml ${drink?.emoji ?? '💧'} — ${Math.round(newTotal)}/${goal}ml`, 'success');

      // Coins por primera vez que alcanza la meta del día
      if (totalHydro < goal && newTotal >= goal) {
        const newBalance = await addCoins(userId, 10, 'hydration_goal', 'Meta de hidratación del día');
        if (newBalance !== null) {
          showToast('¡Meta de hidratación! +10 🪙', 'coins');
        }
      }

      trackLogCreated('water', 'manual', Date.now());

      // Recalcular score
      if (isOnline) {
        void supabase.rpc('calculate_daily_score', { p_user_id: userId });
      }
    },

    onError: (err) => {
      captureError(err instanceof Error ? err : new Error(String(err)), { action: "'logWater'" });
      showToast(ErrorMessages.saveFailed, 'error');
    },
  });

  // ─── Eliminar log ─────────────────────────────────────────
  const { mutate: deleteLog, isPending: isDeleting } = useMutation({
    mutationFn: async (logId: string) => {
      if (!userId) throw new Error('No user');

      if (isOnline) {
        const { error } = await supabase
          .from('water_logs')
          .delete()
          .eq('id', logId)
          .eq('user_id', userId); // RLS extra check

        if (error) throw error;
      } else {
        // Soft delete en WDB
        await database.write(async () => {
          const record = await database.get('water_logs').find(logId);
          await (record as any).update((r: any) => { r.deleted = true; r.synced = false; });
        });
      }
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['water_logs'] });
      queryClient.invalidateQueries({ queryKey: ['today_summary'] });
      showToast('Registro eliminado', 'info');
    },

    onError: () => {
      showToast(ErrorMessages.generic, 'error');
    },
  });

  // ─── Historial (últimos 30 días) ──────────────────────────
  const { data: history = [] } = useQuery({
    queryKey: ['water_history', userId],
    queryFn:  async () => {
      if (!userId || !isOnline) return [];
      const { data } = await supabase
        .from('water_logs')
        .select('logged_at, hydration_equivalent_ml, drink_type, amount_ml')
        .eq('user_id', userId)
        .order('logged_at', { ascending: false })
        .limit(200);
      return data ?? [];
    },
    enabled:   !!userId && isOnline,
    staleTime: 5 * 60 * 1000,
  });

  // Agrupar historial por día para el gráfico
  const weeklyData = groupByDay(history, 7);

  return {
    logs,
    totalMl,
    totalHydro,
    goal,
    progressPct,
    remaining,
    hydrationAlert,
    weeklyData,
    history,
    isLoading,
    isLogging,
    isDeleting,
    logWater:   (amountMl: number, drinkType?: DrinkTypeId) => logWater({ amountMl, drinkType }),
    deleteLog,
    refetch,
  };
}

// ─── Helper: agrupar por día ──────────────────────────────
function groupByDay(
  logs: Array<{ logged_at: string; hydration_equivalent_ml: number }>,
  days: number
): Array<{ date: string; total: number }> {
  const map: Record<string, number> = {};
  const today = new Date();

  for (let i = 0; i < days; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    map[d.toISOString().split('T')[0]] = 0;
  }

  for (const log of logs) {
    const date = log.logged_at.split('T')[0];
    if (date in map) map[date] = (map[date] ?? 0) + log.hydration_equivalent_ml;
  }

  return Object.entries(map)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, total]) => ({ date, total }));
}
