import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Header from '@/components/layout/Header';
import VyraBalanceCard from '@/components/home/VyraBalanceCard';
import BottomSheet from '@/components/ui/BottomSheet';
import Card from '@/components/ui/Card';
import NoticeCard from '@/components/ui/NoticeCard';
import SafeScreen from '@/components/ui/SafeScreen';
import ScreenFooterSpacer from '@/components/ui/ScreenFooterSpacer';
import { Colors, withOpacity } from '@/constants/colors';
import { FontFamily, FontSize, Radius, Spacing } from '@/constants/theme';
import { useFasting } from '@/hooks/useFasting';
import { useFemaleHealth } from '@/hooks/useFemaleHealth';
import { useNutrition } from '@/hooks/useNutrition';
import { useReadiness } from '@/hooks/useReadiness';
import { useSleep } from '@/hooks/useSleep';
import { useSteps } from '@/hooks/useSteps';
import { useSupplements } from '@/hooks/useSupplements';
import { useWater } from '@/hooks/useWater';
import { useWorkout } from '@/hooks/useWorkout';
import { buildVyraBalanceContributions, getVyraBalanceCoachLine } from '@/lib/vyra-balance';
import { useSettingsStore } from '@/stores/settingsStore';

function formatSleepHours(hours: number) {
  if (!hours) return 'Sin dato';
  const totalMinutes = Math.round(hours * 60);
  const wholeHours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${wholeHours}h ${minutes.toString().padStart(2, '0')}m`;
}

function formatLiters(value: number) {
  return `${(value / 1000).toFixed(1)}L`;
}

function formatDateLabel(dateIso: string | undefined) {
  if (!dateIso) return '';
  const date = new Date(`${dateIso}T12:00:00`);
  return new Intl.DateTimeFormat('es-UY', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(date);
}

function formulaCopy(key: string) {
  switch (key) {
    case 'sleep':
      return 'Sueño pesa 40% del score visible. Tomamos la calidad diaria y la convertimos a un máximo de 40 puntos.';
    case 'activity':
      return 'Actividad pesa 20%. Resume movimiento y carga reciente para que el balance no dependa solo de una sesión aislada.';
    case 'nutrition':
      return 'Nutrición pesa 15%. Se basa en cobertura del objetivo diario y consistencia de macros registrados.';
    case 'hydration':
      return 'Pasos + Agua pesan 15%. Mezcla hidratación y avance de pasos para reflejar base física del día.';
    case 'recovery':
    default:
      return 'El resto pesa 10%. Aquí entran ayuno, female, suplementos y contexto general de recuperación.';
  }
}

function SectionCard({
  title,
  body,
  contribution,
  onExplain,
}: {
  title: string;
  body: string;
  contribution: string;
  onExplain: () => void;
}) {
  return (
    <Card style={styles.sectionCard} shadow={false}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <Text style={styles.sectionBody}>{body}</Text>
      <Text style={styles.sectionContribution}>Aporte al score: {contribution}</Text>
      <Pressable
        onPress={onExplain}
        style={styles.formulaLink}
        accessibilityRole="button"
        accessibilityLabel={`Explicar ${title}`}
        accessibilityHint="Abre el detalle de calculo para esta seccion."
      >
        <Text style={styles.formulaLinkText}>¿Cómo se calcula?</Text>
      </Pressable>
    </Card>
  );
}

export default function ReadinessScreen() {
  const [selectedFormula, setSelectedFormula] = useState<string | null>(null);
  const hasSeenGuide = useSettingsStore((state) => Boolean(state.moduleIntroSeen.readiness));
  const markModuleIntroSeen = useSettingsStore((state) => state.markModuleIntroSeen);
  const { dailyScore } = useReadiness();
  const { lastDurationHours, lastScore } = useSleep();
  const { totals, simpleTargets } = useNutrition();
  const { progressPct: stepProgress } = useSteps();
  const { totalHydro, goal } = useWater();
  const { history } = useWorkout();
  const { isActive: fastingActive, elapsedHours } = useFasting();
  const { currentPhase, isInCycle } = useFemaleHealth();
  const { todayLogs } = useSupplements();

  const contributions = useMemo(
    () => buildVyraBalanceContributions(dailyScore, stepProgress),
    [dailyScore, stepProgress],
  );
  const contributionMap = new Map(contributions.map((item) => [item.key, item]));
  const activityContribution = contributionMap.get('activity');
  const sleepContribution = contributionMap.get('sleep');
  const nutritionContribution = contributionMap.get('nutrition');
  const hydrationContribution = contributionMap.get('hydration');
  const recoveryContribution = contributionMap.get('recovery');

  const lastWorkout = history[0];
  const nutritionPct = simpleTargets.calories > 0 ? Math.round((totals.calories / simpleTargets.calories) * 100) : 0;
  const recoveryBits = [
    fastingActive ? `Ayuno ${elapsedHours.toFixed(1)}h` : null,
    isInCycle ? `Fase ${currentPhase}` : null,
    todayLogs.length ? `${todayLogs.length} tomas de suplementos` : null,
  ].filter(Boolean);

  return (
    <SafeScreen padHorizontal={false} padBottom={false}>
      <Header
        title="VYRA Balance de hoy"
        subtitle={formatDateLabel(dailyScore?.date)}
        showBack
        color={Colors.action}
      />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {!hasSeenGuide ? (
          <NoticeCard
            title="Como usar VYRA Balance"
            body="Este score sirve para orientar el dia, no para juzgarlo. Miralo como una mezcla de sueno, actividad, nutricion, hidratacion y recuperacion."
            tone="info"
            actionLabel="Entendido"
            onAction={() => markModuleIntroSeen('readiness')}
          />
        ) : null}

        <VyraBalanceCard score={dailyScore} stepsPct={stepProgress} />

        <Card style={styles.heroCard} shadow={false}>
          <Text style={styles.heroNumber}>{dailyScore ? Math.round(dailyScore.score) : '--'}</Text>
          <Text style={styles.heroBody}>
            {dailyScore ? getVyraBalanceCoachLine(dailyScore.score) : 'Registra hoy para construir tu balance.'}
          </Text>
        </Card>

        <SectionCard
          title="Sueño"
          body={`${formatSleepHours(lastDurationHours)} | Calidad: ${Math.round(lastScore || 0)}/100`}
          contribution={`${Math.round(sleepContribution?.score ?? 0)}/${sleepContribution?.max ?? 40}`}
          onExplain={() => setSelectedFormula('sleep')}
        />

        <SectionCard
          title="Actividad"
          body={
            lastWorkout
              ? `Entrenaste ${new Date(lastWorkout.started_at).toLocaleDateString('es-UY')} | Volumen ${Math.round(lastWorkout.total_volume_kg ?? 0).toLocaleString('es-UY')} kg`
              : 'Sin sesión reciente registrada todavía.'
          }
          contribution={`${Math.round(activityContribution?.score ?? 0)}/${activityContribution?.max ?? 20}`}
          onExplain={() => setSelectedFormula('activity')}
        />

        <SectionCard
          title="Nutrición"
          body={`${Math.round(totals.calories)} kcal | ${nutritionPct}% de meta`}
          contribution={`${Math.round(nutritionContribution?.score ?? 0)}/${nutritionContribution?.max ?? 15}`}
          onExplain={() => setSelectedFormula('nutrition')}
        />

        <SectionCard
          title="Pasos + Agua"
          body={`${Math.round(stepProgress)}% de pasos | ${formatLiters(totalHydro)} / ${formatLiters(goal)}`}
          contribution={`${Math.round(hydrationContribution?.score ?? 0)}/${hydrationContribution?.max ?? 15}`}
          onExplain={() => setSelectedFormula('hydration')}
        />

        <SectionCard
          title="Resto"
          body={recoveryBits.length ? recoveryBits.join(' | ') : 'Sin contexto extra suficiente aún.'}
          contribution={`${Math.round(recoveryContribution?.score ?? 0)}/${recoveryContribution?.max ?? 10}`}
          onExplain={() => setSelectedFormula('recovery')}
        />

        <Text style={styles.footerText}>El score se recalcula cada vez que registras algo.</Text>
        <ScreenFooterSpacer />
      </ScrollView>

      <BottomSheet
        visible={selectedFormula !== null}
        onClose={() => setSelectedFormula(null)}
        title="Cómo se calcula"
        snapHeight={300}
      >
        <View style={styles.sheetContent}>
          <Text style={styles.sheetText}>{formulaCopy(selectedFormula ?? 'recovery')}</Text>
        </View>
      </BottomSheet>
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingHorizontal: Spacing[5],
    gap: Spacing[4],
  },
  heroCard: {
    gap: Spacing[2],
    alignItems: 'flex-start',
    borderWidth: 1,
    borderColor: withOpacity(Colors.action, 0.14),
    backgroundColor: withOpacity(Colors.action, 0.04),
  },
  heroNumber: {
    fontFamily: FontFamily.black,
    fontSize: FontSize['4xl'],
    lineHeight: FontSize['4xl'],
    color: Colors.action,
    letterSpacing: -3,
  },
  heroBody: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.base,
    color: Colors.textPrimary,
    lineHeight: 22,
  },
  sectionCard: {
    gap: Spacing[2],
  },
  sectionTitle: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.lg,
    color: Colors.textPrimary,
  },
  sectionBody: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  sectionContribution: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.sm,
    color: Colors.textPrimary,
  },
  formulaLink: {
    alignSelf: 'flex-start',
    borderRadius: Radius.full,
    backgroundColor: Colors.bgElevated,
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[2],
  },
  formulaLinkText: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
  },
  footerText: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    lineHeight: 18,
  },
  sheetContent: {
    paddingBottom: Spacing[5],
  },
  sheetText: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.base,
    color: Colors.textPrimary,
    lineHeight: 22,
  },
});

