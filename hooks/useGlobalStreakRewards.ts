import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';
import { useModuleRewards } from '@/hooks/useModuleRewards';

const STREAK_MILESTONES = [3, 7, 30, 90, 100, 365] as const;

type Milestone = (typeof STREAK_MILESTONES)[number];

const STREAK_REWARD_KEYS: Record<Milestone, string> = {
  3: 'streak_3',
  7: 'streak_7',
  30: 'streak_30',
  90: 'streak_90',
  100: 'streak_100',
  365: 'streak_365',
};

function getRewardedStreaks(memory: Record<string, unknown> | null | undefined): number[] {
  const current = memory && typeof memory === 'object' ? memory : {};
  const gamification =
    current.gamification && typeof current.gamification === 'object'
      ? (current.gamification as Record<string, unknown>)
      : null;
  const raw = gamification?.streak_rewards;
  return Array.isArray(raw) ? raw.filter((value): value is number => typeof value === 'number') : [];
}

function withRewardedStreaks(
  memory: Record<string, unknown> | null | undefined,
  rewarded: number[],
): Record<string, unknown> {
  const current = memory && typeof memory === 'object' ? { ...memory } : {};
  const gamification =
    current.gamification && typeof current.gamification === 'object'
      ? { ...(current.gamification as Record<string, unknown>) }
      : {};
  gamification.streak_rewards = rewarded;
  return { ...current, gamification };
}

export function useGlobalStreakRewards() {
  const profile = useAuthStore((state) => state.profile);
  const updateProfile = useAuthStore((state) => state.updateProfile);
  const { reward } = useModuleRewards();

  useEffect(() => {
    if (!profile?.id) return;
    const streak = Number(profile.streak ?? profile.current_streak ?? 0);
    if (!Number.isFinite(streak) || streak <= 0) return;

    const rewarded = getRewardedStreaks(profile.coach_memory_json as Record<string, unknown> | null | undefined);
    const eligible = STREAK_MILESTONES.filter((milestone) => streak >= milestone && !rewarded.includes(milestone));
    if (eligible.length === 0) return;

    void (async () => {
      try {
        for (const milestone of eligible) {
          const rewardKey = STREAK_REWARD_KEYS[milestone];
          await reward(rewardKey);
        }

        const nextRewarded = [...rewarded, ...eligible].sort((a, b) => a - b);
        const nextMemory = withRewardedStreaks(
          profile.coach_memory_json as Record<string, unknown> | null | undefined,
          nextRewarded,
        );

        const { error } = await supabase
          .from('profiles')
          .update({ coach_memory_json: nextMemory, updated_at: new Date().toISOString() })
          .eq('id', profile.id);

        if (!error) {
          updateProfile({ coach_memory_json: nextMemory });
        }
      } catch (err) {
        console.error('[useGlobalStreakRewards] Failed to grant streak rewards', err);
      }
    })();
  }, [profile, reward, updateProfile]);
}

export default useGlobalStreakRewards;
