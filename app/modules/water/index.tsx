import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Header from '@/components/layout/Header';
import ModuleIntroScreen from '@/components/modules/ModuleIntroScreen';
import GlowRing from '@/components/ui/GlowRing';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import SafeScreen from '@/components/ui/SafeScreen';
import ScreenFooterSpacer from '@/components/ui/ScreenFooterSpacer';
import { Colors, withOpacity } from '@/constants/colors';
import { FontFamily, FontSize, Radius, Spacing } from '@/constants/theme';
import { useWater } from '@/hooks/useWater';
import { useSettingsStore } from '@/stores/settingsStore';
import type { DrinkTypeId } from '@/types/modules';
import { formatVolume } from '@/utils/formatters';

type QuickObject = {
  id: 'glass' | 'large_glass' | 'bottle';
  label: string;
  amount: number;
};

type DrinkChoice = {
  id: DrinkTypeId;
  label: string;
  emoji: string;
};

const DRINK_CHOICES: DrinkChoice[] = [
  { id: 'water', label: 'Agua', emoji: '💧' },
  { id: 'tea', label: 'Te', emoji: '🍵' },
  { id: 'coffee', label: 'Cafe', emoji: '☕' },
  { id: 'juice', label: 'Jugo', emoji: '🍊' },
  { id: 'soda', label: 'Coca o soda', emoji: '🥤' },
  { id: 'electrolyte_water', label: 'Electrolitos', emoji: '⚡' },
];

function getHydrationCopy(progressPct: number) {
  const hour = new Date().getHours();
  if (progressPct >= 100) {
    return 'Meta cerrada. Mantener este patron simple es lo que sostiene el modulo.';
  }
  if (progressPct < 30 && hour >= 15) {
    return 'Ya paso buena parte del dia. Dos registros seguidos ahora cambian por completo el cierre.';
  }
  if (progressPct < 55) {
    return 'Todavia hay margen para recuperar el ritmo sin meter complejidad.';
  }
  return 'Vas bien. Sostener pequenos vasos espaciados vale mas que apilar todo al final.';
}

function getDrinkLabel(drinkType: string) {
  return DRINK_CHOICES.find((item) => item.id === drinkType)?.label ?? 'Bebida';
}

function toStoredMl(value: number, volumeUnit: 'ml' | 'oz') {
  if (volumeUnit === 'oz') {
    return Math.round(value / 0.033814);
  }
  return value;
}

