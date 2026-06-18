// FIX #6: Removed unused `ScrollView` import
import { Pressable, StyleSheet, Text, View, Animated, useWindowDimensions } from 'react-native';
import { useMemo, useState, useRef, useEffect } from 'react';
import { router } from 'expo-router';
import ModuleScaffold from '@/components/modules/ModuleScaffold';
import FastingModuleTabs from '@/components/fasting/FastingModuleTabs';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import TimePicker from '@/components/ui/TimePicker';
import DatePickerField from '@/components/ui/DatePickerField';
import { Colors, withOpacity } from '@/constants/colors';
import { Routes } from '@/constants/routes';
import { useUIStore } from '@/stores/uiStore';
import { FontFamily, FontSize, LineHeight, Radius, Spacing } from '@/constants/theme';
import { FastingMetabolicZones, FastingModule } from '@/constants/strings';
import {
  PROTOCOLS,
  formatFastingTime,
  formatFastingTimeShort,
  useFasting,
} from '@/hooks/useFasting';
import { useAuthStore } from '@/stores/authStore';
import CircularProgress from '@/components/fasting/CircularProgress';
import MetabolicTimeline from '@/components/fasting/MetabolicTimeline';

const DEFAULT_MAIN_PROTOCOLS = ['16:8', '14:10', '18:6'] as const;
const QUICK_START_PRESETS = [
  { label: 'Ahora', offset: 0 },
  { label: 'Hace 1h', offset: -60 },
  { label: 'Hace 2h', offset: -120 },
  { label: 'Hace 3h', offset: -180 },
] as const;
const PAST_FAST_PROTOCOLS = ['14:10', '16:8', '18:6', '24h'] as const;
const TIMER_SIZE = 196;
const RECENT_HISTORY_LIMIT = 7;

function formatSessionDateLabel(item: { start_time?: string | null; scheduled_date?: string | null }) {
  try {
    const date = item.start_time
      ? new Date(item.start_time)
      : item.scheduled_date
        ? new Date(`${item.scheduled_date}T12:00:00`)
        : null;
    return date ? date.toLocaleDateString('es-UY', { day: 'numeric', month: 'short' }) : '';
  } catch {
    return '';
  }
}

function formatHistoryMeta(item: { status?: string | null; total_hours?: number | null }) {
  if (item.status === 'missed') return 'No iniciado';
  if (item.status === 'planned') return 'Programado';
  return `${Number(item.total_hours ?? 0).toFixed(1)}h`;
}

function parseTimeValue(value: string) {
  const parts = value.split(':');
  if (parts.length !== 2) return null;
  const hour = Number(parts[0]);
  const minute = Number(parts[1]);
  if (!Number.isFinite(hour) || !Number.isFinite(minute)) return null;
  if (hour < 0 || hour > 23 || minute < 0 || minute > 59) return null;
  return { hour, minute };
}

function buildDateTime(baseDate: Date, timeValue: string) {
  const parsed = parseTimeValue(timeValue);
  if (!parsed) return null;
  const next = new Date(baseDate);
  next.setHours(parsed.hour, parsed.minute, 0, 0);
  return next;
}

const METABOLIC_ZONE_METADATA = [
  { id: 'fed' as const,       emoji: '🍽️', start: 0 },
  { id: 'early' as const,     emoji: '⚡',  start: 4 },
  { id: 'fat' as const,       emoji: '🔥',  start: 12 },
  { id: 'ketosis' as const,   emoji: '✨',  start: 16 },
  { id: 'autophagy' as const, emoji: '🌿',  start: 18 },
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
  for (let i = METABOLIC_ZONE_METADATA.length - 1; i >= 0; i -= 1) {
    if (hours >= METABOLIC_ZONE_METADATA[i].start) return METABOLIC_ZONE_METADATA[i];
  }
  return METABOLIC_ZONE_METADATA[0];
}

function formatEndPrediction(remainingSeconds: number) {
  const end = new Date(Date.now() + remainingSeconds * 1000);
  const today = new Date();
  const sameDay = end.toDateString() === today.toDateString();
  const time = end.toLocaleTimeString('es-UY', { hour: '2-digit', minute: '2-digit' });
  if (sameDay) return FastingModule.timer.endPredictionSameDay(time);
  return FastingModule.timer.endPredictionDiffDay(time, end.toLocaleDateString('es-UY', { day: 'numeric', month: 'short' }));
}

function formatCompactCountdown(seconds: number | null) {
  if (seconds === null) return '--';
  const safeSeconds = Math.max(0, Math.floor(seconds));
  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);
  if (hours <= 0) return `${minutes}m`;
  return `${hours}h ${minutes}m`;
}

function formatClockAt(baseIso: string | null | undefined, offsetHours: number) {
  if (!baseIso) return null;
  const start = new Date(baseIso);
  if (Number.isNaN(start.getTime())) return null;
  return new Date(start.getTime() + offsetHours * 60 * 60 * 1000);
}

