// ============================================================
// VYRA FITNESS — Módulo Pasos: Pantalla Principal
// Ring live con pedómetro, métricas, historial de 7 días
// ============================================================

import { useEffect } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue, useAnimatedStyle,
  withRepeat, withTiming, withSequence, Easing,
} from 'react-native-reanimated';
import { router } from 'expo-router';
import SafeScreen from '@/components/ui/SafeScreen';
import Header from '@/components/layout/Header';
import ProgressCircle from '@/components/charts/ProgressCircle';
import AnimatedNumber from '@/components/ui/AnimatedNumber';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { useSteps } from '@/hooks/useSteps';
import { Colors } from '@/constants/colors';
import { FontSize, FontFamily, Spacing, Radius } from '@/constants/theme';

export default function StepsScreen() {
  const {
    isAvailable, liveSteps, totalSteps, goal,
    progressPct, distanceKm, calories, remaining,
    isLoading, weeklyData, weeklyAvg, daysMetGoal,
    manualSave,
  } = useSteps();

  // Pulso del ícono de pasos cuando hay movimiento
  const pulse = useSharedValue(1);
  useEffect(() => {
    if (liveSteps > 0) {
      pulse.value = withRepeat(
        withSequence(
          withTiming(1.12, { duration: 400, easing: Easing.out(Easing.quad) }),
          withTiming(1.0,  { duration: 400, easing: Easing.in(Easing.quad) })
        ),
        -1, false
      );
    } else {
      pulse.value = withTiming(1);
    }
  }, [liveSteps > 0]);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
  }));

  const maxWeekly = Math.max(...weeklyData.map(d => d.steps), goal);

  return (
    <SafeScreen padHorizontal={false} padBottom>
      <Header
        title="Pasos"
        showBack
        color={Colors.steps}
        rightAction={
          <Pressable onPress={() => router.push('/modules/steps/settings' as any)} style={styles.settingsBtn}>
            <Text style={styles.settingsText}>Meta</Text>
          </Pressable>
        }
      />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {/* Ring principal */}
        <View style={styles.ringSection}>
          <ProgressCircle
            value={progressPct}
            size={200}
            strokeWidth={14}
            color={Colors.steps}
            trackColor={Colors.bgElevated}
            animated
            duration={800}
          >
            <Animated.Text style={[styles.ringEmoji, pulseStyle]}>🚶</Animated.Text>
            <AnimatedNumber
              value={totalSteps}
              duration={600}
              style={styles.ringSteps}
            />
            <Text style={styles.ringGoal}>de {goal.toLocaleString('es')} pasos</Text>
          </ProgressCircle>

          {!isAvailable && (
            <Text style={styles.unavailableText}>
              Pedómetro no disponible en este dispositivo
            </Text>
          )}
          {liveSteps > 0 && (
            <View style={styles.liveBadge}>
              <View style={styles.liveDot} />
              <Text style={styles.liveText}>+{liveSteps} desde que abriste</Text>
            </View>
          )}
        </View>

        {/* Métricas */}
        <View style={styles.metricsRow}>
          <MetricCard emoji="📏" label="Distancia" value={`${(typeof distanceKm === 'number' ? distanceKm : parseFloat(String(distanceKm))).toFixed(2)}km`} color={Colors.steps} />
          <MetricCard emoji="🔥" label="Calorías"  value={`${Math.round(calories)} kcal`} color={Colors.workout} />
          <MetricCard emoji="🎯" label="Restantes" value={remaining > 0 ? `${remaining.toLocaleString('es')}` : '¡Meta!'} color={remaining === 0 ? Colors.success : Colors.textMuted} />
        </View>

        {/* Progreso % */}
        {remaining === 0 && (
          <Card style={[styles.goalCard, { borderColor: `${Colors.steps}44` }]}>
            <Text style={styles.goalEmoji}>🎉</Text>
            <Text style={styles.goalText}>¡Meta diaria alcanzada!</Text>
          </Card>
        )}

        {/* Botón guardar */}
        {liveSteps > 0 && (
          <Button
            onPress={manualSave}
            variant="primary"
            fullWidth
            style={styles.saveBtn}
            size="md"
          >
            Guardar progreso
          </Button>
        )}

        {/* Barchart 7 días */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Últimos 7 días</Text>
          <Card>
            <View style={styles.bars}>
              {weeklyData.map((day) => {
                const pct      = Math.min(100, (day.steps / maxWeekly) * 100);
                const metGoal  = day.steps >= goal;
                const isToday  = day.logged_date === new Date().toISOString().split('T')[0];
                const dayLabel = new Date(day.logged_date + 'T12:00:00').toLocaleDateString('es', { weekday: 'short' });

                return (
                  <View key={day.logged_date} style={styles.barWrap}>
                    <Text style={styles.barVal}>
                      {day.steps >= 1000 ? `${(day.steps/1000).toFixed(1)}k` : day.steps}
                    </Text>
                    <View style={styles.barTrack}>
                      {/* meta line */}
                      <View style={[styles.goalLine, { bottom: `${(goal / maxWeekly) * 100}%` as any }]} />
                      <View style={[styles.barFill, {
                        height: `${pct}%`,
                        backgroundColor: metGoal ? Colors.steps : `${Colors.steps}55`,
                      }]} />
                    </View>
                    <Text style={[styles.barDay, isToday && { color: Colors.steps, fontFamily: FontFamily.bold }]}>
                      {isToday ? 'Hoy' : dayLabel}
                    </Text>
                  </View>
                );
              })}
            </View>
          </Card>
        </View>

        {/* Stats semana */}
        <View style={styles.statsRow}>
          <StatCard label="Promedio" value={`${weeklyAvg.toLocaleString('es')}`} emoji="📊" />
          <StatCard label="Días con meta" value={`${daysMetGoal}/7`} emoji="🎯" />
          <StatCard label="Total km" value={`${weeklyData.reduce((s, d) => s + (d.distance_m ?? 0), 0 / 1000).toFixed(1)}`} emoji="📏" />
        </View>
      </ScrollView>
    </SafeScreen>
  );
}

