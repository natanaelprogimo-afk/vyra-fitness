import { useMemo, useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import Header from '@/components/layout/Header';
import ModuleIntroScreen from '@/components/modules/ModuleIntroScreen';
import CycleDisc from '@/components/female/CycleDisc';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import SafeScreen from '@/components/ui/SafeScreen';
import { Colors, withOpacity } from '@/constants/colors';
import { FontFamily, FontSize, Radius, Spacing } from '@/constants/theme';
import { useFemaleHealth } from '@/hooks/useFemaleHealth';
import { useWorkout } from '@/hooks/useWorkout';
import { useSettingsStore } from '@/stores/settingsStore';

const SYMPTOMS = [
  { id: 'colicos', label: 'Cólicos', icon: 'Calor' },
  { id: 'hinchazon', label: 'Hinchazón', icon: 'Agua' },
  { id: 'fatiga', label: 'Fatiga', icon: 'Bateria' },
  { id: 'migrana', label: 'Migrana', icon: 'Cabeza' },
  { id: 'cambios de humor', label: 'Humor', icon: 'Ánimo' },
  { id: 'energía alta', label: 'Energía alta', icon: 'Rayo' },
] as const;

const MOODS = [
  { id: '1', emoji: ':(' },
  { id: '2', emoji: ':|' },
  { id: '3', emoji: ':)' },
  { id: '4', emoji: 'B)' },
  { id: '5', emoji: '<3' },
] as const;

function addDays(date: Date, amount: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + amount);
  return next;
}

function phaseMeta(phase: string) {
  switch (phase) {
    case 'menstrual':
      return {
        title: 'Fase menstrual',
        description: 'Momento para bajar exigencia, sumar recuperación y escuchar energía real.',
        energy: 38,
        bestFor: 'Recuperación y carga suave',
        compatibility: 2,
        color: '#F87171',
      };
    case 'ovulation':
      return {
        title: 'Fase ovulatoria',
        description: 'Ventana de energía alta. Buen momento para entrenar fuerte o subir intensidad.',
        energy: 86,
        bestFor: 'Entrenar fuerte',
        compatibility: 5,
        color: Colors.female,
      };
    case 'luteal':
      return {
        title: 'Fase lutea',
        description: 'Conviene consistencia, carga moderada y margen extra de recuperación.',
        energy: 56,
        bestFor: 'Consistencia y control de carga',
        compatibility: 3,
        color: '#A855F7',
      };
    default:
      return {
        title: 'Fase folicular',
        description: 'Suele haber buena tolerancia al progreso y al trabajo con más empuje.',
        energy: 78,
        bestFor: 'Progresar carga y volumen',
        compatibility: 4,
        color: '#D8B4FE',
      };
  }
}

function phaseForFutureDay(dayIndex: number, cycleLength: number) {
  const normalized = cycleLength > 0 ? dayIndex % cycleLength : dayIndex;
  if (normalized < 5) return 'menstrual';
  if (normalized < 13) return 'follicular';
  if (normalized < 16) return 'ovulation';
  return 'luteal';
}

