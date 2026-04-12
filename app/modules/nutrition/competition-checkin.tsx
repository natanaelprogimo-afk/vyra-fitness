import React, { useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import SafeScreen from '@/components/ui/SafeScreen';
import Header from '@/components/layout/Header';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Colors, getModuleBg, withOpacity } from '@/constants/colors';
import { FontFamily, FontSize, Radius, Spacing } from '@/constants/theme';
import { useNutrition } from '@/hooks/useNutrition';
import { useReadiness } from '@/hooks/useReadiness';
import { useAuthStore } from '@/stores/authStore';
import { Routes } from '@/constants/routes';

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

function StatPill({
  label,
  value,
  accent = Colors.nutrition,
}: {
  label: string;
  value: string;
  accent?: string;
}) {
  return (
    <View style={styles.statPill}>
      <Text style={[styles.statValue, { color: accent }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

export default function NutritionCompetitionCheckinScreen() {
  const profile = useAuthStore((state) => state.profile);
  const {
    competitionCheckin,
    saveCompetitionCheckin,
    isSavingCompetitionCheckin,
    totals,
    simpleTargets,
    nutritionModeOption,
    adaptivePlan,
    cycleNutritionGuidance,
    nutritionSleepEnergyCorrelation,
  } = useNutrition();
  const {
    dailyScore,
    predictedScore,
    weeklyAverage,
    scoreColor,
    similarDayComparison,
    focusActions,
    morningNarrative,
  } = useReadiness();

  const [sodium, setSodium] = useState('0');
  const [water, setWater] = useState('0');
  const [fiber, setFiber] = useState('0');
  const [carbs, setCarbs] = useState('0');
  const [weight, setWeight] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (competitionCheckin) {
      setSodium(String(Math.round(competitionCheckin.sodium_mg)));
      setWater(String(Math.round(competitionCheckin.water_ml)));
      setFiber(String(Math.round(competitionCheckin.fiber_g)));
      setCarbs(competitionCheckin.carbs_g ? String(Math.round(competitionCheckin.carbs_g)) : '0');
      setWeight(competitionCheckin.weight_kg ? competitionCheckin.weight_kg.toFixed(1) : '');
      setNotes(competitionCheckin.notes ?? '');
      return;
    }

    setSodium(String(Math.round(totals.sodium ?? 0)));
    setFiber(String(Math.round(totals.fiber ?? 0)));
    setCarbs(String(Math.round(totals.carbs ?? 0)));
    setWater(String(profile?.water_goal_ml ?? 2500));
    setWeight(profile?.weight_current_kg ? profile.weight_current_kg.toFixed(1) : '');
    setNotes('');
  }, [competitionCheckin, profile?.water_goal_ml, profile?.weight_current_kg, totals.carbs, totals.fiber, totals.sodium]);

  const sodiumValue = Number(sodium) || 0;
  const waterValue = Number(water) || 0;
  const fiberValue = Number(fiber) || 0;
  const carbsValue = Number(carbs) || 0;
  const weightValue = weight.trim() ? Number(weight) : profile?.weight_current_kg ?? null;
  const waterGoal = profile?.water_goal_ml ?? 2500;
  const waterPct = waterGoal > 0 ? Math.round((waterValue / waterGoal) * 100) : 0;
  const carbsPct = simpleTargets.carbs > 0 ? Math.round((carbsValue / simpleTargets.carbs) * 100) : 0;
  const proteinGoalHint = Math.round(simpleTargets.protein);
  const coachName = profile?.coach_name_preference ?? 'Vyra';
  const dayScore = dailyScore?.score != null ? Math.round(dailyScore.score) : null;
  const dayScoreAccent = dayScore !== null ? scoreColor(dayScore) : Colors.nutrition;
  const scoreVsWeek = dayScore !== null && weeklyAverage !== null ? Math.round(dayScore - weeklyAverage) : null;
  const focusAction = focusActions.find((action) => action.metric === 'nutrition') ?? focusActions[0] ?? null;

  const returnMode = waterPct < 85
    ? 'Hidratar'
    : sodiumValue > 3500
      ? 'Afinar'
      : fiberValue > 32
        ? 'Limpiar'
        : carbsPct < 45
          ? 'Cargar'
          : 'Sostener';

  const coachTitle = waterPct < 85
    ? `${coachName} quiere subir agua antes de leer el pico.`
    : sodiumValue > 3500
      ? `${coachName} quiere bajar ruido de sodio antes de tocar otra variable.`
      : fiberValue > 32
        ? `${coachName} quiere cuidar digestion para que el cierre no se ensucie.`
        : carbsPct < 45
          ? `${coachName} quiere completar carga sin improvisar.`
          : `${coachName} ve una base util para sostener el pico sin tocar de mas.`;

  const coachBody =
    similarDayComparison?.message ??
    cycleNutritionGuidance ??
    nutritionSleepEnergyCorrelation.insight ??
    morningNarrative ??
    adaptivePlan.message;

  const coachHint = focusAction
    ? `Siguiente lectura util: ${focusAction.title}.`
    : `Guardar este check-in hoy deja una referencia real para ajustar mejor manana sin depender de memoria.`;

  const routeTitle = waterPct < 85
    ? 'Subir agua antes de cerrar'
    : sodiumValue > 3500
      ? 'Bajar sodio y mirar retencion'
      : fiberValue > 32
        ? 'Cuidar digestion y no meter mas volumen'
        : carbsPct < 45
          ? 'Completar la carga de carbos'
          : 'Guardar y sostener el pico';

  const peakSummary = useMemo(() => {
    if (weightValue == null) return 'Sin peso cargado todavia.';
    const baseline = profile?.weight_current_kg ?? weightValue;
    const delta = Math.round((weightValue - baseline) * 10) / 10;
    if (Math.abs(delta) < 0.2) return 'El peso viene estable respecto a tu referencia actual.';
    if (delta > 0) return `Hoy estas +${delta.toFixed(1)} kg sobre la referencia actual.`;
    return `Hoy estas ${delta.toFixed(1)} kg por debajo de la referencia actual.`;
  }, [profile?.weight_current_kg, weightValue]);

  const handleSave = async () => {
    const success = await saveCompetitionCheckin({
      sodium_mg: sodiumValue,
      water_ml: waterValue,
      fiber_g: fiberValue,
      carbs_g: carbsValue || null,
      weight_kg: weight.trim() ? Number(weight) : null,
      notes: notes.trim() || null,
    });
    if (success) {
      router.back();
    }
  };

  return (
    <SafeScreen padHorizontal={false} padBottom>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Header
          showBack
          color={Colors.nutrition}
          eyebrow="Nutricion"
          title="Competition check-in"
          subtitle={`${nutritionModeOption.title}. Sodio, agua, fibra y peso en una sola lectura para ajustar mejor la semana pico.`}
        />

        <Card style={styles.coachCard} accentColor={Colors.coach}>
          <View style={styles.sectionHeader}>
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
              hint={`${waterPct}% agua objetivo`}
              accent={Colors.coach}
            />
            <RouteStat
              label="Ritmo"
              value={scoreVsWeek !== null ? `${scoreVsWeek > 0 ? '+' : ''}${scoreVsWeek}` : 'pico'}
              hint={scoreVsWeek !== null ? 'vs. semana' : 'control diario'}
              accent={scoreVsWeek !== null && scoreVsWeek < 0 ? Colors.warning : Colors.textPrimary}
            />
          </View>

          <View style={styles.routeActionRow}>
            <View style={styles.routeActionCopy}>
              <Text style={styles.routeActionLabel}>Siguiente lectura</Text>
              <Text style={styles.routeActionTitle}>{routeTitle}</Text>
              <Text style={styles.routeActionHint}>{coachHint}</Text>
            </View>
            <View style={styles.routeButtons}>
              <Button onPress={() => router.push(Routes.nutrition.index as any)} label="Abrir nutricion" size="sm" color={Colors.coach} />
              <Button onPress={() => router.push(Routes.coach.index as any)} label="Abrir coach" size="sm" variant="secondary" color={Colors.coach} />
              <Button onPress={() => router.push(Routes.dailySummary as any)} label="Abrir resumen" size="sm" variant="ghost" color={Colors.coach} />
            </View>
          </View>
        </Card>

        <Card accentColor={Colors.nutrition} style={styles.heroCard}>
          <View style={styles.heroTopRow}>
            <View style={styles.heroCopy}>
              <View style={[styles.heroBadge, { backgroundColor: getModuleBg('nutrition', 0.16) }]}>
                <Ionicons name="flash-outline" size={16} color={Colors.nutrition} />
                <Text style={[styles.heroBadgeText, { color: Colors.nutrition }]}>Peak week</Text>
              </View>
              <Text style={styles.heroTitle}>Pulso del pico</Text>
              <Text style={styles.heroHint}>
                Este check-in ya no es solo captura: te ayuda a leer retencion, llenado y consistencia sin depender de memoria ni notas sueltas.
              </Text>
            </View>
          </View>

          <View style={styles.statRow}>
            <StatPill label="Sodio" value={`${Math.round(totals.sodium ?? 0)} mg`} />
            <StatPill label="Fibra" value={`${Math.round(totals.fiber ?? 0)} g`} />
            <StatPill label="Carbos" value={`${Math.round(totals.carbs ?? 0)} g`} />
          </View>

          <View style={styles.statRow}>
            <StatPill label="Agua objetivo" value={`${waterGoal} ml`} accent={Colors.coach} />
            <StatPill label="Carga carbos" value={`${carbsPct}%`} accent={Colors.steps} />
            <StatPill label="Proteina base" value={`${proteinGoalHint} g`} accent={Colors.nutrition} />
          </View>
        </Card>

        <Card>
          <Text style={styles.sectionTitle}>Carga del dia</Text>
          <Text style={styles.sectionHint}>Usa estos campos para dejar un cierre claro antes de guardar.</Text>
          <View style={styles.formStack}>
            <Input label="Sodio" value={sodium} onChangeText={setSodium} keyboardType="numeric" unit="mg" />
            <Input label="Agua" value={water} onChangeText={setWater} keyboardType="numeric" unit="ml" />
            <Input label="Fibra" value={fiber} onChangeText={setFiber} keyboardType="numeric" unit="g" />
            <Input label="Carbos" value={carbs} onChangeText={setCarbs} keyboardType="numeric" unit="g" />
            <Input label="Peso" value={weight} onChangeText={setWeight} keyboardType="numeric" unit="kg" />
          </View>
        </Card>

        <Card>
          <Text style={styles.sectionTitle}>Lectura del cierre</Text>
          <Text style={styles.sectionHint}>{peakSummary}</Text>
          <View style={styles.statRow}>
            <StatPill label="Agua" value={`${waterPct}%`} accent={waterPct < 85 ? Colors.warning : Colors.coach} />
            <StatPill label="Sodio" value={sodiumValue > 3500 ? 'Alto' : sodiumValue < 1800 ? 'Bajo' : 'Estable'} accent={sodiumValue > 3500 ? Colors.warning : Colors.nutrition} />
            <StatPill label="Fibra" value={fiberValue > 32 ? 'Alta' : fiberValue < 18 ? 'Baja' : 'Estable'} accent={fiberValue > 32 ? Colors.warning : Colors.steps} />
          </View>
        </Card>

        <Card>
          <Text style={styles.sectionTitle}>Notas de sensacion</Text>
          <Text style={styles.sectionHint}>Anota como te viste o sentiste: retencion, bombeo, flatness o energia general.</Text>
          <Input
            value={notes}
            onChangeText={setNotes}
            placeholder="Ej: amaneci mas seco, mejor bombeo y menos retencion abdominal"
            multiline
            inputStyle={styles.noteInput}
            style={styles.noteWrapper}
          />
        </Card>

        <Card>
          <View style={styles.footerBlock}>
            <Text style={styles.footerTitle}>Siguiente accion</Text>
            <Text style={styles.footerHint}>
              Guarda este check-in para que la referencia del dia no se pierda y quede alineada con el resto del contexto nutricional.
            </Text>
            <Button onPress={() => void handleSave()} fullWidth loading={isSavingCompetitionCheckin} label="Guardar check-in" />
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
    paddingBottom: Spacing[12],
    gap: Spacing[4],
  },
  coachCard: {
    borderWidth: 1,
    borderColor: `${Colors.coach}45`,
    backgroundColor: `${Colors.coach}0D`,
  },
  sectionHeader: {
    gap: Spacing[1],
  },
  coachEyebrow: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.xs,
    color: Colors.coach,
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
    color: Colors.coach,
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
  heroCard: {
    gap: Spacing[4],
  },
  heroTopRow: {
    flexDirection: 'row',
    gap: Spacing[3],
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
  statRow: {
    flexDirection: 'row',
    gap: Spacing[2],
    flexWrap: 'wrap',
  },
  statPill: {
    borderRadius: Radius.full,
    backgroundColor: Colors.surface2,
    borderWidth: 1,
    borderColor: withOpacity(Colors.white, 0.06),
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[2],
    gap: 2,
  },
  statValue: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.sm,
  },
  statLabel: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
  },
  sectionTitle: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.lg,
    color: Colors.textPrimary,
  },
  sectionHint: {
    marginTop: Spacing[1],
    marginBottom: Spacing[3],
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    lineHeight: 20,
    color: Colors.textSecondary,
  },
  formStack: {
    gap: Spacing[3],
  },
  noteWrapper: {
    marginTop: Spacing[1],
  },
  noteInput: {
    minHeight: 120,
    textAlignVertical: 'top',
    fontFamily: FontFamily.regular,
    fontSize: FontSize.base,
    color: Colors.textPrimary,
  },
  footerBlock: {
    gap: Spacing[3],
  },
  footerTitle: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.lg,
    color: Colors.textPrimary,
  },
  footerHint: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.base,
    lineHeight: 24,
    color: Colors.textSecondary,
  },
});
