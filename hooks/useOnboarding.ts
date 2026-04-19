// ============================================================
// VYRA FITNESS — useOnboarding Hook
// Estado y navegación del wizard de onboarding
// ============================================================

import { useState, useCallback } from 'react';
import { router } from 'expo-router';
import { Routes } from '@/constants/routes';
import type { OnboardingData, PrimaryGoal, Gender, ActivityLevel } from '@/types/user';

const DEFAULTS: OnboardingData = {
  name:               'Usuario',
  goal:               'lose_fat',
  gender:             'male',
  age:                25,
  height_cm:          170,
  weight_start_kg:    70,
  weight_goal_kg:     undefined,
  activity_level:     2,
  water_goal_ml:      3000,
  step_goal:          10000,
  equipment:          'gym',
  wake_time_minutes:  420,   // 7:00 AM
  sleep_time_minutes: 1380,  // 23:00 PM
  terms_accepted:     true,
  privacy_accepted:   true,
};

export function useOnboarding() {
  const [data, setData] = useState<OnboardingData>(DEFAULTS);

  const setGoal        = useCallback((g: PrimaryGoal)       => setData(d => ({ ...d, goal:             g } as OnboardingData)), []);
  const setGender      = useCallback((g: Gender)            => setData(d => ({ ...d, gender:          g })), []);
  const setAge         = useCallback((n: number)            => setData(d => ({ ...d, age:             n })), []);
  const setHeight      = useCallback((n: number)            => setData(d => ({ ...d, height_cm:       n })), []);
  const setWeight      = useCallback((n: number)            => setData(d => ({ ...d, weight_start_kg: n })), []);
  const setGoalWeight  = useCallback((n?: number)     => setData(d => ({ ...d, weight_goal_kg:  n } as OnboardingData)), []);
  const setActivity    = useCallback((n: ActivityLevel)     => setData(d => ({ ...d, activity_level:  n })), []);
  const setEquipment   = useCallback((e: OnboardingData['equipment']) => setData(d => ({ ...d, equipment: e })), []);
  const setWakeTime    = useCallback((m: number)            => setData(d => ({ ...d, wake_time_minutes:  m })), []);
  const setSleepTime   = useCallback((m: number)            => setData(d => ({ ...d, sleep_time_minutes: m })), []);
  const setProtocol    = useCallback((p: string | null)     => setData(d => ({ ...d, fasting_protocol: p })), []);

  const goToStep = (step: 0 | 1 | 2 | 3 | 4) => {
    const routes: Record<number, string> = {
      0: Routes.auth.onboarding.transition,
      1: Routes.auth.onboarding.goals,
      2: Routes.auth.onboarding.base,
      3: Routes.auth.onboarding.modules,
      4: Routes.auth.onboarding.finish,
    };
    router.push(routes[step] as never);
  };

  return {
    data,
    setGoal, setGender, setAge, setHeight, setWeight,
    setGoalWeight, setActivity, setEquipment,
    setWakeTime, setSleepTime, setProtocol,
    goToStep,
  };
}
