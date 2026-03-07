import { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { supabase } from '@/lib/supabase';
import { captureError } from '@/lib/sentry';
import { useCoins } from './useCoins';

export type BadgeRarity = 'common' | 'rare' | 'epic' | 'legendary';

export interface BadgeDef {
  id:          string;
  name:        string;
  description: string;
  emoji:       string;
  rarity:      BadgeRarity;
  coins:       number;
  xp:          number;
}

export interface UnlockedBadge {
  badge_id:    string;
  unlocked_at: string;
  coins_earned: number;
}

// Definición de los 20 badges del MVP
export const BADGES: BadgeDef[] = [
  { id: 'welcome',       name: 'Bienvenido a Vyra',      emoji: '👋', description: 'Completaste tu primer check-in',               rarity: 'common',    coins: 25,  xp: 25  },
  { id: 'first_meal',    name: 'Primer plato',            emoji: '🍽️', description: 'Registraste las 3 comidas del día 2',          rarity: 'common',    coins: 25,  xp: 25  },
  { id: 'first_steps',   name: 'Primeros pasos',          emoji: '👟', description: 'Alcanzaste 5.000 pasos por primera vez',       rarity: 'common',    coins: 25,  xp: 25  },
  { id: 'first_fast',    name: 'Primer ayuno',            emoji: '⏳', description: 'Completaste tu primer ayuno',                  rarity: 'common',    coins: 25,  xp: 25  },
  { id: 'first_workout', name: 'Primer entreno',          emoji: '🏋️', description: 'Completaste tu primer entreno con 3+ sets',   rarity: 'common',    coins: 25,  xp: 25  },
  { id: 'first_week',    name: 'Primera semana',          emoji: '🗓️', description: '7 días completados en la semana guiada',      rarity: 'rare',      coins: 75,  xp: 75  },
  { id: 'streak_7',      name: 'Racha de fuego 7',        emoji: '🔥', description: 'Racha de 7 días consecutivos',                 rarity: 'rare',      coins: 75,  xp: 75  },
  { id: 'streak_30',     name: 'Racha de fuego 30',       emoji: '🔥', description: 'Racha de 30 días consecutivos',                rarity: 'epic',      coins: 150, xp: 150 },
  { id: 'streak_100',    name: 'Centenario',              emoji: '💯', description: 'Racha de 100 días consecutivos',               rarity: 'legendary', coins: 400, xp: 400 },
  { id: 'hydrated',      name: 'Hidratado',               emoji: '💧', description: 'Meta de agua cumplida 7 días seguidos',        rarity: 'rare',      coins: 75,  xp: 75  },
  { id: 'steps_champ',   name: 'Campeón de steps',        emoji: '🚶', description: '10.000 pasos en 7 ocasiones distintas',        rarity: 'rare',      coins: 75,  xp: 75  },
  { id: 'gym_monster',   name: 'Monstruo del gym',        emoji: '💪', description: '20 entrenos completados en la app',            rarity: 'epic',      coins: 150, xp: 150 },
  { id: 'pr_x5',         name: 'Récord personal x5',      emoji: '🏆', description: '5 PRs distintos en ejercicios diferentes',    rarity: 'epic',      coins: 150, xp: 150 },
  { id: 'master_fast',   name: 'Maestro del ayuno',       emoji: '⏳', description: 'Completaste un ayuno de 24 horas',             rarity: 'epic',      coins: 150, xp: 150 },
  { id: 'autophagy',     name: 'Autofagia desbloqueada',  emoji: '🌿', description: 'Llegaste a la fase Autofagia por primera vez', rarity: 'epic',      coins: 150, xp: 150 },
  { id: 'mind_fit',      name: 'Mente en forma',          emoji: '🧠', description: '14 check-ins mentales consecutivos',           rarity: 'rare',      coins: 75,  xp: 75  },
  { id: 'goal_weight',   name: 'Peso objetivo',           emoji: '⚖️', description: 'Llegaste a tu peso objetivo',                  rarity: 'legendary', coins: 400, xp: 400 },
  { id: 'new_min',       name: 'Mínimo histórico',        emoji: '📉', description: 'Registraste tu peso más bajo en la app',       rarity: 'rare',      coins: 75,  xp: 75  },
  { id: 'perfect_score', name: 'Score perfecto',          emoji: '⭐', description: 'Daily Score ≥95 por primera vez',              rarity: 'epic',      coins: 150, xp: 150 },
  { id: 'legend',        name: 'Leyenda Vyra',            emoji: '👑', description: 'Desbloqueaste todos los badges',               rarity: 'legendary', coins: 400, xp: 400 },
];

const RARITY_COLORS: Record<BadgeRarity, string> = {
  common:    '#9CA3AF',
  rare:      '#60A5FA',
  epic:      '#A78BFA',
  legendary: '#F59E0B',
};

export function useBadges() {
  const { profile } = useAuthStore();
  const userId = profile?.id;
  const { addCoins } = useCoins();

  const [unlockedBadges, setUnlockedBadges] = useState<UnlockedBadge[]>([]);
  const [loading,        setLoading]        = useState(true);
  const [newlyUnlocked,  setNewlyUnlocked]  = useState<BadgeDef | null>(null);

  const fetchBadges = useCallback(async () => {
    if (!userId) return;
    try {
      const { data, error } = await supabase
        .from('achievements')
        .select('badge_id, unlocked_at, coins_earned')
        .eq('user_id', userId)
        .order('unlocked_at', { ascending: false });

      if (error) throw error;
      setUnlockedBadges(data ?? []);
    } catch (err) {
      captureError(err instanceof Error ? err : new Error(String(err)), { action: "useBadges.fetch" });
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // Intentar desbloquear un badge (idempotente — la tabla tiene UNIQUE constraint)
  const tryUnlock = useCallback(
    async (badgeId: string): Promise<boolean> => {
      if (!userId) return false;

      // Verificar que no esté ya desbloqueado localmente
      if (unlockedBadges.some((b) => b.badge_id === badgeId)) return false;

      const badge = BADGES.find((b) => b.id === badgeId);
      if (!badge) return false;

      try {
        const { error } = await supabase.from('achievements').insert({
          user_id:     userId,
          badge_id:    badgeId,
          unlocked_at: new Date().toISOString(),
          coins_earned: badge.coins,
        });

        if (error) {
          // Código 23505 = unique violation = ya estaba desbloqueado
          if (error.code === '23505') return false;
          throw error;
        }

        // Recompensar
        await addCoins(badge.coins, 'badge_unlock', `Badge: ${badge.name}`);
        await supabase.rpc('increment_xp', {
          p_user_id: userId,
          p_xp_amount:      badge.xp,
        });

        setNewlyUnlocked(badge);
        await fetchBadges();
        return true;
      } catch (err) {
        captureError(err instanceof Error ? err : new Error(String(err)), { action: "useBadges.tryUnlock" });
        return false;
      }
    },
    [userId, unlockedBadges, addCoins, fetchBadges],
  );

  const clearNewlyUnlocked = useCallback(() => setNewlyUnlocked(null), []);

  const isUnlocked = useCallback(
    (badgeId: string) => unlockedBadges.some((b) => b.badge_id === badgeId),
    [unlockedBadges],
  );

  const getProgress = () => ({
    unlocked: unlockedBadges.length,
    total:    BADGES.length,
    pct:      Math.round((unlockedBadges.length / BADGES.length) * 100),
  });

  function rarityColor(rarity: BadgeRarity) {
    return RARITY_COLORS[rarity];
  }

  useEffect(() => {
    fetchBadges();
  }, [fetchBadges]);

  return {
    unlockedBadges,
    allBadges: BADGES,
    loading,
    newlyUnlocked,
    clearNewlyUnlocked,
    tryUnlock,
    isUnlocked,
    getProgress,
    rarityColor,
    refresh: fetchBadges,
  };
}


