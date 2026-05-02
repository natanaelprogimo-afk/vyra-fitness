import React from 'react';
import { StyleSheet, Text } from 'react-native';
import { router } from 'expo-router';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { useFemaleHealth } from '@/hooks/useFemaleHealth';
import { useAuthStore } from '@/stores/authStore';
import { Colors } from '@/constants/colors';
import { Routes } from '@/constants/routes';
import { FontFamily, FontSize, Spacing } from '@/constants/theme';

type PhaseModule =
  | 'workout'
  | 'nutrition'
  | 'sleep'
  | 'water'
  | 'steps'
  | 'fasting'
  | 'recuperación'
  | 'weight';

const PHASE_LABELS: Record<string, string> = {
  menstrual: 'Menstrual',
  follicular: 'Folicular',
  ovulation: 'Ovulacion',
  luteal: 'Lutea',
};

function resolveModuleCopy(module: PhaseModule, guidance: ReturnType<typeof useFemaleHealth>['phaseGuidance']) {
  if (module === 'nutrition') return guidance.nutrition;
  if (module === 'water') {
    return guidance.hydrationBoostMl > 0
      ? `Hoy suma +${guidance.hydrationBoostMl}ml para sostener energía y estabilidad.`
      : 'Tu hidratación puede mantenerse estable hoy.';
  }
  if (module === 'fasting') return guidance.fasting;
  if (module === 'sleep') {
    return 'Prioriza regularidad nocturna: acostarte dentro de la misma ventana mejora energía y control de antojos.';
  }
  if (module === 'weight') {
    return guidance.weightContext ?? 'Las variaciones de peso pueden ser transitorias segun la fase.';
  }
  return guidance.training;
}

export default function PhaseContextCard({
  module,
  compact = false,
}: {
  module: PhaseModule;
  compact?: boolean;
}) {
  const profile = useAuthStore((state) => state.profile);
  const {
    currentPhase,
    phaseGuidance,
    imminentPhaseNotice,
    strictSensitiveMode,
    isInCycle,
  } = useFemaleHealth();

  if (!profile?.female_health_enabled) return null;

  if (!isInCycle) {
    return (
      <Card style={styles.card}>
        <Text style={styles.title}>Activa tu fase actual</Text>
        <Text style={styles.body}>
          Para que Vyra ajuste entreno, nutrición y recuperación, registra tu fase en el módulo femenino.
        </Text>
        <Button onPress={() => router.push(Routes.female.index as never)} variant="secondary" size="sm">
          Abrir seguimiento femenino
        </Button>
      </Card>
    );
  }

  const phaseLabel = PHASE_LABELS[currentPhase] ?? 'Ciclo';
  const message = strictSensitiveMode
    ? 'Contexto femenino activo. Ajustes automaticos limitados por privacidad.'
    : resolveModuleCopy(module, phaseGuidance);

  const cardStyle = [styles.card, ...(compact ? [styles.cardCompact] : [])];

  return (
    <Card style={cardStyle}>
      <Text style={styles.eyebrow}>Fase actual</Text>
      <Text style={styles.title}>{phaseLabel}</Text>
      <Text style={styles.body}>{message}</Text>
      {imminentPhaseNotice ? <Text style={styles.notice}>{imminentPhaseNotice}</Text> : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderColor: `${Colors.female}44`,
    backgroundColor: `${Colors.female}0F`,
    gap: Spacing[2],
  },
  cardCompact: {
    paddingVertical: Spacing[3],
  },
  eyebrow: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.xs,
    letterSpacing: 0.2,
    color: Colors.female,
  },
  title: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.base,
    color: Colors.textPrimary,
  },
  body: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    lineHeight: 19,
    color: Colors.textSecondary,
  },
  notice: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.xs,
    lineHeight: 18,
    color: Colors.female,
  },
});
