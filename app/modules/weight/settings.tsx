import React from 'react';
import { Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import SafeScreen from '@/components/ui/SafeScreen';
import Header from '@/components/layout/Header';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { Colors, withOpacity } from '@/constants/colors';
import { Routes } from '@/constants/routes';
import { FontFamily, FontSize, Radius, Spacing } from '@/constants/theme';
import { useReadiness } from '@/hooks/useReadiness';
import { useAuthStore } from '@/stores/authStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { useWeight } from '@/hooks/useWeight';

const TABS = [
  { label: 'Hoy', route: Routes.weight.index },
  { label: 'Historial', route: Routes.weight.history },
  { label: 'Fotos', route: Routes.weight.photos },
  { label: 'Ajustes', route: Routes.weight.settings },
] as const;

function SectionHeader({ title, hint }: { title: string; hint: string }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <Text style={styles.sectionHint}>{hint}</Text>
    </View>
  );
}

function RouteStat({
  label,
  value,
  hint,
  accent,
}: {
  label: string;
  value: string;
  hint: string;
  accent: string;
}) {
  return (
    <View style={styles.routeStat}>
      <Text style={styles.routeStatLabel}>{label}</Text>
      <Text style={[styles.routeStatValue, { color: accent }]} numberOfLines={1}>
        {value}
      </Text>
      <Text style={styles.routeStatHint}>{hint}</Text>
    </View>
  );
}

