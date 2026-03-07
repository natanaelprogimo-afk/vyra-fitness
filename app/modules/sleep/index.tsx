// ============================================================
// VYRA FITNESS — Módulo Sueño: Pantalla Principal
// Log manual, score de calidad, alarma óptima, historial
// ============================================================

import { useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import SafeScreen from '@/components/ui/SafeScreen';
import Header from '@/components/layout/Header';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import ProgressCircle from '@/components/charts/ProgressCircle';
import AnimatedNumber from '@/components/ui/AnimatedNumber';
import { useSleep } from '@/hooks/useSleep';
import { Colors } from '@/constants/colors';
import { FontSize, FontFamily, Spacing, Radius } from '@/constants/theme';

// ─── Time picker minimalista ──────────────────────────────
const HOURS   = Array.from({ length: 24 }, (_, i) => i);
const MINUTES = [0, 15, 30, 45];

function TimePicker({
  label, value, onChange,
}: { label: string; value: Date; onChange: (d: Date) => void }) {
  return (
    <View style={styles.timePicker}>
      <Text style={styles.timePickerLabel}>{label}</Text>
      <View style={styles.timePickerRow}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.timeScroll}>
          {HOURS.map((h) => {
            const isSelected = value.getHours() === h;
            return (
              <Pressable
                key={h}
                onPress={() => {
                  const d = new Date(value);
                  d.setHours(h);
                  onChange(d);
                  Haptics.selectionAsync().catch(() => {});
                }}
                style={[styles.timeChip, isSelected && styles.timeChipActive]}
              >
                <Text style={[styles.timeChipText, isSelected && styles.timeChipTextActive]}>
                  {String(h).padStart(2, '0')}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
        <Text style={styles.timeSep}>:</Text>
        <View style={styles.minuteRow}>
          {MINUTES.map((m) => {
            const isSelected = value.getMinutes() === m;
            return (
              <Pressable
                key={m}
                onPress={() => {
                  const d = new Date(value);
                  d.setMinutes(m);
                  onChange(d);
                }}
                style={[styles.timeChip, isSelected && styles.timeChipActive]}
              >
                <Text style={[styles.timeChipText, isSelected && styles.timeChipTextActive]}>
                  {String(m).padStart(2, '0')}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>
    </View>
  );
}

// ─── Pantalla principal ───────────────────────────────────
export default function SleepScreen() {
  const {
    lastSleep, lastDurationHours, lastScore, qualityInfo,
    goalHours, history, avgHours, avgScore, daysWithGoal, sleepDebt, sleepDebtMessage,
    recommendedBedtime, sleepIrregularity, physicalDayState,
    isLogging, logSleep, getOptimalAlarmTimes,
  } = useSleep();

  // Form state
  const defaultBed  = new Date(); defaultBed.setHours(23, 0, 0, 0);
  const defaultWake = new Date(); defaultWake.setHours(7, 0, 0, 0);
  if (defaultWake <= defaultBed) defaultWake.setDate(defaultWake.getDate() + 1);

  const [bedtime,    setBedtime]    = useState(defaultBed);
  const [wakeTime,   setWakeTime]   = useState(defaultWake);
  const [quality,    setQuality]    = useState(3);         // 1-5
  const [deepPct,    setDeepPct]    = useState(20);        // %
  const [remPct,     setRemPct]     = useState(25);        // %
  const [showForm,   setShowForm]   = useState(!lastSleep);

  const durationHours = Math.max(0, (wakeTime.getTime() - bedtime.getTime()) / 3600000);
  const optimalAlarms = getOptimalAlarmTimes(bedtime);

  const handleLog = () => {
    logSleep({ bedtime, wakeTime, quality, deepSleep: deepPct, remSleep: remPct });
    setShowForm(false);
  };

  const maxHistoric = Math.max(...history.map(h => h.duration_min / 60), goalHours);

  return (
    <SafeScreen padHorizontal={false} padBottom>
      <Header title="Sueño" showBack color={Colors.sleep} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>

        {/* Último sueño */}
        {lastSleep && !showForm && (
          <View style={styles.lastSleepSection}>
            <ProgressCircle
              value={Math.min(100, (lastDurationHours / goalHours) * 100)}
              size={160}
              strokeWidth={12}
              color={qualityInfo.color}
              trackColor={Colors.bgElevated}
              animated
            >
              <Text style={styles.sleepEmoji}>😴</Text>
              <Text style={[styles.sleepHours, { color: qualityInfo.color }]}>
                {lastDurationHours.toFixed(1)}h
              </Text>
              <Text style={styles.sleepGoal}>meta {goalHours}h</Text>
            </ProgressCircle>

            <View style={styles.scoreRow}>
              <View style={styles.scoreItem}>
                <Text style={[styles.scoreValue, { color: qualityInfo.color }]}>{lastScore}</Text>
                <Text style={styles.scoreLabel}>Score</Text>
              </View>
              <View style={styles.scoreDivider} />
              <View style={styles.scoreItem}>
                <Text style={[styles.scoreValue, { color: qualityInfo.color }]}>{qualityInfo.label}</Text>
                <Text style={styles.scoreLabel}>Calidad</Text>
              </View>
              <View style={styles.scoreDivider} />
              <View style={styles.scoreItem}>
                <Text style={styles.scoreValue}>{lastSleep.deep_min}m</Text>
                <Text style={styles.scoreLabel}>Sueño prof.</Text>
              </View>
            </View>

            {sleepDebt > 0.5 && (
              <Card style={[styles.debtCard, { borderColor: `${Colors.warning}44` }]}>
                <Text style={styles.debtEmoji}>⚠️</Text>
                <Text style={styles.debtText}>
                  Deuda de sueño: <Text style={{ color: Colors.warning }}>{sleepDebt.toFixed(1)}h</Text> esta semana. Priorizá dormir más.
                </Text>
              </Card>
            )}

            {sleepDebtMessage && (
              <Card style={styles.recommendationCard}>
                <Text style={styles.recommendationTitle}>Plan de recuperación</Text>
                <Text style={styles.recommendationText}>{sleepDebtMessage}</Text>
              </Card>
            )}

            {recommendedBedtime && (
              <Card style={styles.recommendationCard}>
                <Text style={styles.recommendationTitle}>Hora recomendada para dormir</Text>
                <Text style={styles.recommendationText}>
                  Para sostener tu objetivo de {goalHours}h, intentá acostarte cerca de las {recommendedBedtime}.
                </Text>
              </Card>
            )}

            {sleepIrregularity.isIrregular && sleepIrregularity.message && (
              <Card style={styles.irregularCard}>
                <Text style={styles.irregularTitle}>Patrón irregular detectado</Text>
                <Text style={styles.irregularText}>
                  {sleepIrregularity.message} Variación estimada: {sleepIrregularity.stdDevMinutes} min.
                </Text>
              </Card>
            )}

            <Card style={styles.dayStateCard}>
              <Text style={styles.dayStateTitle}>Estado físico del día</Text>
              <Text style={styles.dayStateText}>{physicalDayState.message}</Text>
              <Text style={styles.dayStateMeta}>
                Promedio 3 noches: {physicalDayState.avgLast3Hours}h · Entreno recomendado: {physicalDayState.workoutRecommendation}
              </Text>
            </Card>

            <Button
              onPress={() => setShowForm(true)}
              variant="secondary"
              fullWidth
              size="sm"
              style={styles.logAgainBtn}
            >
              Registrar sueño de hoy
            </Button>
          </View>
        )}

        {/* Formulario de log */}
        {showForm && (
          <View style={styles.formSection}>
            <Text style={styles.formTitle}>¿Cómo dormiste?</Text>

            <TimePicker label="Me acosté a las" value={bedtime} onChange={setBedtime} />
            <TimePicker label="Me desperté a las" value={wakeTime} onChange={setWakeTime} />

            {/* Duration preview */}
            <View style={styles.durationPreview}>
              <Text style={styles.durationLabel}>Duración:</Text>
              <Text style={[styles.durationValue, {
                color: durationHours >= goalHours ? Colors.sleep : Colors.warning
              }]}>
                {durationHours.toFixed(1)}h
              </Text>
            </View>

            {/* Calidad subjetiva */}
            <Text style={styles.sectionLabel}>Calidad subjetiva</Text>
            <View style={styles.qualityRow}>
              {[1,2,3,4,5].map((q) => (
                <Pressable
                  key={q}
                  onPress={() => setQuality(q)}
                  style={[styles.qualityBtn, quality === q && styles.qualityBtnActive]}
                >
                  <Text style={styles.qualityEmoji}>
                    {['😞','😕','😐','🙂','😄'][q-1]}
                  </Text>
                  <Text style={[styles.qualityLabel, quality === q && { color: Colors.sleep }]}>
                    {['Pésimo','Malo','Regular','Bueno','Genial'][q-1]}
                  </Text>
                </Pressable>
              ))}
            </View>

            {/* Deep/REM estimado */}
            <Text style={styles.sectionLabel}>Estimación de fases</Text>
            <SleepPhaseSlider
              label="Sueño profundo"
              value={deepPct}
              onChange={setDeepPct}
              color="#4FC3F7"
              hint="Normal: 15-25%"
            />
            <SleepPhaseSlider
              label="Sueño REM"
              value={remPct}
              onChange={setRemPct}
              color="#CE93D8"
              hint="Normal: 20-25%"
            />

            {/* Alarma óptima */}
            <View style={styles.alarmSection}>
              <Text style={styles.sectionLabel}>Horarios de alarma óptimos</Text>
              <Text style={styles.alarmHint}>Basados en ciclos de 90 min desde {bedtime.toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' })}</Text>
              <View style={styles.alarmRow}>
                {optimalAlarms.map((a, i) => (
                  <View key={i} style={[styles.alarmChip, i === 1 && styles.alarmChipRecommended]}>
                    {i === 1 && <Text style={styles.alarmRecommendedLabel}>Recomendado</Text>}
                    <Text style={[styles.alarmTime, i === 1 && { color: Colors.sleep }]}>
                      {a.toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                    <Text style={styles.alarmCycles}>{[6, 7.5, 9][i]}h</Text>
                  </View>
                ))}
              </View>
            </View>

            <Button
              onPress={handleLog}
              variant="primary"
              fullWidth
              size="lg"
              loading={isLogging}
              disabled={durationHours < 1 || durationHours > 12}
              style={styles.logBtn}
            >
              Guardar sueño
            </Button>

            {lastSleep && (
              <Button onPress={() => setShowForm(false)} variant="ghost" fullWidth size="sm">
                Cancelar
              </Button>
            )}
          </View>
        )}

        {/* Historial 14 días */}
        {history.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Últimas 2 semanas</Text>
            <Card>
              <View style={styles.bars}>
                {history.slice(-14).map((entry, i) => {
                  const hours      = entry.duration_min / 60;
                  const pct        = Math.min(100, (hours / maxHistoric) * 100);
                  const metGoal    = hours >= goalHours;
                  const dayLabel   = new Date(entry.end_time).toLocaleDateString('es', { weekday: 'short' });

                  return (
                    <View key={entry.id} style={styles.barWrap}>
                      <View style={styles.barTrack}>
                        <View style={[styles.goalLine, { bottom: `${(goalHours / maxHistoric) * 100}%` as any }]} />
                        <View style={[styles.barFill, {
                          height: `${pct}%`,
                          backgroundColor: metGoal ? Colors.sleep : `${Colors.sleep}55`,
                        }]} />
                      </View>
                      <Text style={styles.barDay} numberOfLines={1}>{dayLabel}</Text>
                    </View>
                  );
                })}
              </View>
            </Card>
          </View>
        )}

        {/* Stats */}
        <View style={styles.statsRow}>
          <StatCard emoji="😴" label="Promedio" value={`${avgHours.toFixed(1)}h`} />
          <StatCard emoji="⭐" label="Score prom." value={`${Math.round(avgScore)}/100`} />
          <StatCard emoji="🎯" label="Con meta" value={`${daysWithGoal}/${history.length}`} />
        </View>
      </ScrollView>
    </SafeScreen>
  );
}

// ─── SleepPhaseSlider ────────────────────────────────────
function SleepPhaseSlider({
  label, value, onChange, color, hint,
}: { label: string; value: number; onChange: (n: number) => void; color: string; hint: string }) {
  const OPTS = [10, 15, 20, 25, 30, 35];
  return (
    <View style={styles.phaseSlider}>
      <View style={styles.phaseSliderHeader}>
        <Text style={styles.phaseSliderLabel}>{label}</Text>
        <Text style={[styles.phaseSliderValue, { color }]}>{value}%</Text>
      </View>
      <View style={styles.phaseSliderRow}>
        {OPTS.map((o) => (
          <Pressable
            key={o}
            onPress={() => onChange(o)}
            style={[styles.phaseChip, value === o && { backgroundColor: color, borderColor: color }]}
          >
            <Text style={[styles.phaseChipText, value === o && { color: Colors.white }]}>{o}%</Text>
          </Pressable>
        ))}
      </View>
      <Text style={styles.phaseHint}>{hint}</Text>
    </View>
  );
}

function StatCard({ emoji, label, value }: { emoji: string; label: string; value: string }) {
  return (
    <Card style={styles.statCard}>
      <Text>{emoji}</Text>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: Spacing[5], paddingBottom: Spacing[10] },

  // Last sleep
  lastSleepSection: { alignItems: 'center', paddingVertical: Spacing[6] },
  sleepEmoji:       { fontSize: 24, marginBottom: Spacing[1] },
  sleepHours:       { fontFamily: FontFamily.bold, fontSize: FontSize['2xl'], lineHeight: FontSize['2xl'] * 1.1 },
  sleepGoal:        { fontFamily: FontFamily.regular, fontSize: FontSize.sm, color: Colors.textMuted },
  scoreRow:         { flexDirection: 'row', gap: Spacing[4], marginTop: Spacing[5], alignItems: 'center' },
  scoreItem:        { alignItems: 'center' },
  scoreValue:       { fontFamily: FontFamily.bold, fontSize: FontSize.xl, color: Colors.textPrimary },
  scoreLabel:       { fontFamily: FontFamily.regular, fontSize: FontSize.xs, color: Colors.textMuted, marginTop: 2 },
  scoreDivider:     { width: 1, height: 32, backgroundColor: Colors.divider },
  debtCard:         { flexDirection: 'row', alignItems: 'center', gap: Spacing[3], marginTop: Spacing[4], borderWidth: 1, backgroundColor: Colors.warningBg, width: '100%' },
  debtEmoji:        { fontSize: 20 },
  debtText:         { flex: 1, fontFamily: FontFamily.regular, fontSize: FontSize.sm, color: Colors.textSecondary, lineHeight: FontSize.sm * 1.5 },
  recommendationCard: {
    marginTop: Spacing[3],
    width: '100%',
    borderWidth: 1,
    borderColor: `${Colors.sleep}44`,
    backgroundColor: `${Colors.sleep}10`,
  },
  recommendationTitle: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.sm,
    color: Colors.sleep,
    marginBottom: Spacing[1],
  },
  recommendationText: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    lineHeight: FontSize.sm * 1.4,
  },
  irregularCard: {
    marginTop: Spacing[3],
    width: '100%',
    borderWidth: 1,
    borderColor: `${Colors.warning}55`,
    backgroundColor: `${Colors.warning}14`,
  },
  irregularTitle: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.sm,
    color: Colors.warning,
    marginBottom: Spacing[1],
  },
  irregularText: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    lineHeight: FontSize.sm * 1.4,
  },
  dayStateCard: {
    marginTop: Spacing[3],
    width: '100%',
    borderWidth: 1,
    borderColor: `${Colors.steps}55`,
    backgroundColor: `${Colors.steps}10`,
  },
  dayStateTitle: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.sm,
    color: Colors.steps,
    marginBottom: Spacing[1],
  },
  dayStateText: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    lineHeight: FontSize.sm * 1.4,
  },
  dayStateMeta: {
    marginTop: Spacing[1],
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    color: Colors.textMuted,
  },
  logAgainBtn:      { marginTop: Spacing[4] },

  // Form
  formSection:      { paddingVertical: Spacing[4] },
  formTitle:        { fontFamily: FontFamily.bold, fontSize: FontSize['2xl'], color: Colors.textPrimary, marginBottom: Spacing[5] },
  timePicker:       { marginBottom: Spacing[4] },
  timePickerLabel:  { fontFamily: FontFamily.semibold, fontSize: FontSize.sm, color: Colors.textSecondary, marginBottom: Spacing[2] },
  timePickerRow:    { flexDirection: 'row', alignItems: 'center', gap: Spacing[2] },
  timeScroll:       { gap: Spacing[1.5] },
  timeSep:          { fontFamily: FontFamily.bold, fontSize: FontSize.xl, color: Colors.textSecondary },
  minuteRow:        { flexDirection: 'row', gap: Spacing[1.5] },
  timeChip:         { paddingVertical: Spacing[1.5], paddingHorizontal: Spacing[2.5], borderRadius: Radius.lg, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.bgSurface },
  timeChipActive:   { borderColor: Colors.sleep, backgroundColor: `${Colors.sleep}15` },
  timeChipText:     { fontFamily: FontFamily.medium, fontSize: FontSize.sm, color: Colors.textSecondary },
  timeChipTextActive:{ color: Colors.sleep, fontFamily: FontFamily.bold },
  durationPreview:  { flexDirection: 'row', alignItems: 'center', gap: Spacing[2], marginBottom: Spacing[5] },
  durationLabel:    { fontFamily: FontFamily.medium, fontSize: FontSize.base, color: Colors.textSecondary },
  durationValue:    { fontFamily: FontFamily.bold, fontSize: FontSize.xl },
  sectionLabel:     { fontFamily: FontFamily.semibold, fontSize: FontSize.sm, color: Colors.textSecondary, marginBottom: Spacing[2] },
  qualityRow:       { flexDirection: 'row', gap: Spacing[1.5], marginBottom: Spacing[5] },
  qualityBtn:       { flex: 1, alignItems: 'center', paddingVertical: Spacing[2], borderRadius: Radius.xl, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.bgSurface },
  qualityBtnActive: { borderColor: Colors.sleep, backgroundColor: `${Colors.sleep}12` },
  qualityEmoji:     { fontSize: 18 },
  qualityLabel:     { fontFamily: FontFamily.medium, fontSize: 9, color: Colors.textMuted, marginTop: 2 },

  // Phase slider
  phaseSlider:      { marginBottom: Spacing[4] },
  phaseSliderHeader:{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: Spacing[2] },
  phaseSliderLabel: { fontFamily: FontFamily.medium, fontSize: FontSize.sm, color: Colors.textSecondary },
  phaseSliderValue: { fontFamily: FontFamily.bold, fontSize: FontSize.sm },
  phaseSliderRow:   { flexDirection: 'row', gap: Spacing[1.5] },
  phaseChip:        { flex: 1, alignItems: 'center', paddingVertical: Spacing[1.5], borderRadius: Radius.lg, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.bgSurface },
  phaseChipText:    { fontFamily: FontFamily.medium, fontSize: FontSize.xs, color: Colors.textSecondary },
  phaseHint:        { fontFamily: FontFamily.regular, fontSize: FontSize.xs, color: Colors.textMuted, marginTop: Spacing[1] },

  // Alarm
  alarmSection:     { marginBottom: Spacing[5] },
  alarmHint:        { fontFamily: FontFamily.regular, fontSize: FontSize.xs, color: Colors.textMuted, marginBottom: Spacing[3] },
  alarmRow:         { flexDirection: 'row', gap: Spacing[3] },
  alarmChip:        { flex: 1, alignItems: 'center', padding: Spacing[3], borderRadius: Radius.xl, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.bgSurface },
  alarmChipRecommended:{ borderColor: Colors.sleep, backgroundColor: `${Colors.sleep}12` },
  alarmRecommendedLabel:{ fontFamily: FontFamily.bold, fontSize: 9, color: Colors.sleep, marginBottom: 2 },
  alarmTime:        { fontFamily: FontFamily.bold, fontSize: FontSize.xl, color: Colors.textPrimary },
  alarmCycles:      { fontFamily: FontFamily.regular, fontSize: FontSize.xs, color: Colors.textMuted, marginTop: 2 },
  logBtn:           { marginBottom: Spacing[3] },

  // Chart
  section:      { marginBottom: Spacing[5] },
  sectionTitle: { fontFamily: FontFamily.bold, fontSize: FontSize.base, color: Colors.textPrimary, marginBottom: Spacing[3] },
  bars:         { flexDirection: 'row', gap: Spacing[1], height: 120, alignItems: 'flex-end' },
  barWrap:      { flex: 1, alignItems: 'center', gap: Spacing[1] },
  barTrack:     { width: '100%', flex: 1, backgroundColor: Colors.bgElevated, borderRadius: Radius.sm, overflow: 'hidden', position: 'relative', justifyContent: 'flex-end' },
  goalLine:     { position: 'absolute', left: 0, right: 0, height: 1.5, backgroundColor: Colors.sleep, opacity: 0.5, zIndex: 1 },
  barFill:      { borderRadius: Radius.sm },
  barDay:       { fontFamily: FontFamily.medium, fontSize: 8, color: Colors.textMuted },

  statsRow: { flexDirection: 'row', gap: Spacing[3] },
  statCard: { flex: 1, alignItems: 'center', paddingVertical: Spacing[3] },
  statValue:{ fontFamily: FontFamily.bold, fontSize: FontSize.lg, color: Colors.textPrimary, marginTop: Spacing[1] },
  statLabel:{ fontFamily: FontFamily.regular, fontSize: FontSize.xs, color: Colors.textMuted, marginTop: 2, textAlign: 'center' },
});
