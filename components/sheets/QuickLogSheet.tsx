import { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import BottomSheet from '@/components/ui/BottomSheet';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import SleepLogForm from '@/components/sleep/SleepLogForm';
import { Colors, withOpacity } from '@/constants/colors';
import { Routes } from '@/constants/routes';
import { FontFamily, FontSize, Radius, Spacing } from '@/constants/theme';
import { useFasting } from '@/hooks/useFasting';
import { useSleep } from '@/hooks/useSleep';
import { useWater } from '@/hooks/useWater';
import { useWorkout } from '@/hooks/useWorkout';
import { getActiveModules } from '@/lib/active-modules';
import { useAuthStore } from '@/stores/authStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { useUIStore, type QuickLogMode } from '@/stores/uiStore';
import { trackQuickLogCompleted } from '@/lib/analytics';

type QuickLogAction = {
  key: string;
  label: string;
  icon: React.ComponentProps<typeof Ionicons>['name'];
  color: string;
  onPress: () => void;
};

function suggestedMealType() {
  const hour = new Date().getHours();
  if (hour < 11) return 'breakfast';
  if (hour < 16) return 'lunch';
  if (hour < 21) return 'dinner';
  return 'snack';
}

export default function QuickLogSheet() {
  const profile = useAuthStore((state) => state.profile);
  const isQuickLogOpen = useUIStore((state) => state.isQuickLogOpen);
  const preferredMode = useUIStore((state) => state.quickLogMode);
  const closeQuickLog = useUIStore((state) => state.closeQuickLog);
  const activeModules = getActiveModules(profile);
  const glassMl = useSettingsStore((state) => state.waterGlassMl);
  const largeGlassMl = useSettingsStore((state) => state.waterLargeGlassMl);
  const bottleMl = useSettingsStore((state) => state.waterBottleMl);
  const { totalHydro, goal, logWater, isLogging: waterSaving } = useWater();
  const { goalHours, isLogging: sleepSaving, logSleepAsync, getOptimalAlarmTimes } = useSleep();
  const { isActive: fastingActive, startFast, isStarting: fastingStarting } = useFasting();
  const { activeSession, getRecommendedRoutine } = useWorkout();

  const [mode, setMode] = useState<QuickLogMode>('menu');
  const [waterValue, setWaterValue] = useState(String(glassMl));
  const [protocol, setProtocol] = useState<'14:10' | '16:8' | '18:6'>('16:8');

  useEffect(() => {
    if (!isQuickLogOpen) return;
    setMode(preferredMode === 'weight' ? 'menu' : preferredMode);
    setWaterValue(String(glassMl));
  }, [glassMl, isQuickLogOpen, preferredMode]);

  const actions = useMemo<QuickLogAction[]>(() => {
    const next: Array<QuickLogAction & { score: number }> = [];

    if (activeModules.includes('water')) {
      next.push({
        key: 'water',
        label: 'Agua',
        icon: 'water-outline',
        color: Colors.water,
        onPress: () => setMode('water'),
        score: activeModules.includes('workout') ? 95 : 92,
      });
    }

    if (activeModules.includes('nutrition')) {
      next.push({
        key: 'nutrition',
        label: 'Comida',
        icon: 'restaurant-outline',
        color: Colors.nutrition,
        onPress: () => {
          closeQuickLog();
          router.push({
            pathname: Routes.nutrition.log,
            params: { mealType: suggestedMealType() },
          } as never);
        },
        score: 100,
      });
    }

    if (activeModules.includes('workout')) {
      next.push({
        key: 'workout',
        label: 'Entreno',
        icon: 'barbell-outline',
        color: Colors.workout,
        onPress: () => {
          closeQuickLog();
          if (activeSession) {
            router.push(Routes.workout.session as never);
            return;
          }
          const recommended = getRecommendedRoutine().routine;
          if (recommended) {
            router.push({
              pathname: Routes.workout.preview,
              params: { routineId: recommended.id, name: recommended.name },
            } as never);
            return;
          }
          router.push(Routes.workout.index as never);
        },
        score: activeSession ? 110 : 98,
      });
    }

    if (activeModules.includes('sleep')) {
      next.push({
        key: 'sleep',
        label: 'Sueño',
        icon: 'moon-outline',
        color: Colors.sleep,
        onPress: () => setMode('sleep'),
        score: 84,
      });
    }

    if (activeModules.includes('steps')) {
      next.push({
        key: 'steps',
        label: 'Pasos',
        icon: 'footsteps-outline',
        color: Colors.steps,
        onPress: () => {
          closeQuickLog();
          router.push(Routes.steps.index as never);
        },
        score: 86,
      });
    }

    if (activeModules.includes('fasting')) {
      next.push({
        key: 'fasting',
        label: 'Ayuno',
        icon: 'timer-outline',
        color: Colors.fasting,
        onPress: () => {
          if (fastingActive) {
            closeQuickLog();
            router.push(Routes.fasting.index as never);
            return;
          }
          setMode('fasting');
        },
        score: fastingActive ? 88 : 62,
      });
    }

    if (activeModules.includes('female')) {
      next.push({
        key: 'female',
        label: 'Ciclo',
        icon: 'flower-outline',
        color: Colors.female,
        onPress: () => {
          closeQuickLog();
          router.push(Routes.female.index as never);
        },
        score: 80,
      });
    }

    if (activeModules.includes('supplements')) {
      next.push({
        key: 'supplements',
        label: 'Suplementos',
        icon: 'medical-outline',
        color: Colors.supplements,
        onPress: () => {
          closeQuickLog();
          router.push(Routes.supplements.index as never);
        },
        score: 74,
      });
    }

    return next.sort((a, b) => b.score - a.score);
  }, [
    activeModules,
    activeSession,
    closeQuickLog,
    fastingActive,
    getRecommendedRoutine,
  ]);

  const displayActions = actions;
  const shouldScroll = displayActions.length > 6;

  const remainingWater = Math.max(0, goal - totalHydro);

  return (
    <BottomSheet
      visible={isQuickLogOpen}
      onClose={closeQuickLog}
      title={mode === 'menu' ? '¿Qué registras?' : undefined}
      snapHeight={mode === 'sleep' ? 720 : mode === 'menu' && shouldScroll ? 660 : 520}
    >
      {mode === 'menu' ? (
        <View style={styles.menuWrap}>
          <Text style={styles.subtitle}>Registra lo básico sin salirte del flujo.</Text>
          {shouldScroll ? (
            <ScrollView
              style={styles.menuScroll}
              contentContainerStyle={styles.menuScrollContent}
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.grid}>
                {displayActions.map((action, index) => {
                  const isLastOdd = displayActions.length % 2 === 1 && index === displayActions.length - 1;
                  return (
                    <Pressable
                      key={action.key}
                      onPress={action.onPress}
                      style={[styles.actionCard, isLastOdd && styles.actionCardFullWidth]}
                      accessibilityRole="button"
                      accessibilityLabel={`Registrar ${action.label}`}
                      accessibilityHint="Abre este formulario rapido."
                    >
                      <View style={[styles.actionIcon, { backgroundColor: withOpacity(action.color, 0.12) }]}>
                        <Ionicons name={action.icon} size={20} color={action.color} />
                      </View>
                      <Text style={styles.actionLabel}>{action.label}</Text>
                    </Pressable>
                  );
                })}
              </View>
            </ScrollView>
          ) : (
            <View style={styles.grid}>
              {displayActions.map((action, index) => {
                const isLastOdd = displayActions.length % 2 === 1 && index === displayActions.length - 1;
                return (
                  <Pressable
                    key={action.key}
                    onPress={action.onPress}
                    style={[styles.actionCard, isLastOdd && styles.actionCardFullWidth]}
                    accessibilityRole="button"
                    accessibilityLabel={`Registrar ${action.label}`}
                    accessibilityHint="Abre este formulario rapido."
                  >
                    <View style={[styles.actionIcon, { backgroundColor: withOpacity(action.color, 0.12) }]}>
                      <Ionicons name={action.icon} size={20} color={action.color} />
                    </View>
                    <Text style={styles.actionLabel}>{action.label}</Text>
                  </Pressable>
                );
              })}
            </View>
          )}
        </View>
      ) : null}

      {mode === 'water' ? (
        <View style={styles.detailWrap}>
          <DetailHeader title="Registrar agua" onBack={() => setMode('menu')} />
          <Text style={styles.helperText}>
            Vas {Math.round(totalHydro)}ml de {Math.round(goal)}ml. Faltan {Math.round(remainingWater)}ml.
          </Text>
          <View style={styles.presetRow}>
            {[
              { label: 'Un vaso', amount: glassMl },
              { label: 'Vaso grande', amount: largeGlassMl },
              { label: 'Botella', amount: bottleMl },
            ].map((item) => (
              <Pressable
                key={item.label}
                onPress={() => setWaterValue(String(item.amount))}
                style={styles.presetCard}
                accessibilityRole="button"
                accessibilityLabel={`${item.label}, ${item.amount} mililitros`}
                accessibilityHint="Usa esta cantidad sugerida para el registro rapido."
              >
                <Text style={styles.presetLabel}>{item.label}</Text>
                <Text style={styles.presetAmount}>{item.amount}ml</Text>
              </Pressable>
            ))}
          </View>
          <Input
            label="Cantidad"
            value={waterValue}
            onChangeText={setWaterValue}
            keyboardType="numeric"
            unit="ml"
          />
          <Button
            onPress={async () => {
              const amount = Number.parseInt(waterValue, 10);
              if (!Number.isFinite(amount) || amount <= 0) return;
              await logWater(amount, 'water');
              trackQuickLogCompleted('water', {
                source: 'quick_log_sheet',
                amount_ml: amount,
              });
              closeQuickLog();
            }}
            loading={waterSaving}
            fullWidth
          >
            Guardar agua
          </Button>
        </View>
      ) : null}

      {mode === 'fasting' ? (
        <View style={styles.detailWrap}>
          <DetailHeader title="Iniciar ayuno" onBack={() => setMode('menu')} />
          <View style={styles.protocolRow}>
            {(['14:10', '16:8', '18:6'] as const).map((item) => {
              const active = item === protocol;
              return (
                <Pressable
                  key={item}
                  onPress={() => setProtocol(item)}
                  style={[styles.protocolChip, active && styles.protocolChipActive]}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: active }}
                  accessibilityLabel={`Protocolo ${item}`}
                  accessibilityHint="Lo deja listo para iniciar este ayuno."
                >
                  <Text style={[styles.protocolText, active && styles.protocolTextActive]}>{item}</Text>
                </Pressable>
              );
            })}
          </View>
          <Button
            onPress={() => {
              if (fastingActive) {
                closeQuickLog();
                router.push(Routes.fasting.index as never);
                return;
              }
              startFast({ protocol }, {
                onSuccess: () => {
                  trackQuickLogCompleted('fasting', {
                    source: 'quick_log_sheet',
                    protocol,
                  });
                  closeQuickLog();
                  router.push(Routes.fasting.index as never);
                },
              });
            }}
            loading={fastingStarting}
            fullWidth
          >
            Empezar ayuno
          </Button>
        </View>
      ) : null}

      {mode === 'sleep' ? (
        <ScrollView style={styles.sleepWrap} contentContainerStyle={styles.sleepContent} showsVerticalScrollIndicator={false}>
          <DetailHeader title="Registrar sueño" onBack={() => setMode('menu')} />
          <SleepLogForm
            goalHours={goalHours}
            isLogging={sleepSaving}
            getOptimalAlarmTimes={getOptimalAlarmTimes}
            submitLabel="Guardar sueño"
            onSubmit={async (input) => {
              await logSleepAsync(input);
              const durationHours = Math.max(
                0,
                (input.wakeTime.getTime() - input.bedtime.getTime()) / (1000 * 60 * 60),
              );
              trackQuickLogCompleted('sleep', {
                source: 'quick_log_sheet',
                duration_hours: Number(durationHours.toFixed(2)),
                bedtime: input.bedtime.toISOString(),
                wake_time: input.wakeTime.toISOString(),
              });
              closeQuickLog();
            }}
          />
        </ScrollView>
      ) : null}
    </BottomSheet>
  );
}

