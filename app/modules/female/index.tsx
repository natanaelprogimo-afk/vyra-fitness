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
    history, isInCycle,
  } = useFemaleHealth();

  const [showLogForm, setShowLogForm]       = useState(false);
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [notes, setNotes]                   = useState('');

  const phaseEmoji = PHASE_EMOJIS[currentPhase] || '❓';
  const phaseColor = PHASE_COLORS[currentPhase] || Colors.textSecondary;
  const phaseName = PHASE_NAMES[currentPhase] || 'Desconocido';

  const cycleProgress = ((daysInPhase + 1) / cycleLength) * 100;

  const currentDaySymptoms = history.length > 0 ? history[0].symptoms : [];

  const handleLogPeriod = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    log(currentPhase, selectedSymptoms, notes.trim() || undefined);
    setSelectedSymptoms([]);
    setNotes('');
    setShowLogForm(false);
  };

  const toggleSymptom = (symptom: string) => {
    setSelectedSymptoms((prev) =>
      prev.includes(symptom)
        ? prev.filter((s) => s !== symptom)
        : [...prev, symptom]
    );
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
