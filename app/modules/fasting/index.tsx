// FIX #6: Removed unused `ScrollView` import
import { Pressable, StyleSheet, Text, View, Animated } from 'react-native';
import { useMemo, useState, useRef, useEffect } from 'react';
import Header from '@/components/layout/Header';
import ModuleScaffold from '@/components/modules/ModuleScaffold';
import FastingModuleTabs from '@/components/fasting/FastingModuleTabs';
import ModuleIntroScreen from '@/components/modules/ModuleIntroScreen';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import SafeScreen from '@/components/ui/SafeScreen';
import Modal from '@/components/ui/Modal';
import { Colors, withOpacity } from '@/constants/colors';
import { useUIStore } from '@/stores/uiStore';
import { FontFamily, FontSize, Radius, Spacing } from '@/constants/theme';
import {
  PROTOCOLS,
  formatFastingTime,
  formatFastingTimeShort,
  useFasting,
} from '@/hooks/useFasting';
import { useSettingsStore } from '@/stores/settingsStore';
import { useAuthStore } from '@/stores/authStore';
import CircularProgress from '@/components/fasting/CircularProgress';
import MetabolicTimeline from '@/components/fasting/MetabolicTimeline';

const MAIN_PROTOCOLS = ['16:8', '14:10', '18:6'] as const;

const METABOLIC_ZONES = [
  { id: 'fed',       label: 'Saciado',    emoji: '🍽️', start: 0,  description: 'Digiriendo y con energía todavía cerca de la última comida.' },
  { id: 'early',     label: 'Adaptando',  emoji: '⚡',  start: 4,  description: 'Empieza a bajar la energía fácil y el cuerpo cambia de fuente.' },
  { id: 'fat',       label: 'Fat burn',   emoji: '🔥',  start: 12, description: 'Se vuelve más fácil usar grasa como combustible principal.' },
  { id: 'ketosis',   label: 'Ketosis',    emoji: '✨',  start: 16, description: 'La señal de cetosis ya aparece con bastante claridad.' },
  { id: 'autophagy', label: 'Autofagia',  emoji: '🌿',  start: 18, description: 'Ventana avanzada. Aquí vale más el contexto y la recuperación.' },
] as const;

const ZONE_COLORS: Record<string, string> = {
  fed:       '#94A3B8',
  early:     '#F59E0B',
  fat:       '#F97316',
  ketosis:   Colors.fasting,
  autophagy: '#8B5CF6',
};

const OFFSET_STEP = 15;
const MIN_OFFSET = -12 * 60;
const MAX_OFFSET = 4 * 60;

function getCurrentZone(hours: number) {
  for (let i = METABOLIC_ZONES.length - 1; i >= 0; i -= 1) {
    if (hours >= METABOLIC_ZONES[i].start) return METABOLIC_ZONES[i];
  }
  return METABOLIC_ZONES[0];
}

function formatEndPrediction(remainingSeconds: number) {
  const end = new Date(Date.now() + remainingSeconds * 1000);
  const today = new Date();
  const sameDay = end.toDateString() === today.toDateString();
  const time = end.toLocaleTimeString('es-UY', { hour: '2-digit', minute: '2-digit' });
  if (sameDay) return `Termina a las ${time}`;
  return `Termina a las ${time} · ${end.toLocaleDateString('es-UY', { day: 'numeric', month: 'short' })}`;
}

function formatOffsetLabel(offsetMinutes: number, startDate: Date): string {
  const time = startDate.toLocaleTimeString('es-UY', { hour: '2-digit', minute: '2-digit' });
  if (offsetMinutes === 0) return `Ahora · ${time}`;
  const abs = Math.abs(offsetMinutes);
  const h = Math.floor(abs / 60);
  const m = abs % 60;
  const parts: string[] = [];
  if (h > 0) parts.push(`${h}h`);
  if (m > 0) parts.push(`${m}m`);
  const duration = parts.join(' ');
  const today = new Date();
  // Compare dates using UTC midnight to avoid timezone issues when
  // deciding if the startDate was 'yesterday'.
  const utcToday = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());
  const utcStart = Date.UTC(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
  const dayDiff = Math.floor((utcToday - utcStart) / (24 * 60 * 60 * 1000));
  const dayLabel = dayDiff === 1 ? ' · ayer' : '';
  return offsetMinutes < 0
    ? `Hace ${duration}${dayLabel} · ${time}`
    : `En ${duration} · ${time}`;
}

// CircularProgress and MetabolicTimeline extracted to components/fasting

