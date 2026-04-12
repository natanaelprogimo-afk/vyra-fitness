import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Q } from '@nozbe/watermelondb';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';
import { useUIStore } from '@/stores/uiStore';
import { useWorkoutStore } from '@/stores/workoutStore';
import { database } from '@/database';
import { todayISO } from '@/utils/dates';

export type TimelineType =
  | 'water'
  | 'meal'
  | 'workout'
  | 'sleep'
  | 'fasting_start'
  | 'fasting_end'
  | 'weight'
  | 'mental';

export interface TimelineEntry {
  id: string;
  type: TimelineType;
  title: string;
  detail?: string | null;
  timestamp: string;
}

function toDayRange(date = new Date()) {
  const day = date.toISOString().split('T')[0] ?? todayISO();
  return {
    day,
    start: `${day}T00:00:00.000Z`,
    end: `${day}T23:59:59.999Z`,
  };
}

const MEAL_LABELS: Record<string, string> = {
  breakfast: 'Desayuno',
  lunch: 'Almuerzo',
  dinner: 'Cena',
  snack: 'Snack',
};

const DRINK_LABELS: Record<string, string> = {
  water: 'Agua',
  electrolyte_water: 'Electrolitos',
  sports_drink: 'Isotónica',
  tea: 'Té',
  coffee: 'Café',
  juice: 'Jugo',
  milk: 'Leche',
  alcohol: 'Alcohol',
  other: 'Bebida',
};

function buildLocalWorkoutEntries(day: string, history: Array<{ id: string; name: string; started_at: string; sets_count: number }>) {
  return history
    .filter((session) => (session.started_at.split('T')[0] ?? '') === day)
    .map<TimelineEntry>((session) => ({
      id: `workout-local-${session.id}`,
      type: 'workout',
      title: session.name || 'Entreno',
      detail: session.sets_count ? `${session.sets_count} series` : 'Sesión registrada',
      timestamp: session.started_at,
    }));
}

