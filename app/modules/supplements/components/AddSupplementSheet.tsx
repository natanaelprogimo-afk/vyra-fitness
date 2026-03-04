import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import BottomSheet from '@/components/ui/BottomSheet';
import Button from '@/components/ui/Button';
import { Colors } from '@/constants/colors';
import { Spacing, Radius, FontFamily } from '@/constants/theme';
import { Supplement } from '@/hooks/useSupplements';

type Unit = Supplement['unit'];
type Freq = Supplement['frequency'];

const UNITS: { value: Unit; label: string }[] = [
  { value: 'mg', label: 'mg' },
  { value: 'g', label: 'g' },
  { value: 'ml', label: 'ml' },
  { value: 'caps', label: 'Cáps.' },
  { value: 'IU', label: 'UI' },
];

const FREQS: { value: Freq; label: string }[] = [
  { value: 'daily', label: 'Diario' },
  { value: 'weekly', label: 'Semanal' },
  { value: 'as_needed', label: 'Según necesidad' },
];

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

  const handleSave = async () => {
    if (!isValid) return;
    await onSave(name, parseFloat(dose), unit, frequency, []);
    setName('');
    setDose('');
    setUnit('mg');
    setFrequency('daily');
  };

  return (
    <BottomSheet visible={visible} onClose={onClose} title="Agregar suplemento">
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <View style={styles.content}>
          {/* Nombre */}
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

          {/* Dosis */}
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

            {/* Selector unidad */}
            <View style={styles.unitSelector}>
              {UNITS.map((u) => (
                <TouchableOpacity
                  key={u.value}
                  style={[styles.unitPill, unit === u.value && styles.unitPillActive]}
                  onPress={() => setUnit(u.value)}
                >
                  <Text
                    style={[
                      styles.unitPillText,
                      unit === u.value && styles.unitPillTextActive,
                    ]}
                  >
                    {u.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Frecuencia */}
          <Text style={styles.fieldLabel}>Frecuencia</Text>
          <View style={styles.freqRow}>
            {FREQS.map((f) => (
              <TouchableOpacity
                key={f.value}
                style={[
                  styles.freqBtn,
                  frequency === f.value && styles.freqBtnActive,
                ]}
                onPress={() => setFrequency(f.value)}
              >
                <Text
                  style={[
                    styles.freqBtnText,
                    frequency === f.value && styles.freqBtnTextActive,
                  ]}
                >
                  {f.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Button
            label={saving ? 'Guardando...' : 'Agregar suplemento'}
            onPress={handleSave}
            disabled={!isValid || saving}
            color={Colors.brand}
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
  fieldLabel: {
    fontFamily: FontFamily.medium,
    fontSize: 14,
    color: Colors.textSecondary,
  },
  input: {
    backgroundColor: Colors.bgElevated,
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
    backgroundColor: Colors.bgElevated,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing[3],
    paddingVertical: 6,
  },
  unitPillActive: {
    backgroundColor: Colors.brand,
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
    backgroundColor: Colors.bgElevated,
    borderRadius: Radius.lg,
    paddingVertical: Spacing[3],
    alignItems: 'center',
  },
  freqBtnActive: {
    backgroundColor: Colors.brand,
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
  saveBtn: {
    marginTop: Spacing[2],
  },
});