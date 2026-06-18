import { useEffect, useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { router } from 'expo-router';
import CycleDisc from '@/components/female/CycleDisc';
import FemaleModuleTabs from '@/components/female/FemaleModuleTabs';
import Header from '@/components/layout/Header';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import NoticeCard from '@/components/ui/NoticeCard';
import SafeScreen from '@/components/ui/SafeScreen';
import { Colors, withOpacity } from '@/constants/colors';
import { Routes } from '@/constants/routes';
import { FontFamily, FontSize, Radius, Spacing, ComponentHeight, ComponentWidth, LineHeight } from '@/constants/theme';
import { FemaleSymptoms, FemaleMoods } from '@/constants/strings';
import { useFemaleHealth } from '@/hooks/useFemaleHealth';
import { useWorkout, type Routine } from '@/hooks/useWorkout';
import { useSettingsStore } from '@/stores/settingsStore';
import { useUIStore } from '@/stores/uiStore';

const SETUP_CYCLE_OPTIONS = [21, 24, 26, 28, 30, 32, 35] as const;
const SETUP_PERIOD_OFFSETS = [0, 1, 2, 3, 5, 7] as const;
const PREDICTION_DAYS = 14;

const SYMPTOM_METADATA = [
  { id: 'colicos', emoji: '🔥' },
  { id: 'hinchazon', emoji: '💧' },
  { id: 'fatiga', emoji: '🪫' },
  { id: 'migrana', emoji: '🤕' },
  { id: 'cambios_humor', emoji: '😤' },
  { id: 'energia_alta', emoji: '⚡' },
] as const;

const MOOD_METADATA = [
  { id: '1' as const, emoji: '😔' },
  { id: '2' as const, emoji: '😐' },
  { id: '3' as const, emoji: '🙂' },
  { id: '4' as const, emoji: '😄' },
  { id: '5' as const, emoji: '🥰' },
] as const;

function addDays(date: Date, amount: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + amount);
  return next;
}

function formatShortDate(date: Date) {
  return date.toLocaleDateString('es-UY', {
    day: 'numeric',
    month: 'short',
  });
}

function getSafeCycleLength(value: number | null | undefined) {
  return Math.max(21, Math.min(35, Math.round(value ?? 28)));
}

function getSafeBleedDays(value: number | null | undefined) {
  return Math.max(3, Math.min(8, Math.round(value ?? 5)));
}

function getOvulationDayIndex(cycleLength: number) {
  return Math.max(10, Math.min(cycleLength - 11, cycleLength - 14));
}

function resolvePhaseForCycleDay(
  cycleDayZeroBased: number,
  cycleLength: number,
  bleedDays: number,
) {
  const safeCycleLength = getSafeCycleLength(cycleLength);
  const safeBleedDays = getSafeBleedDays(bleedDays);
  const normalized = ((cycleDayZeroBased % safeCycleLength) + safeCycleLength) % safeCycleLength;
  const ovulationIndex = getOvulationDayIndex(safeCycleLength);
  const ovulationStart = Math.max(safeBleedDays + 4, ovulationIndex - 1);
  const ovulationEnd = Math.min(safeCycleLength - 1, ovulationIndex + 1);

  if (normalized < safeBleedDays) return 'menstrual';
  if (normalized < ovulationStart) return 'follicular';
  if (normalized <= ovulationEnd) return 'ovulation';
  return 'luteal';
}

function phaseMeta(phase: string) {
  switch (phase) {
    case 'menstrual':
      return {
        title: 'Fase menstrual',
        description: 'Conviene bajar exigencia, sumar recuperacion y escuchar energia real.',
        energy: 38,
        bestFor: 'Recuperacion, movilidad y tecnica',
        compatibility: 2,
        color: '#F87171',
      };
    case 'ovulation':
      return {
        title: 'Fase ovulatoria',
        description: 'Ventana de energia alta. Buen momento para entrenar fuerte o subir intensidad.',
        energy: 86,
        bestFor: 'Fuerza, potencia e intensidad alta',
        compatibility: 5,
        color: Colors.female,
      };
    case 'luteal':
      return {
        title: 'Fase lutea',
        description: 'Suele rendir mejor la consistencia, la carga moderada y un poco mas de recuperacion.',
        energy: 56,
        bestFor: 'Consistencia y control de carga',
        compatibility: 3,
        color: '#A855F7',
      };
    default:
      return {
        title: 'Fase folicular',
        description: 'Suele haber buena tolerancia al progreso y al trabajo con mas empuje.',
        energy: 78,
        bestFor: 'Progresar carga y volumen',
        compatibility: 4,
        color: '#D8B4FE',
      };
  }
}

function formatOffsetLabel(daysAgo: number) {
  if (daysAgo === 0) return 'Hoy';
  if (daysAgo === 1) return 'Ayer';
  return `Hace ${daysAgo} dias`;
}

function buildCompatibilityDots(level: number) {
  return `${'●'.repeat(Math.max(0, level))}${'○'.repeat(Math.max(0, 5 - level))}`;
}

function formatCycleWindow(startDay: number, endDay: number) {
  return `Días ${startDay}-${endDay}`;
}

