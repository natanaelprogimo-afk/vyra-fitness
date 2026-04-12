// ============================================================
// VYRA FITNESS — useAuth Hook
// Login, register, logout, perfil, reset password
// ============================================================

import { useState, useCallback } from 'react';
import { router } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';
import { useUIStore } from '@/stores/uiStore';
import { captureError } from '@/lib/sentry';
import { trackOnboardingCompleted } from '@/lib/analytics';
import { ErrorMessages } from '@/constants/strings';
import type { UserProfile, UserProfileUpdate, OnboardingData } from '@/types/user';
import { calculateTDEE, calculateBMR } from '@/utils/calculations';

function normalizeGoal(goal: OnboardingData['goal']): string {
  switch (goal) {
    case 'health':
      return 'general_health';
    case 'performance':
      return 'sport_performance';
    case 'mental':
      return 'mental_wellbeing';
    default:
      return goal;
  }
}

function normalizeGender(gender: OnboardingData['gender']): string {
  if (gender === 'other') return 'non_binary';
  return gender;
}

export function useAuth() {
  const [isLoading, setIsLoading] = useState(false);

  const { setProfile, updateProfile, profile, session, user } = useAuthStore();
  const showToast = useUIStore((s) => s.showToast);

  // ─── Login ───────────────────────────────────────────────
  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      // El auth listener en _layout.tsx maneja el redirect
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : ErrorMessages.loginFailed;
      showToast(
        msg.includes('Invalid') ? ErrorMessages.loginFailed : ErrorMessages.generic,
        'error'
      );
      captureError(err instanceof Error ? err : new Error(String(err)), { action: "'login'" });
      return false;
    } finally {
      setIsLoading(false);
    }
    return true;
  }, []);

  // ─── Register ────────────────────────────────────────────
  const register = useCallback(async (
    email:    string,
    password: string,
    name:     string,
    _opts?:   any,
  ) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name },
        },
      });
      if (error) throw error;
      if (!data.user) throw new Error('No user returned');

      // El trigger handle_new_user() en Supabase crea el perfil automáticamente
      // Redirigir al onboarding
      router.replace('/(auth)/onboarding/step0-preview' as any);
      return true;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '';
      if (msg.includes('already registered')) {
        showToast('Este email ya está registrado. ¿Querés iniciar sesión?', 'warning');
      } else {
        showToast(ErrorMessages.registerFailed, 'error');
      }
      captureError(err instanceof Error ? err : new Error(String(err)), { action: "'register'" });
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ─── Logout ──────────────────────────────────────────────
  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      await supabase.auth.signOut();
      router.replace('/(auth)/welcome' as any);
    } catch (err) {
      showToast(ErrorMessages.generic, 'error');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ─── Reset password ──────────────────────────────────────
  const resetPassword = useCallback(async (email: string) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'vyrafitness://reset-password',
      });
      if (error) throw error;
      showToast('¡Revisá tu email para restablecer tu contraseña!', 'success');
      return true;
    } catch {
      showToast('No pudimos enviar el email. Verificá la dirección.', 'error');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ─── Guardar onboarding ──────────────────────────────────
  const saveOnboarding = useCallback(async (data: OnboardingData) => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user');

      // Calcular TDEE y metas
      const age    = data.age ?? 25;
      const gender = data.gender ?? 'prefer_not_to_say';
      const height = data.height_cm ?? 170;
      const weight = data.weight_start_kg ?? 70;

      const tdee = data.height_cm && data.age && data.weight_start_kg
        ? calculateTDEE(
            calculateBMR(weight, height, age, gender as 'male' | 'female' | 'other'),
            data.activity_level
          )
        : 2000;
      const activeModules =
        Array.isArray(data.active_modules)
          ? data.active_modules
              .filter((value): value is string => typeof value === 'string' && value.trim().length > 0)
              .map((value) => value.trim())
          : [];
      const currentCoachMemory =
        profile?.coach_memory_json && typeof profile.coach_memory_json === 'object'
          ? (profile.coach_memory_json as Record<string, unknown>)
          : {};
      const onboardingCompletedAt = new Date().toISOString();
      const nextCoachMemory: Record<string, unknown> = {
        ...currentCoachMemory,
        onboarding_completed_at: onboardingCompletedAt,
      };
      if (activeModules.length > 0) {
        nextCoachMemory.active_modules = activeModules;
      }

      const updatePayload: Record<string, unknown> = {
        gender:               normalizeGender(data.gender),
        height_cm:            data.height_cm,
        weight_start_kg:      data.weight_start_kg,
        weight_goal_kg:       data.weight_goal_kg,
        activity_level:       data.activity_level,
        primary_goal:         normalizeGoal(data.goal),
        wake_time_minutes:    data.wake_time_minutes,
        sleep_time_minutes:   data.sleep_time_minutes,
        step_goal:            data.step_goal,
        water_goal_ml:        data.water_goal_ml,
        sleep_goal_hours:     data.sleep_goal_hours ?? 8,
        calorie_goal:         Math.round(tdee),
        onboarding_completed: true,
        coins:                50, // bonus de onboarding
        updated_at:           new Date().toISOString(),
        coach_memory_json:    nextCoachMemory,
      };

      const { error } = await supabase
        .from('profiles')
        .update(updatePayload)
        .eq('id', user.id);

      if (error) throw error;

      updateProfile({
        ...(updatePayload as Partial<UserProfile>),
        biological_sex: data.gender,
        goal:           data.goal,
        tdee:           Math.round(tdee),
      });
      trackOnboardingCompleted('free');

      // Registrar transacción de monedas
      await supabase.from('coin_transactions').insert({
        user_id:     user.id,
        amount:      50,
        type:        'onboarding',
        description: 'Bonus completar onboarding',
      });

      return true;
    } catch (err) {
      showToast(ErrorMessages.saveFailed, 'error');
      captureError(err instanceof Error ? err : new Error(String(err)), { action: "'saveOnboarding'" });
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ─── Actualizar perfil ────────────────────────────────────
  const updateUserProfile = useCallback(async (updates: UserProfileUpdate) => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user');

      const { error } = await supabase
        .from('profiles')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', user.id);

      if (error) throw error;

      updateProfile(updates as Partial<UserProfile>);
      showToast('¡Perfil actualizado!', 'success');
      return true;
    } catch {
      showToast(ErrorMessages.saveFailed, 'error');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ─── Eliminar cuenta (GDPR) ──────────────────────────────
  const requestAccountDeletion = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user');

      await supabase.from('deletion_requests').insert({
        user_id:      user.id,
        requested_at: new Date().toISOString(),
        status:       'pending',
      });

      showToast('Solicitud enviada. Procesaremos la eliminación en máximo 30 días.', 'info');
      await logout();
      return true;
    } catch {
      showToast(ErrorMessages.generic, 'error');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    isLoading,
    session,
    user,
    profile,
    isOnboardingComplete: profile?.onboarding_completed ?? false,
    login,
    register,
    logout,
    resetPassword,
    saveOnboarding,
    updateUserProfile,
    requestAccountDeletion,
  };
}
