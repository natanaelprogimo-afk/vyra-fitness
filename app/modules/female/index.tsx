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
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import SafeScreen from '@/components/ui/SafeScreen';
import { Colors, withOpacity } from '@/constants/colors';
import { FontFamily, FontSize, Radius, Spacing } from '@/constants/theme';
import { useFemaleHealth } from '@/hooks/useFemaleHealth';
import { useWorkout } from '@/hooks/useWorkout';
import { useSettingsStore } from '@/stores/settingsStore';

const SYMPTOMS = ['colicos', 'hinchazon', 'fatiga', 'migrana', 'cambios de humor', 'energia alta'] as const;
const MOODS = ['1', '2', '3', '4', '5'] as const;

type PhaseTone = {
  title: string;
  description: string;
  color: string;
};

function getPhaseTone(phase: string): PhaseTone {
  switch (phase) {
    case 'menstrual':
      return {
        title: 'Fase menstrual',
        description: 'Buen momento para bajar exigencia, sumar recuperacion y escuchar energia real.',
        color: '#F87171',
      };
    case 'ovulation':
      return {
        title: 'Fase ovulatoria',
        description: 'Energia alta. Buen momento para entrenar fuerte o subir intensidad.',
        color: Colors.female,
      };
    case 'luteal':
      return {
        title: 'Fase lutea',
        description: 'Conviene consistencia, carga moderada y margen extra de recuperacion.',
        color: '#A855F7',
      };
    default:
      return {
        title: 'Fase folicular',
        description: 'Suele haber buena tolerancia al progreso y a sesiones con mas empuje.',
        color: '#D8B4FE',
      };
  }
}

function getPhaseForDay(dayIndex: number, cycleLength: number) {
  const normalized = cycleLength > 0 ? dayIndex % cycleLength : dayIndex;
  if (normalized < 5) return '#F87171';
  if (normalized < 13) return '#D8B4FE';
  if (normalized < 16) return Colors.female;
  return '#A855F7';
}

