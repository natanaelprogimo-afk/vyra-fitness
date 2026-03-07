// hooks/useFirstWeek.ts
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';
import { useCoins } from '@/hooks/useCoins';
import { useBadges } from '@/hooks/useBadges';
import type { FirstWeekTask } from '@/types/user';

// ─── DEFINICIÓN DE LAS 7 TAREAS ──────────────────────────────────────────────

export const FIRST_WEEK_TASKS: Omit<FirstWeekTask, 'completed'>[] = [
  {
    day:         1,
    module:      'checkin',
    title:       'Tu primer check-in completo',
    description: 'Registrá tu peso, agua de hoy y cómo te sentís. Mirá tu primer Daily Score.',
    action:      '/(tabs)',
    coinReward:  50,
    xpReward:    50,
  },
  {
    day:         2,
    module:      'nutrition',
    title:       'Registrá tus 3 comidas',
    description: 'Loggea el desayuno, almuerzo y cena. Usá el barcode scanner en al menos una.',
    action:      '/modules/nutrition',
    coinReward:  35,
    xpReward:    30,
  },
  {
    day:         3,
    module:      'steps',
    title:       'Llegá a 5.000 pasos',
    description: 'Activá el pedómetro y mirá el contador subir en vivo. ¡Cada paso cuenta!',
    action:      '/modules/steps',
    coinReward:  35,
    xpReward:    30,
  },
  {
    day:         4,
    module:      'fasting',
    title:       'Tu primer ayuno',
    description: 'Iniciá el protocolo 16:8. Mirá cómo las fases cambian de color a medida que avanza.',
    action:      '/modules/fasting',
    coinReward:  35,
    xpReward:    30,
  },
  {
    day:         5,
    module:      'workout',
    title:       'Tu primer entrenamiento',
    description: 'Completá 3 ejercicios. Al terminar vas a ver la pantalla de celebración con confetti.',
    action:      '/modules/workout',
    coinReward:  50,
    xpReward:    50,
  },
  {
    day:         6,
    module:      'coach',
    title:       'Hablá con el Coach IA',
    description: 'Preguntale a Vyra cómo vas esta semana. Va a responder con TUS datos reales.',
    action:      '/(tabs)/coach',
    coinReward:  35,
    xpReward:    25,
  },
  {
    day:         7,
    module:      'progress',
    title:       'Revisá tu progreso semanal',
    description: '7 días de pequeñas acciones producen datos visibles. ¡Tenés una historia ahora!',
    action:      '/(tabs)/progress',
    coinReward:  200,
    xpReward:    200,
  },
];

// ─── TIPOS ───────────────────────────────────────────────────────────────────

interface UseFirstWeekReturn {
  tasks:                FirstWeekTask[];
  currentDayIndex:      number;        // 0-based — día actual del usuario (0 = día 1)
  todayTask:            FirstWeekTask | null;
  isCompleted:          boolean;       // true cuando los 7 días están hechos
  isActive:             boolean;       // true durante los primeros 7 días desde el registro
  daysElapsed:          number;        // días desde registro (0 = mismo día)
  completedCount:       number;
  completeTask:         (day: number) => Promise<void>;
  isLoading:            boolean;
}

function parseCompletedDaysFromCoachMemory(memory: unknown): boolean[] {
  if (!memory || typeof memory !== 'object') return Array(7).fill(false);
  const raw = (memory as any).first_week_completed_days;
  if (!Array.isArray(raw)) return Array(7).fill(false);
  const normalized = raw.map((item) => Boolean(item)).slice(0, 7);
  while (normalized.length < 7) normalized.push(false);
  return normalized;
}

// ─── HOOK ─────────────────────────────────────────────────────────────────────

