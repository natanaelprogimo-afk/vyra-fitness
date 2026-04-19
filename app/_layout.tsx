// ============================================================
// VYRA FITNESS - Root Layout
// Auth guard, providers, servicios globales y bootstrap
// ============================================================

import { useCallback, useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import * as Linking from 'expo-linking';
import * as SplashScreen from 'expo-splash-screen';
import { router, Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useFonts } from 'expo-font';
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  Inter_800ExtraBold,
} from '@expo-google-fonts/inter';
import { JetBrainsMono_600SemiBold } from '@expo-google-fonts/jetbrains-mono';
import { useAuthStore } from '@/stores/authStore';
import { useUIStore } from '@/stores/uiStore';
import { supabase } from '@/lib/supabase';
import {
  clearSentryUser,
  captureError,
  initSentry,
  setSentryUser,
} from '@/lib/sentry';
import { identifyUser, resetUser } from '@/lib/analytics';
import { Colors } from '@/constants/colors';
import { FontFamily, FontSize, Radius, Spacing } from '@/constants/theme';
import Toast from '@/components/ui/Toast';
import NotificationsBootstrap from '@/components/system/NotificationsBootstrap';
import StreakBootstrap from '@/components/system/StreakBootstrap';
import NetInfo from '@/shims/netinfo';
import {
  armQaBridgeRuntimeMode,
  buildQaBridgeProfileSeed,
  clearQaBridgeRuntimeMode,
  consumeQaBridgeSignedOutBypass,
  extractQaBridgePayload,
  isQaBridgeRuntimeModeEnabled,
  setQaBridgePayload,
} from '@/lib/qa-auth-bridge';
import type { Session } from '@supabase/supabase-js';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 30 * 1000,
      gcTime: 5 * 60 * 1000,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 1,
    },
  },
});

initSentry();
void SplashScreen.preventAutoHideAsync().catch(() => {});
const FONT_LOAD_TIMEOUT_MS = 1500;

export default function RootLayout() {
  const {
    setSession,
    setUser,
    setProfile,
    setLoading,
    setInitialized,
    setHasResolvedProfile,
    reset,
  } = useAuthStore();
  const [bootstrapError, setBootstrapError] = useState<string | null>(null);
  const [bootstrapAttempt, setBootstrapAttempt] = useState(0);
  const [fontLoadTimedOut, setFontLoadTimedOut] = useState(false);
  const splashHiddenRef = useRef(false);
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    Inter_800ExtraBold,
    JetBrainsMono_600SemiBold,
  });

  const setIsOnline = useUIStore((s) => s.setIsOnline);
  const canRenderApp = fontsLoaded || fontLoadTimedOut;
  const handleRootLayout = useCallback(() => {
    if (!canRenderApp || splashHiddenRef.current) return;
    splashHiddenRef.current = true;
    requestAnimationFrame(() => {
      void SplashScreen.hideAsync().catch(() => {});
    });
  }, [canRenderApp]);

  const handleIncomingUrl = useCallback((url: string | null | undefined) => {
    if (!url) return;

    if (__DEV__) {
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

    try {
      const parsed = new URL(url);
      const normalizedPath = `${parsed.host || ''}${parsed.pathname || ''}`.replace(/^\/+|\/+$/g, '');
      if (normalizedPath === 'reset-password') {
        router.replace('/reset-password' as never);
      }
    } catch {
      if (url.includes('reset-password')) {
        router.replace('/reset-password' as never);
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

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .maybeSingle();

    if (error) throw error;

    setSentryUser(session.user.id);

    if (profile) {
      const resolvedProfile =
        __DEV__ && isQaBridgeRuntimeModeEnabled() && !profile.onboarding_completed
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
      if (__DEV__ && isQaBridgeRuntimeModeEnabled()) {
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
        setProfile(null);
      }
      identifyUser(session.user.id, {
        is_premium: false,
      });
    }

    setHasResolvedProfile(true);
  }, [setHasResolvedProfile, setProfile]);

  useEffect(() => {
    let active = true;

    const bootstrapAuth = async () => {
      setBootstrapError(null);
      setLoading(true);

      try {
        const initialUrl = await Linking.getInitialURL().catch(() => null);
        handleIncomingUrl(initialUrl);

        const { data: { session } } = await supabase.auth.getSession();
        if (!active) return;

        setSession(session);
        setUser(session?.user ?? null);
        await hydrateProfile(session);
      } catch (error) {
        if (!active) return;
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
        router.replace('/reset-password' as never);
      }

      if (session?.user) {
        try {
          await hydrateProfile(session);
        } catch (error) {
          setProfile(null);
          setHasResolvedProfile(true);
          setBootstrapError('Tu cuenta se abrio, pero no pudimos sincronizar el perfil completo todavía.');
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
    setHasResolvedProfile,
    setInitialized,
    setLoading,
    setProfile,
    setSession,
    setUser,
  ]);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsOnline(state.isConnected === true && state.isInternetReachable !== false);
    });
    return unsubscribe;
  }, [setIsOnline]);

  useEffect(() => {
    if (fontsLoaded) {
      setFontLoadTimedOut(false);
      return undefined;
    }

    const timer = setTimeout(() => {
      setFontLoadTimedOut(true);
      captureError(new Error('Inter font load timeout; rendering with fallback fonts.'), {
        action: 'RootLayout.fontLoadTimeout',
      });
    }, FONT_LOAD_TIMEOUT_MS);

    return () => clearTimeout(timer);
  }, [fontsLoaded]);

  if (!canRenderApp) {
    return null;
  }

  return (
    <GestureHandlerRootView onLayout={handleRootLayout} style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <StatusBar style="light" backgroundColor={Colors.bgPrimary} />

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

          <NotificationsBootstrap />
          <StreakBootstrap />
          <Toast />

          {bootstrapError ? (
            <View pointerEvents="box-none" style={styles.bootstrapBannerWrap}>
              <View style={styles.bootstrapBanner}>
                <View style={styles.bootstrapCopy}>
                  <Text style={styles.bootstrapTitle}>Sesion con sync parcial</Text>
                  <Text style={styles.bootstrapBody}>{bootstrapError}</Text>
                </View>
                <Pressable
                  onPress={() => setBootstrapAttempt((value) => value + 1)}
                  style={styles.bootstrapButton}
                >
                  <Text style={styles.bootstrapButtonText}>Reintentar</Text>
                </Pressable>
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
});
