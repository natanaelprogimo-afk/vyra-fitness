import React, { useEffect, useMemo, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import SafeScreen from '@/components/ui/SafeScreen';
import { Header } from '@/components/layout/Header';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import EmptyState from '@/components/ui/EmptyState';
import Skeleton from '@/components/ui/Skeleton';
import { Colors, withOpacity } from '@/constants/colors';
import { Spacing, Radius, FontFamily } from '@/constants/theme';
import { SupplementFrequencyLabels, SupplementTimeSlots } from '@/constants/strings';
import { useSupplements, type Supplement } from '@/hooks/useSupplements';
import { useNutrition } from '@/hooks/useNutrition';
import { triggerImpactHaptic } from '@/lib/haptics';
import { buildSupplementNutritionInsight } from '@/lib/module-correlations';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { AddSupplementSheet } from './components/AddSupplementSheet';

const SUPPLEMENTS_ACCENT = Colors.supplements;

const UNIT_LABELS: Record<string, string> = {
  mg: 'mg',
  g: 'g',
  ml: 'ml',
  caps: 'caps.',
  IU: 'UI',
  tablets: 'tabs.',
  scoops: 'scoops',
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
  if (!time) return SupplementTimeSlots.unscheduled;
  const hour = Number((time.split(':')[0] ?? '0').trim());
  if (hour < 12) return SupplementTimeSlots.morning;
  if (hour < 18) return SupplementTimeSlots.afternoon;
  return SupplementTimeSlots.evening;
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

  return [
    SupplementTimeSlots.morning,
    SupplementTimeSlots.afternoon,
    SupplementTimeSlots.evening,
    SupplementTimeSlots.unscheduled,
  ]
    .map((label) => ({
      label,
      items: groups.get(label) ?? [],
    }))
    .filter((group) => group.items.length > 0);
}

export default function SupplementsScreen() {
  const profile = useAuthStore((state) => state.profile);
  const {
    supplements,
    todayLogs,
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
      const todayKey = last7Days[last7Days.length - 1];
      const takenToday = new Set(todayLogs.map((log) => log.supplement_id));

      supplements.forEach((supplement) => {
        nextMatrix[supplement.id] = {};
        last7Days.forEach((day) => {
          const taken =
            day === todayKey
              ? takenToday.has(supplement.id) || (takenMap.get(supplement.id)?.has(day) ?? false)
              : (takenMap.get(supplement.id)?.has(day) ?? false);
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
  }, [last7Days, profile?.id, supplements, todayLogs]);

  const stackGroups = useMemo(() => buildGroups(supplements), [supplements]);
  const todayTarget = totalDaily > 0 ? totalDaily : supplements.length;
  const completionPct = Math.max(0, Math.min(100, Math.round((todayCount / Math.max(todayTarget, 1)) * 100)));
  const nextPendingGroup = useMemo(
    () => stackGroups.find((group) => group.items.some(({ supplement }) => !isTakenToday(supplement.id))) ?? stackGroups[0] ?? null,
    [isTakenToday, stackGroups],
  );
  const nextPendingItem = nextPendingGroup?.items.find(({ supplement }) => !isTakenToday(supplement.id))
    ?? nextPendingGroup?.items[0]
    ?? null;

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

  if (loading) {
    return (
      <SafeScreen padHorizontal={false} padBottom>
        <Header title="Suplementos" showBack color={SUPPLEMENTS_ACCENT} />
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
      <Header title="Suplementos" showBack color={SUPPLEMENTS_ACCENT} />

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
              color={SUPPLEMENTS_ACCENT}
              fullWidth
            >
              Entendido, continuar
            </Button>
          </Card>
        ) : null}

        {supplements.length > 0 ? (
          <Card style={styles.summaryCard}>
            <View style={styles.summaryHeaderRow}>
              <View>
                <Text style={styles.summaryEyebrow}>Hoy</Text>
                <Text style={styles.summaryTitle}>Que te toca tomar ahora</Text>
              </View>
              {dailyAdherenceStreak > 0 ? (
                <View style={styles.streakBadge}>
                  <Ionicons name="flame" size={12} color={SUPPLEMENTS_ACCENT} />
                  <Text style={styles.streakBadgeText}>{dailyAdherenceStreak} d</Text>
                </View>
              ) : null}
            </View>

            <View style={styles.summaryRow}>
              <View style={styles.summaryCircle}>
                <Text style={styles.summaryNum}>{todayCount}</Text>
                <Text style={styles.summaryDen}>/{Math.max(todayTarget, 1)}</Text>
              </View>
              <View style={styles.summaryRight}>
                <Text style={styles.summaryLabel}>
                  {completionPct >= 100
                    ? 'Todo tu stack del día está listo'
                    : `Te faltan ${Math.max(0, todayTarget - todayCount)} tomas para cerrar el día`}
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

            <View style={styles.summaryProgressTrack}>
              <View style={[styles.summaryProgressFill, { width: `${completionPct}%` }]} />
            </View>

            <View style={styles.summaryMetaRow}>
              <View style={styles.summaryMetaPill}>
                <Text style={styles.summaryMetaLabel}>Adherencia hoy</Text>
                <Text style={styles.summaryMetaValue}>{completionPct}%</Text>
              </View>
              <View style={styles.summaryMetaPill}>
                <Text style={styles.summaryMetaLabel}>Stack activo</Text>
                <Text style={styles.summaryMetaValue}>{supplements.length} items</Text>
              </View>
            </View>

            {nextPendingGroup ? (
              <View style={styles.nextSlotCard}>
                <Text style={styles.nextSlotEyebrow}>Próxima franja</Text>
                <Text style={styles.nextSlotTitle}>{nextPendingGroup.label}</Text>
                <Text style={styles.nextSlotBody}>
                  {nextPendingItem
                    ? `${nextPendingItem.supplement.name} · ${nextPendingItem.supplement.dose} ${UNIT_LABELS[nextPendingItem.supplement.unit]}${nextPendingItem.label && nextPendingItem.label !== 'Flexible' ? ` · ${nextPendingItem.label}` : ''}`
                    : 'Todavía no hay tomas pendientes en esta franja.'}
                </Text>
              </View>
            ) : null}
          </Card>
        ) : null}

        {interactionWarnings.map((warning) => (
          <Card key={warning.id} style={styles.warningCard}>
            <Text style={styles.warningTitle}>Interacción a revisar</Text>
            <Text style={styles.warningText}>{warning.message}</Text>
          </Card>
        ))}

        <Card style={styles.stackCard}>
          <Text style={styles.sectionTitle}>Por horario</Text>
          <Text style={styles.sectionBody}>
            Marca cada toma desde su franja real. Lo importante acá es saber qué sigue y qué ya quedó hecho.
          </Text>
          {supplements.length === 0 ? (
            <EmptyState
              emoji="💊"
              title="Sin suplementos"
              description="Agrega tu primer suplemento para ordenar tomas y adherencia."
              compact
            />
          ) : (
            stackGroups.map((group) => (
              <View key={group.label} style={styles.slotCard}>
                <View style={styles.slotHeader}>
                  <View style={styles.slotHeaderCopy}>
                    <Text style={styles.groupTitle}>{group.label}</Text>
                    <Text style={styles.slotHeaderHint}>
                      {group.items[0]?.label && group.items[0]?.label !== 'Flexible'
                        ? group.items[0]!.label
                        : 'Sin horario exacto'}
                    </Text>
                  </View>
                  <View style={styles.slotBadge}>
                    <Text style={styles.slotBadgeText}>
                      {group.items.filter(({ supplement }) => isTakenToday(supplement.id)).length}/{group.items.length}
                    </Text>
                  </View>
                </View>
                {group.items.map(({ supplement, label }) => {
                  const taken = isTakenToday(supplement.id);
                  return (
                    <Pressable
                      key={supplement.id}
                      style={({ pressed }) => [
                        styles.stackRow,
                        taken && styles.stackRowTaken,
                        pressed && styles.stackRowPressed,
                      ]}
                      onPress={() => void handleToggle(supplement)}
                      accessibilityRole="checkbox"
                      accessibilityState={{ checked: taken }}
                      accessibilityLabel={supplement.name}
                      accessibilityHint="Marca si ya tomaste este suplemento hoy."
                    >
                      <View style={styles.stackLeft}>
                        <View style={[styles.checkCircle, taken && styles.checkCircleTaken]}>
                          <Ionicons
                            name={taken ? 'checkmark' : 'ellipse-outline'}
                            size={18}
                            color={taken ? Colors.black : SUPPLEMENTS_ACCENT}
                          />
                        </View>
                        <View style={styles.stackCopy}>
                          <Text style={styles.stackName}>{supplement.name}</Text>
                          <Text style={styles.stackMeta}>
                            {supplement.dose} {UNIT_LABELS[supplement.unit]} · {SupplementFrequencyLabels[supplement.frequency]}
                            {label ? ` · ${label}` : ''}
                          </Text>
                        </View>
                      </View>
                      <Text style={[styles.rowStateText, taken ? styles.rowStateTextTaken : styles.rowStateTextPending]}>
                        {taken ? 'Tomado' : 'Tocar para marcar'}
                      </Text>
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
          {Math.round(totals.protein) > 0 || Math.round(totals.calories) > 0 ? (
            <View style={styles.nutritionMetaRow}>
              {Math.round(totals.protein) > 0 ? (
                <Text style={styles.nutritionMeta}>Proteína: {Math.round(totals.protein)} g</Text>
              ) : null}
              {Math.round(totals.calories) > 0 ? (
                <Text style={styles.nutritionMeta}>Kcal: {Math.round(totals.calories)}</Text>
              ) : null}
            </View>
          ) : (
            <Text style={styles.nutritionMetaEmpty}>
              Los datos de proteína y calorías aparecen cuando registres tu primera comida del día.
            </Text>
          )}
          <Button
            label="Abrir nutrición"
            onPress={() => router.push('/modules/nutrition' as never)}
            size="sm"
            color={SUPPLEMENTS_ACCENT}
          />
        </Card>

        <Button
          label="+ Agregar suplemento"
          onPress={() => setShowAdd(true)}
          color={SUPPLEMENTS_ACCENT}
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
    borderColor: withOpacity(SUPPLEMENTS_ACCENT, 0.25),
    backgroundColor: withOpacity(SUPPLEMENTS_ACCENT, 0.08),
  },
  onboardingEyebrow: {
    fontFamily: FontFamily.semibold,
    fontSize: 11,
    color: SUPPLEMENTS_ACCENT,
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
  summaryCard: {
    gap: Spacing[3],
    borderWidth: 1,
    borderColor: withOpacity(SUPPLEMENTS_ACCENT, 0.22),
    backgroundColor: withOpacity(SUPPLEMENTS_ACCENT, 0.08),
  },
  summaryHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: Spacing[3],
  },
  summaryEyebrow: {
    fontFamily: FontFamily.semibold,
    fontSize: 11,
    color: SUPPLEMENTS_ACCENT,
    textTransform: 'uppercase',
    letterSpacing: 0.9,
    marginBottom: Spacing[1],
  },
  summaryTitle: {
    fontFamily: FontFamily.bold,
    fontSize: 18,
    color: Colors.textPrimary,
  },
  sectionTitle: {
    fontFamily: FontFamily.bold,
    fontSize: 16,
    color: Colors.textPrimary,
    marginBottom: Spacing[3],
  },
  sectionBody: {
    marginTop: -Spacing[2],
    fontFamily: FontFamily.regular,
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 19,
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
    color: SUPPLEMENTS_ACCENT,
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
  summaryProgressTrack: {
    height: 8,
    borderRadius: Radius.full,
    backgroundColor: withOpacity(Colors.white, 0.08),
    overflow: 'hidden',
  },
  summaryProgressFill: {
    height: '100%',
    borderRadius: Radius.full,
    backgroundColor: SUPPLEMENTS_ACCENT,
  },
  summaryMetaRow: {
    flexDirection: 'row',
    gap: Spacing[2],
  },
  summaryMetaPill: {
    flex: 1,
    gap: 2,
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[2],
    backgroundColor: withOpacity(Colors.white, 0.04),
    borderWidth: 1,
    borderColor: withOpacity(Colors.white, 0.06),
  },
  summaryMetaLabel: {
    fontFamily: FontFamily.medium,
    fontSize: 11,
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.7,
  },
  summaryMetaValue: {
    fontFamily: FontFamily.bold,
    fontSize: 14,
    color: Colors.textPrimary,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[1.5],
    backgroundColor: withOpacity(SUPPLEMENTS_ACCENT, 0.12),
    borderWidth: 1,
    borderColor: withOpacity(SUPPLEMENTS_ACCENT, 0.22),
  },
  streakBadgeText: {
    fontFamily: FontFamily.semibold,
    fontSize: 12,
    color: SUPPLEMENTS_ACCENT,
  },
  nextSlotCard: {
    gap: Spacing[1],
    borderRadius: Radius.xl,
    padding: Spacing[3],
    backgroundColor: withOpacity(Colors.black, 0.18),
    borderWidth: 1,
    borderColor: withOpacity(SUPPLEMENTS_ACCENT, 0.12),
  },
  nextSlotEyebrow: {
    fontFamily: FontFamily.medium,
    fontSize: 11,
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  nextSlotTitle: {
    fontFamily: FontFamily.bold,
    fontSize: 15,
    color: Colors.textPrimary,
  },
  nextSlotBody: {
    fontFamily: FontFamily.regular,
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 19,
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
  slotCard: {
    gap: Spacing[2],
    borderRadius: Radius.xl,
    padding: Spacing[3],
    backgroundColor: withOpacity(Colors.white, 0.03),
    borderWidth: 1,
    borderColor: withOpacity(Colors.white, 0.06),
  },
  slotHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing[3],
  },
  slotHeaderCopy: {
    flex: 1,
    gap: 2,
  },
  slotHeaderHint: {
    fontFamily: FontFamily.regular,
    fontSize: 12,
    color: Colors.textMuted,
  },
  slotBadge: {
    minWidth: 48,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing[2],
    paddingVertical: Spacing[1.5],
    backgroundColor: withOpacity(SUPPLEMENTS_ACCENT, 0.1),
    borderWidth: 1,
    borderColor: withOpacity(SUPPLEMENTS_ACCENT, 0.18),
  },
  slotBadgeText: {
    fontFamily: FontFamily.bold,
    fontSize: 12,
    color: SUPPLEMENTS_ACCENT,
  },
  groupBlock: {
    gap: Spacing[2],
  },
  groupTitle: {
    fontFamily: FontFamily.bold,
    fontSize: 15,
    color: Colors.textPrimary,
  },
  stackRow: {
    minHeight: 66,
    borderRadius: Radius.lg,
    backgroundColor: Colors.elevated,
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
  stackRowTaken: {
    borderColor: withOpacity(SUPPLEMENTS_ACCENT, 0.16),
    backgroundColor: withOpacity(SUPPLEMENTS_ACCENT, 0.05),
  },
  stackLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[3],
    flex: 1,
  },
  checkCircle: {
    width: 42,
    height: 42,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: withOpacity(SUPPLEMENTS_ACCENT, 0.12),
    borderWidth: 1,
    borderColor: withOpacity(SUPPLEMENTS_ACCENT, 0.22),
  },
  checkCircleTaken: {
    backgroundColor: SUPPLEMENTS_ACCENT,
    borderColor: SUPPLEMENTS_ACCENT,
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
  rowStateText: {
    maxWidth: 88,
    fontFamily: FontFamily.medium,
    fontSize: 11,
    textAlign: 'right',
  },
  rowStateTextTaken: {
    color: SUPPLEMENTS_ACCENT,
  },
  rowStateTextPending: {
    color: Colors.textMuted,
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
    borderColor: withOpacity(SUPPLEMENTS_ACCENT, 0.25),
    backgroundColor: withOpacity(SUPPLEMENTS_ACCENT, 0.08),
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
  nutritionMetaEmpty: {
    fontFamily: FontFamily.medium,
    fontSize: 12,
    color: Colors.textMuted,
  },
  addBtn: {
    marginTop: Spacing[2],
  },
});
