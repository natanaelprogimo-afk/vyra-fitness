import { useState } from 'react';
import { Pressable, StyleSheet, Text, View, Modal, Animated, Easing } from 'react-native';
import { Colors, withOpacity } from '@/constants/colors';
import { FontFamily, Spacing, Radius } from '@/constants/theme';

interface OnboardingTooltipProps {
  label: string;
  description: string;
}

export default function OnboardingTooltip({ label, description }: OnboardingTooltipProps) {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <Pressable onPress={() => setShowModal(true)} hitSlop={12}>
        <Text style={styles.icon}>ℹ️</Text>
      </Pressable>

      <Modal visible={showModal} transparent animationType="slide" onRequestClose={() => setShowModal(false)}>
        <Pressable style={styles.backdrop} onPress={() => setShowModal(false)}>
          <View style={styles.bottomSheet}>
            <View style={styles.handle} />
            <Text style={styles.sheetTitle}>{label}</Text>
            <Text style={styles.sheetBody}>{description}</Text>
            <Pressable onPress={() => setShowModal(false)} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>Entendido</Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  icon: {
    fontSize: 16,
    opacity: 0.6,
  },
  backdrop: {
    flex: 1,
    backgroundColor: withOpacity(Colors.black, 0.5),
    justifyContent: 'flex-end',
  },
  bottomSheet: {
    backgroundColor: Colors.surface1,
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    paddingHorizontal: Spacing[4],
    paddingTop: Spacing[2],
    paddingBottom: Spacing[4],
    maxHeight: '70%',
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: withOpacity(Colors.white, 0.2),
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: Spacing[2],
  },
  sheetTitle: {
    fontFamily: FontFamily.bold,
    fontSize: 16,
    color: Colors.textPrimary,
    marginBottom: Spacing[1.5],
  },
  sheetBody: {
    fontFamily: FontFamily.regular,
    fontSize: 14,
    lineHeight: 20,
    color: Colors.textSecondary,
    marginBottom: Spacing[3],
  },
  closeButton: {
    paddingVertical: Spacing[2],
    paddingHorizontal: Spacing[3],
    backgroundColor: Colors.secondary,
    borderRadius: Radius.md,
    alignItems: 'center',
  },
  closeButtonText: {
    fontFamily: FontFamily.semibold,
    fontSize: 14,
    color: Colors.white,
  },
});

