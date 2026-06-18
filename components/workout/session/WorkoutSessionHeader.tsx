import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, withOpacity } from '@/constants/colors';
import { FontFamily, FontSize, Radius, Spacing } from '@/constants/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface WorkoutSessionHeaderProps {
  progressWidth: string | number;
  elapsedSeconds: number;
  onCancel: () => void;
  onToggleFullscreen: () => void;
}

export function WorkoutSessionHeader({
  progressWidth,
  elapsedSeconds,
  onCancel,
  onToggleFullscreen,
}: WorkoutSessionHeaderProps) {
  const insets = useSafeAreaInsets();

  const hours = Math.floor(elapsedSeconds / 3600);
  const minutes = Math.floor((elapsedSeconds % 3600) / 60);
  const seconds = elapsedSeconds % 60;

  let timeDisplay = '';
  if (hours > 0) {
    timeDisplay = `${hours}:${minutes.toString().padStart(2, '0')}:${seconds
      .toString()
      .padStart(2, '0')}`;
  } else {
    timeDisplay = `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  return (
    <View style={[styles.header, { paddingTop: insets.top + Spacing[3] }]}>
      <Pressable
        onPress={onCancel}
        style={styles.headerButton}
        accessibilityRole="button"
        accessibilityLabel="Cancelar sesión"
        accessibilityHint="Abre una confirmación antes de descartar esta sesión."
      >
        <Ionicons name="close" size={24} color={Colors.textSecondary} />
      </Pressable>

      <View style={styles.timerWrap}>
        <Text style={styles.timerText}>{timeDisplay}</Text>
      </View>

      <Pressable
        onPress={onToggleFullscreen}
        style={styles.headerButton}
        accessibilityRole="button"
        accessibilityLabel="Pantalla completa"
        accessibilityHint="Oculta la barra de estado y el encabezado."
      >
        <Ionicons name="expand" size={24} color={Colors.textSecondary} />
      </Pressable>

      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: progressWidth } as any]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: Colors.bgPrimary,
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[3],
    gap: Spacing[3],
  },
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timerWrap: {
    alignItems: 'center',
  },
  timerText: {
    fontFamily: FontFamily.mono,
    fontSize: FontSize.lg,
    color: Colors.textPrimary,
  },
  progressBar: {
    height: 4,
    borderRadius: Radius.full,
    backgroundColor: withOpacity(Colors.white, 0.08),
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.secondary,
    borderRadius: Radius.full,
  },
});
