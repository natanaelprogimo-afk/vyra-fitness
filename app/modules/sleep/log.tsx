import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import Header from '@/components/layout/Header';
import SleepLogForm from '@/components/sleep/SleepLogForm';
import SafeScreen from '@/components/ui/SafeScreen';
import { Routes } from '@/constants/routes';
import { Spacing } from '@/constants/theme';
import { useSleep, type SleepLogInput } from '@/hooks/useSleep';

export default function SleepLogScreen() {
  const { goalHours, getOptimalAlarmTimes, isLogging, logSleepAsync } = useSleep();

  const handleSubmit = async (input: SleepLogInput) => {
    try {
      await logSleepAsync(input);
      router.replace(Routes.sleep.index);
    } catch {
      // The hook already surfaces the error through toast.
    }
  };

  return (
    <SafeScreen padHorizontal={false} padBottom>
      <Header title="Registrar sueno" showBack />

      <View style={styles.content}>
        <SleepLogForm
          goalHours={goalHours}
          isLogging={isLogging}
          getOptimalAlarmTimes={getOptimalAlarmTimes}
          onSubmit={handleSubmit}
        />
      </View>
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: Spacing[5],
    paddingBottom: Spacing[10],
  },
});
