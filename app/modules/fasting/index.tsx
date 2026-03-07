// ============================================================
// VYRA FITNESS — Módulo Ayuno: Pantalla Principal
// Timer en vivo, fases metabólicas, protocolo, historial
// ============================================================

import { useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, Alert } from 'react-native';
import Animated, {
  useSharedValue, useAnimatedStyle,
  withRepeat, withSequence, withTiming,
} from 'react-native-reanimated';
import SafeScreen from '@/components/ui/SafeScreen';
import Header from '@/components/layout/Header';
import ProgressCircle from '@/components/charts/ProgressCircle';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import { useFasting, FASTING_PHASES, PROTOCOLS, formatFastingTime, formatFastingTimeShort } from '@/hooks/useFasting';
import { Colors } from '@/constants/colors';
import { FontSize, FontFamily, Spacing, Radius } from '@/constants/theme';

export default function FastingScreen() {
  const {
    activeFast, isActive, isComplete, protocol, targetHours,
    elapsedSeconds, elapsedHours, progressPct,
    currentPhase, nextPhase, nextPhaseIn,
    isLoading, isStarting, isCompleting,
    history, completedFasts, avgHours, longestFast, fastingWeightCorrelation, protocolSuggestion, dailyAdaptiveSuggestion, cycleAwareNotice,
    startFast, completeFast, abandonFast,
  } = useFasting();

  const [showProtocolPicker, setShowProtocolPicker] = useState(false);
  const [selectedProtocol, setSelectedProtocol]     = useState('16:8');

  // Pulso del ring cuando está activo
  const glow = useSharedValue(0.7);
  if (isActive) {
    glow.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1500 }),
        withTiming(0.7, { duration: 1500 })
      ),
      -1, false
    );
  }
  const glowStyle = useAnimatedStyle(() => ({ opacity: glow.value }));

  const handleAbandon = () => {
    Alert.alert(
      'Cancelar ayuno',
      `Llevas ${formatFastingTimeShort(elapsedSeconds)} de ayuno. ¿Seguro que querés cancelar?`,
      [
        { text: 'Seguir ayunando', style: 'cancel' },
        {
          text: 'Cancelar ayuno',
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              'Motivo de ruptura',
              'Seleccioná el motivo principal para personalizar tu coach.',
              [
                { text: 'Hambre física', onPress: () => abandonFast('hambre_fisica') },
                { text: 'Estrés/ansiedad', onPress: () => abandonFast('hambre_emocional') },
                { text: 'Compromiso social', onPress: () => abandonFast('compromiso_social') },
                { text: 'Sin especificar', onPress: () => abandonFast('sin_especificar') },
              ],
            );
          },
        },
      ]
    );
  };

  const handleStartFast = (selectedProtocol: string) => {
    if (['20:4', '23:1', 'OMAD', '24h', '5:2'].includes(selectedProtocol)) {
      Alert.alert(
        'Aviso médico',
        'Este protocolo puede ser exigente. Si tenés una condición médica o dudas clínicas, consultá a un profesional de salud antes de continuar.',
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Entiendo y continuar', onPress: () => startFast(selectedProtocol) },
        ],
      );
      return;
    }

    startFast(selectedProtocol);
  };

  return (
    <SafeScreen padHorizontal={false} padBottom>
      <Header title="Ayuno intermitente" showBack color={Colors.fasting} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>

        {isActive ? (
          <ActiveFastView
            elapsedSeconds={elapsedSeconds}
            elapsedHours={elapsedHours}
            progressPct={progressPct}
            targetHours={targetHours}
            protocol={protocol}
            currentPhase={currentPhase}
            nextPhase={nextPhase}
            nextPhaseIn={nextPhaseIn}
            isComplete={isComplete}
            isCompleting={isCompleting}
            glowStyle={glowStyle}
            onComplete={() => completeFast()}
            onAbandon={handleAbandon}
          />
        ) : (
          <IdleView
            selectedProtocol={selectedProtocol}
            setSelectedProtocol={setSelectedProtocol}
            isStarting={isStarting}
            onStart={() => handleStartFast(selectedProtocol)}
            protocolSuggestion={protocolSuggestion}
          />
        )}

        {cycleAwareNotice ? (
          <Card style={styles.cycleNoticeCard}>
            <Text style={styles.cycleNoticeTitle}>Ajuste por ciclo femenino</Text>
            <Text style={styles.cycleNoticeText}>{cycleAwareNotice}</Text>
          </Card>
        ) : null}

        {!isActive && dailyAdaptiveSuggestion ? (
          <Card style={styles.dailyAdaptiveCard}>
            <Text style={styles.dailyAdaptiveTitle}>Recomendacion adaptativa de hoy</Text>
            <Text style={styles.dailyAdaptiveText}>{dailyAdaptiveSuggestion.message}</Text>
            {dailyAdaptiveSuggestion.suggestedProtocol !== selectedProtocol ? (
              <Pressable
                onPress={() => setSelectedProtocol(dailyAdaptiveSuggestion.suggestedProtocol)}
                style={styles.dailyAdaptiveCta}
              >
                <Text style={styles.dailyAdaptiveCtaText}>
                  Usar {dailyAdaptiveSuggestion.suggestedProtocol}
                </Text>
              </Pressable>
            ) : null}
          </Card>
        ) : null}

        {/* Fases info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Fases metabólicas</Text>
          <View style={styles.phasesGrid}>
            {FASTING_PHASES.map((phase) => {
              const reached = isActive && elapsedHours >= phase.hours;
              const current = isActive && currentPhase.id === phase.id;
              return (
                <View
                  key={phase.id}
                  style={[
                    styles.phaseCard,
                    reached && { borderColor: `${phase.color}66`, backgroundColor: `${phase.color}0A` },
                    current && { borderColor: phase.color, backgroundColor: `${phase.color}18` },
                  ]}
                >
                  <Text style={styles.phaseEmoji}>{phase.emoji}</Text>
                  <Text style={[styles.phaseHour, reached && { color: phase.color }]}>
                    {phase.hours}h
                  </Text>
                  <Text style={[styles.phaseLabel, current && { color: phase.color }]} numberOfLines={1}>
                    {phase.label}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <StatCard emoji="✅" label="Completados" value={String(completedFasts)} />
          <StatCard emoji="⏱️" label="Promedio" value={`${avgHours.toFixed(1)}h`} />
          <StatCard emoji="🏆" label="Más largo" value={`${longestFast.toFixed(1)}h`} />
        </View>
        {fastingWeightCorrelation.insight ? (
          <Card style={styles.correlationCard}>
            <Text style={styles.correlationTitle}>Correlacion ayuno - peso</Text>
            <Text style={styles.correlationText}>{fastingWeightCorrelation.insight}</Text>
            <Text style={styles.correlationMeta}>
              Muestras: post-ayuno {fastingWeightCorrelation.samplePostFast} dias | sin ayuno {fastingWeightCorrelation.sampleNonFast} dias
            </Text>
          </Card>
        ) : null}
        {history.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Historial reciente</Text>
            {history.slice(0, 5).map((h) => (
              <View key={h.id} style={styles.historyRow}>
                <Text style={styles.historyEmoji}>
                  {h.completed ? '✅' : h.abandoned ? '❌' : '⏳'}
                </Text>
                <View style={styles.historyInfo}>
                  <Text style={styles.historyProtocol}>{h.protocol}</Text>
                  <Text style={styles.historyDate}>
                    {new Date(h.start_time).toLocaleDateString('es', { day: 'numeric', month: 'short' })}
                  </Text>
                </View>
                <Text style={[styles.historyHours, h.completed && { color: Colors.fasting }]}>
                  {h.total_hours ? `${h.total_hours.toFixed(1)}h` : '—'}
                </Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeScreen>
  );
}

// ─── Subcomponente: Ayuno activo ─────────────────────────
function ActiveFastView({
  elapsedSeconds, elapsedHours, progressPct, targetHours, protocol,
  currentPhase, nextPhase, nextPhaseIn, isComplete, isCompleting,
  glowStyle, onComplete, onAbandon,
}: any) {
  return (
    <View style={styles.activeSection}>
      {/* Ring */}
      <View style={styles.ringWrap}>
        <Animated.View style={[styles.ringGlow, { backgroundColor: `${currentPhase.color}20` }, glowStyle]} />
        <ProgressCircle
          value={progressPct}
          size={200}
          strokeWidth={14}
          color={currentPhase.color}
          trackColor={Colors.bgElevated}
          animated={false}
        >
          <Text style={[styles.timerText, { color: currentPhase.color }]}>
            {formatFastingTime(elapsedSeconds)}
          </Text>
          <Text style={styles.timerProtocol}>{protocol}</Text>
          <Text style={[styles.timerPct, { color: currentPhase.color }]}>
            {Math.round(progressPct)}%
          </Text>
        </ProgressCircle>
      </View>

      {/* Fase actual */}
      <Card style={[styles.phaseActive, { borderColor: `${currentPhase.color}66` }]}>
        <Text style={styles.phaseActiveEmoji}>{currentPhase.emoji}</Text>
        <View style={styles.phaseActiveInfo}>
          <Text style={[styles.phaseActiveLabel, { color: currentPhase.color }]}>
            {currentPhase.label}
          </Text>
          <Text style={styles.phaseActiveDesc}>{currentPhase.description}</Text>
        </View>
      </Card>

      {/* Próxima fase */}
      {nextPhase && nextPhaseIn !== null && (
        <Text style={styles.nextPhaseText}>
          Próxima fase: <Text style={{ color: nextPhase.color }}>{nextPhase.label}</Text> en{' '}
          {formatFastingTimeShort(nextPhaseIn)}
        </Text>
      )}

      {/* Meta restante */}
      <Text style={styles.targetText}>
        Meta: <Text style={{ color: currentPhase.color }}>{targetHours}h</Text> —{' '}
        {isComplete
          ? '¡Meta alcanzada! 🎉'
          : `Restan ${formatFastingTimeShort(Math.max(0, targetHours * 3600 - elapsedSeconds))}`
        }
      </Text>

      {/* CTAs */}
      <View style={styles.ctaRow}>
        <Button
          onPress={onComplete}
          variant={isComplete ? 'primary' : 'secondary'}
          style={[styles.ctaBtn, { borderColor: currentPhase.color }]}
          loading={isCompleting}
        >
          {isComplete ? 'Completar ayuno 🎉' : 'Terminar ahora'}
        </Button>
        <Button
          onPress={onAbandon}
          variant="ghost"
          style={styles.ctaAbandon}
          size="sm"
        >
          Cancelar
        </Button>
      </View>
    </View>
  );
}

