// hooks/useModuleRewards.ts
// Helper centralizado para dar coins, XP y desbloquear badges desde cualquier módulo.
// Elimina el boilerplate de llamar addCoins + tryUnlock en cada hook de módulo.
//
// USO en cada módulo:
//   const { reward } = useModuleRewards();
//   await reward('water_goal');           // después de cumplir meta de agua
//   await reward('pr_achieved', { exerciseId: 'squat' });

import { useCallback } from 'react';
import { useCoins }  from '@/hooks/useCoins';
import { useBadges } from '@/hooks/useBadges';
import { useAuthStore } from '@/stores/authStore';
import { supabase } from '@/lib/supabase';

// ─── MAPA DE RECOMPENSAS ──────────────────────────────────────────────────────
// Cada key es un evento recompensable.
// coins: monedas a dar (respeta el cap de 200/día via RPC)
// xp:    XP a dar (1000 XP = 1 nivel)
// badge: id del badge a intentar desbloquear (puede ser null)

const REWARD_MAP: Record<
  string,
  { coins: number; xp: number; badge: string | null; coinType: string; description: string }
> = {
  // ── AGUA ────────────────────────────────────────────────────────────────────
  water_log: {
    coins: 5, xp: 0, badge: null,
    coinType: 'earn_water', description: 'Log de agua',
  },
  water_goal: {
    coins: 10, xp: 0, badge: 'hydrated_day',
    coinType: 'earn_water', description: 'Meta de agua cumplida',
  },

  // ── PASOS ────────────────────────────────────────────────────────────────────
  steps_goal: {
    coins: 15, xp: 20, badge: null,
    coinType: 'earn_steps', description: 'Meta de pasos cumplida',
  },
  steps_5000_first: {
    coins: 0, xp: 0, badge: 'first_steps',
    coinType: 'earn_steps', description: 'Primera vez 5.000 pasos',
  },
  steps_10000: {
    coins: 0, xp: 0, badge: 'steps_champion',
    coinType: 'earn_steps', description: '10.000 pasos alcanzados',
  },

  // ── AYUNO ────────────────────────────────────────────────────────────────────
  fast_completed: {
    coins: 20, xp: 30, badge: 'first_fast',
    coinType: 'earn_fasting', description: 'Ayuno completado',
  },
  fast_autophagy: {
    coins: 0, xp: 0, badge: 'autophagy_unlocked',
    coinType: 'earn_fasting', description: 'Fase autofagia alcanzada',
  },
  fast_24h: {
    coins: 0, xp: 0, badge: 'fasting_master',
    coinType: 'earn_fasting', description: 'Ayuno 24h completado',
  },

  // ── SUEÑO ────────────────────────────────────────────────────────────────────
  sleep_good: {
    coins: 15, xp: 0, badge: null,
    coinType: 'earn_sleep', description: 'Sueño 7h+ calidad ≥70%',
  },

  // ── NUTRICIÓN ────────────────────────────────────────────────────────────────
  nutrition_all_meals: {
    coins: 10, xp: 0, badge: 'first_meal',
    coinType: 'earn_nutrition', description: '3 comidas registradas',
  },
  nutrition_macros_ok: {
    coins: 15, xp: 0, badge: null,
    coinType: 'earn_nutrition', description: 'Macros dentro del objetivo',
  },

  // ── PESO ─────────────────────────────────────────────────────────────────────
  weight_new_minimum: {
    coins: 0, xp: 0, badge: 'new_minimum',
    coinType: 'earn_steps', description: 'Nuevo mínimo histórico de peso',
  },
  weight_goal_reached: {
    coins: 0, xp: 0, badge: 'weight_goal',
    coinType: 'earn_steps', description: 'Peso objetivo alcanzado',
  },

  // ── ENTRENOS ─────────────────────────────────────────────────────────────────
  workout_completed: {
    coins: 25, xp: 50, badge: 'first_workout',
    coinType: 'earn_workout', description: 'Entreno completado',
  },
  pr_achieved: {
    coins: 50, xp: 100, badge: 'pr_x5',
    coinType: 'earn_workout', description: 'Récord personal logrado',
  },
  workouts_20: {
    coins: 0, xp: 0, badge: 'gym_monster',
    coinType: 'earn_workout', description: '20 entrenos completados',
  },

  // ── MENTAL ──────────────────────────────────────────────────────────────────
  mental_checkin: {
    coins: 5, xp: 0, badge: 'mental_shape',
    coinType: 'earn_mental', description: 'Check-in mental completado',
  },

  // ── DAILY SCORE ─────────────────────────────────────────────────────────────
  daily_score_80: {
    coins: 20, xp: 25, badge: null,
    coinType: 'earn_daily_score', description: 'Daily Score ≥80',
  },
  daily_score_90: {
    coins: 35, xp: 25, badge: 'perfect_score',
    coinType: 'earn_daily_score', description: 'Daily Score ≥90',
  },

  // ── RACHAS ──────────────────────────────────────────────────────────────────
  streak_3: {
    coins: 30, xp: 0, badge: null,
    coinType: 'earn_streak_milestone', description: 'Racha 3 días',
  },
  streak_7: {
    coins: 100, xp: 0, badge: 'fire_streak_7',
    coinType: 'earn_streak_milestone', description: 'Racha 7 días',
  },
  streak_30: {
    coins: 500, xp: 0, badge: 'fire_streak_30',
    coinType: 'earn_streak_milestone', description: 'Racha 30 días',
  },
  streak_100: {
    coins: 2000, xp: 0, badge: 'centenarian',
    coinType: 'earn_streak_milestone', description: 'Racha 100 días legendaria',
  },
};

// ─── HOOK ─────────────────────────────────────────────────────────────────────

interface RewardOptions {
  exerciseId?: string; // para pr_achieved — contexto adicional
  skipBadge?:  boolean;
}

export function useModuleRewards() {
  const { addCoins }  = useCoins();
  const { tryUnlock } = useBadges();
  const { profile }   = useAuthStore();

  const reward = useCallback(
    async (eventKey: string, _options: RewardOptions = {}) => {
      const config = REWARD_MAP[eventKey];
      if (!config) {
        console.warn(`[useModuleRewards] Unknown event key: ${eventKey}`);
        return;
      }

      try {
        // Dar coins si corresponde
        if (config.coins > 0) {
          await addCoins(config.coins, config.coinType as any, config.description);
        }

        // Dar XP si corresponde
        if (config.xp > 0 && profile?.id) {
          await supabase.rpc('increment_xp', {
            p_user_id: profile.id,
            p_xp:      config.xp,
          });
        }

        // Desbloquear badge si corresponde
        if (config.badge) {
          await tryUnlock(config.badge);
        }
      } catch (err) {
        // Silencioso — las recompensas no deben bloquear el flujo principal
        console.warn('[useModuleRewards] Error dando recompensa:', err);
      }
    },
    [addCoins, tryUnlock, profile?.id]
  );

  return { reward, rewardMap: REWARD_MAP };
}