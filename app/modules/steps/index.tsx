import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import Header from '@/components/layout/Header';
import ModuleIntroScreen from '@/components/modules/ModuleIntroScreen';
import ProgressCircle from '@/components/charts/ProgressCircle';
import Card from '@/components/ui/Card';
import SafeScreen from '@/components/ui/SafeScreen';
import { Colors, withOpacity } from '@/constants/colors';
import { Routes } from '@/constants/routes';
import { FontFamily, FontSize, Radius, Spacing } from '@/constants/theme';
import { useSteps } from '@/hooks/useSteps';
import { visibleRatioPercent } from '@/lib/visual-progress';
import { useSettingsStore } from '@/stores/settingsStore';

function formatDistance(valueKm: number | string, unit: 'km' | 'mi') {
  const numeric = typeof valueKm === 'number' ? valueKm : parseFloat(valueKm) || 0;
  const converted = unit === 'mi' ? numeric * 0.621371 : numeric;
  return `${converted.toFixed(1)} ${unit}`;
}

function buildStepsMessage(progressPct: number, remaining: number, totalSteps: number) {
  if (progressPct >= 110) return `Superaste tu meta. ${totalSteps.toLocaleString('es')} pasos hoy.`;
  if (progressPct >= 100) return `Meta alcanzada. ${totalSteps.toLocaleString('es')} pasos hoy.`;
  if (progressPct >= 60) return `Casi. Te quedan ${remaining.toLocaleString('es')} pasos para la meta.`;
  if (progressPct >= 30) return 'Vas bien. A mitad del camino.';
  return 'Buen comienzo. Sigue sumando.';
}

