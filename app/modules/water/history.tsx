import { useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import BannerPlacementCard from '@/components/ads/BannerPlacementCard';
import SafeScreen from '@/components/ui/SafeScreen';
import Header from '@/components/layout/Header';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import EmptyState from '@/components/ui/EmptyState';
import { useWater } from '@/hooks/useWater';
import { Colors, withOpacity } from '@/constants/colors';
import { FontSize, FontFamily, Spacing, Radius } from '@/constants/theme';
import { triggerImpactHaptic, triggerNotificationHaptic } from '@/lib/haptics';
import { visibleRatioPercent } from '@/lib/visual-progress';

type WaterHistoryItem = {
  id: string;
  amount_ml: number;
  drink_type: string;
  logged_at: string;
};

function getDrinkLabel(drinkType: string) {
  switch (drinkType) {
    case 'electrolyte_water':
    case 'electrolyte':
      return 'Electrolitos';
    case 'sports_drink':
    case 'sports':
      return 'Isotonica';
    case 'tea':
      return 'Te';
    case 'coffee':
      return 'Cafe';
    case 'juice':
      return 'Jugo';
    case 'soda':
      return 'Gaseosa';
    case 'milk':
      return 'Leche';
    case 'alcohol':
      return 'Alcohol';
    default:
      return 'Agua';
  }
}

export default function WaterHistoryScreen() {
  const { weeklyData, history, goal, hourlyDistribution, deleteLog } = useWater();
  const scrollRef = useRef<ScrollView | null>(null);
  const [pendingDelete, setPendingDelete] = useState<WaterHistoryItem | null>(null);
  const deleteTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingDeleteRef = useRef<WaterHistoryItem | null>(null);
  const maxVal = Math.max(...weeklyData.map((day) => day.total), goal, 1);
  const maxHour = Math.max(...hourlyDistribution.buckets.map((bucket) => bucket.totalMl), 1);
  const visibleHistory = useMemo(
    () => history.filter((log) => log.id !== pendingDelete?.id),
    [history, pendingDelete?.id],
  );

  const clearPendingTimer = () => {
    if (deleteTimerRef.current) {
      clearTimeout(deleteTimerRef.current);
      deleteTimerRef.current = null;
    }
  };

  const finalizePendingDelete = (log: WaterHistoryItem | null) => {
    if (!log?.id) return;
    deleteLog(log.id);
  };

  const handleDeletePress = (log: WaterHistoryItem) => {
    clearPendingTimer();
    void triggerImpactHaptic('light');

    if (pendingDelete) {
      finalizePendingDelete(pendingDelete);
    }

    setPendingDelete(log);
    scrollRef.current?.scrollTo({ y: 0, animated: true });
    deleteTimerRef.current = setTimeout(() => {
      finalizePendingDelete(log);
      setPendingDelete(null);
      deleteTimerRef.current = null;
    }, 4500);
  };

  const handleUndoDelete = () => {
    clearPendingTimer();
    void triggerNotificationHaptic('success');
    setPendingDelete(null);
  };

  useEffect(() => {
    pendingDeleteRef.current = pendingDelete;
  }, [pendingDelete]);

  useEffect(() => {
    return () => {
      clearPendingTimer();
      if (pendingDeleteRef.current) {
        finalizePendingDelete(pendingDeleteRef.current);
      }
    };
  }, []);

  return (
    <SafeScreen>
      <Header title="Historial de agua" showBack color={Colors.water} />

      <ScrollView
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {pendingDelete ? (
          <Card style={styles.undoCard}>
            <View style={styles.undoRow}>
              <View style={styles.undoCopy}>
                <Text style={styles.undoTitle}>Registro marcado para borrar</Text>
                <Text style={styles.undoBody}>
                  +{pendingDelete.amount_ml}ml de {getDrinkLabel(pendingDelete.drink_type)} eliminado. Si fue un toque accidental, puedes deshacerlo ahora.
                </Text>
              </View>
              <Button onPress={handleUndoDelete} variant="ghost" color={Colors.water}>
                Deshacer
              </Button>
            </View>
          </Card>
        ) : null}

        <Card style={styles.chartCard}>
          <Text style={styles.chartTitle}>Últimos 7 días</Text>
          <View style={styles.bars}>
            {weeklyData.map((day) => {
              const pct = Math.min(100, (day.total / maxVal) * 100);
              const isToday = day.date === new Date().toISOString().split('T')[0];
              const reachedGoal = day.total >= goal;
              const dayLabel = new Date(`${day.date}T12:00:00`).toLocaleDateString('es', { weekday: 'short' });

              return (
                <View key={day.date} style={styles.barWrap}>
                  <Text style={styles.barValue}>
                    {day.total >= 1000 ? `${(day.total / 1000).toFixed(1)}L` : `${day.total}ml`}
                  </Text>
                  <View style={styles.barTrack}>
                    <View style={[styles.goalLine, { bottom: `${(goal / maxVal) * 100}%` }]} />
                    <View
                      style={[
                        styles.barFill,
                        {
                          height: `${pct}%`,
                          backgroundColor: reachedGoal ? Colors.water : `${Colors.water}66`,
                        },
                      ]}
                    />
                  </View>
                  <Text style={[styles.barDay, isToday && { color: Colors.water, fontFamily: FontFamily.bold }]}>
                    {isToday ? 'Hoy' : dayLabel}
                  </Text>
                </View>
              );
            })}
          </View>
          <View style={styles.chartLegend}>
            <View style={[styles.legendDot, { backgroundColor: Colors.water }]} />
            <Text style={styles.legendText}>Meta diaria: {goal}ml</Text>
          </View>
        </Card>

        <BannerPlacementCard
          placementKey="water_history_banner"
          title="Patrocinado"
          body="El banner vive en historial para sostener el acceso abierto sin romper tu registro de hoy."
        />

        <Card style={styles.distributionCard}>
          <Text style={styles.chartTitle}>Cuando tomas más agua</Text>
          <View style={styles.distributionList}>
            {hourlyDistribution.buckets.map((bucket) => (
              <View key={bucket.label} style={styles.distributionRow}>
                <Text style={styles.distributionLabel}>{bucket.label}</Text>
                <View style={styles.distributionTrack}>
                  <View
                    style={[
                      styles.distributionFill,
                      { width: `${visibleRatioPercent(bucket.totalMl, maxHour)}%` },
                    ]}
                  />
                </View>
                <Text style={styles.distributionValue}>{bucket.totalMl}ml</Text>
              </View>
            ))}
          </View>
          {hourlyDistribution.valley ? (
            <Text style={styles.valleyText}>
              Sueles tomar menos agua entre {hourlyDistribution.valley.label}. Ese es tu valle habitual.
            </Text>
          ) : (
            <Text style={styles.valleyText}>
              Cuando sumes más historial, aquí vas a ver en que franja se te cae la hidratación.
            </Text>
          )}
        </Card>

        <View style={styles.statsRow}>
          <StatCard
            label="Promedio semanal"
            value={weeklyData.length ? `${Math.round(weeklyData.reduce((sum, day) => sum + day.total, 0) / weeklyData.length)}ml` : '0ml'}
            emoji="AG"
          />
          <StatCard
            label="Días con meta"
            value={`${weeklyData.filter((day) => day.total >= goal).length}/${weeklyData.length}`}
            emoji="OK"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Registros recientes</Text>
          {visibleHistory.length ? (
            visibleHistory.slice(0, 30).map((log, index) => (
              <View key={index} style={styles.historyItem}>
                <View style={styles.historyCopy}>
                  <Text style={styles.historyDate}>
                    {new Date(log.logged_at).toLocaleDateString('es', {
                      day: 'numeric',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </Text>
                  <Text style={styles.historyDrink}>{getDrinkLabel(log.drink_type)}</Text>
                </View>
                <View style={styles.historyActions}>
                  <Text style={[styles.historyAmount, { color: Colors.water }]}>+{log.amount_ml}ml</Text>
                  <Pressable
                    onPress={() => handleDeletePress(log)}
                    style={styles.deleteButton}
                    hitSlop={10}
                    accessibilityRole="button"
                    accessibilityLabel="Eliminar registro"
                  >
                    <Ionicons name="trash-outline" size={16} color={Colors.textMuted} />
                    <Text style={styles.deleteButtonText}>Borrar</Text>
                  </Pressable>
                </View>
              </View>
            ))
          ) : (
            <EmptyState
              compact
              icon="Agua"
              title="Sin registros recientes"
              description="Tus vasos y cantidades personalizadas van a aparecer aqui apenas sumes agua."
            />
          )}
        </View>
      </ScrollView>
    </SafeScreen>
  );
}

function StatCard({ label, value, emoji }: { label: string; value: string; emoji: string }) {
  return (
    <Card style={styles.statCard}>
      <Text style={styles.statEmoji}>{emoji}</Text>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: 156,
  },
  undoCard: {
    marginBottom: Spacing[4],
    borderWidth: 1,
    borderColor: withOpacity(Colors.water, 0.2),
    backgroundColor: withOpacity(Colors.water, 0.08),
  },
  undoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[3],
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
    lineHeight: 18,
    color: Colors.textSecondary,
  },
  chartCard: { marginBottom: Spacing[4] },
  chartTitle: { fontFamily: FontFamily.bold, fontSize: FontSize.base, color: Colors.textPrimary, marginBottom: Spacing[4] },
  bars: { flexDirection: 'row', gap: Spacing[2], height: 160, alignItems: 'flex-end', marginBottom: Spacing[3] },
  barWrap: { flex: 1, alignItems: 'center', gap: Spacing[1] },
  barValue: { fontFamily: FontFamily.regular, fontSize: 9, color: Colors.textMuted, textAlign: 'center' },
  barTrack: {
    width: '100%',
    flex: 1,
    backgroundColor: Colors.bgElevated,
    borderRadius: Radius.sm,
    overflow: 'hidden',
    position: 'relative',
    justifyContent: 'flex-end',
  },
  goalLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1.5,
    backgroundColor: Colors.water,
    opacity: 0.5,
    zIndex: 1,
  },
  barFill: { borderRadius: Radius.sm },
  barDay: { fontFamily: FontFamily.medium, fontSize: 9, color: Colors.textMuted },
  chartLegend: { flexDirection: 'row', alignItems: 'center', gap: Spacing[2] },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { fontFamily: FontFamily.regular, fontSize: FontSize.xs, color: Colors.textMuted },
  distributionCard: {
    marginBottom: Spacing[4],
    gap: Spacing[3],
    borderWidth: 1,
    borderColor: withOpacity(Colors.water, 0.18),
    backgroundColor: withOpacity(Colors.water, 0.06),
  },
  distributionList: {
    gap: Spacing[2],
  },
  distributionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[2],
  },
  distributionLabel: {
    width: 46,
    fontFamily: FontFamily.medium,
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
  },
  distributionTrack: {
    flex: 1,
    height: 8,
    borderRadius: Radius.full,
    backgroundColor: Colors.bgElevated,
    overflow: 'hidden',
  },
  distributionFill: {
    height: '100%',
    borderRadius: Radius.full,
    backgroundColor: Colors.water,
  },
  distributionValue: {
    width: 48,
    textAlign: 'right',
    fontFamily: FontFamily.medium,
    fontSize: FontSize.xs,
    color: Colors.textMuted,
  },
  valleyText: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    lineHeight: FontSize.sm * 1.5,
  },
  statsRow: { flexDirection: 'row', gap: Spacing[3], marginBottom: Spacing[4] },
  statCard: { flex: 1, alignItems: 'center', paddingVertical: Spacing[4] },
  statEmoji: { fontSize: 16, marginBottom: Spacing[2], color: Colors.textMuted },
  statValue: { fontFamily: FontFamily.bold, fontSize: FontSize.xl, color: Colors.textPrimary, marginBottom: Spacing[1] },
  statLabel: { fontFamily: FontFamily.regular, fontSize: FontSize.xs, color: Colors.textMuted, textAlign: 'center' },
  section: { marginBottom: Spacing[6] },
  sectionTitle: { fontFamily: FontFamily.bold, fontSize: FontSize.base, color: Colors.textPrimary, marginBottom: Spacing[3] },
  historyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing[2.5],
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  historyCopy: {
    flex: 1,
    gap: 2,
  },
  historyDate: { fontFamily: FontFamily.regular, fontSize: FontSize.sm, color: Colors.textSecondary },
  historyDrink: { fontFamily: FontFamily.medium, fontSize: FontSize.xs, color: Colors.textMuted, textTransform: 'capitalize' },
  historyActions: { flexDirection: 'row', alignItems: 'center', gap: Spacing[3] },
  historyAmount: { fontFamily: FontFamily.semibold, fontSize: FontSize.sm },
  deleteButton: {
    minWidth: 52,
    minHeight: 44,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing[2.5],
    flexDirection: 'row',
    gap: Spacing[1.5],
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.bgElevated,
  },
  deleteButtonText: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.xs,
    color: Colors.textMuted,
  },
});
