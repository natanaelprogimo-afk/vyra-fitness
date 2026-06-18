/**
 * Editable Summary Field Component
 * Used in step-ready to allow users to click on fields and edit them
 * Without navigating away from the review screen
 * 
 * Future enhancement: Could implement a modal editor or deep links to specific steps
 */

import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Colors } from '@/constants/colors';
import { FontFamily, FontSize, Spacing, Radius } from '@/constants/theme';

interface EditableSummaryFieldProps {
  label: string;
  value: string | number;
  icon?: string;
  editableHint?: string;
  onEdit?: () => void; // Called when user taps to edit
  isEditable?: boolean;
}

/**
 * Editable field for the summary review step
 * Allows user to see all configuration at a glance
 * and quickly edit any field without navigating back through steps
 */
export default function EditableSummaryField({
  label,
  value,
  icon,
  editableHint = 'Toca para editar',
  onEdit,
  isEditable = true,
}: EditableSummaryFieldProps) {
  return (
    <Pressable
      onPress={isEditable ? onEdit : undefined}
      disabled={!isEditable || !onEdit}
      style={({ pressed }) => [
        styles.container,
        isEditable && pressed && styles.containerPressed,
      ]}
    >
      <View style={styles.content}>
        <View style={styles.labelRow}>
          {icon && <Text style={styles.icon}>{icon}</Text>}
          <Text style={styles.label}>{label}</Text>
          {isEditable && <Text style={styles.editIndicator}>✏️</Text>}
        </View>

        <View style={styles.valueRow}>
          <Text style={styles.value} numberOfLines={2}>
            {value}
          </Text>
          {isEditable && !onEdit && (
            <Text style={styles.hint}>{editableHint}</Text>
          )}
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surface2,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    marginVertical: Spacing.sm,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  containerPressed: {
    backgroundColor: Colors.surface3,
    borderColor: Colors.primary,
  },
  content: {
    gap: Spacing.sm,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  icon: {
    fontSize: FontSize.md,
  },
  label: {
    fontSize: FontSize.xs,
    fontFamily: FontFamily.semibold,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    flex: 1,
    letterSpacing: 0.5,
  },
  editIndicator: {
    fontSize: FontSize.sm,
    marginLeft: 'auto',
  },
  valueRow: {
    gap: Spacing.xs,
  },
  value: {
    fontSize: FontSize.md,
    fontFamily: FontFamily.semibold,
    color: Colors.text,
  },
  hint: {
    fontSize: FontSize.xs,
    fontFamily: FontFamily.regular,
    color: Colors.textSecondary,
    fontStyle: 'italic',
  },
});
