import { Pressable, StyleSheet, Text, View } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import SafeScreen from '@/components/ui/SafeScreen';
import Button from '@/components/ui/Button';
import { useLocalizedStrings } from '@/constants/strings';
import { Colors, withOpacity } from '@/constants/colors';
import { FontFamily, FontSize, Radius, Spacing } from '@/constants/theme';
import { Routes } from '@/constants/routes';
import { useAuth } from '@/hooks/useAuth';
import { resolveSupportedLanguage } from '@/lib/language';

const SCREEN_COPY = {
  es: {
    google: 'Continuar con Google',
    googleHint: 'Abre el flujo seguro de Google para entrar o guardar esta cuenta.',
    apple: 'Continuar con Apple',
    appleHint: 'Abre el flujo seguro de Apple para entrar o guardar esta cuenta.',
    guest: 'Continuar sin cuenta',
    guestHint: 'Puedes vincular Google o Apple mas tarde.',
  },
  en: {
    google: 'Continue with Google',
    googleHint: 'Open the secure Google flow to sign in or save this account.',
    apple: 'Continue with Apple',
    appleHint: 'Open the secure Apple flow to sign in or save this account.',
    guest: 'Continue without account',
    guestHint: 'You can link Google or Apple later.',
  },
  pt: {
    google: 'Continuar com Google',
    googleHint: 'Abre o fluxo seguro do Google para entrar ou salvar esta conta.',
    apple: 'Continuar com Apple',
    appleHint: 'Abre o fluxo seguro da Apple para entrar ou salvar esta conta.',
    guest: 'Continuar sem conta',
    guestHint: 'Voce pode vincular Google ou Apple depois.',
  },
} as const;

export default function WelcomeScreen() {
  const { AuthStrings: authStrings } = useLocalizedStrings();
  const { i18n } = useTranslation();
  const { continueAsGuest, isLoading } = useAuth();
  const copy = SCREEN_COPY[resolveSupportedLanguage(i18n.resolvedLanguage ?? i18n.language)];

  return (
    <SafeScreen padHorizontal={false} padBottom contentStyle={styles.container}>
      <View style={styles.heroZone}>
        <View style={styles.abstractLarge} />
        <View style={styles.abstractArc} />
        <View style={styles.abstractDot} />

        <Text style={styles.brand}>VYRA</Text>
        <View style={styles.heroCopy}>
          <Text style={styles.title}>{authStrings.welcome.title}</Text>
          <Text style={styles.subtitle}>{authStrings.welcome.subtitle}</Text>
        </View>
      </View>

      <View style={styles.actionZone}>
        <Pressable
          onPress={() => router.push(Routes.auth.google as never)}
          style={styles.socialButton}
          accessibilityRole="button"
          accessibilityLabel={copy.google}
          accessibilityHint={copy.googleHint}
        >
          <Text style={styles.googleBadge}>G</Text>
          <Text style={styles.socialText}>{copy.google}</Text>
        </Pressable>
        <Pressable
          onPress={() => router.push(Routes.auth.apple as never)}
          style={styles.socialButton}
          accessibilityRole="button"
          accessibilityLabel={copy.apple}
          accessibilityHint={copy.appleHint}
        >
          <FontAwesome name="apple" size={20} color={Colors.textPrimary} />
          <Text style={styles.socialText}>{copy.apple}</Text>
        </Pressable>
        <Button
          onPress={() => router.push(Routes.auth.register as never)}
          fullWidth
          size="md"
          haptic="medium"
          style={styles.primaryButton}
        >
          {authStrings.welcome.cta}
        </Button>
        <Button
          onPress={() => router.push(Routes.auth.login as never)}
          variant="ghost"
          size="sm"
          fullWidth
          style={styles.secondaryButton}
          textStyle={styles.secondaryText}
        >
          {authStrings.welcome.login}
        </Button>
        <Button
          onPress={() => {
            void continueAsGuest();
          }}
          variant="secondary"
          size="sm"
          fullWidth
          loading={isLoading}
          style={styles.guestButton}
        >
          {copy.guest}
        </Button>
        <Text style={styles.guestHint}>{copy.guestHint}</Text>
      </View>
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  heroZone: {
    flex: 6,
    overflow: 'hidden',
    paddingHorizontal: Spacing[5],
    paddingTop: Spacing[4],
    justifyContent: 'space-between',
  },
  heroCopy: {
    paddingBottom: Spacing[8],
    gap: Spacing[1],
  },
  brand: {
    fontFamily: FontFamily.bold,
    fontSize: 18,
    letterSpacing: 1.8,
    color: Colors.textSecondary,
  },
  title: {
    fontFamily: FontFamily.black,
    fontSize: 60,
    lineHeight: 56,
    letterSpacing: -2,
    color: Colors.textPrimary,
  },
  subtitle: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.md,
    lineHeight: 22,
    color: Colors.textSecondary,
  },
  actionZone: {
    flex: 4,
    backgroundColor: Colors.bgSurface,
    borderTopWidth: 1,
    borderTopColor: withOpacity(Colors.white, 0.08),
    paddingHorizontal: Spacing[5],
    paddingTop: Spacing[2],
    paddingBottom: Spacing[2],
    gap: Spacing[1.5],
    justifyContent: 'center',
  },
  socialButton: {
    minHeight: 50,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: withOpacity(Colors.white, 0.08),
    backgroundColor: Colors.surface2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing[3],
  },
  googleBadge: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.base,
    color: '#4285F4',
    backgroundColor: Colors.white,
    width: 22,
    height: 22,
    borderRadius: 11,
    textAlign: 'center',
    lineHeight: 22,
  },
  socialText: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.xs,
    color: Colors.textPrimary,
  },
  primaryButton: {
    borderRadius: Radius.full,
  },
  secondaryButton: {
    borderRadius: Radius.full,
    backgroundColor: 'transparent',
  },
  secondaryText: {
    color: Colors.textPrimary,
  },
  guestButton: {
    borderRadius: Radius.full,
  },
  guestHint: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    lineHeight: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  abstractLarge: {
    position: 'absolute',
    width: 260,
    height: 260,
    borderRadius: Radius.full,
    backgroundColor: withOpacity(Colors.bgSurface, 0.8),
    top: 42,
    right: -88,
  },
  abstractArc: {
    position: 'absolute',
    width: 280,
    height: 280,
    borderRadius: Radius.full,
    borderWidth: 28,
    borderColor: withOpacity('#111115', 0.95),
    top: 140,
    left: -130,
  },
  abstractDot: {
    position: 'absolute',
    width: 84,
    height: 84,
    borderRadius: Radius.full,
    backgroundColor: withOpacity('#111115', 0.92),
    top: 252,
    right: 48,
  },
});
