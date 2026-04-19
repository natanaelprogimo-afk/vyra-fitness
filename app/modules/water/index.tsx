import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Header from '@/components/layout/Header';
import ModuleIntroScreen from '@/components/modules/ModuleIntroScreen';
import ProgressCircle from '@/components/charts/ProgressCircle';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import SafeScreen from '@/components/ui/SafeScreen';
import { Colors, withOpacity } from '@/constants/colors';
import { FontFamily, FontSize, Radius, Spacing } from '@/constants/theme';
import { useWater } from '@/hooks/useWater';
import { useSettingsStore } from '@/stores/settingsStore';

type QuickObject = {
  id: 'glass' | 'large_glass' | 'bottle';
  label: string;
  amount: number;
};

export default function WaterScreen() {
  const hasSeenIntro = useSettingsStore((state) => Boolean(state.moduleIntroSeen.water));
  const markModuleIntroSeen = useSettingsStore((state) => state.markModuleIntroSeen);
  const glassMl = useSettingsStore((state) => state.waterGlassMl);
  const largeGlassMl = useSettingsStore((state) => state.waterLargeGlassMl);
  const bottleMl = useSettingsStore((state) => state.waterBottleMl);
  const {
    logs,
    totalHydro,
    goal,
    progressPct,
    remaining,
    weeklyData,
    logWater,
    isLogging,
  } = useWater();
  const [customAmount, setCustomAmount] = useState('650');
  const [showCustomEntry, setShowCustomEntry] = useState(false);
  const quickObjects = useMemo<QuickObject[]>(
    () => [
      { id: 'glass', label: 'Un vaso', amount: glassMl },
      { id: 'large_glass', label: 'Vaso grande', amount: largeGlassMl },
      { id: 'bottle', label: 'Botella', amount: bottleMl },
    ],
    [bottleMl, glassMl, largeGlassMl],
  );

  if (!hasSeenIntro) {
    return (
      <SafeScreen padHorizontal={false} padBottom>
        <Header title="Agua" showBack />
        <ModuleIntroScreen
          accentColor={Colors.water}
          icon="💧"
          title="Agua"
          body="Este modulo esta hecho para registrar rapido, no para pensar demasiado. Toca y listo."
          ctaLabel="Entrar al modulo"
          onContinue={() => markModuleIntroSeen('water')}
        />
      </SafeScreen>
    );
  }

  const customValue = Math.max(0, parseInt(customAmount, 10) || 0);

  return (
    <SafeScreen padHorizontal={false} padBottom>
      <Header title="Agua" showBack />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Card style={styles.heroCard} shadow={false}>
          <ProgressCircle
            value={progressPct}
            size={120}
            strokeWidth={12}
            color={Colors.water}
            trackColor={Colors.bgElevated}
            animated
            duration={700}
          >
            <Text style={styles.heroValue}>{totalHydro}</Text>
            <Text style={styles.heroUnit}>ml</Text>
          </ProgressCircle>

          <View style={styles.heroCopy}>
            <Text style={styles.heroTitle}>de {goal} ml</Text>
            <Text style={styles.heroBody}>
              {remaining > 0 ? `Faltan ${remaining} ml para la meta.` : 'Meta cubierta por hoy.'}
            </Text>
          </View>
        </Card>

        <View style={styles.quickGrid}>
          {quickObjects.map((item) => (
            <Pressable
              key={item.id}
              style={styles.quickButton}
              disabled={isLogging}
              onPress={() => logWater(item.amount, 'water')}
            >
              <Text style={styles.quickLabel}>{item.label}</Text>
              <Text style={styles.quickAmount}>{item.amount} ml</Text>
            </Pressable>
          ))}
          <Pressable style={styles.quickButton} onPress={() => setShowCustomEntry((value) => !value)}>
            <Text style={styles.quickLabel}>+ Otra</Text>
            <Text style={styles.quickAmount}>cantidad</Text>
          </Pressable>
        </View>

        {showCustomEntry ? (
          <Card style={styles.customCard} shadow={false}>
            <Text style={styles.sectionTitle}>Otra cantidad</Text>
            <Input
              label="Mililitros"
              value={customAmount}
              onChangeText={setCustomAmount}
              keyboardType="numeric"
              unit="ml"
            />
            <Button
              onPress={() => {
                if (!customValue) return;
                logWater(customValue, 'water');
                setShowCustomEntry(false);
              }}
              disabled={!customValue}
              loading={isLogging}
              fullWidth
            >
              Guardar
            </Button>
          </Card>
        ) : null}

        <Card style={styles.dayHistoryCard} shadow={false}>
          <Text style={styles.sectionTitle}>Registros de hoy</Text>
          <View style={styles.dayHistoryList}>
            {logs.length ? (
              logs.map((log) => (
                <View key={log.id} style={styles.dayHistoryRow}>
                  <Text style={styles.dayHistoryTime}>
                    {new Date(log.logged_at).toLocaleTimeString('es-UY', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </Text>
                  <Text style={styles.dayHistoryValue}>+{log.amount_ml} ml</Text>
                </View>
              ))
            ) : (
              <Text style={styles.emptyText}>Todavia no registraste agua hoy.</Text>
            )}
          </View>
        </Card>

        <Card style={styles.weekCard} shadow={false}>
          <Text style={styles.sectionTitle}>Promedio semanal</Text>
          <Text style={styles.weekAverage}>
            {weeklyData.length
              ? `${Math.round(weeklyData.reduce((sum, item) => sum + item.total, 0) / weeklyData.length)} ml`
              : '0 ml'}
          </Text>
          <Text style={styles.weekHint}>
            Dias con meta: {weeklyData.filter((item) => item.total >= goal).length}/{weeklyData.length}
          </Text>
        </Card>
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[4],
  },
  heroValue: {
    fontFamily: FontFamily.display,
    fontSize: 28,
    color: Colors.textPrimary,
  },
  heroUnit: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.base,
    color: Colors.textSecondary,
  },
  heroCopy: {
    flex: 1,
    gap: Spacing[2],
  },
  heroTitle: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.xl,
    color: Colors.textPrimary,
  },
  heroBody: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.base,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  quickGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing[3],
  },
  quickButton: {
    width: '48%',
    minHeight: 72,
    borderRadius: Radius.md,
    backgroundColor: Colors.bgElevated,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[3],
    justifyContent: 'center',
    gap: 4,
  },
  quickLabel: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.base,
    color: Colors.textPrimary,
  },
  quickAmount: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
  },
  customCard: {
    gap: Spacing[3],
  },
  sectionTitle: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.md,
    color: Colors.textPrimary,
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
    gap: Spacing[3],
    paddingBottom: Spacing[2],
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  dayHistoryTime: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.base,
    color: Colors.textSecondary,
  },
  dayHistoryValue: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.base,
    color: Colors.textPrimary,
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
