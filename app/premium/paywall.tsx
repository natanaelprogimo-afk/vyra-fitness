import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { WebView } from 'react-native-webview';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { router, useLocalSearchParams } from 'expo-router';
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
  'Coach IA - 10 mensajes/día',
  'Barcode - 5 scans/día',
  'Anuncios Unity Ads',
];

const FEATURES_PREMIUM = [
  'Todos los módulos sin límite',
  'Coach IA ilimitado con memoria',
  'Foto IA y log por voz',
  'Historial ilimitado + exportar CSV',
  'Barcode scanner ilimitado',
  'Proyección de peso con IA',
  'Correlaciones avanzadas',
  'Sin anuncios',
  'Plan semanal personalizado',
];

type Step = 'plans' | 'webview' | 'success' | 'pending';

function getQueryParam(url: string, key: string): string | null {
  try {
    const parsed = new URL(url);
    return parsed.searchParams.get(key);
  } catch {
    return null;
  }
}

export default function PaywallScreen() {
  const params = useLocalSearchParams<{
    subscription_status?: string;
    subscription_id?: string;
    plan?: string;
  }>();

  const { checkStatus, confirmSubscriptionFlow, confirming } = usePremium();

  const [selectedPlan, setSelectedPlan] = useState<PlanType>('monthly');
  const [step, setStep] = useState<Step>('plans');
  const [approvalUrl, setApprovalUrl] = useState<string | null>(null);
  const [subscriptionId, setSubscriptionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [handledExternalStatus, setHandledExternalStatus] = useState<string | null>(null);

  const BACKEND_URL = process.env.EXPO_PUBLIC_API_URL ?? process.env.EXPO_PUBLIC_BACKEND_URL ?? '';

  const monthlyScale = useSharedValue(selectedPlan === 'monthly' ? 1.02 : 1);
  const yearlyScale = useSharedValue(selectedPlan === 'yearly' ? 1.02 : 1);

  useEffect(() => {
    const externalStatus =
      typeof params.subscription_status === 'string' ? params.subscription_status : null;

    if (!externalStatus || externalStatus === handledExternalStatus) {
      return;
    }

    setHandledExternalStatus(externalStatus);

    if (typeof params.subscription_id === 'string' && params.subscription_id) {
      setSubscriptionId(params.subscription_id);
    }

    if (externalStatus === 'active') {
      setStep('success');
      return;
    }

    if (externalStatus === 'pending') {
      setStep('pending');
      return;
    }

    if (externalStatus === 'cancelled') {
      setStep('plans');
      Alert.alert('Pago cancelado', 'Podés volver a intentarlo cuando quieras. No se realizó ningún cargo.');
    }
  }, [handledExternalStatus, params.subscription_id, params.subscription_status]);

  const selectPlan = (plan: PlanType) => {
    setSelectedPlan(plan);
    monthlyScale.value = withSpring(plan === 'monthly' ? 1.02 : 1);
    yearlyScale.value = withSpring(plan === 'yearly' ? 1.02 : 1);
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const monthlyStyle = useAnimatedStyle(() => ({ transform: [{ scale: monthlyScale.value }] }));
  const yearlyStyle = useAnimatedStyle(() => ({ transform: [{ scale: yearlyScale.value }] }));

  const handleStartSubscription = useCallback(async () => {
    setLoading(true);

    try {
      const result = await createSubscription(selectedPlan);
      if (!result?.approvalUrl || !result.subscriptionId) {
        Alert.alert(
          'Error al iniciar',
          'Hubo un problema con PayPal. No se te cobró nada. Verificá la configuración e intentá de nuevo.',
        );
        return;
      }

      setSubscriptionId(result.subscriptionId);
      setApprovalUrl(result.approvalUrl);
      setStep('webview');
    } catch {
      Alert.alert('Error', 'Hubo un problema con el pago. No se te cobró nada. Intentá de nuevo.');
    } finally {
      setLoading(false);
    }
  }, [selectedPlan]);

  const handleSubscriptionNavigation = useCallback(async (url: string) => {
    if (!url) return;

    const cancelled =
      url.includes(`${BACKEND_URL}/paypal/cancel`) ||
      getQueryParam(url, 'subscription_status') === 'cancelled';

    if (cancelled) {
      setStep('plans');
      setApprovalUrl(null);
      Alert.alert('Pago cancelado', 'Podés volver a intentarlo cuando quieras. No se realizó ningún cargo.');
      return;
    }

    const isReturnUrl =
      url.includes(`${BACKEND_URL}/paypal/return`) ||
      getQueryParam(url, 'subscription_status') === 'active' ||
      getQueryParam(url, 'subscription_status') === 'pending';

    if (!isReturnUrl) return;

    const nextSubscriptionId =
      getQueryParam(url, 'subscription_id') ??
      getQueryParam(url, 'subscriptionId') ??
      getQueryParam(url, 'subscription_id'.toLowerCase()) ??
      subscriptionId;

    if (!nextSubscriptionId) {
      await checkStatus();
      setStep('pending');
      return;
    }

    setSubscriptionId(nextSubscriptionId);
    const outcome = await confirmSubscriptionFlow(nextSubscriptionId);

    if (outcome === 'active') {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setApprovalUrl(null);
      setStep('success');
      return;
    }

    if (outcome === 'pending') {
      setApprovalUrl(null);
      setStep('pending');
      return;
    }

    setApprovalUrl(null);
    setStep('plans');
    Alert.alert(
      'Suscripción pendiente',
      'PayPal todavía no confirmó la activación. Revisá de nuevo en unos segundos o volvé a intentar.',
    );
  }, [BACKEND_URL, checkStatus, confirmSubscriptionFlow, subscriptionId]);

  const shouldInterceptUrl = useCallback((url: string) => {
    if (!url) return false;

    return (
      url.includes(`${BACKEND_URL}/paypal/return`) ||
      url.includes(`${BACKEND_URL}/paypal/cancel`) ||
      url.includes('subscription_status=active') ||
      url.includes('subscription_status=pending') ||
      url.includes('subscription_status=cancelled')
    );
  }, [BACKEND_URL]);

  const handleShouldStartLoad = useCallback((request: { url: string }) => {
    if (!request?.url) return true;

    if (shouldInterceptUrl(request.url)) {
      void handleSubscriptionNavigation(request.url);
      return false;
    }

    return true;
  }, [handleSubscriptionNavigation, shouldInterceptUrl]);

  const handlePendingRefresh = useCallback(async () => {
    if (!subscriptionId) {
      await checkStatus();
      return;
    }

    const outcome = await confirmSubscriptionFlow(subscriptionId);
    if (outcome === 'active') {
      setStep('success');
      return;
    }

    if (outcome === 'failed') {
      Alert.alert('Todavía pendiente', 'PayPal todavía no confirmó la activación. Probá nuevamente en unos segundos.');
    }
  }, [checkStatus, confirmSubscriptionFlow, subscriptionId]);

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
          onShouldStartLoadWithRequest={handleShouldStartLoad}
          onNavigationStateChange={(navState) => {
            if (shouldInterceptUrl(navState.url)) {
              void handleSubscriptionNavigation(navState.url);
            }
          }}
          startInLoadingState
          style={{ flex: 1 }}
        />
      </SafeScreen>
    );
  }

  if (step === 'success') {
    return (
      <SafeScreen padHorizontal={false} padBottom>
        <View style={styles.successContainer}>
          <Text style={styles.successEmoji}>Premium</Text>
          <Text style={styles.successTitle}>Tu suscripción Premium ya está activa</Text>
          <Text style={styles.successSubtitle}>
            Ya podés usar todas las funciones Premium sin límites. El estado quedó confirmado contra PayPal.
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

  if (step === 'pending') {
    return (
      <SafeScreen padHorizontal={false} padBottom>
        <View style={styles.successContainer}>
          <Text style={styles.successEmoji}>PayPal</Text>
          <Text style={styles.successTitle}>Estamos confirmando tu pago</Text>
          <Text style={styles.successSubtitle}>
            PayPal todavía no terminó de confirmar la activación. Esto suele resolverse en segundos.
          </Text>
          <Button
            label={confirming ? 'Verificando...' : 'Verificar ahora'}
            onPress={handlePendingRefresh}
            disabled={confirming}
            color={Colors.premium}
            style={styles.successBtn}
          />
          <TouchableOpacity onPress={() => router.back()} style={styles.skipBtn}>
            <Text style={styles.skipText}>Volver</Text>
          </TouchableOpacity>
        </View>
      </SafeScreen>
    );
  }

  return (
    <SafeScreen padHorizontal={false} padBottom>
      <Header title="" showBack color={Colors.brand} />

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.hero}>
          <Text style={styles.heroEmoji}>Premium</Text>
          <Text style={styles.heroTitle}>Vyra Premium</Text>
          <Text style={styles.heroSubtitle}>
            Pago seguro con PayPal. Cancelás cuando quieras desde la app.
          </Text>
        </View>

        <Card style={styles.compareCard}>
          <View style={styles.compareRow}>
            <View style={styles.compareCol}>
              <Text style={styles.compareColTitle}>Free</Text>
              {FEATURES_FREE.map((feature, index) => (
                <Text key={index} style={styles.compareFeatureFree}>· {feature}</Text>
              ))}
            </View>
            <View style={styles.compareDivider} />
            <View style={styles.compareCol}>
              <Text style={[styles.compareColTitle, { color: Colors.premium }]}>Premium</Text>
              {FEATURES_PREMIUM.map((feature, index) => (
                <Text key={index} style={styles.compareFeaturePremium}>- {feature}</Text>
              ))}
            </View>
          </View>
        </Card>

        <Text style={styles.planSectionTitle}>Elegí tu plan</Text>

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

        <Button
          label={loading ? 'Iniciando...' : 'Suscribirme con PayPal'}
          onPress={handleStartSubscription}
          disabled={loading}
          color={Colors.premium}
          size="large"
          style={styles.ctaBtn}
        />

        <Text style={styles.ctaDisclaimer}>
          El cobro se procesa al confirmar en PayPal. Podés cancelar desde la app y mantener acceso hasta el fin del período ya pagado.
        </Text>

        <TouchableOpacity onPress={() => router.back()} style={styles.skipBtn}>
          <Text style={styles.skipText}>Continuar con Free</Text>
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
  heroEmoji: { fontSize: 44, fontFamily: FontFamily.bold, color: Colors.premium },
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
    maxWidth: 320,
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
  successEmoji: {
    fontFamily: FontFamily.bold,
    fontSize: 40,
    color: Colors.premium,
  },
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
