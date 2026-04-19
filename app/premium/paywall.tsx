import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import * as Linking from 'expo-linking';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { router, useLocalSearchParams } from 'expo-router';
import SafeScreen from '@/components/ui/SafeScreen';
import Header from '@/components/layout/Header';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { Colors, withOpacity } from '@/constants/colors';
import { FontFamily, FontSize, Radius, Spacing } from '@/constants/theme';
import { getPaywallContextCopy } from '@/lib/module-correlations';
import { useDashboard } from '@/hooks/useDashboard';
import { usePremium } from '@/hooks/usePremium';
import { useSleep } from '@/hooks/useSleep';
import { createSubscription, getPayPalHealth, type PlanType } from '@/services/backend/paypal';

const COMPARISON_ROWS = [
  ['Analisis', 'Lectura base', 'Correlaciones avanzadas'],
  ['Historial', 'Profundidad limitada', 'Lectura mas profunda'],
  ['Barcode', 'Hasta 5 scans al dia', 'Ilimitado'],
  ['Estrategia', 'Seguimiento base', 'Lectura mas profunda del avance'],
] as const;

type Step = 'plans' | 'success' | 'pending';

function StateScreen({
  title,
  body,
  primaryLabel,
  onPrimary,
  secondaryLabel,
  onSecondary,
  loading = false,
}: {
  title: string;
  body: string;
  primaryLabel: string;
  onPrimary: () => void;
  secondaryLabel?: string;
  onSecondary?: () => void;
  loading?: boolean;
}) {
  return (
    <View style={styles.stateScreen}>
      <Text style={styles.stateTitle}>{title}</Text>
      <Text style={styles.stateBody}>{body}</Text>
      <Button onPress={onPrimary} loading={loading} fullWidth color={Colors.premium}>
        {primaryLabel}
      </Button>
      {secondaryLabel && onSecondary ? (
        <Button onPress={onSecondary} variant="secondary" fullWidth color={Colors.premium}>
          {secondaryLabel}
        </Button>
      ) : null}
    </View>
  );
}

