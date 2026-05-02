import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import BottomSheet from '@/components/ui/BottomSheet';
import Button, { type ButtonVariant } from '@/components/ui/Button';
import { Colors } from '@/constants/colors';
import { FontFamily, FontSize, Spacing } from '@/constants/theme';

interface ConfirmationSheetProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  body: string;
  confirmLabel: string;
  onConfirm: () => void;
  confirmVariant?: ButtonVariant;
  confirmColor?: string;
  cancelLabel?: string;
  loading?: boolean;
  snapHeight?: number;
}

export default function ConfirmationSheet({
  visible,
  onClose,
  title,
  body,
  confirmLabel,
  onConfirm,
  confirmVariant = 'primary',
  confirmColor,
  cancelLabel = 'Cancelar',
  loading = false,
  snapHeight = 320,
}: ConfirmationSheetProps) {
  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      title={title}
      snapHeight={snapHeight}
      showClose
    >
      <View style={styles.content}>
        <Text style={styles.body}>{body}</Text>

        <View style={styles.actions}>
          <Button
            onPress={onConfirm}
            variant={confirmVariant}
            color={confirmColor}
            loading={loading}
            fullWidth
          >
            {confirmLabel}
          </Button>
          <Button onPress={onClose} variant="secondary" fullWidth disabled={loading}>
            {cancelLabel}
          </Button>
        </View>
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    gap: Spacing[4],
    paddingBottom: Spacing[5],
  },
  body: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    lineHeight: 20,
    color: Colors.textSecondary,
  },
  actions: {
    gap: Spacing[2],
  },
});