export default function StepsScreen() {
  const hasSeenIntro = useSettingsStore((state) => Boolean(state.moduleIntroSeen.steps));
  const markModuleIntroSeen = useSettingsStore((state) => state.markModuleIntroSeen);
  const distUnit = useSettingsStore((state) => state.distUnit);
  const {
    totalSteps,
    goal,
    progressPct,
    distanceKm,
    calories,
    remaining,
    weeklyData,
    weeklyAvg,
    bestDaySteps,
    daysMetGoal,
    healthConnectStatus,
  } = useSteps();

  const maxWeekly = Math.max(...weeklyData.map((day) => Number(day.steps ?? 0)), goal, 1);

  if (!hasSeenIntro) {
    return (
      <SafeScreen padHorizontal={false} padBottom>
        <Header title="Pasos" showBack />
        <ModuleIntroScreen
          accentColor={Colors.steps}
          icon="🚶"
          title="Pasos"
          body="Este módulo se actualiza solo. Aquí ves meta, recorrido semanal y cuánto te falta para cerrar el día."
          ctaLabel="Entrar al módulo"
          onContinue={() => markModuleIntroSeen('steps')}
        />
      </SafeScreen>
    );
  }

  return (
    <SafeScreen padHorizontal={false} padBottom>
      <Header
        title="Pasos"
        showBack
        rightAction={
          <Pressable onPress={() => router.push(Routes.steps.settings as never)}>
            <Text style={styles.headerLink}>Meta</Text>
          </Pressable>
        }
      />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Card style={styles.heroCard} shadow={false}>
          <View style={styles.heroRow}>
            <ProgressCircle
              value={progressPct}
              size={180}
              strokeWidth={12}
              color={Colors.steps}
              trackColor={Colors.bgElevated}
              animated
              duration={700}
              accessibilityLabel={`Pasos: ${totalSteps} de ${goal}`}
            >
              <Text style={styles.heroValue}>{totalSteps.toLocaleString('es')}</Text>
              <Text style={styles.heroUnit}>pasos</Text>
              <Text style={styles.heroMeta}>Meta: {goal.toLocaleString('es')}</Text>
            </ProgressCircle>

            <View style={styles.heroStats}>
              <Metric label="Distancia" value={formatDistance(distanceKm, distUnit)} />
              <Metric label="Energía" value={`${Math.round(calories)} kcal`} />
              <Metric
                label="Restantes"
                value={remaining > 0 ? remaining.toLocaleString('es') : 'Meta'}
              />
            </View>
          </View>

          <Text style={styles.message}>{buildStepsMessage(progressPct, remaining, totalSteps)}</Text>
          <Text style={styles.sourceNote}>
            {healthConnectStatus === 'ready'
              ? 'Health Connect activo para recuperar pasos incluso cuando no abres la app.'
              : Platform.OS === 'android'
                ? 'Puedes conectar Health Connect desde Meta para recuperar pasos del día completo.'
                : 'Usando el sensor del dispositivo para contar tus pasos.'}
          </Text>

          <View style={styles.actionsRow}>
            <Pressable
              style={styles.ghostAction}
              onPress={() => router.push(Routes.steps.week as never)}
              accessibilityRole="button"
              accessibilityLabel="Ver ruta de hoy"
              accessibilityHint="Abre el detalle diario de pasos."
              hitSlop={8}
            >
              <Text style={styles.ghostActionText}>Ver ruta de hoy</Text>
            </Pressable>
            <Pressable
              style={styles.ghostAction}
              onPress={() => router.push(Routes.steps.settings as never)}
              accessibilityRole="button"
              accessibilityLabel={
                Platform.OS === 'android' && healthConnectStatus !== 'ready'
                  ? 'Conectar Health Connect'
                  : 'Ajustar meta diaria'
              }
              accessibilityHint="Abre la configuración del módulo de pasos."
              hitSlop={8}
            >
              <Text style={styles.ghostActionText}>
                {Platform.OS === 'android' && healthConnectStatus !== 'ready'
                  ? 'Conectar Health Connect'
                  : 'Ajustar meta diaria'}
              </Text>
            </Pressable>
          </View>
        </Card>

        <Card style={styles.weekCard} shadow={false}>
          <Text style={styles.sectionTitle}>Últimos 7 días</Text>
          <View style={styles.weekBars}>
            {weeklyData.map((day) => {
              const daySteps = Number(day.steps ?? 0);
              const isGoalMet = daySteps >= goal;
              const isToday = day.logged_date === new Date().toISOString().split('T')[0];
              const fillHeight = visibleRatioPercent(daySteps, maxWeekly);
              const label = new Date(`${day.logged_date}T12:00:00`)
                .toLocaleDateString('es-UY', { weekday: 'short' })
                .slice(0, 1)
                .toUpperCase();
              return (
                <View key={day.logged_date} style={styles.weekItem}>
                  <View style={styles.weekTrack}>
                    <View style={[styles.goalLine, { bottom: `${(goal / maxWeekly) * 100}%` }]} />
                    <View
                      style={[
                        styles.weekFill,
                        {
                          height: `${fillHeight}%`,
                          backgroundColor: isGoalMet ? Colors.steps : withOpacity(Colors.steps, 0.38),
                        },
                      ]}
                    />
                  </View>
                  <Text style={[styles.weekLabel, isToday && styles.weekLabelToday]}>{label}</Text>
                </View>
              );
            })}
          </View>
        </Card>

        <View style={styles.statsGrid}>
          <StatCard label="Promedio diario" value={`${weeklyAvg.toLocaleString('es')}`} />
          <StatCard label="Días con meta" value={`${daysMetGoal}/7`} />
          <StatCard label="Mejor día" value={bestDaySteps.toLocaleString('es')} />
          <StatCard
            label="Total semana"
            value={weeklyData.reduce((sum, day) => sum + Number(day.steps ?? 0), 0).toLocaleString('es')}
          />
        </View>
      </ScrollView>
    </SafeScreen>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.metricItem}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={styles.metricValue}>{value}</Text>
    </View>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <Card style={styles.statCard} shadow={false}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  headerLink: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.base,
    color: Colors.textSecondary,
  },
  content: {
    paddingHorizontal: Spacing[5],
    paddingBottom: Spacing[10],
    gap: Spacing[4],
  },
  heroCard: {
    gap: Spacing[4],
  },
  heroRow: {
    flexDirection: 'row',
    gap: Spacing[4],
    alignItems: 'center',
  },
  heroValue: {
    fontFamily: FontFamily.display,
    fontSize: 36,
    color: Colors.textPrimary,
    letterSpacing: -1.2,
  },
  heroUnit: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.base,
    color: Colors.textSecondary,
  },
  heroMeta: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    color: Colors.textMuted,
  },
  heroStats: {
    flex: 1,
    gap: Spacing[3],
  },
  metricItem: {
    gap: 4,
  },
  metricLabel: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1.1,
  },
  metricValue: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.md,
    color: Colors.textPrimary,
  },
  message: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    lineHeight: 22,
  },
  sourceNote: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    lineHeight: 18,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: Spacing[3],
  },
  ghostAction: {
    flex: 1,
    minHeight: 48,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.bgElevated,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  ghostActionText: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.base,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  weekCard: {
    gap: Spacing[3],
  },
  sectionTitle: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.md,
    color: Colors.textPrimary,
  },
  weekBars: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: Spacing[2],
    height: 164,
  },
  weekItem: {
    flex: 1,
    alignItems: 'center',
    gap: Spacing[2],
  },
  weekTrack: {
    width: '100%',
    flex: 1,
    borderRadius: Radius.sm,
    backgroundColor: Colors.bgElevated,
    justifyContent: 'flex-end',
    overflow: 'hidden',
    position: 'relative',
  },
  weekFill: {
    width: '100%',
    borderRadius: Radius.sm,
  },
  goalLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: withOpacity(Colors.steps, 0.6),
  },
  weekLabel: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.xs,
    color: Colors.textMuted,
  },
  weekLabelToday: {
    color: Colors.steps,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing[3],
  },
  statCard: {
    width: '48%',
    gap: Spacing[2],
  },
  statValue: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.xl,
    color: Colors.textPrimary,
  },
  statLabel: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.base,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
});