function addDays(date: Date, amount: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + amount);
  return next;
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
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [selectedMood, setSelectedMood] = useState<string>('3');
  const [notes, setNotes] = useState('');

  const phaseTone = getPhaseTone(currentPhase);
  const todayIndex = Math.max(0, Math.min(cycleLength - 1, daysInPhase));
  const cycleDays = Array.from({ length: Math.max(28, Math.min(32, cycleLength || 28)) }, (_, index) => index);
  const ovulationDate = useMemo(() => {
    const diff = daysInPhase <= 14 ? 14 - daysInPhase : cycleLength - daysInPhase + 14;
    return addDays(new Date(), diff);
  }, [cycleLength, daysInPhase]);

  if (!hasSeenIntro) {
    return (
      <SafeScreen padHorizontal={false} padBottom>
        <Header title="Ciclo" showBack />
        <ModuleIntroScreen
          accentColor={Colors.female}
          icon="🌸"
          title="Seguimiento femenino"
          body="Registra la fase, como te sientes y deja que VYRA conecte ciclo, entreno y energia."
          ctaLabel="Entrar al modulo"
          onContinue={() => markModuleIntroSeen('female')}
        />
      </SafeScreen>
    );
  }

  const toggleSymptom = (symptom: string) => {
    setSelectedSymptoms((current) =>
      current.includes(symptom) ? current.filter((item) => item !== symptom) : [...current, symptom],
    );
  };

  return (
    <SafeScreen padHorizontal={false} padBottom>
      <Header
        title="Ciclo"
        showBack
        rightAction={
          <Pressable onPress={() => setShowSensitive((value) => !value)}>
            <Text style={styles.headerLink}>{showSensitive ? 'Ocultar' : 'Ver'}</Text>
          </Pressable>
        }
      />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {strictSensitiveMode && !showSensitive ? (
          <Card style={styles.lockCard} shadow={false}>
            <Text style={styles.lockTitle}>Toca para ver tu informacion del ciclo</Text>
            <Text style={styles.lockBody}>
              El modo privado tapa fase, predicciones y sintomas hasta que tu decidas abrirlos.
            </Text>
            <Button onPress={() => setShowSensitive(true)} fullWidth>
              Mostrar ahora
            </Button>
          </Card>
        ) : null}

        {!isInCycle ? (
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
                >
                  <Text style={[styles.setupChipText, setupCycle === value && styles.setupChipTextActive]}>
                    {value} dias
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

        {(!strictSensitiveMode || showSensitive) && isInCycle ? (
          <>
            <Card style={styles.cycleCard} shadow={false}>
              <View style={styles.cycleHeader}>
                <View>
                  <Text style={[styles.phaseTitle, { color: phaseTone.color }]}>{phaseTone.title}</Text>
                  <Text style={styles.phaseSubtitle}>Dia {daysInPhase + 1} de tu ciclo</Text>
                </View>
              </View>

              <View style={styles.cycleScale}>
                {cycleDays.map((day) => {
                  const isToday = day === todayIndex;
                  return (
                    <View key={day} style={styles.cycleScaleItem}>
                      <View
                        style={[
                          styles.cycleBar,
                          {
                            backgroundColor: getPhaseForDay(day, cycleLength),
                            opacity: isToday ? 1 : 0.4,
                            borderWidth: isToday ? 1.5 : 0,
                            borderColor: isToday ? Colors.textPrimary : 'transparent',
                          },
                        ]}
                      />
                      {isToday ? <Text style={styles.todayMarker}>HOY</Text> : null}
                    </View>
                  );
                })}
              </View>
            </Card>

            <Card style={[styles.contextCard, { borderColor: withOpacity(phaseTone.color, 0.28) }]} shadow={false}>
              <Text style={styles.sectionTitle}>{phaseTone.description}</Text>
              <Text style={styles.sectionBody}>{phaseGuidance.training}</Text>
              <Text style={styles.sectionBody}>{phaseGuidance.nutrition}</Text>
              {activeSession ? (
                <Text style={styles.compatibilityText}>La sesion activa de hoy es compatible con esta fase.</Text>
              ) : null}
            </Card>

            {imminentPhaseNotice ? (
              <Card style={styles.noticeCard} shadow={false}>
                <Text style={styles.sectionBody}>{imminentPhaseNotice}</Text>
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
                <Text style={styles.predictionLabel}>Duracion promedio</Text>
                <Text style={styles.predictionValue}>{cycleLength} dias</Text>
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
                const active = selectedSymptoms.includes(symptom);
                return (
                  <Pressable
                    key={symptom}
                    style={[styles.symptomChip, active && styles.symptomChipActive]}
                    onPress={() => toggleSymptom(symptom)}
                  >
                    <Text style={[styles.symptomChipText, active && styles.symptomChipTextActive]}>{symptom}</Text>
                  </Pressable>
                );
              })}
            </View>

            <Text style={styles.label}>Estado emocional</Text>
            <View style={styles.moodRow}>
              {MOODS.map((mood) => {
                const active = selectedMood === mood;
                return (
                  <Pressable
                    key={mood}
                    style={[styles.moodChip, active && styles.moodChipActive]}
                    onPress={() => setSelectedMood(mood)}
                  >
                    <Text style={[styles.moodChipText, active && styles.moodChipTextActive]}>{mood}</Text>
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
                log(currentPhase, [...selectedSymptoms, `estado:${selectedMood}`], notes.trim() || undefined);
                setLogOpen(false);
                setSelectedSymptoms([]);
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
  cycleCard: {
    gap: Spacing[4],
  },
  cycleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  cycleScale: {
    flexDirection: 'row',
    gap: 2,
    alignItems: 'flex-end',
  },
  cycleScaleItem: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  cycleBar: {
    width: '100%',
    height: 28,
    borderRadius: 4,
  },
  todayMarker: {
    fontFamily: FontFamily.bold,
    fontSize: 9,
    color: Colors.textMuted,
  },
  contextCard: {
    gap: Spacing[2],
    backgroundColor: withOpacity(Colors.female, 0.08),
  },
  compatibilityText: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.base,
    color: Colors.textPrimary,
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
    minHeight: 38,
    borderRadius: Radius.full,
    backgroundColor: Colors.bgElevated,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing[3],
    alignItems: 'center',
    justifyContent: 'center',
  },
  symptomChipActive: {
    backgroundColor: withOpacity(Colors.female, 0.12),
    borderColor: withOpacity(Colors.female, 0.3),
  },
  symptomChipText: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.base,
    color: Colors.textSecondary,
  },
  symptomChipTextActive: {
    color: Colors.textPrimary,
  },
  label: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    letterSpacing: 1.1,
    textTransform: 'uppercase',
  },
  moodRow: {
    flexDirection: 'row',
    gap: Spacing[2],
  },
  moodChip: {
    flex: 1,
    minHeight: 44,
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
  moodChipText: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.base,
    color: Colors.textSecondary,
  },
  moodChipTextActive: {
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
});