function formatOffsetLabel(offsetMinutes: number, startDate: Date): string {
  const time = startDate.toLocaleTimeString('es-UY', { hour: '2-digit', minute: '2-digit' });
  if (offsetMinutes === 0) return FastingModule.offsetLabel.now(time);
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
    ? FastingModule.offsetLabel.past(duration, time, dayLabel || undefined)
    : FastingModule.offsetLabel.future(duration, time);
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
  const { height: screenHeight, width: screenWidth } = useWindowDimensions();
  const isPortrait = screenHeight > screenWidth;
  const timerSize = isPortrait ? 196 : 140;  // Responsive: portrait 196px, landscape 140px
  
  const {
    activeFast, isActive, isComplete, protocol, targetHours, elapsedSeconds, elapsedHours,
    progressPct, history, completedFasts, avgHours, longestFast,
    dailyAdaptiveSuggestion, cycleAwareNotice, protocolSuggestion, nextPhase, nextPhaseIn,
    activeFastNotificationsMuted, activeFastNote, saveActiveFastNote, isSavingActiveFastNote, setActiveFastNotificationsMuted,
    isStarting, isCompleting, isAbandoning,
    isLoggingPastFast, isAdjustingStartTime,
    startFast, completeFast, logPastFast, abandonFast, deleteFast, adjustActiveFastStartTime,
    // FIX #3: isDeleting is now actually used for the delete confirmation button
    isDeleting,
    // 5:2 helpers
    plannedToday,
    isFiveTwoDay,
    fiveTwoWeekSummary,
    fiveTwoStartTime,
  } = useFasting();

  const showToast = useUIStore((s) => s.showToast);
  const profile = useAuthStore((s) => s.profile);

  const [selectedProtocol, setSelectedProtocol] = useState<string>('16:8');
  const [selectedZoneId, setSelectedZoneId] = useState<typeof METABOLIC_ZONE_METADATA[number]['id'] | null>(null);
  const [showEarlyFinishSheet, setShowEarlyFinishSheet] = useState(false);
  const [showTimeAdjust, setShowTimeAdjust] = useState(false);
  const [startOffsetMinutes, setStartOffsetMinutes] = useState(0);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [showPastFastModal, setShowPastFastModal] = useState(false);
  const [pastProtocol, setPastProtocol] = useState<string>('16:8');
  const [pastDate, setPastDate] = useState(() => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(12, 0, 0, 0);
    return yesterday;
  });
  const [pastStartValue, setPastStartValue] = useState('20:00');
  const [pastEndValue, setPastEndValue] = useState('12:00');
  const [showActiveStartAdjustModal, setShowActiveStartAdjustModal] = useState(false);
  const [activeStartDate, setActiveStartDate] = useState(() => new Date());
  const [activeStartValue, setActiveStartValue] = useState('20:00');
  const [timeAdjustTick, setTimeAdjustTick] = useState(0);
  const [fastNoteDraft, setFastNoteDraft] = useState('');

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

  const quickProtocols = useMemo(() => {
    if (protocol && !DEFAULT_MAIN_PROTOCOLS.includes(protocol as (typeof DEFAULT_MAIN_PROTOCOLS)[number])) {
      return [DEFAULT_MAIN_PROTOCOLS[0], DEFAULT_MAIN_PROTOCOLS[1], protocol];
    }
    return [...DEFAULT_MAIN_PROTOCOLS];
  }, [protocol]);
  const recentHistory = useMemo(
    () =>
      history
        .filter((item) => {
          if (item.status === 'planned' || item.status === 'missed') return true;
          return Number(item.total_hours ?? 0) > 0.1;
        })
        .slice(0, RECENT_HISTORY_LIMIT),
    [history],
  );
  const elapsedLabel = useMemo(() => formatFastingTimeShort(elapsedSeconds), [elapsedSeconds]);
  const remainingSeconds = Math.max(0, targetHours * 3600 - elapsedSeconds);
  const activeZone = (() => {
    const meta = getCurrentZone(elapsedHours);
    const strings = FastingMetabolicZones[meta.id];
    return { ...meta, ...strings };
  })();
  const selectedZone = METABOLIC_ZONE_METADATA.find((z) => z.id === selectedZoneId)
    ? (() => {
        const meta = METABOLIC_ZONE_METADATA.find((z) => z.id === selectedZoneId)!;
        const strings = FastingMetabolicZones[meta.id];
        return { ...meta, ...strings };
      })()
    : null;
  const progressClamped = Math.max(0, Math.min(100, progressPct));
  const selectedProtocolMeta = PROTOCOLS[selectedProtocol];
  const nextPhaseDate = useMemo(
    () => (nextPhase ? formatClockAt(activeFast?.start_time, nextPhase.hours) : null),
    [activeFast?.start_time, nextPhase],
  );
  const nextPhaseTimeLabel = useMemo(() => {
    if (!nextPhaseDate) return null;
    return nextPhaseDate.toLocaleTimeString('es-UY', { hour: '2-digit', minute: '2-digit' });
  }, [nextPhaseDate]);
  const canSaveFastNote = fastNoteDraft.trim() !== (activeFastNote?.trim() ?? '');
  const activeStartLabel = useMemo(() => {
    if (!activeFast?.start_time) return null;
    return new Date(activeFast.start_time).toLocaleTimeString('es-UY', {
      hour: '2-digit',
      minute: '2-digit',
    });
  }, [activeFast?.start_time]);
  const targetLabel = `${targetHours}h`;

  const customStartDate = useMemo(() => {
    const d = new Date();
    d.setMinutes(d.getMinutes() + startOffsetMinutes);
    return d;
  }, [startOffsetMinutes, timeAdjustTick]);

  const startTimeLabel = useMemo(
    () => formatOffsetLabel(startOffsetMinutes, customStartDate),
    [startOffsetMinutes, customStartDate],
  );
  const pastStartDate = useMemo(() => buildDateTime(pastDate, pastStartValue), [pastDate, pastStartValue]);
  const pastEndDate = useMemo(() => {
    const base = buildDateTime(pastDate, pastEndValue);
    if (!base || !pastStartDate) return null;
    if (base.getTime() <= pastStartDate.getTime()) {
      const nextDay = new Date(base);
      nextDay.setDate(nextDay.getDate() + 1);
      return nextDay;
    }
    return base;
  }, [pastDate, pastEndValue, pastStartDate]);
  const pastDurationHours = useMemo(() => {
    if (!pastStartDate || !pastEndDate) return null;
    return Math.round(((pastEndDate.getTime() - pastStartDate.getTime()) / 3600000) * 10) / 10;
  }, [pastEndDate, pastStartDate]);
  const adjustedActiveStartDate = useMemo(
    () => buildDateTime(activeStartDate, activeStartValue),
    [activeStartDate, activeStartValue],
  );
  const adjustedElapsedSeconds = useMemo(() => {
    if (!adjustedActiveStartDate) return null;
    return Math.max(0, Math.floor((Date.now() - adjustedActiveStartDate.getTime()) / 1000));
  }, [adjustedActiveStartDate]);
  const adjustedElapsedLabel = useMemo(
    () => (adjustedElapsedSeconds !== null ? formatFastingTimeShort(adjustedElapsedSeconds) : null),
    [adjustedElapsedSeconds],
  );
  const selectedQuickOffset = showTimeAdjust
    ? null
    : QUICK_START_PRESETS.find((item) => item.offset === startOffsetMinutes)?.offset ?? null;

  const adjustOffset = (delta: number) => {
    setStartOffsetMinutes((prev) => Math.max(MIN_OFFSET, Math.min(MAX_OFFSET, prev + delta)));
  };

  const openPastFastModal = () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(12, 0, 0, 0);
    setPastDate(yesterday);
    setPastProtocol(selectedProtocol);
    setPastStartValue('20:00');
    setPastEndValue('12:00');
    setShowPastFastModal(true);
  };

  const openActiveStartAdjustModal = () => {
    const base = activeFast?.start_time ? new Date(activeFast.start_time) : new Date();
    if (!Number.isNaN(base.getTime())) {
      setActiveStartDate(base);
      setActiveStartValue(
        base.toLocaleTimeString('en-GB', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        }),
      );
    }
    setShowEarlyFinishSheet(false);
    setShowActiveStartAdjustModal(true);
  };

  useEffect(() => {
    if (protocol && !quickProtocols.includes(selectedProtocol)) {
      setSelectedProtocol(protocol);
    }
  }, [protocol, quickProtocols, selectedProtocol]);

  useEffect(() => {
    setFastNoteDraft(activeFastNote ?? '');
  }, [activeFast?.id, activeFastNote]);

  useEffect(() => {
    if (!showTimeAdjust) return undefined;
    const interval = setInterval(() => {
      setTimeAdjustTick((value) => value + 1);
    }, 60_000);
    return () => clearInterval(interval);
  }, [showTimeAdjust]);

  const handleStartFast = () => {
    if (isActive) {
      showToast('Ya hay un ayuno en curso.', 'info');
      return;
    }

    // FIX #1: Unified startFast API — always pass protocol as first arg,
    // optional options object as the first argument when using an object form.
    const payload =
      startOffsetMinutes !== 0
        ? { protocol: selectedProtocol, startTime: customStartDate }
        : { protocol: selectedProtocol };

    startFast(payload, {
      onSuccess: () => {
        setStartOffsetMinutes(0);
        setShowTimeAdjust(false);
      },
    });
  };

  const handleCompleteAndOpenMeal = () => {
    const shouldOpenMeal = isComplete;
    completeFast({
      onSuccess: () => {
        if (shouldOpenMeal) {
          router.push({
            pathname: Routes.nutrition.log,
            params: { mealType: new Date().getHours() < 15 ? 'lunch' : 'dinner' },
          } as never);
        }
      },
    });
  };

  const handleSavePastFast = () => {
    if (!pastStartDate || !pastEndDate || !pastDurationHours || pastDurationHours <= 0) {
      showToast('Revisa fecha, hora de inicio y hora de cierre.', 'warning');
      return;
    }

    logPastFast(
      {
        protocol: pastProtocol,
        startTime: pastStartDate,
        endTime: pastEndDate,
      },
      {
        onSuccess: () => {
          setShowPastFastModal(false);
        },
      },
    );
  };

  const handleSaveFastNote = () => {
    saveActiveFastNote(fastNoteDraft, {
      onSuccess: () => {
        setFastNoteDraft((current) => current.trim());
      },
    });
  };

  const handleSaveActiveStart = () => {
    if (!adjustedActiveStartDate) {
      showToast('Revisa la nueva fecha y hora de inicio.', 'warning');
      return;
    }

    if (adjustedActiveStartDate.getTime() >= Date.now()) {
      showToast('La hora de inicio debe quedar en el pasado.', 'warning');
      return;
    }

    adjustActiveFastStartTime(
      { startTime: adjustedActiveStartDate },
      {
        onSuccess: () => {
          setShowActiveStartAdjustModal(false);
          setShowEarlyFinishSheet(false);
        },
      },
    );
  };

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
            <View style={styles.startHero}>
              <Text style={styles.startEyebrow}>Sin ayuno activo</Text>
              <Text style={styles.startTitle}>Elegí una ventana y empezá cuando te quede bien</Text>
              <Text style={styles.startPrompt}>
                Primero elegí protocolo. Después marcá cuándo fue tu última comida y VYRA hace el resto.
              </Text>
            </View>

            <View style={styles.selectedProtocolCard}>
              <View style={styles.selectedProtocolTop}>
                <View>
                  <Text style={styles.selectedProtocolEyebrow}>Protocolo actual</Text>
                  <Text style={styles.selectedProtocolValue}>{selectedProtocol}</Text>
                </View>
                <View style={styles.selectedProtocolBadge}>
                  <Text style={styles.selectedProtocolBadgeText}>{selectedProtocolMeta.targetHours}h</Text>
                </View>
              </View>
              <Text style={styles.selectedProtocolBody}>{selectedProtocolMeta.description}</Text>
            </View>

            {/* Chips de protocolo */}
            <View style={styles.protocolRow}>
              {quickProtocols.map((item) => {
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

            <Text style={styles.inlineSectionLabel}>Última comida</Text>
            <View style={styles.quickPresetRow}>
              {QUICK_START_PRESETS.map((preset) => {
                const active = selectedQuickOffset === preset.offset;
                return (
                  <Pressable
                    key={preset.label}
                    style={[styles.quickPresetChip, active && styles.quickPresetChipActive]}
                    onPress={() => {
                      setStartOffsetMinutes(preset.offset);
                      setShowTimeAdjust(false);
                    }}
                    accessibilityRole="button"
                    accessibilityLabel={preset.label}
                  >
                    <Text style={[styles.quickPresetText, active && styles.quickPresetTextActive]}>
                      {preset.label}
                    </Text>
                  </Pressable>
                );
              })}
              <Pressable
                style={[styles.quickPresetChip, showTimeAdjust && styles.quickPresetChipActive]}
                onPress={() => setShowTimeAdjust((value) => !value)}
                accessibilityRole="button"
                accessibilityLabel="Elegir hora exacta"
              >
                <Text style={[styles.quickPresetText, showTimeAdjust && styles.quickPresetTextActive]}>
                  Elegir hora
                </Text>
              </Pressable>
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
                {showTimeAdjust ? FastingModule.controls.cancelAdjust : FastingModule.controls.adjustTime}
              </Text>
              <Text style={styles.timeAdjustToggleSub}>
                {showTimeAdjust
                  ? FastingModule.controls.adjustHint
                  : FastingModule.controls.adjustSubHint}
              </Text>
            </Pressable>

            {/* Panel de ajuste */}
            {showTimeAdjust && (
              <View style={styles.timeAdjustCard}>
                <Text style={styles.timeAdjustTitle}>{FastingModule.controls.adjustTitle}</Text>
                <View style={styles.timeAdjustControls}>
                  <Pressable
                    onPress={() => adjustOffset(-OFFSET_STEP)}
                    disabled={startOffsetMinutes <= MIN_OFFSET}
                    style={[styles.offsetBtn, startOffsetMinutes <= MIN_OFFSET && styles.offsetBtnDisabled]}
                    hitSlop={12}
                    accessibilityLabel={FastingModule.controls.reduceOffset}
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
                    accessibilityLabel={FastingModule.controls.increaseOffset}
                  >
                    <Text style={styles.offsetBtnText}>+</Text>
                  </Pressable>
                </View>
                <Text style={styles.offsetHint}>{FastingModule.controls.offsetHint}</Text>
              </View>
            )}

            {dailyAdaptiveSuggestion ? (
              <Card style={styles.contextCard} shadow={false}>
                <View style={styles.contextRow}>
                  <Text style={styles.contextEmoji}>💡</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.contextTitle}>{FastingModule.suggestion.title}</Text>
                    <Text style={styles.contextBody}>{dailyAdaptiveSuggestion.message}</Text>
                  </View>
                </View>
              </Card>
            ) : null}

            {protocolSuggestion?.suggestedProtocol && protocolSuggestion.reason ? (
              <Card style={styles.contextCard} shadow={false}>
                <View style={styles.contextRow}>
                  <Text style={styles.contextEmoji}>✨</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.contextTitle}>Protocolo recomendado para esta semana</Text>
                    <Text style={styles.contextBody}>
                      {protocolSuggestion.suggestedProtocol} - {protocolSuggestion.reason}
                    </Text>
                  </View>
                </View>
                {protocolSuggestion.suggestedProtocol !== selectedProtocol ? (
                  <Pressable
                    onPress={() => setSelectedProtocol(protocolSuggestion.suggestedProtocol ?? selectedProtocol)}
                    style={styles.recommendationChip}
                    accessibilityRole="button"
                    accessibilityLabel={`Usar protocolo ${protocolSuggestion.suggestedProtocol}`}
                  >
                    <Text style={styles.recommendationChipText}>
                      Usar {protocolSuggestion.suggestedProtocol}
                    </Text>
                  </Pressable>
                ) : null}
              </Card>
            ) : null}

            <View style={styles.startActionGroup}>
            <Button
              label={FastingModule.buttons.startFast(selectedProtocol, startOffsetMinutes !== 0 ? startTimeLabel.split('·')[0].trim() : undefined)}
              onPress={handleStartFast}
              loading={isStarting}
              fullWidth
              color={Colors.fasting}
              disabled={isActive}
            />

            <Button
              label="Registrar ayuno pasado"
              onPress={openPastFastModal}
              variant="secondary"
              color={Colors.fasting}
              fullWidth
            />

            </View>
            <View style={styles.startFootnoteCard}>
              <Text style={styles.startFootnoteTitle}>Tu referencia reciente</Text>
            <Text style={styles.lastFastText}>
              {completedFasts > 0
                ? FastingModule.stats.completedMeta(avgHours, longestFast)
                : FastingModule.stats.noFasts}
            </Text>
            </View>
          </Card>

        /* ─── Estado activo ──────────────────────────────── */
        ) : (
          <Card
            style={[styles.activeCard, isComplete && styles.activeCardComplete]}
            shadow={false}
          >
            <View style={styles.activeHeroTop}>
              <View style={styles.activeHeroCopy}>
                <Text style={styles.startEyebrow}>{isComplete ? 'Objetivo alcanzado' : 'Ayuno en curso'}</Text>
                <Text style={styles.activeHeroTitle}>{protocol} · {targetLabel}</Text>
              </View>
              <View style={[styles.activeBadge, isComplete && styles.activeBadgeComplete]}>
                <View style={[styles.activeDot, isComplete && styles.activeDotComplete]} />
                <Text style={[styles.activeLabel, isComplete && styles.activeLabelComplete]}>
                  {isComplete ? FastingModule.states.completeBadge : FastingModule.states.activeBadge}
                </Text>
              </View>
            </View>

            {isComplete ? (
              <View style={styles.completeHero}>
                <Text style={styles.completeEmoji}>{FastingModule.states.completeEmoji}</Text>
                <Text style={styles.completeTitle}>{FastingModule.states.completeTitle}</Text>
                <Text style={styles.completeSub}>
                  {FastingModule.states.completeMeta(protocol, elapsedLabel)}
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
                      size={timerSize}
                      strokeWidth={6}
                      color={ZONE_COLORS[activeZone.id]}
                    />
                    {/* Contenido central */}
                    <View style={styles.timerCenter}>
                      <Text style={styles.timerZoneEmoji}>{activeZone.emoji}</Text>
                      <Text style={styles.timerText} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.6}>
                        {formatFastingTime(remainingSeconds)}
                      </Text>
                      <Text style={styles.timerSubtext}>{FastingModule.timer.remaining}</Text>
                    </View>
                  </View>
                </Animated.View>

                {/* Meta y fase */}
                <View style={styles.timerMeta}>
                  <Text style={[styles.phaseLine, { color: ZONE_COLORS[activeZone.id] }]}>
                    {activeZone.emoji} {activeZone.label}
                  </Text>
                  <Text style={styles.endPrediction}>De {targetLabel} · {progressClamped}% completado</Text>
                  <Text style={styles.elapsedHint}>{formatEndPrediction(remainingSeconds)}</Text>
                  <Text style={styles.timerHint}>{activeZone.description}</Text>
                </View>
              </View>
            )}

            {!isComplete ? (
              <View style={styles.activeMetaRow}>
                <View style={styles.activeMetaPill}>
                  <Text style={styles.activeMetaPillLabel}>Inicio</Text>
                  <Text style={styles.activeMetaPillValue}>{activeStartLabel ?? '--'}</Text>
                </View>
                <View style={styles.activeMetaPill}>
                  <Text style={styles.activeMetaPillLabel}>Llevas</Text>
                  <Text style={styles.activeMetaPillValue}>{elapsedLabel}</Text>
                </View>
                <View style={styles.activeMetaPill}>
                  <Text style={styles.activeMetaPillLabel}>Fase</Text>
                  <Text style={styles.activeMetaPillValue}>{activeZone.label}</Text>
                </View>
              </View>
            ) : null}

            {!isComplete && nextPhase ? (
              <Card style={styles.phasePreviewCard} shadow={false}>
                <View style={styles.phasePreviewRow}>
                  <View style={styles.phasePreviewCopy}>
                    <Text style={styles.phasePreviewEyebrow}>Próxima fase</Text>
                    <Text style={styles.phasePreviewTitle}>{nextPhase.label}</Text>
                    <Text style={styles.phasePreviewBody}>
                      {nextPhaseTimeLabel
                        ? `Llega en ${formatCompactCountdown(nextPhaseIn)} y arranca cerca de las ${nextPhaseTimeLabel}.`
                        : `Llega en ${formatCompactCountdown(nextPhaseIn)}.`}
                    </Text>
                  </View>
                  <View style={styles.phasePreviewBadge}>
                    <Text style={styles.phasePreviewBadgeText}>{formatCompactCountdown(nextPhaseIn)}</Text>
                  </View>
                </View>
              </Card>
            ) : null}

            {/* Timeline metabólica */}
            {!isComplete && (
              <View style={styles.timelineWrapper}>
                <Text style={styles.timelineTitle}>{FastingModule.timer.zones}</Text>
                <MetabolicTimeline elapsedHours={elapsedHours} targetHours={targetHours} />
                <View style={styles.zoneChipRow}>
                  {METABOLIC_ZONE_METADATA.map((zone) => {
                    const zoneStrings = FastingMetabolicZones[zone.id];
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
                        accessibilityLabel={zoneStrings.label}
                        accessibilityHint={zoneStrings.description}
                      >
                        <Text style={[
                          styles.zoneChipText,
                          active && { color: ZONE_COLORS[zone.id], fontFamily: FontFamily.bold },
                          passed && !active && { color: Colors.textSecondary },
                        ]}>
                          {zoneStrings.label}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            )}

            {cycleAwareNotice && profile?.female_health_enabled ? (
              <Card style={styles.phaseCard} shadow={false}>
                <Text style={styles.contextTitle}>{FastingModule.contextCard.female}</Text>
                <Text style={styles.contextBody}>{cycleAwareNotice}</Text>
              </Card>
            ) : null}

            {!isComplete ? (
              <Card style={styles.sessionToolsCard} shadow={false}>
                <Text style={styles.contextTitle}>Herramientas de esta sesión</Text>
                <Text style={styles.contextBody}>
                  Silencia los avisos de este ayuno si ya no quieres empujes y deja una nota breve para recordar hambre, energía o síntomas.
                </Text>
                <Button
                  label={activeFastNotificationsMuted ? 'Reactivar avisos de este ayuno' : 'Silenciar avisos de este ayuno'}
                  onPress={() => {
                    void setActiveFastNotificationsMuted(!activeFastNotificationsMuted);
                  }}
                  variant="secondary"
                  color={Colors.fasting}
                  fullWidth
                />
                <Input
                  label="Nota rápida"
                  value={fastNoteDraft}
                  onChangeText={setFastNoteDraft}
                  placeholder="Hambre baja, energía estable, cabeza clara..."
                  multiline
                  numberOfLines={3}
                  inputStyle={styles.noteInput}
                  hint="La guardamos dentro de esta sesión para sumar contexto real."
                />
                <Button
                  label={activeFastNote ? 'Actualizar nota' : 'Guardar nota'}
                  onPress={handleSaveFastNote}
                  loading={isSavingActiveFastNote}
                  disabled={!canSaveFastNote}
                  color={Colors.fasting}
                  fullWidth
                />
              </Card>
            ) : null}

            <View style={styles.activeActionGroup}>
              <Button
                label={isComplete ? FastingModule.buttons.finishAndClose : FastingModule.buttons.completeFast}
                onPress={handleCompleteAndOpenMeal}
                loading={isCompleting}
                fullWidth
                color={isComplete ? Colors.success : Colors.fasting}
                variant={isComplete ? 'primary' : 'secondary'}
              />

              {!isComplete && (
                <Button
                  label={FastingModule.buttons.earlyFinish}
                  onPress={() => setShowEarlyFinishSheet(true)}
                  variant="ghost"
                  fullWidth
                />
              )}
            </View>
          </Card>
        )}

        {/* ─── Si hoy es 5:2 y no hay ayuno activo, mostrar tarjeta rápida ───────────────────── */}
        {!isActive && isFiveTwoDay && plannedToday ? (
          <Card style={styles.fiveTwoCard} shadow={false}>
            <View style={styles.fiveTwoHeader}>
              <Text style={styles.fiveTwoTitle}>{FastingModule.fiveTwo.header}</Text>
              <View style={styles.fiveTwoStatus}>
                {plannedToday.status === 'planned' && (
                  <Text style={styles.fiveTwoStatusText}>{FastingModule.fiveTwo.status}</Text>
                )}
              </View>
            </View>
            <Text style={styles.fiveTwoDesc}>
              {FastingModule.fiveTwo.desc(plannedToday.protocol ?? '5:2', (plannedToday.target_duration / 3600), fiveTwoStartTime ?? undefined)}
            </Text>
            <Button
              label={FastingModule.fiveTwo.button}
              onPress={() => startFast({ protocol: '5:2', sessionId: plannedToday.id })}
              loading={isStarting}
              color={Colors.fasting}
              fullWidth
              disabled={isActive}
            />
          </Card>
        ) : null}

        {/* ─── Grilla de estadísticas ───────────────────── */}
        <View style={styles.statsGrid}>
          <StatCard label={FastingModule.stats.completedLabel} value={String(completedFasts)} icon="🏁" color={Colors.fasting} />
          <StatCard label={FastingModule.stats.avgLabel} value={`${avgHours.toFixed(1)}h`} icon="📊" color={Colors.warning} />
          <StatCard label={FastingModule.stats.longestLabel} value={`${longestFast.toFixed(1)}h`} icon="🏆" color={Colors.success} />
        </View>

        {fiveTwoWeekSummary ? (
          <Card style={styles.weekSummaryCard} shadow={false}>
            <Text style={styles.sectionTitle}>{FastingModule.fiveTwo.week}</Text>
            <Text style={styles.weekSummaryMeta}>{FastingModule.fiveTwo.weekMeta(fiveTwoWeekSummary.completedDays, fiveTwoWeekSummary.targetDays)}</Text>
            <View style={styles.weekDays}>
              {fiveTwoWeekSummary.days.map((day) => (
                <View key={day.date} style={styles.weekDayItem}>
                  <Text style={styles.weekDayLabel}>{new Date(`${day.date}T12:00:00`).toLocaleDateString('es-UY', { weekday: 'narrow' })}</Text>
                  <View style={[
                    styles.weekDayDot,
                    {
                      backgroundColor:
                        day.status === 'completed' ? Colors.fasting :
                        day.status === 'missed' ? Colors.error :
                        day.status === 'active' ? Colors.warning :
                        day.status === 'planned' ? withOpacity(Colors.fasting, 0.3) :
                        Colors.bgElevated,
                    }
                  ]} />
                  {day.hours !== null ? (
                    <Text style={styles.weekDayHours}>{day.hours.toFixed(0)}h</Text>
                  ) : null}
                </View>
              ))}
            </View>
          </Card>
        ) : null}

        {/* ─── Historial ───────────────────────────────── */}
        <Card style={styles.historyCard} shadow={false}>
          <View style={styles.historyHeader}>
            <Text style={styles.sectionTitle}>{FastingModule.history.title}</Text>
            {/* 'Ver todo' hidden until a full history screen exists */}
          </View>

          {recentHistory.length === 0 ? (
            <View style={styles.emptyHistory}>
              <Text style={styles.emptyHistoryEmoji}>{FastingModule.history.emptyEmoji}</Text>
              <Text style={styles.emptyHistoryText}>{FastingModule.history.emptyTitle}</Text>
              <Text style={styles.emptyHistoryHint}>
                {FastingModule.history.emptyHint}
              </Text>
            </View>
          ) : (
            <View style={styles.historyList}>
              {recentHistory.map((item) => {
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
                const displayDateLabel = formatSessionDateLabel(item);

                return (
                  <View key={item.id} style={styles.historyRow}>
                    <View style={styles.historyRowTop}>
                      <View style={[styles.historyIconBadge, { backgroundColor: withOpacity(fillColor, 0.12) }]}>
                        <Text style={styles.historyIconText}>{statusIcon}</Text>
                      </View>
                      <View style={styles.historyCopy}>
                        <Text style={styles.historyName}>{item.protocol ?? 'Ayuno'}</Text>
                        <Text style={styles.historyMeta}>
                          {displayDateLabel} · {formatHistoryMeta(item)}
                        </Text>
                      </View>
                      <Text style={[styles.historyBadge, { color: fillColor }]}>
                        {item.status === 'missed'
                          ? FastingModule.history.missed
                          : item.status === 'planned'
                            ? FastingModule.history.pending
                            : isCompleted
                              ? FastingModule.history.completed
                              : `${Math.round(pct)}%`}
                      </Text>
                      {item.id !== activeFast?.id ? (
                        <Pressable
                          onPress={() => {
                            if (item.id) {
                              setDeleteId(item.id);
                            }
                          }}
                          hitSlop={8}
                          style={styles.historyDelete}
                          accessibilityRole="button"
                          accessibilityLabel={FastingModule.history.deleteA11y(item.protocol ?? '')}
                        >
                          <Text style={styles.deleteText}>{FastingModule.history.deleteBtn}</Text>
                        </Pressable>
                      ) : null}
                    </View>
                    {item.status === 'missed' || item.status === 'planned' ? null : (
                      <View style={styles.historyProgressTrack}>
                        <View
                          style={[
                            styles.historyProgressFill,
                            { width: `${pct}%`, backgroundColor: fillColor },
                          ]}
                        />
                      </View>
                    )}
                  </View>
                );
              })}
            </View>
          )}
        </Card>


      <Modal
        visible={showPastFastModal}
        onClose={() => setShowPastFastModal(false)}
        title="Registrar ayuno pasado"
        ctaLabel="Guardar ayuno"
        onCta={handleSavePastFast}
        ctaLoading={isLoggingPastFast}
        secondaryLabel="Cancelar"
        onSecondary={() => setShowPastFastModal(false)}
      >
        <View style={styles.pastFastBody}>
          <Text style={styles.pastFastHint}>
            Carga un ayuno que ya hiciste para no perder historia si te acordaste tarde de abrir la app.
          </Text>

          <View style={styles.pastProtocolRow}>
            {PAST_FAST_PROTOCOLS.map((item) => {
              const active = pastProtocol === item;
              return (
                <Pressable
                  key={item}
                  style={[styles.pastProtocolChip, active && styles.pastProtocolChipActive]}
                  onPress={() => setPastProtocol(item)}
                  accessibilityRole="button"
                  accessibilityState={{ selected: active }}
                  accessibilityLabel={`Protocolo ${item}`}
                >
                  <Text style={[styles.pastProtocolText, active && styles.pastProtocolTextActive]}>
                    {item}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <DatePickerField
            label="Fecha de inicio"
            value={pastDate}
            onChange={setPastDate}
            maximumDate={new Date()}
          />

          <View style={styles.pastTimeGrid}>
            <TimePicker
              label="Empezó a las"
              value={pastStartValue}
              onChange={setPastStartValue}
              placeholder="20:00"
            />
            <TimePicker
              label="Terminó a las"
              value={pastEndValue}
              onChange={setPastEndValue}
              placeholder="12:00"
            />
          </View>

          <View style={styles.pastSummaryCard}>
            <Text style={styles.pastSummaryTitle}>Resumen</Text>
            <Text style={styles.pastSummaryBody}>
              {pastDurationHours
                ? `${pastProtocol} · ${pastDurationHours.toFixed(1)}h`
                : 'Elegí horas válidas para calcular la duración.'}
            </Text>
            <Text style={styles.pastSummaryHint}>
              Si la hora de cierre es anterior a la de inicio, VYRA la interpreta como el día siguiente.
            </Text>
          </View>
        </View>
      </Modal>

      <Modal
        visible={showActiveStartAdjustModal}
        onClose={() => setShowActiveStartAdjustModal(false)}
        title="Corregir inicio del ayuno"
        ctaLabel="Guardar corrección"
        onCta={handleSaveActiveStart}
        ctaLoading={isAdjustingStartTime}
        secondaryLabel="Cancelar"
        onSecondary={() => setShowActiveStartAdjustModal(false)}
      >
        <View style={styles.pastFastBody}>
          <Text style={styles.pastFastHint}>
            Si arrancaste el timer tarde, ajusta la hora real de tu última comida para que el progreso quede bien medido.
          </Text>

          <DatePickerField
            label="Fecha real de inicio"
            value={activeStartDate}
            onChange={setActiveStartDate}
            maximumDate={new Date()}
          />

          <TimePicker
            label="Hora real de inicio"
            value={activeStartValue}
            onChange={setActiveStartValue}
            placeholder="20:00"
          />

          <View style={styles.pastSummaryCard}>
            <Text style={styles.pastSummaryTitle}>Cómo quedará tu timer</Text>
            <Text style={styles.pastSummaryBody}>
              {adjustedElapsedLabel
                ? `${adjustedElapsedLabel} acumuladas`
                : 'Elegí una fecha y hora válidas para recalcularlo.'}
            </Text>
            <Text style={styles.pastSummaryHint}>
              Esto corrige el inicio del ayuno actual sin borrarlo ni cerrar tu progreso.
            </Text>
          </View>
        </View>
      </Modal>

      {/* ─── Modal detalle de zona ──────────────────────────
          FIX #2: Removed the extra <View style={modalOverlay}> + <View style={modalSheet}>
          wrappers. Modal component handles its own container. Now uses title/ctaLabel/onCta
          props consistently with the delete modal below. */}
      <Modal
        visible={Boolean(selectedZone)}
        onClose={() => setSelectedZoneId(null)}
        title={selectedZone ? `${selectedZone.emoji} ${selectedZone.label}` : ''}
        ctaLabel={FastingModule.modals.zoneDetail.close}
        onCta={() => setSelectedZoneId(null)}
      >
        <Text style={styles.zoneModalDesc}>{selectedZone?.description}</Text>
        <Text style={styles.zoneModalHint}>
          {FastingModule.modals.zoneDetail.startHint(METABOLIC_ZONE_METADATA.find(z => z.id === selectedZoneId)?.start || 0)}
        </Text>
      </Modal>

      {/* ─── Modal eliminar ayuno ─────────────────────────── */}
      <Modal
        visible={Boolean(deleteId)}
        onClose={() => setDeleteId(null)}
        title={FastingModule.modals.deleteConfirm.title}
        ctaLabel={FastingModule.modals.deleteConfirm.confirm}
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
          {FastingModule.modals.deleteConfirm.body}
        </Text>
      </Modal>

      {/* ─── Modal terminar anticipadamente ─────────────────
          FIX #2: Same fix as zone modal — removed double wrapper Views. */}
      <Modal
        visible={showEarlyFinishSheet}
        onClose={() => setShowEarlyFinishSheet(false)}
        title={FastingModule.modals.earlyFinish.title}
      >
        <View style={styles.earlyFinishInfo}>
          <Text style={styles.earlyFinishProgress}>{FastingModule.modals.earlyFinish.percentComplete(progressClamped)}</Text>
          <Text style={styles.earlyFinishLabel}>{FastingModule.modals.earlyFinish.label}</Text>
        </View>
        <Text style={styles.contextBody}>
          {FastingModule.modals.earlyFinish.context(elapsedLabel)}
        </Text>
        <View style={styles.modalActions}>
          <Button
            label={FastingModule.buttons.partialFinish}
            onPress={() => {
              abandonFast();
              setShowEarlyFinishSheet(false);
            }}
            loading={isAbandoning}
            fullWidth
            color={Colors.warning}
          />
          <Button
            label="Ajustar hora de inicio"
            onPress={openActiveStartAdjustModal}
            variant="secondary"
            color={Colors.fasting}
            fullWidth
          />
          <Button
            label={FastingModule.buttons.continueEarlyFinish}
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
  startHero: {
    gap: Spacing[2],
  },
  startEyebrow: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.xs,
    color: Colors.fasting,
    textTransform: 'uppercase',
    letterSpacing: 0.9,
  },
  startTitle: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.xl,
    color: Colors.textPrimary,
  },
  sectionTitle: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.lg,
    color: Colors.textPrimary,
  },
  startPrompt: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    lineHeight: LineHeight.px20,
  },
  selectedProtocolCard: {
    gap: Spacing[2],
    borderRadius: Radius.xl,
    padding: Spacing[4],
    borderWidth: 1,
    borderColor: withOpacity(Colors.fasting, 0.2),
    backgroundColor: withOpacity(Colors.fasting, 0.08),
  },
  selectedProtocolTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing[3],
  },
  selectedProtocolEyebrow: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  selectedProtocolValue: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize['2xl'],
    color: Colors.textPrimary,
  },
  selectedProtocolBadge: {
    minWidth: 56,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[2],
    backgroundColor: withOpacity(Colors.fasting, 0.14),
    borderWidth: 1,
    borderColor: withOpacity(Colors.fasting, 0.22),
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedProtocolBadgeText: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.sm,
    color: Colors.fasting,
  },
  selectedProtocolBody: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    lineHeight: LineHeight.px20,
  },
  inlineSectionLabel: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
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
  quickPresetRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing[2],
  },
  quickPresetChip: {
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.bgElevated,
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[2],
  },
  quickPresetChipActive: {
    borderColor: withOpacity(Colors.fasting, 0.45),
    backgroundColor: withOpacity(Colors.fasting, 0.12),
  },
  quickPresetText: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
  },
  quickPresetTextActive: {
    color: Colors.fasting,
  },

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
    fontSize: FontSize['2.75xl'],
    color: Colors.textPrimary,
    lineHeight: LineHeight.px28,
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
    lineHeight: LineHeight.px20,
  },
  recommendationChip: {
    alignSelf: 'flex-start',
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: withOpacity(Colors.fasting, 0.28),
    backgroundColor: withOpacity(Colors.fasting, 0.14),
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[2],
  },
  recommendationChipText: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.xs,
    color: Colors.fasting,
  },
  startActionGroup: {
    gap: Spacing[2],
  },
  startFootnoteCard: {
    gap: Spacing[1],
    borderRadius: Radius.xl,
    padding: Spacing[3],
    backgroundColor: withOpacity(Colors.white, 0.03),
    borderWidth: 1,
    borderColor: withOpacity(Colors.white, 0.06),
  },
  startFootnoteTitle: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
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
    lineHeight: LineHeight.px20,
  },
  pastFastBody: {
    gap: Spacing[3],
  },
  pastFastHint: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    lineHeight: LineHeight.px20,
  },
  pastProtocolRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing[2],
  },
  pastProtocolChip: {
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.bgElevated,
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[2],
  },
  pastProtocolChipActive: {
    borderColor: Colors.fasting,
    backgroundColor: withOpacity(Colors.fasting, 0.1),
  },
  pastProtocolText: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
  },
  pastProtocolTextActive: {
    color: Colors.fasting,
  },
  pastTimeGrid: {
    gap: Spacing[3],
  },
  pastSummaryCard: {
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: withOpacity(Colors.fasting, 0.2),
    backgroundColor: withOpacity(Colors.fasting, 0.06),
    padding: Spacing[3],
    gap: Spacing[1],
  },
  pastSummaryTitle: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.sm,
    color: Colors.textPrimary,
  },
  pastSummaryBody: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.base,
    color: Colors.fasting,
  },
  pastSummaryHint: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    lineHeight: 18,
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
  activeHeroTop: {
    alignSelf: 'stretch',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing[3],
  },
  activeHeroCopy: {
    flex: 1,
    gap: Spacing[1],
  },
  activeHeroTitle: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.lg,
    color: Colors.textPrimary,
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
    width: 132,
  },
  timerZoneEmoji: {
    fontSize: 20,
    marginBottom: 4,
  },
  timerText: {
    fontFamily: FontFamily.display,
    fontSize: FontSize['3xl'],
    lineHeight: LineHeight.px48,
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
  timerHint: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    textAlign: 'center',
  },
  activeMetaRow: {
    alignSelf: 'stretch',
    flexDirection: 'row',
    gap: Spacing[2],
  },
  activeMetaPill: {
    flex: 1,
    gap: 4,
    borderRadius: Radius.xl,
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[3],
    backgroundColor: withOpacity(Colors.white, 0.04),
    borderWidth: 1,
    borderColor: withOpacity(Colors.white, 0.06),
  },
  activeMetaPillLabel: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.7,
  },
  activeMetaPillValue: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.sm,
    color: Colors.textPrimary,
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
  phasePreviewCard: {
    gap: Spacing[3],
    backgroundColor: withOpacity(Colors.fasting, 0.08),
    borderColor: withOpacity(Colors.fasting, 0.18),
  },
  phasePreviewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[3],
  },
  phasePreviewCopy: {
    flex: 1,
    gap: Spacing[1],
  },
  phasePreviewEyebrow: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  phasePreviewTitle: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.base,
    color: Colors.textPrimary,
  },
  phasePreviewBody: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    lineHeight: LineHeight.px20,
  },
  phasePreviewBadge: {
    minWidth: 78,
    borderRadius: Radius.xl,
    backgroundColor: withOpacity(Colors.fasting, 0.14),
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[3],
    alignItems: 'center',
    justifyContent: 'center',
  },
  phasePreviewBadgeText: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.sm,
    color: Colors.fasting,
  },
  sessionToolsCard: {
    gap: Spacing[3],
    backgroundColor: withOpacity(Colors.fasting, 0.08),
    borderColor: withOpacity(Colors.fasting, 0.18),
  },
  activeActionGroup: {
    alignSelf: 'stretch',
    gap: Spacing[2],
  },
  noteInput: {
    minHeight: 88,
    textAlignVertical: 'top',
    paddingTop: Spacing[3],
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
    fontSize: FontSize['2.25xl'],
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
    lineHeight: LineHeight.px22,
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
    fontSize: FontSize['3.75xl'],
    color: Colors.warning,
  },
  earlyFinishLabel: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
});