export function useDailyTimeline() {
  const userId = useAuthStore((state) => state.profile?.id ?? null);
  const isOnline = useUIStore((state) => state.isOnline);
  const workoutHistory = useWorkoutStore((state) => state.history);

  const query = useQuery({
    queryKey: ['daily_timeline', userId, todayISO()],
    queryFn: async () => {
      if (!userId) return [];
      const buildLocalTimeline = async () => {
        const { day } = toDayRange();
        const startMs = new Date(`${day}T00:00:00`).getTime();
        const endMs = new Date(`${day}T23:59:59`).getTime();

        const [
          waterRows,
          mealRows,
          workoutRows,
          sleepRows,
          fastingRows,
          weightRows,
          mentalRows,
        ] = await Promise.all([
          database.get('water_logs').query(Q.where('user_id', userId)).fetch(),
          database.get('meals').query(Q.where('user_id', userId)).fetch(),
          database.get('workout_sessions').query(Q.where('user_id', userId)).fetch(),
          database.get('sleep_logs').query(Q.where('user_id', userId)).fetch(),
          database.get('fasting_logs').query(Q.where('user_id', userId)).fetch(),
          database.get('weight_logs').query(Q.where('user_id', userId)).fetch(),
          database.get('mental_checkins').query(Q.where('user_id', userId)).fetch(),
        ]);

        const entries: TimelineEntry[] = [];

        (waterRows ?? [])
          .filter((row: any) => {
            if (row.deleted) return false;
            const ts = Number(row.logged_at ?? 0);
            return ts >= startMs && ts <= endMs;
          })
          .forEach((log: any) => {
            entries.push({
              id: `water-${log.server_id ?? log.id}`,
              type: 'water',
              title: `${DRINK_LABELS[log.drink_type] ?? 'Agua'} ${log.amount_ml} ml`,
              detail: log.drink_type !== 'water' ? 'Bebida registrada' : null,
              timestamp: new Date(Number(log.logged_at ?? startMs)).toISOString(),
            });
          });

        (mealRows ?? [])
          .filter((row: any) => {
            if (row.deleted) return false;
            const ts = Number(row.logged_at ?? 0);
            return ts >= startMs && ts <= endMs;
          })
          .forEach((meal: any) => {
            entries.push({
              id: `meal-${meal.server_id ?? meal.id}`,
              type: 'meal',
              title: meal.food_name ?? 'Comida',
              detail: `${MEAL_LABELS[meal.meal_type] ?? 'Comida'} · ${Math.round(Number(meal.calories ?? 0))} kcal`,
              timestamp: new Date(Number(meal.logged_at ?? startMs)).toISOString(),
            });
          });

        (workoutRows ?? [])
          .filter((row: any) => {
            const ts = Number(row.started_at ?? 0);
            return ts >= startMs && ts <= endMs;
          })
          .forEach((session: any) => {
            entries.push({
              id: `workout-${session.server_id ?? session.id}`,
              type: 'workout',
              title: session.name || 'Entreno',
              detail: session.total_sets ? `${session.total_sets} series` : 'Sesión registrada',
              timestamp: new Date(Number(session.started_at ?? startMs)).toISOString(),
            });
          });

        (sleepRows ?? [])
          .filter((row: any) => {
            const ts = Number(row.end_time ?? 0);
            return ts >= startMs && ts <= endMs;
          })
          .forEach((log: any) => {
            const hours = Number(log.duration_min ?? 0) / 60;
            entries.push({
              id: `sleep-${log.server_id ?? log.id}`,
              type: 'sleep',
              title: 'Sueño registrado',
              detail: hours > 0 ? `${hours.toFixed(1)}h` : null,
              timestamp: new Date(Number(log.end_time ?? startMs)).toISOString(),
            });
          });

        (fastingRows ?? [])
          .filter((row: any) => Number(row.start_time ?? 0) >= startMs && Number(row.start_time ?? 0) <= endMs)
          .forEach((log: any) => {
            entries.push({
              id: `fasting-start-${log.server_id ?? log.id}`,
              type: 'fasting_start',
              title: 'Ayuno iniciado',
              detail: log.protocol ?? null,
              timestamp: new Date(Number(log.start_time ?? startMs)).toISOString(),
            });
          });

        (fastingRows ?? [])
          .filter((row: any) => Number(row.end_time ?? 0) >= startMs && Number(row.end_time ?? 0) <= endMs)
          .forEach((log: any) => {
            if (!log.end_time) return;
            entries.push({
              id: `fasting-end-${log.server_id ?? log.id}`,
              type: 'fasting_end',
              title: 'Ayuno cerrado',
              detail: log.protocol ?? null,
              timestamp: new Date(Number(log.end_time ?? startMs)).toISOString(),
            });
          });

        (weightRows ?? [])
          .filter((row: any) => {
            const ts = Number(row.logged_at ?? 0);
            return ts >= startMs && ts <= endMs;
          })
          .forEach((log: any) => {
            entries.push({
              id: `weight-${log.server_id ?? log.id}`,
              type: 'weight',
              title: `Peso ${Number(log.weight_kg ?? 0).toFixed(1)} kg`,
              detail: null,
              timestamp: new Date(Number(log.logged_at ?? startMs)).toISOString(),
            });
          });

        const mental = ((mentalRows ?? []) as any[]).find((row) => row.check_date === day) as any;
        if (mental?.id) {
          const mentalTime = new Date(`${day}T12:00:00`).toISOString();
          entries.push({
            id: `mental-${mental.server_id ?? mental.id}`,
            type: 'mental',
            title: 'Check-in mental',
            detail: `Mood ${mental.mood ?? 0}/5`,
            timestamp: mentalTime,
          });
        }

        return entries.sort(
          (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
        );
      };

      if (!isOnline) {
        return buildLocalTimeline();
      }

      try {
        const { start, end, day } = toDayRange();

        const [
          waterRes,
          mealsRes,
          workoutsRes,
          sleepRes,
          fastingStartRes,
          fastingEndRes,
          weightRes,
          mentalRes,
        ] = await Promise.all([
          supabase
            .from('water_logs')
            .select('id, amount_ml, drink_type, logged_at')
            .eq('user_id', userId)
            .gte('logged_at', start)
            .lte('logged_at', end)
            .order('logged_at', { ascending: true }),
          supabase
            .from('meals')
            .select('id, meal_type, food_name, calories, logged_at')
            .eq('user_id', userId)
            .gte('logged_at', start)
            .lte('logged_at', end)
            .order('logged_at', { ascending: true }),
          supabase
            .from('workout_sessions')
            .select('id, name, started_at, ended_at, total_sets, total_volume_kg')
            .eq('user_id', userId)
            .gte('started_at', start)
            .lte('started_at', end)
            .order('started_at', { ascending: true }),
          supabase
            .from('sleep_logs')
            .select('id, end_time, duration_min')
            .eq('user_id', userId)
            .gte('end_time', start)
            .lte('end_time', end)
            .order('end_time', { ascending: true }),
          supabase
            .from('fasting_logs')
            .select('id, protocol, start_time, end_time')
            .eq('user_id', userId)
            .gte('start_time', start)
            .lte('start_time', end),
          supabase
            .from('fasting_logs')
            .select('id, protocol, start_time, end_time')
            .eq('user_id', userId)
            .gte('end_time', start)
            .lte('end_time', end),
          supabase
            .from('weight_logs')
            .select('id, weight_kg, logged_at')
            .eq('user_id', userId)
            .gte('logged_at', start)
            .lte('logged_at', end)
            .order('logged_at', { ascending: true }),
          supabase
            .from('mental_checkins')
            .select('id, mood, energy, stress, motivation')
            .eq('user_id', userId)
            .eq('check_date', day)
            .maybeSingle(),
        ]);

        const entries: TimelineEntry[] = [];

        (waterRes.data ?? []).forEach((log) => {
          entries.push({
            id: `water-${log.id}`,
            type: 'water',
            title: `${DRINK_LABELS[log.drink_type] ?? 'Agua'} ${log.amount_ml} ml`,
            detail: log.drink_type !== 'water' ? 'Bebida registrada' : null,
            timestamp: log.logged_at,
          });
        });

        (mealsRes.data ?? []).forEach((meal) => {
          entries.push({
            id: `meal-${meal.id}`,
            type: 'meal',
            title: meal.food_name,
            detail: `${MEAL_LABELS[meal.meal_type] ?? 'Comida'} · ${Math.round(Number(meal.calories ?? 0))} kcal`,
            timestamp: meal.logged_at,
          });
        });

        (workoutsRes.data ?? []).forEach((session) => {
          entries.push({
            id: `workout-${session.id}`,
            type: 'workout',
            title: session.name || 'Entreno',
            detail: session.total_sets ? `${session.total_sets} series` : 'Sesión registrada',
            timestamp: session.started_at,
          });
        });

        (sleepRes.data ?? []).forEach((log) => {
          const hours = Number(log.duration_min ?? 0) / 60;
          entries.push({
            id: `sleep-${log.id}`,
            type: 'sleep',
            title: 'Sueño registrado',
            detail: hours > 0 ? `${hours.toFixed(1)}h` : null,
            timestamp: log.end_time,
          });
        });

        (fastingStartRes.data ?? []).forEach((log) => {
          entries.push({
            id: `fasting-start-${log.id}`,
            type: 'fasting_start',
            title: 'Ayuno iniciado',
            detail: log.protocol ?? null,
            timestamp: log.start_time,
          });
        });

        (fastingEndRes.data ?? []).forEach((log) => {
          if (!log.end_time) return;
          entries.push({
            id: `fasting-end-${log.id}`,
            type: 'fasting_end',
            title: 'Ayuno cerrado',
            detail: log.protocol ?? null,
            timestamp: log.end_time,
          });
        });

        (weightRes.data ?? []).forEach((log) => {
          entries.push({
            id: `weight-${log.id}`,
            type: 'weight',
            title: `Peso ${Number(log.weight_kg ?? 0).toFixed(1)} kg`,
            detail: null,
            timestamp: log.logged_at,
          });
        });

        if (mentalRes.data?.id) {
          const mentalTime = `${day}T12:00:00.000Z`;
          entries.push({
            id: `mental-${mentalRes.data.id}`,
            type: 'mental',
            title: 'Check-in mental',
            detail: `Mood ${mentalRes.data.mood}/5`,
            timestamp: mentalTime,
          });
        }

        return entries.sort(
          (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
        );
      } catch {
        return buildLocalTimeline();
      }
    },
    enabled: !!userId,
    staleTime: 60 * 1000,
  });

  const timeline = useMemo(() => {
    const base = query.data ?? [];
    const { day } = toDayRange();
    const localWorkoutEntries = buildLocalWorkoutEntries(day, workoutHistory);
    if (!localWorkoutEntries.length) return base;

    const seen = new Set(
      base
        .filter((entry) => entry.type === 'workout')
        .map((entry) => `${entry.title}|${new Date(entry.timestamp).getTime()}`),
    );

    const merged = [...base];
    localWorkoutEntries.forEach((entry) => {
      const key = `${entry.title}|${new Date(entry.timestamp).getTime()}`;
      if (!seen.has(key)) merged.push(entry);
    });

    return merged.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }, [query.data, workoutHistory]);

  return {
    timeline,
    loading: query.isLoading,
  };
}

export default useDailyTimeline;
