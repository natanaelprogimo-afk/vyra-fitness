// ============================================================
// VYRA FITNESS - Root Layout
// Auth guard, providers, servicios globales y bootstrap
// ============================================================

import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState, Pressable, StyleSheet, Text, TextInput, View, useColorScheme } from 'react-native';
import * as Linking from 'expo-linking';
import * as LocalAuthentication from 'expo-local-authentication';
import * as SplashScreen from 'expo-splash-screen';
import { router, Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClientProvider } from '@tanstack/react-query';
import { useFonts } from 'expo-font';
import NetInfo from '@react-native-community/netinfo';
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  Inter_800ExtraBold,
  Inter_900Black,
} from '@expo-google-fonts/inter';
import { JetBrainsMono_600SemiBold } from '@expo-google-fonts/jetbrains-mono';
import { useAuthStore } from '@/stores/authStore';
import { useUIStore } from '@/stores/uiStore';
import { getPersistedSupabaseSessionSnapshot, supabase } from '@/lib/supabase';
import {
  clearSentryUser,
  captureError,
  initSentry,
  setSentryUser,
} from '@/lib/sentry';
import { identifyUser, resetUser } from '@/lib/analytics';
import { applyRuntimeColorScheme, Colors, resolveColorSchemePreference } from '@/constants/colors';
import { FontFamily, FontSize, Radius, Spacing } from '@/constants/theme';
import { setI18nLanguage } from '@/lib/i18n';
import { getTextScaleMultiplier } from '@/lib/text-scale';
import { buildOfflineProfileSeed, ensureProfileExists } from '@/lib/auth-session';
import { armPasswordRecoveryFlow, setPasswordRecoveryUrl } from '@/lib/password-recovery';
import Toast from '@/components/ui/Toast';
import NotificationsBootstrap from '@/components/system/NotificationsBootstrap';
import StreakBootstrap from '@/components/system/StreakBootstrap';
import BackendHealthGate from '@/components/system/BackendHealthGate';
import AdsBootstrap from '@/components/system/AdsBootstrap';
import { queryClient } from '@/lib/query-client';
import {
  armQaBridgeRuntimeMode,
  buildQaBridgeProfileSeed,
  clearQaBridgeRuntimeMode,
  consumeQaBridgeSignedOutBypass,
  extractQaBridgePayload,
  isQaBridgeRuntimeModeEnabled,
  setQaBridgePayload,
} from '@/lib/qa-auth-bridge';
import { isGuestAuthUser } from '@/lib/guest-auth';
import type { Session } from '@supabase/supabase-js';
import { useSettingsStore } from '@/stores/settingsStore';
import { useWorkoutStore } from '@/stores/workoutStore';
import { useNavigationStore } from '@/stores/navigationStore';
import { extractRouteFromIncomingUrl } from '@/lib/incoming-route';
import { Routes } from '@/constants/routes';

initSentry();
void SplashScreen.preventAutoHideAsync().catch((e) => {
  console.debug?.('[RootLayout] SplashScreen.preventAutoHideAsync failed', e);
});
const FONT_LOAD_TIMEOUT_MS = 8000;
const AUTH_BOOTSTRAP_TIMEOUT_MS = 12000;
const PROFILE_HYDRATION_TIMEOUT_MS = 12000;
const QA_BRIDGE_ENABLED =
  __DEV__ || process.env.EXPO_PUBLIC_ENABLE_QA_SESSION_BRIDGE === 'true';
const REMOTE_AUTH_USER_MISSING = 'remote_auth_user_missing';

function applyGlobalTextScaling(multiplier: number) {
  const TextComponent = Text as typeof Text & {
    defaultProps?: {
      allowFontScaling?: boolean;
      maxFontSizeMultiplier?: number;
    };
  };
  const TextInputComponent = TextInput as typeof TextInput & {
    defaultProps?: {
      allowFontScaling?: boolean;
      maxFontSizeMultiplier?: number;
    };
  };

  TextComponent.defaultProps = {
    ...(TextComponent.defaultProps ?? {}),
    allowFontScaling: true,
    maxFontSizeMultiplier: multiplier,
  };
  TextInputComponent.defaultProps = {
    ...(TextInputComponent.defaultProps ?? {}),
    allowFontScaling: true,
    maxFontSizeMultiplier: multiplier,
  };
}

function isInvalidStoredSessionError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error ?? '');
  return /invalid refresh token|refresh token not found|refresh_token_not_found/i.test(message);
}

