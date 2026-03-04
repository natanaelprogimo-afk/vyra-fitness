// app/profile/change-password.tsx
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput,
  TouchableOpacity, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Colors } from '@/constants/colors';
import { supabase } from '@/lib/supabase';

export default function ChangePasswordScreen() {
  const [newPass,    setNewPass]    = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [saving,     setSaving]     = useState(false);

  async function handleChange() {
    if (newPass.length < 8) {
      Alert.alert('Contraseña muy corta', 'Usá al menos 8 caracteres.');
      return;
    }
    if (newPass !== confirmPass) {
      Alert.alert('No coinciden', 'Las contraseñas no son iguales.');
      return;
    }
    setSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPass });
      if (error) throw error;
      Alert.alert('¡Listo!', 'Tu contraseña fue actualizada.', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch {
      Alert.alert('Error', 'No se pudo cambiar la contraseña. Intentá de nuevo.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.inner}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backBtn}>← Volver</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Cambiar contraseña</Text>

        <View style={styles.field}>
          <Text style={styles.label}>Nueva contraseña</Text>
          <TextInput
            style={styles.input}
            value={newPass}
            onChangeText={setNewPass}
            secureTextEntry
            placeholder="Mínimo 8 caracteres"
            placeholderTextColor={Colors.textMuted}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Confirmar contraseña</Text>
          <TextInput
            style={styles.input}
            value={confirmPass}
            onChangeText={setConfirmPass}
            secureTextEntry
            placeholder="Repetí la contraseña"
            placeholderTextColor={Colors.textMuted}
          />
        </View>

        <TouchableOpacity
          style={[styles.btn, saving && { opacity: 0.6 }]}
          onPress={handleChange}
          disabled={saving}
        >
          <Text style={styles.btnText}>{saving ? 'Guardando...' : 'Actualizar contraseña'}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bgPrimary },
  inner:     { padding: 20 },
  backBtn:   { color: Colors.brand, fontSize: 14, marginBottom: 16 },
  title:     { color: Colors.textPrimary, fontSize: 24, fontWeight: '800', marginBottom: 24 },
  field:     { marginBottom: 20 },
  label:     { color: Colors.textSecondary, fontSize: 13, fontWeight: '600', marginBottom: 8 },
  input: {
    backgroundColor: Colors.bgSurface, color: Colors.textPrimary,
    borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12,
    fontSize: 16, borderWidth: 1, borderColor: Colors.border,
  },
  btn: {
    backgroundColor: Colors.brand, borderRadius: 14,
    paddingVertical: 15, alignItems: 'center', marginTop: 8,
  },
  btnText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
});