import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import SafeScreen from '@/components/ui/SafeScreen';
import { Header } from '@/components/layout/Header';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import MonetizationBridgeCard from '@/components/ui/MonetizationBridgeCard';
import { Colors, withOpacity } from '@/constants/colors';
import { Routes } from '@/constants/routes';
import { FontFamily, FontSize, Radius, Spacing } from '@/constants/theme';
import { getPayPalHealth } from '@/services/backend/paypal';
import { usePremium } from '@/hooks/usePremium';
import { useReadiness } from '@/hooks/useReadiness';
import { useAuthStore } from '@/stores/authStore';

const PLAN_ROWS = [
  {
    key: 'free',
    label: 'Gratis',
    price: '$0',
    cadence: 'sin cobro',
    emphasis: 'Base',
    summary: 'Sirve para entrar, pero te deja mas memoria manual y mas pasos muertos.',
  },
  {
    key: 'monthly',
    label: 'Mensual',
    price: '$12.99',
    cadence: 'por mes',
    emphasis: 'Flexible',
    summary: 'Mejor cuando quieres activar direccion hoy sin pedirte una apuesta larga.',
  },
  {
    key: 'yearly',
    label: 'Anual',
    price: '$99.99',
    cadence: 'por ano',
    emphasis: '36% ahorro',
    summary: 'Mejor cuando VYRA ya es capa diaria y conviene sostener continuidad sin renegociar.',
  },
] as const;

const ECONOMY_PILLARS = [
  {
    icon: 'flash-outline' as const,
    title: 'Menos friccion por apertura',
    body: 'Coach, resumen y rutas premium quedan mas cerca de la accion correcta cuando el dia ya viene cargado.',
  },
  {
    icon: 'git-network-outline' as const,
    title: 'Mejor retorno del sistema',
    body: 'El valor no esta solo en mas acceso: esta en que modulos, coach y progreso hablan mejor entre si.',
  },
  {
    icon: 'cash-outline' as const,
    title: 'Precio con criterio',
    body: 'La mejor compra no es la mas barata; es la que hoy te devuelve direccion suficiente como para sostener adherencia real.',
  },
] as const;

type RouteStatProps = {
  label: string;
  value: string;
  hint: string;
  accent?: string;
};

function RouteStat({ label, value, hint, accent = Colors.textPrimary }: RouteStatProps) {
  return (
    <View style={styles.routeStatCard}>
      <Text style={styles.routeStatLabel}>{label}</Text>
      <Text style={[styles.routeStatValue, { color: accent }]}>{value}</Text>
      <Text style={styles.routeStatHint}>{hint}</Text>
    </View>
  );
}

type PlanCardProps = {
  label: string;
  price: string;
  cadence: string;
  emphasis: string;
  summary: string;
  accent: string;
  isSuggested?: boolean;
  isCurrent?: boolean;
};

