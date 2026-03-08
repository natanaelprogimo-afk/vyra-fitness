import React, { useState } from 'react';
import {
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Share,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Colors } from '@/constants/colors';
import { useAuthStore } from '@/stores/authStore';
import { supabase } from '@/lib/supabase';

type ExportTable = {
  key: string;
  label: string;
  emoji: string;
  matchColumn: 'id' | 'user_id';
  orderColumn?: string;
};

const TABLES: ExportTable[] = [
  { key: 'profiles', label: 'Perfil', emoji: 'DB', matchColumn: 'id' },
  { key: 'water_logs', label: 'Logs de agua', emoji: 'H2O', matchColumn: 'user_id', orderColumn: 'logged_at' },
  { key: 'step_logs', label: 'Logs de pasos', emoji: 'STEP', matchColumn: 'user_id', orderColumn: 'logged_date' },
  { key: 'fasting_logs', label: 'Logs de ayuno', emoji: 'FAST', matchColumn: 'user_id', orderColumn: 'start_time' },
  { key: 'sleep_logs', label: 'Logs de sueno', emoji: 'ZZZ', matchColumn: 'user_id', orderColumn: 'end_time' },
  { key: 'meals', label: 'Comidas registradas', emoji: 'FOOD', matchColumn: 'user_id', orderColumn: 'logged_at' },
  { key: 'weight_logs', label: 'Logs de peso', emoji: 'KG', matchColumn: 'user_id', orderColumn: 'logged_at' },
  { key: 'mental_checkins', label: 'Check-ins mentales', emoji: 'MOOD', matchColumn: 'user_id', orderColumn: 'check_date' },
  { key: 'female_health_logs', label: 'Salud femenina', emoji: 'CYCLE', matchColumn: 'user_id', orderColumn: 'logged_at' },
  { key: 'workout_sessions', label: 'Sesiones de entreno', emoji: 'GYM', matchColumn: 'user_id', orderColumn: 'started_at' },
  { key: 'daily_scores', label: 'Daily scores', emoji: 'SCORE', matchColumn: 'user_id', orderColumn: 'date' },
  { key: 'achievements', label: 'Badges desbloqueados', emoji: 'BADGE', matchColumn: 'user_id', orderColumn: 'unlocked_at' },
  { key: 'coin_transactions', label: 'Transacciones de coins', emoji: 'COIN', matchColumn: 'user_id', orderColumn: 'created_at' },
  { key: 'ad_interactions', label: 'Interacciones de anuncios', emoji: 'ADS', matchColumn: 'user_id', orderColumn: 'viewed_at' },
  { key: 'supplements', label: 'Suplementos', emoji: 'SUP', matchColumn: 'user_id', orderColumn: 'created_at' },
  { key: 'supplement_logs', label: 'Tomas de suplementos', emoji: 'LOG', matchColumn: 'user_id', orderColumn: 'taken_at' },
  { key: 'user_subscriptions', label: 'Suscripciones', emoji: 'PAY', matchColumn: 'user_id', orderColumn: 'updated_at' },
  { key: 'deletion_requests', label: 'Solicitudes de borrado', emoji: 'DEL', matchColumn: 'user_id', orderColumn: 'created_at' },
];

async function fetchTable(table: ExportTable, userId: string) {
  let query = supabase
    .from(table.key)
    .select('*')
    .eq(table.matchColumn, userId);

  if (table.orderColumn) {
    query = query.order(table.orderColumn, { ascending: true });
  }

  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

export default function ExportDataScreen() {
  const { profile } = useAuthStore();
  const [isExporting, setIsExporting] = useState(false);
  const [progress, setProgress] = useState('');

  async function handleExport() {
    if (!profile?.id) return;
    setIsExporting(true);

    const exportData: Record<string, unknown> = {};

    try {
      let workoutSessionIds: string[] = [];

      for (const table of TABLES) {
        setProgress(`Exportando ${table.label}...`);
        const rows = await fetchTable(table, profile.id);
        exportData[table.key] = rows;

        if (table.key === 'workout_sessions') {
          workoutSessionIds = rows
            .map((row) =>
              typeof (row as { id?: unknown }).id === 'string'
                ? String((row as { id?: unknown }).id)
                : null,
            )
            .filter((value): value is string => Boolean(value));
        }
      }

      if (workoutSessionIds.length > 0) {
        setProgress('Exportando sets de entreno...');
        const { data: workoutSets, error: workoutSetsError } = await supabase
          .from('workout_sets')
          .select('*')
          .in('session_id', workoutSessionIds)
          .order('set_number', { ascending: true });

        if (workoutSetsError) throw workoutSetsError;
        exportData.workout_sets = workoutSets ?? [];
      } else {
        exportData.workout_sets = [];
      }

      const jsonString = JSON.stringify(
        {
          exported_at: new Date().toISOString(),
          user_id: profile.id,
          user_email: profile.email,
          vyra_version: '1.0.0',
          data: exportData,
        },
        null,
        2,
      );

      setProgress('');
      await Share.share({
        message: jsonString,
        title: 'Mis datos de Vyra Fitness',
      });
    } catch (error) {
      console.error('[export-data] failed', error);
      Alert.alert('Error', 'No se pudieron exportar todos los datos. Intenta de nuevo.');
    } finally {
      setIsExporting(false);
      setProgress('');
    }
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backBtn}>{'<- Volver'}</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Exportar mis datos</Text>
        <Text style={styles.subtitle}>
          Descarga tus datos personales en formato JSON. Incluye salud, pagos, coins y el historial relevante de tu cuenta.
        </Text>

        <View style={styles.tableList}>
          <Text style={styles.tableListTitle}>Se incluye en la exportacion</Text>
          {TABLES.map((table) => (
            <View key={table.key} style={styles.tableRow}>
              <Text style={styles.tableEmoji}>{table.emoji}</Text>
              <Text style={styles.tableLabel}>{table.label}</Text>
            </View>
          ))}
          <View style={styles.tableRow}>
            <Text style={styles.tableEmoji}>SET</Text>
            <Text style={styles.tableLabel}>Sets de entreno vinculados a tus sesiones</Text>
          </View>
        </View>

        <View style={styles.note}>
          <Text style={styles.noteText}>
            El archivo contiene datos personales y de salud. Guardalo en un lugar seguro y no lo compartas con terceros si no es necesario.
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.exportBtn, isExporting && { opacity: 0.6 }]}
          onPress={handleExport}
          disabled={isExporting}
        >
          <Text style={styles.exportBtnText}>
            {isExporting ? progress || 'Preparando...' : 'Descargar mis datos'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bgPrimary },
  scroll: { padding: 20, paddingBottom: 40 },
  backBtn: { color: Colors.brand, fontSize: 14, marginBottom: 16 },
  title: { color: Colors.textPrimary, fontSize: 24, fontWeight: '800', marginBottom: 8 },
  subtitle: { color: Colors.textSecondary, fontSize: 14, lineHeight: 20, marginBottom: 24 },
  tableList: {
    backgroundColor: Colors.bgSurface,
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  tableListTitle: {
    color: Colors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  tableRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 6 },
  tableEmoji: { fontSize: 12, width: 42, color: Colors.textMuted, fontWeight: '700' },
  tableLabel: { color: Colors.textPrimary, fontSize: 14, flex: 1 },
  note: {
    backgroundColor: Colors.warning + '15',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.warning + '40',
    marginBottom: 24,
  },
  noteText: { color: Colors.warning, fontSize: 13, lineHeight: 18 },
  exportBtn: {
    backgroundColor: Colors.brand,
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
  },
  exportBtnText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
});
