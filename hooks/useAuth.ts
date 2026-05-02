// ============================================================
// VYRA FITNESS - useAuth Hook
// Login, register, logout, perfil, reset password
// ============================================================

import { useState, useCallback } from 'react';
import { router } from 'expo-router';
import type { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';
import { useUIStore } from '@/stores/uiStore';
import { captureError } from '@/lib/sentry';
import { trackOnboardingCompleted } from '@/lib/analytics';
import {
  normalizeOnboardingGender,
  normalizeOnboardingGoal,
  sanitizeActiveModules,
} from '@/lib/auth-profile';
import { ErrorMessages } from '@/constants/strings';
import { Routes } from '@/constants/routes';
import { clearOnboardingProgress } from '@/lib/onboarding-storage';
import {
  buildLegacyProfileContextUpdate,
  buildProfileContextUpdate,
  getProfileContextMemory,
  shouldFallbackToLegacyProfileContext,
} from '@/lib/profile-context';
import { ensureProfileExists } from '@/lib/auth-session';
import {
  buildManagedGuestCredentials,
  buildManagedGuestMetadata,
  isGuestAuthUser,
} from '@/lib/guest-auth';
import type { UserProfile, UserProfileUpdate, OnboardingData } from '@/types/user';
import { calculateTDEE, calculateBMR } from '@/utils/calculations';

type AuthActionResult = {
  ok: boolean;
  error?: string;
};

function mapAuthErrorMessage(err: unknown, fallback: string): string {
  const raw = err instanceof Error ? err.message.trim() : '';
  const normalized = raw.toLowerCase();

  if (
    normalized.includes('invalid login credentials') ||
    normalized.includes('invalid email or password') ||
    normalized.includes('invalid credentials')
  ) {
    return 'Email o contrasena incorrectos.';
  }

  if (normalized.includes('email not confirmed')) {
    return 'Necesitas confirmar tu email antes de entrar.';
  }

  if (normalized.includes('already registered') || normalized.includes('already been registered')) {
    return 'Este email ya está registrado. Puedes iniciar sesión con esa cuenta.';
  }

  if (
    normalized.includes('network') ||
    normalized.includes('fetch') ||
    normalized.includes('timeout') ||
    normalized.includes('failed to fetch')
  ) {
    return 'No pudimos conectar con Vyra ahora mismo. Revisa tu conexión e intenta otra vez.';
  }

  return fallback;
}

export function useAuth() {
  const [isLoading, setIsLoading] = useState(false);

  const { updateProfile, profile, session, user, setProfile } = useAuthStore();
  const showToast = useUIStore((s) => s.showToast);

  const resolveContextDisplayName = (input: OnboardingData): string | null => {
    if (typeof input.context_display_name === 'string' && input.context_display_name.trim().length > 0) {
      return input.context_display_name.trim();
    }

    const legacyDisplayName = (input as OnboardingData & { coach_display_name?: string | null }).coach_display_name;
    return typeof legacyDisplayName === 'string' && legacyDisplayName.trim().length > 0
      ? legacyDisplayName.trim()
      : null;
  };

  // Login
  const login = useCallback(async (email: string, password: string): Promise<AuthActionResult> => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
    } catch (err: unknown) {
      const message = mapAuthErrorMessage(err, ErrorMessages.loginFailed);
      showToast(message, 'error');
      captureError(err instanceof Error ? err : new Error(String(err)), { action: "'login'" });
      return { ok: false, error: message };
    } finally {
      setIsLoading(false);
    }
    return { ok: true };
  }, [showToast]);

  // Register
  const register = useCallback(async (
    email: string,
    password: string,
    name: string,
    _opts?: unknown,
  ): Promise<AuthActionResult> => {
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

      router.replace(Routes.auth.onboarding.goals as never);
      return { ok: true };
    } catch (err: unknown) {
      const message = mapAuthErrorMessage(err, ErrorMessages.registerFailed);
      showToast(message, message.includes('registrado') ? 'warning' : 'error');
      captureError(err instanceof Error ? err : new Error(String(err)), { action: "'register'" });
      return { ok: false, error: message };
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  const continueAsGuest = useCallback(async (): Promise<AuthActionResult> => {
    setIsLoading(true);
    try {
      if (isGuestAuthUser(user)) {
        router.replace(Routes.auth.onboarding.goals as never);
        return { ok: true };
      }

      let resolvedUser: User | null = null;

      const anonymousResult = await supabase.auth.signInAnonymously({
        options: {
          data: buildManagedGuestMetadata(),
        },
      });

      if (anonymousResult.data.user && !anonymousResult.error) {
        resolvedUser = anonymousResult.data.user;
      } else {
        const managedGuest = buildManagedGuestCredentials();
        const managedGuestResult = await supabase.auth.signUp({
          email: managedGuest.email,
          password: managedGuest.password,
          options: {
            data: buildManagedGuestMetadata(),
          },
        });

        if (managedGuestResult.error) throw managedGuestResult.error;

        if (managedGuestResult.data.user) {
          resolvedUser = managedGuestResult.data.user;
        } else {
          const managedGuestLoginResult = await supabase.auth.signInWithPassword({
            email: managedGuest.email,
            password: managedGuest.password,
          });

          if (managedGuestLoginResult.error) throw managedGuestLoginResult.error;
          resolvedUser = managedGuestLoginResult.data.user ?? null;
        }
      }

      if (!resolvedUser) throw new Error('No se pudo crear la sesion invitada.');

      const seededProfile = await ensureProfileExists(resolvedUser);
      if (seededProfile) {
        setProfile(seededProfile);
      }

      router.replace(Routes.auth.onboarding.goals as never);
      return { ok: true };
    } catch (err: unknown) {
      const message = mapAuthErrorMessage(
        err,
        'No pudimos abrir una sesión temporal ahora mismo. Intenta otra vez.',
      );
      showToast(message, 'error');
      captureError(err instanceof Error ? err : new Error(String(err)), { action: "'continueAsGuest'" });
      return { ok: false, error: message };
    } finally {
      setIsLoading(false);
    }
  }, [setProfile, showToast, user]);

  // Logout
  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      await supabase.auth.signOut();
      router.replace('/(auth)/welcome' as never);
    } catch {
      showToast(ErrorMessages.generic, 'error');
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  // Reset password
  const resetPassword = useCallback(async (email: string) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'vyrafitness://reset-password',
      });
      if (error) throw error;
      showToast('Revisa tu email para restablecer tu contrasena.', 'success');
      return true;
    } catch {
      showToast('No pudimos enviar el email. Verifica la dirección.', 'error');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  // Guardar onboarding
  const saveOnboarding = useCallback(async (data: OnboardingData) => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user');

      const age = data.age ?? 25;
      const gender = data.gender ?? 'prefer_not_to_say';
      const height = data.height_cm ?? 170;
      const weight = data.weight_start_kg ?? 70;

      const tdee = data.height_cm && data.age && data.weight_start_kg
        ?  calculateTDEE(
            calculateBMR(weight, height, age, gender as 'male' | 'female' | 'other'),
            data.activity_level
          )
        : 2000;

      const activeModules = sanitizeActiveModules(data.active_modules);
      const currentContextMemory = getProfileContextMemory(profile);
      const onboardingCompletedAt = new Date().toISOString();
      const nextContextMemory: Record<string, unknown> = {
        ...currentContextMemory,
        onboarding_completed_at: onboardingCompletedAt,
      };

      if (activeModules.length > 0) {
        nextContextMemory.active_modules = activeModules;
      }

      if (typeof data.equipment === 'string' && data.equipment.trim().length > 0) {
        nextContextMemory.equipment_type = data.equipment.trim();
      }

      if (data.notifications_permission_state) {
        nextContextMemory.notification_onboarding_state = data.notifications_permission_state;
        if (data.notifications_permission_state === 'granted') {
          nextContextMemory.notification_enabled = true;
        } else {
          nextContextMemory.notification_enabled = false;
        }
      }

      const contextUpdate = buildProfileContextUpdate({
        name: resolveContextDisplayName(data),
        memory: nextContextMemory,
      });

      const updatePayload: Record<string, unknown> = {
        gender: normalizeOnboardingGender(data.gender),
        height_cm: data.height_cm,
        weight_start_kg: data.weight_start_kg,
        weight_goal_kg: data.weight_goal_kg,
        activity_level: data.activity_level,
        primary_goal: normalizeOnboardingGoal(data.goal),
        wake_time_minutes: data.wake_time_minutes,
        sleep_time_minutes: data.sleep_time_minutes,
        step_goal: data.step_goal,
        water_goal_ml: data.water_goal_ml,
        sleep_goal_hours: data.sleep_goal_hours ?? 8,
        calorie_goal: Math.round(tdee),
        onboarding_completed: true,
        ...contextUpdate,
        updated_at: new Date().toISOString(),
      };

      let { error } = await supabase
        .from('profiles')
        .update(updatePayload)
        .eq('id', user.id);

      if (error && shouldFallbackToLegacyProfileContext(error)) {
        const legacyPayload: Record<string, unknown> = {
          ...updatePayload,
          ...buildLegacyProfileContextUpdate({
            name: resolveContextDisplayName(data),
            memory: nextContextMemory,
          }),
        };
        delete legacyPayload.context_name_preference;
        delete legacyPayload.context_memory_json;

        const retry = await supabase
          .from('profiles')
          .update(legacyPayload)
          .eq('id', user.id);

        error = retry.error;
      }

      if (error) throw error;

      updateProfile({
        ...(updatePayload as Partial<UserProfile>),
        biological_sex: data.gender,
        goal: data.goal,
        tdee: Math.round(tdee),
      });
      trackOnboardingCompleted('included');
      await clearOnboardingProgress();

      return true;
    } catch (err) {
      showToast(ErrorMessages.saveFailed, 'error');
      captureError(err instanceof Error ? err : new Error(String(err)), { action: "'saveOnboarding'" });
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [profile?.context_memory_json, showToast, updateProfile]);

  // Actualizar perfil
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
      showToast('Perfil actualizado.', 'success');
      return true;
    } catch {
      showToast(ErrorMessages.saveFailed, 'error');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [showToast, updateProfile]);

  // Eliminar cuenta
  const requestAccountDeletion = useCallback(async () => {
    setIsLoading(true);
    try {
      const {
        data: { session: currentSession },
      } = await supabase.auth.getSession();

      const currentUser = currentSession?.user;
      if (!currentUser || !currentSession?.access_token) {
        throw new Error('No user');
      }

      const backendUrl =
        process.env.EXPO_PUBLIC_API_URL ?? process.env.EXPO_PUBLIC_BACKEND_URL ?? '';
      if (!backendUrl) {
        throw new Error('Missing backend URL');
      }

      const response = await fetch(`${backendUrl}/api/profile/account`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${currentSession.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const payload = (await response.json().catch((e) => {
          console.debug?.('[useAuth] requestAccountDeletion response.json failed', e);
          return null;
        })) as { error?: string } | null;
        throw new Error(payload?.error ?? 'No se pudo eliminar la cuenta.');
      }

      showToast('Tu solicitud se procesó y cerramos la sesión. El borrado final sigue la política vigente.', 'success');
      await logout();
      return true;
    } catch {
      showToast('No pudimos borrar la cuenta completa ahora mismo. Intenta otra vez.', 'error');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [logout, showToast]);

  return {
    isLoading,
    session,
    user,
    profile,
    isOnboardingComplete: profile?.onboarding_completed ?? false,
    login,
    register,
    continueAsGuest,
    logout,
    resetPassword,
    saveOnboarding,
    updateUserProfile,
    requestAccountDeletion,
  };
}