export default function PaywallScreen() {
  const params = useLocalSearchParams<{
    subscription_status?: string;
    subscription_id?: string;
    plan?: string;
    trigger?: string;
  }>();
  const incomingPlan = params.plan === 'yearly' ? 'yearly' : 'monthly';
  const contextCopy = getPaywallContextCopy(typeof params.trigger === 'string' ? params.trigger : null);
  const highlights = useMemo(() => contextCopy.highlights.slice(0, 5), [contextCopy.highlights]);

  const { checkStatus, confirmSubscriptionFlow, confirming, status, trialDaysLeft } = usePremium();
  const { weekScores } = useDashboard();
  const { history } = useSleep();

  const [selectedPlan, setSelectedPlan] = useState<PlanType>(incomingPlan);
  const [step, setStep] = useState<Step>('plans');
  const [subscriptionId, setSubscriptionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [handledExternalStatus, setHandledExternalStatus] = useState<string | null>(null);
  const [trialOfferDays, setTrialOfferDays] = useState<number | null>(null);

  const monthlyScale = useSharedValue(selectedPlan === 'monthly' ? 1.02 : 1);
  const yearlyScale = useSharedValue(selectedPlan === 'yearly' ? 1.02 : 1);
  const monthlyStyle = useAnimatedStyle(() => ({ transform: [{ scale: monthlyScale.value }] }));
  const yearlyStyle = useAnimatedStyle(() => ({ transform: [{ scale: yearlyScale.value }] }));

  useEffect(() => {
    if (params.plan === 'monthly' || params.plan === 'yearly') {
      setSelectedPlan(params.plan);
    }
  }, [params.plan]);

  useEffect(() => {
    let mounted = true;
    void getPayPalHealth()
      .then((health) => {
        if (!mounted) return;
        setTrialOfferDays(typeof health?.trialDays === 'number' ? health.trialDays : null);
      })
      .catch(() => {
        if (!mounted) return;
        setTrialOfferDays(null);
      });

    return () => {
      mounted = false;
    };
  }, []);

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
      Alert.alert('Pago cancelado', 'No se hizo ningun cargo. Puedes volver cuando quieras.');
    }
  }, [checkStatus, handledExternalStatus, params.subscription_id, params.subscription_status]);

  function selectPlan(plan: PlanType) {
    setSelectedPlan(plan);
    monthlyScale.value = withSpring(plan === 'monthly' ? 1.02 : 1);
    yearlyScale.value = withSpring(plan === 'yearly' ? 1.02 : 1);
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }

  const weeklyAverage =
    weekScores.length > 0
      ? weekScores.reduce((sum, row) => sum + Number((row as Record<string, unknown>).total_score ?? 0), 0) / weekScores.length
      : 0;
  const weeklyStart = Number((weekScores[0] as Record<string, unknown> | undefined)?.total_score ?? 0);
  const weeklyEnd = Number((weekScores[weekScores.length - 1] as Record<string, unknown> | undefined)?.total_score ?? 0);
  const weeklyDeltaPct =
    weeklyStart > 0 ? Math.round(((weeklyEnd - weeklyStart) / weeklyStart) * 100) : null;
  const personalizedBullets = useMemo(
    () => [
      history.length > 0
        ? `Ya juntaste ${history.length} noches de sueno listas para una lectura mas profunda.`
        : 'En cuanto empieces a registrar sueno, Premium puede leer tendencia y no solo la foto del dia.',
      weekScores.length > 0
        ? `Tu promedio reciente esta en ${Math.round(weeklyAverage)} y la variacion visible va ${weeklyDeltaPct != null ? `${weeklyDeltaPct > 0 ? '+' : ''}${weeklyDeltaPct}%` : 'sin base suficiente'}.`
        : 'Premium cobra mas sentido cuando ya hay varias semanas de datos para cruzar senales y progreso.',
      trialOfferDays && trialOfferDays > 0
        ? `Tienes ${trialOfferDays} dias de trial para probar historial profundo, menos friccion y una lectura mas completa.`
        : 'Premium cobra mas valor cuando quieres menos friccion, menos anuncios y contexto mas profundo del sistema.',
    ],
    [history.length, trialOfferDays, weekScores.length, weeklyAverage, weeklyDeltaPct],
  );

  const handleStartSubscription = useCallback(async () => {
    setLoading(true);

    try {
      const result = await createSubscription(selectedPlan);
      if (!result?.approvalUrl || !result.subscriptionId) {
        Alert.alert('No pudimos abrir PayPal', 'Intenta otra vez en unos segundos.');
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
      return;
    }

    const outcome = await confirmSubscriptionFlow(subscriptionId);
    if (outcome === 'active') {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setStep('success');
      return;
    }

    if (outcome === 'pending') {
      Alert.alert('Todavia en proceso', 'PayPal aun no termino de confirmar la activacion.');
      return;
    }

    setStep('plans');
    Alert.alert('No pudimos confirmarlo', 'Vuelve a intentarlo en unos segundos.');
  }, [checkStatus, confirmSubscriptionFlow, subscriptionId]);

  if (step === 'success') {
    return (
      <SafeScreen padHorizontal={false} padBottom>
        <Header title="Premium activo" showBack color={Colors.premium} />
        <StateScreen
          title="Tu cuenta ya quedo del lado Premium."
          body="Se activaron tus beneficios y la app ya puede operar con menos friccion y una capa de analisis mas profunda."
          primaryLabel="Ir al inicio"
          onPrimary={() => router.replace('/(tabs)' as never)}
        />
      </SafeScreen>
    );
  }

  if (step === 'pending') {
    return (
      <SafeScreen padHorizontal={false} padBottom>
        <Header title="Confirmando Premium" showBack color={Colors.premium} />
        <StateScreen
          title="Estamos revisando tu pago."
          body="Cuando PayPal cierre la activacion, VYRA actualiza tu cuenta automaticamente. No necesitas entender estados tecnicos para seguir."
          primaryLabel={confirming ? 'Revisando...' : 'Actualizar estado'}
          onPrimary={() => void handlePendingRefresh()}
          secondaryLabel="Volver a planes"
          onSecondary={() => setStep('plans')}
          loading={confirming}
        />
      </SafeScreen>
    );
  }

  return (
    <SafeScreen padHorizontal={false} padBottom>
      <Header title="Premium" showBack color={Colors.premium} />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Card accentColor={Colors.premium}>
          <Text style={styles.eyebrow}>{contextCopy.eyebrow}</Text>
          <Text style={styles.heroTitle}>{contextCopy.title}</Text>
          <Text style={styles.heroBody}>{contextCopy.body}</Text>

          {status?.isInTrial && trialDaysLeft > 0 ? (
            <View style={styles.trialPill}>
              <Text style={styles.trialText}>Trial activo · {trialDaysLeft} dias restantes</Text>
            </View>
          ) : trialOfferDays && trialOfferDays > 0 ? (
            <View style={styles.trialPill}>
              <Text style={styles.trialText}>Empiezas con {trialOfferDays} dias de trial antes de pagar</Text>
            </View>
          ) : null}
        </Card>

        <Card>
          <Text style={styles.sectionTitle}>Tu Premium personalizado</Text>
          <Text style={styles.personalizedIntro}>
            Basado en tu uso real reciente, esto es lo que Premium te desbloquea mejor:
          </Text>
          <View style={styles.highlightStack}>
            {personalizedBullets.map((item) => (
              <View key={item} style={styles.highlightRow}>
                <View style={styles.highlightDot} />
                <Text style={styles.highlightText}>{item}</Text>
              </View>
            ))}
          </View>
        </Card>

        <Card>
          <Text style={styles.sectionTitle}>Lo que mas importa aqui</Text>
          <View style={styles.highlightStack}>
            {highlights.map((item) => (
              <View key={item} style={styles.highlightRow}>
                <View style={styles.highlightDot} />
                <Text style={styles.highlightText}>{item}</Text>
              </View>
            ))}
          </View>
        </Card>

        <Card>
          <Text style={styles.sectionTitle}>Free vs Premium</Text>
          <View style={styles.compareStack}>
            {COMPARISON_ROWS.map(([label, free, premium]) => (
              <View key={label} style={styles.compareRow}>
                <Text style={styles.compareLabel}>{label}</Text>
                <View style={styles.compareValues}>
                  <Text style={styles.compareFree}>{free}</Text>
                  <Text style={styles.comparePremium}>{premium}</Text>
                </View>
              </View>
            ))}
          </View>
        </Card>

        <Text style={styles.sectionTitle}>Elige tu plan</Text>

        <Animated.View style={monthlyStyle}>
          <TouchableOpacity
            activeOpacity={0.92}
            style={[styles.planCard, selectedPlan === 'monthly' && styles.planCardActive]}
            onPress={() => selectPlan('monthly')}
          >
            <View style={styles.planCopy}>
              <Text style={styles.planLabel}>Mensual</Text>
              <Text style={styles.planPrice}>$12.99 / mes</Text>
              <Text style={styles.planNote}>Sin permanencia. Mantienes control total.</Text>
            </View>
            <View style={[styles.radio, selectedPlan === 'monthly' && styles.radioActive]} />
          </TouchableOpacity>
        </Animated.View>

        <Animated.View style={yearlyStyle}>
          <TouchableOpacity
            activeOpacity={0.92}
            style={[styles.planCard, selectedPlan === 'yearly' && styles.planCardActive]}
            onPress={() => selectPlan('yearly')}
          >
            <View style={styles.planBadge}>
              <Text style={styles.planBadgeText}>Ahorra 36%</Text>
            </View>
            <View style={styles.planCopy}>
              <Text style={styles.planLabel}>Anual</Text>
              <Text style={styles.planPrice}>$99.99 / ano</Text>
              <Text style={styles.planNote}>Equivale a $8.33 al mes y evita decision mensual.</Text>
            </View>
            <View style={[styles.radio, selectedPlan === 'yearly' && styles.radioActive]} />
          </TouchableOpacity>
        </Animated.View>

        <Button onPress={() => void handleStartSubscription()} loading={loading} fullWidth color={Colors.premium}>
          {loading
            ? 'Abriendo PayPal...'
            : trialOfferDays && trialOfferDays > 0
              ? 'Empezar trial con PayPal'
              : 'Continuar con PayPal'}
        </Button>

        <Text style={styles.disclaimer}>
          Se abrira PayPal para confirmar la compra. Luego puedes gestionar o cancelar la renovacion
          desde VYRA o desde PayPal, sin pantallas agresivas.
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
  eyebrow: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.xs,
    color: Colors.premium,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  heroTitle: {
    fontFamily: FontFamily.display,
    fontSize: 30,
    lineHeight: 32,
    color: Colors.textPrimary,
    marginBottom: 6,
  },
  heroBody: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    lineHeight: 20,
    color: Colors.textSecondary,
  },
  trialPill: {
    alignSelf: 'flex-start',
    marginTop: Spacing[3],
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: withOpacity(Colors.success, 0.22),
    backgroundColor: withOpacity(Colors.success, 0.12),
    paddingHorizontal: Spacing[3],
    paddingVertical: 6,
  },
  trialText: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.xs,
    color: Colors.success,
  },
  sectionTitle: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.base,
    color: Colors.textPrimary,
  },
  personalizedIntro: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    lineHeight: 20,
    color: Colors.textSecondary,
    marginBottom: Spacing[2],
  },
  highlightStack: {
    gap: Spacing[2],
  },
  highlightRow: {
    flexDirection: 'row',
    gap: Spacing[2],
  },
  highlightDot: {
    width: 6,
    height: 6,
    borderRadius: Radius.full,
    marginTop: 7,
    backgroundColor: withOpacity(Colors.premium, 0.6),
  },
  highlightText: {
    flex: 1,
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    lineHeight: 20,
    color: Colors.textSecondary,
  },
  compareStack: {
    gap: Spacing[3],
  },
  compareRow: {
    gap: 6,
  },
  compareLabel: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.sm,
    color: Colors.textPrimary,
  },
  compareValues: {
    gap: 4,
  },
  compareFree: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    color: Colors.textMuted,
  },
  comparePremium: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.xs,
    color: Colors.premium,
  },
  planCard: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing[3],
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.bgSurface,
    padding: Spacing[4],
    marginBottom: Spacing[2],
  },
  planCardActive: {
    borderColor: withOpacity(Colors.premium, 0.5),
    backgroundColor: withOpacity(Colors.premium, 0.1),
  },
  planCopy: {
    flex: 1,
    gap: 4,
  },
  planBadge: {
    position: 'absolute',
    top: -10,
    left: Spacing[4],
    borderRadius: Radius.full,
    backgroundColor: Colors.premium,
    paddingHorizontal: Spacing[2],
    paddingVertical: 3,
  },
  planBadgeText: {
    fontFamily: FontFamily.bold,
    fontSize: 11,
    color: Colors.bgPrimary,
  },
  planLabel: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.base,
    color: Colors.textPrimary,
  },
  planPrice: {
    fontFamily: FontFamily.display,
    fontSize: 28,
    lineHeight: 28,
    color: Colors.premium,
  },
  planNote: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    lineHeight: 18,
    color: Colors.textSecondary,
    maxWidth: '90%',
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: Radius.full,
    borderWidth: 2,
    borderColor: Colors.border,
  },
  radioActive: {
    borderColor: Colors.premium,
    backgroundColor: Colors.premium,
  },
  disclaimer: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    lineHeight: 18,
    color: Colors.textMuted,
    textAlign: 'center',
  },
  stateScreen: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: Spacing[6],
    gap: Spacing[3],
  },
  stateTitle: {
    fontFamily: FontFamily.display,
    fontSize: 30,
    lineHeight: 32,
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  stateBody: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    lineHeight: 20,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
});