function PlanCard({
  label,
  price,
  cadence,
  emphasis,
  summary,
  accent,
  isSuggested = false,
  isCurrent = false,
}: PlanCardProps) {
  return (
    <View
      style={[
        styles.planCard,
        {
          borderColor: withOpacity(accent, isSuggested || isCurrent ? 0.36 : 0.14),
          backgroundColor: withOpacity(accent, isSuggested || isCurrent ? 0.08 : 0.03),
        },
      ]}
    >
      <View style={styles.planHeader}>
        <View>
          <Text style={styles.planLabel}>{label}</Text>
          <Text style={[styles.planPrice, { color: accent }]}>{price}</Text>
          <Text style={styles.planCadence}>{cadence}</Text>
        </View>
        <View style={[styles.planTag, { borderColor: withOpacity(accent, 0.24) }]}>
          <Text style={[styles.planTagText, { color: accent }]}>{emphasis}</Text>
        </View>
      </View>
      <Text style={styles.planSummary}>{summary}</Text>
      {(isSuggested || isCurrent) ? (
        <View style={styles.planFooter}>
          <Ionicons name={isCurrent ? 'checkmark-circle' : 'sparkles'} size={14} color={accent} />
          <Text style={[styles.planFooterText, { color: accent }]}>
            {isCurrent ? 'Tu plan actual' : 'Encaja mejor hoy'}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

export default function PremiumPricingScreen() {
  const session = useAuthStore((state) => state.session);
  const profile = useAuthStore((state) => state.profile);
  const { status } = usePremium();
  const { dailyScore, predictedScore, weeklyAverage, scoreColor, similarDayComparison, focusActions, morningNarrative } = useReadiness();
  const [trialDays, setTrialDays] = useState(0);

  useEffect(() => {
    let mounted = true;
    void (async () => {
      const health = await getPayPalHealth();
      if (!mounted || !health) return;
      setTrialDays(health.trialDays ?? 0);
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const isAuthenticated = Boolean(session?.user);
  const coachName = profile?.coach_name_preference ?? 'Vyra';
  const dayScore = dailyScore?.score != null ? Math.round(dailyScore.score) : null;
  const scoreAccent = dayScore !== null ? scoreColor(dayScore) : Colors.premium;
  const scoreVsWeek = dayScore !== null && weeklyAverage !== null ? Math.round(dayScore - weeklyAverage) : null;
  const suggestedPlan = useMemo<'monthly' | 'yearly'>(() => {
    if (status?.plan === 'yearly' || status?.plan === 'monthly') return status.plan;
    if (dayScore !== null && dayScore >= 58) return 'yearly';
    return 'monthly';
  }, [dayScore, status?.plan]);
  const returnMode = status?.isActive
    ? status?.plan === 'yearly'
      ? 'Fuerte'
      : 'Activo'
    : suggestedPlan === 'yearly'
      ? 'Largo'
      : 'Flexible';
  const rhythmLabel = similarDayComparison
    ? similarDayComparison.delta > 0
      ? 'Por encima'
      : similarDayComparison.delta < 0
        ? 'Por debajo'
        : 'En linea'
    : weeklyAverage !== null
      ? `${Math.round(weeklyAverage)}`
      : 'Sin base';
  const weakestMetric = useMemo(() => {
    if (!dailyScore?.breakdown) return null;
    return Object.entries(dailyScore.breakdown).sort((a, b) => Number(a[1]) - Number(b[1]))[0]?.[0] ?? null;
  }, [dailyScore?.breakdown]);
  const routeTitle = status?.isActive
    ? `${coachName} quiere que el plan siga simple.`
    : suggestedPlan === 'yearly'
      ? `${coachName} ve que el anual conviene cuando VYRA ya es capa diaria.`
      : `${coachName} ve que el mensual encaja mejor si hoy quieres activar Premium sin mas peso.`;
  const routeBody = status?.isActive
    ? 'Si Premium ya esta vivo, el pricing no tiene que abrir otra ansiedad. Solo toca sostener el plan que mejor protege continuidad.'
    : suggestedPlan === 'yearly'
      ? 'El anual vale cuando coach, resumen y direccion ya te devuelven algo todos los dias. Ahi compras menos renegociacion.'
      : 'El mensual vale cuando quieres entrar con menos barrera y comprobar el encaje sin cargarle mas peso al dia.';
  const nextReading = status?.isActive
    ? 'Si Premium ya esta activo, la decision util es sostener el plan que mas baja friccion sin abrir otra renegociacion innecesaria.'
    : focusActions[0]
      ? `Si hoy tu siguiente accion es ${focusActions[0].title.toLowerCase()}, conviene elegir el plan que haga esa ruta mas sostenible y no solo mas accesible.`
      : morningNarrative ??
        'El pricing sirve cuando te deja decidir con contexto: activar, esperar o sostener el sistema con menos ruido del necesario.';
  const primaryActionLabel = status?.isActive
    ? 'Abrir gestion premium'
    : suggestedPlan === 'yearly'
      ? 'Abrir paywall anual'
      : 'Abrir paywall mensual';

  const handlePrimaryAction = () => {
    if (status?.isActive) {
      router.push(Routes.premium.manage as any);
      return;
    }
    router.push(`${Routes.premium.paywall}?plan=${suggestedPlan}` as any);
  };

  return (
    <SafeScreen padHorizontal={false} padBottom>
      <Header title="Pricing premium" showBack color={Colors.premium} />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Card style={styles.heroCard} accentColor={Colors.premium}>
          <Text style={styles.heroEyebrow}>Pricing con criterio</Text>
          <Text style={styles.heroTitle}>{routeTitle}</Text>
          <Text style={styles.heroBody}>{routeBody}</Text>
          <View style={styles.heroPills}>
            <View style={styles.heroPill}>
              <Text style={styles.heroPillValue}>{status?.isActive ? 'Activo' : 'Libre'}</Text>
              <Text style={styles.heroPillLabel}>estado</Text>
            </View>
            <View style={styles.heroPill}>
              <Text style={styles.heroPillValue}>{suggestedPlan === 'yearly' ? 'Anual' : 'Mensual'}</Text>
              <Text style={styles.heroPillLabel}>encaje hoy</Text>
            </View>
            <View style={styles.heroPill}>
              <Text style={styles.heroPillValue}>{trialDays > 0 ? `${trialDays}d` : 'Directo'}</Text>
              <Text style={styles.heroPillLabel}>ventana</Text>
            </View>
          </View>
        </Card>

        <Card style={styles.valueCard} accentColor={Colors.premium}>
          <Text style={styles.sectionEyebrow}>Comparativa del pricing</Text>
          <Text style={styles.sectionTitle}>Elige por continuidad, no por ansiedad.</Text>
          <View style={styles.planList}>
            {PLAN_ROWS.map((plan) => (
              <PlanCard
                key={plan.key}
                label={plan.label}
                price={plan.price}
                cadence={plan.cadence}
                emphasis={plan.emphasis}
                summary={plan.summary}
                accent={plan.key === 'yearly' ? Colors.premium : plan.key === 'monthly' ? Colors.coach : Colors.textPrimary}
                isSuggested={plan.key === suggestedPlan && !status?.isActive}
                isCurrent={Boolean(status?.isActive && status?.plan === plan.key)}
              />
            ))}
          </View>
        </Card>

        <Card style={styles.valueCard} accentColor={Colors.premium}>
          <Text style={styles.sectionEyebrow}>Siguiente accion util</Text>
          <Text style={styles.sectionTitle}>
            {status?.isActive
              ? 'Si el plan actual ya funciona, no hace falta meter mas ruido.'
              : suggestedPlan === 'yearly'
                ? 'Si VYRA ya es capa diaria, el anual protege mejor el sistema.'
                : 'Si todavia estas validando, el mensual entra con menos peso y mas flexibilidad.'}
          </Text>
          <Text style={styles.sectionBody}>
            {status?.isActive
              ? 'La mejor accion puede ser simplemente sostener Premium y volver al sistema a usarlo mejor. Cambiar por ansiedad suele agregar ruido.'
              : suggestedPlan === 'yearly'
                ? 'Activa el anual si ya sabes que direccion, coach y ahorro de friccion te sirven todos los dias. Si no, espera sin culpa.'
                : 'Activa el mensual si hoy quieres probar la capa premium con una barrera mas liviana. Si aun no te devuelve valor real, mejor esperar.'}
          </Text>
          <View style={styles.routeActions}>
            <Button onPress={handlePrimaryAction} color={Colors.premium} fullWidth>
              {primaryActionLabel}
            </Button>
            <Button onPress={() => router.push(Routes.premium.economy as any)} variant="ghost" color={Colors.coach} fullWidth>
              Ver economia del sistema
            </Button>
          </View>
        </Card>

        <Card style={styles.routeCard} accentColor={Colors.premium}>
          <Text style={styles.routeEyebrow}>Ruta del pricing</Text>
          <Text style={styles.routeTitle}>El precio bueno te deja elegir sin ansiedad.</Text>
          <Text style={styles.routeBody}>
            {isAuthenticated
              ? `${coachName} quiere que precio, valor y retorno se lean como una sola cosa. Si hoy Premium reduce friccion real, el plan correcto es el que mejor sostiene ese beneficio.`
              : 'Incluso sin sesion, pricing ya puede decir si conviene activar, esperar o entrar con menos peso sin romper continuidad futura.'}
          </Text>
          <View style={styles.routeStats}>
            <RouteStat
              label="Score"
              value={dayScore !== null ? `${dayScore}` : '--'}
              hint={predictedScore !== null ? `cierre ${predictedScore}` : 'sin score'}
              accent={scoreAccent}
            />
            <RouteStat label="Retorno" value={returnMode} hint="lectura del plan" accent={Colors.coach} />
            <RouteStat
              label="Ritmo"
              value={scoreVsWeek !== null ? `${scoreVsWeek > 0 ? '+' : ''}${scoreVsWeek}` : rhythmLabel}
              hint={scoreVsWeek !== null ? 'vs. semana' : similarDayComparison ? 'dia comparable' : 'promedio'}
              accent={scoreVsWeek !== null && scoreVsWeek < 0 ? Colors.warning : Colors.textPrimary}
            />
          </View>
          <View style={styles.routeFocusCard}>
            <Text style={styles.routeFocusLabel}>Siguiente lectura</Text>
            <Text style={styles.routeFocusTitle}>
              {status?.isActive ? 'Sostener el plan que mas continuidad te devuelve.' : 'Activar solo el plan que hoy te ahorra friccion real.'}
            </Text>
            <Text style={styles.routeFocusHint}>{nextReading}</Text>
          </View>
          <View style={styles.routeActions}>
            <Button onPress={handlePrimaryAction} size="sm" color={Colors.coach}>
              {primaryActionLabel}
            </Button>
            <Button onPress={() => router.push(Routes.dailySummary as any)} size="sm" variant="ghost" color={Colors.coach}>
              Abrir resumen
            </Button>
          </View>
        </Card>

        <Card style={styles.valueCard}>
          <Text style={styles.sectionEyebrow}>Valor por tension</Text>
          <Text style={styles.sectionTitle}>El plan correcto cambia segun la friccion que hoy te pesa mas.</Text>
          <Text style={styles.sectionBody}>
            {weakestMetric
              ? `Tu cuello de botella mas flojo hoy parece venir de ${weakestMetric}. Si Premium te va a ayudar ahi, toca elegir el plan que puedas sostener sin resentir la economia ni romper el ritmo.`
              : 'Cuando todavia no hay suficiente lectura, conviene usar pricing como una forma de entrar con criterio y no comprar por inercia.'}
          </Text>
          <View style={styles.pillarList}>
            {ECONOMY_PILLARS.map((pillar) => (
              <View key={pillar.title} style={styles.pillarRow}>
                <View style={styles.pillarIconWrap}>
                  <Ionicons name={pillar.icon} size={16} color={Colors.premium} />
                </View>
                <View style={styles.pillarCopy}>
                  <Text style={styles.pillarTitle}>{pillar.title}</Text>
                  <Text style={styles.pillarBody}>{pillar.body}</Text>
                </View>
              </View>
            ))}
          </View>
        </Card>

        <MonetizationBridgeCard
          current="pricing"
          body="Si el precio ya se entiende, el siguiente paso deberia poder saltar a valor, economia, tienda o rewarded sin romper la continuidad."
          hint="Pricing no tendria que empujarte por ansiedad: usa este puente para comprobar si hoy conviene activar, esperar o mover coins con mas criterio."
        />
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
    gap: Spacing[3],
  },
  heroEyebrow: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.xs,
    color: Colors.premium,
    letterSpacing: 0.2,
  },
  heroTitle: {
    fontFamily: FontFamily.display,
    fontSize: FontSize['2xl'],
    lineHeight: 38,
    color: Colors.textPrimary,
  },
  heroBody: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    lineHeight: 22,
    color: Colors.textSecondary,
  },
  heroPills: {
    flexDirection: 'row',
    gap: Spacing[2],
    flexWrap: 'wrap',
  },
  heroPill: {
    flex: 1,
    minWidth: 96,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: withOpacity(Colors.premium, 0.16),
    backgroundColor: withOpacity(Colors.white, 0.03),
    padding: Spacing[3],
    gap: 2,
  },
  heroPillValue: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.sm,
    color: Colors.textPrimary,
    textTransform: 'capitalize',
  },
  heroPillLabel: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
  },
  routeCard: {
    gap: Spacing[4],
  },
  routeEyebrow: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.xs,
    color: Colors.coach,
    letterSpacing: 0.2,
  },
  routeTitle: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.xl,
    lineHeight: 30,
    color: Colors.textPrimary,
  },
  routeBody: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    lineHeight: 22,
    color: Colors.textSecondary,
  },
  routeStats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing[3],
  },
  routeStatCard: {
    flex: 1,
    minWidth: 96,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: withOpacity(Colors.premium, 0.12),
    backgroundColor: withOpacity(Colors.white, 0.03),
    padding: Spacing[3],
    gap: 4,
  },
  routeStatLabel: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  routeStatValue: {
    fontFamily: FontFamily.display,
    fontSize: FontSize.xl,
  },
  routeStatHint: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  routeFocusCard: {
    borderRadius: Radius.xl,
    backgroundColor: withOpacity(Colors.coach, 0.08),
    padding: Spacing[4],
    gap: Spacing[1],
  },
  routeFocusLabel: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.xs,
    color: Colors.coach,
    letterSpacing: 0.2,
  },
  routeFocusTitle: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.lg,
    lineHeight: 26,
    color: Colors.textPrimary,
  },
  routeFocusHint: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    lineHeight: 22,
    color: Colors.textSecondary,
  },
  routeActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing[2],
  },
  valueCard: {
    gap: Spacing[4],
  },
  sectionEyebrow: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.xs,
    color: Colors.premium,
    letterSpacing: 0.2,
  },
  sectionTitle: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.xl,
    lineHeight: 30,
    color: Colors.textPrimary,
  },
  sectionBody: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    lineHeight: 22,
    color: Colors.textSecondary,
  },
  planList: {
    gap: Spacing[3],
  },
  planCard: {
    borderRadius: Radius.xl,
    borderWidth: 1,
    padding: Spacing[4],
    gap: Spacing[3],
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing[3],
  },
  planLabel: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  planPrice: {
    fontFamily: FontFamily.display,
    fontSize: FontSize['2xl'],
  },
  planCadence: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
  },
  planTag: {
    alignSelf: 'flex-start',
    borderRadius: Radius.full,
    borderWidth: 1,
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[1],
  },
  planTagText: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.xs,
  },
  planSummary: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    lineHeight: 22,
    color: Colors.textSecondary,
  },
  planFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[2],
  },
  planFooterText: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.xs,
  },
  pillarList: {
    gap: Spacing[3],
  },
  pillarRow: {
    flexDirection: 'row',
    gap: Spacing[3],
    alignItems: 'flex-start',
  },
  pillarIconWrap: {
    width: 30,
    height: 30,
    borderRadius: Radius.full,
    backgroundColor: withOpacity(Colors.premium, 0.12),
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  pillarCopy: {
    flex: 1,
    gap: 4,
  },
  pillarTitle: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.sm,
    color: Colors.textPrimary,
  },
  pillarBody: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    lineHeight: 22,
    color: Colors.textSecondary,
  },
});
