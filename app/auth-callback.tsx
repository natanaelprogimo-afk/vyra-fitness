import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import * as Linking from 'expo-linking';
import SafeScreen from '@/components/ui/SafeScreen';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { Colors } from '@/constants/colors';
import { Routes } from '@/constants/routes';
import { FontFamily, FontSize, Radius, Spacing } from '@/constants/theme';
import { supabase } from '@/lib/supabase';
import {
  parseAuthCallbackUrl,
  resolvePostAuthRouteFromCurrentUser,
} from '@/lib/auth-session';
import { captureError } from '@/lib/sentry';

type CallbackParams = {
  code?: string | string[];
  error?: string | string[];
  error_description?: string | string[];
};

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? (value[0] ?? null) : (value ?? null);
}

export default function AuthCallbackScreen() {
  const params = useLocalSearchParams<CallbackParams>();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const finalize = async () => {
      try {
        const rawUrl = await Linking.getInitialURL().catch((e) => {
          console.debug?.('[AuthCallback] Linking.getInitialURL failed', e);
          return null;
        });
        const parsedUrl = parseAuthCallbackUrl(rawUrl);
        const callbackError =
          firstParam(params.error_description) ??
          firstParam(params.error) ??
          parsedUrl.errorDescription ??
          parsedUrl.error;

        if (callbackError) {
          throw new Error(callbackError.replace(/\+/g, ' '));
        }

        if (parsedUrl.accessToken && parsedUrl.refreshToken) {
          const { error } = await supabase.auth.setSession({
            access_token: parsedUrl.accessToken,
            refresh_token: parsedUrl.refreshToken,
          });
          if (error) throw error;

          const destination = await resolvePostAuthRouteFromCurrentUser();
          router.replace(destination.route as never);
          return;
        }

        const code = firstParam(params.code) ?? parsedUrl.code;
        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) throw error;

          const destination = await resolvePostAuthRouteFromCurrentUser();
          router.replace(destination.route as never);
          return;
        }

        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session?.user) {
          const destination = await resolvePostAuthRouteFromCurrentUser();
          router.replace(destination.route as never);
          return;
        }

        throw new Error('El proveedor no devolvió datos de sesión válidos.');
      } catch (err) {
        if (!active) return;
        captureError(err instanceof Error ? err : new Error(String(err)), {
          action: 'AuthCallbackScreen.finalize',
        });
        setErrorMsg(
          err instanceof Error && err.message
            ? err.message
            : 'No pudimos completar el acceso.',
        );
      }
    };

    void finalize();

    return () => {
      active = false;
    };
  }, [params.code, params.error, params.error_description]);

  return (
    <SafeScreen>
      <View style={styles.container}>
        <Card style={styles.card} accentColor={Colors.brand}>
          {errorMsg ? (
            <>
              <Text style={styles.title}>No pudimos cerrar el acceso</Text>
              <Text style={styles.body}>{errorMsg}</Text>
              <View style={styles.actions}>
                <Button onPress={() => router.replace(Routes.auth.google as never)} variant="secondary">
                  Probar Google
                </Button>
                <Button onPress={() => router.replace(Routes.auth.apple as never)} variant="secondary">
                  Probar Apple
                </Button>
                <Button onPress={() => router.replace(Routes.auth.login as never)} variant="ghost">
                  Volver
                </Button>
              </View>
            </>
          ) : (
            <>
              <ActivityIndicator color={Colors.brand} />
              <Text style={styles.title}>Cerrando acceso</Text>
              <Text style={styles.body}>
                Estamos confirmando tu sesión y preparando tu cuenta.
              </Text>
            </>
          )}
        </Card>
      </View>
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing[5],
  },
  card: {
    width: '100%',
    gap: Spacing[3],
    borderRadius: Radius['2xl'],
  },
  title: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.base,
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  body: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    lineHeight: 20,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  actions: {
    gap: Spacing[2],
  },
});
