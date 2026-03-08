// app/profile/delete-account.tsx
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, TextInput, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Colors } from '@/constants/colors';
import { useAuthStore } from '@/stores/authStore';
import { supabase } from '@/lib/supabase';

export default function DeleteAccountScreen() {
  const { profile, logout } = useAuthStore();
  const [confirmation, setConfirmation] = useState('');
  const [isDeleting,   setIsDeleting]   = useState(false);

  const CONFIRM_PHRASE = 'ELIMINAR MI CUENTA';

  async function handleDelete() {
    if (confirmation !== CONFIRM_PHRASE) {
      Alert.alert('Texto incorrecto', `Escribí exactamente: ${CONFIRM_PHRASE}`);
      return;
    }

    Alert.alert(
      '⚠️ Confirmación final',
      'Esta acción es irreversible. Todos tus datos de salud, historial, monedas y badges serán eliminados permanentemente en 30 días.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Sí, eliminar',
          style: 'destructive',
          onPress: submitDeletionRequest,
        },
      ]
    );
  }

  async function submitDeletionRequest() {
    if (!profile?.id) return;
    setIsDeleting(true);
    try {
      // Insertar en deletion_requests (procesado en 30 días — GDPR)
      const { error } = await supabase.from('deletion_requests').insert({
        user_id:            profile.id,
        confirmation_token: Math.random().toString(36).slice(2),
        status:             'pending',
      });

      if (error) throw error;

      Alert.alert(
        'Solicitud enviada',
        'Tu solicitud de eliminación fue registrada. Tus datos serán eliminados en un máximo de 30 días según la normativa GDPR. Recibirás una confirmación por email.',
        [{ text: 'OK', onPress: () => logout() }]
      );
    } catch {
      Alert.alert('Error', 'No se pudo procesar tu solicitud. Contactá a soporte@vyrafitness.app');
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backBtn}>← Volver</Text>
        </TouchableOpacity>

        <Text style={styles.title}>⚠️ Eliminar cuenta</Text>
        <Text style={styles.subtitle}>
          Esta acción es irreversible. Lee todo antes de continuar.
        </Text>

        {/* Qué se elimina */}
        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>Qué se elimina en 30 días:</Text>
          {[
            'Todos tus logs de salud (agua, pasos, sueño, comidas, peso)',
            'Historial de entrenamientos y PRs',
            'Monedas VyraCoin, XP, badges y rachas',
            'Conversaciones con el Coach IA',
            'Datos de ciclo menstrual (si aplica)',
            'Tu cuenta de acceso a Vyra',
          ].map((item, i) => (
            <Text key={i} style={styles.infoItem}>• {item}</Text>
          ))}
        </View>

        {/* Alternativa */}
        <View style={styles.alternativeBox}>
          <Text style={styles.alternativeTitle}>¿Consideraste estas alternativas?</Text>
          <TouchableOpacity
            style={styles.alternativeBtn}
            onPress={() => router.push('/profile/export-data' as any)}
          >
            <Text style={styles.alternativeBtnText}>📦 Exportar mis datos antes</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.alternativeBtn}
            onPress={() => router.push('/premium/manage' as any)}
          >
            <Text style={styles.alternativeBtnText}>💳 Solo cancelar Premium</Text>
          </TouchableOpacity>
        </View>

        {/* Confirmación */}
        <View style={styles.confirmSection}>
          <Text style={styles.confirmLabel}>
            Para confirmar, escribí exactamente:
          </Text>
          <Text style={styles.confirmPhrase}>{CONFIRM_PHRASE}</Text>
          <TextInput
            style={[
              styles.confirmInput,
              confirmation === CONFIRM_PHRASE && styles.confirmInputValid,
            ]}
            value={confirmation}
            onChangeText={setConfirmation}
            placeholder="Escribí el texto aquí..."
            placeholderTextColor={Colors.textMuted}
            autoCapitalize="characters"
          />
        </View>

        <TouchableOpacity
          style={[
            styles.deleteBtn,
            confirmation !== CONFIRM_PHRASE && styles.deleteBtnDisabled,
            isDeleting && { opacity: 0.6 },
          ]}
          onPress={handleDelete}
          disabled={confirmation !== CONFIRM_PHRASE || isDeleting}
        >
          <Text style={styles.deleteBtnText}>
            {isDeleting ? 'Procesando...' : '🗑️ Eliminar mi cuenta'}
          </Text>
        </TouchableOpacity>

        <Text style={styles.gdprNote}>
          Derecho al olvido según GDPR Art. 17. Procesamos tu solicitud en máximo 30 días.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container:   { flex: 1, backgroundColor: Colors.bgPrimary },
  scroll:      { padding: 20, paddingBottom: 40 },
  backBtn:     { color: Colors.brand, fontSize: 14, marginBottom: 16 },
  title:       { color: Colors.error, fontSize: 24, fontWeight: '800', marginBottom: 8 },
  subtitle:    { color: Colors.textSecondary, fontSize: 14, lineHeight: 20, marginBottom: 24 },
  infoBox: {
    backgroundColor: Colors.error + '11', borderRadius: 12, padding: 14,
    borderWidth: 1, borderColor: Colors.error + '33', marginBottom: 16,
  },
  infoTitle:   { color: Colors.error, fontSize: 14, fontWeight: '700', marginBottom: 10 },
  infoItem:    { color: Colors.textSecondary, fontSize: 13, lineHeight: 22 },
  alternativeBox: {
    backgroundColor: Colors.bgSurface, borderRadius: 12, padding: 14,
    borderWidth: 1, borderColor: Colors.border, marginBottom: 24, gap: 8,
  },
  alternativeTitle: { color: Colors.textPrimary, fontSize: 14, fontWeight: '700', marginBottom: 4 },
  alternativeBtn: {
    backgroundColor: Colors.bgElevated, borderRadius: 10,
    paddingVertical: 10, paddingHorizontal: 12,
  },
  alternativeBtnText: { color: Colors.textPrimary, fontSize: 14 },
  confirmSection: { marginBottom: 20 },
  confirmLabel:   { color: Colors.textSecondary, fontSize: 13, marginBottom: 6 },
  confirmPhrase: {
    color: Colors.error, fontSize: 15, fontWeight: '700',
    fontFamily: 'monospace', marginBottom: 10, letterSpacing: 1,
  },
  confirmInput: {
    backgroundColor: Colors.bgSurface, color: Colors.textPrimary,
    borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12,
    fontSize: 15, borderWidth: 2, borderColor: Colors.border,
    letterSpacing: 1, fontFamily: 'monospace',
  },
  confirmInputValid: { borderColor: Colors.steps },
  deleteBtn: {
    backgroundColor: Colors.error, borderRadius: 14,
    paddingVertical: 15, alignItems: 'center', marginBottom: 12,
  },
  deleteBtnDisabled: { opacity: 0.4 },
  deleteBtnText:  { color: '#FFF', fontSize: 16, fontWeight: '700' },
  gdprNote:       { color: Colors.textMuted, fontSize: 12, textAlign: 'center', lineHeight: 17 },
});
