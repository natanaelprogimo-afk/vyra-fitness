import { useCallback, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { captureError } from '@/lib/sentry';
import { useAuthStore } from '@/stores/authStore';
import { useUIStore } from '@/stores/uiStore';
import { useCoins } from './useCoins';
import { useDashboard } from './useDashboard';
import { useSteps } from './useSteps';
import { useWater } from './useWater';
import { useSleep } from './useSleep';
import { useWorkout } from './useWorkout';
import { todayISO } from '@/utils/dates';
import { getLevelProgress } from '@/utils/calculations';
import {
  Colors,
} from '@/constants/colors';
import {
  COIN_SOURCES,
  DAILY_MISSION_LIBRARY,
  EVENT_LIBRARY,
  VYRA_RANKS,
  WEEKLY_MISSION_LIBRARY,
  getDailyCoinCap,
  getNextRank,
  getRankByXp,
  getRankCoinBonusPct,
  getUpcomingRanks,
  type MissionDef,
  type RankDef,
} from '@/lib/gamification-system';

type GamificationModule = 'water' | 'steps' | 'sleep' | 'score' | 'streak' | 'special';

export interface RankTier extends RankDef {}

export interface DailyChallenge extends MissionDef {
  module: GamificationModule;
  progress: number;
  completed: boolean;
  claimed: boolean;
  dateKey: string;
}

export interface WeeklyChallenge extends MissionDef {
  module: GamificationModule;
  progress: number;
  completed: boolean;
  claimed: boolean;
}

export interface MonthlyChallenge extends MissionDef {
  module: GamificationModule;
  progress: number;
  completed: boolean;
  claimed: boolean;
  monthKey: string;
}

function getWeekStart(date = new Date()): string {
  const copy = new Date(date);
  const day = copy.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  copy.setDate(copy.getDate() + diff);
  copy.setHours(0, 0, 0, 0);
  return copy.toISOString().split('T')[0] ?? '';
}

function getMonthKey(date = new Date()): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

function getActiveModules(memory: Record<string, unknown> | null | undefined) {
  const modules = Array.isArray(memory?.active_modules)
    ? (memory?.active_modules as unknown[]).filter((item): item is string => typeof item === 'string')
    : [];
  return modules.length > 0 ? modules : ['water', 'steps', 'sleep'];
}

function getClaimIds(
  memory: Record<string, unknown> | null | undefined,
  bucket: 'daily_claims' | 'weekly_claims' | 'monthly_claims',
  key: string,
) {
  const gamification =
    memory?.gamification && typeof memory.gamification === 'object'
      ? (memory.gamification as Record<string, unknown>)
      : null;
  const store =
    gamification?.[bucket] && typeof gamification[bucket] === 'object'
      ? (gamification[bucket] as Record<string, unknown>)
      : null;
  const raw = store?.[key];
  return Array.isArray(raw) ? raw.filter((item): item is string => typeof item === 'string') : [];
}

function withClaimId(
  memory: Record<string, unknown> | null | undefined,
  bucket: 'daily_claims' | 'weekly_claims' | 'monthly_claims',
  key: string,
  claimId: string,
) {
  const currentMemory = memory && typeof memory === 'object' ? { ...memory } : {};
  const gamification =
    currentMemory.gamification && typeof currentMemory.gamification === 'object'
      ? { ...(currentMemory.gamification as Record<string, unknown>) }
      : {};
  const store =
    gamification[bucket] && typeof gamification[bucket] === 'object'
      ? { ...(gamification[bucket] as Record<string, unknown>) }
      : {};
  const ids = Array.isArray(store[key])
    ? [...(store[key] as unknown[])].filter((item): item is string => typeof item === 'string')
    : [];

  if (!ids.includes(claimId)) ids.push(claimId);
  store[key] = ids;
  gamification[bucket] = store;
  return { ...currentMemory, gamification };
}

function extractScore(rawScore: unknown) {
  if (typeof rawScore === 'number') return Math.round(rawScore);
  if (rawScore && typeof rawScore === 'object') {
    const score = rawScore as Record<string, unknown>;
    if (typeof score.score === 'number') return Math.round(score.score);
    if (typeof score.total_score === 'number') return Math.round(score.total_score);
  }
  return 0;
}

function getMissionModule(id: string): GamificationModule {
  if (id.includes('water')) return 'water';
  if (id.includes('steps')) return 'steps';
  if (id.includes('sleep')) return 'sleep';
  if (id.includes('score')) return 'score';
  if (id.includes('streak')) return 'streak';
  return 'special';
}

function getWaterTotal(row: unknown) {
  if (!row || typeof row !== 'object') return 0;
  const data = row as Record<string, unknown>;
  if (typeof data.total === 'number') return data.total;
  if (typeof data.amount === 'number') return data.amount;
  return 0;
}

function getBestWorkoutStreak(history: Array<{ started_at: string }>) {
  const uniqueDays = [...new Set(history.map((entry) => entry.started_at.split('T')[0] ?? ''))]
    .filter(Boolean)
    .sort((a, b) => new Date(a).getTime() - new Date(b).getTime());

  if (!uniqueDays.length) return 0;

  let best = 1;
  let current = 1;
  for (let index = 1; index < uniqueDays.length; index += 1) {
    const previous = new Date(`${uniqueDays[index - 1]}T00:00:00`);
    const next = new Date(`${uniqueDays[index]}T00:00:00`);
    const diff = Math.round((next.getTime() - previous.getTime()) / 86400000);
    if (diff === 1) {
      current += 1;
      best = Math.max(best, current);
    } else {
      current = 1;
    }
  }
  return best;
}

async function applyXpReward(userId: string, xpAmount: number) {
  if (xpAmount <= 0) return {};
  const { data, error } = await supabase.rpc('increment_xp', {
    p_user_id: userId,
    p_xp_amount: xpAmount,
  });
  if (error) throw error;
  const payload = Array.isArray(data) ? data[0] : data;
  if (payload && typeof payload === 'object') {
    const row = payload as Record<string, unknown>;
    return {
      xp: typeof row.new_xp === 'number' ? row.new_xp : undefined,
      level: typeof row.new_level === 'number' ? row.new_level : undefined,
    };
  }
  return {};
}

export function useGamification() {
  const profile = useAuthStore((state) => state.profile);
  const updateProfile = useAuthStore((state) => state.updateProfile);
  const showToast = useUIStore((state) => state.showToast);
  const showAchievement = useUIStore((state) => state.showAchievement);
  const { addCoins, balance, transactions } = useCoins();
  const { dailyScore, todayData, weekScores, recentScores } = useDashboard();
  const { weeklyData: stepWeeklyData = [] } = useSteps();
  const { weeklyData: waterWeeklyData = [], hydrationStreak } = useWater();
  const { sleepStreakDays } = useSleep();
  const { history: workoutHistory, getConsistencyStats, getMonthlyProgress, getActiveProgram } = useWorkout();

  const xp = Number(profile?.xp ?? 0);
  const level = Number(profile?.level ?? 1);
  const levelProgress = useMemo(() => getLevelProgress(xp), [xp]);
  const dayKey = useMemo(() => todayISO(), []);
  const weekKey = useMemo(() => getWeekStart(), []);
  const monthKey = useMemo(() => getMonthKey(), []);
  const coachMemory = (profile?.coach_memory_json as Record<string, unknown> | null | undefined) ?? null;
  const activeModules = getActiveModules(coachMemory);
  const dailyClaimIds = useMemo(() => getClaimIds(coachMemory, 'daily_claims', dayKey), [coachMemory, dayKey]);
  const weeklyClaimIds = useMemo(() => getClaimIds(coachMemory, 'weekly_claims', weekKey), [coachMemory, weekKey]);
  const monthlyClaimIds = useMemo(() => getClaimIds(coachMemory, 'monthly_claims', monthKey), [coachMemory, monthKey]);

  const currentTier = useMemo(() => getRankByXp(xp), [xp]);
  const nextTier = useMemo(() => getNextRank(xp), [xp]);
  const upcomingTiers = useMemo(() => getUpcomingRanks(xp), [xp]);
  const workoutConsistencyStats = getConsistencyStats();
  const workoutMonthlyStats = getMonthlyProgress();
  const workoutActiveProgram = getActiveProgram();
  const workoutBestStreak = useMemo(() => getBestWorkoutStreak(workoutHistory), [workoutHistory]);
  const score = extractScore(dailyScore);
  const waterTotal = Number(todayData?.water?.total ?? 0);
  const waterGoal = Number(todayData?.water?.goal ?? profile?.water_goal_ml ?? 2000);
  const stepsToday = Number(todayData?.steps?.steps ?? 0);
  const stepGoal = Number(todayData?.stepGoal ?? profile?.step_goal ?? 10000);
  const sleepHours = Number(todayData?.sleep?.duration_min ?? 0) / 60;
  const mealsLogged = Boolean(
    dailyScore &&
      typeof dailyScore === 'object' &&
      ((dailyScore as Record<string, unknown>).meta as Record<string, unknown> | undefined)?.hasMealsLog,
  );
  const anyActionToday = [waterTotal > 0, stepsToday > 0, sleepHours > 0, mealsLogged].filter(Boolean).length > 0;
  const streak = Number(profile?.streak ?? profile?.current_streak ?? 0);
  const daysWithHighScore = weekScores.filter((row) => Number((row as Record<string, unknown>).total_score ?? 0) >= 80).length;
  const weeklyWaterGoalDays = waterWeeklyData.filter((row) => getWaterTotal(row) >= waterGoal).length;
  const weeklyStepGoalDays = stepWeeklyData.filter((row) => Number((row as Record<string, unknown>).steps ?? 0) >= stepGoal).length;
  const todayCoins = useMemo(
    () =>
      transactions.reduce((sum, entry) => {
        if (entry.amount <= 0) return sum;
        return entry.created_at.startsWith(dayKey) ? sum + entry.amount : sum;
      }, 0),
    [dayKey, transactions],
  );

  const dailyMissions = useMemo<DailyChallenge[]>(() => {
    const missionPool = [
      ...(activeModules.includes('water') ? [DAILY_MISSION_LIBRARY.find((entry) => entry.id === 'daily_water_goal')!] : []),
      ...(activeModules.includes('steps') ? [DAILY_MISSION_LIBRARY.find((entry) => entry.id === 'daily_steps_8k')!] : []),
      ...(activeModules.includes('sleep') ? [DAILY_MISSION_LIBRARY.find((entry) => entry.id === 'daily_sleep_7h')!] : []),
    ].slice(0, 3);

    const scoreMission = DAILY_MISSION_LIBRARY.find((entry) => entry.id === 'daily_score_80');
    const pool = [...missionPool, ...(scoreMission ? [scoreMission] : [])].filter(Boolean);

    return pool.map((mission) => {
      let progress = 0;
      switch (mission.id) {
        case 'daily_water_goal':
          progress = waterTotal >= waterGoal ? 1 : 0;
          break;
        case 'daily_steps_8k':
          progress = Math.min(stepsToday, mission.target);
          break;
        case 'daily_sleep_7h':
          progress = Math.min(sleepHours, mission.target);
          break;
        case 'daily_score_80':
          progress = Math.min(score, mission.target);
          break;
        default:
          progress = anyActionToday ? 1 : 0;
      }

      return {
        ...mission,
        module: getMissionModule(mission.id),
        progress,
        completed: progress >= mission.target,
        claimed: dailyClaimIds.includes(mission.id),
        dateKey: dayKey,
      };
    });
  }, [activeModules, anyActionToday, dailyClaimIds, dayKey, score, sleepHours, stepsToday, waterGoal, waterTotal]);

  const dailyChallenge = useMemo(
    () => dailyMissions.find((mission) => mission.completed && !mission.claimed) ?? dailyMissions[0] ?? {
      ...DAILY_MISSION_LIBRARY[0],
      module: 'water' as const,
      progress: 0,
      completed: false,
      claimed: false,
      dateKey: dayKey,
    },
    [dailyMissions, dayKey],
  );

  const weeklyChallenges = useMemo<WeeklyChallenge[]>(() => {
    const candidates = [
      activeModules.includes('steps') ? WEEKLY_MISSION_LIBRARY.find((entry) => entry.id === 'weekly_steps_5_days') : null,
      WEEKLY_MISSION_LIBRARY.find((entry) => entry.id === 'weekly_no_break'),
      activeModules.includes('water') ? WEEKLY_MISSION_LIBRARY.find((entry) => entry.id === 'weekly_water_6_of_7') : null,
      WEEKLY_MISSION_LIBRARY.find((entry) => entry.id === 'weekly_score_80'),
    ].filter(Boolean) as MissionDef[];

    return candidates.slice(0, 2).map((mission) => {
      let progress = 0;
      switch (mission.id) {
        case 'weekly_steps_5_days':
          progress = weeklyStepGoalDays;
          break;
        case 'weekly_water_6_of_7':
          progress = weeklyWaterGoalDays;
          break;
        case 'weekly_score_80':
          progress = daysWithHighScore;
          break;
        case 'weekly_no_break':
          progress = Math.min(streak, mission.target);
          break;
        default:
          progress = 0;
      }

      return {
        ...mission,
        module: getMissionModule(mission.id),
        progress,
        completed: progress >= mission.target,
        claimed: weeklyClaimIds.includes(mission.id),
      };
    });
  }, [activeModules, daysWithHighScore, streak, weeklyClaimIds, weeklyStepGoalDays, weeklyWaterGoalDays]);

  const monthlyChallenge = useMemo<MonthlyChallenge>(() => {
    const event =
      activeModules.includes('water')
        ? EVENT_LIBRARY.find((entry) => entry.id === 'event_hydration_14')
        : EVENT_LIBRARY.find((entry) => entry.id === 'event_vyra_season');
    const selected = event ?? EVENT_LIBRARY[0]!;
    const missionCountMonth = transactions.filter(
      (entry) =>
        entry.amount > 0 &&
        entry.created_at.startsWith(monthKey) &&
        entry.description.toLowerCase().includes('misión'),
    ).length;

    let progress = 0;
    switch (selected.id) {
      case 'event_hydration_14':
        progress = Math.min(hydrationStreak?.streakDays ?? weeklyWaterGoalDays, selected.target);
        break;
      case 'event_month_elite':
        progress = daysWithHighScore;
        break;
      case 'event_vyra_season':
        progress = missionCountMonth;
        break;
      default:
        progress = Math.min(streak, selected.target);
    }

    return {
      ...selected,
      module: getMissionModule(selected.id),
      progress,
      completed: progress >= selected.target,
      claimed: monthlyClaimIds.includes(selected.id),
      monthKey,
    };
  }, [activeModules, daysWithHighScore, hydrationStreak?.streakDays, monthKey, monthlyClaimIds, streak, transactions, weeklyWaterGoalDays]);

  const completedCount = weeklyChallenges.filter((challenge) => challenge.completed).length;
  const claimedCount = weeklyChallenges.filter((challenge) => challenge.claimed).length;
  const claimableCount =
    dailyMissions.filter((mission) => mission.completed && !mission.claimed).length +
    weeklyChallenges.filter((challenge) => challenge.completed && !challenge.claimed).length +
    (monthlyChallenge.completed && !monthlyChallenge.claimed ? 1 : 0);

  const saveClaims = useCallback(
    async (nextMemory: Record<string, unknown>, xpPatch?: { xp?: number; level?: number }) => {
      if (!profile?.id) return false;
      const { error } = await supabase
        .from('profiles')
        .update({
          coach_memory_json: nextMemory,
          updated_at: new Date().toISOString(),
        })
        .eq('id', profile.id);

      if (error) throw error;
      updateProfile({
        coach_memory_json: nextMemory,
        ...(xpPatch ?? {}),
      });
      return true;
    },
    [profile?.id, updateProfile],
  );

  const claimDailyMission = useCallback(
    async (challengeId: string) => {
      if (!profile?.id) return false;
      const challenge = dailyMissions.find((entry) => entry.id === challengeId);
      if (!challenge || !challenge.completed || challenge.claimed) return false;

      try {
        if (challenge.sourceId === 'daily_score_80') {
          await addCoins(COIN_SOURCES.daily_score_80.coins, 'daily_score_80', `Score 80+: ${challenge.title}`);
        } else {
          await addCoins(challenge.rewardCoins, 'daily_mission', `Misión diaria: ${challenge.title}`);
        }

        const xpPatch = await applyXpReward(profile.id, challenge.rewardXp);
        const nextMemory = withClaimId(coachMemory, 'daily_claims', dayKey, challenge.id);
        await saveClaims(nextMemory, xpPatch);
        showAchievement({
          type: 'streak',
          title: 'Misión diaria lista',
          subtitle: challenge.title,
          coins: challenge.rewardCoins,
          xp: challenge.rewardXp,
        });
        showToast(`${challenge.title} ya quedó reclamada.`, 'success');
        return true;
      } catch (error) {
        captureError(error instanceof Error ? error : new Error(String(error)), {
          action: 'useGamification.claimDailyMission',
          challengeId,
        });
        showToast('No se pudo reclamar la misión diaria.', 'error');
        return false;
      }
    },
    [addCoins, coachMemory, dailyMissions, dayKey, profile?.id, saveClaims, showAchievement, showToast],
  );

  const claimDailyChallenge = useCallback(async () => {
    const nextDaily = dailyMissions.find((entry) => entry.completed && !entry.claimed);
    return nextDaily ? claimDailyMission(nextDaily.id) : false;
  }, [claimDailyMission, dailyMissions]);

  const claimChallenge = useCallback(
    async (challengeId: string) => {
      if (!profile?.id) return false;
      const challenge = weeklyChallenges.find((entry) => entry.id === challengeId);
      if (!challenge || !challenge.completed || challenge.claimed) return false;

      try {
        await addCoins(challenge.rewardCoins, 'weekly_mission', `Misión semanal: ${challenge.title}`);
        const xpPatch = await applyXpReward(profile.id, challenge.rewardXp);
        const nextMemory = withClaimId(coachMemory, 'weekly_claims', weekKey, challenge.id);
        await saveClaims(nextMemory, xpPatch);
        showAchievement({
          type: 'streak',
          title: 'Misión semanal lista',
          subtitle: challenge.title,
          coins: challenge.rewardCoins,
          xp: challenge.rewardXp,
        });
        showToast(`${challenge.title} ya quedó reclamada.`, 'success');
        return true;
      } catch (error) {
        captureError(error instanceof Error ? error : new Error(String(error)), {
          action: 'useGamification.claimChallenge',
          challengeId,
        });
        showToast('No se pudo reclamar la misión semanal.', 'error');
        return false;
      }
    },
    [addCoins, coachMemory, profile?.id, saveClaims, showAchievement, showToast, weekKey, weeklyChallenges],
  );

  const claimMonthlyChallenge = useCallback(async () => {
    if (!profile?.id || !monthlyChallenge.completed || monthlyChallenge.claimed) return false;

    try {
      await addCoins(monthlyChallenge.rewardCoins, 'weekly_mission', `Evento: ${monthlyChallenge.title}`);
      const xpPatch = await applyXpReward(profile.id, monthlyChallenge.rewardXp);
      const nextMemory = withClaimId(coachMemory, 'monthly_claims', monthKey, monthlyChallenge.id);
      await saveClaims(nextMemory, xpPatch);
      showAchievement({
        type: 'streak',
        title: 'Evento completado',
        subtitle: monthlyChallenge.title,
        coins: monthlyChallenge.rewardCoins,
        xp: monthlyChallenge.rewardXp,
      });
      showToast(`${monthlyChallenge.title} ya quedó reclamado.`, 'success');
      return true;
    } catch (error) {
      captureError(error instanceof Error ? error : new Error(String(error)), {
        action: 'useGamification.claimMonthlyChallenge',
        challengeId: monthlyChallenge.id,
      });
      showToast('No se pudo reclamar el evento.', 'error');
      return false;
    }
  }, [addCoins, coachMemory, monthKey, monthlyChallenge, profile?.id, saveClaims, showAchievement, showToast]);

  return {
    level,
    xp,
    balance,
    xpIntoLevel: levelProgress.xpIntoLevel,
    xpToNextLevel: levelProgress.xpToNextLevel,
    levelSpan: levelProgress.levelSpan,
    xpProgressPct: levelProgress.progressPct,
    currentTier,
    nextTier,
    upcomingTiers,
    totalRankTiers: VYRA_RANKS.length,
    rankCoinBonusPct: getRankCoinBonusPct(xp),
    dailyCoinCap: getDailyCoinCap(Boolean(profile?.is_premium)),
    coinsEarnedToday: todayCoins,
    dailyChallenge,
    dailyMissions,
    weeklyChallenges,
    monthlyChallenge,
    completedCount,
    claimedCount,
    claimableCount,
    workoutMonthly: {
      completed: workoutMonthlyStats.currentMonthSessions,
      total: Math.max(
        workoutMonthlyStats.currentMonthSessions,
        workoutMonthlyStats.currentMonthSessions - Math.min(workoutMonthlyStats.sessionsDelta ?? 0, 0),
      ),
      volume: workoutMonthlyStats.currentMonthVolume,
      volumeDeltaPct: workoutMonthlyStats.volumeDeltaPct,
    },
    workoutConsistency: {
      ...workoutConsistencyStats,
      bestStreak: workoutBestStreak,
      label: workoutActiveProgram
        ? `Programa activo · ${workoutActiveProgram.name}`
        : workoutConsistencyStats.currentWeekSessions > 0
          ? 'Ritmo activo'
          : 'Todavía sin sesiones',
    },
    activeProgram: workoutActiveProgram,
    community: { month: null },
    claimDailyMission,
    claimDailyChallenge,
    claimChallenge,
    claimMonthlyChallenge,
  };
}

export default useGamification;