function routinePhaseScore(routine: Routine, phase: string) {
  const haystack = `${routine.name} ${routine.goal_tag ?? ''} ${routine.split_tag ?? ''}`.toLowerCase();
  const minutes = Number(routine.estimated_duration_min ?? 35);
  let score = routine.is_primary ? 1 : 0;

  if (phase === 'menstrual') {
    if (haystack.includes('movilidad') || haystack.includes('recupe') || haystack.includes('casa') || haystack.includes('express')) score += 6;
    if (haystack.includes('continuidad')) score += 4;
    if (minutes <= 35) score += 3;
    if (haystack.includes('fuerza') || haystack.includes('hipertrofia')) score -= 3;
  } else if (phase === 'luteal') {
    if (haystack.includes('continuidad') || haystack.includes('casa') || haystack.includes('full body')) score += 5;
    if (haystack.includes('glúteos') || haystack.includes('core')) score += 2;
    if (minutes <= 45) score += 2;
  } else if (phase === 'ovulation') {
    if (haystack.includes('fuerza') || haystack.includes('hipertrofia') || haystack.includes('upper') || haystack.includes('lower')) score += 5;
    if (haystack.includes('cardio')) score += 2;
    if (minutes >= 35) score += 2;
    if (routine.is_primary) score += 2;
  } else {
    if (haystack.includes('fuerza') || haystack.includes('full body') || haystack.includes('cardio')) score += 4;
    if (haystack.includes('continuidad')) score += 2;
    if (minutes >= 30) score += 1;
  }

  return score;
}

function pickRoutineForPhase(routines: Routine[], phase: string, fallback: Routine | null) {
  const source = routines.length ? routines : fallback ? [fallback] : [];
  if (!source.length) return fallback;

  return [...source].sort((left, right) => {
    const scoreDiff = routinePhaseScore(right, phase) - routinePhaseScore(left, phase);
    if (scoreDiff !== 0) return scoreDiff;
    return (left.estimated_duration_min ?? 999) - (right.estimated_duration_min ?? 999);
  })[0] ?? fallback;
}

function buildWorkoutBridgeBody(phase: string, routine: Routine | null) {
  const routineLine = routine
    ? `${routine.name} · ${routine.estimated_duration_min ?? 30} min.`
    : 'Todavía no hay una rutina clara en tu biblioteca.';

  if (phase === 'menstrual') {
    return `Hoy conviene una entrada suave y sostenida. ${routineLine}`;
  }
  if (phase === 'luteal') {
    return `Sirve más sostener consistencia que perseguir un pico. ${routineLine}`;
  }
  if (phase === 'ovulation') {
    return `Esta suele ser tu mejor ventana para intensidad alta si el resto acompaña. ${routineLine}`;
  }
  return `Tu fase hoy tolera progreso y algo más de empuje. ${routineLine}`;
}

