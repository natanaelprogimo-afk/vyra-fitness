import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as Linking from 'expo-linking';
import { useTranslation } from 'react-i18next';
import SafeScreen from '@/components/ui/SafeScreen';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';
import { Colors, withOpacity } from '@/constants/colors';
import { FontFamily, FontSize, Spacing } from '@/constants/theme';
import {
  armPasswordRecoveryFlow,
  clearPasswordRecoveryFlow,
  consumePasswordRecoveryUrl,
  setPasswordRecoveryUrl,
} from '@/lib/password-recovery';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';
import { resolveSupportedLanguage } from '@/lib/language';

const SCREEN_COPY = {
  es: {
    checks: ['8+ caracteres', 'Coinciden'] as const,
    validating: 'Validando enlace seguro',
    linkError: 'No pudimos validar el enlace de recuperacion. Pide uno nuevo e intenta otra vez.',
    shortPassword: 'Usa una contrasena de al menos 8 caracteres.',
    mismatch: 'Las contrasenas tienen que coincidir.',
    saveFailed: 'No pudimos actualizar la contrasena. Vuelve a abrir el enlace del email e intenta otra vez.',
    completedTitle: 'Listo. Ya puedes iniciar sesion.',
    completedBody: 'Tu nueva contrasena ya quedo guardada.',
    goToLogin: 'Ir a login',
    title: 'Nueva contrasena',
    password: 'Nueva contrasena',
    passwordPlaceholder: 'Minimo 8 caracteres',
    confirmPassword: 'Confirmar contrasena',
    confirmPasswordPlaceholder: 'Repite la contrasena',
    save: 'Guardar contrasena',
    reopenTitle: 'Vuelve a abrir el enlace del email',
    reopenBody:
      'Necesitamos que entres desde el link de recuperacion para poder cambiar la contrasena.',
    requestLink: 'Pedir un nuevo link',
  },
  en: {
    checks: ['8+ characters', 'Passwords match'] as const,
    validating: 'Validating secure link',
    linkError: 'We could not validate the recovery link. Request a new one and try again.',
    shortPassword: 'Use a password with at least 8 characters.',
    mismatch: 'Passwords must match.',
    saveFailed: 'We could not update the password. Open the email link again and try once more.',
    completedTitle: 'Done. You can sign in now.',
    completedBody: 'Your new password is already saved.',
    goToLogin: 'Go to login',
    title: 'New password',
    password: 'New password',
    passwordPlaceholder: 'Minimum 8 characters',
    confirmPassword: 'Confirm password',
    confirmPasswordPlaceholder: 'Repeat the password',
    save: 'Save password',
    reopenTitle: 'Open the email link again',
    reopenBody:
      'We need you to enter from the recovery link so we can change the password.',
    requestLink: 'Request a new link',
  },
  pt: {
    checks: ['8+ caracteres', 'As senhas coincidem'] as const,
    validating: 'Validando link seguro',
    linkError: 'Nao conseguimos validar o link de recuperacao. Peca um novo e tente outra vez.',
    shortPassword: 'Use uma senha com pelo menos 8 caracteres.',
    mismatch: 'As senhas precisam coincidir.',
    saveFailed: 'Nao conseguimos atualizar a senha. Abra o link do email novamente e tente outra vez.',
    completedTitle: 'Pronto. Agora voce ja pode entrar.',
    completedBody: 'Sua nova senha ja foi salva.',
    goToLogin: 'Ir para login',
    title: 'Nova senha',
    password: 'Nova senha',
    passwordPlaceholder: 'Minimo de 8 caracteres',
    confirmPassword: 'Confirmar senha',
    confirmPasswordPlaceholder: 'Repita a senha',
    save: 'Salvar senha',
    reopenTitle: 'Abra o link do email novamente',
    reopenBody:
      'Precisamos que voce entre pelo link de recuperacao para poder trocar a senha.',
    requestLink: 'Pedir um novo link',
  },
} as const;

