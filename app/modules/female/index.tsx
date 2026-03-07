// ============================================================
// VYRA FITNESS — Módulo Salud Femenina: Pantalla Principal
// Ciclo menstrual, fases, síntomas, predicciones
// ============================================================

import { useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, Alert } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import SafeScreen from '@/components/ui/SafeScreen';
import Header from '@/components/layout/Header';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import ProgressCircle from '@/components/charts/ProgressCircle';
import { useFemaleHealth } from '@/hooks/useFemaleHealth';
import { Colors } from '@/constants/colors';
import { FontSize, FontFamily, Spacing, Radius } from '@/constants/theme';

const PHASE_EMOJIS: Record<string, string> = {
  menstrual: '🔴',
  follicular: '🌱',
  ovulation: '🌕',
  luteal: '🌙',
};

const PHASE_COLORS: Record<string, string> = {
  menstrual: '#FF6B6B',
  follicular: '#4ECDC4',
  ovulation: '#FFD43B',
  luteal: '#A78BFA',
};

const PHASE_NAMES: Record<string, string> = {
  menstrual: 'Menstruación',
  follicular: 'Folicular',
  ovulation: 'Ovulación',
  luteal: 'Lútea',
};

const SYMPTOMS = [
  'cólicos', 'hinchazón', 'fatiga', 'migrañas', 'sensibilidad mamaria',
  'cambios de humor', 'acné', 'flujo vaginal', 'libido baja', 'energía alta',
];

