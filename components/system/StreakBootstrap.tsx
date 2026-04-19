import { useEffect, useRef } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useUIStore } from '@/stores/uiStore';

const BACKEND_URL = process.env.EXPO_PUBLIC_API_URL ?? process.env.EXPO_PUBLIC_BACKEND_URL ?? '';
const SYNC_INTERVAL_MS = 30 * 60 * 1000;

export default function StreakBootstrap() {
  const session = useAuthStore((state) => state.session);
  const profile = useAuthStore((state) => state.profile);
  const updateProfile = useAuthStore((state) => state.updateProfile);
  const isOnline = useUIStore((state) => state.isOnline);
  const inflightRef = useRef(false);

  useEffect(() => {
    if (!BACKEND_URL || !session?.access_token || !profile?.id || !isOnline) return;

    let active = true;

    const sync = async () => {
      if (!active || inflightRef.current) return;
      inflightRef.current = true;

      try {
        const response = await fetch(`${BACKEND_URL}/api/sync/streak`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        });

        if (!response.ok) return;
        const payload = (await response.json()) as {
          streak?: number;
          best_streak?: number;
          streak_freeze_count?: number;
          streak_freeze_last_used_at?: string | null;
        };

        if (!active) return;

        updateProfile({
          streak: Number(payload.streak ?? profile.streak ?? 0),
          current_streak: Number(payload.streak ?? profile.current_streak ?? profile.streak ?? 0),
          best_streak: Number(payload.best_streak ?? profile.best_streak ?? 0),
          longest_streak: Number(payload.best_streak ?? profile.longest_streak ?? profile.best_streak ?? 0),
          streak_freeze_count: Number(payload.streak_freeze_count ?? profile.streak_freeze_count ?? 0),
          streak_freeze_last_used_at:
            typeof payload.streak_freeze_last_used_at === 'string'
              ? payload.streak_freeze_last_used_at
              : profile.streak_freeze_last_used_at ?? null,
        });
      } catch {
        // Keep streak sync silent. Home/Progress already have local fallbacks.
      } finally {
        inflightRef.current = false;
      }
    };

    void sync();
    const interval = setInterval(() => {
      void sync();
    }, SYNC_INTERVAL_MS);

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [
    isOnline,
    profile?.best_streak,
    profile?.current_streak,
    profile?.id,
    profile?.longest_streak,
    profile?.streak,
    profile?.streak_freeze_count,
    profile?.streak_freeze_last_used_at,
    session?.access_token,
    updateProfile,
  ]);

  return null;
}
