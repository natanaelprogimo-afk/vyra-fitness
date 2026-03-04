// app/profile/export-data.tsx
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, Alert, Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Colors } from '@/constants/colors';
import { useAuthStore } from '@/stores/authStore';
import { supabase } from '@/lib/supabase';

const TABLES = [
  { key: 'profiles',         label: 'Perfil',                  emoji: '👤' },
  { key: 'water_logs',       label: 'Logs de agua',            emoji: '💧' },
  { key: 'step_logs',        label: 'Logs de pasos',           emoji: '🚶' },
  { key: 'fasting_logs',     label: 'Logs de ayuno',           emoji: '⏳' },
  { key: 'sleep_logs',       label: 'Logs de sueño',           emoji: '😴' },
  { key: 'meals',            label: 'Comidas registradas',     emoji: '🍎' },
  { key: 'weight_logs',      label: 'Logs de peso',            emoji: '⚖️' },
  { key: 'workout_sessions', label: 'Sesiones de entreno',     emoji: '💪' },
  { key: 'mental_checkins',  label: 'Check-ins mentales',      emoji: '🧠' },
  { key: 'daily_scores',     label: 'Daily Scores',            emoji: '📊' },
  { key: 'achievements',     label: 'Badges desbloqueados',    emoji: '🏆' },
  { key: 'coin_transactions',label: 'Transacciones de coins',  emoji: '🪙' },
];

export default function ExportDataScreen() {
  const { profile } = useAuthStore();
  const [isExporting, setIsExporting] = useState(false);
  const [progress,    setProgress]    = useState('');

  async function handleExport() {
    if (!profile?.id) return;
    setIsExporting(true);

    const exportData: Record<string, unknown[]> = {};

    try {
      for (const table of TABLES) {
        setProgress(`Exportando ${table.label}...`);
        const { data } = await supabase
          .from(table.key)
          .select('*')
          .eq('user_id', profile.id)
          .order('created_at', { ascending: true });

        exportData[table.key] = data ?? [];
      }

      const jsonString = JSON.stringify(
        {
          exported_at:   new Date().toISOString(),
          user_id:       profile.id,
          user_email:    profile.email,
          vyra_version:  '1.0.0',
          data:          exportData,
        },
        null,
        2
      );

      setProgress('');
      await Share.share({
        message: jsonString,
        title:   'Mis datos de Vyra Fitness',
      });
    } catch {
      Alert.alert('Error', 'No se pudieron exportar los datos. Intentá de nuevo.');
    } finally {
      setIsExporting(false);
      setProgress('');
    }
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backBtn}>← Volver</Text>
        </TouchableOpacity>
        <Text style={styles.title}>📦 Exportar mis datos</Text>
        <Text style={styles.subtitle}>
          Descargá todos tus datos personales en formato JSON. Este es tu derecho según GDPR Art. 20.
        </Text>

        {/* Lista de qué se incluye */}
        <View style={styles.tableList}>
          <Text style={styles.tableListTitle}>Se incluye en la exportación:</Text>
          {TABLES.map(table => (
            <View key={table.key} style={styles.tableRow}>
              <Text style={styles.tableEmoji}>{table.emoji}</Text>
              <Text style={styles.tableLabel}>{table.label}</Text>
            </View>
          ))}
        </View>

        {/* Nota de privacidad */}
        <View style={styles.note}>
          <Text style={styles.noteText}>
            ⚠️ El archivo contiene datos personales de salud. Guardalo en un lugar seguro y no lo compartás con terceros.
          </Text>
        </View>

        {/* Botón exportar */}
        <TouchableOpacity
          style={[styles.exportBtn, isExporting && { opacity: 0.6 }]}
          onPress={handleExport}
          disabled={isExporting}
        >
          <Text style={styles.exportBtnText}>
            {isExporting ? progress || 'Preparando...' : '📥 Descargar mis datos'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bgPrimary },
  scroll:    { padding: 20, paddingBottom: 40 },
  backBtn:   { color: Colors.brand, fontSize: 14, marginBottom: 16 },
  title:     { color: Colors.textPrimary, fontSize: 24, fontWeight: '800', marginBottom: 8 },
  subtitle:  { color: Colors.textSecondary, fontSize: 14, lineHeight: 20, marginBottom: 24 },
  tableList: {
    backgroundColor: Colors.bgSurface, borderRadius: 14, padding: 14,
    marginBottom: 16, borderWidth: 1, borderColor: Colors.border,
  },
  tableListTitle: {
    color: Colors.textSecondary, fontSize: 13, fontWeight: '600',
    marginBottom: 12, textTransform: 'uppercase', letterSpacing: 0.6,
  },
  tableRow:   { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 6 },
  tableEmoji: { fontSize: 18, width: 28 },
  tableLabel: { color: Colors.textPrimary, fontSize: 14 },
  note: {
    backgroundColor: Colors.warning + '15', borderRadius: 10, padding: 12,
    borderWidth: 1, borderColor: Colors.warning + '40', marginBottom: 24,
  },
  noteText:  { color: Colors.warning, fontSize: 13, lineHeight: 18 },
  exportBtn: {
    backgroundColor: Colors.brand, borderRadius: 14,
    paddingVertical: 15, alignItems: 'center',
  },
  exportBtnText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
});