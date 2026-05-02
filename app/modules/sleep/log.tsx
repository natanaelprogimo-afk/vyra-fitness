import { router } from 'expo-router';
import { useState } from 'react';
import { Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import Header from '@/components/layout/Header';
import SleepLogForm from '@/components/sleep/SleepLogForm';
import Button from '@/components/ui/Button';
import SafeScreen from '@/components/ui/SafeScreen';
import { Colors } from '@/constants/colors';
import { Routes } from '@/constants/routes';
import { FontFamily, FontSize, Spacing } from '@/constants/theme';
import { useSleep, type SleepLogInput } from '@/hooks/useSleep';

export default function SleepLogScreen() {
  const [isImporting, setIsImporting] = useState(false);
  const { goalHours, getOptimalAlarmTimes, isLogging, logSleepAsync, importHealthConnectSessions } = useSleep();

  const handleSubmit = async (input: SleepLogInput) => {
    try {
      await logSleepAsync(input);
      router.replace(Routes.sleep.index);
    } catch {
      // The hook already surfaces the error through toast.
    }
  };

  const handleImport = async () => {
    if (Platform.OS !== 'android') return;
    setIsImporting(true);
    try {
      await importHealthConnectSessions();
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <SafeScreen padHorizontal={false} padBottom>
      <Header title="Registrar sueño" showBack />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {Platform.OS === 'android' ? (
          <View style={styles.importCard}>
            <Text style={styles.importTitle}>Importar desde Health Connect</Text>
            <Text style={styles.importBody}>
              Si ya registras sueño en otra app compatible, puedes traer esas sesiones aquí.
            </Text>
            <Button
              onPress={() => void handleImport()}
              variant="secondary"
              loading={isImporting}
              fullWidth
            >
              Importar sueño
            </Button>
          </View>
        ) : null}

        <SleepLogForm
          goalHours={goalHours}
          isLogging={isLogging}
          getOptimalAlarmTimes={getOptimalAlarmTimes}
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
    padding: Spacing[4],
    borderRadius: 20,
    backgroundColor: Colors.bgSurface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  importTitle: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.base,
    color: Colors.textPrimary,
  },
  importBody: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    lineHeight: 20,
    color: Colors.textSecondary,
  },
});