export default function FemaleHealthScreen() {
  const {
    cycleLength, nextPeriodDate, currentPhase, daysInPhase,
    lastPeriodDate, isLogging, log, updateSymptoms,
    history, isInCycle, phaseGuidance, imminentPhaseNotice, cycleIrregularity,
    strictSensitiveMode, saveCycleSetup, isSavingSetup,
  } = useFemaleHealth();

  const [showLogForm, setShowLogForm]       = useState(false);
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [symptomSeverity, setSymptomSeverity] = useState<Record<string, number>>({});
  const [notes, setNotes]                   = useState('');
  const [setupCycleLength, setSetupCycleLength] = useState(cycleLength || 28);

  const phaseEmoji = PHASE_EMOJIS[currentPhase] || '❓';
  const phaseColor = PHASE_COLORS[currentPhase] || Colors.textSecondary;
  const phaseName = PHASE_NAMES[currentPhase] || 'Desconocido';

  const cycleProgress = ((daysInPhase + 1) / cycleLength) * 100;

  const currentDaySymptoms = history.length > 0 ? history[0].symptoms : [];

  const handleLogPeriod = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    log(currentPhase, selectedSymptoms, notes.trim() || undefined, symptomSeverity);
    setSelectedSymptoms([]);
    setSymptomSeverity({});
    setNotes('');
    setShowLogForm(false);
  };

  const handleSetupCycle = () => {
    const today = new Date().toISOString().split('T')[0] ?? '';
    void saveCycleSetup(today, setupCycleLength);
  };

  const toggleSymptom = (symptom: string) => {
    setSelectedSymptoms((prev) => {
      if (prev.includes(symptom)) {
        setSymptomSeverity((current) => {
          const next = { ...current };
          delete next[symptom];
          return next;
        });
        return prev.filter((s) => s !== symptom);
      }

      setSymptomSeverity((current) => ({
        ...current,
        [symptom]: current[symptom] ?? 3,
      }));
      return [...prev, symptom];
    });
  };

  const adjustSymptomSeverity = (symptom: string, delta: number) => {
    setSymptomSeverity((current) => {
      const prev = current[symptom] ?? 3;
      const nextValue = Math.max(1, Math.min(5, prev + delta));
      return {
        ...current,
        [symptom]: nextValue,
      };
    });
  };

  return (
    <SafeScreen padHorizontal={false} padBottom>
      <Header
        title="Salud Femenina"
        showBack
        color={Colors.female}
        rightAction={
          <Pressable onPress={() => router.push('/modules/female/history' as any)} style={styles.histBtn}>
            <Text style={styles.histText}>Historial</Text>
          </Pressable>
        }
      />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {strictSensitiveMode ? (
          <Card style={styles.privacyCard}>
            <Text style={styles.privacyTitle}>Modo estricto activo</Text>
            <Text style={styles.privacyText}>
              La fase diaria se guarda cifrada. El modulo sigue funcionando localmente, pero algunas automatizaciones remotas por fase pueden reducirse.
            </Text>
          </Card>
        ) : null}

        {!isInCycle ? (
          <Card style={styles.setupCard}>
            <Text style={styles.setupTitle}>Inicializa tu ciclo</Text>
            <Text style={styles.setupText}>
              Marca el inicio del ultimo periodo para que Vyra adapte entreno, ayuno, hidratacion y widget segun la fase.
            </Text>
            <View style={styles.setupChips}>
              {[26, 28, 30].map((option) => (
                <Pressable
                  key={option}
                  onPress={() => setSetupCycleLength(option)}
                  style={[
                    styles.setupChip,
                    setupCycleLength === option && styles.setupChipActive,
                  ]}
                >
                  <Text style={[styles.setupChipText, setupCycleLength === option && styles.setupChipTextActive]}>
                    {option} dias
                  </Text>
                </Pressable>
              ))}
            </View>
            <Button
              label="Usar hoy como inicio"
              onPress={handleSetupCycle}
              loading={isSavingSetup}
              variant="primary"
              fullWidth
            />
          </Card>
        ) : null}

        {/* Ring con fase actual */}
        <View style={styles.cycleSection}>
          <ProgressCircle
            value={cycleProgress}
            size={180}
            strokeWidth={12}
            color={phaseColor}
            trackColor={Colors.bgElevated}
            animated
            duration={1000}
          >
            <Text style={styles.phaseEmoji}>{phaseEmoji}</Text>
            <Text style={[styles.phaseName, { color: phaseColor }]}>{phaseName}</Text>
            <Text style={styles.cycleDay}>Día {daysInPhase + 1} de {cycleLength}</Text>
          </ProgressCircle>

          {nextPeriodDate && (
            <View style={[styles.nextPeriodCard, { backgroundColor: `${Colors.female}0F` }]}>
              <Text style={styles.nextPeriodLabel}>Próxima menstruación:</Text>
              <Text style={[styles.nextPeriodDate, { color: Colors.female }]}>
                {new Date(nextPeriodDate).toLocaleDateString('es-AR', {
                  month: 'short',
                  day: 'numeric',
                })}
              </Text>
            </View>
          )}
        </View>

        {/* Info de la fase actual */}
        <Card style={styles.phaseInfoCard}>
          <Text style={styles.phaseInfoTitle}>Características de esta fase:</Text>
          {currentPhase === 'menstrual' && (
            <View>
              <Text style={styles.phaseInfoText}>💧 Sangrado menstrual</Text>
              <Text style={styles.phaseInfoText}>😴 Energía más baja</Text>
              <Text style={styles.phaseInfoText}>💪 Enfocarse en descanso y nutrición</Text>
            </View>
          )}
          {currentPhase === 'follicular' && (
            <View>
              <Text style={styles.phaseInfoText}>🌱 Crecimiento del óvulo</Text>
              <Text style={styles.phaseInfoText}>⚡ Energía aumentando</Text>
              <Text style={styles.phaseInfoText}>🏋️ Buen momento para entrenamientos intensos</Text>
            </View>
          )}
          {currentPhase === 'ovulation' && (
            <View>
              <Text style={styles.phaseInfoText}>🌕 Liberación del óvulo</Text>
              <Text style={styles.phaseInfoText}>🔥 Energía, confianza, libido en pico</Text>
              <Text style={styles.phaseInfoText}>🎯 Mejor momento para retos y PRs</Text>
            </View>
          )}
          {currentPhase === 'luteal' && (
            <View>
              <Text style={styles.phaseInfoText}>🌙 Preparación para menstruación</Text>
              <Text style={styles.phaseInfoText}>😤 Posible fatiga, retención de agua</Text>
              <Text style={styles.phaseInfoText}>🤝 Enfocarse en consistencia, no intensidad</Text>
            </View>
          )}
        </Card>

        <Card style={styles.guidanceCard}>
          <Text style={styles.guidanceTitle}>Adaptación automática recomendada</Text>
          <Text style={styles.guidanceText}>Entrenamiento: {phaseGuidance.training}</Text>
          <Text style={styles.guidanceText}>Ayuno: {phaseGuidance.fasting}</Text>
          <Text style={styles.guidanceText}>Nutrición: {phaseGuidance.nutrition}</Text>
          {phaseGuidance.hydrationBoostMl > 0 && (
            <Text style={styles.guidanceMeta}>Hidratación sugerida: +{phaseGuidance.hydrationBoostMl} ml.</Text>
          )}
          {phaseGuidance.weightContext && (
            <Text style={styles.guidanceMeta}>{phaseGuidance.weightContext}</Text>
          )}
        </Card>

        {imminentPhaseNotice && (
          <Card style={styles.noticeCard}>
            <Text style={styles.noticeTitle}>Fase inminente</Text>
            <Text style={styles.noticeText}>{imminentPhaseNotice}</Text>
          </Card>
        )}

        {cycleIrregularity.isIrregular && cycleIrregularity.message && (
          <Card style={styles.irregularCard}>
            <Text style={styles.irregularTitle}>Variación de ciclo detectada</Text>
            <Text style={styles.irregularText}>{cycleIrregularity.message}</Text>
          </Card>
        )}

        {/* Log de síntomas */}
        {!showLogForm ? (
          <Button
            label="📝 Registrar síntomas de hoy"
            onPress={() => setShowLogForm(true)}
            variant="primary"
            fullWidth
            style={styles.logBtn}
          />
        ) : (
          <Card style={styles.formCard}>
            <Text style={styles.formTitle}>Síntomas de hoy</Text>

            <View style={styles.symptomsGrid}>
              {SYMPTOMS.map((symptom) => {
                const isSelected = selectedSymptoms.includes(symptom);
                return (
                  <Pressable
                    key={symptom}
                    onPress={() => toggleSymptom(symptom)}
                    style={[
                      styles.symptomTag,
                      isSelected && {
                        backgroundColor: phaseColor,
                        borderColor: phaseColor,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.symptomText,
                        isSelected && { color: '#FFF' },
                      ]}
                    >
                      {symptom}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {selectedSymptoms.length > 0 ? (
              <View style={styles.severityPanel}>
                <Text style={styles.severityTitle}>Severidad (1-5)</Text>
                {selectedSymptoms.map((symptom) => {
                  const severity = symptomSeverity[symptom] ?? 3;
                  return (
                    <View key={symptom} style={styles.severityRow}>
                      <Text style={styles.severitySymptom}>{symptom}</Text>
                      <View style={styles.severityControls}>
                        <Pressable
                          onPress={() => adjustSymptomSeverity(symptom, -1)}
                          style={styles.severityBtn}
                        >
                          <Text style={styles.severityBtnText}>-</Text>
                        </Pressable>
                        <Text style={styles.severityValue}>{severity}</Text>
                        <Pressable
                          onPress={() => adjustSymptomSeverity(symptom, 1)}
                          style={styles.severityBtn}
                        >
                          <Text style={styles.severityBtnText}>+</Text>
                        </Pressable>
                      </View>
                    </View>
                  );
                })}
              </View>
            ) : null}

            <View style={styles.formActions}>
              <Button
                label="Cancelar"
                onPress={() => setShowLogForm(false)}
                variant="secondary"
                style={styles.cancelBtn}
              />
              <Button
                label="Guardar"
                onPress={handleLogPeriod}
                loading={isLogging}
                disabled={selectedSymptoms.length === 0}
                variant="primary"
                style={styles.saveBtn}
              />
            </View>
          </Card>
        )}

        {/* Historial de registros recientes */}
        {history.length > 0 && (
          <View style={styles.historySection}>
            <Text style={styles.historyTitle}>Registros recientes</Text>
            {history.slice(0, 3).map((entry) => (
              <Card key={entry.id} style={styles.historyCard}>
                <View style={styles.historyEntry}>
                  <Text style={styles.historyDate}>
                    {new Date(entry.logged_at).toLocaleDateString('es-AR')}
                  </Text>
                  <Text style={styles.historyEmoji}>{PHASE_EMOJIS[entry.phase]}</Text>
                  <Text style={styles.historyPhase}>{PHASE_NAMES[entry.phase]}</Text>
                  {entry.symptoms && entry.symptoms.length > 0 && (
                    <Text style={styles.historySymptoms}>
                      {entry.symptoms.slice(0, 2).join(', ')}
                      {entry.symptoms.length > 2 ? ` +${entry.symptoms.length - 2}` : ''}
                      {entry.symptomSeverity && Object.keys(entry.symptomSeverity).length > 0
                        ? ` · sev ${(
                            Object.values(entry.symptomSeverity).reduce((sum, value) => sum + value, 0) /
                            Math.max(1, Object.values(entry.symptomSeverity).length)
                          ).toFixed(1)}`
                        : ''}
                    </Text>
                  )}
                </View>
              </Card>
            ))}
          </View>
        )}

        {/* Info educativa */}
        <Card style={[styles.infoCard, { backgroundColor: `${Colors.female}0A` }]}>
          <Text style={styles.infoTitle}>📚 Sobre tu ciclo</Text>
          <Text style={styles.infoText}>
            Tu ciclo menstrual dura aproximadamente <Text style={{ fontFamily: FontFamily.bold }}>{cycleLength} días</Text>.
          </Text>
          <Text style={styles.infoText}>
            Trackear tus síntomas ayuda a Vyra a adaptar tus planes de entrenamiento y nutrición a cada fase.
          </Text>
          <Text style={styles.infoText}>
            No reemplaza el consejo médico. Si tienes síntomas severos, consultá a tu médico.
          </Text>
        </Card>

      </ScrollView>
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: Spacing[3],
    paddingBottom: Spacing[5],
  },
  histBtn: {
    marginRight: Spacing[3],
  },
  histText: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.sm,
    color: Colors.brand,
  },
  privacyCard: {
    marginTop: Spacing[4],
    marginBottom: Spacing[2],
    borderWidth: 1,
    borderColor: `${Colors.brand}55`,
    backgroundColor: `${Colors.brand}12`,
  },
  privacyTitle: {
    fontSize: FontSize.sm,
    fontFamily: FontFamily.bold,
    color: Colors.brand,
    marginBottom: Spacing[1],
  },
  privacyText: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    lineHeight: 20,
    fontFamily: FontFamily.regular,
  },
  setupCard: {
    marginBottom: Spacing[2],
    borderWidth: 1,
    borderColor: `${Colors.female}55`,
    backgroundColor: `${Colors.female}10`,
  },
  setupTitle: {
    fontSize: FontSize.base,
    fontFamily: FontFamily.bold,
    color: Colors.textPrimary,
    marginBottom: Spacing[1],
  },
  setupText: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    fontFamily: FontFamily.regular,
    lineHeight: 20,
    marginBottom: Spacing[3],
  },
  setupChips: {
    flexDirection: 'row',
    gap: Spacing[2],
    marginBottom: Spacing[3],
  },
  setupChip: {
    flex: 1,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: `${Colors.female}55`,
    backgroundColor: Colors.bgSurface,
    paddingVertical: Spacing[2],
    alignItems: 'center',
  },
  setupChipActive: {
    backgroundColor: Colors.female,
    borderColor: Colors.female,
  },
  setupChipText: {
    fontSize: FontSize.sm,
    fontFamily: FontFamily.semibold,
    color: Colors.textSecondary,
  },
  setupChipTextActive: {
    color: Colors.white,
  },
  cycleSection: {
    alignItems: 'center',
    marginVertical: Spacing[4],
  },
  phaseEmoji: {
    fontSize: 48,
    marginBottom: Spacing[2],
  },
  phaseName: {
    fontSize: FontSize.lg,
    fontFamily: FontFamily.bold,
    marginBottom: Spacing[1],
  },
  cycleDay: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  nextPeriodCard: {
    marginTop: Spacing[3],
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[2],
    borderRadius: Radius.md,
    alignItems: 'center',
  },
  nextPeriodLabel: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    fontFamily: FontFamily.semibold,
  },
  nextPeriodDate: {
    fontSize: FontSize.lg,
    fontFamily: FontFamily.bold,
    marginTop: Spacing[1],
  },
  phaseInfoCard: {
    marginVertical: Spacing[3],
  },
  phaseInfoTitle: {
    fontSize: FontSize.base,
    fontFamily: FontFamily.bold,
    color: Colors.textPrimary,
    marginBottom: Spacing[2],
  },
  phaseInfoText: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginBottom: Spacing[1],
    lineHeight: 20,
  },
  guidanceCard: {
    marginBottom: Spacing[3],
    borderWidth: 1,
    borderColor: `${Colors.female}55`,
    backgroundColor: `${Colors.female}10`,
  },
  guidanceTitle: {
    fontSize: FontSize.sm,
    fontFamily: FontFamily.bold,
    color: Colors.female,
    marginBottom: Spacing[2],
  },
  guidanceText: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    lineHeight: 20,
    marginBottom: Spacing[1],
    fontFamily: FontFamily.medium,
  },
  guidanceMeta: {
    marginTop: Spacing[1],
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    fontFamily: FontFamily.regular,
    lineHeight: 17,
  },
  noticeCard: {
    marginBottom: Spacing[3],
    borderWidth: 1,
    borderColor: `${Colors.female}55`,
    backgroundColor: `${Colors.female}18`,
  },
  noticeTitle: {
    fontSize: FontSize.sm,
    fontFamily: FontFamily.bold,
    color: Colors.female,
    marginBottom: Spacing[1],
  },
  noticeText: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    lineHeight: 20,
    fontFamily: FontFamily.medium,
  },
  irregularCard: {
    marginBottom: Spacing[3],
    borderWidth: 1,
    borderColor: `${Colors.warning}66`,
    backgroundColor: `${Colors.warning}15`,
  },
  irregularTitle: {
    fontSize: FontSize.sm,
    fontFamily: FontFamily.bold,
    color: Colors.warning,
    marginBottom: Spacing[1],
  },
  irregularText: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    lineHeight: 20,
    fontFamily: FontFamily.medium,
  },
  logBtn: {
    marginVertical: Spacing[3],
  },
  formCard: {
    marginVertical: Spacing[3],
  },
  formTitle: {
    fontSize: FontSize.base,
    fontFamily: FontFamily.bold,
    marginBottom: Spacing[3],
  },
  symptomsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing[2],
    marginBottom: Spacing[4],
  },
  severityPanel: {
    marginBottom: Spacing[3],
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.lg,
    backgroundColor: Colors.bgSurface,
    padding: Spacing[3],
    gap: Spacing[2],
  },
  severityTitle: {
    fontSize: FontSize.sm,
    fontFamily: FontFamily.bold,
    color: Colors.textPrimary,
  },
  severityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing[2],
  },
  severitySymptom: {
    flex: 1,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    fontFamily: FontFamily.medium,
  },
  severityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[2],
  },
  severityBtn: {
    width: 28,
    height: 28,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.bgElevated,
  },
  severityBtnText: {
    fontSize: FontSize.base,
    color: Colors.textPrimary,
    fontFamily: FontFamily.bold,
  },
  severityValue: {
    width: 18,
    textAlign: 'center',
    fontSize: FontSize.sm,
    color: Colors.textPrimary,
    fontFamily: FontFamily.bold,
  },
  symptomTag: {
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[2],
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.bgElevated,
  },
  symptomText: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    fontFamily: FontFamily.semibold,
  },
  formActions: {
    flexDirection: 'row',
    gap: Spacing[3],
  },
  cancelBtn: {
    flex: 1,
  },
  saveBtn: {
    flex: 1,
  },
  historySection: {
    marginTop: Spacing[4],
  },
  historyTitle: {
    fontSize: FontSize.base,
    fontFamily: FontFamily.bold,
    marginBottom: Spacing[3],
  },
  historyCard: {
    marginBottom: Spacing[2],
  },
  historyEntry: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[3],
  },
  historyDate: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    fontFamily: FontFamily.semibold,
  },
  historyEmoji: {
    fontSize: 20,
  },
  historyPhase: {
    flex: 1,
    fontSize: FontSize.sm,
    fontFamily: FontFamily.semibold,
  },
  historySymptoms: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
  },
  infoCard: {
    marginTop: Spacing[4],
  },
  infoTitle: {
    fontSize: FontSize.base,
    fontFamily: FontFamily.bold,
    marginBottom: Spacing[3],
  },
  infoText: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    lineHeight: 20,
    marginBottom: Spacing[2],
  },
});
