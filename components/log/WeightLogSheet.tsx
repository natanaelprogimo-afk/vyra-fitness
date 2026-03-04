import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import BottomSheet from '@/components/ui/BottomSheet';
import Button from '@/components/ui/Button';
import { Colors } from '@/constants/colors';
import { Spacing, Radius, FontFamily } from '@/constants/theme';

interface WeightLogSheetProps {
  visible: boolean;
  onClose: () => void;
  onSave: (weightKg: number, bodyFatPct?: number, note?: string) => Promise<void>;
  currentWeight: number | null;
}

export function WeightLogSheet({
  visible,
  onClose,
  onSave,
  currentWeight,
}: WeightLogSheetProps) {
  const [weightInput, setWeightInput] = useState('');
  const [fatInput, setFatInput] = useState('');
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (visible && currentWeight) {
      setWeightInput(currentWeight.toFixed(1));
    }
  }, [visible, currentWeight]);

  const handleSave = async () => {
    const weightKg = parseFloat(weightInput.replace(',', '.'));
    if (isNaN(weightKg) || weightKg < 20 || weightKg > 500) return;

    const bodyFat = fatInput ? parseFloat(fatInput.replace(',', '.')) : undefined;
    const validFat =
      bodyFat && !isNaN(bodyFat) && bodyFat > 0 && bodyFat < 100
        ? bodyFat
        : undefined;

    setSaving(true);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await onSave(weightKg, validFat, note.trim() || undefined);
    setSaving(false);

    // Reset
    setWeightInput('');
    setFatInput('');
    setNote('');
  };

  const isValid = () => {
    const w = parseFloat(weightInput.replace(',', '.'));
    return !isNaN(w) && w >= 20 && w <= 500;
  };

  return (
    <BottomSheet visible={visible} onClose={onClose} title="Registrar peso">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.content}>
          {/* Input principal peso */}
          <View style={styles.mainInputRow}>
            <TextInput
              style={styles.mainInput}
              value={weightInput}
              onChangeText={setWeightInput}
              keyboardType="decimal-pad"
              placeholder="0.0"
              placeholderTextColor={Colors.textMuted}
              autoFocus={visible}
              selectTextOnFocus
            />
            <Text style={styles.mainUnit}>kg</Text>
          </View>

          {/* Grasa corporal opcional */}
          <View style={styles.row}>
            <Text style={styles.fieldLabel}>% Grasa corporal</Text>
            <Text style={styles.optional}>(opcional)</Text>
          </View>
          <View style={styles.smallInputRow}>
            <TextInput
              style={styles.smallInput}
              value={fatInput}
              onChangeText={setFatInput}
              keyboardType="decimal-pad"
              placeholder="15.0"
              placeholderTextColor={Colors.textMuted}
            />
            <Text style={styles.smallUnit}>%</Text>
          </View>

          {/* Nota */}
          <View style={styles.row}>
            <Text style={styles.fieldLabel}>Nota</Text>
            <Text style={styles.optional}>(opcional)</Text>
          </View>
          <TextInput
            style={styles.noteInput}
            value={note}
            onChangeText={setNote}
            placeholder="Ej: Después del gym, antes de desayunar..."
            placeholderTextColor={Colors.textMuted}
            multiline
            maxLength={200}
          />

          <Button
            label={saving ? 'Guardando...' : 'Guardar peso'}
            onPress={handleSave}
            disabled={!isValid() || saving}
            color={Colors.weight}
            style={styles.saveBtn}
          />
        </View>
      </KeyboardAvoidingView>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: Spacing[3],
    paddingBottom: Spacing[4],
  },
  mainInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing[3],
    backgroundColor: Colors.bgElevated,
    borderRadius: Radius.xl,
    padding: Spacing[4],
  },
  mainInput: {
    fontFamily: FontFamily.bold,
    fontSize: 52,
    color: Colors.weight,
    textAlign: 'center',
    minWidth: 140,
  },
  mainUnit: {
    fontFamily: FontFamily.bold,
    fontSize: 24,
    color: Colors.textSecondary,
    paddingTop: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[2],
  },
  fieldLabel: {
    fontFamily: FontFamily.medium,
    fontSize: 14,
    color: Colors.textSecondary,
  },
  optional: {
    fontFamily: FontFamily.regular,
    fontSize: 12,
    color: Colors.textMuted,
  },
  smallInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.bgElevated,
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[3],
    gap: Spacing[2],
  },
  smallInput: {
    flex: 1,
    fontFamily: FontFamily.bold,
    fontSize: 24,
    color: Colors.textPrimary,
  },
  smallUnit: {
    fontFamily: FontFamily.medium,
    fontSize: 18,
    color: Colors.textSecondary,
  },
  noteInput: {
    backgroundColor: Colors.bgElevated,
    borderRadius: Radius.lg,
    padding: Spacing[4],
    fontFamily: FontFamily.regular,
    fontSize: 15,
    color: Colors.textPrimary,
    minHeight: 60,
    textAlignVertical: 'top',
  },
  saveBtn: {
    marginTop: Spacing[2],
  },
});