/**
 * Resume Onboarding Prompt
 * Shows when user returns to onboarding after abandoning
 * Offers to resume from where they left off or start fresh
 */

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { getLastCompletedStep, resetOnboardingInFlow } from '@/domain/onboarding/onboarding-storage';
import Button from '@/components/ui/Button';
import { Colors } from '@/constants/colors';
import { FontFamily, FontSize, Spacing, Radius } from '@/constants/theme';

interface ResumeOnboardingPromptProps {
  onResume: () => void; // Navigate to last step
  onStartFresh: () => void; // Clear and start from step 1
}

export default function ResumeOnboardingPrompt({
  onResume,
  onStartFresh,
}: ResumeOnboardingPromptProps) {
  const [lastStep, setLastStep] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadLastStep = async () => {
      try {
        const step = await getLastCompletedStep();
        setLastStep(step);
      } catch (error) {
        console.error('Error loading last step:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadLastStep();
  }, []);

  const handleStartFresh = async () => {
    try {
      await resetOnboardingInFlow();
      onStartFresh();
    } catch (error) {
      console.error('Error starting fresh:', error);
    }
  };

  if (isLoading) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Text style={styles.icon}>👋</Text>
        </View>

        <Text style={styles.title}>¡Bienvenido de vuelta!</Text>

        <Text style={styles.subtitle}>
          {lastStep
            ? `Retomamos desde donde dejaste: ${lastStep}`
            : 'Comenzamos de nuevo'}
        </Text>

        <View style={styles.buttonContainer}>
          <Button
            label="Continuar desde aquí"
            onPress={onResume}
            variant="primary"
            style={styles.button}
          />

          <Button
            label="Empezar de nuevo"
            onPress={handleStartFresh}
            variant="secondary"
            style={styles.button}
          />
        </View>

        <Text style={styles.hint}>
          💡 Tip: Todos los datos se guardan en tu teléfono
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    backgroundColor: Colors.surface,
  },
  content: {
    alignItems: 'center',
    maxWidth: 320,
  },
  iconContainer: {
    marginBottom: Spacing.lg,
  },
  icon: {
    fontSize: 64,
  },
  title: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    fontFamily: FontFamily.bold,
    color: Colors.text,
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: FontSize.sm,
    fontFamily: FontFamily.regular,
    color: Colors.textSecondary,
    marginBottom: Spacing.lg,
    textAlign: 'center',
    lineHeight: 20,
  },
  buttonContainer: {
    width: '100%',
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  button: {
    width: '100%',
  },
  hint: {
    fontSize: FontSize.xs,
    fontFamily: FontFamily.regular,
    color: Colors.textSecondary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
