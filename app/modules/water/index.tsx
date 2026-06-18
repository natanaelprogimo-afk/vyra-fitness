// REDESIGNED: 2026-05-21 - water now prioritizes quick logging and same-screen daily history
import { useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Header from '@/components/layout/Header';
import GlowRing from '@/components/ui/GlowRing';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import SafeScreen from '@/components/ui/SafeScreen';
import ScreenFooterSpacer from '@/components/ui/ScreenFooterSpacer';
import { Colors, withOpacity } from '@/constants/colors';
import { Routes } from '@/constants/routes';
import { WaterHydrationMessages } from '@/constants/strings';
import { FontFamily, FontSize, Radius, Spacing, ComponentHeight, ComponentWidth } from '@/constants/theme';
import { useWater } from '@/hooks/useWater';
import { triggerImpactHaptic, triggerNotificationHaptic } from '@/lib/haptics';
import {
  getWaterDefaultCustomAmount,
  WATER_AFTERNOON_HOUR,
  WATER_CATCH_UP_THRESHOLD,
  WATER_DRINK_CHOICES,
} from '@/lib/water';
import { useSettingsStore } from '@/stores/settingsStore';
import type { DrinkTypeId, WaterLog } from '@/types/modules';
import { formatVolume } from '@/utils/formatters';

type QuickObject = {
  id: 'glass' | 'large_glass' | 'bottle';
  label: string;
  amount: number;
};

type WaterDrinkChoice = {
  key: string;
  drinkType: DrinkTypeId;
  label: string;
  emoji: string;
  hydrationFactor?: number | null;
  isCustom?: boolean;
  presetId?: string | null;
};

const CALORIC_DRINK_TYPES: DrinkTypeId[] = ['juice', 'milk', 'sports', 'soda'];
const WATER_QUICK_LOG_DEBOUNCE_MS = 800;

function getHydrationMessage(progressPct: number) {
  const hour = new Date().getHours();
  if (progressPct >= 100) {
    return WaterHydrationMessages.goalReached;
  }
  if (progressPct < WATER_CATCH_UP_THRESHOLD && hour >= WATER_AFTERNOON_HOUR) {
    return WaterHydrationMessages.behindAndAfternoon;
  }
  if (progressPct < 55) {
    return WaterHydrationMessages.lowProgress;
  }
  return WaterHydrationMessages.onTrack;
}

function toStoredMl(value: number, volumeUnit: 'ml' | 'oz') {
  if (volumeUnit === 'oz') {
    return Math.round(value / 0.033814);
  }
  return value;
}

function suggestMealType() {
  const hour = new Date().getHours();
  if (hour < 11) return 'breakfast';
  if (hour < 16) return 'lunch';
  if (hour < 21) return 'dinner';
  return 'snack';
}

function formatApproxGlasses(glasses: number) {
  if (glasses <= 0) return '0 vasos aprox.';
  return `${Number.isInteger(glasses) ? glasses : glasses.toFixed(1)} vasos aprox.`;
}

function getHydrationPeriod(loggedAt: string) {
  const hour = new Date(loggedAt).getHours();
  if (hour < 12) return { key: 'morning', title: 'Mañana' };
  if (hour < 18) return { key: 'afternoon', title: 'Tarde' };
  return { key: 'evening', title: 'Noche' };
}

function formatClimateSummary(
  climateSnapshot: {
    climate: string;
    temperatureC: number;
    humidityPct: number;
    apparentTemperatureC: number | null;
  } | null | undefined,
) {
  if (!climateSnapshot) return null;

  const labelMap: Record<string, string> = {
    hot: 'calor fuerte',
    warm: 'clima calido',
    humid: 'humedad alta',
    dry: 'ambiente seco',
    normal: 'clima templado',
  };
  const label = labelMap[climateSnapshot.climate] ?? 'clima actual';
  const felt =
    typeof climateSnapshot.apparentTemperatureC === 'number'
      ? `${Math.round(climateSnapshot.apparentTemperatureC)}°C sens.`
      : `${Math.round(climateSnapshot.temperatureC)}°C`;

  return `${label} · ${felt} · ${Math.round(climateSnapshot.humidityPct)}% hum.`;
}

export default function WaterScreen() {
  const glassMl = useSettingsStore((state) => state.waterGlassMl);
  const largeGlassMl = useSettingsStore((state) => state.waterLargeGlassMl);
  const bottleMl = useSettingsStore((state) => state.waterBottleMl);
  const volumeUnit = useSettingsStore((state) => state.volumeUnit);
  const {
    logs,
    totalHydro,
    goal,
    baseGoal,
    goalAdjustments,
    progressPct,
    remaining,
    hydrationStreak,
    weeklyData,
    hydrationAlert,
    morningContext,
    climateSnapshot,
    beverageComposition,
    customDrinks,
    hourlyDistribution,
    logWater,
    resolveDrinkLabel,
    saveCustomDrinkPreset,
    deleteLog,
    isLogging,
    isDeleting,
  } = useWater();
  const [customAmount, setCustomAmount] = useState(() => getWaterDefaultCustomAmount(volumeUnit));
  const [showCustomEntry, setShowCustomEntry] = useState(false);
  const [selectedDrinkKey, setSelectedDrinkKey] = useState('water');
  const [showCustomDrinkBuilder, setShowCustomDrinkBuilder] = useState(false);
  const [customDrinkName, setCustomDrinkName] = useState('');
  const [customHydrationPct, setCustomHydrationPct] = useState('70');
  const [pendingDelete, setPendingDelete] = useState<WaterLog | null>(null);
  const deleteTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingDeleteRef = useRef<WaterLog | null>(null);
  const lastQuickLogAtRef = useRef(0);

  const quickObjects = useMemo<QuickObject[]>(
    () => [
      { id: 'glass', label: 'Un vaso', amount: glassMl },
      { id: 'large_glass', label: 'Vaso grande', amount: largeGlassMl },
      { id: 'bottle', label: 'Botella', amount: bottleMl },
    ],
    [bottleMl, glassMl, largeGlassMl],
  );
  const drinkChoices = useMemo<WaterDrinkChoice[]>(
    () => [
      ...WATER_DRINK_CHOICES.map((item) => ({
        key: item.id,
        drinkType: item.id,
        label: item.label,
        emoji: item.emoji,
      })),
      ...customDrinks.map((item) => ({
        key: `custom:${item.id}`,
        drinkType: 'other' as DrinkTypeId,
        label: item.name,
        emoji: '🥤',
        hydrationFactor: item.hydrationFactor,
        isCustom: true,
        presetId: item.id,
      })),
    ],
    [customDrinks],
  );

  const recentLogs = useMemo(
    () => [...logs].reverse().filter((log) => log.id !== pendingDelete?.id).slice(0, 5),
    [logs, pendingDelete?.id],
  );
  const recentLogSections = useMemo(() => {
    const order = ['morning', 'afternoon', 'evening'] as const;
    const grouped = new Map<string, { title: string; logs: WaterLog[] }>();

    for (const log of recentLogs) {
      const period = getHydrationPeriod(log.logged_at);
      if (!grouped.has(period.key)) {
        grouped.set(period.key, { title: period.title, logs: [] });
      }
      grouped.get(period.key)?.logs.push(log);
    }

    return order
      .filter((key) => grouped.has(key))
      .map((key) => ({
        key,
        title: grouped.get(key)?.title ?? '',
        logs: grouped.get(key)?.logs ?? [],
      }));
  }, [recentLogs]);

  useEffect(() => {
    setCustomAmount(getWaterDefaultCustomAmount(volumeUnit));
  }, [volumeUnit]);

  useEffect(() => {
    if (!drinkChoices.some((item) => item.key === selectedDrinkKey)) {
      setSelectedDrinkKey('water');
    }
  }, [drinkChoices, selectedDrinkKey]);

  const clearPendingTimer = () => {
    if (deleteTimerRef.current) {
      clearTimeout(deleteTimerRef.current);
      deleteTimerRef.current = null;
    }
  };

  const finalizePendingDelete = (log: WaterLog | null) => {
    if (!log?.id) return;
    pendingDeleteRef.current = null;
    deleteLog(log.id);
  };

  const handleDeletePress = async (log: WaterLog) => {
    clearPendingTimer();
    await triggerImpactHaptic('light');

    if (pendingDeleteRef.current) {
      finalizePendingDelete(pendingDeleteRef.current);
    }

    pendingDeleteRef.current = log;
    setPendingDelete(log);
    deleteTimerRef.current = setTimeout(() => {
      finalizePendingDelete(log);
      setPendingDelete(null);
      deleteTimerRef.current = null;
    }, 4500);
  };

  const handleUndoDelete = async () => {
    clearPendingTimer();
    pendingDeleteRef.current = null;
    setPendingDelete(null);
    await triggerNotificationHaptic('success');
  };

  useEffect(() => {
    return () => {
      clearPendingTimer();
      if (pendingDeleteRef.current) {
        finalizePendingDelete(pendingDeleteRef.current);
      }
    };
  }, []);

  const customValue = Math.max(0, parseInt(customAmount, 10) || 0);
  const customValueMl = toStoredMl(customValue, volumeUnit);
  const customHydrationValue = Math.max(10, Math.min(120, parseInt(customHydrationPct, 10) || 0));
  const glassesToday = glassMl > 0 ? Math.round((totalHydro / glassMl) * 10) / 10 : 0;
  const glassesTodayLabel = formatApproxGlasses(glassesToday);
  const weeklyAverage = weeklyData.length
    ? Math.round(weeklyData.reduce((sum, item) => sum + item.total, 0) / weeklyData.length)
    : 0;
  const peakBucket =
    hourlyDistribution.buckets.reduce<{
      label: string;
      totalMl: number;
    } | null>((highest, bucket) => {
      if (!highest || bucket.totalMl > highest.totalMl) {
        return bucket;
      }
      return highest;
    }, null);
  const maxBucketTotal = Math.max(
    1,
    ...hourlyDistribution.buckets.map((bucket) => bucket.totalMl),
  );
  const weeklyGoalDays = weeklyData.filter((item) => item.total >= goal).length;
  const selectedDrink = drinkChoices.find((item) => item.key === selectedDrinkKey) ?? drinkChoices[0]!;
  const selectedDrinkType = selectedDrink.drinkType;
  const selectedCustomDrink =
    selectedDrink.isCustom && typeof selectedDrink.hydrationFactor === 'number'
      ? {
          name: selectedDrink.label,
          hydrationFactor: selectedDrink.hydrationFactor,
          presetId: selectedDrink.presetId ?? null,
        }
      : null;
  const shouldSuggestNutrition = CALORIC_DRINK_TYPES.includes(selectedDrinkType);
  const isOverGoal = totalHydro > goal;
  const overflowAmount = Math.max(0, totalHydro - goal);
  const weeklyHydrationTotal = Math.max(
    1,
    beverageComposition.reduce((sum, item) => sum + item.hydrationMl, 0),
  );
  const hydrationCue =
    hydrationAlert ??
    morningContext ??
    (hourlyDistribution.valley
      ? `Tu hueco típico aparece entre ${hourlyDistribution.valley.label}. Conviene anticiparte antes de esa franja.`
      : null);
  const climateSummary = formatClimateSummary(climateSnapshot);

  const handleQuickLog = async (amountMl: number) => {
    const now = Date.now();
    if (isLogging || now - lastQuickLogAtRef.current < WATER_QUICK_LOG_DEBOUNCE_MS) {
      return;
    }
    lastQuickLogAtRef.current = now;
    await triggerImpactHaptic('medium');
    logWater(amountMl, selectedDrinkType, selectedCustomDrink);
  };

  const handleSaveCustomDrink = async () => {
    const normalizedName = customDrinkName.trim();
    if (!normalizedName) return;

    await triggerImpactHaptic('light');
    const savedPreset = await saveCustomDrinkPreset({
      name: normalizedName,
      hydrationFactor: customHydrationValue / 100,
    });

    if (!savedPreset) return;

    setSelectedDrinkKey(`custom:${savedPreset.id}`);
    setShowCustomDrinkBuilder(false);
    setCustomDrinkName('');
    setCustomHydrationPct('70');
  };

  return (
    <SafeScreen padHorizontal={false} padBottom>
      <Header title="Agua" showBack />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Card style={styles.heroCard} shadow={false}>
          <GlowRing
            value={progressPct}
            size={220}
            strokeWidth={18}
            color={Colors.water}
            state={progressPct >= 100 ? 'excellent' : 'active'}
            pulse={progressPct >= 100}
          >
            <Text style={styles.heroValue}>{formatVolume(totalHydro, volumeUnit)}</Text>
            <Text style={styles.heroGlasses}>{glassesTodayLabel}</Text>
          </GlowRing>

          <View style={styles.heroCopy}>
            <Text style={styles.heroTitle}>Meta de {formatVolume(goal, volumeUnit)}</Text>
            <Text style={styles.heroBody}>
              {isOverGoal
                ? `Meta superada por ${formatVolume(overflowAmount, volumeUnit)}.`
                : remaining > 0
                ? `Faltan ${formatVolume(remaining, volumeUnit)} para la meta.`
                : 'Meta cubierta por hoy.'}
            </Text>
            <Text style={styles.heroHint}>{getHydrationMessage(progressPct)}</Text>
          </View>
        </Card>

        <View style={styles.snapshotGrid}>
          <Card style={styles.snapshotCard} shadow={false}>
            <Text style={styles.snapshotLabel}>Restan</Text>
            <Text style={styles.snapshotValue}>
              {remaining > 0 ? formatVolume(remaining, volumeUnit) : '0'}
            </Text>
            <Text style={styles.snapshotHint}>
              {remaining > 0 ? 'para cerrar hoy' : 'meta cumplida'}
            </Text>
          </Card>
          <Card style={styles.snapshotCard} shadow={false}>
            <Text style={styles.snapshotLabel}>Promedio</Text>
            <Text style={styles.snapshotValue}>{formatVolume(weeklyAverage, volumeUnit)}</Text>
            <Text style={styles.snapshotHint}>ultimos 7 dias</Text>
          </Card>
          <Card style={styles.snapshotCard} shadow={false}>
            <Text style={styles.snapshotLabel}>Racha</Text>
            <Text style={styles.snapshotValue}>{hydrationStreak.streakDays}d</Text>
            <Text style={styles.snapshotHint}>
              {hydrationStreak.metToday ? 'incluye hoy' : 'todavia sin hoy'}
            </Text>
          </Card>
        </View>

        <Card style={styles.quickLogCard} shadow={false}>
          <View style={styles.sectionCopy}>
            <Text style={styles.sectionTitle}>Presets rapidos</Text>
            <Text style={styles.sectionHint}>
              Toca una cantidad y el total sube al instante. El historial del día queda justo debajo.
            </Text>
          </View>
          <View style={styles.activeDrinkRow}>
            <Text style={styles.activeDrinkEyebrow}>Bebida base</Text>
            <Text style={styles.activeDrinkValue}>
              {selectedDrink.emoji} {selectedDrink.label}
            </Text>
          </View>
          <View style={styles.quickGrid}>
            {quickObjects.map((item) => (
              <Pressable
                key={item.id}
                style={styles.quickButton}
                disabled={isLogging}
                onPress={() => void handleQuickLog(item.amount)}
                accessibilityRole="button"
                accessibilityLabel={`Registrar ${formatVolume(item.amount, volumeUnit)} de ${selectedDrink.label}`}
                accessibilityHint="Suma esta bebida al total de hoy."
                accessibilityState={{ disabled: isLogging }}
                hitSlop={8}
              >
                <Text style={styles.quickLabel}>{item.label}</Text>
                <Text style={styles.quickAmount}>
                  {selectedDrink.emoji} {formatVolume(item.amount, volumeUnit)}
                </Text>
                <Text style={styles.quickHint}>
                  {remaining > item.amount
                    ? `${formatVolume(Math.max(0, remaining - item.amount), volumeUnit)} despues`
                    : 'Ya casi cierra la meta'}
                </Text>
              </Pressable>
            ))}
            <Pressable
              style={styles.quickButton}
              onPress={() =>
                setShowCustomEntry((current) => {
                  const next = !current;
                  if (next) {
                    setCustomAmount(getWaterDefaultCustomAmount(volumeUnit));
                  }
                  return next;
                })
              }
              accessibilityRole="button"
              accessibilityLabel="Registrar otra cantidad de agua"
              accessibilityHint="Abre o cierra el ingreso manual."
              accessibilityState={{ expanded: showCustomEntry }}
              hitSlop={8}
            >
              <Text style={styles.quickLabel}>Otra cantidad</Text>
              <Text style={styles.quickAmount}>{selectedDrink.emoji} Manual</Text>
              <Text style={styles.quickHint}>Escribe un monto puntual</Text>
            </Pressable>
          </View>
        </Card>

        {showCustomEntry ? (
          <Card style={styles.customCard} shadow={false}>
            <Text style={styles.sectionTitle}>Otra cantidad</Text>
            <Input
              label="Cantidad"
              value={customAmount}
              onChangeText={setCustomAmount}
              keyboardType="numeric"
              unit={volumeUnit}
            />
            <Button
              onPress={async () => {
                if (!customValueMl) return;
                await handleQuickLog(customValueMl);
                setShowCustomEntry(false);
                setCustomAmount(getWaterDefaultCustomAmount(volumeUnit));
              }}
              disabled={!customValueMl}
              loading={isLogging}
              color={Colors.water}
              fullWidth
            >
              Guardar
            </Button>
          </Card>
        ) : null}

        <Card style={styles.dayHistoryCard} shadow={false}>
          {pendingDelete ? (
            <View style={styles.undoBanner}>
              <View style={styles.undoCopy}>
                <Text style={styles.undoTitle}>Registro marcado para borrar</Text>
                <Text style={styles.undoBody}>
                  +{formatVolume(pendingDelete.amount_ml, volumeUnit)} de{' '}
                  {resolveDrinkLabel(pendingDelete)} se quitara. Si fue accidental,
                  puedes deshacerlo ahora.
                </Text>
              </View>
              <Button onPress={() => void handleUndoDelete()} variant="ghost" color={Colors.water}>
                Deshacer
              </Button>
            </View>
          ) : null}

          <View style={styles.sectionHeaderRow}>
            <View style={styles.sectionCopy}>
              <Text style={styles.sectionTitle}>Registros de hoy</Text>
              <Text style={styles.sectionHint}>
                Tu timeline del día vive acá mismo para que corregir o borrar no te saque del flujo.
              </Text>
            </View>
            <Pressable
              onPress={() => router.push(Routes.water.history)}
              accessibilityRole="button"
              accessibilityLabel="Ver historial completo de agua"
              accessibilityHint="Abre el historial del modulo con graficos y registros previos."
              hitSlop={8}
            >
              <Text style={styles.historyLink}>Ver historial</Text>
            </Pressable>
          </View>

          <View style={styles.dayHistoryList}>
            {recentLogs.length ? (
              recentLogSections.map((section) => {
                const sectionTotal = section.logs.reduce((sum, log) => sum + log.amount_ml, 0);
                return (
                  <View key={section.key} style={styles.dayHistorySection}>
                    <View style={styles.dayHistorySectionHeader}>
                      <Text style={styles.dayHistorySectionTitle}>{section.title}</Text>
                      <Text style={styles.dayHistorySectionMeta}>
                        {formatVolume(sectionTotal, volumeUnit)}
                      </Text>
                    </View>
                    {section.logs.map((log) => (
                      <View key={log.id} style={styles.dayHistoryRow}>
                        <View style={styles.dayHistoryCopy}>
                          <Text style={styles.dayHistoryTime}>
                            {new Date(log.logged_at).toLocaleTimeString('es-UY', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </Text>
                          <Text style={styles.dayHistoryDrink}>{resolveDrinkLabel(log)}</Text>
                        </View>
                        <View style={styles.dayHistoryActions}>
                          <Text style={styles.dayHistoryValue}>
                            +{formatVolume(log.amount_ml, volumeUnit)}
                          </Text>
                          <Pressable
                            onPress={() => void handleDeletePress(log)}
                            disabled={isDeleting}
                            style={styles.deleteButton}
                            accessibilityRole="button"
                            accessibilityLabel="Quitar registro"
                          >
                            <Ionicons name="trash-outline" size={16} color={Colors.textMuted} />
                          </Pressable>
                        </View>
                      </View>
                    ))}
                  </View>
                );
              })
            ) : (
              <Text style={styles.emptyText}>Todavia no registraste bebidas hoy.</Text>
            )}

            {logs.length > 5 ? (
              <Pressable
                style={styles.seeAllButton}
                onPress={() => router.push(Routes.water.history)}
                accessibilityRole="button"
                accessibilityLabel="Ver historial completo de agua"
              >
                <Text style={styles.seeAllText}>Ver historial completo ({logs.length} registros)</Text>
              </Pressable>
            ) : null}
          </View>
        </Card>

        {goalAdjustments.length ? (
          <Card style={styles.goalContextCard} shadow={false}>
            <Text style={styles.sectionTitle}>Meta dinámica de hoy</Text>
            <Text style={styles.sectionHint}>
              Base {formatVolume(baseGoal, volumeUnit)} y hoy sube a {formatVolume(goal, volumeUnit)}
              por tu contexto real.
            </Text>
            {climateSummary ? (
              <Text style={styles.goalClimateMeta}>Clima detectado: {climateSummary}</Text>
            ) : null}
            <View style={styles.goalAdjustmentList}>
              {goalAdjustments.map((item) => (
                <View key={`${item.source}-${item.reason}`} style={styles.goalAdjustmentRow}>
                  <Text style={styles.goalAdjustmentDelta}>+{formatVolume(item.delta, volumeUnit)}</Text>
                  <Text style={styles.goalAdjustmentReason}>{item.reason}</Text>
                </View>
              ))}
            </View>
          </Card>
        ) : null}

        <Card style={styles.drinkCard} shadow={false}>
          <Text style={styles.sectionTitle}>Que estas tomando</Text>
          <Text style={styles.sectionHint}>
            Elige el tipo de bebida antes de sumar el registro rapido.
          </Text>
          <View style={styles.drinkGrid}>
            {drinkChoices.slice(0, 5).map((item) => {
              const selected = item.key === selectedDrinkKey;
              return (
                <Pressable
                  key={item.key}
                  style={[styles.drinkPill, selected && styles.drinkPillActive]}
                  onPress={() => setSelectedDrinkKey(item.key)}
                  accessibilityRole="radio"
                  accessibilityLabel={item.label}
                  accessibilityState={{ checked: selected, selected }}
                >
                  <Text style={styles.drinkEmoji}>{item.emoji}</Text>
                  <Text style={[styles.drinkLabel, selected && styles.drinkLabelActive]}>
                    {item.label}
                  </Text>
                </Pressable>
              );
            })}
            {drinkChoices.length > 5 ? (
              <Pressable
                style={styles.drinkPill}
                onPress={() => setShowCustomDrinkBuilder(true)}
                accessibilityRole="button"
                accessibilityLabel={`Ver ${drinkChoices.length - 5} bebidas mas`}
              >
                <Text style={styles.drinkEmoji}>+{drinkChoices.length - 5}</Text>
                <Text style={styles.drinkLabel}>Mas</Text>
              </Pressable>
            ) : (
              <Pressable
                style={styles.drinkPill}
                onPress={() => setShowCustomDrinkBuilder((current) => !current)}
                accessibilityRole="button"
                accessibilityLabel="Agregar bebida personalizada"
                accessibilityState={{ expanded: showCustomDrinkBuilder }}
              >
                <Text style={styles.drinkEmoji}>+</Text>
                <Text style={styles.drinkLabel}>Agregar</Text>
              </Pressable>
            )}
          </View>
          {selectedCustomDrink ? (
            <Text style={styles.inlineDrinkHint}>
              {selectedCustomDrink.name} cuenta al {Math.round(selectedCustomDrink.hydrationFactor * 100)}% de hidratacion y queda guardada en recientes para la proxima.
            </Text>
          ) : selectedDrinkType === 'other' ? (
            <Text style={styles.inlineDrinkHint}>
              Usa esta opción cuando solo quieras sumar líquido sin clasificarlo como agua, café, té o jugo.
            </Text>
          ) : null}
        </Card>

        {showCustomDrinkBuilder ? (
          <Card style={styles.customDrinkCard} shadow={false}>
            <Text style={styles.sectionTitle}>Nueva bebida</Text>
            <Text style={styles.sectionHint}>
              Guarda una bebida propia con porcentaje estimado de hidratacion para reutilizarla en un toque.
            </Text>
            <Input
              label="Nombre"
              value={customDrinkName}
              onChangeText={setCustomDrinkName}
              placeholder="Cafe con leche"
            />
            <Input
              label="% de hidratacion"
              value={customHydrationPct}
              onChangeText={setCustomHydrationPct}
              keyboardType="numeric"
              unit="%"
            />
            <Button
              onPress={() => void handleSaveCustomDrink()}
              disabled={!customDrinkName.trim()}
              fullWidth
            >
              Guardar en recientes
            </Button>
          </Card>
        ) : null}

        {shouldSuggestNutrition ? (
          <Card style={styles.nutritionPromptCard} shadow={false}>
            <Text style={styles.sectionTitle}>Esta bebida también puede contar como comida</Text>
            <Text style={styles.sectionHint}>
              Si {selectedDrink.label.toLowerCase()} suma calorías en tu día, puedes mandarla a Nutrición en dos toques y dejar ambos módulos alineados.
            </Text>
            <Button
              onPress={() =>
                router.push({
                  pathname: Routes.nutrition.log,
                  params: { mealType: suggestMealType() },
                } as never)
              }
              variant="secondary"
              color={Colors.nutrition}
              fullWidth
            >
              Registrar también en nutrición
            </Button>
          </Card>
        ) : null}

        {hydrationCue ? (
          <Card style={styles.smartCueCard} shadow={false}>
            <Text style={styles.sectionTitle}>Recordatorio inteligente</Text>
            <Text style={styles.sectionHint}>{hydrationCue}</Text>
            {climateSummary ? <Text style={styles.smartCueMeta}>Basado también en {climateSummary}.</Text> : null}
            <Button
              onPress={() => void handleQuickLog(toStoredMl(250, volumeUnit))}
              variant="secondary"
              color={Colors.water}
              fullWidth
            >
              Sumar {formatVolume(toStoredMl(250, volumeUnit), volumeUnit)} ahora
            </Button>
          </Card>
        ) : null}

        {beverageComposition.length ? (
          <Card style={styles.compositionCard} shadow={false}>
            <Text style={styles.sectionTitle}>Qué te hidrata esta semana</Text>
            <Text style={styles.sectionHint}>
              No solo cuenta el agua: aquí ves qué bebidas están moviendo de verdad tu hidratación.
            </Text>
            <View style={styles.compositionList}>
              {beverageComposition.slice(0, 4).map((item) => {
                const pct = Math.round((item.hydrationMl / weeklyHydrationTotal) * 100);
                return (
                  <View key={`${item.drinkType}`} style={styles.compositionRow}>
                    <View style={styles.compositionCopy}>
                      <Text style={styles.compositionLabel}>
                        {item.label}
                      </Text>
                      <Text style={styles.compositionMeta}>
                        {formatVolume(item.amountMl, volumeUnit)} registrados · {pct}% del total hidratante
                      </Text>
                    </View>
                    <Text style={styles.compositionValue}>
                      {formatVolume(item.hydrationMl, volumeUnit)}
                    </Text>
                  </View>
                );
              })}
            </View>
          </Card>
        ) : null}

        <Card style={styles.rhythmCard} shadow={false}>
          <Text style={styles.sectionTitle}>Ritmo del día</Text>
          <Text style={styles.sectionHint}>
            {peakBucket && peakBucket.totalMl > 0
              ? `Tu pico reciente cae en ${peakBucket.label}.`
              : 'Todavia no hay un patron claro de horarios.'}
            {hourlyDistribution.valley?.totalMl
              ? ` El hueco mas flojo aparece en ${hourlyDistribution.valley.label}.`
              : ''}
          </Text>
          <View style={styles.hourlyChart}>
            {hourlyDistribution.buckets.map((bucket) => {
              const height = Math.max(10, Math.round((bucket.totalMl / maxBucketTotal) * 88));
              return (
                <View key={bucket.label} style={styles.hourlyBarItem}>
                  <View style={styles.hourlyTrack}>
                    <View style={[styles.hourlyFill, { height }]} />
                  </View>
                  <Text style={styles.hourlyLabel}>{bucket.label}</Text>
                </View>
              );
            })}
          </View>
        </Card>

        <Card style={styles.weekCard} shadow={false}>
          <Text style={styles.sectionTitle}>Resumen semanal</Text>
          <View style={styles.weekStatsRow}>
            <View style={styles.weekStat}>
              <Text style={styles.weekAverage}>{formatVolume(weeklyAverage, volumeUnit)}</Text>
              <Text style={styles.weekHint}>promedio</Text>
            </View>
            <View style={styles.weekStat}>
              <Text style={styles.weekAverage}>{weeklyGoalDays}/{weeklyData.length}</Text>
              <Text style={styles.weekHint}>dias en meta</Text>
            </View>
          </View>
          <View style={styles.weekStrip}>
            {weeklyData.map((item) => {
              const barHeight = Math.max(10, Math.round((item.total / Math.max(goal, 1)) * 76));
              const dayLabel = new Date(`${item.date}T00:00:00`).toLocaleDateString('es-UY', {
                weekday: 'short',
              });
              return (
                <View key={item.date} style={styles.weekDayItem}>
                  <View style={styles.weekDayTrack}>
                    <View
                      style={[
                        styles.weekDayFill,
                        {
                          height: Math.min(84, barHeight),
                          backgroundColor:
                            item.total >= goal ? Colors.water : withOpacity(Colors.water, 0.4),
                        },
                      ]}
                    />
                  </View>
                  <Text style={styles.weekDayLabel}>{dayLabel.replace('.', '')}</Text>
                </View>
              );
            })}
          </View>
        </Card>

        <ScreenFooterSpacer extra={Spacing[2]} />
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
  snapshotGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing[3],
  },
  snapshotCard: {
    flex: 1,
    minWidth: 96,
    gap: 4,
    paddingVertical: Spacing[3],
  },
  snapshotLabel: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.xs,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    color: Colors.textMuted,
  },
  snapshotValue: {
    fontFamily: FontFamily.display,
    fontSize: FontSize.xl,
    color: Colors.textPrimary,
  },
  snapshotHint: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    lineHeight: 18,
    color: Colors.textSecondary,
  },
  quickLogCard: {
    gap: Spacing[3],
  },
  activeDrinkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing[2],
    paddingHorizontal: Spacing[1],
  },
  activeDrinkEyebrow: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.xs,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    color: Colors.textMuted,
  },
  activeDrinkValue: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.sm,
    color: Colors.water,
  },
  heroCard: {
    alignItems: 'center',
    gap: Spacing[4],
    backgroundColor: withOpacity(Colors.water, 0.08),
    borderColor: withOpacity(Colors.water, 0.18),
  },
  heroValue: {
    fontFamily: FontFamily.display,
    fontSize: FontSize['3.5xl'],
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  heroGlasses: {
    marginTop: 4,
    fontFamily: FontFamily.medium,
    fontSize: FontSize.sm,
    color: Colors.water,
  },
  heroCopy: {
    width: '100%',
    alignItems: 'center',
    gap: Spacing[2],
  },
  heroTitle: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize['2.5xl'],
    color: Colors.textPrimary,
  },
  heroBody: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.base,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  heroHint: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: 20,
  },
  contextCard: {
    gap: Spacing[3],
    borderWidth: 1,
    borderColor: withOpacity(Colors.water, 0.2),
    backgroundColor: withOpacity(Colors.water, 0.06),
  },
  contextList: {
    gap: Spacing[2],
  },
  contextRow: {
    flexDirection: 'row',
    gap: Spacing[3],
    alignItems: 'flex-start',
  },
  contextDelta: {
    minWidth: 72,
    fontFamily: FontFamily.bold,
    fontSize: FontSize.xs,
    color: Colors.water,
  },
  contextReason: {
    flex: 1,
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    lineHeight: 18,
    color: Colors.textSecondary,
  },
  contextCue: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.sm,
    lineHeight: 20,
    color: Colors.textPrimary,
  },
  contextMeta: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    lineHeight: 18,
    color: Colors.textMuted,
  },
  goalContextCard: {
    gap: Spacing[2],
    borderWidth: 1,
    borderColor: withOpacity(Colors.water, 0.2),
    backgroundColor: withOpacity(Colors.water, 0.06),
  },
  goalAdjustmentList: {
    gap: Spacing[2],
  },
  goalAdjustmentRow: {
    flexDirection: 'row',
    gap: Spacing[3],
    alignItems: 'flex-start',
  },
  goalAdjustmentDelta: {
    minWidth: 72,
    fontFamily: FontFamily.bold,
    fontSize: FontSize.xs,
    color: Colors.water,
  },
  goalAdjustmentReason: {
    flex: 1,
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  goalClimateMeta: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    lineHeight: 18,
  },
  drinkCard: {
    gap: Spacing[3],
  },
  smartCueCard: {
    gap: Spacing[3],
    borderWidth: 1,
    borderColor: withOpacity(Colors.warning, 0.22),
    backgroundColor: withOpacity(Colors.warning, 0.08),
  },
  smartCueMeta: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    lineHeight: 18,
    marginTop: -Spacing[1],
  },
  nutritionPromptCard: {
    gap: Spacing[3],
    borderWidth: 1,
    borderColor: withOpacity(Colors.nutrition, 0.22),
    backgroundColor: withOpacity(Colors.nutrition, 0.06),
  },
  compositionCard: {
    gap: Spacing[3],
  },
  compositionList: {
    gap: Spacing[2],
  },
  compositionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[3],
    paddingVertical: Spacing[1],
  },
  compositionCopy: {
    flex: 1,
    gap: 2,
  },
  compositionLabel: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.sm,
    color: Colors.textPrimary,
  },
  compositionMeta: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
  },
  compositionValue: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.xs,
    color: Colors.water,
  },
  drinkGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing[2],
  },
  inlineDrinkHint: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    lineHeight: 18,
  },
  drinkPill: {
    minWidth: '31%',
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.elevated,
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[2],
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  drinkPillActive: {
    borderColor: withOpacity(Colors.water, 0.45),
    backgroundColor: withOpacity(Colors.water, 0.12),
  },
  drinkEmoji: {
    fontSize: FontSize['lg+'],
  },
  drinkLabel: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
  },
  drinkLabelActive: {
    color: Colors.textPrimary,
  },
  quickGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing[2],
  },
  quickButton: {
    width: '49%',
    minHeight: ComponentHeight.quickButton,
    borderRadius: Radius.xl,
    backgroundColor: Colors.elevated,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[3],
    justifyContent: 'space-between',
    gap: 4,
  },
  quickLabel: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.base,
    color: Colors.textPrimary,
  },
  quickAmount: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.sm,
    color: Colors.water,
  },
  quickHint: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
  },
  customDrinkCard: {
    gap: Spacing[3],
    borderWidth: 1,
    borderColor: withOpacity(Colors.water, 0.18),
    backgroundColor: withOpacity(Colors.water, 0.05),
  },
  customCard: {
    gap: Spacing[3],
  },
  undoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[3],
    paddingBottom: Spacing[2],
    borderBottomWidth: 1,
    borderBottomColor: withOpacity(Colors.water, 0.16),
  },
  undoCopy: {
    flex: 1,
    gap: 4,
  },
  undoTitle: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.sm,
    color: Colors.textPrimary,
  },
  undoBody: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing[3],
  },
  sectionCopy: {
    flex: 1,
    gap: 6,
  },
  sectionTitle: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.md,
    color: Colors.textPrimary,
  },
  sectionHint: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  historyLink: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.sm,
    color: Colors.water,
  },
  dayHistoryCard: {
    gap: Spacing[3],
  },
  dayHistoryList: {
    gap: Spacing[2],
  },
  dayHistorySection: {
    gap: Spacing[2],
  },
  dayHistorySectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing[2],
    paddingTop: Spacing[1],
  },
  dayHistorySectionTitle: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  dayHistorySectionMeta: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.xs,
    color: Colors.water,
  },
  dayHistoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: Spacing[3],
    paddingBottom: Spacing[2],
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  dayHistoryCopy: {
    flex: 1,
    gap: 4,
  },
  dayHistoryTime: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.base,
    color: Colors.textPrimary,
  },
  dayHistoryDrink: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  dayHistoryActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[2],
  },
  dayHistoryValue: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.base,
    color: Colors.textPrimary,
  },
  deleteButton: {
    width: 34,
    height: 34,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.bgSurface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  emptyText: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.base,
    color: Colors.textSecondary,
  },
  seeAllButton: {
    paddingVertical: Spacing[2],
    marginTop: Spacing[2],
    borderTopWidth: 1,
    borderTopColor: withOpacity(Colors.white, 0.06),
    alignItems: 'center',
  },
  seeAllText: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.sm,
    color: Colors.water,
  },
  rhythmCard: {
    gap: Spacing[3],
  },
  hourlyChart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: Spacing[2],
    minHeight: 120,
  },
  hourlyBarItem: {
    flex: 1,
    alignItems: 'center',
    gap: Spacing[1.5],
  },
  hourlyTrack: {
    width: '100%',
    height: 92,
    borderRadius: Radius.lg,
    justifyContent: 'flex-end',
    backgroundColor: Colors.elevated,
    overflow: 'hidden',
  },
  hourlyFill: {
    width: '100%',
    borderRadius: Radius.lg,
    backgroundColor: Colors.water,
  },
  hourlyLabel: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.xs,
    color: Colors.textMuted,
  },
  weekCard: {
    gap: Spacing[3],
    backgroundColor: withOpacity(Colors.water, 0.06),
    borderColor: withOpacity(Colors.water, 0.18),
  },
  weekStatsRow: {
    flexDirection: 'row',
    gap: Spacing[3],
  },
  weekStat: {
    flex: 1,
    gap: 4,
  },
  weekAverage: {
    fontFamily: FontFamily.display,
    fontSize: FontSize['2xl'],
    color: Colors.textPrimary,
  },
  weekHint: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  weekStrip: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: Spacing[2],
    minHeight: 106,
  },
  weekDayItem: {
    flex: 1,
    alignItems: 'center',
    gap: Spacing[1.5],
  },
  weekDayTrack: {
    width: '100%',
    height: 84,
    borderRadius: Radius.lg,
    justifyContent: 'flex-end',
    backgroundColor: Colors.elevated,
    overflow: 'hidden',
  },
  weekDayFill: {
    width: '100%',
    borderRadius: Radius.lg,
  },
  weekDayLabel: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    textTransform: 'capitalize',
  },
});
