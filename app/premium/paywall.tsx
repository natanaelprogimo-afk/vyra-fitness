import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import * as Linking from 'expo-linking';
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
  'Coach IA con limite diario',
  'Seguimiento de salud y habitos',
  'Historial y exportacion JSON',
  'Barcode hasta 5 scans por dia',
  'Anuncios de Unity Ads',
];

const FEATURES_PREMIUM = [
  'Coach IA sin limite diario',
  'Correlaciones e insights avanzados',
  'Barcode scanner ilimitado',
  'Sin anuncios de Unity Ads',
];

type Step = 'plans' | 'success' | 'pending';

export default function PaywallScreen() {
  const params = useLocalSearchParams<{
    subscription_status?: string;
    subscription_id?: string;
    plan?: string;
  }>();
  const incomingPlan = params.plan === 'yearly' ? 'yearly' : 'monthly';

  const { checkStatus, confirmSubscriptionFlow, confirming } = usePremium();

  const [selectedPlan, setSelectedPlan] = useState<PlanType>(incomingPlan);
  const [step, setStep] = useState<Step>('plans');
  const [subscriptionId, setSubscriptionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [handledExternalStatus, setHandledExternalStatus] = useState<string | null>(null);

  const monthlyScale = useSharedValue(selectedPlan === 'monthly' ? 1.02 : 1);
  const yearlyScale = useSharedValue(selectedPlan === 'yearly' ? 1.02 : 1);

  useEffect(() => {
    if (params.plan === 'monthly' || params.plan === 'yearly') {
      setSelectedPlan(params.plan);
    }
  }, [params.plan]);

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

    void checkStatus();

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
      Alert.alert('Pago cancelado', 'No se realizo ningun cargo. Podes volver a intentarlo cuando quieras.');
    }
  }, [checkStatus, handledExternalStatus, params.subscription_id, params.subscription_status]);

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
          'No pudimos iniciar PayPal',
          'La suscripcion no se creo. Verifica la configuracion y vuelve a intentar.',
        );
        return;
      }

      setSubscriptionId(result.subscriptionId);
      setStep('pending');
      await Linking.openURL(result.approvalUrl);
    } catch {
      setStep('plans');
      Alert.alert('Error', 'Hubo un problema al abrir PayPal. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  }, [selectedPlan]);

  const handlePendingRefresh = useCallback(async () => {
    if (!subscriptionId) {
      await checkStatus();
      Alert.alert('Pendiente', 'Volve a abrir la pantalla cuando PayPal confirme la activacion.');
      return;
    }

    const outcome = await confirmSubscriptionFlow(subscriptionId);
    if (outcome === 'active') {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setStep('success');
      return;
    }

    if (outcome === 'pending') {
      Alert.alert('Todavia pendiente', 'PayPal aun no confirmo la activacion. Probalo otra vez en unos segundos.');
      return;
    }

    setStep('plans');
    Alert.alert('No confirmada', 'No pudimos confirmar la suscripcion todavia. Volve a intentar.');
  }, [checkStatus, confirmSubscriptionFlow, subscriptionId]);

  if (step === 'success') {
    return (
      <SafeScreen padHorizontal={false} padBottom>
        <Header title="Premium activo" showBack color={Colors.premium} />
        <View style={styles.centerState}>
          <Text style={styles.stateEmoji}>PRO</Text>
          <Text style={styles.stateTitle}>Tu cuenta ya es Premium</Text>
          <Text style={styles.stateBody}>
            Se activaron los beneficios reales de Premium: sin anuncios, coach sin limite y barcode ilimitado.
          </Text>
          <Button label="Ir al inicio" onPress={() => router.replace('/(tabs)' as any)} color={Colors.premium} />
        </View>
      </SafeScreen>
    );
  }

  if (step === 'pending') {
    return (
      <SafeScreen padHorizontal={false} padBottom>
        <Header title="Esperando confirmacion" showBack color={Colors.premium} />
        <View style={styles.centerState}>
          <Text style={styles.stateEmoji}>PP</Text>
          <Text style={styles.stateTitle}>PayPal esta validando tu suscripcion</Text>
          <Text style={styles.stateBody}>
            Cuando PayPal complete la activacion, Vyra actualiza tu cuenta automaticamente.
          </Text>
          <Button
            label={confirming ? 'Revisando...' : 'Actualizar estado'}
            onPress={handlePendingRefresh}
            loading={confirming}
            color={Colors.premium}
          />
          <Button
            label="Volver a planes"
            onPress={() => setStep('plans')}
            variant="secondary"
            color={Colors.premium}
          />
        </View>
      </SafeScreen>
    );
  }

  return (
    <SafeScreen padHorizontal={false} padBottom>
      <Header title="Vyra Premium" showBack color={Colors.premium} />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Card style={styles.heroCard}>
          <Text style={styles.heroEyebrow}>Premium con cobro inmediato</Text>
          <Text style={styles.heroTitle}>Activa Premium desde PayPal</Text>
          <Text style={styles.heroBody}>
            Sin prueba gratis. Confirmas en PayPal y Vyra habilita los beneficios en tu cuenta.
          </Text>
        </Card>

        <View style={styles.compareGrid}>
          <Card style={styles.compareCard}>
            <Text style={styles.compareTitle}>Plan Free</Text>
            {FEATURES_FREE.map((feature) => (
              <Text key={feature} style={styles.compareItem}>- {feature}</Text>
            ))}
          </Card>

          <Card style={[styles.compareCard, styles.compareCardPremium]}>
            <Text style={styles.compareTitle}>Plan Premium</Text>
            {FEATURES_PREMIUM.map((feature) => (
              <Text key={feature} style={styles.compareItem}>- {feature}</Text>
            ))}
          </Card>
        </View>

        <Text style={styles.sectionTitle}>Elige tu plan</Text>

        <Animated.View style={monthlyStyle}>
          <TouchableOpacity
            activeOpacity={0.9}
            style={[styles.planCard, selectedPlan === 'monthly' && styles.planCardActive]}
            onPress={() => selectPlan('monthly')}
          >
            <View>
              <Text style={styles.planLabel}>Mensual</Text>
              <Text style={styles.planPrice}>$12.99 / mes</Text>
              <Text style={styles.planNote}>Sin permanencia. Cancelas la renovacion cuando quieras.</Text>
            </View>
            <View style={[styles.radio, selectedPlan === 'monthly' && styles.radioActive]} />
          </TouchableOpacity>
        </Animated.View>

        <Animated.View style={yearlyStyle}>
          <TouchableOpacity
            activeOpacity={0.9}
            style={[styles.planCard, selectedPlan === 'yearly' && styles.planCardActive]}
            onPress={() => selectPlan('yearly')}
          >
            <View style={styles.planBadge}>
              <Text style={styles.planBadgeText}>Mejor valor</Text>
            </View>
            <View>
              <Text style={styles.planLabel}>Anual</Text>
              <Text style={styles.planPrice}>$99.99 / ano</Text>
              <Text style={styles.planNote}>Equivale a $8.33 por mes.</Text>
            </View>
            <View style={[styles.radio, selectedPlan === 'yearly' && styles.radioActive]} />
          </TouchableOpacity>
        </Animated.View>

        <Button
          label={loading ? 'Abriendo PayPal...' : 'Continuar con PayPal'}
          onPress={handleStartSubscription}
          loading={loading}
          color={Colors.premium}
          style={styles.cta}
        />

        <Text style={styles.disclaimer}>
          Al continuar se abrira PayPal en tu navegador para confirmar el plan. La renovacion se puede cancelar
          despues desde Vyra o desde PayPal.
        </Text>
      </ScrollView>
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingHorizontal: Spacing[5],
    paddingTop: Spacing[4],
    paddingBottom: Spacing[10],
    gap: Spacing[4],
  },
  heroCard: {
    gap: Spacing[2],
    borderWidth: 1,
    borderColor: `${Colors.premium}55`,
    backgroundColor: `${Colors.premium}12`,
  },
  heroEyebrow: {
    fontFamily: FontFamily.semibold,
    fontSize: 12,
    color: Colors.premium,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  heroTitle: {
    fontFamily: FontFamily.bold,
    fontSize: 24,
    color: Colors.textPrimary,
  },
  heroBody: {
    fontFamily: FontFamily.regular,
    fontSize: 15,
    color: Colors.textSecondary,
    lineHeight: 22,
  },
  compareGrid: {
    gap: Spacing[3],
  },
  compareCard: {
    gap: Spacing[2],
  },
  compareCardPremium: {
    borderWidth: 1,
    borderColor: `${Colors.premium}55`,
  },
  compareTitle: {
    fontFamily: FontFamily.bold,
    fontSize: 16,
    color: Colors.textPrimary,
  },
  compareItem: {
    fontFamily: FontFamily.regular,
    fontSize: 14,
    color: Colors.textSecondary,
  },
  sectionTitle: {
    fontFamily: FontFamily.bold,
    fontSize: 16,
    color: Colors.textPrimary,
  },
  planCard: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.bgSurface,
    padding: Spacing[4],
    marginBottom: Spacing[3],
  },
  planCardActive: {
    borderColor: Colors.premium,
    backgroundColor: `${Colors.premium}12`,
  },
  planBadge: {
    position: 'absolute',
    top: -10,
    left: Spacing[4],
    backgroundColor: Colors.premium,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing[2],
    paddingVertical: 2,
  },
  planBadgeText: {
    fontFamily: FontFamily.bold,
    fontSize: 11,
    color: Colors.bgPrimary,
  },
  planLabel: {
    fontFamily: FontFamily.bold,
    fontSize: 18,
    color: Colors.textPrimary,
  },
  planPrice: {
    fontFamily: FontFamily.bold,
    fontSize: 20,
    color: Colors.premium,
    marginTop: 2,
  },
  planNote: {
    fontFamily: FontFamily.regular,
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: Spacing[1],
    maxWidth: '88%',
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: Colors.border,
  },
  radioActive: {
    borderColor: Colors.premium,
    backgroundColor: Colors.premium,
  },
  cta: {
    marginTop: Spacing[2],
  },
  disclaimer: {
    fontFamily: FontFamily.regular,
    fontSize: 13,
    color: Colors.textMuted,
    lineHeight: 20,
    textAlign: 'center',
  },
  centerState: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: Spacing[6],
    gap: Spacing[3],
  },
  stateEmoji: {
    fontFamily: FontFamily.bold,
    fontSize: 40,
    color: Colors.premium,
    textAlign: 'center',
  },
  stateTitle: {
    fontFamily: FontFamily.bold,
    fontSize: 24,
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  stateBody: {
    fontFamily: FontFamily.regular,
    fontSize: 15,
    lineHeight: 22,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
});
