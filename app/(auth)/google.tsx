import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Platform, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import SafeScreen from '@/components/ui/SafeScreen';
import Header from '@/components/layout/Header';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { supabase } from '@/lib/supabase';
import { Colors, withOpacity } from '@/constants/colors';
import { Routes } from '@/constants/routes';
import { FontFamily, FontSize, Radius, Spacing } from '@/constants/theme';
import { captureError } from '@/lib/sentry';
import { isGuestAuthUser } from '@/lib/guest-auth';
import {
  parseAuthCallbackUrl,
  resolvePostAuthRouteFromCurrentUser,
} from '@/lib/auth-session';

WebBrowser.maybeCompleteAuthSession();

function buildGoogleErrorMessage(callbackUrl: string) {
  try {
    const parsed = parseAuthCallbackUrl(callbackUrl);
    const description = parsed.errorDescription ?? parsed.error;

    if (description) {
      if (/disallowed_useragent|use secure browsers|secure browser/i.test(description)) {
        return 'Google bloqueó el acceso dentro del contenedor actual. Reabre el login y continúa en el navegador del sistema.';
      }

      return description.replace(/\+/g, ' ');
    }
  } catch {
    // ignore malformed callback payloads
  }

  return 'Google no devolvió un resultado válido.';
}

export default function GoogleAuthScreen() {
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [statusText, setStatusText] = useState('Preparando acceso seguro...');
  const handledCallbackRef = useRef<string | null>(null);

  const redirectTo = useMemo(() => Linking.createURL('auth-callback', { scheme: 'vyrafitness' }), []);

  const resolveNextRoute = useCallback(async () => {
    const destination = await resolvePostAuthRouteFromCurrentUser();
    router.replace(destination.route as never);
  }, []);

  const exchangeCallback = useCallback(
    async (callbackUrl: string) => {
      if (handledCallbackRef.current === callbackUrl) return;
      handledCallbackRef.current = callbackUrl;

      setLoading(true);
      setErrorMsg(null);
      setStatusText('Confirmando tu cuenta en Vyra...');

      try {
        const parsed = parseAuthCallbackUrl(callbackUrl);
        const callbackError = parsed.errorDescription ?? parsed.error;

        if (callbackError) {
          throw new Error(buildGoogleErrorMessage(callbackUrl));
        }

        if (parsed.accessToken && parsed.refreshToken) {
          const { error } = await supabase.auth.setSession({
            access_token: parsed.accessToken,
            refresh_token: parsed.refreshToken,
          });
          if (error) throw error;

          await resolveNextRoute();
          return;
        }

        if (parsed.code) {
          const { error } = await supabase.auth.exchangeCodeForSession(parsed.code);
          if (error) throw error;

          await resolveNextRoute();
          return;
        }

        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session?.user) {
          await resolveNextRoute();
          return;
        }

        throw new Error('Google volvió sin código ni tokens de sesión.');
      } catch (err) {
        handledCallbackRef.current = null;
        captureError(err instanceof Error ? err : new Error(String(err)), {
          action: 'GoogleAuthScreen.exchange',
        });
        setErrorMsg(
          err instanceof Error && err.message
            ? err.message
            : 'No pudimos confirmar la sesión con Google. Intenta otra vez.',
        );
        setStatusText('No pudimos completar el acceso.');
        setLoading(false);
      }
    },
    [resolveNextRoute],
  );

  const startGoogleFlow = useCallback(async () => {
    const {
      data: { session: currentSession },
    } = await supabase.auth.getSession();

    if (isGuestAuthUser(currentSession?.user ?? null)) {
      return supabase.auth.linkIdentity({
        provider: 'google',
        options: {
          redirectTo,
          skipBrowserRedirect: true,
          queryParams: {
            prompt: 'select_account',
            access_type: 'offline',
          },
        },
      });
    }

    return supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo,
        skipBrowserRedirect: true,
        queryParams: {
          prompt: 'select_account',
          access_type: 'offline',
        },
      },
    });
  }, [redirectTo]);

  useEffect(() => {
    let active = true;

    const handleUrlEvent = ({ url }: { url: string }) => {
      if (!active) return;
      if (!url.startsWith(redirectTo) && !url.startsWith('vyrafitness://auth-callback')) return;
      void exchangeCallback(url);
    };

    const bootstrap = async () => {
      setLoading(true);
      setErrorMsg(null);
      setStatusText(
        Platform.OS === 'android'
          ? 'Abriendo Google en el navegador del sistema...'
          : 'Abriendo selector de cuentas de Google...',
      );

      try {
        const { data, error } = await startGoogleFlow();

        if (!active) return;
        if (error || !data.url) {
          throw error ?? new Error('No se pudo iniciar Google.');
        }

        if (Platform.OS === 'android') {
          await Linking.openURL(data.url);
          if (!active) return;
          setStatusText('Google se abrió en tu navegador. Vyra retomará el acceso cuando vuelvas desde allí.');
          return;
        }

        const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
        if (!active) return;

        if (result.type === 'success' && result.url) {
          await exchangeCallback(result.url);
          return;
        }

        if (result.type === 'cancel' || result.type === 'dismiss') {
          setErrorMsg('Cancelaste el acceso con Google antes de elegir una cuenta.');
          setStatusText('Google no terminó el acceso.');
          setLoading(false);
          return;
        }

        throw new Error('Google no pudo completar la autenticación.');
      } catch (err) {
        if (!active) return;
        captureError(err instanceof Error ? err : new Error(String(err)), {
          action: 'GoogleAuthScreen.bootstrap',
        });
        setErrorMsg(
          err instanceof Error && err.message
            ? err.message
            : 'No pudimos abrir Google. Intenta de nuevo en unos segundos.',
        );
        setStatusText('No pudimos abrir Google.');
        setLoading(false);
      }
    };

    const subscription = Linking.addEventListener('url', handleUrlEvent);
    void bootstrap();

    return () => {
      active = false;
      subscription.remove();
    };
  }, [exchangeCallback, redirectTo, startGoogleFlow]);

  return (
    <SafeScreen padHorizontal={false} padBottom>
      <Header title="Continuar con Google" subtitle="Acceso rápido y seguro a tu cuenta" showBack color={Colors.brand} />

      <View style={styles.container}>
        <Card style={styles.heroCard} accentColor={Colors.brand}>
          <View style={styles.heroTop}>
            <View style={styles.iconWrap}>
              <Ionicons name="logo-google" size={18} color={Colors.white} />
            </View>
            <View style={styles.heroCopy}>
              <Text style={styles.heroTitle}>Google y cuenta invitada</Text>
              <Text style={styles.heroText}>
                Si estabas usando Vyra como invitado, Google se vincula sin perder tu progreso. Si no, simplemente abre tu sesión normal.
              </Text>
            </View>
          </View>

          <View style={styles.statusRow}>
            <ActivityIndicator color={Colors.brand} animating={loading} />
            <Text style={styles.statusText}>{statusText}</Text>
          </View>

          {errorMsg ? (
            <View style={styles.errorCard}>
              <Text style={styles.errorTitle}>Error de acceso</Text>
              <Text style={styles.errorBody}>{errorMsg}</Text>
              <View style={styles.errorActions}>
                <Button variant="secondary" size="sm" onPress={() => router.replace(Routes.auth.google as never)}>
                  Reintentar Google
                </Button>
                <Button variant="ghost" size="sm" onPress={() => router.replace(Routes.auth.login as never)}>
                  Usar email
                </Button>
              </View>
            </View>
          ) : null}
        </Card>

        <Card style={styles.hintCard} shadow={false}>
          <Text style={styles.hintTitle}>Qué deberías ver ahora</Text>
          <Text style={styles.hintBody}>
            Google te mostrará el selector de cuentas o la pantalla oficial en el navegador del sistema. Cuando termines, Vyra vuelve sola y confirma la sesión.
          </Text>
        </Card>
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
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[3],
    minHeight: 24,
  },
  statusText: {
    flex: 1,
    fontFamily: FontFamily.medium,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  errorCard: {
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: withOpacity(Colors.error, 0.22),
    backgroundColor: withOpacity(Colors.error, 0.12),
    padding: Spacing[4],
    gap: Spacing[3],
  },
  errorTitle: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.sm,
    color: Colors.textPrimary,
  },
  errorBody: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    lineHeight: 20,
    color: Colors.textSecondary,
  },
  errorActions: {
    flexDirection: 'row',
    gap: Spacing[2],
  },
  hintCard: {
    gap: Spacing[2],
    borderRadius: Radius['2xl'],
    backgroundColor: withOpacity(Colors.surface2, 0.82),
  },
  hintTitle: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.sm,
    color: Colors.textPrimary,
  },
  hintBody: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    lineHeight: 20,
    color: Colors.textSecondary,
  },
});
