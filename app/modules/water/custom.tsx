// ============================================================
// VYRA FITNESS — Agua: Cantidad Personalizada
// ============================================================

import { useState } from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import SafeScreen from '@/components/ui/SafeScreen';
import Header from '@/components/layout/Header';
import Button from '@/components/ui/Button';
import { useWater } from '@/hooks/useWater';
import { validateWaterAmount } from '@/utils/validators';
import { Colors } from '@/constants/colors';
import { FontSize, FontFamily, Spacing, Radius } from '@/constants/theme';

export default function WaterCustomScreen() {
  const { logWater, isLogging } = useWater();
  const [amount, setAmount] = useState('');
  const [error,  setError]  = useState<string | null>(null);

  const handleLog = async () => {
    const ml  = parseInt(amount);
    const err = validateWaterAmount(ml);
    if (err) { setError(err); return; }
    setError(null);
    logWater(ml);
    router.back();
  };

  return (
    <SafeScreen>
      <Header title="Cantidad personalizada" showBack />
      <View style={styles.container}>
        <Text style={styles.emoji}>💧</Text>
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            value={amount}
            onChangeText={setAmount}
            keyboardType="numeric"
            placeholder="0"
            placeholderTextColor={Colors.textMuted}
            autoFocus
            selectTextOnFocus
            maxLength={4}
          />
          <Text style={styles.unit}>ml</Text>
        </View>
        {error && <Text style={styles.error}>{error}</Text>}
        <Text style={styles.hint}>Entre 50ml y 5000ml</Text>
        <Button
          onPress={handleLog}
          variant="primary"
          fullWidth
          size="lg"
          loading={isLogging}
          disabled={!amount}
          style={styles.cta}
        >
          Registrar
        </Button>
      </View>
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', paddingTop: Spacing[10] },
  emoji:     { fontSize: 64, marginBottom: Spacing[6] },
  inputRow:  { flexDirection: 'row', alignItems: 'baseline', gap: Spacing[2] },
  input: {
    fontFamily:  FontFamily.bold,
    fontSize:    72,
    color:       Colors.water,
    textAlign:   'center',
    minWidth:    120,
  },
  unit:  { fontFamily: FontFamily.bold, fontSize: FontSize['2xl'], color: Colors.textSecondary },
  error: { fontFamily: FontFamily.regular, fontSize: FontSize.sm, color: Colors.error, marginTop: Spacing[2] },
  hint:  { fontFamily: FontFamily.regular, fontSize: FontSize.sm, color: Colors.textMuted, marginTop: Spacing[2] },
  cta:   { marginTop: Spacing[8], width: '100%' },
});