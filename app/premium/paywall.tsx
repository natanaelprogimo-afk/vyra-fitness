import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Linking,
} from 'react-native';
import { WebView } from 'react-native-webview';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import SafeScreen from '@/components/ui/SafeScreen';
import { Header } from '@/components/layout/Header';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { Colors } from '@/constants/colors';
import { FontFamily, Spacing, Radius } from '@/constants/theme';
import { createSubscription, PlanType } from '@/services/backend/paypal';
import { usePremium } from '@/hooks/usePremium';

const FEATURES_FREE = [
  '5 módulos de salud básicos',
  'Log manual de comidas',
  '7 días de historial',
  'Coach IA — 10 mensajes/día',
  'Barcode — 5 scans/día',
  'Anuncios Unity Ads',
];

const FEATURES_PREMIUM = [
  '✅ Todos los módulos sin límite',
  '✅ Coach IA ilimitado con memoria',
  '✅ Foto IA y log por voz',
  '✅ Historial ilimitado + exportar CSV',
  '✅ Barcode scanner ilimitado',
  '✅ Proyección de peso con IA',
  '✅ Correlaciones avanzadas',
  '✅ Sin anuncios',
  '✅ Plan semanal personalizado',
];

type Step = 'plans' | 'webview' | 'success';

export default function PaywallScreen() {
  const { isPremium, checkStatus } = usePremium();
  const [selectedPlan, setSelectedPlan] = useState<PlanType>('monthly');
  const [step, setStep]         = useState<Step>('plans');
  const [approvalUrl, setApprovalUrl] = useState<string | null>(null);
  const [loading, setLoading]   = useState(false);

  const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL ?? '';

  // Animación del plan seleccionado
  const monthlyScale = useSharedValue(selectedPlan === 'monthly' ? 1.02 : 1);
  const yearlyScale  = useSharedValue(selectedPlan === 'yearly'  ? 1.02 : 1);

  const selectPlan = (plan: PlanType) => {
    setSelectedPlan(plan);
    monthlyScale.value = withSpring(plan === 'monthly' ? 1.02 : 1);
    yearlyScale.value  = withSpring(plan === 'yearly'  ? 1.02 : 1);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const monthlyStyle = useAnimatedStyle(() => ({ transform: [{ scale: monthlyScale.value }] }));
  const yearlyStyle  = useAnimatedStyle(() => ({ transform: [{ scale: yearlyScale.value }] }));

  const handleStartSubscription = useCallback(async () => {
    setLoading(true);
    try {
      const result = await createSubscription(selectedPlan);
      if (!result?.approvalUrl) {
        Alert.alert(
          'Error al iniciar',
          'Hubo un problema con el pago. No se te cobró nada — intentá de nuevo.',
        );
        return;
      }
      setApprovalUrl(result.approvalUrl);
      setStep('webview');
    } catch {
      Alert.alert('Error', 'Hubo un problema con el pago. No se te cobró nada — intentá de nuevo.');
    } finally {
      setLoading(false);
    }
  }, [selectedPlan]);

  // El WebView captura la URL de retorno del backend
  const handleWebViewNavigation = useCallback(
    async (navState: { url: string }) => {
      const { url } = navState;

      // PayPal redirige a nuestro backend al completar o cancelar
      if (url.includes(`${BACKEND_URL}/paypal/return`) || url.includes('subscription_approved')) {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        await checkStatus();
        setStep('success');
      } else if (url.includes(`${BACKEND_URL}/paypal/cancel`) || url.includes('subscription_cancelled')) {
        setStep('plans');
        Alert.alert('Pago cancelado', 'Podés volver a intentarlo cuando quieras. No se realizó ningún cargo.');
      }
    },
    [BACKEND_URL, checkStatus],
  );

  // ── PASO: WEBVIEW PAYPAL ──────────────────────────────────────────
  if (step === 'webview' && approvalUrl) {
    return (
      <SafeScreen padHorizontal={false} padBottom={false}>
        <Header
          title="Pago seguro"
          showBack
          onBack={() => setStep('plans')}
          color={Colors.brand}
        />
        <WebView
          source={{ uri: approvalUrl }}
          onNavigationStateChange={handleWebViewNavigation}
          startInLoadingState
          style={{ flex: 1 }}
        />
      </SafeScreen>
    );
  }

  // ── PASO: ÉXITO ────────────────────────────────────────────────────
  if (step === 'success') {
    return (
      <SafeScreen padHorizontal={false} padBottom>
        <View style={styles.successContainer}>
          <Text style={styles.successEmoji}>🎉</Text>
          <Text style={styles.successTitle}>¡Bienvenido a Vyra Premium!</Text>
          <Text style={styles.successSubtitle}>
            Tu prueba gratuita de 7 días ya está activa. Explorá todas las features sin límites.
          </Text>
          <Button
            label="Empezar a explorar"
            onPress={() => router.replace('/(tabs)' as any)}
            color={Colors.premium}
            style={styles.successBtn}
          />
        </View>
      </SafeScreen>
    );
  }

  // ── PASO: PLANES ───────────────────────────────────────────────────
  return (
    <SafeScreen padHorizontal={false} padBottom>
      <Header title="" showBack color={Colors.brand} />

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero */}
        <View style={styles.hero}>
          <Text style={styles.heroEmoji}>💎</Text>
          <Text style={styles.heroTitle}>Vyra Premium</Text>
          <Text style={styles.heroSubtitle}>
            7 días gratis, sin compromiso. Cancelás cuando querés.
          </Text>
        </View>

        {/* Comparativa */}
        <Card style={styles.compareCard}>
          <View style={styles.compareRow}>
            <View style={styles.compareCol}>
              <Text style={styles.compareColTitle}>Free</Text>
              {FEATURES_FREE.map((f, i) => (
                <Text key={i} style={styles.compareFeatureFree}>· {f}</Text>
              ))}
            </View>
            <View style={styles.compareDivider} />
            <View style={styles.compareCol}>
              <Text style={[styles.compareColTitle, { color: Colors.premium }]}>Premium</Text>
              {FEATURES_PREMIUM.map((f, i) => (
                <Text key={i} style={styles.compareFeaturePremium}>{f}</Text>
              ))}
            </View>
          </View>
        </Card>

        {/* Selector de plan */}
        <Text style={styles.planSectionTitle}>Elegí tu plan</Text>

        {/* Plan mensual */}
        <Animated.View style={monthlyStyle}>
          <TouchableOpacity
            style={[
              styles.planCard,
              selectedPlan === 'monthly' && styles.planCardSelected,
            ]}
            onPress={() => selectPlan('monthly')}
            activeOpacity={0.85}
          >
            <View style={styles.planRow}>
              <View style={styles.planLeft}>
                <Text style={styles.planName}>Mensual</Text>
                <Text style={styles.planDesc}>Flexibilidad total</Text>
              </View>
              <View style={styles.planRight}>
                <Text style={styles.planPrice}>$12.99</Text>
                <Text style={styles.planPeriod}>/mes</Text>
              </View>
              <View style={[styles.planRadio, selectedPlan === 'monthly' && styles.planRadioSelected]} />
            </View>
          </TouchableOpacity>
        </Animated.View>

        {/* Plan anual */}
        <Animated.View style={yearlyStyle}>
          <TouchableOpacity
            style={[
              styles.planCard,
              selectedPlan === 'yearly' && styles.planCardSelected,
            ]}
            onPress={() => selectPlan('yearly')}
            activeOpacity={0.85}
          >
            <View style={styles.savingsBadge}>
              <Text style={styles.savingsBadgeText}>AHORRÁS 36%</Text>
            </View>
            <View style={styles.planRow}>
              <View style={styles.planLeft}>
                <Text style={styles.planName}>Anual</Text>
                <Text style={styles.planDesc}>~$8.33/mes efectivo</Text>
              </View>
              <View style={styles.planRight}>
                <Text style={styles.planPrice}>$99.99</Text>
                <Text style={styles.planPeriod}>/año</Text>
              </View>
              <View style={[styles.planRadio, selectedPlan === 'yearly' && styles.planRadioSelected]} />
            </View>
          </TouchableOpacity>
        </Animated.View>

        {/* CTA */}
        <Button
          label={loading ? 'Iniciando...' : 'Empezar prueba gratis 7 días'}
          onPress={handleStartSubscription}
          disabled={loading}
          color={Colors.premium}
          size="large"
          style={styles.ctaBtn}
        />

        <Text style={styles.ctaDisclaimer}>
          Sin cargos durante los 7 días de prueba. Podés cancelar antes de que termine sin costo.
          Pago procesado por PayPal de forma segura.
        </Text>

        {/* Skip */}
        <TouchableOpacity onPress={() => router.back()} style={styles.skipBtn}>
          <Text style={styles.skipText}>Continuar con Free →</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingHorizontal: Spacing[5],
    paddingBottom: Spacing[10],
    gap: Spacing[4],
  },
  hero: {
    alignItems: 'center',
    paddingTop: Spacing[4],
    paddingBottom: Spacing[2],
    gap: Spacing[2],
  },
  heroEmoji: { fontSize: 56 },
  heroTitle: {
    fontFamily: FontFamily.bold,
    fontSize: 30,
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  heroSubtitle: {
    fontFamily: FontFamily.regular,
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    maxWidth: 280,
  },
  compareCard: { padding: Spacing[4] },
  compareRow: { flexDirection: 'row', gap: Spacing[3] },
  compareCol: { flex: 1, gap: Spacing[2] },
  compareColTitle: {
    fontFamily: FontFamily.bold,
    fontSize: 16,
    color: Colors.textPrimary,
    marginBottom: Spacing[1],
  },
  compareFeatureFree: {
    fontFamily: FontFamily.regular,
    fontSize: 12,
    color: Colors.textMuted,
    lineHeight: 18,
  },
  compareFeaturePremium: {
    fontFamily: FontFamily.medium,
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  compareDivider: {
    width: 1,
    backgroundColor: Colors.border,
    marginVertical: Spacing[1],
  },
  planSectionTitle: {
    fontFamily: FontFamily.bold,
    fontSize: 18,
    color: Colors.textPrimary,
  },
  planCard: {
    backgroundColor: Colors.bgSurface,
    borderRadius: Radius.xl,
    padding: Spacing[4],
    borderWidth: 2,
    borderColor: Colors.border,
    position: 'relative',
    overflow: 'visible',
  },
  planCardSelected: {
    borderColor: Colors.premium,
    backgroundColor: `${Colors.premium}10`,
  },
  planRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[3],
  },
  planLeft: { flex: 1, gap: 4 },
  planName: {
    fontFamily: FontFamily.bold,
    fontSize: 18,
    color: Colors.textPrimary,
  },
  planDesc: {
    fontFamily: FontFamily.regular,
    fontSize: 13,
    color: Colors.textSecondary,
  },
  planRight: {
    alignItems: 'flex-end',
    gap: 2,
  },
  planPrice: {
    fontFamily: FontFamily.bold,
    fontSize: 26,
    color: Colors.premium,
  },
  planPeriod: {
    fontFamily: FontFamily.regular,
    fontSize: 13,
    color: Colors.textMuted,
  },
  planRadio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: Colors.textMuted,
  },
  planRadioSelected: {
    borderColor: Colors.premium,
    backgroundColor: Colors.premium,
  },
  savingsBadge: {
    position: 'absolute',
    top: -12,
    right: Spacing[4],
    backgroundColor: Colors.premium,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing[3],
    paddingVertical: 3,
    zIndex: 1,
  },
  savingsBadgeText: {
    fontFamily: FontFamily.bold,
    fontSize: 11,
    color: '#fff',
    letterSpacing: 0.5,
  },
  ctaBtn: { marginTop: Spacing[2] },
  ctaDisclaimer: {
    fontFamily: FontFamily.regular,
    fontSize: 12,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: 18,
  },
  skipBtn: {
    alignItems: 'center',
    paddingVertical: Spacing[2],
  },
  skipText: {
    fontFamily: FontFamily.medium,
    fontSize: 15,
    color: Colors.textSecondary,
  },
  successContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing[8],
    gap: Spacing[5],
  },
  successEmoji: { fontSize: 80 },
  successTitle: {
    fontFamily: FontFamily.bold,
    fontSize: 28,
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  successSubtitle: {
    fontFamily: FontFamily.regular,
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  successBtn: { width: '100%' },
});