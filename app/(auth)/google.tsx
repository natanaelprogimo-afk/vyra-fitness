import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { WebView } from 'react-native-webview';
import * as Linking from 'expo-linking';
import SafeScreen from '@/components/ui/SafeScreen';
import Header from '@/components/layout/Header';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { supabase } from '@/lib/supabase';
import { Colors, withOpacity } from '@/constants/colors';
import { Routes } from '@/constants/routes';
import { FontFamily, FontSize, Radius, Spacing } from '@/constants/theme';
import { captureError } from '@/lib/sentry';
import { clearOnboardingProgress, saveOnboardingProgress } from '@/lib/onboarding-storage';

export default function GoogleAuthScreen() {
  const [authUrl, setAuthUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const redirectTo = useMemo(() => Linking.createURL('auth-callback', { scheme: 'vyrafitness' }), []);

  useEffect(() => {
    let active = true;
    const bootstrap = async () => {
      setLoading(true);
      setErrorMsg(null);
      try {
        const { data, error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo,
            skipBrowserRedirect: true,
          },
        });
        if (!active) return;
        if (error || !data.url) throw error ?? new Error('No se pudo iniciar Google.');
        setAuthUrl(data.url);
      } catch (err) {
        if (!active) return;
        captureError(err instanceof Error ? err : new Error(String(err)), { action: 'GoogleAuthScreen.bootstrap' });
        setErrorMsg('No pudimos abrir Google. Intenta de nuevo en unos segundos.');
      } finally {
        if (active) setLoading(false);
      }
    };

    void bootstrap();
    return () => {
      active = false;
    };
  }, [redirectTo]);

  const handleNavigation = useCallback(
    async (navState: { url: string }) => {
      const url = navState.url;
      if (!url) return;
      if (!url.startsWith(redirectTo) && !url.startsWith('vyrafitness://auth-callback')) return;
      setLoading(true);
      try {
        const { error } = await supabase.auth.exchangeCodeForSession(url);
        if (error) throw error;
        const { data: userResult } = await supabase.auth.getUser();
        const seedUser = userResult.user;
        const seedName =
          (typeof seedUser?.user_metadata?.name === 'string' && seedUser.user_metadata.name.trim()) ||
          (typeof seedUser?.user_metadata?.full_name === 'string' && seedUser.user_metadata.full_name.trim()) ||
          seedUser?.email?.split('@')[0] ||
          'Usuario';
        await clearOnboardingProgress();
        await saveOnboardingProgress(Routes.auth.onboarding.goals, {
          name: seedName,
          email: seedUser?.email ?? '',
        });
        router.replace(Routes.auth.onboarding.goals as any);
      } catch (err) {
        captureError(err instanceof Error ? err : new Error(String(err)), { action: 'GoogleAuthScreen.exchange' });
        setErrorMsg('No pudimos confirmar la sesion. Intenta otra vez.');
      } finally {
        setLoading(false);
      }
    },
    [redirectTo],
  );

  return (
    <SafeScreen padHorizontal={false} padBottom>
      <Header title="Continuar con Google" subtitle="Acceso rapido y seguro a tu cuenta" showBack color={Colors.brand} />
      <View style={styles.container}>
        <Card style={styles.heroCard} accentColor={Colors.brand}>
          <View style={styles.heroTop}>
            <View style={styles.iconWrap}>
              <Ionicons name="logo-google" size={18} color={Colors.white} />
            </View>
            <View style={styles.heroCopy}>
              <Text style={styles.heroTitle}>Conectando tu acceso</Text>
              <Text style={styles.heroText}>Abriremos Google dentro de una vista segura y al terminar volveras directo a VYRA.</Text>
            </View>
          </View>

          {errorMsg ? (
            <View style={styles.errorCard}>
              <Text style={styles.errorTitle}>Error de acceso</Text>
              <Text style={styles.errorBody}>{errorMsg}</Text>
              <Button variant="secondary" size="sm" onPress={() => router.replace(Routes.auth.google as any)}>
                Reintentar
              </Button>
            </View>
          ) : null}
        </Card>

        <View style={styles.webviewShell}>
          {authUrl ? (
            <WebView
              source={{ uri: authUrl }}
              onNavigationStateChange={handleNavigation}
              startInLoadingState
              renderLoading={() => (
                <View style={styles.loader}>
                  <ActivityIndicator color={Colors.brand} />
                  <Text style={styles.loaderText}>Conectando con Google...</Text>
                </View>
              )}
            />
          ) : (
            <View style={styles.loader}>
              <ActivityIndicator color={Colors.brand} />
              <Text style={styles.loaderText}>{loading ? 'Preparando acceso...' : 'Esperando confirmacion...'}</Text>
            </View>
          )}
        </View>
      </View>
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: Spacing[5],
    paddingTop: Spacing[4],
    paddingBottom: Spacing[6],
    gap: Spacing[4],
  },
  heroCard: {
    gap: Spacing[3],
  },
  heroTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[3],
  },
  iconWrap: {
    width: 42,
    height: 42,
    borderRadius: Radius.xl,
    backgroundColor: Colors.brand,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroCopy: {
    flex: 1,
    gap: Spacing[1],
  },
  heroTitle: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.base,
    color: Colors.textPrimary,
  },
  heroText: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    lineHeight: 20,
    color: Colors.textSecondary,
  },
  webviewShell: {
    flex: 1,
    overflow: 'hidden',
    borderRadius: Radius['2xl'],
    borderWidth: 1,
    borderColor: withOpacity(Colors.white, 0.08),
    backgroundColor: Colors.surface1,
  },
  loader: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing[2],
  },
  loaderText: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.sm,
    color: Colors.textMuted,
  },
  errorCard: {
    gap: Spacing[2],
    padding: Spacing[4],
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: withOpacity(Colors.error, 0.28),
    backgroundColor: withOpacity(Colors.error, 0.1),
  },
  errorTitle: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.sm,
    color: Colors.textPrimary,
  },
  errorBody: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
});
