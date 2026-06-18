import React, { useState } from 'react';
import {
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import BottomSheet from '@/components/ui/BottomSheet';
import Button from '@/components/ui/Button';
import { Colors } from '@/constants/colors';
import { FontFamily, Radius, Spacing } from '@/constants/theme';
import { Supplement } from '@/hooks/useSupplements';

const SUPPLEMENTS_ACCENT = Colors.supplements;

type Unit = Supplement['unit'];
type Freq = Supplement['frequency'];

const UNITS: Array<{ value: Unit; label: string }> = [
  { value: 'mg', label: 'mg' },
  { value: 'g', label: 'g' },
  { value: 'ml', label: 'ml' },
  { value: 'caps', label: 'Caps.' },
  { value: 'IU', label: 'UI' },
];

const FREQS: Array<{ value: Freq; label: string }> = [
  { value: 'daily', label: 'Diario' },
  { value: 'weekly', label: 'Semanal' },
  { value: 'as_needed', label: 'Según necesidad' },
];

const SHEET_HEIGHT = Math.min(Dimensions.get('window').height * 0.82, 720);

interface AddSupplementSheetProps {
  visible: boolean;
  onClose: () => void;
  onSave: (
    name: string,
    dose: number,
    unit: Unit,
    frequency: Freq,
    reminders: string[],
  ) => Promise<void>;
  saving: boolean;
}

export function AddSupplementSheet({
  visible,
  onClose,
  onSave,
  saving,
}: AddSupplementSheetProps) {
  const [name, setName] = useState('');
  const [dose, setDose] = useState('');
  const [unit, setUnit] = useState<Unit>('mg');
  const [frequency, setFrequency] = useState<Freq>('daily');

  const isValid = name.trim().length > 0 && parseFloat(dose) > 0;

  const resetForm = () => {
    setName('');
    setDose('');
    setUnit('mg');
    setFrequency('daily');
  };

  const handleSave = async () => {
    if (!isValid) return;
    await onSave(name.trim(), parseFloat(dose), unit, frequency, []);
    resetForm();
  };

  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      title="Agregar suplemento"
      snapHeight={SHEET_HEIGHT}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardWrap}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.fieldLabel}>Nombre</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Ej: Omega 3, Vitamina D, Creatina..."
            placeholderTextColor={Colors.textMuted}
            autoFocus={visible}
            maxLength={60}
          />

          <Text style={styles.fieldLabel}>Dosis</Text>
          <View style={styles.doseRow}>
            <TextInput
              style={[styles.input, styles.doseInput]}
              value={dose}
              onChangeText={setDose}
              keyboardType="decimal-pad"
              placeholder="0"
              placeholderTextColor={Colors.textMuted}
              selectTextOnFocus
            />

            <View style={styles.unitSelector}>
              {UNITS.map((option) => (
                <Pressable
                  key={option.value}
                  style={({ pressed }) => [
                    styles.unitPill,
                    unit === option.value && styles.unitPillActive,
                    pressed && styles.choicePressed,
                  ]}
                  onPress={() => setUnit(option.value)}
                  accessibilityRole="button"
                  accessibilityLabel={`Unidad ${option.label}`}
                >
                  <Text
                    style={[
                      styles.unitPillText,
                      unit === option.value && styles.unitPillTextActive,
                    ]}
                  >
                    {option.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          <Text style={styles.fieldLabel}>Frecuencia</Text>
          <View style={styles.freqRow}>
            {FREQS.map((option) => (
              <Pressable
                key={option.value}
                style={({ pressed }) => [
                  styles.freqBtn,
                  frequency === option.value && styles.freqBtnActive,
                  pressed && styles.choicePressed,
                ]}
                onPress={() => setFrequency(option.value)}
                accessibilityRole="button"
                accessibilityLabel={`Frecuencia ${option.label}`}
              >
                <Text
                  style={[
                    styles.freqBtnText,
                    frequency === option.value && styles.freqBtnTextActive,
                  ]}
                >
                  {option.label}
                </Text>
              </Pressable>
            ))}
          </View>

          <Button
            label={saving ? 'Guardando...' : 'Agregar suplemento'}
            onPress={handleSave}
            disabled={!isValid || saving}
            color={SUPPLEMENTS_ACCENT}
            style={styles.saveBtn}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  keyboardWrap: {
    flex: 1,
  },
  content: {
    gap: Spacing[3],
    paddingBottom: Spacing[8],
  },
  fieldLabel: {
    fontFamily: FontFamily.medium,
    fontSize: 14,
    color: Colors.textSecondary,
  },
  input: {
    backgroundColor: Colors.elevated,
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[3],
    fontFamily: FontFamily.regular,
    fontSize: 16,
    color: Colors.textPrimary,
  },
  doseRow: {
    gap: Spacing[3],
  },
  doseInput: {
    fontFamily: FontFamily.bold,
    fontSize: 20,
  },
  unitSelector: {
    flexDirection: 'row',
    gap: Spacing[2],
    flexWrap: 'wrap',
  },
  unitPill: {
    backgroundColor: Colors.elevated,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing[3],
    paddingVertical: 6,
  },
  unitPillActive: {
    backgroundColor: SUPPLEMENTS_ACCENT,
  },
  unitPillText: {
    fontFamily: FontFamily.medium,
    fontSize: 14,
    color: Colors.textSecondary,
  },
  unitPillTextActive: {
    color: '#fff',
  },
  freqRow: {
    flexDirection: 'row',
    gap: Spacing[2],
  },
  freqBtn: {
    flex: 1,
    backgroundColor: Colors.elevated,
    borderRadius: Radius.lg,
    paddingVertical: Spacing[3],
    alignItems: 'center',
  },
  freqBtnActive: {
    backgroundColor: SUPPLEMENTS_ACCENT,
  },
  freqBtnText: {
    fontFamily: FontFamily.medium,
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  freqBtnTextActive: {
    color: '#fff',
  },
  choicePressed: {
    opacity: 0.88,
  },
  saveBtn: {
    marginTop: Spacing[2],
    marginBottom: Spacing[2],
  },
});

export default AddSupplementSheet;