// FIX #7: StatCard moved BEFORE the component that uses it to avoid
// "used before defined" issues with some bundlers/strict TS configs.
function StatCard({ label, value, icon, color }: { label: string; value: string; icon: string; color: string }) {
  return (
    <Card style={styles.statCard} shadow={false}>
      <Text style={styles.statIcon}>{icon}</Text>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </Card>
  );
}

export default function FastingScreen() {
  const hasSeenIntro = useSettingsStore((s) => Boolean(s.moduleIntroSeen.fasting));
  const markModuleIntroSeen = useSettingsStore((s) => s.markModuleIntroSeen);
  const {
    activeFast, isActive, isComplete, protocol, targetHours, elapsedSeconds, elapsedHours,
    progressPct, history, completedFasts, avgHours, longestFast,
    dailyAdaptiveSuggestion, cycleAwareNotice, isStarting, isCompleting,
    startFast, completeFast, abandonFast, deleteFast,
    // FIX #3: isDeleting is now actually used for the delete confirmation button
    isDeleting,
    // 5:2 helpers
    plannedToday,
    isFiveTwoDay,
    fiveTwoWeekSummary,
  } = useFasting();

  const showToast = useUIStore((s) => s.showToast);
  const profile = useAuthStore((s) => s.profile);

  const [selectedProtocol, setSelectedProtocol] = useState<'16:8' | '14:10' | '18:6'>('16:8');
  const [selectedZoneId, setSelectedZoneId] = useState<typeof METABOLIC_ZONES[number]['id'] | null>(null);
  const [showEarlyFinishSheet, setShowEarlyFinishSheet] = useState(false);
  const [showTimeAdjust, setShowTimeAdjust] = useState(false);
  const [startOffsetMinutes, setStartOffsetMinutes] = useState(0);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (isActive && !isComplete) {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.04, duration: 2000, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 2000, useNativeDriver: true }),
        ])
      );
      pulse.start();
      return () => pulse.stop();
    }
    return undefined;
  }, [isActive, isComplete, pulseAnim]);

  const elapsedLabel = useMemo(() => formatFastingTimeShort(elapsedSeconds), [elapsedSeconds]);
  const remainingSeconds = Math.max(0, targetHours * 3600 - elapsedSeconds);
  const activeZone = getCurrentZone(elapsedHours);
  const selectedZone = METABOLIC_ZONES.find((z) => z.id === selectedZoneId) ?? null;
  const progressClamped = Math.max(0, Math.min(100, progressPct));

  const customStartDate = useMemo(() => {
    const d = new Date();
    d.setMinutes(d.getMinutes() + startOffsetMinutes);
    return d;
  }, [startOffsetMinutes]);

  const startTimeLabel = useMemo(
    () => formatOffsetLabel(startOffsetMinutes, customStartDate),
    [startOffsetMinutes, customStartDate],
  );

  const adjustOffset = (delta: number) => {
    setStartOffsetMinutes((prev) => Math.max(MIN_OFFSET, Math.min(MAX_OFFSET, prev + delta)));
  };

  const handleStartFast = () => {
    if (isActive) {
      showToast('Ya hay un ayuno en curso.', 'info');
      return;
    }

    // FIX #1: Unified startFast API — always pass protocol as first arg,
    // optional options object as the first argument when using an object form.
    if (startOffsetMinutes !== 0) {
      // startFast accepts either a protocol string or an object with protocol + startTime
      startFast({ protocol: selectedProtocol, startTime: customStartDate });
    } else {
      startFast({ protocol: selectedProtocol });
    }
    setStartOffsetMinutes(0);
    setShowTimeAdjust(false);
  };

  if (!hasSeenIntro) {
    return (
      <SafeScreen padHorizontal={false} padBottom>
        <Header title="Ayuno" showBack />
        <ModuleIntroScreen
          accentColor={Colors.fasting}
          icon="Ayuno"
          title="Ayuno"
          body="Elegí una ventana simple y dejá que VYRA lleve el tiempo, el progreso y cuándo conviene romper."
          ctaLabel="Entrar al módulo"
          onContinue={() => markModuleIntroSeen('fasting')}
        />
      </SafeScreen>
    );
  }

  return (
    <ModuleScaffold
      title="Ayuno"
      color={Colors.fasting}
      tabs={<FastingModuleTabs active="home" />}
      contentContainerStyle={styles.content}
    >

        {/* ─── Estado inactivo ─────────────────────────────── */}
        {!isActive ? (
          <Card style={styles.startCard} shadow={false}>
            <Text style={styles.sectionTitle}>Iniciar ayuno</Text>

            {/* Chips de protocolo */}
            <View style={styles.protocolRow}>
              {MAIN_PROTOCOLS.map((item) => {
                const selected = selectedProtocol === item;
                return (
                  <Pressable
                    key={item}
                    style={[styles.protocolChip, selected && styles.protocolChipActive]}
                    onPress={() => setSelectedProtocol(item)}
                    accessibilityRole="radio"
                    accessibilityState={{ checked: selected }}
                    accessibilityLabel={`Protocolo ${item}`}
                    accessibilityHint={PROTOCOLS[item].description}
                  >
                    {selected && <View style={styles.protocolChipDot} />}
                    <Text style={[styles.protocolLabel, selected && styles.protocolLabelActive]}>
                      {item}
                    </Text>
                    <Text
                      style={[styles.protocolHint, selected && styles.protocolHintActive]}
                      numberOfLines={2}
                    >
                      {PROTOCOLS[item].description}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {/* Toggle de ajuste de hora */}
            <Pressable
              style={[styles.timeAdjustToggle, showTimeAdjust && styles.timeAdjustToggleOpen]}
              onPress={() => {
                setShowTimeAdjust((v) => !v);
                if (showTimeAdjust) setStartOffsetMinutes(0);
              }}
              accessibilityRole="button"
              accessibilityLabel="Ajustar hora de inicio"
            >
              <Text style={styles.timeAdjustToggleLabel}>
                {showTimeAdjust ? '✕  Cancelar ajuste' : '⏱  Ajustar hora de inicio'}
              </Text>
              <Text style={styles.timeAdjustToggleSub}>
                {showTimeAdjust
                  ? 'Se usará la hora actual al cancelar'
                  : 'Si ya empezaste antes o vas a empezar después'}
              </Text>
            </Pressable>

            {/* Panel de ajuste */}
            {showTimeAdjust && (
              <View style={styles.timeAdjustCard}>
                <Text style={styles.timeAdjustTitle}>¿A qué hora empezaste (o empezás)?</Text>
                <View style={styles.timeAdjustControls}>
                  <Pressable
                    onPress={() => adjustOffset(-OFFSET_STEP)}
                    disabled={startOffsetMinutes <= MIN_OFFSET}
                    style={[styles.offsetBtn, startOffsetMinutes <= MIN_OFFSET && styles.offsetBtnDisabled]}
                    hitSlop={12}
                    accessibilityLabel="Restar 15 minutos"
                  >
                    <Text style={styles.offsetBtnText}>−</Text>
                  </Pressable>
                  <View style={styles.offsetDisplay}>
                    <Text style={styles.offsetTime}>
                      {customStartDate.toLocaleTimeString('es-UY', { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                    <Text style={styles.offsetRelative}>{startTimeLabel}</Text>
                  </View>
                  <Pressable
                    onPress={() => adjustOffset(OFFSET_STEP)}
                    disabled={startOffsetMinutes >= MAX_OFFSET}
                    style={[styles.offsetBtn, startOffsetMinutes >= MAX_OFFSET && styles.offsetBtnDisabled]}
                    hitSlop={12}
                    accessibilityLabel="Sumar 15 minutos"
                  >
                    <Text style={styles.offsetBtnText}>+</Text>
                  </Pressable>
                </View>
                <Text style={styles.offsetHint}>Cada toque mueve 15 minutos · hasta 12h atrás o 4h adelante</Text>
              </View>
            )}

            {dailyAdaptiveSuggestion ? (
              <Card style={styles.contextCard} shadow={false}>
                <View style={styles.contextRow}>
                  <Text style={styles.contextEmoji}>💡</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.contextTitle}>Hoy conviene esto</Text>
                    <Text style={styles.contextBody}>{dailyAdaptiveSuggestion.message}</Text>
                  </View>
                </View>
              </Card>
            ) : null}

            <Button
              label={`Iniciar ${selectedProtocol}${startOffsetMinutes !== 0 ? ` · ${startTimeLabel.split('·')[0].trim()}` : ''}`}
              onPress={handleStartFast}
              loading={isStarting}
              fullWidth
              color={Colors.fasting}
              disabled={isActive}
            />

            <Text style={styles.lastFastText}>
              {completedFasts > 0
                ? `Promedio ${avgHours.toFixed(1)}h · mejor ${longestFast.toFixed(1)}h`
                : 'Aún no hay ayunos completados.'}
            </Text>
          </Card>

        /* ─── Estado activo ──────────────────────────────── */
        ) : (
          <Card
            style={[styles.activeCard, isComplete && styles.activeCardComplete]}
            shadow={false}
          >
            {/* Badge estado */}
            <View style={styles.activeBadgeRow}>
              <View style={[styles.activeBadge, isComplete && styles.activeBadgeComplete]}>
                <View style={[styles.activeDot, isComplete && styles.activeDotComplete]} />
                <Text style={[styles.activeLabel, isComplete && styles.activeLabelComplete]}>
                  {isComplete ? 'Ayuno completado' : 'Ayuno activo'}
                </Text>
              </View>
              <Text style={styles.activeMeta}>{protocol}</Text>
            </View>

            {isComplete ? (
              <View style={styles.completeHero}>
                <Text style={styles.completeEmoji}>🎉</Text>
                <Text style={styles.completeTitle}>¡Lo lograste!</Text>
                <Text style={styles.completeSub}>
                  {protocol} · {elapsedLabel} completadas
                </Text>
              </View>
            ) : (
              /* Timer circular */
              <View style={styles.timerContainer}>
                <Animated.View style={[styles.timerRingOuter, { transform: [{ scale: pulseAnim }] }]}>
                  <View style={styles.timerRingInner}>
                    {/* Anillos de progreso */}
                    <CircularProgress
                      progress={progressClamped}
                      size={196}
                      strokeWidth={6}
                      color={ZONE_COLORS[activeZone.id]}
                    />
                    {/* Contenido central */}
                    <View style={styles.timerCenter}>
                      <Text style={styles.timerZoneEmoji}>{activeZone.emoji}</Text>
                      <Text style={styles.timerText}>{formatFastingTime(remainingSeconds)}</Text>
                      <Text style={styles.timerSubtext}>restantes</Text>
                    </View>
                  </View>
                </Animated.View>

                {/* Meta y fase */}
                <View style={styles.timerMeta}>
                  <Text style={[styles.phaseLine, { color: ZONE_COLORS[activeZone.id] }]}>
                    {activeZone.emoji} {activeZone.label}
                  </Text>
                  <Text style={styles.endPrediction}>{formatEndPrediction(remainingSeconds)}</Text>
                  <Text style={styles.elapsedHint}>{elapsedLabel} completadas · {Math.round(progressClamped)}%</Text>
                </View>
              </View>
            )}

            {/* Timeline metabólica */}
            {!isComplete && (
              <View style={styles.timelineWrapper}>
                <Text style={styles.timelineTitle}>Zonas metabólicas</Text>
                <MetabolicTimeline elapsedHours={elapsedHours} targetHours={targetHours} />
                <View style={styles.zoneChipRow}>
                  {METABOLIC_ZONES.map((zone) => {
                    const active = activeZone.id === zone.id;
                    const passed = elapsedHours >= zone.start;
                    return (
                      <Pressable
                        key={zone.id}
                        onPress={() => setSelectedZoneId(zone.id)}
                        style={[
                          styles.zoneChip,
                          active && [styles.zoneChipActive, { borderColor: withOpacity(ZONE_COLORS[zone.id], 0.5), backgroundColor: withOpacity(ZONE_COLORS[zone.id], 0.1) }],
                          passed && !active && styles.zoneChipPassed,
                        ]}
                        accessibilityRole="button"
                        accessibilityState={{ selected: active }}
                        accessibilityLabel={zone.label}
                        accessibilityHint={zone.description}
                      >
                        <Text style={[
                          styles.zoneChipText,
                          active && { color: ZONE_COLORS[zone.id], fontFamily: FontFamily.bold },
                          passed && !active && { color: Colors.textSecondary },
                        ]}>
                          {zone.label}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            )}

            {cycleAwareNotice && profile?.female_health_enabled ? (
              <Card style={styles.phaseCard} shadow={false}>
                <Text style={styles.contextTitle}>Contexto femenino</Text>
                <Text style={styles.contextBody}>{cycleAwareNotice}</Text>
              </Card>
            ) : null}

            <Button
              label={isComplete ? 'Registrar y cerrar' : 'Completar ayuno'}
              onPress={() => completeFast()}
              loading={isCompleting}
              fullWidth
              color={isComplete ? Colors.success : Colors.fasting}
            />

            {!isComplete && (
              <Button
                label="Terminar anticipadamente"
                onPress={() => setShowEarlyFinishSheet(true)}
                variant="ghost"
                fullWidth
              />
            )}
          </Card>
        )}

        {/* ─── Si hoy es 5:2 y no hay ayuno activo, mostrar tarjeta rápida ───────────────────── */}
        {!isActive && isFiveTwoDay && plannedToday ? (
          <Card style={styles.fiveTwoCard} shadow={false}>
            <View style={styles.fiveTwoHeader}>
              <Text style={styles.fiveTwoTitle}>📅 Hoy es tu día 5:2</Text>
              <View style={styles.fiveTwoStatus}>
                {plannedToday.status === 'planned' && (
                  <Text style={styles.fiveTwoStatusText}>Pendiente</Text>
                )}
              </View>
            </View>
            <Text style={styles.fiveTwoDesc}>
              Protocolo: {plannedToday.protocol} · Objetivo: {(plannedToday.target_duration / 3600).toFixed(0)}h
            </Text>
            <Button
              label="Iniciar ayuno 5:2 de hoy"
              onPress={() => startFast({ protocol: '5:2', sessionId: plannedToday.id })}
              loading={isStarting}
              color={Colors.fasting}
              fullWidth
            />
          </Card>
        ) : null}

        {/* ─── Grilla de estadísticas ───────────────────── */}
        <View style={styles.statsGrid}>
          <StatCard label="Completados" value={String(completedFasts)} icon="🏁" color={Colors.fasting} />
          <StatCard label="Promedio" value={`${avgHours.toFixed(1)}h`} icon="📊" color={Colors.warning} />
          <StatCard label="Más largo" value={`${longestFast.toFixed(1)}h`} icon="🏆" color={Colors.success} />
        </View>

        {/* ─── Historial ───────────────────────────────── */}
        <Card style={styles.historyCard} shadow={false}>
          <View style={styles.historyHeader}>
            <Text style={styles.sectionTitle}>Últimos ayunos</Text>
            {/* 'Ver todo' hidden until a full history screen exists */}
          </View>

          {history.length === 0 ? (
            <View style={styles.emptyHistory}>
              <Text style={styles.emptyHistoryEmoji}>🌙</Text>
              <Text style={styles.emptyHistoryText}>Todavía no hay ayunos registrados.</Text>
              <Text style={styles.emptyHistoryHint}>
                Completá tu primer ayuno para ver el historial acá.
              </Text>
            </View>
          ) : (
            <View style={styles.historyList}>
              {history.slice(0, 7).map((item) => {
                const hours = Number(item.total_hours ?? 0);
                const target = PROTOCOLS[item.protocol ?? '16:8']?.targetHours ?? 16;
                const pct = Math.max(0, Math.min(100, (hours / Math.max(1, target)) * 100));
                const isCompleted = pct >= 90;
                const statusIcon =
                  item.status === 'completed'    ? '✅' :
                  item.status === 'interrupted'  ? '⏸️' :
                  item.status === 'missed'       ? '❌' :
                  item.status === 'planned'      ? '📅' : '⏸️';
                const fillColor =
                  item.status === 'completed' ? Colors.fasting :
                  item.status === 'missed' ? Colors.error : Colors.warning;
                const displayDateLabel = (() => {
                  try {
                    const d = item.start_time
                      ? new Date(item.start_time)
                      : (item.scheduled_date ? new Date(`${item.scheduled_date}T00:00:00`) : null);
                    return d ? d.toLocaleDateString('es-UY', { day: 'numeric', month: 'short' }) : '';
                  } catch {
                    return '';
                  }
                })();

                return (
                  <View key={item.id} style={styles.historyRow}>
                    <View style={styles.historyRowTop}>
                      <View style={[styles.historyIconBadge, { backgroundColor: withOpacity(fillColor, 0.12) }]}>
                        <Text style={styles.historyIconText}>{statusIcon}</Text>
                      </View>
                      <View style={styles.historyCopy}>
                        <Text style={styles.historyName}>{item.protocol ?? 'Ayuno'}</Text>
                        <Text style={styles.historyMeta}>
                          {displayDateLabel} · {hours.toFixed(1)}h
                        </Text>
                      </View>
                      <Text style={[styles.historyBadge, { color: fillColor }]}>
                        {isCompleted ? '✓' : `${Math.round(pct)}%`}
                      </Text>
                      {item.id !== activeFast?.id ? (
                        <Pressable
                          onPress={() => setDeleteId(item.id!)}
                          hitSlop={8}
                          style={styles.historyDelete}
                          accessibilityRole="button"
                          accessibilityLabel={`Eliminar ayuno ${item.protocol ?? ''}`}
                        >
                          <Text style={styles.deleteText}>Eliminar</Text>
                        </Pressable>
                      ) : null}
                    </View>
                    <View style={styles.historyProgressTrack}>
                      <View
                        style={[
                          styles.historyProgressFill,
                          { width: `${pct}%`, backgroundColor: fillColor },
                        ]}
                      />
                    </View>
                  </View>
                );
              })}
            </View>
          )}
        </Card>

      {fiveTwoWeekSummary && (
        <Card style={styles.weekSummaryCard} shadow={false}>
          <Text style={styles.sectionTitle}>Esta semana · 5:2</Text>
          <Text style={styles.weekSummaryMeta}>{fiveTwoWeekSummary.completedDays}/{fiveTwoWeekSummary.targetDays} días completados</Text>
          <View style={styles.weekDays}>
            {fiveTwoWeekSummary.days.map((day) => (
              <View key={day.date} style={styles.weekDayItem}>
                <Text style={styles.weekDayLabel}>{new Date(day.date).toLocaleDateString('es-UY', { weekday: 'narrow' })}</Text>
                <View style={[
                  styles.weekDayDot,
                  {
                    backgroundColor:
                      day.status === 'completed'   ? Colors.fasting :
                      day.status === 'missed'      ? Colors.error :
                      day.status === 'active'      ? Colors.warning :
                      day.status === 'planned'     ? withOpacity(Colors.fasting, 0.3) :
                      Colors.bgElevated,
                  }
                ]} />
                {day.hours !== null && (
                  <Text style={styles.weekDayHours}>{day.hours.toFixed(0)}h</Text>
                )}
              </View>
            ))}
          </View>
        </Card>
      )}

      {/* ─── Modal detalle de zona ──────────────────────────
          FIX #2: Removed the extra <View style={modalOverlay}> + <View style={modalSheet}>
          wrappers. Modal component handles its own container. Now uses title/ctaLabel/onCta
          props consistently with the delete modal below. */}
      <Modal
        visible={Boolean(selectedZone)}
        onClose={() => setSelectedZoneId(null)}
        title={selectedZone ? `${selectedZone.emoji} ${selectedZone.label}` : ''}
        ctaLabel="Cerrar"
        onCta={() => setSelectedZoneId(null)}
      >
        <Text style={styles.zoneModalDesc}>{selectedZone?.description}</Text>
        <Text style={styles.zoneModalHint}>
          Esta zona comienza a las {METABOLIC_ZONES.find(z => z.id === selectedZoneId)?.start}h de ayuno.
        </Text>
      </Modal>

      {/* ─── Modal eliminar ayuno ─────────────────────────── */}
      <Modal
        visible={Boolean(deleteId)}
        onClose={() => setDeleteId(null)}
        title="Eliminar ayuno"
        ctaLabel="Eliminar"
        onCta={() => {
          if (deleteId) {
            deleteFast(deleteId);
            setDeleteId(null);
          }
        }}
        // FIX #3: Pass loading state so the confirm button disables while deleting
        ctaLoading={isDeleting}
      >
        <Text style={styles.modalText}>
          ¿Eliminar este ayuno? Esta acción no se puede deshacer.
        </Text>
      </Modal>

      {/* ─── Modal terminar anticipadamente ─────────────────
          FIX #2: Same fix as zone modal — removed double wrapper Views. */}
      <Modal
        visible={showEarlyFinishSheet}
        onClose={() => setShowEarlyFinishSheet(false)}
        title="¿Terminar antes?"
      >
        <View style={styles.earlyFinishInfo}>
          <Text style={styles.earlyFinishProgress}>{Math.round(progressClamped)}%</Text>
          <Text style={styles.earlyFinishLabel}>completado</Text>
        </View>
        <Text style={styles.contextBody}>
          Vas {elapsedLabel} del objetivo. Se va a registrar como parcial.
        </Text>
        <View style={styles.modalActions}>
          <Button
            label="Terminar parcial"
            onPress={() => {
              abandonFast();
              setShowEarlyFinishSheet(false);
            }}
            loading={isCompleting}
            fullWidth
            color={Colors.warning}
          />
          <Button
            label="Seguir ayunando"
            onPress={() => setShowEarlyFinishSheet(false)}
            variant="ghost"
            fullWidth
          />
        </View>
      </Modal>
    </ModuleScaffold>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: Spacing[5],
    paddingBottom: Spacing[10],
    gap: Spacing[4],
  },

  // ─── Card inicio ───────────────────────────────
  startCard: { gap: Spacing[4] },
  sectionTitle: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.lg,
    color: Colors.textPrimary,
  },

  protocolRow: {
    flexDirection: 'row',
    gap: Spacing[2],
  },
  protocolChip: {
    flex: 1,
    borderRadius: Radius.xl,
    backgroundColor: Colors.bgElevated,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[3],
    gap: 4,
    alignItems: 'center',
  },
  protocolChipActive: {
    borderColor: Colors.fasting,
    backgroundColor: withOpacity(Colors.fasting, 0.08),
  },
  protocolChipDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.fasting,
    marginBottom: 2,
  },
  protocolLabel: {
    fontFamily: FontFamily.bold,
    // FIX #5: was FontSize.md which likely doesn't exist. Changed to FontSize.base.
    fontSize: FontSize.base,
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  protocolLabelActive: { color: Colors.fasting },
  protocolHint: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  protocolHintActive: { color: Colors.textPrimary },

  // ─── Ajuste de hora ────────────────────────────
  timeAdjustToggle: {
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    borderStyle: 'dashed',
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[3],
    gap: 4,
  },
  timeAdjustToggleOpen: {
    borderColor: Colors.fasting,
    borderStyle: 'solid',
    backgroundColor: withOpacity(Colors.fasting, 0.04),
  },
  timeAdjustToggleLabel: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.sm,
    color: Colors.fasting,
  },
  timeAdjustToggleSub: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
  },
  timeAdjustCard: {
    backgroundColor: withOpacity(Colors.fasting, 0.06),
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: withOpacity(Colors.fasting, 0.2),
    padding: Spacing[4],
    gap: Spacing[3],
  },
  timeAdjustTitle: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.sm,
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  timeAdjustControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing[3],
  },
  offsetBtn: {
    width: 48,
    height: 48,
    borderRadius: Radius.full,
    backgroundColor: Colors.bgElevated,
    borderWidth: 1,
    borderColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  offsetBtnDisabled: { opacity: 0.3 },
  offsetBtnText: {
    fontFamily: FontFamily.bold,
    fontSize: 24,
    color: Colors.textPrimary,
    lineHeight: 28,
  },
  offsetDisplay: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  offsetTime: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.xl,
    color: Colors.fasting,
  },
  offsetRelative: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  offsetHint: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    textAlign: 'center',
  },

  // ─── Contexto / sugerencia ─────────────────────
  contextCard: {
    gap: Spacing[2],
    backgroundColor: withOpacity(Colors.fasting, 0.08),
    borderColor: withOpacity(Colors.fasting, 0.2),
  },
  contextRow: {
    flexDirection: 'row',
    gap: Spacing[3],
    alignItems: 'flex-start',
  },
  contextEmoji: { fontSize: 20, marginTop: 2, color: Colors.textPrimary },
  contextTitle: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.sm,
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  contextBody: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  historyDelete: {
    marginLeft: Spacing[3],
    paddingHorizontal: Spacing[2],
    paddingVertical: 6,
  },
  deleteText: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.xs,
    color: Colors.error,
  },
  modalText: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  lastFastText: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  fiveTwoCard: {
    gap: Spacing[3],
    padding: Spacing[4],
    borderColor: withOpacity(Colors.fasting, 0.12),
  },
  fiveTwoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  fiveTwoTitle: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.sm,
    color: Colors.textPrimary,
  },
  fiveTwoStatus: {},
  fiveTwoStatusText: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
  },
  fiveTwoDesc: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
  },
  weekSummaryCard: {
    gap: Spacing[3],
    padding: Spacing[4],
  },
  weekSummaryMeta: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
  },
  weekDays: {
    flexDirection: 'row',
    gap: Spacing[2],
    marginTop: Spacing[2],
  },
  weekDayItem: {
    alignItems: 'center',
  },
  weekDayLabel: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
  },
  weekDayDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    marginVertical: 6,
  },
  weekDayHours: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
  },

  // ─── Estado activo ─────────────────────────────
  activeCard: {
    gap: Spacing[4],
    alignItems: 'center',
    backgroundColor: withOpacity(Colors.fasting, 0.06),
    borderColor: withOpacity(Colors.fasting, 0.18),
  },
  activeCardComplete: {
    backgroundColor: withOpacity(Colors.success, 0.06),
    borderColor: withOpacity(Colors.success, 0.22),
  },
  activeBadgeRow: {
    alignSelf: 'stretch',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  activeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: withOpacity(Colors.fasting, 0.12),
    borderRadius: Radius.full,
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[1],
  },
  activeBadgeComplete: {
    backgroundColor: withOpacity(Colors.success, 0.12),
  },
  activeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.fasting,
  },
  activeDotComplete: {
    backgroundColor: Colors.success,
  },
  activeLabel: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.xs,
    color: Colors.fasting,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  activeLabelComplete: { color: Colors.success },
  activeMeta: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },

  // ─── Timer circular ────────────────────────────
  timerContainer: {
    alignItems: 'center',
    gap: Spacing[4],
    width: '100%',
  },
  timerRingOuter: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  timerRingInner: {
    position: 'relative',
    width: 196,
    height: 196,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timerCenter: {
    position: 'absolute',
    alignItems: 'center',
    gap: 2,
  },
  timerZoneEmoji: {
    fontSize: 20,
    marginBottom: 4,
  },
  timerText: {
    fontFamily: FontFamily.display,
    fontSize: FontSize['3xl'],
    lineHeight: 48,
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  timerSubtext: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  timerMeta: {
    alignItems: 'center',
    gap: Spacing[1],
  },
  phaseLine: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.sm,
  },
  endPrediction: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.sm,
    color: Colors.textPrimary,
  },
  elapsedHint: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    color: Colors.textMuted,
  },

  // ─── Timeline de zonas ─────────────────────────
  timelineWrapper: {
    alignSelf: 'stretch',
    gap: Spacing[2],
  },
  timelineTitle: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  zoneChipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing[2],
  },
  zoneChip: {
    borderRadius: Radius.full,
    backgroundColor: Colors.bgElevated,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[1.5],
  },
  zoneChipActive: {
    borderColor: withOpacity(Colors.fasting, 0.4),
    backgroundColor: withOpacity(Colors.fasting, 0.1),
  },
  zoneChipPassed: {
    opacity: 0.6,
  },
  zoneChipText: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.xs,
    color: Colors.textMuted,
  },
  phaseCard: {
    alignSelf: 'stretch',
    gap: Spacing[2],
    backgroundColor: withOpacity(Colors.fasting, 0.08),
    borderColor: withOpacity(Colors.fasting, 0.18),
  },

  // ─── Celebración ──────────────────────────────
  completeHero: {
    alignItems: 'center',
    gap: Spacing[2],
    paddingVertical: Spacing[4],
  },
  completeEmoji: { fontSize: 48 },
  completeTitle: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.xl,
    color: Colors.success,
  },
  completeSub: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },

  // ─── Stats ─────────────────────────────────────
  statsGrid: { flexDirection: 'row', gap: Spacing[3] },
  statCard: {
    flex: 1,
    gap: Spacing[1],
    alignItems: 'center',
    paddingVertical: Spacing[3],
  },
  statIcon: { fontSize: 20 },
  statValue: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.lg,
    color: Colors.textPrimary,
  },
  statLabel: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    textAlign: 'center',
  },

  // ─── Historial ─────────────────────────────────
  historyCard: { gap: Spacing[3] },
  historyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  seeAllLink: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.sm,
    color: Colors.fasting,
  },
  historyList: { gap: Spacing[3] },
  historyRow: { gap: Spacing[1.5] },
  historyRowTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[3],
  },
  historyIconBadge: {
    width: 36,
    height: 36,
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  historyIconText: {
    fontSize: 14,
    color: Colors.textPrimary,
  },
  historyCopy: { flex: 1, gap: 2 },
  historyName: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.sm,
    color: Colors.textPrimary,
  },
  historyMeta: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
  },
  historyBadge: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.sm,
  },
  historyProgressTrack: {
    width: '100%',
    height: 4,
    borderRadius: Radius.full,
    backgroundColor: Colors.bgElevated,
    overflow: 'hidden',
  },
  historyProgressFill: {
    height: '100%',
    borderRadius: Radius.full,
  },
  emptyHistory: {
    paddingVertical: Spacing[8],
    alignItems: 'center',
    gap: Spacing[2],
  },
  emptyHistoryEmoji: { fontSize: 40 },
  emptyHistoryText: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.sm,
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  emptyHistoryHint: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    textAlign: 'center',
  },

  // ─── Modal contenido ───────────────────────────
  modalActions: { gap: Spacing[2] },
  zoneModalDesc: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    lineHeight: 22,
  },
  zoneModalHint: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    backgroundColor: Colors.bgElevated,
    borderRadius: Radius.lg,
    padding: Spacing[3],
  },
  earlyFinishInfo: {
    alignItems: 'center',
    gap: 2,
    backgroundColor: withOpacity(Colors.warning, 0.08),
    borderRadius: Radius.xl,
    paddingVertical: Spacing[3],
  },
  earlyFinishProgress: {
    fontFamily: FontFamily.bold,
    fontSize: 36,
    color: Colors.warning,
  },
  earlyFinishLabel: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
});