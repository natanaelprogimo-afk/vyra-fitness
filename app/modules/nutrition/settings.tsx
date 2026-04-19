import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import SafeScreen from '@/components/ui/SafeScreen';
import Header from '@/components/layout/Header';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { Colors, getModuleBg, withOpacity } from '@/constants/colors';
import { FontFamily, FontSize, Radius, Spacing } from '@/constants/theme';
import { useNutrition } from '@/hooks/useNutrition';
import { useReadiness } from '@/hooks/useReadiness';
import { NUTRITION_MODE_OPTIONS } from '@/lib/nutrition-mode';
import { Routes } from '@/constants/routes';

const TABS = [
  { label: 'Hoy', route: Routes.nutrition.index },
  { label: 'Historial', route: Routes.nutrition.history },
  { label: 'Alimentos', route: Routes.nutrition.search },
  { label: 'Ajustes', route: Routes.nutrition.settings },
] as const;

function SectionHeader({ title, hint, action }: { title: string; hint: string; action?: React.ReactNode }) {
  return (
    <View style={styles.sectionHeader}>
      <View style={styles.sectionCopy}>
        <Text style={styles.sectionTitle}>{title}</Text>
        <Text style={styles.sectionHint}>{hint}</Text>
      </View>
      {action ? <View style={styles.sectionAction}>{action}</View> : null}
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

export default function NutritionSettingsScreen() {
  const { dailyScore, predictedScore, weeklyAverage, scoreColor, similarDayComparison, focusActions, morningNarrative } = useReadiness();
  const {
    nutritionMode,
    nutritionModeOption,
    displayMacroGoals,
    calorieGoal,
    calorieBudget,
    proteinBoost,
    activityCalories,
    fastingIntegration,
    cycleNutritionGuidance,
    setNutritionMode,
    isSavingNutritionMode,
  } = useNutrition();

  const accent = Colors.nutrition;
  const calorieGoalValue = calorieGoal ?? 2000;
  const goalValue = calorieBudget ?? calorieGoalValue;
  const modeSubtitle = nutritionModeOption?.description ?? 'Ajusta tu plan nutricional.';
  const dayScore = dailyScore?.score != null ? Math.round(dailyScore.score) : null;
  const dayScoreAccent = dayScore !== null ? scoreColor(dayScore) : accent;
  const scoreVsWeek = dayScore !== null && weeklyAverage !== null ? Math.round(dayScore - weeklyAverage) : null;
  const focusAction = focusActions[0] ?? null;
  const modeLabel = nutritionModeOption?.shortTitle ?? 'Modo base';
  const deltaBudget = Math.round(goalValue - calorieGoalValue);
  const budgetHigh = goalValue > calorieGoalValue * 1.12;
  const budgetLow = goalValue < calorieGoalValue * 0.88;
  const hasDynamicContext = Boolean(fastingIntegration || cycleNutritionGuidance || activityCalories > 0 || proteinBoost > 0);
  const returnMode = budgetHigh
    ?  'Empujar'
    : budgetLow
      ?  'Recuperar'
      : hasDynamicContext
        ?  'Coordinar'
        : 'Sostener';
  const coachTitle = budgetHigh
    ?  'La lectura actual quiere asegurarse de que el plan no empuje mas ruido que adherencia'
    : budgetLow
      ?  'La lectura actual quiere recuperar energia util antes de dejar el plan demasiado corto'
      : hasDynamicContext
        ?  'La lectura actual quiere coordinar ayuno, actividad y plan vivo sin friccion'
        : 'La configuracion ya se ve bastante limpia para sostener el plan vivo';
  const coachBody =
    similarDayComparison?.message ??
    morningNarrative ??
    fastingIntegration?.message ??
    cycleNutritionGuidance ??
    `Tu modo actual es ${modeLabel} y el presupuesto visible queda en ${goalValue.toLocaleString()} kcal. Cuando ajustes poco pero bien, el plan se siente mucho mas facil de seguir.`;
  const coachHint = focusAction
    ? `Siguiente lectura útil: ${focusAction.title}.`
    : budgetHigh
      ? `Tu presupuesto esta ${deltaBudget > 0 ? '+' : ''}${deltaBudget} kcal vs. base. Si hoy te sientes pasado de revoluciones, conviene bajar ruido antes de cerrar macros.`
      : budgetLow
        ? `Tu presupuesto esta ${deltaBudget > 0 ? '+' : ''}${deltaBudget} kcal vs. base. Si el día se siente corto, conviene recuperar sin desordenar el plan.`
        : hasDynamicContext
          ?  'Ayuno, actividad o ciclo ya estan modulando el plan. Lo mas útil ahora es aplicar ese contexto dentro del día, no seguir tocando ajustes.'
          : 'Si la configuración ya se ve estable, lo mas útil es volver al hub y usar el plan en vez de seguir afinando detalles.';
  const primaryActionLabel = hasDynamicContext ? 'Abrir nutrición' : 'Abrir registro';
  const handlePrimaryAction = () => {
    router.push((hasDynamicContext ? Routes.nutrition.index : Routes.nutrition.log) as never);
  };

  return (
    <SafeScreen padHorizontal={false} padBottom>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <Header
          showBack
          color={accent}
          eyebrow="Nutrición"
          title="Ajustes de nutrición"
          subtitle="Toda la configuración importante del plan diario en una sola vista clara y rapida de editar."
        />

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabRow}>
          {TABS.map((tab) => {
            const isActive = tab.route === Routes.nutrition.settings;
            return (
              <Pressable
                key={tab.label}
                style={[
                  styles.tab,
                  isActive && { borderColor: withOpacity(accent, 0.32), backgroundColor: getModuleBg('nutrition', 0.16) },
                ]}
                onPress={() => router.push(tab.route as never)}
              >
                <Text style={[styles.tabText, isActive && { color: accent }]}>{tab.label}</Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <Card accentColor={accent} style={styles.heroCard}>
          <View style={styles.heroTopRow}>
            <View style={styles.heroCopy}>
              <View style={[styles.heroBadge, { backgroundColor: getModuleBg('nutrition', 0.16) }]}>
                <Ionicons name="settings-outline" size={16} color={accent} />
                <Text style={[styles.heroBadgeText, { color: accent }]}>Configuración activa</Text>
              </View>
              <Text style={styles.heroTitle}>{nutritionModeOption?.shortTitle ?? 'Modo actual'}</Text>
              <Text style={styles.heroHint}>{modeSubtitle}</Text>
            </View>
            <View style={styles.heroPill}>
              <Text style={[styles.heroPillValue, { color: accent }]}>{goalValue.toLocaleString()}</Text>
              <Text style={styles.heroPillLabel}>kcal / día</Text>
            </View>
          </View>

          <View style={styles.heroStats}>
            <View style={styles.heroStat}>
              <Text style={styles.heroStatLabel}>Actividad</Text>
              <Text style={styles.heroStatValue}>+{Math.round(activityCalories)} kcal</Text>
            </View>
            <View style={styles.heroStat}>
              <Text style={styles.heroStatLabel}>Boost</Text>
              <Text style={styles.heroStatValue}>+{Math.round(proteinBoost)}g</Text>
            </View>
            <View style={styles.heroStat}>
              <Text style={styles.heroStatLabel}>Base</Text>
              <Text style={styles.heroStatValue}>{calorieGoalValue.toLocaleString()}</Text>
            </View>
          </View>
        </Card>

        <Card style={styles.coachCard}>
          <View style={styles.coachHeader}>
            <Text style={styles.coachEyebrow}>Lectura contextual</Text>
            <Text style={styles.coachTitle}>{coachTitle}</Text>
            <Text style={styles.coachBody}>{coachBody}</Text>
          </View>

          <View style={styles.routeStatsRow}>
            <RouteStat
              label="Score"
              value={dayScore !== null ? `${dayScore}` : '--'}
              hint={dayScore !== null ? `cierre ${predictedScore ?? dayScore}` : 'sin lectura todavía'}
              accent={dayScoreAccent}
            />
            <RouteStat
              label="Retorno"
              value={returnMode}
              hint={modeLabel}
              accent={Colors.info}
            />
            <RouteStat
              label="Ritmo"
              value={scoreVsWeek !== null ? `${scoreVsWeek > 0 ? '+' : ''}${scoreVsWeek}` : `${goalValue.toLocaleString()}`}
              hint={scoreVsWeek !== null ? 'vs. semana' : 'kcal plan'}
              accent={scoreVsWeek !== null && scoreVsWeek < 0 ? Colors.warning : Colors.textPrimary}
            />
          </View>

          <View style={styles.routeActionRow}>
            <View style={styles.routeActionCopy}>
              <Text style={styles.routeActionLabel}>Siguiente lectura</Text>
              <Text style={styles.routeActionTitle}>
                {budgetHigh
                  ?  'Limpia el plan antes de cerrar macros'
                  : budgetLow
                    ?  'Recupera energía sin romper el retorno'
                    : hasDynamicContext
                      ?  'Aplica el plan vivo dentro del día'
                      : 'Sostener una configuración útil'}
              </Text>
              <Text style={styles.routeActionHint}>{coachHint}</Text>
            </View>
            <View style={styles.routeButtons}>
              <Button onPress={handlePrimaryAction} label={primaryActionLabel} size="sm" color={Colors.info} />
              <Button onPress={() => router.push(Routes.tabs.home as never)} label="Abrir inicio" size="sm" variant="secondary" color={Colors.info} />
              <Button onPress={() => router.push(Routes.dailySummary as never)} label="Abrir resumen" size="sm" variant="ghost" color={Colors.info} />
            </View>
          </View>
        </Card>

        <Card>
          <SectionHeader
            title="Cambio rápido de modo"
            hint="Si quieres ajustar el plan sin salir de aqui, esta es la acción principal de esta pantalla."
            action={
              <Button
                onPress={() => router.push(Routes.nutrition.log as never)}
                label="Abrir registro"
                size="sm"
                variant="secondary"
                color={accent}
              />
            }
          />

          <View style={styles.modeStack}>
            {NUTRITION_MODE_OPTIONS.map((mode) => {
              const isActive = nutritionMode === mode.id;
              return (
                <View
                  key={mode.id}
                  style={[
                    styles.modeCard,
                    isActive && { borderColor: withOpacity(accent, 0.32), backgroundColor: getModuleBg('nutrition', 0.16) },
                  ]}
                >
                  <View style={styles.modeCopy}>
                    <Text style={styles.modeTitle}>{mode.shortTitle}</Text>
                    <Text style={styles.modeDescription}>{mode.description}</Text>
                  </View>
                  <Button
                    onPress={() => void setNutritionMode(mode.id)}
                    label={isActive ? 'Activo' : 'Usar'}
                    size="sm"
                    color={accent}
                    variant={isActive ? 'secondary' : 'primary'}
                    disabled={isActive || isSavingNutritionMode}
                    loading={isSavingNutritionMode && !isActive}
                  />
                </View>
              );
            })}
          </View>
        </Card>

        <Card>
          <SectionHeader
            title="Metas y macros"
            hint="Asi queda tu presupuesto diario con la configuración actual."
          />
          <View style={styles.goalStack}>
            {[
              { label: 'Calorias base', value: `${calorieGoalValue.toLocaleString()} kcal` },
              { label: 'Proteína', value: `${Math.round(displayMacroGoals.protein)} g` },
              { label: 'Carbohidratos', value: `${Math.round(displayMacroGoals.carbs)} g` },
              { label: 'Grasas', value: `${Math.round(displayMacroGoals.fat)} g` },
            ].map((item) => (
              <View key={item.label} style={styles.goalRow}>
                <Text style={styles.goalLabel}>{item.label}</Text>
                <Text style={styles.goalValue}>{item.value}</Text>
              </View>
            ))}
          </View>
          <Text style={styles.goalNote}>Los ajustes por actividad, ayuno y ciclo se aplican encima de esta base.</Text>
        </Card>

        <Card>
          <SectionHeader
            title="Integraciones activas"
            hint="Contextos que ya estan modulando como conviene comer hoy."
          />
          <View style={styles.integrationStack}>
            <View style={styles.integrationRow}>
              <Ionicons name="timer-outline" size={16} color={Colors.fasting} />
              <Text style={styles.integrationText}>
                {fastingIntegration
                  ?  fastingIntegration.message
                  : 'Sin ayuno activo. Puedes registrar comidas con normalidad.'}
              </Text>
            </View>
            <View style={styles.integrationRow}>
              <Ionicons name="flower-outline" size={16} color={Colors.female} />
              <Text style={styles.integrationText}>
                {cycleNutritionGuidance ?? 'Sin ajustes de ciclo visibles en este momento.'}
              </Text>
            </View>
          </View>
        </Card>

        <Card>
          <SectionHeader
            title="Atajos rápidos"
            hint="Puertas directas a los ajustes que mas cambian la experiencia diaria."
          />
          <View style={styles.linkStack}>
            {[
              { label: 'Configurar unidades', route: Routes.settings.units },
              { label: 'Notificaciones', route: Routes.settings.notificationsSettings },
              { label: 'Exportar datos', route: Routes.profile.exportData },
            ].map((item) => (
              <Pressable key={item.label} style={styles.linkRow} onPress={() => router.push(item.route as never)}>
                <Text style={styles.linkLabel}>{item.label}</Text>
                <Ionicons name="chevron-forward" size={16} color={Colors.textSecondary} />
              </Pressable>
            ))}
          </View>
        </Card>

        <View style={styles.bottomPad} />
      </ScrollView>
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing[5],
    paddingTop: Spacing[5],
    paddingBottom: Spacing[12],
    gap: Spacing[4],
  },
  tabRow: {
    gap: Spacing[2],
    paddingRight: Spacing[2],
  },
  tab: {
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
    backgroundColor: Colors.surface2,
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[2.5],
  },
  tabText: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  heroCard: {
    gap: Spacing[4],
  },
  coachCard: {
    borderWidth: 1,
    borderColor: `${Colors.info}45`,
    backgroundColor: `${Colors.info}0D`,
  },
  heroTopRow: {
    flexDirection: 'row',
    gap: Spacing[3],
    alignItems: 'center',
  },
  heroCopy: {
    flex: 1,
    gap: Spacing[1],
  },
  heroBadge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[1.5],
    borderRadius: Radius.full,
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[1.5],
    marginBottom: Spacing[1],
  },
  heroBadgeText: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.xs,
  },
  heroTitle: {
    fontFamily: FontFamily.display,
    fontSize: FontSize['2xl'],
    lineHeight: 36,
    color: Colors.textPrimary,
  },
  heroHint: {
    marginTop: Spacing[1],
    fontFamily: FontFamily.regular,
    fontSize: FontSize.base,
    lineHeight: 24,
    color: Colors.textPrimary,
  },
  heroPill: {
    minWidth: 110,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: withOpacity(Colors.white, 0.06),
    backgroundColor: Colors.surface2,
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[3],
    alignItems: 'center',
    gap: 2,
  },
  heroPillValue: {
    fontFamily: FontFamily.display,
    fontSize: FontSize.xl,
  },
  heroPillLabel: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
  },
  heroStats: {
    flexDirection: 'row',
    gap: Spacing[2],
  },
  heroStat: {
    flex: 1,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: withOpacity(Colors.white, 0.06),
    backgroundColor: Colors.surface2,
    padding: Spacing[3],
    gap: 4,
  },
  heroStatLabel: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.xs,
    color: Colors.textMuted,
  },
  heroStatValue: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.base,
    color: Colors.textPrimary,
  },
  coachHeader: {
    gap: 4,
    marginBottom: Spacing[1],
  },
  coachEyebrow: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.xs,
    color: Colors.info,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  coachTitle: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.lg,
    color: Colors.textPrimary,
    lineHeight: 24,
  },
  coachBody: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing[3],
    marginBottom: Spacing[1],
  },
  sectionCopy: {
    flex: 1,
    gap: 4,
  },
  sectionAction: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  sectionTitle: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.lg,
    color: Colors.textPrimary,
  },
  sectionHint: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    lineHeight: 20,
    color: Colors.textSecondary,
  },
  routeStatsRow: {
    flexDirection: 'row',
    gap: Spacing[2],
    marginTop: Spacing[3],
  },
  routeStat: {
    flex: 1,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.divider,
    backgroundColor: Colors.bgSurface,
    paddingVertical: Spacing[2.5],
    paddingHorizontal: Spacing[2.5],
    gap: 2,
  },
  routeStatLabel: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.xs,
    color: Colors.textMuted,
  },
  routeStatValue: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.base,
    color: Colors.textPrimary,
  },
  routeStatHint: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    color: Colors.textMuted,
  },
  routeActionRow: {
    flexDirection: 'row',
    gap: Spacing[3],
    marginTop: Spacing[3],
    alignItems: 'flex-start',
  },
  routeActionCopy: {
    flex: 1,
    gap: 2,
  },
  routeActionLabel: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.xs,
    color: Colors.info,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  routeActionTitle: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.base,
    color: Colors.textPrimary,
  },
  routeActionHint: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  routeButtons: {
    width: 150,
    gap: Spacing[2],
  },
  modeStack: {
    gap: Spacing[2],
    marginTop: Spacing[2],
  },
  modeCard: {
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: withOpacity(Colors.white, 0.06),
    backgroundColor: Colors.surface2,
    padding: Spacing[3],
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing[3],
  },
  modeCopy: {
    flex: 1,
    gap: 4,
  },
  modeTitle: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.base,
    color: Colors.textPrimary,
  },
  modeDescription: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    lineHeight: 20,
    color: Colors.textSecondary,
  },
  goalStack: {
    gap: Spacing[2],
    marginTop: Spacing[2],
  },
  goalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: Spacing[3],
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: withOpacity(Colors.white, 0.05),
    backgroundColor: Colors.surface2,
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[3],
  },
  goalLabel: {
    flex: 1,
    fontFamily: FontFamily.medium,
    fontSize: FontSize.sm,
    color: Colors.textPrimary,
  },
  goalValue: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  goalNote: {
    marginTop: Spacing[2],
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    lineHeight: 20,
    color: Colors.textSecondary,
  },
  integrationStack: {
    gap: Spacing[2],
    marginTop: Spacing[2],
  },
  integrationRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing[2],
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: withOpacity(Colors.white, 0.05),
    backgroundColor: Colors.surface2,
    padding: Spacing[3],
  },
  integrationText: {
    flex: 1,
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    lineHeight: 20,
    color: Colors.textPrimary,
  },
  linkStack: {
    gap: Spacing[2],
    marginTop: Spacing[2],
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing[3],
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: withOpacity(Colors.white, 0.05),
    backgroundColor: Colors.surface2,
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[3],
  },
  linkLabel: {
    flex: 1,
    fontFamily: FontFamily.medium,
    fontSize: FontSize.sm,
    color: Colors.textPrimary,
  },
  bottomPad: {
    height: 120,
  },
});
