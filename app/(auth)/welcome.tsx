// REDESIGNED: 2026-05-30 - welcome prioritizes activation before account creation
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';
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
    badge: 'Fitness diario',
    title: 'Tu siguiente paso, claro cada día.',
    subtitle: 'VYRA te dice que hacer, lo registras en segundos y ves progreso real.',
    start: 'Empezar ahora',
    startHint: 'Explora primero. Puedes crear cuenta despues sin perder tu progreso.',
    createAccount: 'Crear cuenta gratis',
    loginTitle: 'Ya tengo cuenta',
    legal: 'Al continuar aceptas Terminos y Privacidad.',
    modules: [
      { label: 'Entreno', icon: 'barbell-outline', color: Colors.workout },
      { label: 'Comidas', icon: 'restaurant-outline', color: Colors.nutrition },
      { label: 'Agua', icon: 'water-outline', color: Colors.water },
      { label: 'Sueño', icon: 'moon-outline', color: Colors.sleep },
      { label: 'Ayuno', icon: 'timer-outline', color: Colors.fasting },
      { label: 'Pasos', icon: 'footsteps', color: Colors.steps },
      { label: 'Ciclo', icon: 'flower-outline', color: Colors.female },
    ],
  },
  en: {
    badge: 'Daily fitness',
    title: 'Your next step, clear every day.',
    subtitle: 'VYRA tells you what to do, helps you log it fast, and shows real progress.',
    start: 'Start now',
    startHint: 'Explore first. You can create an account later without losing progress.',
    createAccount: 'Create free account',
    loginTitle: 'I already have an account',
    legal: 'By continuing you accept Terms and Privacy.',
    modules: [
      { label: 'Training', icon: 'barbell-outline', color: Colors.workout },
      { label: 'Meals', icon: 'restaurant-outline', color: Colors.nutrition },
      { label: 'Water', icon: 'water-outline', color: Colors.water },
      { label: 'Sleep', icon: 'moon-outline', color: Colors.sleep },
      { label: 'Fasting', icon: 'timer-outline', color: Colors.fasting },
      { label: 'Steps', icon: 'footsteps', color: Colors.steps },
      { label: 'Cycle', icon: 'flower-outline', color: Colors.female },
    ],
  },
  pt: {
    badge: 'Fitness diario',
    title: 'Seu proximo passo, claro todo dia.',
    subtitle: 'VYRA diz o que fazer, voce registra rapido e ve progresso real.',
    start: 'Comecar agora',
    startHint: 'Explore primeiro. Voce pode criar conta depois sem perder o progresso.',
    createAccount: 'Criar conta gratis',
    loginTitle: 'Ja tenho conta',
    legal: 'Ao continuar voce aceita Termos e Privacidade.',
    modules: [
      { label: 'Treino', icon: 'barbell-outline', color: Colors.workout },
      { label: 'Refeicoes', icon: 'restaurant-outline', color: Colors.nutrition },
      { label: 'Agua', icon: 'water-outline', color: Colors.water },
      { label: 'Sono', icon: 'moon-outline', color: Colors.sleep },
      { label: 'Jejum', icon: 'timer-outline', color: Colors.fasting },
      { label: 'Passos', icon: 'footsteps', color: Colors.steps },
      { label: 'Ciclo', icon: 'flower-outline', color: Colors.female },
    ],
  },
} as const;

