import React, { useEffect, useMemo, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { router } from 'expo-router';
import SafeScreen from '@/components/ui/SafeScreen';
import { Header } from '@/components/layout/Header';
import ModuleIntroScreen from '@/components/modules/ModuleIntroScreen';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import EmptyState from '@/components/ui/EmptyState';
import Skeleton from '@/components/ui/Skeleton';
import { Colors, withOpacity } from '@/constants/colors';
import { Spacing, Radius, FontFamily } from '@/constants/theme';
import { useSupplements, type Supplement } from '@/hooks/useSupplements';
import { useNutrition } from '@/hooks/useNutrition';
import { triggerImpactHaptic } from '@/lib/haptics';
import { buildSupplementNutritionInsight } from '@/lib/module-correlations';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { AddSupplementSheet } from './components/AddSupplementSheet';

const UNIT_LABELS: Record<string, string> = {
  mg: 'mg',
  g: 'g',
  ml: 'ml',
  caps: 'caps.',
  IU: 'UI',
  tablets: 'tabs.',
  scoops: 'scoops',
};

const FREQ_LABELS: Record<string, string> = {
  daily: 'Diario',
  weekly: 'Semanal',
  as_needed: 'Según necesidad',
};

type WeeklyMatrix = Record<string, Record<string, 'taken' | 'missed' | 'na'>>;
type WeeklyLogRow = { supplement_id: string; taken_at: string };

function pad2(value: number) {
  return String(value).padStart(2, '0');
}

function dateKey(date: Date) {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
}

function buildLast7Days() {
  const days: string[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let index = 6; index >= 0; index -= 1) {
    const day = new Date(today);
    day.setDate(today.getDate() - index);
    days.push(dateKey(day));
  }

  return days;
}

function getSlot(time: string | undefined) {
  if (!time) return 'Sin horario';
  const hour = Number((time.split(':')[0] ?? '0').trim());
  if (hour < 12) return 'Manana';
  if (hour < 18) return 'Tarde';
  return 'Noche';
}

function supplementCode(name: string) {
  const cleaned = name.trim().split(' ').filter(Boolean);
  if (cleaned.length === 1) return cleaned[0]!.slice(0, 2).toUpperCase();
  return `${cleaned[0]![0] ?? ''}${cleaned[1]![0] ?? ''}`.toUpperCase();
}

function buildGroups(supplements: Supplement[]) {
  const groups = new Map<string, Array<{ supplement: Supplement; label: string }>>();

  supplements.forEach((supplement) => {
    const slotLabel = getSlot(supplement.reminder_times[0]);
    const list = groups.get(slotLabel) ?? [];
    list.push({
      supplement,
      label: supplement.reminder_times[0] ?? 'Flexible',
    });
    groups.set(slotLabel, list);
  });

  return ['Manana', 'Tarde', 'Noche', 'Sin horario']
    .map((label) => ({
      label,
      items: groups.get(label) ?? [],
    }))
    .filter((group) => group.items.length > 0);
}

export default function SupplementsScreen() {
  const profile = useAuthStore((state) => state.profile);
  const hasSeenIntro = useSettingsStore((state) => Boolean(state.moduleIntroSeen.supplements));
  const markModuleIntroSeen = useSettingsStore((state) => state.markModuleIntroSeen);
  const {
    supplements,
    loading,
    saving,
    markTaken,
    unmarkTaken,
    addSupplement,
    isTakenToday,
    dailyAdherenceStreak,
    interactionWarnings,
  } = useSupplements();
  const { totals, hasEaten } = useNutrition();
  const supplementsDisclaimerAccepted = useSettingsStore((state) => state.supplementsDisclaimerAccepted);
  const setSupplementsDisclaimerAccepted = useSettingsStore(
    (state) => state.setSupplementsDisclaimerAccepted,
  );

  const [showAdd, setShowAdd] = useState(false);
  const [weeklyMatrix, setWeeklyMatrix] = useState<WeeklyMatrix>({});

  const todayCount = supplements.filter((supplement) => isTakenToday(supplement.id)).length;
  const totalDaily = supplements.filter((supplement) => supplement.frequency === 'daily').length;
  const last7Days = useMemo(() => buildLast7Days(), []);

  useEffect(() => {
    const userId = profile?.id;
    if (!userId || !supplements.length) {
      setWeeklyMatrix({});
      return;
    }

    let active = true;

    void (async () => {
      const from = new Date();
      from.setDate(from.getDate() - 6);
      from.setHours(0, 0, 0, 0);

      const { data } = await supabase
        .from('supplement_logs')
        .select('supplement_id, taken_at')
        .eq('user_id', userId)
        .gte('taken_at', from.toISOString());

      if (!active) return;

      const takenMap = new Map<string, Set<string>>();
      ((data ?? []) as WeeklyLogRow[]).forEach((row) => {
        const key = dateKey(new Date(row.taken_at));
        const set = takenMap.get(row.supplement_id) ?? new Set<string>();
        set.add(key);
        takenMap.set(row.supplement_id, set);
      });

      const nextMatrix: WeeklyMatrix = {};
      supplements.forEach((supplement) => {
        nextMatrix[supplement.id] = {};
        last7Days.forEach((day) => {
          const taken = takenMap.get(supplement.id)?.has(day) ?? false;
          if (taken) {
            nextMatrix[supplement.id]![day] = 'taken';
          } else if (supplement.frequency === 'daily') {
            nextMatrix[supplement.id]![day] = 'missed';
          } else {
            nextMatrix[supplement.id]![day] = 'na';
          }
        });
      });

      setWeeklyMatrix(nextMatrix);
    })();

    return () => {
      active = false;
    };
  }, [last7Days, profile?.id, supplements]);

  const stackGroups = useMemo(() => buildGroups(supplements), [supplements]);

  const nutritionInsight = buildSupplementNutritionInsight({
    supplementCount: totalDaily,
    takenToday: todayCount,
    proteinGrams: totals.protein,
    calories: totals.calories,
    hasBreakfast: hasEaten.breakfast,
    hasLunch: hasEaten.lunch,
    hasDinner: hasEaten.dinner,
    hasWarnings: interactionWarnings.length > 0,
  });

  const handleToggle = async (supplement: Supplement) => {
    const taken = isTakenToday(supplement.id);
    await triggerImpactHaptic('light');
    if (taken) {
      await unmarkTaken(supplement.id);
    } else {
      await markTaken(supplement.id);
    }
  };

  if (!hasSeenIntro) {
    return (
      <SafeScreen padHorizontal={false} padBottom>
        <Header title="Suplementos" showBack color={Colors.brand} />
        <ModuleIntroScreen
          accentColor={Colors.brand}
          icon="Stack"
          title="Suplementos"
          body="Aqui ordenas tu stack, ves adherencia y mantienes avisos claros antes de empezar a tocar horarios o tomas."
          ctaLabel="Ver mi stack"
          onContinue={() => markModuleIntroSeen('supplements')}
        />
      </SafeScreen>
    );
  }

  if (loading) {
    return (
      <SafeScreen padHorizontal={false} padBottom>
        <Header title="Suplementos" showBack color={Colors.brand} />
        <ScrollView contentContainerStyle={styles.scroll}>
          <Skeleton height={80} style={styles.skeleton} />
          <Skeleton height={140} style={styles.skeleton} />
          <Skeleton height={200} style={styles.skeleton} />
        </ScrollView>
      </SafeScreen>
    );
  }

  return (
    <SafeScreen padHorizontal={false} padBottom>
      <Header title="Suplementos" showBack color={Colors.brand} />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {!supplementsDisclaimerAccepted ? (
          <Card style={styles.onboardingCard}>
            <Text style={styles.onboardingEyebrow}>Primer uso del módulo</Text>
            <Text style={styles.onboardingTitle}>Antes de arrancar: una sola aclaración útil</Text>
            <Text style={styles.onboardingText}>
              Vyra te ayuda a ordenar tomas, horarios y adherencia. No reemplaza indicación médica ni recomienda dosis por su cuenta.
            </Text>
            <Button
              onPress={() => setSupplementsDisclaimerAccepted(true)}
              color={Colors.brand}
              fullWidth
            >
              Entendido, continuar
            </Button>
          </Card>
        ) : null}

        {supplements.length > 0 ? (
          <Card style={styles.summaryCard}>
            <Text style={styles.sectionTitle}>Stack de hoy</Text>
            <View style={styles.summaryRow}>
              <View style={styles.summaryCircle}>
                <Text style={styles.summaryNum}>{todayCount}</Text>
                <Text style={styles.summaryDen}>/{Math.max(totalDaily, 1)}</Text>
              </View>
              <View style={styles.summaryRight}>
                <Text style={styles.summaryLabel}>
                  {todayCount === totalDaily && totalDaily > 0
                    ? 'Todo tomado hoy'
                    : `Faltan ${Math.max(0, totalDaily - todayCount)} suplementos diarios`}
                </Text>
                <Text style={styles.summarySubLabel}>
                  {new Date().toLocaleDateString('es-UY', {
                    weekday: 'long',
                    day: '2-digit',
                    month: 'long',
                  })}
                </Text>
              </View>
            </View>
          </Card>
        ) : null}

        {dailyAdherenceStreak > 0 ? (
          <Card style={styles.streakCard}>
            <Text style={styles.streakTitle}>Racha de adherencia</Text>
            <Text style={styles.streakValue}>{dailyAdherenceStreak} días</Text>
            <Text style={styles.streakHint}>
              Días seguidos tomando todo tu stack diario.
            </Text>
          </Card>
        ) : null}

        {interactionWarnings.map((warning) => (
          <Card key={warning.id} style={styles.warningCard}>
            <Text style={styles.warningTitle}>Interacción a revisar</Text>
            <Text style={styles.warningText}>{warning.message}</Text>
          </Card>
        ))}

        <Card style={styles.stackCard}>
          <Text style={styles.sectionTitle}>Stack visual</Text>
          {supplements.length === 0 ? (
            <EmptyState
              icon="Pildoras"
              title="Sin suplementos"
              description="Agrega tu primer suplemento para ordenar tomas y adherencia."
              ctaLabel="Agregar suplemento"
              onCta={() => setShowAdd(true)}
            />
          ) : (
            stackGroups.map((group) => (
              <View key={group.label} style={styles.groupBlock}>
                <Text style={styles.groupTitle}>
                  {group.label}
                  {group.items[0]?.label && group.items[0]?.label !== 'Flexible' ? ` (${group.items[0]!.label})` : ''}
                </Text>
                {group.items.map(({ supplement }) => {
                  const taken = isTakenToday(supplement.id);
                  return (
                    <Pressable
                      key={supplement.id}
                      style={({ pressed }) => [styles.stackRow, pressed && styles.stackRowPressed]}
                      onPress={() => void handleToggle(supplement)}
                      accessibilityRole="checkbox"
                      accessibilityState={{ checked: taken }}
                      accessibilityLabel={supplement.name}
                      accessibilityHint="Marca si ya tomaste este suplemento hoy."
                    >
                      <View style={styles.stackLeft}>
                        <View style={styles.codeBadge}>
                          <Text style={styles.codeBadgeText}>{supplementCode(supplement.name)}</Text>
                        </View>
                        <View style={styles.stackCopy}>
                          <Text style={styles.stackName}>{supplement.name}</Text>
                          <Text style={styles.stackMeta}>
                            {supplement.dose} {UNIT_LABELS[supplement.unit]} | {FREQ_LABELS[supplement.frequency]}
                          </Text>
                        </View>
                      </View>
                      <View style={[styles.dot, taken ? styles.dotTaken : styles.dotPending]} />
                    </Pressable>
                  );
                })}
              </View>
            ))
          )}
        </Card>

        {supplements.length > 0 ? (
          <Card style={styles.matrixCard}>
            <Text style={styles.sectionTitle}>Adherencia semanal</Text>
            <View style={styles.matrixHeader}>
              <View style={styles.matrixNameSpacer} />
              {last7Days.map((day) => (
                <Text key={`header-${day}`} style={styles.matrixHeaderText}>
                  {day.slice(8)}
                </Text>
              ))}
            </View>
            {supplements.map((supplement) => (
              <View key={`matrix-${supplement.id}`} style={styles.matrixRow}>
                <Text style={styles.matrixName}>{supplement.name}</Text>
                {last7Days.map((day) => {
                  const status = weeklyMatrix[supplement.id]?.[day] ?? 'na';
                  return (
                    <View
                      key={`${supplement.id}-${day}`}
                      style={[
                        styles.matrixCell,
                        status === 'taken'
                          ? styles.matrixCellTaken
                          : status === 'missed'
                            ? styles.matrixCellMissed
                            : styles.matrixCellNA,
                      ]}
                    />
                  );
                })}
              </View>
            ))}
          </Card>
        ) : null}

        <Card
          style={[
            styles.nutritionCard,
            nutritionInsight.tone === 'warning'
              ? styles.nutritionCardWarning
              : nutritionInsight.tone === 'positive'
                ? styles.nutritionCardPositive
                : styles.nutritionCardNeutral,
          ]}
        >
          <Text style={styles.nutritionTitle}>{nutritionInsight.title}</Text>
          <Text style={styles.nutritionText}>{nutritionInsight.body}</Text>
          <View style={styles.nutritionMetaRow}>
            <Text style={styles.nutritionMeta}>Proteína: {Math.round(totals.protein)} g</Text>
            <Text style={styles.nutritionMeta}>Kcal: {Math.round(totals.calories)}</Text>
          </View>
          <Button
            label="Abrir nutrición"
            onPress={() => router.push('/modules/nutrition' as never)}
            size="sm"
            color={Colors.brand}
          />
        </Card>

        <Button
          label="+ Agregar suplemento"
          onPress={() => setShowAdd(true)}
          color={Colors.brand}
          style={styles.addBtn}
        />
      </ScrollView>

      <AddSupplementSheet
        visible={showAdd}
        onClose={() => setShowAdd(false)}
        onSave={async (name, dose, unit, frequency, reminders) => {
          await addSupplement(name, dose, unit, frequency, reminders);
          setShowAdd(false);
        }}
        saving={saving}
      />
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
  skeleton: {
    borderRadius: Radius.xl,
    marginBottom: Spacing[3],
  },
  onboardingCard: {
    gap: Spacing[3],
    borderWidth: 1,
    borderColor: withOpacity(Colors.brand, 0.25),
    backgroundColor: withOpacity(Colors.brand, 0.08),
  },
  onboardingEyebrow: {
    fontFamily: FontFamily.semibold,
    fontSize: 11,
    color: Colors.brand,
    textTransform: 'uppercase',
    letterSpacing: 0.9,
  },
  onboardingTitle: {
    fontFamily: FontFamily.bold,
    fontSize: 18,
    color: Colors.textPrimary,
  },
  onboardingText: {
    fontFamily: FontFamily.regular,
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 19,
  },
  summaryCard: {},
  sectionTitle: {
    fontFamily: FontFamily.bold,
    fontSize: 16,
    color: Colors.textPrimary,
    marginBottom: Spacing[3],
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[4],
  },
  summaryCircle: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 2,
  },
  summaryNum: {
    fontFamily: FontFamily.bold,
    fontSize: 42,
    color: Colors.brand,
  },
  summaryDen: {
    fontFamily: FontFamily.medium,
    fontSize: 22,
    color: Colors.textSecondary,
  },
  summaryRight: {
    flex: 1,
    gap: Spacing[1],
  },
  summaryLabel: {
    fontFamily: FontFamily.bold,
    fontSize: 16,
    color: Colors.textPrimary,
  },
  summarySubLabel: {
    fontFamily: FontFamily.regular,
    fontSize: 13,
    color: Colors.textSecondary,
    textTransform: 'capitalize',
  },
  streakCard: {
    borderWidth: 1,
    borderColor: withOpacity(Colors.brand, 0.25),
    backgroundColor: withOpacity(Colors.brand, 0.08),
  },
  streakTitle: {
    fontFamily: FontFamily.bold,
    fontSize: 14,
    color: Colors.brand,
    marginBottom: Spacing[1],
  },
  streakValue: {
    fontFamily: FontFamily.bold,
    fontSize: 30,
    color: Colors.textPrimary,
    lineHeight: 34,
  },
  streakHint: {
    marginTop: Spacing[1],
    fontFamily: FontFamily.regular,
    fontSize: 12,
    color: Colors.textSecondary,
  },
  warningCard: {
    borderWidth: 1,
    borderColor: withOpacity(Colors.warning, 0.35),
    backgroundColor: withOpacity(Colors.warning, 0.12),
    gap: Spacing[2],
  },
  warningTitle: {
    fontFamily: FontFamily.bold,
    fontSize: 14,
    color: Colors.warning,
  },
  warningText: {
    fontFamily: FontFamily.medium,
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  stackCard: {
    gap: Spacing[3],
  },
  groupBlock: {
    gap: Spacing[2],
  },
  groupTitle: {
    fontFamily: FontFamily.semibold,
    fontSize: 14,
    color: Colors.textSecondary,
  },
  stackRow: {
    minHeight: 58,
    borderRadius: Radius.lg,
    backgroundColor: Colors.bgElevated,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing[3],
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing[3],
  },
  stackRowPressed: {
    opacity: 0.9,
  },
  stackLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[3],
    flex: 1,
  },
  codeBadge: {
    width: 38,
    height: 38,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: withOpacity(Colors.brand, 0.12),
  },
  codeBadgeText: {
    fontFamily: FontFamily.bold,
    fontSize: 12,
    color: Colors.brand,
  },
  stackCopy: {
    flex: 1,
    gap: 2,
  },
  stackName: {
    fontFamily: FontFamily.semibold,
    fontSize: 15,
    color: Colors.textPrimary,
  },
  stackMeta: {
    fontFamily: FontFamily.regular,
    fontSize: 12,
    color: Colors.textSecondary,
  },
  dot: {
    width: 14,
    height: 14,
    borderRadius: Radius.full,
  },
  dotTaken: {
    backgroundColor: Colors.success,
  },
  dotPending: {
    backgroundColor: Colors.textMuted,
  },
  matrixCard: {
    gap: Spacing[3],
  },
  matrixHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[1.5],
  },
  matrixNameSpacer: {
    width: 94,
  },
  matrixHeaderText: {
    width: 18,
    textAlign: 'center',
    fontFamily: FontFamily.medium,
    fontSize: 11,
    color: Colors.textMuted,
  },
  matrixRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[1.5],
  },
  matrixName: {
    width: 94,
    fontFamily: FontFamily.regular,
    fontSize: 12,
    color: Colors.textSecondary,
  },
  matrixCell: {
    width: 18,
    height: 18,
    borderRadius: 5,
  },
  matrixCellTaken: {
    backgroundColor: Colors.success,
  },
  matrixCellMissed: {
    backgroundColor: withOpacity(Colors.white, 0.08),
  },
  matrixCellNA: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: withOpacity(Colors.white, 0.08),
  },
  nutritionCard: {
    borderWidth: 1,
    gap: Spacing[2],
  },
  nutritionCardNeutral: {
    borderColor: withOpacity(Colors.brand, 0.25),
    backgroundColor: withOpacity(Colors.brand, 0.08),
  },
  nutritionCardPositive: {
    borderColor: withOpacity(Colors.success, 0.25),
    backgroundColor: withOpacity(Colors.success, 0.08),
  },
  nutritionCardWarning: {
    borderColor: withOpacity(Colors.warning, 0.35),
    backgroundColor: withOpacity(Colors.warning, 0.12),
  },
  nutritionTitle: {
    fontFamily: FontFamily.bold,
    fontSize: 14,
    color: Colors.textPrimary,
  },
  nutritionText: {
    fontFamily: FontFamily.medium,
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 19,
  },
  nutritionMetaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing[2],
  },
  nutritionMeta: {
    fontFamily: FontFamily.semibold,
    fontSize: 12,
    color: Colors.textMuted,
  },
  addBtn: {
    marginTop: Spacing[2],
  },
});