function MetricCard({ emoji, label, value, color }: { emoji: string; label: string; value: string; color: string }) {
  return (
    <Card style={styles.metricCard}>
      <Text style={styles.metricEmoji}>{emoji}</Text>
      <Text style={[styles.metricValue, { color }]}>{value}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
    </Card>
  );
}

function StatCard({ emoji, label, value }: { emoji: string; label: string; value: string }) {
  return (
    <Card style={styles.statCard}>
      <Text style={styles.statEmoji}>{emoji}</Text>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: Spacing[5], paddingBottom: Spacing[10] },
  settingsBtn:  { paddingHorizontal: Spacing[2] },
  settingsText: { fontFamily: FontFamily.medium, fontSize: FontSize.sm, color: Colors.steps },
  ringSection:  { alignItems: 'center', paddingVertical: Spacing[6] },
  ringEmoji:    { fontSize: 28, marginBottom: Spacing[1] },
  ringSteps:    { fontFamily: FontFamily.bold, fontSize: FontSize['3xl'], color: Colors.steps, lineHeight: FontSize['3xl'] * 1.1 },
  ringGoal:     { fontFamily: FontFamily.regular, fontSize: FontSize.sm, color: Colors.textMuted },
  unavailableText: { fontFamily: FontFamily.regular, fontSize: FontSize.sm, color: Colors.warning, marginTop: Spacing[3], textAlign: 'center' },
  liveBadge:    { flexDirection: 'row', alignItems: 'center', gap: Spacing[2], marginTop: Spacing[3], backgroundColor: `${Colors.steps}15`, paddingHorizontal: Spacing[3], paddingVertical: Spacing[1.5], borderRadius: Radius.full },
  liveDot:      { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.steps },
  liveText:     { fontFamily: FontFamily.medium, fontSize: FontSize.sm, color: Colors.steps },
  metricsRow:   { flexDirection: 'row', gap: Spacing[3], marginBottom: Spacing[4] },
  metricCard:   { flex: 1, alignItems: 'center', paddingVertical: Spacing[3] },
  metricEmoji:  { fontSize: 20, marginBottom: Spacing[1] },
  metricValue:  { fontFamily: FontFamily.bold, fontSize: FontSize.base },
  metricLabel:  { fontFamily: FontFamily.regular, fontSize: FontSize.xs, color: Colors.textMuted, marginTop: 2 },
  goalCard:     { flexDirection: 'row', alignItems: 'center', gap: Spacing[3], marginBottom: Spacing[4], borderWidth: 1, backgroundColor: `${Colors.steps}0A` },
  goalEmoji:    { fontSize: 28 },
  goalText:     { fontFamily: FontFamily.bold, fontSize: FontSize.base, color: Colors.steps },
  saveBtn:      { marginBottom: Spacing[4], borderColor: Colors.steps },
  section:      { marginBottom: Spacing[4] },
  sectionTitle: { fontFamily: FontFamily.bold, fontSize: FontSize.base, color: Colors.textPrimary, marginBottom: Spacing[3] },
  bars:         { flexDirection: 'row', gap: Spacing[2], height: 120, alignItems: 'flex-end' },
  barWrap:      { flex: 1, alignItems: 'center', gap: Spacing[1] },
  barVal:       { fontFamily: FontFamily.regular, fontSize: 8, color: Colors.textMuted },
  barTrack:     { width: '100%', flex: 1, backgroundColor: Colors.bgElevated, borderRadius: Radius.sm, overflow: 'hidden', position: 'relative', justifyContent: 'flex-end' },
  goalLine:     { position: 'absolute', left: 0, right: 0, height: 1.5, backgroundColor: Colors.steps, opacity: 0.5, zIndex: 1 },
  barFill:      { borderRadius: Radius.sm },
  barDay:       { fontFamily: FontFamily.medium, fontSize: 9, color: Colors.textMuted },
  statsRow:     { flexDirection: 'row', gap: Spacing[3] },
  statCard:     { flex: 1, alignItems: 'center', paddingVertical: Spacing[3] },
  statEmoji:    { fontSize: 20, marginBottom: Spacing[1] },
  statValue:    { fontFamily: FontFamily.bold, fontSize: FontSize.base, color: Colors.textPrimary },
  statLabel:    { fontFamily: FontFamily.regular, fontSize: FontSize.xs, color: Colors.textMuted, marginTop: 2, textAlign: 'center' },
});