function DetailHeader({ title, onBack }: { title: string; onBack: () => void }) {
  return (
    <View style={styles.detailHeader}>
      <Pressable
        onPress={onBack}
        style={styles.backButton}
        accessibilityRole="button"
        accessibilityLabel="Volver al menu rapido"
        accessibilityHint="Regresa a la lista de acciones del quick log."
      >
        <Ionicons name="chevron-back" size={18} color={Colors.textPrimary} />
      </Pressable>
      <Text style={styles.detailTitle}>{title}</Text>
      <View style={styles.backButtonSpacer} />
    </View>
  );
}

const styles = StyleSheet.create({
  menuWrap: {
    gap: Spacing[3],
    flex: 1,
    paddingBottom: Spacing[4],
  },
  subtitle: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  menuScroll: {
    flex: 1,
  },
  menuScrollContent: {
    paddingBottom: Spacing[2],
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing[3],
  },
  actionCard: {
    width: '47%',
    minHeight: 112,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: withOpacity(Colors.white, 0.06),
    backgroundColor: Colors.elevated,
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[4],
    gap: Spacing[3],
    justifyContent: 'center',
  },
  actionCardFullWidth: {
    width: '100%',
  },
  actionIcon: {
    width: 40,
    height: 40,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionLabel: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.base,
    color: Colors.textPrimary,
  },
  detailWrap: {
    gap: Spacing[3],
    paddingBottom: Spacing[4],
  },
  detailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing[2],
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.elevated,
  },
  backButtonSpacer: {
    width: 36,
    height: 36,
  },
  detailTitle: {
    flex: 1,
    textAlign: 'center',
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.base,
    color: Colors.textPrimary,
  },
  helperText: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  presetRow: {
    flexDirection: 'row',
    gap: Spacing[2],
  },
  presetCard: {
    flex: 1,
    borderRadius: Radius.lg,
    backgroundColor: Colors.elevated,
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[3],
    gap: 4,
  },
  presetLabel: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.sm,
    color: Colors.textPrimary,
  },
  presetAmount: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
  },
  protocolRow: {
    flexDirection: 'row',
    gap: Spacing[2],
  },
  protocolChip: {
    flex: 1,
    minHeight: 48,
    borderRadius: Radius.lg,
    backgroundColor: Colors.elevated,
    borderWidth: 1,
    borderColor: withOpacity(Colors.white, 0.06),
    alignItems: 'center',
    justifyContent: 'center',
  },
  protocolChipActive: {
    backgroundColor: Colors.actionBg,
    borderColor: Colors.actionBorder,
  },
  protocolText: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  protocolTextActive: {
    color: Colors.action,
  },
  sleepWrap: {
    flex: 1,
  },
  sleepContent: {
    gap: Spacing[3],
    paddingBottom: Spacing[6],
  },
});
