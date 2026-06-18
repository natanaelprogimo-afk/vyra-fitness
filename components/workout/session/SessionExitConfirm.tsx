import React from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Button from '@/components/ui/Button';
import { Colors, withOpacity } from '@/constants/colors';
import { FontFamily, FontSize, Radius, Spacing } from '@/constants/theme';

interface SessionExitConfirmProps {
  visible: boolean;
  actionType: 'cancel' | 'finish';
  actionBusy: boolean;
  onConfirm: () => void;
  onDismiss: () => void;
}

export function SessionExitConfirm({
  visible,
  actionType,
  actionBusy,
  onConfirm,
  onDismiss,
}: SessionExitConfirmProps) {
  const isFinish = actionType === 'finish';
  const title = isFinish ? '¿Terminar sesión?' : '¿Cancelar sesión?';
  const description = isFinish
    ? 'Se guardará tu progreso y podrás ver el resumen.'
    : 'Se descartarán todos los sets no guardados.';

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onDismiss}
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <View style={styles.iconWrap}>
            <Ionicons
              name={isFinish ? 'checkmark-circle' : 'warning'}
              size={48}
              color={isFinish ? Colors.success : Colors.warning}
            />
          </View>

          <Text style={styles.title}>{title}</Text>
          <Text style={styles.description}>{description}</Text>

          <View style={styles.actions}>
            <Button
              onPress={onDismiss}
              variant="secondary"
              disabled={actionBusy}
              style={styles.button}
            >
              Volver
            </Button>
            <Button
              onPress={onConfirm}
              variant="primary"
              color={isFinish ? Colors.success : Colors.warning}
              loading={actionBusy}
              disabled={actionBusy}
              style={styles.button}
            >
              {isFinish ? 'Terminar' : 'Cancelar'}
            </Button>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: withOpacity(Colors.bgPrimary, 0.8),
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    width: '80%',
    maxWidth: 320,
    borderRadius: Radius.xl,
    backgroundColor: Colors.bgSurface,
    paddingHorizontal: Spacing[5],
    paddingVertical: Spacing[5],
    gap: Spacing[4],
    alignItems: 'center',
  },
  iconWrap: {
    width: 80,
    height: 80,
    borderRadius: Radius.full,
    backgroundColor: Colors.elevated,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.lg,
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  description: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  actions: {
    width: '100%',
    flexDirection: 'row',
    gap: Spacing[3],
  },
  button: {
    flex: 1,
  },
});