export default function FemaleHealthScreen() {
  const femalePeriodDuration = useSettingsStore((state) => state.femalePeriodDuration);
  const femaleDisclaimerAccepted = useSettingsStore((state) => state.femaleDisclaimerAccepted);
  const setFemaleDisclaimerAccepted = useSettingsStore((state) => state.setFemaleDisclaimerAccepted);
  const showToast = useUIStore((state) => state.showToast);
  const {
    cycleLength,
    currentPhase,
    daysInPhase,
    nextPeriodDate,
    phaseGuidance,
    imminentPhaseNotice,
    cycleIrregularity,
    isInCycle,
    strictSensitiveMode,
    saveCycleSetup,
    isSavingSetup,
    log,
    isLogging,
    history,
    symptomPredictions,
  } = useFemaleHealth();
  const { activeSession, routines, getRecommendedRoutine } = useWorkout();

  const safeCycleLength = getSafeCycleLength(cycleLength);
  const safeBleedDays = getSafeBleedDays(femalePeriodDuration);
  const [showSensitive, setShowSensitive] = useState(!strictSensitiveMode);
  const [setupCycle, setSetupCycle] = useState(safeCycleLength);
  const [setupOffsetDays, setSetupOffsetDays] = useState<number>(0);
  const [logOpen, setLogOpen] = useState(false);
  const [predictionOpen, setPredictionOpen] = useState(false);
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [symptomSeverity, setSymptomSeverity] = useState<Record<string, number>>({});
  const [selectedMood, setSelectedMood] = useState<string>('3');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    setShowSensitive(!strictSensitiveMode);
  }, [strictSensitiveMode]);

  useEffect(() => {
    setSetupCycle(safeCycleLength);
  }, [safeCycleLength]);

  const todayIndex = Math.max(0, Math.min(safeCycleLength - 1, daysInPhase));
  const phaseTone = phaseMeta(currentPhase);
  const ovulationDate = useMemo(() => {
    const ovulationIndex = getOvulationDayIndex(safeCycleLength);
    const diff = ovulationIndex - todayIndex;
    return addDays(new Date(), diff >= 0 ? diff : safeCycleLength + diff);
  }, [safeCycleLength, todayIndex]);
  const predictionRows = useMemo(
    () =>
      Array.from({ length: PREDICTION_DAYS }, (_, offset) => {
        const cycleDay = todayIndex + offset;
        const phase = resolvePhaseForCycleDay(cycleDay, safeCycleLength, safeBleedDays);
        const meta = phaseMeta(phase);
        return {
          offset,
          phase,
          date: addDays(new Date(), offset),
          energy: meta.energy,
          title: meta.title,
          bestFor: meta.bestFor,
        };
      }),
    [safeBleedDays, safeCycleLength, todayIndex],
  );
  const todayLog = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return history.find((entry) => entry.logged_at.startsWith(today)) ?? null;
  }, [history]);
  const recentLogs = useMemo(() => history.slice(0, 5), [history]);
  const recommendedRoutine = useMemo(() => getRecommendedRoutine(), [getRecommendedRoutine, routines, history]);
  const phaseRoutine = useMemo(
    () => pickRoutineForPhase(routines, currentPhase, recommendedRoutine.routine),
    [currentPhase, recommendedRoutine.routine, routines],
  );
  const topPrediction = symptomPredictions[0] ?? null;

  const toggleSymptom = (symptom: string) => {
    setSelectedSymptoms((current) =>
      current.includes(symptom) ? current.filter((item) => item !== symptom) : [...current, symptom],
    );

    setSymptomSeverity((current) =>
      current[symptom]
        ? current
        : {
            ...current,
            [symptom]: 3,
          },
    );
  };

  const handleSaveSetup = async () => {
    const startDate = addDays(new Date(), -setupOffsetDays)
      .toISOString()
      .split('T')[0];
    const ok = await saveCycleSetup(startDate ?? '', setupCycle);
    if (ok) {
      showToast('Ciclo base guardado.', 'success');
      return;
    }
    showToast('No pudimos guardar el inicio del ciclo.', 'error');
  };

  const handleSaveLog = async () => {
    await log(
      currentPhase,
      selectedSymptoms,
      notes.trim() || undefined,
      symptomSeverity,
      Number(selectedMood),
    );
    setLogOpen(false);
    setSelectedSymptoms([]);
    setSymptomSeverity({});
    setSelectedMood('3');
    setNotes('');
  };

  return (
    <SafeScreen padHorizontal={false} padBottom>
      <Header
        title="Salud femenina"
        showBack
        rightAction={(
          <Pressable
            onPress={() => setShowSensitive((value) => !value)}
            accessibilityRole="button"
            accessibilityLabel={showSensitive ? 'Ocultar datos sensibles' : 'Mostrar datos sensibles'}
            accessibilityHint="Activa o tapa la informacion privada del ciclo."
            accessibilityState={{ expanded: showSensitive }}
            hitSlop={8}
          >
            <Text style={styles.headerLink}>{showSensitive ? 'Ocultar' : 'Ver'}</Text>
          </Pressable>
        )}
      />

      <FemaleModuleTabs active="cycle" />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {!femaleDisclaimerAccepted ? (
          <NoticeCard
            title="Falta confirmar el disclaimer medico"
            body="Este modulo acompana tu lectura diaria, pero no reemplaza evaluacion profesional."
            tone="warning"
            actionLabel="Confirmar ahora"
            onAction={() => setFemaleDisclaimerAccepted(true)}
          />
        ) : null}

        {!showSensitive ? (
          <Card style={styles.lockCard} shadow={false}>
            <Text style={styles.lockTitle}>Tu informacion sensible esta oculta</Text>
            <Text style={styles.lockBody}>
              El modo privado tapa fase, predicciones y sintomas hasta que tu decidas abrirlos.
            </Text>
            <Button onPress={() => setShowSensitive(true)} fullWidth>
              Mostrar ahora
            </Button>
          </Card>
        ) : null}

        {showSensitive && !isInCycle ? (
          <Card style={styles.setupCard} shadow={false}>
            <Text style={styles.sectionTitle}>Inicializa tu ciclo</Text>
            <Text style={styles.sectionBody}>
              Marca cuando empezo el ultimo periodo y el largo real de tu ciclo para calcular fase y predicciones.
            </Text>

            <View style={styles.setupBlock}>
              <Text style={styles.label}>Duracion del ciclo</Text>
              <View style={styles.setupWrap}>
                {SETUP_CYCLE_OPTIONS.map((value) => {
                  const active = setupCycle === value;
                  return (
                    <Pressable
                      key={value}
                      style={[styles.setupChip, active && styles.setupChipActive]}
                      onPress={() => setSetupCycle(value)}
                      accessibilityRole="radio"
                      accessibilityLabel={`${value} dias`}
                      accessibilityState={{ checked: active }}
                      hitSlop={8}
                    >
                      <Text style={[styles.setupChipText, active && styles.setupChipTextActive]}>
                        {value} dias
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            <View style={styles.setupBlock}>
              <Text style={styles.label}>Inicio del ultimo periodo</Text>
              <View style={styles.setupWrap}>
                {SETUP_PERIOD_OFFSETS.map((value) => {
                  const active = setupOffsetDays === value;
                  return (
                    <Pressable
                      key={value}
                      style={[styles.setupChip, active && styles.setupChipActive]}
                      onPress={() => setSetupOffsetDays(value)}
                      accessibilityRole="radio"
                      accessibilityLabel={formatOffsetLabel(value)}
                      accessibilityState={{ checked: active }}
                      hitSlop={8}
                    >
                      <Text style={[styles.setupChipText, active && styles.setupChipTextActive]}>
                        {formatOffsetLabel(value)}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            <Button onPress={() => void handleSaveSetup()} loading={isSavingSetup} fullWidth>
              Guardar inicio del ciclo
            </Button>
          </Card>
        ) : null}

        {showSensitive && isInCycle ? (
          <>
            <Card style={styles.discCard} shadow={false}>
              <View style={styles.heroTopRow}>
                <View>
                  <Text style={styles.heroEyebrow}>Hoy</Text>
                  <Text style={styles.heroTitle}>Tu ciclo en contexto</Text>
                </View>
                <Pressable
                  onPress={() => setPredictionOpen(true)}
                  accessibilityRole="button"
                  accessibilityLabel={`Abrir predicciones de ${phaseTone.title}`}
                  accessibilityHint="Muestra las proximas dos semanas del ciclo."
                  hitSlop={8}
                >
                  <Text style={styles.phaseLink}>Ver 2 semanas</Text>
                </Pressable>
              </View>

              <View style={styles.discRow}>
                <CycleDisc cycleLength={safeCycleLength} currentDay={todayIndex} phaseLabel={currentPhase} />
                <View style={styles.discCopy}>
                  <Text style={[styles.phaseTitle, { color: phaseTone.color }]}>{phaseTone.title}</Text>
                  <Text style={styles.phaseSubtitle}>Día {todayIndex + 1} de {safeCycleLength}</Text>
                  <Text style={styles.phaseDescription}>{phaseTone.description}</Text>
                </View>
              </View>

              <View style={styles.todayMetricRow}>
                <View style={styles.todayMetricCard}>
                  <Text style={styles.todayMetricLabel}>Energia</Text>
                  <Text style={styles.todayMetricValue}>{phaseTone.energy}%</Text>
                </View>
                <View style={styles.todayMetricCard}>
                  <Text style={styles.todayMetricLabel}>Mejor para</Text>
                  <Text style={styles.todayMetricText}>{phaseTone.bestFor}</Text>
                </View>
              </View>

              <View style={styles.energyTrack}>
                <View
                  style={[
                    styles.energyFill,
                    { width: `${phaseTone.energy}%`, backgroundColor: phaseTone.color },
                  ]}
                />
              </View>
              <Text style={styles.compatibilityLine}>
                Compatibilidad con entreno: {buildCompatibilityDots(phaseTone.compatibility)}
              </Text>
              {activeSession ? (
                <Text style={styles.compatibilityText}>
                  Ya tienes una sesión activa. Conviene ajustar la intensidad según esta fase.
                </Text>
              ) : null}
            </Card>

            <Card style={styles.checkinCard} shadow={false}>
              <View style={styles.checkinHeader}>
                <View style={styles.checkinCopy}>
                  <Text style={styles.sectionTitle}>Como te sientes hoy</Text>
                  <Text style={styles.sectionBody}>
                    {todayLog
                      ? 'Ya registraste tu estado de hoy. Si algo cambio, puedes ajustarlo en un toque.'
                      : 'Haz un check-in corto para que el ciclo quede conectado con energia, sintomas y entreno.'}
                  </Text>
                </View>
                <Button onPress={() => setLogOpen(true)} color={Colors.female} size="sm">
                  {todayLog ? 'Actualizar' : 'Registrar'}
                </Button>
              </View>

              {todayLog ? (
                <View style={styles.todayLogCard}>
                  <Text style={styles.todayLogTitle}>
                    {todayLog.mood
                      ? `${MOOD_METADATA.find((item) => item.id === String(todayLog.mood))?.emoji ?? '🙂'} ${FemaleMoods[String(todayLog.mood)] ?? 'Estado guardado'}`
                      : 'Estado guardado hoy'}
                  </Text>
                  <Text style={styles.todayLogBody}>
                    {todayLog.symptoms?.length
                      ? `${todayLog.symptoms.length} síntoma${todayLog.symptoms.length === 1 ? '' : 's'} registrados`
                      : 'Sin síntomas marcados por ahora'}
                    {todayLog.notes ? ` · ${todayLog.notes}` : ''}
                  </Text>
                </View>
              ) : topPrediction ? (
                <View style={styles.todayLogCard}>
                  <Text style={styles.todayLogTitle}>Patrón probable de esta ventana</Text>
                  <Text style={styles.todayLogBody}>{topPrediction.insight}</Text>
                </View>
              ) : (
                <View style={styles.todayLogCard}>
                  <Text style={styles.todayLogTitle}>Todavía estás construyendo tu patrón</Text>
                  <Text style={styles.todayLogBody}>
                    Cuando acumules más registros, acá vas a ver señales útiles para anticiparte mejor.
                  </Text>
                </View>
              )}
            </Card>

            <Card style={[styles.contextCard, { borderColor: withOpacity(phaseTone.color, 0.28) }]} shadow={false}>
              <Text style={styles.sectionTitle}>Lo que más te conviene hoy</Text>

              <View style={styles.contextBlock}>
                <Text style={styles.contextLabel}>Entrenamiento</Text>
                <Text style={styles.sectionBody}>{phaseGuidance.training}</Text>
              </View>

              <View style={styles.contextBlock}>
                <Text style={styles.contextLabel}>Nutricion</Text>
                <Text style={styles.sectionBody}>{phaseGuidance.nutrition}</Text>
              </View>

              <View style={styles.contextBlock}>
                <Text style={styles.contextLabel}>Ayuno</Text>
                <Text style={styles.sectionBody}>{phaseGuidance.fasting}</Text>
              </View>
            </Card>

            <Card style={styles.workoutBridgeCard} shadow={false}>
              <Text style={styles.sectionTitle}>Entreno conectado</Text>
              <Text style={styles.sectionBody}>{buildWorkoutBridgeBody(currentPhase, phaseRoutine)}</Text>
              <Text style={styles.workoutBridgeHint}>
                {phaseRoutine
                  ? `Foco sugerido hoy: ${phaseRoutine.goal_tag ?? phaseRoutine.split_tag ?? 'continuidad'}.`
                  : 'Cuando guardes o actives rutinas, este módulo te va a empujar una opción más precisa por fase.'}
              </Text>
              {phaseRoutine ? (
                <View style={styles.workoutBridgeAction}>
                  <Button
                    onPress={() =>
                      router.push({
                        pathname: Routes.workout.preview,
                        params: { routineId: phaseRoutine.id, name: phaseRoutine.name },
                      } as never)
                    }
                    color={Colors.female}
                    fullWidth
                  >
                    Abrir rutina sugerida
                  </Button>
                </View>
              ) : null}
            </Card>

            <Card style={styles.predictionCard} shadow={false}>
              <Text style={styles.sectionTitle}>Predicciones base</Text>
              <View style={styles.predictionRow}>
                <Text style={styles.predictionLabel}>Proximo periodo</Text>
                <Text style={styles.predictionValue}>
                  {nextPeriodDate ? formatShortDate(new Date(`${nextPeriodDate}T12:00:00`)) : '--'}
                </Text>
              </View>
              <View style={styles.predictionRow}>
                <Text style={styles.predictionLabel}>Ovulacion estimada</Text>
                <Text style={styles.predictionValue}>{formatShortDate(ovulationDate)}</Text>
              </View>
              <View style={styles.predictionRow}>
                <Text style={styles.predictionLabel}>Duracion del ciclo</Text>
                <Text style={styles.predictionValue}>{safeCycleLength} dias</Text>
              </View>
            </Card>

            {imminentPhaseNotice ? (
              <NoticeCard
                title="Cambio de fase cerca"
                body={imminentPhaseNotice}
                tone="info"
              />
            ) : null}

            {cycleIrregularity.message ? (
              <NoticeCard
                title="Conviene revisar la variacion del ciclo"
                body={cycleIrregularity.message}
                tone="warning"
              />
            ) : null}

            <Card style={styles.patternCard} shadow={false}>
              <View style={styles.historyHeader}>
                <View style={styles.patternCopy}>
                  <Text style={styles.sectionTitle}>Patrón aprendido</Text>
                  <Text style={styles.sectionBody}>
                    {topPrediction
                      ? 'VYRA ya está leyendo síntomas que se repiten cerca del mismo momento del ciclo.'
                      : 'Todavía faltan más registros para volver predictivo este módulo.'}
                  </Text>
                </View>
                <Pressable
                  onPress={() =>
                    router.push({
                      pathname: Routes.profile.exportData,
                      params: { preset: 'female' },
                    } as never)
                  }
                  accessibilityRole="button"
                  accessibilityLabel="Compartir ciclo con médico"
                  hitSlop={8}
                >
                  <Text style={styles.historyLink}>Compartir con médico</Text>
                </Pressable>
              </View>

              {symptomPredictions.length ? (
                <View style={styles.patternList}>
                  {symptomPredictions.map((prediction) => (
                    <View key={`${prediction.symptom}-${prediction.startDay}`} style={styles.patternItem}>
                      <View style={styles.patternTop}>
                        <Text style={styles.patternTitle}>{prediction.insight}</Text>
                        <Text style={styles.patternBadge}>
                          {prediction.confidence === 'alta' ? 'Alta' : 'Media'}
                        </Text>
                      </View>
                      <Text style={styles.patternMeta}>
                        {formatCycleWindow(prediction.startDay, prediction.endDay)} · aparece en {prediction.occurrenceCount} registros · intensidad media {prediction.avgSeverity}/5
                      </Text>
                      <Text style={styles.patternMeta}>
                        Próxima ventana estimada: {formatShortDate(new Date(`${prediction.nextDateStart}T12:00:00`))} a {formatShortDate(new Date(`${prediction.nextDateEnd}T12:00:00`))}
                      </Text>
                      <Text style={styles.patternHint}>{prediction.trainingHint}</Text>
                    </View>
                  ))}
                </View>
              ) : (
                <Text style={styles.sectionBody}>
                  En cuanto registres síntomas en más días y más ciclos, acá va a aparecer algo del estilo “este mes probablemente tengas fatiga entre ciertos días”.
                </Text>
              )}
            </Card>

            {todayLog ? (
              <NoticeCard
                title="Hoy ya registraste tu estado"
                body="Puedes volver a abrir el registro para ajustar síntomas, humor o notas del día."
                tone="success"
              />
            ) : null}

            <Card style={styles.historyCard} shadow={false}>
              <View style={styles.historyHeader}>
                <Text style={styles.sectionTitle}>Registros recientes</Text>
                <Pressable
                  onPress={() => router.push(Routes.profile.exportData)}
                  accessibilityRole="button"
                  accessibilityLabel="Exportar historial del ciclo"
                  hitSlop={8}
                >
                  <Text style={styles.historyLink}>Exportar</Text>
                </Pressable>
              </View>

              {recentLogs.length ? (
                <View style={styles.historyList}>
                  {recentLogs.map((entry) => {
                    const mood = entry.mood ? MOOD_METADATA.find((item) => item.id === String(entry.mood)) : null;
                    return (
                      <View key={entry.id} style={styles.historyItem}>
                        <View style={styles.historyTop}>
                          <Text style={styles.historyDate}>
                            {new Date(entry.logged_at).toLocaleDateString('es-UY', {
                              weekday: 'short',
                              day: 'numeric',
                              month: 'short',
                            })}
                          </Text>
                          <Text style={styles.historyPhase}>{phaseMeta(entry.phase).title}</Text>
                        </View>
                        <Text style={styles.historyMeta}>
                          {mood ? `${mood.emoji} ${FemaleMoods[mood.id]}` : 'Sin humor guardado'}
                          {entry.symptoms?.length ? ` · ${entry.symptoms.length} sintoma${entry.symptoms.length === 1 ? '' : 's'}` : ''}
                        </Text>
                        {entry.notes ? <Text style={styles.historyNotes}>{entry.notes}</Text> : null}
                      </View>
                    );
                  })}
                </View>
              ) : (
                <Text style={styles.sectionBody}>
                  Aun no hay suficientes registros pasados para ver patrones del ciclo.
                </Text>
              )}
            </Card>
          </>
        ) : null}
      </ScrollView>

      <Modal
        visible={logOpen}
        transparent
        animationType="slide"
        onRequestClose={() => {
          if (!isLogging) setLogOpen(false);
        }}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalOverlay}
        >
          <View style={styles.modalSheet}>
            <ScrollView
              contentContainerStyle={styles.modalContent}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <Text style={styles.sectionTitle}>Registrar hoy</Text>

              <View style={styles.symptomWrap}>
                {SYMPTOM_METADATA.map((symptom) => {
                  const active = selectedSymptoms.includes(symptom.id);
                  const label = FemaleSymptoms[symptom.id];
                  return (
                    <Pressable
                      key={symptom.id}
                      style={[styles.symptomChip, active && styles.symptomChipActive]}
                      onPress={() => toggleSymptom(symptom.id)}
                      accessibilityRole="checkbox"
                      accessibilityLabel={label}
                      accessibilityState={{ checked: active }}
                      hitSlop={8}
                    >
                      <Text style={styles.symptomIcon}>{symptom.emoji}</Text>
                      <Text style={[styles.symptomChipText, active && styles.symptomChipTextActive]}>
                        {label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              {selectedSymptoms.map((symptom) => (
                <View key={`severity-${symptom}`} style={styles.severityBlock}>
                  <Text style={styles.label}>{FemaleSymptoms[symptom] ?? symptom}</Text>
                  <View style={styles.severityRow}>
                    {[1, 2, 3, 4, 5].map((value) => {
                      const active = (symptomSeverity[symptom] ?? 3) === value;
                      return (
                        <Pressable
                          key={`${symptom}-${value}`}
                          style={[styles.severityChip, active && styles.severityChipActive]}
                          onPress={() =>
                            setSymptomSeverity((current) => ({
                              ...current,
                              [symptom]: value,
                            }))
                          }
                          accessibilityRole="radio"
                          accessibilityLabel={`${Object.entries(FemaleSymptoms).find((item) => item[0] === symptom)?.[1] ?? symptom}, intensidad ${value}`}
                          accessibilityState={{ selected: active }}
                          hitSlop={8}
                        >
                          <Text style={[styles.severityChipText, active && styles.severityChipTextActive]}>
                            {value}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>
              ))}

              <Text style={styles.label}>Estado emocional</Text>
              <View style={styles.moodRow}>
                {MOOD_METADATA.map((mood) => {
                  const active = selectedMood === mood.id;
                  const label = FemaleMoods[mood.id];
                  return (
                    <Pressable
                      key={mood.id}
                      style={[styles.moodChip, active && styles.moodChipActive]}
                      onPress={() => setSelectedMood(mood.id)}
                      accessibilityRole="radio"
                      accessibilityLabel={`Estado emocional ${label}`}
                      accessibilityState={{ selected: active }}
                      hitSlop={8}
                    >
                      <Text style={styles.moodEmoji}>{mood.emoji}</Text>
                      <Text style={styles.moodLabel}>{label}</Text>
                    </Pressable>
                  );
                })}
              </View>

              <Text style={styles.label}>Notas</Text>
              <TextInput
                value={notes}
                onChangeText={setNotes}
                placeholder="Algo que quieras recordar hoy"
                placeholderTextColor={Colors.textMuted}
                multiline
                style={styles.notesInput}
              />

              <Button onPress={() => void handleSaveLog()} loading={isLogging} fullWidth>
                Guardar
              </Button>
              <Button onPress={() => setLogOpen(false)} variant="ghost" disabled={isLogging} fullWidth>
                Cerrar
              </Button>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      <Modal
        visible={predictionOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setPredictionOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <ScrollView
              contentContainerStyle={styles.modalContent}
              showsVerticalScrollIndicator={false}
            >
              <Text style={styles.sectionTitle}>Proximas 2 semanas</Text>
              {predictionRows.map((row) => (
                <View key={`prediction-${row.offset}`} style={styles.predictionListRow}>
                  <View style={styles.predictionListCopy}>
                    <Text style={styles.predictionListDate}>
                      {row.date.toLocaleDateString('es-UY', {
                        weekday: 'short',
                        day: 'numeric',
                        month: 'short',
                      })}
                    </Text>
                    <Text style={styles.predictionListMeta}>{row.title}</Text>
                    <Text style={styles.predictionListHint}>{row.bestFor}</Text>
                  </View>
                  <View style={styles.predictionBadge}>
                    <Text style={styles.predictionBadgeText}>{row.energy}%</Text>
                  </View>
                </View>
              ))}
              <Button onPress={() => setPredictionOpen(false)} fullWidth>
                Cerrar
              </Button>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeScreen>
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
  lockCard: {
    gap: Spacing[3],
  },
  lockTitle: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.md,
    color: Colors.textPrimary,
  },
  lockBody: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.base,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  setupCard: {
    gap: Spacing[3],
  },
  setupBlock: {
    gap: Spacing[2],
  },
  setupWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing[2],
  },
  sectionTitle: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.md,
    color: Colors.textPrimary,
  },
  sectionBody: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.base,
    color: Colors.textSecondary,
    lineHeight: LineHeight.px20,
  },
  setupChip: {
    minHeight: ComponentHeight.inputSm,
    borderRadius: Radius.full,
    backgroundColor: Colors.elevated,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing[3],
    alignItems: 'center',
    justifyContent: 'center',
  },
  setupChipActive: {
    backgroundColor: withOpacity(Colors.female, 0.12),
    borderColor: withOpacity(Colors.female, 0.3),
  },
  setupChipText: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  setupChipTextActive: {
    color: Colors.female,
  },
  discCard: {
    gap: Spacing[4],
    borderWidth: 1,
    borderColor: withOpacity(Colors.female, 0.18),
    backgroundColor: withOpacity(Colors.female, 0.08),
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: Spacing[3],
  },
  heroEyebrow: {
    fontFamily: FontFamily.semibold,
    fontSize: 11,
    color: Colors.female,
    textTransform: 'uppercase',
    letterSpacing: 0.9,
    marginBottom: Spacing[1],
  },
  heroTitle: {
    fontFamily: FontFamily.bold,
    fontSize: 18,
    color: Colors.textPrimary,
  },
  discRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[4],
  },
  discCopy: {
    flex: 1,
    gap: 4,
  },
  phaseTitle: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.xl,
  },
  phaseSubtitle: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.base,
    color: Colors.textSecondary,
  },
  phaseDescription: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.base,
    color: Colors.textSecondary,
    lineHeight: LineHeight.px20,
  },
  todayMetricRow: {
    flexDirection: 'row',
    gap: Spacing[2],
  },
  todayMetricCard: {
    flex: 1,
    gap: 4,
    borderRadius: Radius.xl,
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[3],
    backgroundColor: withOpacity(Colors.black, 0.14),
    borderWidth: 1,
    borderColor: withOpacity(Colors.white, 0.06),
  },
  todayMetricLabel: {
    fontFamily: FontFamily.medium,
    fontSize: 11,
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.7,
  },
  todayMetricValue: {
    fontFamily: FontFamily.bold,
    fontSize: 24,
    color: Colors.textPrimary,
  },
  todayMetricText: {
    fontFamily: FontFamily.semibold,
    fontSize: 13,
    color: Colors.textPrimary,
    lineHeight: 18,
  },
  phaseLink: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.sm,
    color: Colors.female,
  },
  energyCard: {
    gap: Spacing[3],
    backgroundColor: withOpacity(Colors.female, 0.08),
    borderColor: withOpacity(Colors.female, 0.18),
  },
  energyHeader: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: Spacing[2],
  },
  energyValue: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize['2xl'],
    color: Colors.textPrimary,
  },
  energyTrack: {
    width: '100%',
    height: LineHeight.px10,
    borderRadius: Radius.full,
    backgroundColor: Colors.elevated,
    overflow: 'hidden',
  },
  energyFill: {
    height: '100%',
    borderRadius: Radius.full,
  },
  compatibilityLine: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.base,
    color: Colors.textPrimary,
    letterSpacing: 1,
  },
  compatibilityText: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  checkinCard: {
    gap: Spacing[3],
    borderWidth: 1,
    borderColor: withOpacity(Colors.female, 0.14),
    backgroundColor: withOpacity(Colors.white, 0.03),
  },
  checkinHeader: {
    gap: Spacing[3],
  },
  checkinCopy: {
    gap: Spacing[1],
  },
  todayLogCard: {
    gap: Spacing[1],
    borderRadius: Radius.xl,
    padding: Spacing[3],
    backgroundColor: withOpacity(Colors.black, 0.14),
    borderWidth: 1,
    borderColor: withOpacity(Colors.white, 0.06),
  },
  todayLogTitle: {
    fontFamily: FontFamily.bold,
    fontSize: 14,
    color: Colors.textPrimary,
  },
  todayLogBody: {
    fontFamily: FontFamily.regular,
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 19,
  },
  contextCard: {
    gap: Spacing[3],
    backgroundColor: withOpacity(Colors.white, 0.03),
  },
  workoutBridgeCard: {
    gap: Spacing[3],
    borderColor: withOpacity(Colors.female, 0.18),
    backgroundColor: withOpacity(Colors.female, 0.06),
  },
  contextBlock: {
    gap: 4,
  },
  contextLabel: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    letterSpacing: 1.1,
    textTransform: 'uppercase',
  },
  predictionCard: {
    gap: Spacing[3],
  },
  patternCard: {
    gap: Spacing[3],
  },
  patternCopy: {
    flex: 1,
    gap: 4,
  },
  predictionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing[3],
  },
  predictionLabel: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.base,
    color: Colors.textSecondary,
  },
  predictionValue: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.base,
    color: Colors.textPrimary,
  },
  historyCard: {
    gap: Spacing[3],
  },
  historyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing[3],
  },
  historyLink: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.sm,
    color: Colors.female,
  },
  workoutBridgeHint: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    lineHeight: LineHeight.px20,
  },
  workoutBridgeAction: {
    paddingTop: 4,
  },
  patternList: {
    gap: Spacing[3],
  },
  patternItem: {
    gap: 6,
    borderRadius: Radius.lg,
    backgroundColor: Colors.elevated,
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[3],
  },
  patternTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: Spacing[2],
  },
  patternTitle: {
    flex: 1,
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.sm,
    color: Colors.textPrimary,
    lineHeight: LineHeight.px20,
  },
  patternBadge: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.xs,
    color: Colors.female,
  },
  patternMeta: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  patternHint: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.xs,
    color: Colors.textPrimary,
    lineHeight: 18,
  },
  historyList: {
    gap: Spacing[3],
  },
  historyItem: {
    gap: 4,
    borderRadius: Radius.lg,
    backgroundColor: Colors.elevated,
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[3],
  },
  historyTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing[3],
  },
  historyDate: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.sm,
    color: Colors.textPrimary,
    textTransform: 'capitalize',
  },
  historyPhase: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
  },
  historyMeta: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
  },
  historyNotes: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    color: Colors.textPrimary,
    lineHeight: LineHeight.px20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    maxHeight: '88%',
    backgroundColor: Colors.bgSurface,
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
  },
  modalContent: {
    gap: Spacing[3],
    paddingHorizontal: Spacing[5],
    paddingTop: Spacing[5],
    paddingBottom: Spacing[8],
  },
  symptomWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing[2],
  },
  symptomChip: {
    minHeight: ComponentHeight.symptomButton,
    borderRadius: Radius.full,
    backgroundColor: Colors.elevated,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing[3],
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    flexDirection: 'row',
  },
  symptomChipActive: {
    backgroundColor: withOpacity(Colors.female, 0.12),
    borderColor: withOpacity(Colors.female, 0.3),
  },
  symptomIcon: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.base,
  },
  symptomChipText: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.base,
    color: Colors.textSecondary,
  },
  symptomChipTextActive: {
    color: Colors.textPrimary,
  },
  severityBlock: {
    gap: Spacing[2],
  },
  label: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    letterSpacing: 1.1,
    textTransform: 'uppercase',
  },
  severityRow: {
    flexDirection: 'row',
    gap: Spacing[2],
  },
  severityChip: {
    flex: 1,
    minHeight: ComponentHeight.cycleSymptomsButton,
    borderRadius: Radius.md,
    backgroundColor: Colors.elevated,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  severityChipActive: {
    backgroundColor: withOpacity(Colors.female, 0.12),
    borderColor: withOpacity(Colors.female, 0.3),
  },
  severityChipText: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.base,
    color: Colors.textSecondary,
  },
  severityChipTextActive: {
    color: Colors.textPrimary,
  },
  moodRow: {
    flexDirection: 'row',
    gap: Spacing[2],
  },
  moodChip: {
    flex: 1,
    minHeight: ComponentHeight.cyclePhaseButton,
    borderRadius: Radius.md,
    backgroundColor: Colors.elevated,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: Spacing[2],
  },
  moodChipActive: {
    backgroundColor: withOpacity(Colors.female, 0.12),
    borderColor: withOpacity(Colors.female, 0.3),
  },
  moodEmoji: {
    fontSize: FontSize['lg+'],
  },
  moodLabel: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
  },
  notesInput: {
    minHeight: ComponentHeight.cycleNotesButton,
    borderRadius: Radius.md,
    backgroundColor: Colors.elevated,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[3],
    fontFamily: FontFamily.regular,
    fontSize: FontSize.base,
    color: Colors.textPrimary,
    textAlignVertical: 'top',
  },
  predictionListRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing[3],
  },
  predictionListCopy: {
    flex: 1,
    gap: 2,
  },
  predictionListDate: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.base,
    color: Colors.textPrimary,
    textTransform: 'capitalize',
  },
  predictionListMeta: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  predictionListHint: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.xs,
    color: Colors.textMuted,
  },
  predictionBadge: {
    minWidth: ComponentWidth.cycleSymptomButton,
    borderRadius: Radius.full,
    backgroundColor: withOpacity(Colors.female, 0.12),
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[1.5],
    alignItems: 'center',
  },
  predictionBadgeText: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.sm,
    color: Colors.female,
  },
});