export default function WelcomeScreen() {
  const { AuthStrings: authStrings } = useLocalizedStrings();
  const { i18n } = useTranslation();
  const { continueAsGuest, isLoading } = useAuth();
  const copy = SCREEN_COPY[resolveSupportedLanguage(i18n.resolvedLanguage ?? i18n.language)];

  return (
    <SafeScreen
      scrollable
      padHorizontal={false}
      padBottom
      disableAtmosphere
      contentStyle={styles.container}
    >
      <View style={styles.heroZone}>
        <View style={styles.heroGlowPrimary} />
        <View style={styles.heroGlowSecondary} />

        <View style={styles.brandRow}>
          <Text style={styles.brand}>VYRA</Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{copy.badge}</Text>
          </View>
        </View>

        <View style={styles.heroCopy}>
          <Text style={styles.title}>{copy.title ?? authStrings.welcome.title}</Text>
          <Text style={styles.subtitle}>{copy.subtitle ?? authStrings.welcome.subtitle}</Text>
        </View>

        <View style={styles.moduleGrid}>
          {copy.modules.map((module) => (
            <View key={module.label} style={styles.moduleChip}>
              <Ionicons name={module.icon} size={14} color={module.color} />
              <Text style={styles.moduleChipText}>{module.label}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.actionsBlock}>
        <Button
          onPress={() => {
            void continueAsGuest();
          }}
          fullWidth
          size="md"
          haptic="medium"
          loading={isLoading}
          style={styles.primaryButton}
        >
          {copy.start}
        </Button>

        <Text style={styles.primaryHint}>{copy.startHint}</Text>

        <Button
          onPress={() => router.push(Routes.auth.register as never)}
          variant="secondary"
          size="md"
          fullWidth
          style={styles.secondaryButton}
        >
          {copy.createAccount ?? authStrings.welcome.cta}
        </Button>

        <Button
          onPress={() => router.push(Routes.auth.login as never)}
          variant="ghost"
          size="sm"
          fullWidth
          style={styles.loginButton}
        >
          {copy.loginTitle ?? authStrings.welcome.login}
        </Button>

        <Text style={styles.legal}>{copy.legal}</Text>
      </View>
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'space-between',
    paddingBottom: Spacing[5],
  },
  heroZone: {
    overflow: 'hidden',
    paddingHorizontal: Spacing[5],
    paddingTop: Spacing[3],
    paddingBottom: Spacing[4],
    gap: Spacing[4],
  },
  heroGlowPrimary: {
    position: 'absolute',
    width: 260,
    height: 260,
    borderRadius: Radius.full,
    backgroundColor: withOpacity(Colors.workout, 0.08),
    top: -150,
    right: -110,
  },
  heroGlowSecondary: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: Radius.full,
    backgroundColor: withOpacity(Colors.sleep, 0.06),
    top: -60,
    left: -120,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing[3],
  },
  brand: {
    color: Colors.textPrimary,
    fontFamily: FontFamily.bold,
    fontSize: FontSize['1.5xl'],
    letterSpacing: 2.6,
  },
  badge: {
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: withOpacity(Colors.white, 0.05),
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[1.5],
  },
  badgeText: {
    color: Colors.textSecondary,
    fontFamily: FontFamily.medium,
    fontSize: FontSize.xs,
    letterSpacing: 0.3,
  },
  heroCopy: {
    gap: Spacing[2],
  },
  title: {
    color: Colors.textPrimary,
    fontFamily: FontFamily.black,
    fontSize: 34,
    lineHeight: 36,
    letterSpacing: -1.7,
    maxWidth: 340,
  },
  subtitle: {
    color: Colors.textSecondary,
    fontFamily: FontFamily.regular,
    fontSize: FontSize.base,
    lineHeight: 22,
    maxWidth: 330,
  },
  moduleGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing[2],
  },
  moduleChip: {
    flexBasis: '31%',
    minHeight: 42,
    flexGrow: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing[1.5],
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
    backgroundColor: withOpacity(Colors.white, 0.04),
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[1.5],
  },
  moduleChipText: {
    color: Colors.textMuted,
    fontFamily: FontFamily.medium,
    fontSize: 11,
    lineHeight: 14,
    flexShrink: 1,
  },
  actionsBlock: {
    paddingHorizontal: Spacing[5],
    gap: Spacing[3],
  },
  primaryButton: {
    borderRadius: Radius.full,
  },
  primaryHint: {
    marginTop: -4,
    textAlign: 'center',
    color: Colors.textMuted,
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    lineHeight: 18,
  },
  secondaryButton: {
    borderRadius: Radius.full,
  },
  loginButton: {
    borderRadius: Radius.full,
    minHeight: 42,
  },
  legal: {
    color: Colors.textDisabled,
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    lineHeight: 18,
    textAlign: 'center',
    paddingHorizontal: Spacing[3],
    paddingBottom: Spacing[1],
  },
});