export function useFirstWeek(): UseFirstWeekReturn {
  const { profile, updateProfile } = useAuthStore();
  const { addCoins }  = useCoins();
  const { tryUnlock } = useBadges();

  const [completedDays, setCompletedDays] = useState<boolean[]>(
    Array(7).fill(false)
  );
  const [isLoading, setIsLoading] = useState(true);

  // ── Calcular días desde registro ────────────────────────────────────────────
  const daysElapsed = profile?.created_at
    ? Math.floor(
        (Date.now() - new Date(profile.created_at).getTime()) /
          (1000 * 60 * 60 * 24)
      )
    : 0;

  const isActive    = daysElapsed < 7;
  const currentDayIndex = Math.min(daysElapsed, 6); // 0-based

  // ── Cargar progreso desde Supabase ──────────────────────────────────────────
  useEffect(() => {
    if (!profile?.id) return;

    async function load() {
      setIsLoading(true);
      try {
        const { data } = await supabase
          .from('profiles')
          .select('first_week_completed, coach_memory_json')
          .eq('id', profile!.id)
          .single();

        if (data?.first_week_completed) {
          setCompletedDays(Array(7).fill(true));
        } else {
          setCompletedDays(parseCompletedDaysFromCoachMemory(data?.coach_memory_json));
        }
      } catch {
        // silencioso — usa el estado default
      } finally {
        setIsLoading(false);
      }
    }

    load();
  }, [profile?.id]);

  // ── Completar una tarea ─────────────────────────────────────────────────────
  const completeTask = useCallback(
    async (day: number) => {
      // day es 1-based
      const index = day - 1;
      if (!profile?.id || completedDays[index]) return;

      const task = FIRST_WEEK_TASKS[index];
      if (!task) return;

      const newCompleted = [...completedDays];
      newCompleted[index] = true;

      // Optimistic update
      setCompletedDays(newCompleted);

      try {
        const { data: profileSnapshot } = await supabase
          .from('profiles')
          .select('coach_memory_json')
          .eq('id', profile.id)
          .single();

        const memory =
          profileSnapshot?.coach_memory_json && typeof profileSnapshot.coach_memory_json === 'object'
            ? (profileSnapshot.coach_memory_json as Record<string, unknown>)
            : {};

        const allCompleted = newCompleted.every(Boolean);

        // Guardar en Supabase
        await supabase
          .from('profiles')
          .update({
            coach_memory_json: {
              ...memory,
              first_week_completed_days: newCompleted,
            },
            first_week_completed: allCompleted,
          })
          .eq('id', profile.id);

        updateProfile({
          coach_memory_json: {
            ...memory,
            first_week_completed_days: newCompleted,
          },
          first_week_completed: allCompleted,
        } as any);

        // Dar recompensas
        await addCoins(task.coinReward, 'earn_onboarding', `Día ${day} primera semana`);

        // Día 1 → badge Bienvenido
        if (day === 1) await tryUnlock('welcome');

        // Día 2 → badge Primer plato
        if (day === 2) await tryUnlock('first_meal');

        // Día 3 → badge Primeros pasos
        if (day === 3) await tryUnlock('first_steps');

        // Día 4 → badge Primer ayuno
        if (day === 4) await tryUnlock('first_fast');

        // Día 5 → badge Primer entrenamiento
        if (day === 5) await tryUnlock('first_workout');

        // Día 7 → badge Primera semana completa + 200 coins bonus extra
        if (day === 7) {
          await tryUnlock('first_week');
          // El coinReward del día 7 ya incluye los 200 bonus en FIRST_WEEK_TASKS
        }
      } catch {
        // Revertir optimistic update si falla
        setCompletedDays(prev => {
          const reverted = [...prev];
          reverted[index] = false;
          return reverted;
        });
      }
    },
    [profile?.id, completedDays, addCoins, tryUnlock]
  );

  // ── Construir tasks con estado completed ────────────────────────────────────
  const tasks: FirstWeekTask[] = FIRST_WEEK_TASKS.map((t, i) => ({
    ...t,
    completed: completedDays[i] ?? false,
  }));

  const completedCount = completedDays.filter(Boolean).length;
  const isCompleted    = completedCount === 7;
  const todayTask      = isActive ? (tasks[currentDayIndex] ?? null) : null;

  return {
    tasks,
    currentDayIndex,
    todayTask,
    isCompleted,
    isActive,
    daysElapsed,
    completedCount,
    completeTask,
    isLoading,
  };
}