export default function WeightSettingsScreen() {
  const profile = useAuthStore((state) => state.profile);
  const progressPhotoBackupEnabled = useSettingsStore((state) => state.progressPhotoBackupEnabled);
  const setProgressPhotoBackupEnabled = useSettingsStore((state) => state.setProgressPhotoBackupEnabled);
  const { dailyScore, predictedScore, weeklyAverage, scoreColor, similarDayComparison, focusActions, morningNarrative } = useReadiness();
  const { stats, logStreakDays, strictSensitiveMode } = useWeight();

  const coachName = profile?.coach_name_preference ?? 'Vyra';
  const dayScore = dailyScore?.score != null ? Math.round(dailyScore.score) : null;
  const dayScoreAccent = dayScore !== null ? scoreColor(dayScore) : Colors.weight;
  const scoreVsWeek = dayScore !== null && weeklyAverage !== null ? Math.round(dayScore - weeklyAverage) : null;
  const focusAction = focusActions[0] ?? null;
  const goalCurrentGap =
    stats.goal !== null && stats.current !== null ? Math.round((stats.current - stats.goal) * 10) / 10 : null;
  const trendLabel =
    stats.trend === 'down'
      ? 'Bajando'
      : stats.trend === 'up'
        ? 'Subiendo'
        : stats.trend === 'stable'
          ? 'Estable'
          : 'Sin lectura';
  const returnMode = strictSensitiveMode
    ? 'Proteger'
    : stats.plateauDetected
      ? 'Corregir'
      : stats.trend === 'down' || stats.trend === 'up'
        ? 'Sostener'
        : stats.goal === null
          ? 'Construir'
          : 'Consolidar';
  const coachTitle = strictSensitiveMode
    ? `${coachName} quiere proteger la lectura sensible del peso antes de pedir mas detalle`
    : stats.plateauDetected
      ? `${coachName} quiere corregir la semana antes de seguir empujando el objetivo`
      : goalCurrentGap !== null && Math.abs(goalCurrentGap) <= 1
        ? `${coachName} ve que estas cerca del objetivo y conviene sostener la tendencia`
        : stats.trend === 'down' || stats.trend === 'up'
          ? `${coachName} quiere sostener una tendencia util sin reaccionar de mas a una sola lectura`
          : `${coachName} quiere construir una base mas clara antes de tocar el objetivo otra vez`;
  const coachBody =
    stats.plateauMessage ??
    stats.variationContext ??
    similarDayComparison?.message ??
    morningNarrative ??
    `Tu peso actual ${stats.current !== null ? `esta en ${stats.current.toFixed(1)} kg` : 'todavia no tiene lectura suficiente'} y la meta visible ${stats.goal !== null ? `queda en ${stats.goal.toFixed(1)} kg` : 'aun no esta definida'}. Cuando la meta y la tendencia se entienden bien, volver a registrar se siente mucho menos confuso.`;
  const coachHint = focusAction
    ? `Siguiente lectura util: ${focusAction.title}.`
    : strictSensitiveMode
      ? 'Si hoy quieres menos ruido, conviene proteger privacidad y seguir leyendo tendencia por consistencia, no por obsesion.'
      : stats.plateauDetected
        ? 'Si la tendencia se plancho, conviene corregir la semana completa antes de mover mas la meta.'
        : goalCurrentGap !== null
          ? `La diferencia visible vs. meta es ${goalCurrentGap > 0 ? '+' : ''}${goalCurrentGap} kg. Lo importante ahora es sostener la tendencia, no dramatizar una sola lectura.`
          : 'Si la meta todavia no esta clara, lo mas util es construir base y registrar algunas lecturas antes de ajustar mas.';
  const primaryActionLabel = stats.current === null ? 'Registrar peso' : stats.plateauDetected ? 'Abrir historial' : 'Abrir peso';
  const handlePrimaryAction = () => {
    router.push((stats.current === null ? Routes.weight.log : stats.plateauDetected ? Routes.weight.history : Routes.weight.index) as any);
  };

  return (
    <SafeScreen padHorizontal={false} padBottom>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Header
          color={Colors.weight}
          eyebrow="Peso"
          title="Las preferencias de peso deben sentirse claras, privadas y faciles de mantener."
          subtitle={progressPhotoBackupEnabled ? 'Backup de fotos activo' : 'Fotos solo en este dispositivo'}
          rightElement={
            <Pressable
              style={[styles.headerIconButton, { borderColor: withOpacity(Colors.weight, 0.24) }]}
              onPress={() => router.push(Routes.profile.support as any)}
            >
              <Ionicons name="help-circle-outline" size={18} color={Colors.textPrimary} />
            </Pressable>
          }
        />

        <Card accentColor={Colors.weight} style={styles.heroCard}>
          <Text style={styles.heroTitle}>Centro de control del modulo</Text>
          <Text style={styles.heroBody}>
            Desde aqui defines la meta, la unidad y si las fotos de progreso se quedan locales o
            viajan a la nube para verte igual en otros dispositivos.
          </Text>
          <View style={styles.heroStats}>
            <View style={styles.heroStat}>
              <Text style={styles.heroStatLabel}>Actual</Text>
              <Text style={styles.heroStatValue}>{stats.current !== null ? `${stats.current.toFixed(1)} kg` : '--'}</Text>
            </View>
            <View style={styles.heroStat}>
              <Text style={styles.heroStatLabel}>Meta</Text>
              <Text style={styles.heroStatValue}>{stats.goal !== null ? `${stats.goal.toFixed(1)} kg` : 'pendiente'}</Text>
            </View>
            <View style={styles.heroStat}>
              <Text style={styles.heroStatLabel}>Racha</Text>
              <Text style={styles.heroStatValue}>{logStreakDays} dias</Text>
            </View>
          </View>
          <View style={styles.heroActions}>
            <Button onPress={() => router.push(Routes.profile.weightGoal as any)} label="Configurar meta" color={Colors.weight} fullWidth />
            <Button onPress={() => router.push(Routes.settings.units as any)} label="Cambiar unidades" variant="secondary" color={Colors.weight} fullWidth />
          </View>
        </Card>

        <Card style={styles.coachCard}>
          <View style={styles.coachHeader}>
            <Text style={styles.coachEyebrow}>Coach contextual</Text>
            <Text style={styles.coachTitle}>{coachTitle}</Text>
            <Text style={styles.coachBody}>{coachBody}</Text>
          </View>

          <View style={styles.routeStatsRow}>
            <RouteStat
              label="Score"
              value={dayScore !== null ? `${dayScore}` : '--'}
              hint={dayScore !== null ? `cierre ${predictedScore ?? dayScore}` : 'sin lectura todavia'}
              accent={dayScoreAccent}
            />
            <RouteStat
              label="Retorno"
              value={returnMode}
              hint={strictSensitiveMode ? 'privacidad fuerte' : trendLabel}
              accent={Colors.coach}
            />
            <RouteStat
              label="Ritmo"
              value={scoreVsWeek !== null ? `${scoreVsWeek > 0 ? '+' : ''}${scoreVsWeek}` : stats.weeklyDelta !== null ? `${stats.weeklyDelta > 0 ? '+' : ''}${stats.weeklyDelta}` : '--'}
              hint={scoreVsWeek !== null ? 'vs. semana' : stats.weeklyDelta !== null ? 'delta semanal' : 'sin delta'}
              accent={scoreVsWeek !== null && scoreVsWeek < 0 ? Colors.warning : Colors.textPrimary}
            />
          </View>

          <View style={styles.routeActionRow}>
            <View style={styles.routeActionCopy}>
              <Text style={styles.routeActionLabel}>Siguiente lectura</Text>
              <Text style={styles.routeActionTitle}>
                {strictSensitiveMode
                  ? 'Protege la lectura antes de pedir mas detalle'
                  : stats.plateauDetected
                    ? 'Corrige la semana antes de empujar'
                    : goalCurrentGap !== null && Math.abs(goalCurrentGap) <= 1
                      ? 'Sostener una tendencia util'
                      : stats.trend === 'down' || stats.trend === 'up'
                        ? 'No reaccionar de mas a una sola lectura'
                        : 'Construir una base mas clara'}
              </Text>
              <Text style={styles.routeActionHint}>{coachHint}</Text>
            </View>
            <View style={styles.routeButtons}>
              <Button onPress={handlePrimaryAction} label={primaryActionLabel} size="sm" color={Colors.coach} />
              <Button onPress={() => router.push(Routes.coach.index as any)} label="Abrir coach" size="sm" variant="secondary" color={Colors.coach} />
              <Button onPress={() => router.push(Routes.dailySummary as any)} label="Abrir resumen" size="sm" variant="ghost" color={Colors.coach} />
            </View>
          </View>
        </Card>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabRow}>
          {TABS.map((tab) => {
            const isActive = tab.route === Routes.weight.settings;
            return (
              <Pressable
                key={tab.label}
                style={[
                  styles.tab,
                  isActive && { borderColor: withOpacity(Colors.weight, 0.32), backgroundColor: withOpacity(Colors.weight, 0.12) },
                ]}
                onPress={() => router.push(tab.route as any)}
              >
                <Text style={[styles.tabText, isActive && { color: Colors.weight }]}>{tab.label}</Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <Card>
          <SectionHeader
            title="Meta y modo"
            hint="La meta pesa mucho en el contexto de la tendencia, asi que conviene mantenerla alineada con tu momento real."
          />
          <Button onPress={() => router.push(Routes.profile.weightGoal as any)} label="Abrir meta de peso" color={Colors.weight} fullWidth />
        </Card>

        <Card>
          <SectionHeader
            title="Unidades"
            hint="Usa kg o lb segun la lectura que te resulte mas natural para registrar y comparar."
          />
          <Button onPress={() => router.push(Routes.settings.units as any)} label="Abrir unidades" variant="secondary" color={Colors.weight} fullWidth />
        </Card>

        <Card accentColor={Colors.info}>
          <SectionHeader
            title="Fotos de progreso"
            hint="Por defecto quedan locales. El respaldo en la nube sirve si usas varios dispositivos o quieres una copia externa."
          />
          <View style={styles.toggleRow}>
            <View style={styles.toggleCopy}>
              <Text style={styles.toggleTitle}>Guardar copia en la nube</Text>
              <Text style={styles.toggleDesc}>
                Recomendado si quieres respaldo y acceso desde varios dispositivos para las fotos de progreso.
              </Text>
            </View>
            <Switch
              value={progressPhotoBackupEnabled}
              onValueChange={setProgressPhotoBackupEnabled}
              trackColor={{ false: Colors.bgElevated, true: `${Colors.weight}80` }}
              thumbColor={progressPhotoBackupEnabled ? Colors.weight : Colors.textMuted}
            />
          </View>
        </Card>

        <Card>
          <SectionHeader
            title="Privacidad y soporte"
            hint="Si necesitas revisar como se guardan los datos o resolver dudas, estos accesos te llevan al lugar correcto."
          />
          <View style={styles.linkList}>
            {[
              { label: 'Centro de privacidad', route: Routes.settings.privacy },
              { label: 'Exportar datos', route: Routes.profile.exportData },
              { label: 'Soporte', route: Routes.profile.support },
            ].map((item) => (
              <Pressable key={item.label} style={styles.linkRow} onPress={() => router.push(item.route as any)}>
                <Text style={styles.linkText}>{item.label}</Text>
                <Ionicons name="chevron-forward" size={16} color={Colors.textSecondary} />
              </Pressable>
            ))}
          </View>
        </Card>
      </ScrollView>
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: Spacing[5],
    paddingTop: Spacing[5],
    paddingBottom: Spacing[10],
    gap: Spacing[4],
  },
  headerIconButton: {
    width: 46,
    height: 46,
    borderRadius: Radius.full,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surface2,
  },
  heroCard: { gap: Spacing[3] },
  heroTitle: { fontFamily: FontFamily.bold, fontSize: FontSize.lg, color: Colors.textPrimary },
  heroBody: { fontFamily: FontFamily.regular, fontSize: FontSize.sm, color: Colors.textSecondary, lineHeight: 20 },
  heroStats: { flexDirection: 'row', gap: Spacing[2] },
  heroStat: {
    flex: 1,
    padding: Spacing[3],
    borderRadius: Radius.lg,
    backgroundColor: Colors.surface2,
    borderWidth: 1,
    borderColor: `${Colors.border}88`,
  },
  heroStatLabel: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  heroStatValue: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.md,
    color: Colors.textPrimary,
  },
  heroActions: { gap: Spacing[2] },
  coachCard: { gap: Spacing[4] },
  coachHeader: { gap: Spacing[2] },
  coachEyebrow: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.xs,
    color: Colors.coach,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  coachTitle: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.lg,
    color: Colors.textPrimary,
  },
  coachBody: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  routeStatsRow: { flexDirection: 'row', gap: Spacing[2] },
  routeStat: {
    flex: 1,
    minWidth: 0,
    padding: Spacing[3],
    borderRadius: Radius.lg,
    backgroundColor: Colors.surface2,
    borderWidth: 1,
    borderColor: `${Colors.border}88`,
  },
  routeStatLabel: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  routeStatValue: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.lg,
  },
  routeStatHint: {
    marginTop: 4,
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    color: Colors.textMuted,
  },
  routeActionRow: {
    gap: Spacing[3],
    padding: Spacing[3],
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: `${Colors.coach}22`,
    backgroundColor: withOpacity(Colors.coach, 0.08),
  },
  routeActionCopy: { gap: Spacing[1] },
  routeActionLabel: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.xs,
    color: Colors.coach,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  routeActionTitle: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.md,
    color: Colors.textPrimary,
  },
  routeActionHint: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  routeButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing[2],
  },
  tabRow: { gap: Spacing[2], paddingRight: Spacing[2] },
  tab: {
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[2],
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface2,
  },
  tabText: { fontFamily: FontFamily.semibold, fontSize: FontSize.sm, color: Colors.textSecondary },
  sectionHeader: { gap: 4, marginBottom: Spacing[3] },
  sectionTitle: { fontFamily: FontFamily.bold, fontSize: FontSize.lg, color: Colors.textPrimary },
  sectionHint: { fontFamily: FontFamily.regular, fontSize: FontSize.sm, color: Colors.textSecondary, lineHeight: 20 },
  toggleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: Spacing[3] },
  toggleCopy: { flex: 1, gap: 4 },
  toggleTitle: { fontFamily: FontFamily.bold, fontSize: FontSize.sm, color: Colors.textPrimary },
  toggleDesc: { fontFamily: FontFamily.regular, fontSize: FontSize.sm, color: Colors.textSecondary, lineHeight: 20 },
  linkList: { gap: Spacing[2] },
  linkRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing[2],
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  linkText: { fontFamily: FontFamily.medium, fontSize: FontSize.sm, color: Colors.textPrimary },
});