export default function WaterScreen() {
  const hasSeenIntro = useSettingsStore((state) => Boolean(state.moduleIntroSeen.water));
  const markModuleIntroSeen = useSettingsStore((state) => state.markModuleIntroSeen);
  const glassMl = useSettingsStore((state) => state.waterGlassMl);
  const largeGlassMl = useSettingsStore((state) => state.waterLargeGlassMl);
  const bottleMl = useSettingsStore((state) => state.waterBottleMl);
  const volumeUnit = useSettingsStore((state) => state.volumeUnit);
  const {
    logs,
    totalHydro,
    goal,
    progressPct,
    remaining,
    weeklyData,
    logWater,
    deleteLog,
    isLogging,
    isDeleting,
  } = useWater();
  const [customAmount, setCustomAmount] = useState('650');
  const [showCustomEntry, setShowCustomEntry] = useState(false);
  const [selectedDrinkType, setSelectedDrinkType] = useState<DrinkTypeId>('water');

  const quickObjects = useMemo<QuickObject[]>(
    () => [
      { id: 'glass', label: 'Un vaso', amount: glassMl },
      { id: 'large_glass', label: 'Vaso grande', amount: largeGlassMl },
      { id: 'bottle', label: 'Botella', amount: bottleMl },
    ],
    [bottleMl, glassMl, largeGlassMl],
  );

  const recentLogs = useMemo(() => [...logs].slice().reverse(), [logs]);

  if (!hasSeenIntro) {
    return (
      <SafeScreen padHorizontal={false} padBottom>
        <Header title="Agua" showBack />
        <ModuleIntroScreen
          accentColor={Colors.water}
          icon="Agua"
          title="Agua"
          body="Este modulo esta hecho para registrar rapido, no para pensar demasiado. Toca y listo."
          ctaLabel="Entrar al modulo"
          onContinue={() => markModuleIntroSeen('water')}
        />
      </SafeScreen>
    );
  }

  const customValue = Math.max(0, parseInt(customAmount, 10) || 0);
  const customValueMl = toStoredMl(customValue, volumeUnit);
  const glassesToday = glassMl > 0 ? Math.round((totalHydro / glassMl) * 10) / 10 : 0;
  const weeklyAverage = weeklyData.length
    ? Math.round(weeklyData.reduce((sum, item) => sum + item.total, 0) / weeklyData.length)
    : 0;
  const selectedDrink = DRINK_CHOICES.find((item) => item.id === selectedDrinkType) ?? DRINK_CHOICES[0]!;

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
            <Text style={styles.heroGlasses}>{glassesToday} vasos hoy</Text>
          </GlowRing>

          <View style={styles.heroCopy}>
            <Text style={styles.heroTitle}>de {formatVolume(goal, volumeUnit)}</Text>
            <Text style={styles.heroBody}>
              {remaining > 0
                ? `Faltan ${formatVolume(remaining, volumeUnit)} para la meta.`
                : 'Meta cubierta por hoy.'}
            </Text>
            <Text style={styles.heroHint}>{getHydrationCopy(progressPct)}</Text>
          </View>
        </Card>

        <Card style={styles.drinkCard} shadow={false}>
          <Text style={styles.sectionTitle}>Que estas tomando</Text>
          <Text style={styles.sectionHint}>
            Elige el tipo de bebida antes de sumar el registro rapido.
          </Text>
          <View style={styles.drinkGrid}>
            {DRINK_CHOICES.map((item) => {
              const selected = item.id === selectedDrinkType;
              return (
                <Pressable
                  key={item.id}
                  style={[styles.drinkPill, selected && styles.drinkPillActive]}
                  onPress={() => setSelectedDrinkType(item.id)}
                  accessibilityRole="button"
                  accessibilityLabel={item.label}
                  accessibilityState={{ selected }}
                >
                  <Text style={styles.drinkEmoji}>{item.emoji}</Text>
                  <Text style={[styles.drinkLabel, selected && styles.drinkLabelActive]}>
                    {item.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </Card>

        <View style={styles.quickGrid}>
          {quickObjects.map((item) => (
            <Pressable
              key={item.id}
              style={styles.quickButton}
              disabled={isLogging}
              onPress={() => logWater(item.amount, selectedDrinkType)}
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
                  ? `${formatVolume(remaining - item.amount, volumeUnit)} restantes`
                  : 'Esto ya cerraria la meta'}
              </Text>
            </Pressable>
          ))}
          <Pressable
            style={styles.quickButton}
            onPress={() => setShowCustomEntry((value) => !value)}
            accessibilityRole="button"
            accessibilityLabel="Registrar otra cantidad de agua"
            accessibilityHint="Abre o cierra el ingreso manual."
            accessibilityState={{ expanded: showCustomEntry }}
            hitSlop={8}
          >
            <Text style={styles.quickLabel}>Otra cantidad</Text>
            <Text style={styles.quickAmount}>{selectedDrink.emoji} Personalizada</Text>
            <Text style={styles.quickHint}>Abrir input rapido</Text>
          </Pressable>
        </View>

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
              onPress={() => {
                if (!customValueMl) return;
                logWater(customValueMl, selectedDrinkType);
                setShowCustomEntry(false);
              }}
              disabled={!customValueMl}
              loading={isLogging}
              fullWidth
            >
              Guardar
            </Button>
          </Card>
        ) : null}

        <Card style={styles.dayHistoryCard} shadow={false}>
          <View style={styles.sectionHeaderRow}>
            <View style={styles.sectionCopy}>
              <Text style={styles.sectionTitle}>Registros de hoy</Text>
              <Text style={styles.sectionHint}>
                Si tocas algo mal, lo puedes borrar aqui mismo sin irte a otra pantalla.
              </Text>
            </View>
          </View>

          <View style={styles.dayHistoryList}>
            {recentLogs.length ? (
              recentLogs.map((log) => (
                <View key={log.id} style={styles.dayHistoryRow}>
                  <View style={styles.dayHistoryCopy}>
                    <Text style={styles.dayHistoryTime}>
                      {new Date(log.logged_at).toLocaleTimeString('es-UY', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </Text>
                    <Text style={styles.dayHistoryDrink}>{getDrinkLabel(log.drink_type)}</Text>
                  </View>
                  <View style={styles.dayHistoryActions}>
                    <Text style={styles.dayHistoryValue}>
                      +{formatVolume(log.amount_ml, volumeUnit)}
                    </Text>
                    <Pressable
                      onPress={() => deleteLog(log.id)}
                      disabled={isDeleting}
                      style={styles.deleteButton}
                      accessibilityRole="button"
                      accessibilityLabel="Quitar registro"
                    >
                      <Ionicons name="trash-outline" size={16} color={Colors.textMuted} />
                    </Pressable>
                  </View>
                </View>
              ))
            ) : (
              <Text style={styles.emptyText}>Todavia no registraste bebidas hoy.</Text>
            )}
          </View>
        </Card>

        <Card style={styles.weekCard} shadow={false}>
          <Text style={styles.sectionTitle}>Promedio semanal</Text>
          <Text style={styles.weekAverage}>{formatVolume(weeklyAverage, volumeUnit)}</Text>
          <Text style={styles.weekHint}>
            Dias con meta: {weeklyData.filter((item) => item.total >= goal).length}/{weeklyData.length}
          </Text>
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
  heroCard: {
    alignItems: 'center',
    gap: Spacing[4],
    backgroundColor: withOpacity(Colors.water, 0.08),
    borderColor: withOpacity(Colors.water, 0.18),
  },
  heroValue: {
    fontFamily: FontFamily.display,
    fontSize: 34,
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
    fontSize: 26,
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
  drinkCard: {
    gap: Spacing[3],
  },
  drinkGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing[2],
  },
  drinkPill: {
    minWidth: '31%',
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.bgElevated,
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
    fontSize: 16,
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
    gap: Spacing[3],
  },
  quickButton: {
    width: '48%',
    minHeight: 104,
    borderRadius: Radius.xl,
    backgroundColor: Colors.bgElevated,
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
  customCard: {
    gap: Spacing[3],
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
  dayHistoryCard: {
    gap: Spacing[3],
  },
  dayHistoryList: {
    gap: Spacing[2],
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
  weekCard: {
    gap: Spacing[2],
    backgroundColor: withOpacity(Colors.water, 0.06),
    borderColor: withOpacity(Colors.water, 0.18),
  },
  weekAverage: {
    fontFamily: FontFamily.display,
    fontSize: 28,
    color: Colors.textPrimary,
  },
  weekHint: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.base,
    color: Colors.textSecondary,
  },
});
