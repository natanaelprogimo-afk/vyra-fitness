// ============================================================
// VYRA FITNESS — Root Layout
// Auth guard, providers, inicialización de servicios, toasts
// ============================================================

import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuthStore } from '@/stores/authStore';
import { useUIStore } from '@/stores/uiStore';
import { useAdsStore } from '@/stores/adsStore';
import { supabase } from '@/lib/supabase';
import { initSentry, setSentryUser, clearSentryUser } from '@/lib/sentry';
import { identifyUser, resetUser } from '@/lib/analytics';
import { Colors } from '@/constants/colors';
import Toast from '@/components/ui/Toast';
import AchievementModal from '@/components/ui/AchievementModal';
import OfflineNotice from '@/components/layout/OfflineNotice';
import NetInfo from '@/shims/netinfo';

// QueryClient global
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry:              2,
      staleTime:          30 * 1000,      // 30s
      gcTime:             5 * 60 * 1000,  // 5min
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 1,
    },
  },
});

// ─── Inicialización única ────────────────────────────────────
initSentry();

export default function RootLayout() {
  const {
    setSession, setUser, setProfile,
    setLoading, setInitialized, reset,
  } = useAuthStore();

  const setIsOnline   = useUIStore((s) => s.setIsOnline);
  const setAdsPremium = useAdsStore((s) => s.setIsPremium);

  // ─── Auth listener ────────────────────────────────────────
  useEffect(() => {
    // Obtener sesión inicial
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        // Cargar perfil
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (profile) {
          setProfile(profile);
          setSentryUser(session.user.id);
          identifyUser(session.user.id, {
            is_premium: profile.is_premium,
            level:      profile.level,
          });
          setAdsPremium(profile.is_premium);
        }
      }

      setLoading(false);
      setInitialized(true);
    });

    // Escuchar cambios de auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);

        if (event === 'SIGNED_IN' && session?.user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

          if (profile) {
            setProfile(profile);
            setSentryUser(session.user.id);
            identifyUser(session.user.id, { is_premium: profile.is_premium });
            setAdsPremium(profile.is_premium);
          }
        }

        if (event === 'SIGNED_OUT') {
          reset();
          clearSentryUser();
          resetUser();
          setAdsPremium(false);
          queryClient.clear();
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // ─── Monitorear conexión a internet ──────────────────────
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsOnline(state.isConnected === true && state.isInternetReachable !== false);
    });
    return unsubscribe;
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <StatusBar style="light" backgroundColor={Colors.bgPrimary} />

          {/* Navegación */}
          <Stack
            screenOptions={{
              headerShown:         false,
              contentStyle:        { backgroundColor: Colors.bgPrimary },
              animation:           'fade_from_bottom',
              animationDuration:   200,
            }}
          >
            <Stack.Screen name="(auth)"  options={{ animation: 'fade' }} />
            <Stack.Screen name="(tabs)"  options={{ animation: 'fade' }} />
            <Stack.Screen name="+not-found" />
          </Stack>

          {/* Sistema global de UI */}
          <OfflineNotice />
          <Toast />
          <AchievementModal />
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}