export default function ResetPasswordScreen() {
  const { i18n } = useTranslation();
  const copy = SCREEN_COPY[resolveSupportedLanguage(i18n.resolvedLanguage ?? i18n.language)];
  const session = useAuthStore((state) => state.session);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [hydratingLink, setHydratingLink] = useState(true);
  const [linkError, setLinkError] = useState<string | null>(null);
  const [recoveryAccessToken, setRecoveryAccessToken] = useState<string | null>(null);

  const checks = useMemo(
    () => [
      { label: copy.checks[0], ok: password.trim().length >= 8 },
      { label: copy.checks[1], ok: password.length > 0 && password === confirmPassword },
    ],
    [confirmPassword, copy.checks, password],
  );

  const hasRecoverySession = Boolean(recoveryAccessToken || session?.access_token);

  useEffect(() => {
    armPasswordRecoveryFlow();

    let active = true;

    const parseTokens = (url: string) => {
      const query = url.includes('?') ? (url.split('?')[1]?.split('#')[0] ?? '') : '';
      const fragment = url.includes('#') ? (url.split('#')[1] ?? '') : '';
      const params = new URLSearchParams([query, fragment].filter(Boolean).join('&'));
      return {
        accessToken: params.get('access_token'),
        refreshToken: params.get('refresh_token'),
        type: params.get('type'),
      };
    };

    const hydrateFromUrl = async (url: string | null | undefined) => {
      if (!active) return;
      if (!url) {
        setHydratingLink(false);
        return;
      }

      const { accessToken, refreshToken, type } = parseTokens(url);
      if (!accessToken || !refreshToken || (type && type !== 'recovery')) {
        setHydratingLink(false);
        return;
      }

      setHydratingLink(true);
      setLinkError(null);
      setRecoveryAccessToken(accessToken);
      try {
        const { error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });
        if (error) throw error;
      } catch {
        if (!active) return;
        setLinkError(copy.linkError);
      } finally {
        if (active) setHydratingLink(false);
      }
    };

    const pendingRecoveryUrl = consumePasswordRecoveryUrl();
    if (pendingRecoveryUrl) {
      void hydrateFromUrl(pendingRecoveryUrl);
    } else {
      void Linking.getInitialURL().then(hydrateFromUrl);
    }

    const subscription = Linking.addEventListener('url', ({ url }) => {
      setPasswordRecoveryUrl(url);
      void hydrateFromUrl(url);
    });

    return () => {
      active = false;
      subscription.remove();
      clearPasswordRecoveryFlow();
    };
  }, [copy.linkError]);

  async function handleSave() {
    setSaveError(null);
    if (password.trim().length < 8) {
      setSaveError(copy.shortPassword);
      return;
    }
    if (password !== confirmPassword) {
      setSaveError(copy.mismatch);
      return;
    }

    setSaving(true);
    try {
      const activeAccessToken =
        recoveryAccessToken ??
        session?.access_token ??
        (await supabase.auth.getSession()).data.session?.access_token ??
        null;

      if (!activeAccessToken) throw new Error('missing_recovery_session');

      const response = await fetch(`${process.env.EXPO_PUBLIC_SUPABASE_URL}/auth/v1/user`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          apikey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!,
          Authorization: `Bearer ${activeAccessToken}`,
        },
        body: JSON.stringify({ password: password.trim() }),
      });

      if (!response.ok) throw new Error('password_update_failed');

      await supabase.auth.signOut().catch((e) => {
        console.debug?.('[reset-password] supabase.signOut failed', e);
        return null;
      });
      setCompleted(true);
      setPassword('');
      setConfirmPassword('');
    } catch {
      setSaveError(copy.saveFailed);
    } finally {
      setSaving(false);
    }
  }

  if (completed) {
    return (
      <SafeScreen scrollable padBottom>
        <View style={styles.success}>
          <View style={styles.checkWrap}>
            <MaterialIcons name="check-circle" size={32} color={Colors.success} />
          </View>
          <Text style={styles.successTitle}>{copy.completedTitle}</Text>
          <Text style={styles.successBody}>{copy.completedBody}</Text>
          <Button onPress={() => router.replace('/(auth)/login' as never)} fullWidth size="lg">
            {copy.goToLogin}
          </Button>
        </View>
      </SafeScreen>
    );
  }

  return (
    <SafeScreen scrollable padBottom>
      <View style={styles.hero}>
        <View style={styles.lockWrap}>
          <MaterialIcons name="lock-outline" size={30} color={Colors.brand} />
        </View>
        <Text style={styles.title}>{copy.title}</Text>
      </View>

      {!hasRecoverySession && hydratingLink ? (
        <Card style={styles.infoCard}>
          <ActivityIndicator color={Colors.brand} />
          <Text style={styles.infoTitle}>{copy.validating}</Text>
        </Card>
      ) : hasRecoverySession ? (
        <View style={styles.form}>
          <Input
            label={copy.password}
            value={password}
            onChangeText={(value) => {
              setPassword(value);
              if (saveError) setSaveError(null);
            }}
            secureTextEntry
            autoCapitalize="none"
            placeholder={copy.passwordPlaceholder}
          />
          <Input
            label={copy.confirmPassword}
            value={confirmPassword}
            onChangeText={(value) => {
              setConfirmPassword(value);
              if (saveError) setSaveError(null);
            }}
            secureTextEntry
            autoCapitalize="none"
            placeholder={copy.confirmPasswordPlaceholder}
          />

          <View style={styles.checks}>
            {checks.map((item) => (
              <View key={item.label} style={styles.checkRow}>
                <View style={[styles.dot, item.ok && styles.dotOk]} />
                <Text style={[styles.checkText, item.ok && styles.checkTextOk]}>{item.label}</Text>
              </View>
            ))}
          </View>

          {saveError ? (
            <Card style={styles.errorCard}>
              <Text style={styles.errorText}>{saveError}</Text>
            </Card>
          ) : null}

          <Button onPress={handleSave} loading={saving} fullWidth size="lg">
            {copy.save}
          </Button>
        </View>
      ) : (
        <Card style={styles.infoCard}>
          <Text style={styles.infoTitle}>{copy.reopenTitle}</Text>
          <Text style={styles.infoBody}>{linkError ?? copy.reopenBody}</Text>
          <Button onPress={() => router.replace('/(auth)/forgot-password' as never)} variant="secondary" fullWidth>
            {copy.requestLink}
          </Button>
        </Card>
      )}
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  hero: {
    alignItems: 'center',
    gap: Spacing[3],
    marginTop: Spacing[4],
    marginBottom: Spacing[6],
  },
  lockWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: withOpacity(Colors.brand, 0.12),
    borderWidth: 1,
    borderColor: withOpacity(Colors.brand, 0.24),
  },
  title: {
    fontFamily: FontFamily.display,
    fontSize: 34,
    lineHeight: 34,
    color: Colors.textPrimary,
  },
  form: {
    gap: Spacing[3],
  },
  checks: {
    gap: Spacing[1.5],
  },
  checkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[2],
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: withOpacity(Colors.textMuted, 0.35),
  },
  dotOk: {
    backgroundColor: Colors.success,
  },
  checkText: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  checkTextOk: {
    color: Colors.textPrimary,
  },
  infoCard: {
    gap: Spacing[3],
    alignItems: 'center',
  },
  infoTitle: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.lg,
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  infoBody: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.base,
    lineHeight: 22,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  errorCard: {
    borderWidth: 1,
    borderColor: withOpacity(Colors.error, 0.2),
    backgroundColor: withOpacity(Colors.error, 0.08),
  },
  errorText: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.sm,
    lineHeight: 20,
    color: Colors.error,
  },
  success: {
    gap: Spacing[3],
    alignItems: 'center',
  },
  checkWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: withOpacity(Colors.success, 0.12),
    borderWidth: 1,
    borderColor: withOpacity(Colors.success, 0.24),
  },
  successTitle: {
    fontFamily: FontFamily.display,
    fontSize: 30,
    lineHeight: 34,
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  successBody: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.base,
    lineHeight: 22,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
});