// ─── Subcomponente: Sin ayuno activo ─────────────────────
function IdleView({
  selectedProtocol,
  setSelectedProtocol,
  isStarting,
  onStart,
  protocolSuggestion,
}: any) {
  const proto = PROTOCOLS[selectedProtocol];

  return (
    <View style={styles.idleSection}>
      <Text style={styles.idleEmoji}>⏳</Text>
      <Text style={styles.idleTitle}>Sin ayuno activo</Text>
      <Text style={styles.idleSub}>Elegí un protocolo y comenzá.</Text>

      <View style={styles.protocolGrid}>
        {Object.entries(PROTOCOLS).filter(([id]) => id !== 'custom').map(([id, p]) => (
          <Pressable
            key={id}
            onPress={() => setSelectedProtocol(id)}
            style={[styles.protoCard, selectedProtocol === id && styles.protoCardActive]}
          >
            <Text style={[styles.protoLabel, selectedProtocol === id && { color: Colors.fasting }]}>
              {p.label}
            </Text>
            <Text style={styles.protoDesc} numberOfLines={1}>{p.description}</Text>
          </Pressable>
        ))}
      </View>

      <Card style={styles.protoInfo}>
        <Text style={styles.protoInfoTitle}>{proto.label}</Text>
        <Text style={styles.protoInfoDesc}>{proto.description}</Text>
        <Text style={styles.protoInfoMeta}>
          Ventana de comida: <Text style={{ color: Colors.fasting }}>{proto.windowHours}h</Text>
        </Text>
      </Card>

      {protocolSuggestion?.reason && protocolSuggestion?.suggestedProtocol && (
        <Card style={styles.suggestionCard}>
          <Text style={styles.suggestionTitle}>Sugerencia adaptativa</Text>
          <Text style={styles.suggestionText}>{protocolSuggestion.reason}</Text>
          <Pressable
            onPress={() => setSelectedProtocol(protocolSuggestion.suggestedProtocol)}
            style={styles.suggestionCta}
          >
            <Text style={styles.suggestionCtaText}>
              Usar {protocolSuggestion.suggestedProtocol}
            </Text>
          </Pressable>
        </Card>
      )}

      <Button
        onPress={onStart}
        variant="primary"
        fullWidth
        size="lg"
        loading={isStarting}
        style={[styles.startBtn, { shadowColor: Colors.fasting }]}
      >
        Iniciar ayuno {selectedProtocol} 🔥
      </Button>
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

  // Active
  activeSection: { alignItems: 'center', paddingVertical: Spacing[4] },
  ringWrap:      { position: 'relative', alignItems: 'center', justifyContent: 'center', marginBottom: Spacing[5] },
  ringGlow:      { position: 'absolute', width: 240, height: 240, borderRadius: 120 },
  timerText:     { fontFamily: FontFamily.bold, fontSize: 38, lineHeight: 42 },
  timerProtocol: { fontFamily: FontFamily.medium, fontSize: FontSize.sm, color: Colors.textMuted },
  timerPct:      { fontFamily: FontFamily.bold, fontSize: FontSize.base, marginTop: Spacing[1] },
  phaseActive:   { flexDirection: 'row', alignItems: 'center', gap: Spacing[3], width: '100%', marginBottom: Spacing[3] },
  phaseActiveEmoji:{ fontSize: 28 },
  phaseActiveInfo: { flex: 1 },
  phaseActiveLabel:{ fontFamily: FontFamily.bold, fontSize: FontSize.base },
  phaseActiveDesc: { fontFamily: FontFamily.regular, fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: 2 },
  nextPhaseText: { fontFamily: FontFamily.regular, fontSize: FontSize.sm, color: Colors.textSecondary, marginBottom: Spacing[2], textAlign: 'center' },
  targetText:    { fontFamily: FontFamily.medium, fontSize: FontSize.sm, color: Colors.textSecondary, marginBottom: Spacing[5], textAlign: 'center' },
  ctaRow:        { width: '100%', gap: Spacing[3] },
  ctaBtn:        { borderWidth: 1.5 },
  ctaAbandon:    {},

  // Idle
  idleSection:  { alignItems: 'center', paddingVertical: Spacing[6] },
  idleEmoji:    { fontSize: 72, marginBottom: Spacing[4] },
  idleTitle:    { fontFamily: FontFamily.bold, fontSize: FontSize['2xl'], color: Colors.textPrimary, marginBottom: Spacing[2] },
  idleSub:      { fontFamily: FontFamily.regular, fontSize: FontSize.base, color: Colors.textSecondary, marginBottom: Spacing[5] },
  protocolGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing[2], marginBottom: Spacing[4], width: '100%' },
  protoCard: {
    width: '48%', padding: Spacing[3], borderRadius: Radius.xl,
    borderWidth: 1.5, borderColor: Colors.border, backgroundColor: Colors.bgSurface,
  },
  protoCardActive: { borderColor: Colors.fasting, backgroundColor: `${Colors.fasting}12` },
  protoLabel:      { fontFamily: FontFamily.bold, fontSize: FontSize.lg, color: Colors.textPrimary },
  protoDesc:       { fontFamily: FontFamily.regular, fontSize: FontSize.xs, color: Colors.textMuted, marginTop: 2 },
  protoInfo:       { width: '100%', marginBottom: Spacing[5] },
  protoInfoTitle:  { fontFamily: FontFamily.bold, fontSize: FontSize.lg, color: Colors.textPrimary, marginBottom: Spacing[1] },
  protoInfoDesc:   { fontFamily: FontFamily.regular, fontSize: FontSize.sm, color: Colors.textSecondary, marginBottom: Spacing[2] },
  protoInfoMeta:   { fontFamily: FontFamily.medium, fontSize: FontSize.sm, color: Colors.textSecondary },
  suggestionCard: {
    width: '100%',
    marginBottom: Spacing[4],
    borderWidth: 1,
    borderColor: `${Colors.fasting}55`,
    backgroundColor: `${Colors.fasting}12`,
  },
  suggestionTitle: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.sm,
    color: Colors.fasting,
    marginBottom: Spacing[1],
  },
  suggestionText: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    lineHeight: FontSize.sm * 1.4,
    marginBottom: Spacing[2],
  },
  suggestionCta: {
    alignSelf: 'flex-start',
    paddingVertical: Spacing[1],
    paddingHorizontal: Spacing[2],
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.fasting,
    backgroundColor: `${Colors.fasting}14`,
  },
  suggestionCtaText: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.xs,
    color: Colors.fasting,
  },
  startBtn: { shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.4, shadowRadius: 12, elevation: 8 },
  cycleNoticeCard: {
    marginBottom: Spacing[4],
    borderWidth: 1,
    borderColor: `${Colors.female}55`,
    backgroundColor: `${Colors.female}12`,
  },
  cycleNoticeTitle: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.sm,
    color: Colors.female,
    marginBottom: Spacing[1],
  },
  cycleNoticeText: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    lineHeight: 19,
  },
  dailyAdaptiveCard: {
    marginBottom: Spacing[4],
    borderWidth: 1,
    borderColor: `${Colors.fasting}55`,
    backgroundColor: `${Colors.fasting}10`,
  },
  dailyAdaptiveTitle: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.sm,
    color: Colors.fasting,
    marginBottom: Spacing[1],
  },
  dailyAdaptiveText: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    lineHeight: 19,
  },
  dailyAdaptiveCta: {
    marginTop: Spacing[2],
    alignSelf: 'flex-start',
    paddingVertical: Spacing[1],
    paddingHorizontal: Spacing[2],
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.fasting,
    backgroundColor: `${Colors.fasting}15`,
  },
  dailyAdaptiveCtaText: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.xs,
    color: Colors.fasting,
  },

  // Phases grid
  section:      { marginBottom: Spacing[5] },
  sectionTitle: { fontFamily: FontFamily.bold, fontSize: FontSize.base, color: Colors.textPrimary, marginBottom: Spacing[3] },
  phasesGrid:   { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing[2] },
  phaseCard: {
    width: '30%', alignItems: 'center', padding: Spacing[2],
    borderRadius: Radius.xl, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.bgSurface,
  },
  phaseEmoji: { fontSize: 18, marginBottom: 2 },
  phaseHour:  { fontFamily: FontFamily.bold, fontSize: FontSize.sm, color: Colors.textMuted },
  phaseLabel: { fontFamily: FontFamily.medium, fontSize: 9, color: Colors.textMuted, textAlign: 'center' },

  // Stats
  statsRow:   { flexDirection: 'row', gap: Spacing[3], marginBottom: Spacing[4] },
  statCard:   { flex: 1, alignItems: 'center', paddingVertical: Spacing[3] },
  statValue:  { fontFamily: FontFamily.bold, fontSize: FontSize.xl, color: Colors.textPrimary, marginTop: Spacing[1] },
  statLabel:  { fontFamily: FontFamily.regular, fontSize: FontSize.xs, color: Colors.textMuted, marginTop: 2, textAlign: 'center' },
  correlationCard: {
    marginBottom: Spacing[4],
    backgroundColor: `${Colors.fasting}12`,
    borderWidth: 1,
    borderColor: `${Colors.fasting}55`,
  },
  correlationTitle: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.sm,
    color: Colors.fasting,
    marginBottom: Spacing[1],
  },
  correlationText: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    lineHeight: 19,
  },
  correlationMeta: {
    marginTop: Spacing[2],
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    color: Colors.textMuted,
  },

  // History
  historyRow:     { flexDirection: 'row', alignItems: 'center', gap: Spacing[3], paddingVertical: Spacing[2.5], borderBottomWidth: 1, borderBottomColor: Colors.divider },
  historyEmoji:   { fontSize: 18 },
  historyInfo:    { flex: 1 },
  historyProtocol:{ fontFamily: FontFamily.semibold, fontSize: FontSize.sm, color: Colors.textPrimary },
  historyDate:    { fontFamily: FontFamily.regular, fontSize: FontSize.xs, color: Colors.textMuted, marginTop: 2 },
  historyHours:   { fontFamily: FontFamily.bold, fontSize: FontSize.base, color: Colors.textMuted },
});


