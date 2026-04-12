// ============================================================
// VYRA FITNESS — LevelUpWatcher
// Escucha cambios de nivel y dispara celebracion global
// ============================================================

import { useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';
import { useUIStore } from '@/stores/uiStore';
import { useCoins } from '@/hooks/useCoins';
import { useBadges } from '@/hooks/useBadges';

type LevelReward = {
  coins: number;
  badgeId?: string;
  cosmetic?: 'gold' | 'legendary';
};

const LEVEL_REWARDS: Record<number, LevelReward> = {
  2: { coins: 50 },
  3: { coins: 100 },
  5: { coins: 200, badgeId: 'level_5_dedicado' },
  7: { coins: 300, badgeId: 'level_7_atleta' },
  10: { coins: 500, cosmetic: 'gold' },
  15: { coins: 1000, cosmetic: 'legendary' },
};

function getRewardedLevels(memory: Record<string, unknown> | null | undefined): number[] {
  const current = memory && typeof memory === 'object' ? memory : {};
  const gamification =
    current.gamification && typeof current.gamification === 'object'
      ? (current.gamification as Record<string, unknown>)
      : null;
  const raw = gamification?.level_rewards;
  return Array.isArray(raw) ? raw.filter((value): value is number => typeof value === 'number') : [];
}

function withRewardedLevel(
  memory: Record<string, unknown> | null | undefined,
  level: number,
): Record<string, unknown> {
  const current = memory && typeof memory === 'object' ? { ...memory } : {};
  const gamification =
    current.gamification && typeof current.gamification === 'object'
      ? { ...(current.gamification as Record<string, unknown>) }
      : {};
  const currentRewards = Array.isArray(gamification.level_rewards)
    ? ([...(gamification.level_rewards as unknown[])].filter((value): value is number => typeof value === 'number'))
    : [];

  if (!currentRewards.includes(level)) {
    currentRewards.push(level);
  }

  gamification.level_rewards = currentRewards;
  return { ...current, gamification };
}

export default function LevelUpWatcher() {
  const profile = useAuthStore((state) => state.profile);
  const updateProfile = useAuthStore((state) => state.updateProfile);
  const showAchievement = useUIStore((state) => state.showAchievement);
  const { addCoins } = useCoins();
  const { tryUnlock } = useBadges();
  const lastLevel = useRef<number | null>(null);

  useEffect(() => {
    if (!profile || typeof profile.level !== 'number') {
      lastLevel.current = null;
      return;
    }

    if (lastLevel.current === null) {
      lastLevel.current = profile.level;
      return;
    }

    if (profile.level <= lastLevel.current) {
      lastLevel.current = profile.level;
      return;
    }

    const fromLevel = lastLevel.current + 1;
    const toLevel = profile.level;
    lastLevel.current = profile.level;

    void (async () => {
      try {
        const rewarded = getRewardedLevels(profile.coach_memory_json as Record<string, unknown> | null | undefined);
        const newlyRewarded: number[] = [];
        const badgeQueue: string[] = [];
        const cosmetics: string[] = [];
        let coinsAwarded = 0;

        for (let level = fromLevel; level <= toLevel; level += 1) {
          const reward = LEVEL_REWARDS[level];
          if (!reward || rewarded.includes(level)) continue;
          newlyRewarded.push(level);
          if (reward.coins > 0) {
            await addCoins(reward.coins, 'level_up', `Recompensa nivel ${level}`);
            coinsAwarded += reward.coins;
          }
          if (reward.badgeId) {
            badgeQueue.push(reward.badgeId);
          }
          if (reward.cosmetic) {
            cosmetics.push(reward.cosmetic);
          }
        }

        const cosmeticNote = cosmetics.includes('legendary')
          ? 'Desbloqueaste la skin VYRA Legendaria.'
          : cosmetics.includes('gold')
            ? 'Desbloqueaste la skin VYRA Dorada.'
            : null;

        showAchievement({
          type: 'levelup',
          title: `Nivel ${toLevel}`,
          subtitle: cosmeticNote ?? 'Subiste de nivel. Tu progreso ya se nota.',
          coins: coinsAwarded,
          xp: 0,
        });

        for (const badgeId of badgeQueue) {
          await tryUnlock(badgeId);
        }

        if (newlyRewarded.length > 0) {
          let nextMemory = profile.coach_memory_json as Record<string, unknown> | null | undefined;
          for (const level of newlyRewarded) {
            nextMemory = withRewardedLevel(nextMemory, level);
          }

          const { error } = await supabase
            .from('profiles')
            .update({ coach_memory_json: nextMemory, updated_at: new Date().toISOString() })
            .eq('id', profile.id);

          if (!error) {
            updateProfile({ coach_memory_json: nextMemory });
          }
        }
      } catch (error) {
        console.error('[LevelUpWatcher] Failed to grant level rewards', error);
      }
    })();
  }, [
    addCoins,
    profile,
    showAchievement,
    tryUnlock,
    updateProfile,
  ]);

  return null;
}
