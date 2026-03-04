import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  TouchableOpacity,
  Linking,
  Alert,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import SafeScreen from '@/components/ui/SafeScreen';
import { Header } from '@/components/layout/Header';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { Colors } from '@/constants/colors';
import { FontFamily, Spacing, Radius } from '@/constants/theme';
import { useNotifications, NotifPreferences } from '@/hooks/useNotifications';
import { useSettingsStore } from '@/stores/settingsStore';

interface NotifRow {
  key:         keyof NotifPreferences;
  emoji:       string;
  label:       string;
  description: string;
}

const NOTIF_ROWS: NotifRow[] = [
  {
    key:         'water',
    emoji:       '💧',
    label:       'Recordatorios de agua',
    description: '3 recordatorios diarios (9h, 13h, 17h)',
  },
  {
    key:         'mental',
    emoji:       '🧠',
    label:       'Check-in mental',
    description: 'Recordatorio matutino a las 8:30',
  },
  {
    key:         'sleep',
    emoji:       '😴',
    label:       'Hora de dormir',
    description: '30 minutos antes de tu objetivo de sueño',
  },
  {
    key:         'dailySummary',
    emoji:       '📊',
    label:       'Resumen del día',
    description: 'Notificación a las 21:00 con tu score',
  },
  {
    key:         'streakAtRisk',
    emoji:       '🔥',
    label:       'Racha en peligro',
    description: 'Aviso a las 20:00 si no registraste nada',
  },
  {
    key:         'supplements',
    emoji:       '💊',
    label:       'Recordatorios de suplementos',
    description: 'Según los horarios configurados por cada suplemento',
  },
  {
    key:         'workout',
    emoji:       '🏋️',
    label:       'Recordatorio de entreno',
    description: 'Aviso si no entrenaste en 3 días',
  },
];

export default function NotificationsScreen() {
  const {
    permissionGranted,
    loading,
    prefs,
    updatePref,
    savePrefs,
    disableAll,
  } = useNotifications();
  const settings = useSettingsStore();

  const handleMasterToggle = async (value: boolean) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (!value) {
      Alert.alert(
        'Desactivar notificaciones',
        'Desactivarás todas las notificaciones de Vyra. Podés volver a activarlas cuando quieras.',
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Desactivar',
            style: 'destructive',
            onPress: disableAll,
          },
        ],
      );
    } else {
      if (!permissionGranted) {
        Alert.alert(
          'Permisos necesarios',
          'Vyra necesita permisos de notificación. Podés habilitarlos en Ajustes > Aplicaciones > Vyra.',
          [
            { text: 'Cancelar', style: 'cancel' },
            {
              text: 'Abrir Ajustes',
              onPress: () => Linking.openSettings(),
            },
          ],
        );
        return;
      }
      settings.setNotificationsEnabled(true);
    }
  };

  return (
    <SafeScreen padHorizontal={false} padBottom>
      <Header title="Notificaciones" showBack color={Colors.brand} />

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Toggle maestro */}
        <Card style={styles.masterCard}>
          <View style={styles.masterRow}>
            <View style={styles.masterLeft}>
              <Text style={styles.masterLabel}>Notificaciones Vyra</Text>
              <Text style={styles.masterDesc}>
                {settings.notificationsEnabled
                  ? '✅ Activadas'
                  : '❌ Desactivadas'}
              </Text>
            </View>
            <Switch
              value={settings.notificationsEnabled ?? true}
              onValueChange={handleMasterToggle}
              trackColor={{ false: Colors.bgElevated, true: `${Colors.brand}80` }}
              thumbColor={settings.notificationsEnabled ? Colors.brand : Colors.textMuted}
            />
          </View>

          {!permissionGranted && (
            <TouchableOpacity
              style={styles.permissionWarning}
              onPress={() => Linking.openSettings()}
            >
              <Text style={styles.permissionWarningText}>
                ⚠️ Permiso del sistema desactivado — tocá para abrir Ajustes
              </Text>
            </TouchableOpacity>
          )}
        </Card>

        {/* Por tipo */}
        {settings.notificationsEnabled && (
          <>
            <Text style={styles.sectionTitle}>Qué notificaciones recibís</Text>
            <Card style={styles.card}>
              {NOTIF_ROWS.map((row) => (
                <View key={row.key} style={styles.row}>
                  <Text style={styles.rowEmoji}>{row.emoji}</Text>
                  <View style={styles.rowInfo}>
                    <Text style={styles.rowLabel}>{row.label}</Text>
                    <Text style={styles.rowDesc}>{row.description}</Text>
                  </View>
                  <Switch
                    value={prefs[row.key]}
                    onValueChange={(v) => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      updatePref(row.key, v);
                    }}
                    trackColor={{ false: Colors.bgElevated, true: `${Colors.brand}80` }}
                    thumbColor={prefs[row.key] ? Colors.brand : Colors.textMuted}
                  />
                </View>
              ))}
            </Card>

            <Button
              label={loading ? 'Guardando...' : 'Guardar preferencias'}
              onPress={savePrefs}
              disabled={loading}
              color={Colors.brand}
            />

            <Text style={styles.footer}>
              Las notificaciones locales funcionan sin internet. Los mensajes del coach IA
              y el resumen diario se envían desde nuestros servidores y requieren conexión.
            </Text>
          </>
        )}
      </ScrollView>
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingHorizontal: Spacing[5],
    paddingBottom: Spacing[10],
    paddingTop: Spacing[4],
    gap: Spacing[4],
  },
  masterCard: { gap: Spacing[3] },
  masterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  masterLeft: { flex: 1, gap: 4 },
  masterLabel: {
    fontFamily: FontFamily.bold,
    fontSize: 18,
    color: Colors.textPrimary,
  },
  masterDesc: {
    fontFamily: FontFamily.regular,
    fontSize: 13,
    color: Colors.textSecondary,
  },
  permissionWarning: {
    backgroundColor: `${Colors.warning}15`,
    borderRadius: Radius.lg,
    padding: Spacing[3],
  },
  permissionWarningText: {
    fontFamily: FontFamily.medium,
    fontSize: 13,
    color: Colors.warning,
    lineHeight: 18,
  },
  sectionTitle: {
    fontFamily: FontFamily.bold,
    fontSize: 12,
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    paddingHorizontal: Spacing[2],
  },
  card: { gap: 0, padding: 0, overflow: 'hidden' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[4],
    gap: Spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: `${Colors.border}60`,
  },
  rowEmoji: { fontSize: 20, width: 28, textAlign: 'center' },
  rowInfo: { flex: 1, gap: 3 },
  rowLabel: {
    fontFamily: FontFamily.bold,
    fontSize: 14,
    color: Colors.textPrimary,
  },
  rowDesc: {
    fontFamily: FontFamily.regular,
    fontSize: 12,
    color: Colors.textMuted,
    lineHeight: 17,
  },
  footer: {
    fontFamily: FontFamily.regular,
    fontSize: 12,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: 18,
  },
});