function isRecoverableProfileHydrationError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error ?? '');
  return /network|failed to fetch|timeout|socket|unreachable|offline/i.test(message);
}

function isRecoverableSessionBootstrapError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error ?? '');
  return /network|failed to fetch|timeout|socket|unreachable|offline/i.test(message);
}

function isRemoteAuthUserMissingError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error ?? '');
  return (
    message === REMOTE_AUTH_USER_MISSING ||
    /user .* does not exist|session .* does not exist|auth session missing|invalid jwt|jwt expired|invalid token|unauthorized|forbidden/i.test(
      message.toLowerCase(),
    )
  );
}

function isBootstrapTimeoutError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error ?? '');
  return /auth bootstrap timeout|profile hydration timeout/i.test(message);
}

function withTimeout<T>(promise: Promise<T>, timeoutMs: number, errorMessage: string): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(errorMessage)), timeoutMs);
    promise
      .then((result) => {
        clearTimeout(timer);
        resolve(result);
      })
      .catch((error) => {
        clearTimeout(timer);
        reject(error);
      });
  });
}

export default function RootLayout() {
  const currentSession = useAuthStore((s) => s.session);
  const isInitialized = useAuthStore((s) => s.isInitialized);
  const {
    setSession,
    setUser,
    setProfile,
    setLoading,
    setInitialized,
    setHasResolvedProfile,
    reset,
    signOut,
  } = useAuthStore();
  const [bootstrapError, setBootstrapError] = useState<string | null>(null);
  const [bootstrapAttempt, setBootstrapAttempt] = useState(0);
  const [fontLoadTimedOut, setFontLoadTimedOut] = useState(false);
  const [biometricLocked, setBiometricLocked] = useState(false);
  const [biometricPromptRunning, setBiometricPromptRunning] = useState(false);
  const [biometricError, setBiometricError] = useState<string | null>(null);
  const splashHiddenRef = useRef(false);
  const appStateRef = useRef(AppState.currentState);
  const bootRestoredSessionRef = useRef(false);
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    Inter_800ExtraBold,
    Inter_900Black,
    JetBrainsMono_600SemiBold,
  });

  const setIsOnline = useUIStore((s) => s.setIsOnline);
  const biometricUnlockEnabled = useSettingsStore((s) => s.biometricUnlockEnabled);
  const setBiometricUnlockEnabled = useSettingsStore((s) => s.setBiometricUnlockEnabled);
  const language = useSettingsStore((s) => s.language);
  const colorSchemePreference = useSettingsStore((s) => s.colorScheme);
  const textScale = useSettingsStore((s) => s.textScale);
  const systemColorScheme = useColorScheme();
  const resolvedColorScheme = resolveColorSchemePreference(colorSchemePreference, systemColorScheme);
  const canRenderApp = fontsLoaded || fontLoadTimedOut;
  const shouldGatePublicStackWithBackendHealth =
    isInitialized &&
    !currentSession?.user;
  const handleRootLayout = useCallback(() => {
    if (!canRenderApp || splashHiddenRef.current) return;
    splashHiddenRef.current = true;
    requestAnimationFrame(() => {
      void SplashScreen.hideAsync().catch((e) => {
        console.debug?.('[RootLayout] SplashScreen.hideAsync failed', e);
      });
    });
  }, [canRenderApp]);

  const handleIncomingUrl = useCallback((url: string | null | undefined) => {
    if (!url) return;

    if (QA_BRIDGE_ENABLED) {
      const qaPayload = extractQaBridgePayload(url);
      if (qaPayload) {
        armQaBridgeRuntimeMode();
        setQaBridgePayload(qaPayload);
        router.replace({
          pathname: '/(auth)/session-bridge',
          params: qaPayload,
        } as never);
        return;
      }
    }

    const incomingRoute = extractRouteFromIncomingUrl(url);
    if (incomingRoute) {
      if (
        incomingRoute === Routes.auth.resetPassword ||
        incomingRoute.startsWith(`${Routes.auth.resetPassword}?`)
      ) {
        armPasswordRecoveryFlow();
        setPasswordRecoveryUrl(url);
        router.replace(Routes.auth.resetPassword as never);
        return;
      }

      if (incomingRoute.startsWith('/premium/')) {
        useNavigationStore.getState().setPostAuthRoute(incomingRoute);
        const authState = useAuthStore.getState();
        if (
          authState.isInitialized &&
          authState.session?.user &&
          authState.hasResolvedProfile &&
          authState.profile?.onboarding_completed
        ) {
          router.replace(incomingRoute as never);
        }
        return;
      }
    }

    try {
      const parsed = new URL(url);
      const normalizedPath = `${parsed.host || ''}${parsed.pathname || ''}`.replace(/^\/+|\/+$/g, '');
      if (normalizedPath === 'reset-password') {
        armPasswordRecoveryFlow();
        setPasswordRecoveryUrl(url);
        router.replace(Routes.auth.resetPassword as never);
      }
    } catch {
      if (url.includes('reset-password')) {
        armPasswordRecoveryFlow();
        setPasswordRecoveryUrl(url);
        router.replace(Routes.auth.resetPassword as never);
      }
    }
  }, []);

  const hydrateProfile = useCallback(async (session: Session | null) => {
    if (!session?.user) {
      setProfile(null);
      setHasResolvedProfile(true);
      clearSentryUser();
      resetUser();
      return;
    }

    const fallbackProfile = buildOfflineProfileSeed(session.user, {
      onboarding_completed:
        bootRestoredSessionRef.current ||
        isGuestAuthUser(session.user) ||
        Boolean(useAuthStore.getState().profile?.onboarding_completed),
    });

    try {
      const {
        data: { user: verifiedUser },
        error: verifiedUserError,
      } = await supabase.auth.getUser();

      if (verifiedUserError) {
        throw verifiedUserError;
      }

      if (!verifiedUser || verifiedUser.id !== session.user.id) {
        throw new Error(REMOTE_AUTH_USER_MISSING);
      }

      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .maybeSingle();

      if (error) throw error;

      setSentryUser(session.user.id);

      if (profile) {
        const resolvedProfile =
          QA_BRIDGE_ENABLED && isQaBridgeRuntimeModeEnabled() && !profile.onboarding_completed
            ?  {
                ...buildQaBridgeProfileSeed({
                  userId: session.user.id,
                  email: profile.email || session.user.email || '',
                  name:
                    profile.name ||
                    (typeof session.user.user_metadata?.name === 'string'
                      ?  session.user.user_metadata.name
                      : '') ||
                    'Usuario',
                }),
                ...profile,
                onboarding_completed: true,
                updated_at: new Date().toISOString(),
              }
            : profile;

        setProfile(resolvedProfile);
        identifyUser(session.user.id, {
          is_premium: Boolean(resolvedProfile.is_premium),
        });
      } else {
        if (QA_BRIDGE_ENABLED && isQaBridgeRuntimeModeEnabled()) {
          const fallbackEmail = session.user.email ?? '';
          const fallbackName =
            typeof session.user.user_metadata?.name === 'string' &&
            session.user.user_metadata.name.trim().length > 0
              ?  session.user.user_metadata.name.trim()
              : fallbackEmail.split('@')[0] || 'Usuario';
          setProfile(
            buildQaBridgeProfileSeed({
              userId: session.user.id,
              email: fallbackEmail,
              name: fallbackName,
            })
          );
        } else {
          const seededProfile = await ensureProfileExists(session.user);
          setProfile(seededProfile);
        }
        identifyUser(session.user.id, {
          is_premium: false,
        });
      }
    } catch (error) {
      if (!isRecoverableProfileHydrationError(error)) {
        throw error;
      }

      setSentryUser(session.user.id);
      setProfile(fallbackProfile);
      identifyUser(session.user.id, {
        is_premium: false,
      });
    }

    setHasResolvedProfile(true);
  }, [setHasResolvedProfile, setProfile]);

  const restorePersistedSessionFromStorage = useCallback(async (reason?: unknown) => {
    if (reason && isInvalidStoredSessionError(reason)) {
      return false;
    }

    const connectivity = await NetInfo.fetch().catch((e) => {
      console.debug?.('[RootLayout] NetInfo.fetch failed', e);
      return null;
    });
    const isOffline =
      connectivity?.isConnected === false ||
      connectivity?.isInternetReachable === false;

    if (reason && !isOffline && !isRecoverableSessionBootstrapError(reason)) {
      return false;
    }

    if (!reason && !isOffline) {
      return false;
    }

    const persistedSession = await getPersistedSupabaseSessionSnapshot();
    if (!persistedSession?.user) {
      return false;
    }

    bootRestoredSessionRef.current = true;
    setSession(persistedSession);
    setUser(persistedSession.user);
    await hydrateProfile(persistedSession);
    return true;
  }, [hydrateProfile, setSession, setUser]);

  const unlockWithBiometrics = useCallback(async () => {
    if (!biometricUnlockEnabled) {
      setBiometricLocked(false);
      setBiometricError(null);
      return true;
    }

    if (biometricPromptRunning) {
      return false;
    }

    setBiometricPromptRunning(true);
    setBiometricError(null);

    try {
      const [hasHardware, isEnrolled] = await Promise.all([
        LocalAuthentication.hasHardwareAsync(),
        LocalAuthentication.isEnrolledAsync(),
      ]);

      if (!hasHardware || !isEnrolled) {
        setBiometricUnlockEnabled(false);
        setBiometricLocked(false);
        setBiometricError(null);
        return true;
      }

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Desbloquear Vyra',
        cancelLabel: 'Cancelar',
        fallbackLabel: 'Usar bloqueo del dispositivo',
        disableDeviceFallback: false,
      });

      if (result.success) {
        setBiometricLocked(false);
        setBiometricError(null);
        return true;
      }

      setBiometricLocked(true);
      setBiometricError('Necesitamos tu huella o tu rostro para reabrir la sesión.');
      return false;
    } catch (error) {
      setBiometricLocked(true);
      setBiometricError('No pudimos validar tu identidad en este dispositivo.');
      captureError(error instanceof Error ? error : new Error(String(error)), {
        action: 'RootLayout.unlockWithBiometrics',
      });
      return false;
    } finally {
      setBiometricPromptRunning(false);
    }
  }, [
    biometricPromptRunning,
    biometricUnlockEnabled,
    setBiometricUnlockEnabled,
  ]);

  useEffect(() => {
    let active = true;

    const bootstrapAuth = async () => {
      setBootstrapError(null);
      setLoading(true);

      try {
        const initialUrl = await Linking.getInitialURL().catch((e) => {
          console.debug?.('[RootLayout] Linking.getInitialURL failed', e);
          return null;
        });
        handleIncomingUrl(initialUrl);

        const sessionResult = await withTimeout(
          supabase.auth.getSession(),
          AUTH_BOOTSTRAP_TIMEOUT_MS,
          'auth bootstrap timeout',
        );
        if (!active) return;

        const session = sessionResult.data.session;
        if (sessionResult.error) {
          if (
            isInvalidStoredSessionError(sessionResult.error) ||
            isRemoteAuthUserMissingError(sessionResult.error)
          ) {
            await supabase.auth.signOut({ scope: 'local' }).catch((e) => {
              console.debug?.('[RootLayout] supabase.signOut failed during bootstrap', e);
            });
            if (!active) return;
            setSession(null);
            setUser(null);
            setProfile(null);
            setHasResolvedProfile(true);
            clearSentryUser();
            resetUser();
            queryClient.clear();
            return;
          }

          const restoredFromStorage = await restorePersistedSessionFromStorage(sessionResult.error);
          if (!active) return;
          if (restoredFromStorage) {
            return;
          }

          throw sessionResult.error;
        }

        if (!session?.user) {
          const restoredFromStorage = await restorePersistedSessionFromStorage();
          if (!active) return;
          if (restoredFromStorage) {
            return;
          }
        }

        bootRestoredSessionRef.current = Boolean(session?.user);
        setSession(session);
        setUser(session?.user ?? null);
        try {
          await withTimeout(
            hydrateProfile(session),
            PROFILE_HYDRATION_TIMEOUT_MS,
            'profile hydration timeout',
          );
        } catch (error) {
          if (!session?.user || !isBootstrapTimeoutError(error)) {
            throw error;
          }

          const currentProfile = useAuthStore.getState().profile;
          const hasCompletedOnboarding = Boolean(
            useAuthStore.getState().profile?.onboarding_completed,
          );
          const fallbackProfile =
            currentProfile ??
            buildOfflineProfileSeed(session.user, {
              onboarding_completed:
                bootRestoredSessionRef.current ||
                isGuestAuthUser(session.user) ||
                hasCompletedOnboarding,
            });

          setSentryUser(session.user.id);
          setProfile(fallbackProfile);
          setHasResolvedProfile(true);
          identifyUser(session.user.id, {
            is_premium: false,
          });
          setBootstrapError(
            'La carga inicial tardó demasiado. Abrimos una sesión usable y puedes reintentar la sincronización sin cerrar la app.',
          );
          captureError(error instanceof Error ? error : new Error(String(error)), {
            action: 'RootLayout.bootstrapAuth.timeout.profile',
          });
        }
      } catch (error) {
        if (!active) return;

        const restoredFromStorage = await restorePersistedSessionFromStorage(error);
        if (!active) return;
        if (restoredFromStorage) {
          return;
        }

        if (isInvalidStoredSessionError(error) || isRemoteAuthUserMissingError(error)) {
          await supabase.auth.signOut({ scope: 'local' }).catch((e) => {
            console.debug?.('[RootLayout] supabase.signOut failed during auth change handling', e);
          });
          if (!active) return;
          setSession(null);
          setUser(null);
          setProfile(null);
          setHasResolvedProfile(true);
          clearSentryUser();
          resetUser();
          queryClient.clear();
          return;
        }
        if (isBootstrapTimeoutError(error)) {
          setSession(null);
          setUser(null);
          setProfile(null);
          setHasResolvedProfile(true);
          clearSentryUser();
          resetUser();
          setBootstrapError(
            'La carga inicial tardó más de lo esperado. Puedes entrar de forma segura y reintentar la sincronización desde la app.',
          );
          captureError(error instanceof Error ? error : new Error(String(error)), {
            action: 'RootLayout.bootstrapAuth.timeout.session',
          });
          return;
        }
        setHasResolvedProfile(true);
        setBootstrapError('No pudimos recuperar tu sesión automáticamente. Puedes reintentar sin cerrar la app.');
        captureError(error instanceof Error ? error : new Error(String(error)), { action: 'RootLayout.bootstrapAuth' });
      } finally {
        if (active) {
          setLoading(false);
          setInitialized(true);
        }
      }
    };

    void bootstrapAuth();

    const linkSubscription = Linking.addEventListener('url', ({ url }) => {
      handleIncomingUrl(url);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT' && consumeQaBridgeSignedOutBypass()) {
        return;
      }

      setBootstrapError(null);
      setSession(session);
      setUser(session?.user ?? null);

      if (event === 'PASSWORD_RECOVERY') {
        armPasswordRecoveryFlow();
        router.replace('/reset-password' as never);
      }

      if (session?.user) {
        try {
          await hydrateProfile(session);
        } catch (error) {
          if (isInvalidStoredSessionError(error) || isRemoteAuthUserMissingError(error)) {
            await supabase.auth.signOut({ scope: 'local' }).catch((e) => {
              console.debug?.('[RootLayout] supabase.signOut failed while handling invalid stored session', e);
            });
            clearQaBridgeRuntimeMode();
            reset();
            clearSentryUser();
            resetUser();
            queryClient.clear();
            setHasResolvedProfile(true);
            setLoading(false);
            setInitialized(true);
            return;
          }

          const currentProfile = useAuthStore.getState().profile;
          const hasCompletedOnboarding = Boolean(currentProfile?.onboarding_completed);
          const fallbackProfile =
            currentProfile ??
            buildOfflineProfileSeed(session.user, {
              onboarding_completed:
                bootRestoredSessionRef.current ||
                isGuestAuthUser(session.user) ||
                hasCompletedOnboarding,
            });

          setSentryUser(session.user.id);
          setProfile(fallbackProfile);
          setHasResolvedProfile(true);
          setBootstrapError('Tu cuenta se abrió, pero no pudimos sincronizar el perfil completo todavía.');
          captureError(error instanceof Error ? error : new Error(String(error)), {
            action: `RootLayout.onAuthStateChange.${event}`,
          });
        }
      }

      if (event === 'SIGNED_OUT') {
        clearQaBridgeRuntimeMode();
        reset();
        clearSentryUser();
        resetUser();
        queryClient.clear();
        setHasResolvedProfile(true);
      }

      setLoading(false);
      setInitialized(true);
    });

    return () => {
      active = false;
      linkSubscription.remove();
      subscription.unsubscribe();
    };
  }, [
    bootstrapAttempt,
    handleIncomingUrl,
    hydrateProfile,
    reset,
    restorePersistedSessionFromStorage,
    setHasResolvedProfile,
    setInitialized,
    setLoading,
    setProfile,
    setSession,
    setUser,
  ]);

  useEffect(() => {
    setI18nLanguage(language);
  }, [language]);

  useEffect(() => {
    applyRuntimeColorScheme(resolvedColorScheme);
  }, [resolvedColorScheme]);

  useEffect(() => {
    applyGlobalTextScaling(getTextScaleMultiplier(textScale));
  }, [textScale]);

  useEffect(() => {
    let active = true;
    void NetInfo.fetch().then((state) => {
      if (!active) return;
      setIsOnline(state.isConnected === true && state.isInternetReachable !== false);
    });

    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsOnline(state.isConnected === true && state.isInternetReachable !== false);
    });

    return () => {
      active = false;
      unsubscribe();
    };
  }, [setIsOnline]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextState) => {
      const previousState = appStateRef.current;
      appStateRef.current = nextState;

      if (!biometricUnlockEnabled) return;
      if ((previousState === 'background' || previousState === 'inactive') && nextState === 'active') {
        const {
          session,
          isInitialized,
        } = useAuthStore.getState();

        if (!isInitialized || !session?.user) return;
        setBiometricLocked(true);
        void unlockWithBiometrics();
      }
    });

    return () => subscription.remove();
  }, [biometricUnlockEnabled, unlockWithBiometrics]);

  useEffect(() => {
    if (!biometricUnlockEnabled) {
      setBiometricLocked(false);
      setBiometricError(null);
      return;
    }

    if (!isInitialized || !currentSession?.user) {
      setBiometricLocked(false);
      return;
    }

    if (!bootRestoredSessionRef.current) return;

    setBiometricLocked(true);
    void unlockWithBiometrics();
    bootRestoredSessionRef.current = false;
  }, [biometricUnlockEnabled, currentSession?.user?.id, isInitialized, unlockWithBiometrics]);

  useEffect(() => {
    const userId = currentSession?.user?.id;
    if (!userId) return;

    let cancelled = false;

    const bindWorkoutOwner = async () => {
      await Promise.resolve(useWorkoutStore.persist.rehydrate()).catch((e) => {
        console.debug?.('[RootLayout] rehydrate workout store failed', e);
      });
      if (cancelled) return;
      useWorkoutStore.getState().bindOwner(userId);
    };

    void bindWorkoutOwner();

    return () => {
      cancelled = true;
    };
  }, [currentSession?.user?.id]);

  useEffect(() => {
    if (fontsLoaded) {
      setFontLoadTimedOut(false);
      return undefined;
    }

    const timer = setTimeout(() => {
      setFontLoadTimedOut(true);
      console.warn('[Vyra] Inter font load timeout; rendering with fallback fonts.');
    }, FONT_LOAD_TIMEOUT_MS);

    return () => clearTimeout(timer);
  }, [fontsLoaded]);

  useEffect(() => {
    if (!canRenderApp || splashHiddenRef.current) {
      return undefined;
    }

    const timer = setTimeout(() => {
      handleRootLayout();
    }, 250);

    return () => clearTimeout(timer);
  }, [canRenderApp, handleRootLayout]);

  if (!canRenderApp) {
    return null;
  }

  return (
    <GestureHandlerRootView onLayout={handleRootLayout} style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <StatusBar
            style={resolvedColorScheme === 'dark' ? 'light' : 'dark'}
            backgroundColor={Colors.bgPrimary}
          />

          {shouldGatePublicStackWithBackendHealth ? (
            <BackendHealthGate>
              <Stack
                screenOptions={{
                  headerShown: false,
                  contentStyle: { backgroundColor: Colors.bgPrimary },
                  animation: 'fade_from_bottom',
                  animationDuration: 200,
                }}
              >
                <Stack.Screen name="(auth)" options={{ animation: 'fade' }} />
                <Stack.Screen name="(tabs)" options={{ animation: 'fade' }} />
                <Stack.Screen name="+not-found" />
              </Stack>
            </BackendHealthGate>
          ) : (
            <Stack
              screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: Colors.bgPrimary },
                animation: 'fade_from_bottom',
                animationDuration: 200,
              }}
            >
              <Stack.Screen name="(auth)" options={{ animation: 'fade' }} />
              <Stack.Screen name="(tabs)" options={{ animation: 'fade' }} />
              <Stack.Screen name="+not-found" />
            </Stack>
          )}

          <NotificationsBootstrap />
          <AdsBootstrap />
          <StreakBootstrap />
          <Toast />

          {bootstrapError ? (
            <View pointerEvents="box-none" style={styles.bootstrapBannerWrap}>
              <View style={styles.bootstrapBanner}>
                <View style={styles.bootstrapCopy}>
                  <Text style={styles.bootstrapTitle}>Sesión con sincronización parcial</Text>
                  <Text style={styles.bootstrapBody}>{bootstrapError}</Text>
                </View>
                <Pressable
                  onPress={() => setBootstrapAttempt((value) => value + 1)}
                  style={styles.bootstrapButton}
                  accessibilityRole="button"
                  accessibilityLabel="Reintentar sincronizacion parcial"
                  accessibilityHint="Intenta recuperar la sesion o los datos remotos pendientes."
                  hitSlop={10}
                >
                  <Text style={styles.bootstrapButtonText}>Reintentar</Text>
                </Pressable>
              </View>
            </View>
          ) : null}

          {biometricLocked ? (
            <View style={styles.biometricOverlay}>
              <View style={styles.biometricCard}>
                <Text style={styles.biometricEyebrow}>Sesión protegida</Text>
                <Text style={styles.biometricTitle}>Reabre Vyra con tu biometria</Text>
                <Text style={styles.biometricBody}>
                  {biometricError ?? 'Validamos tu identidad antes de mostrar tus datos personales.'}
                </Text>
                <View style={styles.biometricActions}>
                  <Pressable
                    onPress={() => {
                      void unlockWithBiometrics();
                    }}
                    style={styles.biometricPrimaryButton}
                    accessibilityRole="button"
                    accessibilityLabel="Desbloquear Vyra"
                    accessibilityHint="Pide biometria para volver a mostrar tus datos."
                    accessibilityState={{ busy: biometricPromptRunning }}
                    hitSlop={10}
                  >
                    <Text style={styles.biometricPrimaryText}>
                      {biometricPromptRunning ? 'Verificando...' : 'Desbloquear'}
                    </Text>
                  </Pressable>
                  <Pressable
                    onPress={() => {
                      void signOut();
                      setBiometricLocked(false);
                    }}
                    style={styles.biometricSecondaryButton}
                    accessibilityRole="button"
                    accessibilityLabel="Cerrar sesion protegida"
                    accessibilityHint="Cierra la sesion actual sin desbloquear la app."
                    hitSlop={10}
                  >
                    <Text style={styles.biometricSecondaryText}>Cerrar sesión</Text>
                  </Pressable>
                </View>
              </View>
            </View>
          ) : null}
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  bootstrapBannerWrap: {
    position: 'absolute',
    left: Spacing[4],
    right: Spacing[4],
    bottom: Spacing[6],
  },
  bootstrapBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[3],
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: `${Colors.warning}45`,
    backgroundColor: Colors.bgSurface,
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[3],
  },
  bootstrapCopy: {
    flex: 1,
  },
  bootstrapTitle: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.sm,
    color: Colors.textPrimary,
  },
  bootstrapBody: {
    marginTop: 2,
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    lineHeight: 18,
    color: Colors.textSecondary,
  },
  bootstrapButton: {
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: `${Colors.brand}35`,
    backgroundColor: `${Colors.brand}16`,
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[2],
  },
  bootstrapButtonText: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.xs,
    color: Colors.brand,
  },
  biometricOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(5, 10, 18, 0.92)',
    paddingHorizontal: Spacing[5],
  },
  biometricCard: {
    width: '100%',
    maxWidth: 360,
    borderRadius: Radius['2xl'],
    borderWidth: 1,
    borderColor: `${Colors.brand}25`,
    backgroundColor: Colors.bgSurface,
    padding: Spacing[5],
    gap: Spacing[3],
  },
  biometricEyebrow: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.xs,
    color: Colors.brand,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  biometricTitle: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.xl,
    color: Colors.textPrimary,
  },
  biometricBody: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    lineHeight: 20,
    color: Colors.textSecondary,
  },
  biometricActions: {
    gap: Spacing[2],
    marginTop: Spacing[1],
  },
  biometricPrimaryButton: {
    minHeight: 48,
    borderRadius: Radius.full,
    backgroundColor: Colors.brand,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing[4],
  },
  biometricPrimaryText: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.sm,
    color: Colors.white,
  },
  biometricSecondaryButton: {
    minHeight: 44,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: `${Colors.border}90`,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing[4],
  },
  biometricSecondaryText: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
});
