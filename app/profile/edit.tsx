// app/profile/edit.tsx
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TextInput, TouchableOpacity, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Colors } from '@/constants/colors';
import { useAuthStore } from '@/stores/authStore';
import { supabase } from '@/lib/supabase';

export default function EditProfileScreen() {
  const { profile, setProfile } = useAuthStore();

  const [name,      setName]      = useState(profile?.name ?? '');
  const [coachName, setCoachName] = useState(profile?.coach_name_preference ?? 'Vyra');
  const [saving,    setSaving]    = useState(false);

  async function handleSave() {
    if (!profile?.id || !name.trim()) return;
    setSaving(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({ name: name.trim(), coach_name_preference: coachName.trim() || 'Vyra' })
        .eq('id', profile.id)
        .select()
        .single();

      if (error) throw error;
      setProfile(data);
      router.back();
    } catch {
      Alert.alert('Error', 'No se pudo guardar. Intentá de nuevo.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.backBtn}>← Volver</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Editar perfil</Text>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Tu nombre</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="¿Cómo te llamás?"
            placeholderTextColor={Colors.textMuted}
            maxLength={50}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Nombre del coach IA</Text>
          <TextInput
            style={styles.input}
            value={coachName}
            onChangeText={setCoachName}
            placeholder="Vyra"
            placeholderTextColor={Colors.textMuted}
            maxLength={20}
          />
          <Text style={styles.hint}>
            Así te va a llamar el coach en los mensajes. Por defecto: Vyra.
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.saveBtn, saving && { opacity: 0.6 }]}
          onPress={handleSave}
          disabled={saving}
        >
          <Text style={styles.saveBtnText}>
            {saving ? 'Guardando...' : 'Guardar cambios'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container:  { flex: 1, backgroundColor: Colors.bgPrimary },
  scroll:     { padding: 20 },
  header:     { marginBottom: 28 },
  backBtn:    { color: Colors.brand, fontSize: 14, marginBottom: 12 },
  title:      { color: Colors.textPrimary, fontSize: 24, fontWeight: '800' },
  field:      { marginBottom: 20 },
  label:      { color: Colors.textSecondary, fontSize: 13, fontWeight: '600', marginBottom: 8 },
  input: {
    backgroundColor: Colors.bgSurface,
    color:           Colors.textPrimary,
    borderRadius:    12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize:        16,
    borderWidth:     1,
    borderColor:     Colors.border,
  },
  hint: { color: Colors.textMuted, fontSize: 12, marginTop: 6 },
  saveBtn: {
    backgroundColor: Colors.brand,
    borderRadius:    14,
    paddingVertical: 15,
    alignItems:      'center',
    marginTop:       12,
  },
  saveBtnText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
});