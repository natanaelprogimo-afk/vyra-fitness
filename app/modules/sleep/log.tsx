import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Platform, ScrollView, StyleSheet, Text } from 'react-native';
import Header from '@/components/layout/Header';
import SleepModuleTabs from '@/components/sleep/SleepModuleTabs';
import SleepLogForm from '@/components/sleep/SleepLogForm';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import SafeScreen from '@/components/ui/SafeScreen';
import { Routes } from '@/constants/routes';
import { FontFamily, FontSize, Spacing } from '@/constants/theme';
import { useSleep, type SleepLogInput } from '@/hooks/useSleep';

export default function SleepLogScreen() {
  const params = useLocalSearchParams<{ entryId?: string; quick?: string; source?: string }>();
  const entryId = typeof params.entryId === 'string' ? params.entryId : '';
  const quickMode = params.quick === '1' || params.quick === 'true';
  const [isImporting, setIsImporting] = useState(false);
  const {
    goalHours,
    history,
    getOptimalAlarmTimes,
    isLogging,
    isUpdatingSleep,
    logSleepAsync,
    updateSleepAsync,
    importHealthConnectSessions,
  } = useSleep();
  const editingEntry = history.find((entry) => entry.id === entryId) ?? null;
  const editingInitialValues = editingEntry
    ? {
        bedtime: new Date(editingEntry.start_time),
        wakeTime: new Date(editingEntry.end_time),
        quality: Math.min(5, Math.max(1, Math.round((editingEntry.quality_score ?? 60) / 20))),
        deepSleep: Math.round((editingEntry.deep_min / Math.max(1, editingEntry.duration_min)) * 100),
        remSleep: Math.round((editingEntry.rem_min / Math.max(1, editingEntry.duration_min)) * 100),
        notes: editingEntry.notes ?? undefined,
      }
    : null;

  const handleSubmit = async (input: SleepLogInput) => {
    try {
      if (editingEntry) {
        await updateSleepAsync({ ...input, entryId: editingEntry.id });
        router.replace(Routes.sleep.history);
        return;
      }

      await logSleepAsync(input);
      router.replace(Routes.sleep.index);
    } catch {
      // The hook already surfaces the error through toast.
    }
  };

  const handleImport = async () => {
    setIsImporting(true);
    try {
      await importHealthConnectSessions();
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <SafeScreen padHorizontal={false} padBottom>
      <Header
        title={editingEntry ? 'Editar sueño' : quickMode ? 'Registro rápido' : 'Registrar sueño'}
        showBack
      />
      <SleepModuleTabs active="log" />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {Platform.OS === 'android' && !editingEntry && !quickMode ? (
          <Card style={styles.importCard}>
            <Text style={styles.importTitle}>Importar desde Health Connect</Text>
            <Text style={styles.importBody}>
              Si ya registras sueño en otra app compatible, puedes traer esas sesiones aquí.
            </Text>
            <Text style={styles.importHint}>
              Si ya cargaste esa misma noche manualmente, revisa tus últimos registros antes de importar para evitar duplicados.
            </Text>
            <Button
              onPress={() => void handleImport()}
              variant="secondary"
              loading={isImporting}
              fullWidth
            >
              Importar sueño
            </Button>
          </Card>
        ) : null}

        <SleepLogForm
          goalHours={goalHours}
          isLogging={isLogging || isUpdatingSleep}
          getOptimalAlarmTimes={getOptimalAlarmTimes}
          initialValues={editingInitialValues}
          compactMode={quickMode && !editingEntry}
          submitLabel={editingEntry ? 'Guardar cambios' : 'Guardar sueño'}
          showCancel={Boolean(editingEntry)}
          onCancel={() => router.replace(Routes.sleep.history)}
          onSubmit={handleSubmit}
        />
      </ScrollView>
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: Spacing[5],
    paddingBottom: Spacing[10],
    gap: Spacing[4],
  },
  importCard: {
    gap: Spacing[3],
  },
  importTitle: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.base,
    color: '#FFFFFF',
  },
  importBody: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    lineHeight: 20,
    color: '#D9D9E3',
  },
  importHint: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    lineHeight: 18,
    color: '#9AA0B8',
  },
});
