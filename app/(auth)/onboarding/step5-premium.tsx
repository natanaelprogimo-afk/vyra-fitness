// ============================================================
// VYRA FITNESS — Onboarding Step 5: Paywall
// ============================================================

import { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import SafeScreen from '@/components/ui/SafeScreen';
import Button from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';
import { Colors } from '@/constants/colors';
import { FontSize, FontFamily, Spacing, Radius } from '@/constants/theme';
import type { OnboardingData, PrimaryGoal, Gender, ActivityLevel } from '@/types/user';

const FEATURES = [
  { emoji: '🤖', label: 'Coach IA con memoria real de tus datos' },
  { emoji: '📸', label: 'Log de comida por foto (Groq Vision)' },
  { emoji: '🎤', label: 'Log de comida por voz' },
  { emoji: '📊', label: 'Historial ilimitado de todos los modulos' },
  { emoji: '🔗', label: 'Correlaciones sueno/peso/nutricion' },
  { emoji: '🚫', label: 'Sin anuncios' },
  { emoji: '🗺️', label: 'Mapas GPS para cardio' },
  { emoji: '♾️', label: 'Escaner de codigos de barra ilimitado' },
];

export default function Step5Premium() {
  const params   = useLocalSearchParams<Record<string, string>>();
  const { saveOnboarding, isLoading } = useAuth();
  const [plan, setPlan] = useState<'monthly' | 'yearly'>('yearly');

  const buildOnboardingData = (): OnboardingData => {
    const age = params.age ? parseInt(params.age, 10) : 25;
    const height = params.height ? parseFloat(params.height) : 170;
    const weight = params.weight ? parseFloat(params.weight) : 70;
    const goalWeight = params.goalWeight ? parseFloat(params.goalWeight) : weight;
    const wakeTime = params.wakeTime ? parseInt(params.wakeTime, 10) : 420;
    const sleepTime = params.sleepTime ? parseInt(params.sleepTime, 10) : 1380;
    
    return {
      name:              params.name ?? 'Usuario',
      age,
      goal:              (params.goal as PrimaryGoal) ?? 'lose_fat',
      gender:            (params.gender as Gender) ?? 'male',
      height_cm:         height,
      weight_start_kg:   weight,
      weight_goal_kg:    goalWeight,
      activity_level:    (params.activity ? parseInt(params.activity, 10) : 2) as ActivityLevel,
      water_goal_ml:     Math.max(1500, Math.round(weight * 35)),
      step_goal:         weight >= 95 ? 8000 : 10000,
      equipment:         (params.equipment as OnboardingData['equipment']) ?? 'gym',
      sleep_goal_hours:  8,
      wake_time_minutes: wakeTime,
      sleep_time_minutes: sleepTime,
      fasting_protocol:  params.fasting === '1' ? (params.protocol ?? null) : null,
      terms_accepted:    true,
      privacy_accepted:  true,
    };
  };

  const handleContinueFree = async () => {
    const ok = await saveOnboarding(buildOnboardingData());
    if (ok) router.replace('/(tabs)/' as any);
  };

  const handleStartTrial = async () => {
    // Guardar onboarding, luego ir al paywall PayPal
    const ok = await saveOnboarding(buildOnboardingData());
    if (ok) router.replace({ pathname: '/premium/paywall', params: { trigger: 'organic' } } as any);
  };

  return (
    <SafeScreen>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.crown}>💎</Text>
          <Text style={styles.title}>Proba Premium{'\n'}7 dias gratis</Text>
          <Text style={styles.subtitle}>Sin cargo hasta que termine el trial. Cancelas cuando quieras.</Text>
        </View>

        {/* Features */}
        <View style={styles.features}>
          {FEATURES.map((f) => (
            <View key={f.label} style={styles.featureRow}>
              <Text style={styles.featureEmoji}>{f.emoji}</Text>
              <Text style={styles.featureLabel}>{f.label}</Text>
            </View>
          ))}
        </View>

        {/* Plan toggle */}
        <View style={styles.plans}>
          <Pressable onPress={() => setPlan('monthly')} style={[styles.planCard, plan === 'monthly' && styles.planCardActive]}>
            <Text style={[styles.planPrice, plan === 'monthly' && { color: Colors.brand }]}>$12.99</Text>
            <Text style={styles.planPeriod}>/mes</Text>
          </Pressable>
          <Pressable onPress={() => setPlan('yearly')} style={[styles.planCard, styles.planCardYearly, plan === 'yearly' && styles.planCardActive]}>
            <View style={styles.planBadge}><Text style={styles.planBadgeText}>AHORRA 36%</Text></View>
            <Text style={[styles.planPrice, plan === 'yearly' && { color: Colors.brand }]}>$99.99</Text>
            <Text style={styles.planPeriod}>/ano</Text>
            <Text style={styles.planNote}>~$8.33/mes</Text>
          </Pressable>
        </View>

        {/* CTAs */}
        <View style={styles.ctas}>
          <Button onPress={handleStartTrial} variant="premium" fullWidth size="lg" loading={isLoading} style={styles.trialBtn}>
            Empezar prueba gratis de 7 dias
          </Button>
          <Button onPress={handleContinueFree} variant="ghost" fullWidth loading={isLoading}>
            Continuar gratis (con anuncios)
          </Button>
          <Text style={styles.legalNote}>
            El trial se convierte automaticamente al plan {plan === 'yearly' ? 'anual $99.99' : 'mensual $12.99'} al terminar los 7 dias. Cancela en cualquier momento desde tu perfil.
          </Text>
        </View>
      </ScrollView>
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  header:      { alignItems: 'center', paddingTop: Spacing[8], paddingBottom: Spacing[6] },
  crown:       { fontSize: 56, marginBottom: Spacing[4] },
  title:       { fontFamily: FontFamily.bold, fontSize: FontSize['3xl'], color: Colors.textPrimary, textAlign: 'center', lineHeight: FontSize['3xl'] * 1.2, marginBottom: Spacing[3] },
  subtitle:    { fontFamily: FontFamily.regular, fontSize: FontSize.base, color: Colors.textSecondary, textAlign: 'center', lineHeight: FontSize.base * 1.5 },
  features:    { backgroundColor: Colors.bgSurface, borderRadius: Radius.xl, padding: Spacing[4], gap: Spacing[3], marginBottom: Spacing[5], borderWidth: 1, borderColor: Colors.border },
  featureRow:  { flexDirection: 'row', alignItems: 'center', gap: Spacing[3] },
  featureEmoji:{ fontSize: 20 },
  featureLabel:{ fontFamily: FontFamily.medium, fontSize: FontSize.sm, color: Colors.textPrimary, flex: 1 },
  plans:       { flexDirection: 'row', gap: Spacing[3], marginBottom: Spacing[5] },
  planCard: {
    flex: 1, alignItems: 'center', padding: Spacing[4],
    borderRadius: Radius.xl, borderWidth: 1.5, borderColor: Colors.border, backgroundColor: Colors.bgSurface,
  },
  planCardYearly:  { position: 'relative' },
  planCardActive:  { borderColor: Colors.brand, backgroundColor: Colors.brand + '12' },
  planBadge: {
    position: 'absolute', top: -10, left: 0, right: 0, alignItems: 'center',
  },
  planBadgeText: {
    fontFamily: FontFamily.bold, fontSize: 9, color: Colors.white,
    backgroundColor: Colors.brand, paddingHorizontal: Spacing[2], paddingVertical: 2, borderRadius: Radius.full,
  },
  planPrice:   { fontFamily: FontFamily.bold, fontSize: FontSize['2xl'], color: Colors.textPrimary },
  planPeriod:  { fontFamily: FontFamily.regular, fontSize: FontSize.sm, color: Colors.textMuted },
  planNote:    { fontFamily: FontFamily.medium, fontSize: FontSize.xs, color: Colors.brand, marginTop: 2 },
  ctas:        { gap: Spacing[3], paddingBottom: Spacing[8] },
  trialBtn: {
    shadowColor: Colors.premium, shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4, shadowRadius: 12, elevation: 8,
  },
  legalNote:   { fontFamily: FontFamily.regular, fontSize: FontSize.xs, color: Colors.textMuted, textAlign: 'center', lineHeight: FontSize.xs * 1.6 },
});
