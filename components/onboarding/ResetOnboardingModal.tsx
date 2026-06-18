/**
 * Reset Onboarding Modal
 * Allows user to restart onboarding flow without clearing AsyncStorage manually
 * Shows confirmation to prevent accidental resets
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, Alert } from 'react-native';
import { resetOnboardingInFlow } from '@/domain/onboarding/onboarding-storage';
import Button from '@/components/ui/Button';
import { Colors } from '@/constants/colors';
import { FontFamily, FontSize, Spacing, Radius } from '@/constants/theme';

interface ResetOnboardingModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm?: () => void; // Called after successful reset
}

export default function ResetOnboardingModal({
  visible,
  onClose,
  onConfirm,
}: ResetOnboardingModalProps) {
  const [isResetting, setIsResetting] = useState(false);

  const handleConfirmReset = async () => {
    try {
      setIsResetting(true);
      await resetOnboardingInFlow();
      Alert.alert(
        'Éxito',
        'Onboarding reiniciado. Puedes empezar de nuevo.',
        [
          {
            text: 'OK',
            onPress: () => {
              onClose();
              onConfirm?.();
            },
          },
        ]
      );
    } catch (error) {
      Alert.alert(
        'Error',
        'No pudimos reiniciar el onboarding. Intenta de nuevo.',
        [{ text: 'OK' }]
      );
      console.error('Error resetting onboarding:', error);
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <View style={styles.header}>
            <Text style={styles.headerIcon}>⚠️</Text>
          </View>

          <Text style={styles.title}>¿Empezar de nuevo?</Text>

          <Text style={styles.description}>
            Esto borrará tu progreso actual y tendrás que completar el onboarding desde el principio.
            {'\n\n'}
            <Text style={styles.emphasis}>
              Tus datos de la app no se perderán, solo tu progreso en la configuración inicial.
            </Text>
          </Text>

          <View style={styles.buttonGroup}>
            <Button
              label="Cancelar"
              onPress={onClose}
            variant="secondary"
            disabled={isResetting}
            style={styles.button}
          />

            <Button
              label="Empezar de nuevo"
              onPress={handleConfirmReset}
              variant="danger"
              loading={isResetting}
              disabled={isResetting}
              style={styles.button}
            />
          </View>

          <Text style={styles.footer}>
            💡 Esto es útil si quieres cambiar tu objetivo o configuración desde cero.
          </Text>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: Spacing.md,
  },
  modal: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.xl,
    maxWidth: 340,
    alignItems: 'center',
  },
  header: {
    marginBottom: Spacing.md,
  },
  headerIcon: {
    fontSize: 48,
  },
  title: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    fontFamily: FontFamily.bold,
    color: Colors.text,
    marginBottom: Spacing.md,
    textAlign: 'center',
  },
  description: {
    fontSize: FontSize.sm,
    fontFamily: FontFamily.regular,
    color: Colors.textSecondary,
    marginBottom: Spacing.lg,
    textAlign: 'center',
    lineHeight: 20,
  },
  emphasis: {
    fontWeight: '600',
    color: Colors.text,
  },
  buttonGroup: {
    width: '100%',
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  button: {
    width: '100%',
  },
  footer: {
    fontSize: FontSize.xs,
    fontFamily: FontFamily.regular,
    color: Colors.textSecondary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
