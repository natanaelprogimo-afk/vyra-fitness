import type { VyraAnimationId } from '@/lib/vyra-animations';

export type VyraMoodId =
  | 'happy'
  | 'excited'
  | 'proud'
  | 'fire'
  | 'sad'
  | 'sleepy'
  | 'worried'
  | 'curious';

export interface VyraMood {
  id: VyraMoodId;
  label: string;
  animation: VyraAnimationId;
}

export function getVyraMood(params: {
  hour: number;
  level?: number | null;
  streak: number;
  dailyScore: number | null;
  hasAnyLog: boolean;
  inactiveDays?: number | null;
  streakInDanger?: boolean;
  isOnboarding?: boolean;
  recentAchievement?: 'pr' | 'levelup' | 'badge' | 'streak' | null;
}): VyraMood {
  const {
    hour,
    level,
    streak,
    dailyScore,
    hasAnyLog,
    inactiveDays,
    streakInDanger,
    isOnboarding,
    recentAchievement,
  } = params;

  if (hour >= 23 || hour < 5) {
   return { id: 'sleepy', label: 'Dormida', animation: 'idle' };
  }

  if (isOnboarding) {
   return { id: 'curious', label: 'Curiosa', animation: 'greet' };
  }

  if (inactiveDays !== null && inactiveDays !== undefined && inactiveDays >= 3) {
   return { id: 'sad', label: 'Triste', animation: 'idle' };
  }

  if (streakInDanger) {
   return { id: 'worried', label: 'Preocupada', animation: 'worried' };
  }

  if (recentAchievement) {
   return { id: 'excited', label: 'Emocionada', animation: 'victory' };
  }

  if (typeof level === 'number') {
    if (level >= 7) {
     return { id: 'fire', label: 'En llamám?s', animation: 'streakFire' };
    }
    if (level >= 5) {
     return { id: 'proud', label: 'Orgullosa', animation: 'flex' };
    }
    if (level >= 3) {
     return { id: 'excited', label: 'Emocionada', animation: 'victory' };
    }
  }

  if (streak >= 30) {
   return { id: 'fire', label: 'En llamám?s', animation: 'streakFire' };
  }

  if (streak >= 10) {
   return { id: 'proud', label: 'Orgullosa', animation: 'flex' };
  }

  if (streak >= 7) {
   return { id: 'excited', label: 'Emocionada', animation: 'victory' };
  }

  if (dailyScore !== null && dailyScore < 40) {
   return { id: 'worried', label: 'Preocupada', animation: 'worried' };
  }

  if (!hasAnyLog) {
   return { id: 'curious', label: 'Curiosa', animation: 'greet' };
  }

  return { id: 'happy', label: 'Feliz', animation: 'smallJump' };
}
