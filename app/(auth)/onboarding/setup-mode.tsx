import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import OnboardingShell from '@/components/onboarding/OnboardingShell';
import Button from '@/components/ui/Button';
import { Colors, withOpacity } from '@/constants/colors';
import { Routes } from '@/constants/routes';
import { FontFamily, FontSize, Radius, Spacing } from '@/constants/theme';
import {
  getFirstIncompleteOnboardingRoute,
  getAccessibleOnboardingRoute,
} from '@/lib/onboarding-v2';
import {
  loadOnboardingProgress,
  saveOnboardingProgress,
  type OnboardingDraft,
} from '@/lib/onboarding-storage';

export default function SetupModeScreen() {
  const [draft, setDraft] = useState<OnboardingDraft | null>(null);
  const [selectedMode, setSelectedMode] = useState<'express' | 'full' | null>(null);

  useEffect(() => {
    let active = true;

    void (async () => {
      const progress = await loadOnboardingProgress();
      if (!active) return;

      // If user has already progressed past setup, go to next step
      if (progress.data?.goal_detail) {
        const nextRoute =
          getFirstIncompleteOnboardingRoute(progress.data) || Routes.tabs.home;
        router.replace(nextRoute as never);
        return;
      }

      setDraft(progress.data ?? null);
    })();

    return () => {
      active = false;
    };
  }, []);

  const handleSelectMode = async () => {
    if (!selectedMode) return;

    if (selectedMode === 'express') {
      // Express mode: skip to express flow
      router.push(Routes.auth.onboarding.expressGoal as never);
    } else {
      // Full mode: start regular onboarding
      router.push(Routes.auth.onboarding.goal as never);
    }
  };

  return (
    <OnboardingShell
      pathname={Routes.auth.onboarding.goal}
      eyebrow="Bienvenido a VYRA"
      title="¿Cómo querés comenzar?"
      subtitle="Elige tu experiencia de onboarding."
      scrollable={false}
      contentStyle={styles.content}
      footer={
        <Button
          onPress={handleSelectMode}
          disabled={!selectedMode}
          fullWidth
          size="md"
          haptic="medium"
        >
          Comenzar
        </Button>
      }
    >
      <View style={styles.optionsContainer}>
        {/* Express Mode Card */}
        <Pressable
          style={[
            styles.modeCard,
            selectedMode === 'express' && styles.modeCardActive,
          ]}
          onPress={() => setSelectedMode('express')}
        >
          <View style={styles.modeHeader}>
            <Text style={styles.modeEmoji}>⚡</Text>
            {selectedMode === 'express' && <View style={styles.checkmark} />}
          </View>
          <Text style={styles.modeTitle}>Exprés</Text>
          <Text style={styles.modeDescription}>
            3 pasos. Configuración automática basada en tu objetivo. Ajusta después.
          </Text>
          <View style={styles.modeBenefits}>
            <Text style={styles.modeBenefit}>✓ Rápido y simple</Text>
            <Text style={styles.modeBenefit}>✓ Todos los módulos activos</Text>
            <Text style={styles.modeBenefit}>✓ Personalización posterior</Text>
          </View>
        </Pressable>

        {/* Full Mode Card */}
        <Pressable
          style={[
            styles.modeCard,
            selectedMode === 'full' && styles.modeCardActive,
          ]}
          onPress={() => setSelectedMode('full')}
        >
          <View style={styles.modeHeader}>
            <Text style={styles.modeEmoji}>⚙️</Text>
            {selectedMode === 'full' && <View style={styles.checkmark} />}
          </View>
          <Text style={styles.modeTitle}>Completo</Text>
          <Text style={styles.modeDescription}>
            12 pasos. Configuración detallada. Máxima personalización desde el inicio.
          </Text>
          <View style={styles.modeBenefits}>
            <Text style={styles.modeBenefit}>✓ Control total</Text>
            <Text style={styles.modeBenefit}>✓ Configura cada detalle</Text>
            <Text style={styles.modeBenefit}>✓ Especifica restricciones</Text>
          </View>
        </Pressable>
      </View>

      <Text style={styles.helpText}>
        💡 Podés cambiar estas opciones en cualquier momento desde Ajustes.
      </Text>
    </OnboardingShell>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: Spacing[2],
    paddingTop: Spacing[1],
    paddingBottom: Spacing[1],
  },
  optionsContainer: {
    gap: Spacing[2],
  },
  modeCard: {
    borderRadius: Radius.lg,
    borderWidth: 2,
    borderColor: withOpacity(Colors.white, 0.08),
    backgroundColor: withOpacity(Colors.surface2, 0.92),
    paddingHorizontal: Spacing[2.5],
    paddingVertical: Spacing[2.5],
    gap: Spacing[1.5],
  },
  modeCardActive: {
    borderColor: withOpacity(Colors.secondary, 0.46),
    backgroundColor: withOpacity(Colors.secondary, 0.12),
  },
  modeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modeEmoji: {
    fontSize: 28,
  },
  checkmark: {
    width: 20,
    height: 20,
    borderRadius: Radius.full,
    backgroundColor: Colors.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modeTitle: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.lg,
    color: Colors.textPrimary,
  },
  modeDescription: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    lineHeight: 18,
    color: Colors.textSecondary,
  },
  modeBenefits: {
    gap: Spacing[0.5],
    marginTop: Spacing[1],
  },
  modeBenefit: {
    fontFamily: FontFamily.medium,
    fontSize: 11,
    color: Colors.textMuted,
    lineHeight: 14,
  },
  helpText: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    lineHeight: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: Spacing[1],
  },
});