export default function FemaleHealthScreen() {
  const hasSeenIntro = useSettingsStore((state) => Boolean(state.moduleIntroSeen.female));
  const markModuleIntroSeen = useSettingsStore((state) => state.markModuleIntroSeen);
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
  } = useFemaleHealth();
  const { activeSession } = useWorkout();

  const [showSensitive, setShowSensitive] = useState(!strictSensitiveMode);
  const [setupCycle, setSetupCycle] = useState(cycleLength || 28);
  const [logOpen, setLogOpen] = useState(false);
  const [predictionOpen, setPredictionOpen] = useState(false);
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [symptomSeverity, setSymptomSeverity] = useState<Record<string, number>>({});
  const [selectedMood, setSelectedMood] = useState<string>('3');
  const [notes, setNotes] = useState('');
  const sensitiveHidden = !showSensitive;

  const phaseTone = phaseMeta(currentPhase);
  const todayIndex = Math.max(0, Math.min(cycleLength - 1, daysInPhase));
  const ovulationDate = useMemo(() => {
    const diff = daysInPhase <= 14 ? 14 - daysInPhase : cycleLength - daysInPhase + 14;
    return addDays(new Date(), diff);
  }, [cycleLength, daysInPhase]);

  const predictionRows = useMemo(
    () =>
      Array.from({ length: 7 }, (_, offset) => {
        const phase = phaseForFutureDay(todayIndex + offset, cycleLength || 28);
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
    [cycleLength, todayIndex],
  );

  if (!hasSeenIntro) {
    return (
      <SafeScreen padHorizontal={false} padBottom>
        <Header title="Ciclo" showBack />
        <ModuleIntroScreen
          accentColor={Colors.female}
          icon="Ciclo"
          title="Seguimiento femenino"
          body="Registra la fase, cómo te sientes y deja que VYRA conecte ciclo, entreno y energía."
          ctaLabel="Entrar al módulo"
          onContinue={() => markModuleIntroSeen('female')}
        />
      </SafeScreen>
    );
  }

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

  return (
    <SafeScreen padHorizontal={false} padBottom>
      <Header
        title="Ciclo"
        showBack
        rightAction={
          <Pressable
            onPress={() => setShowSensitive((value) => !value)}
            accessibilityRole="button"
            accessibilityLabel={showSensitive ? 'Ocultar datos sensibles' : 'Mostrar datos sensibles'}
            accessibilityHint="Activa o tapa la información privada del ciclo."
            accessibilityState={{ expanded: showSensitive }}
            hitSlop={8}
          >
            <Text style={styles.headerLink}>{showSensitive ? 'Ocultar' : 'Ver'}</Text>
          </Pressable>
        }
      />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {sensitiveHidden ? (
          <Card style={styles.lockCard} shadow={false}>
            <Text style={styles.lockTitle}>Toca para ver tu información del ciclo</Text>
            <Text style={styles.lockBody}>
              El modo privado tapa fase, predicciones y síntomas hasta que tú decidas abrirlos.
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
              Marca el inicio reciente para calcular fase, predicciones y contexto diario.
            </Text>
            <View style={styles.setupRow}>
              {[26, 28, 30].map((value) => (
                <Pressable
                  key={value}
                  style={[styles.setupChip, setupCycle === value && styles.setupChipActive]}
                  onPress={() => setSetupCycle(value)}
                  accessibilityRole="radio"
                  accessibilityLabel={`${value} días`}
                  accessibilityState={{ selected: setupCycle === value }}
                  hitSlop={8}
                >
                  <Text style={[styles.setupChipText, setupCycle === value && styles.setupChipTextActive]}>
                    {value} días
                  </Text>
                </Pressable>
              ))}
            </View>
            <Button
              onPress={() => void saveCycleSetup(new Date().toISOString().split('T')[0] ?? '', setupCycle)}
              loading={isSavingSetup}
              fullWidth
            >
              Usar hoy como inicio
            </Button>
          </Card>
        ) : null}

        {showSensitive && isInCycle ? (
          <>
            <Card style={styles.discCard} shadow={false}>
              <Pressable
                style={styles.discRow}
                onPress={() => setPredictionOpen(true)}
                accessibilityRole="button"
                accessibilityLabel={`Abrir predicciones de ${phaseTone.title}`}
                accessibilityHint="Muestra los próximos siete días del ciclo."
              >
                <CycleDisc cycleLength={cycleLength} currentDay={todayIndex} phaseLabel={currentPhase} />
                <View style={styles.discCopy}>
                  <Text style={[styles.phaseTitle, { color: phaseTone.color }]}>{phaseTone.title}</Text>
                  <Text style={styles.phaseSubtitle}>Día {daysInPhase + 1} de tu ciclo</Text>
                  <Text style={styles.phaseDescription}>{phaseTone.description}</Text>
                  <Text style={styles.phaseLink}>Toca el disco para ver los próximos 7 días</Text>
                </View>
              </Pressable>
            </Card>

            <Card style={styles.energyCard} shadow={false}>
              <View style={styles.energyHeader}>
                <Text style={styles.sectionTitle}>Energía esperada</Text>
                <Text style={styles.energyValue}>{phaseTone.energy}%</Text>
              </View>
              <View style={styles.energyTrack}>
                <View style={[styles.energyFill, { width: `${phaseTone.energy}%`, backgroundColor: phaseTone.color }]} />
              </View>
              <Text style={styles.sectionBody}>Mejor para: {phaseTone.bestFor}</Text>
              <Text style={styles.sectionBody}>
                Compatibilidad workout: {'o'.repeat(phaseTone.compatibility)}{' '}
                {'o'.repeat(Math.max(0, 5 - phaseTone.compatibility))}
              </Text>
              {activeSession ? (
                <Text style={styles.compatibilityText}>La sesión activa de hoy es compatible con esta fase.</Text>
              ) : null}
            </Card>

            <Card style={[styles.contextCard, { borderColor: withOpacity(phaseTone.color, 0.28) }]} shadow={false}>
              <Text style={styles.sectionTitle}>Contexto del día</Text>
              <Text style={styles.sectionBody}>{phaseGuidance.training}</Text>
              <Text style={styles.sectionBody}>{phaseGuidance.nutrition}</Text>
              <Text style={styles.sectionBody}>{phaseGuidance.fasting}</Text>
            </Card>

            {imminentPhaseNotice ? (
              <Card style={styles.noticeCard} shadow={false}>
                <Text style={styles.sectionBody}>{imminentPhaseNotice}</Text>
              </Card>
            ) : null}

            {cycleIrregularity.message ? (
              <Card style={styles.noticeCard} shadow={false}>
                <Text style={styles.sectionBody}>{cycleIrregularity.message}</Text>
              </Card>
            ) : null}

            <Button onPress={() => setLogOpen(true)} fullWidth>
              Registrar hoy
            </Button>

            <Card style={styles.predictionCard} shadow={false}>
              <Text style={styles.sectionTitle}>Predicciones</Text>
              <View style={styles.predictionRow}>
                <Text style={styles.predictionLabel}>Proxima menstruacion</Text>
                <Text style={styles.predictionValue}>
                  {nextPeriodDate
                    ? new Date(`${nextPeriodDate}T00:00:00`).toLocaleDateString('es-UY', {
                        day: 'numeric',
                        month: 'short',
                      })
                    : '--'}
                </Text>
              </View>
              <View style={styles.predictionRow}>
                <Text style={styles.predictionLabel}>Proxima ovulacion</Text>
                <Text style={styles.predictionValue}>
                  {ovulationDate.toLocaleDateString('es-UY', {
                    day: 'numeric',
                    month: 'short',
                  })}
                </Text>
              </View>
              <View style={styles.predictionRow}>
                <Text style={styles.predictionLabel}>Duración promedio</Text>
                <Text style={styles.predictionValue}>{cycleLength} días</Text>
              </View>
            </Card>
          </>
        ) : null}
      </ScrollView>

      <Modal visible={logOpen} transparent animationType="slide" onRequestClose={() => setLogOpen(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <Text style={styles.sectionTitle}>Registrar hoy</Text>
            <View style={styles.symptomWrap}>
              {SYMPTOMS.map((symptom) => {
                const active = selectedSymptoms.includes(symptom.id);
                return (
                  <Pressable
                    key={symptom.id}
                    style={[styles.symptomChip, active && styles.symptomChipActive]}
                    onPress={() => toggleSymptom(symptom.id)}
                    accessibilityRole="checkbox"
                    accessibilityLabel={symptom.label}
                    accessibilityState={{ checked: active }}
                    hitSlop={8}
                  >
                    <Text style={styles.symptomIcon}>{symptom.icon}</Text>
                    <Text style={[styles.symptomChipText, active && styles.symptomChipTextActive]}>
                      {symptom.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {selectedSymptoms.map((symptom) => (
              <View key={`severity-${symptom}`} style={styles.severityBlock}>
                <Text style={styles.label}>{SYMPTOMS.find((item) => item.id === symptom)?.label ?? symptom}</Text>
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
                          accessibilityLabel={`${SYMPTOMS.find((item) => item.id === symptom)?.label ?? symptom}, intensidad ${value}`}
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
              {MOODS.map((mood) => {
                const active = selectedMood === mood.id;
                return (
                  <Pressable
                    key={mood.id}
                    style={[styles.moodChip, active && styles.moodChipActive]}
                    onPress={() => setSelectedMood(mood.id)}
                    accessibilityRole="radio"
                    accessibilityLabel={`Estado emocional ${mood.emoji}`}
                    accessibilityState={{ selected: active }}
                    hitSlop={8}
                  >
                    <Text style={styles.moodEmoji}>{mood.emoji}</Text>
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

            <Button
              onPress={() => {
                log(currentPhase, [...selectedSymptoms, `estado:${selectedMood}`], notes.trim() || undefined, symptomSeverity);
                setLogOpen(false);
                setSelectedSymptoms([]);
                setSymptomSeverity({});
                setSelectedMood('3');
                setNotes('');
              }}
              loading={isLogging}
              fullWidth
            >
              Guardar
            </Button>
            <Button onPress={() => setLogOpen(false)} variant="ghost" fullWidth>
              Cerrar
            </Button>
          </View>
        </View>
      </Modal>

      <Modal visible={predictionOpen} transparent animationType="fade" onRequestClose={() => setPredictionOpen(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <Text style={styles.sectionTitle}>Próximos 7 días</Text>
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
                </View>
                <View style={styles.predictionBadge}>
                  <Text style={styles.predictionBadgeText}>{row.energy}%</Text>
                </View>
              </View>
            ))}
            <Button onPress={() => setPredictionOpen(false)} fullWidth>
              Cerrar
            </Button>
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
  sectionTitle: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.md,
    color: Colors.textPrimary,
  },
  sectionBody: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.base,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  setupRow: {
    flexDirection: 'row',
    gap: Spacing[3],
  },
  setupChip: {
    flex: 1,
    minHeight: 48,
    borderRadius: Radius.md,
    backgroundColor: Colors.bgElevated,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  setupChipActive: {
    backgroundColor: withOpacity(Colors.action, 0.1),
    borderColor: Colors.actionBorder,
  },
  setupChipText: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.base,
    color: Colors.textSecondary,
  },
  setupChipTextActive: {
    color: Colors.action,
  },
  discCard: {
    gap: Spacing[4],
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
    lineHeight: 20,
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
    fontSize: 28,
    color: Colors.textPrimary,
  },
  energyTrack: {
    width: '100%',
    height: 10,
    borderRadius: Radius.full,
    backgroundColor: Colors.bgElevated,
    overflow: 'hidden',
  },
  energyFill: {
    height: '100%',
    borderRadius: Radius.full,
  },
  compatibilityText: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.base,
    color: Colors.textPrimary,
  },
  contextCard: {
    gap: Spacing[2],
    backgroundColor: withOpacity(Colors.female, 0.08),
  },
  noticeCard: {
    gap: Spacing[2],
  },
  predictionCard: {
    gap: Spacing[3],
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: Colors.bgSurface,
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    paddingHorizontal: Spacing[5],
    paddingTop: Spacing[5],
    paddingBottom: Spacing[8],
    gap: Spacing[3],
  },
  symptomWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing[2],
  },
  symptomChip: {
    minHeight: 42,
    borderRadius: Radius.full,
    backgroundColor: Colors.bgElevated,
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
    fontSize: FontSize.xs,
    color: Colors.textMuted,
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
    minHeight: 38,
    borderRadius: Radius.md,
    backgroundColor: Colors.bgElevated,
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
    minHeight: 52,
    borderRadius: Radius.md,
    backgroundColor: Colors.bgElevated,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  moodChipActive: {
    backgroundColor: withOpacity(Colors.female, 0.12),
    borderColor: withOpacity(Colors.female, 0.3),
  },
  moodEmoji: {
    fontFamily: FontFamily.semibold,
    fontSize: 20,
    color: Colors.textPrimary,
  },
  notesInput: {
    minHeight: 92,
    borderRadius: Radius.md,
    backgroundColor: Colors.bgElevated,
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
  },
  predictionListMeta: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  predictionBadge: {
    minWidth: 54,
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
