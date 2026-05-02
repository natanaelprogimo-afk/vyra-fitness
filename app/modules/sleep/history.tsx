import { useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import SafeScreen from '@/components/ui/SafeScreen';
import Header from '@/components/layout/Header';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import SleepModuleTabs from '@/components/sleep/SleepModuleTabs';
import { Colors, withOpacity } from '@/constants/colors';
import { Routes } from '@/constants/routes';
import { FontFamily, FontSize, Radius, Spacing } from '@/constants/theme';
import { useSleep, type SleepEntry } from '@/hooks/useSleep';
import {
  formatSleepClock,
  getSleepQualityMeta,
  groupSleepHistoryByWeek,
} from '@/lib/sleep-module';

export default function SleepHistoryScreen() {
  const { history, deleteSleepEntry } = useSleep();
  const [pendingDelete, setPendingDelete] = useState<SleepEntry | null>(null);
  const deleteTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingDeleteRef = useRef<SleepEntry | null>(null);

  const visibleHistory = useMemo(
    () => history.filter((entry) => entry.id !== pendingDelete?.id),
    [history, pendingDelete?.id],
  );
  const weeklyGroups = useMemo(
    () => groupSleepHistoryByWeek(visibleHistory),
    [visibleHistory],
  );

  const clearPendingTimer = () => {
    if (deleteTimerRef.current) {
      clearTimeout(deleteTimerRef.current);
      deleteTimerRef.current = null;
    }
  };

  const finalizePendingDelete = (entry: SleepEntry | null) => {
    if (!entry?.id) return;
    void deleteSleepEntry(entry.id);
  };

  const handleDeletePress = (entry: SleepEntry) => {
    clearPendingTimer();

    if (pendingDelete) {
      finalizePendingDelete(pendingDelete);
    }

    setPendingDelete(entry);
    deleteTimerRef.current = setTimeout(() => {
      finalizePendingDelete(entry);
      setPendingDelete(null);
      deleteTimerRef.current = null;
    }, 4500);
  };

  const handleUndoDelete = () => {
    clearPendingTimer();
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
    <SafeScreen padHorizontal={false} padBottom>
      <Header title="Historial de sueño" showBack color={Colors.sleep} />
      <SleepModuleTabs active="history" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {pendingDelete ? (
          <Card style={styles.undoCard}>
            <View style={styles.undoRow}>
              <View style={styles.undoCopy}>
                <Text style={styles.undoTitle}>Noche marcada para borrar</Text>
                <Text style={styles.undoBody}>
                  {formatSleepClock(pendingDelete.start_time)} - {formatSleepClock(pendingDelete.end_time)} eliminado.
                  Si fue un toque accidental, puedes deshacerlo ahora.
                </Text>
              </View>
              <Button onPress={handleUndoDelete} variant="ghost" color={Colors.sleep}>
                Deshacer
              </Button>
            </View>
          </Card>
        ) : null}

        {weeklyGroups.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>Aún no hay noches registradas</Text>
            <Text style={styles.emptyBody}>
              Empieza desde la pantalla de registro y aquí veras cada semana
              agrupada con horarios, score y duracion.
            </Text>
            <Button
              onPress={() => router.push(Routes.sleep.log)}
              variant="primary"
              fullWidth
            >
              Registrar sueño
            </Button>
          </Card>
        ) : (
          weeklyGroups.map((group) => (
            <View key={group.key} style={styles.group}>
              <Text style={styles.groupTitle}>{group.label}</Text>
              {group.items.map((entry) => {
                const qualityMeta = getSleepQualityMeta(
                  entry.quality_score >= 85
                    ? 5
                    : entry.quality_score >= 70
                      ? 4
                      : entry.quality_score >= 55
                        ? 3
                        : entry.quality_score >= 40
                          ? 2
                          : 1,
                );

                return (
                  <Card key={entry.id} style={styles.entryCard}>
                    <View style={styles.entryTop}>
                      <View>
                        <Text style={styles.entryDate}>
                          {new Date(entry.end_time).toLocaleDateString('es-UY', {
                            weekday: 'long',
                            day: 'numeric',
                            month: 'short',
                          })}
                        </Text>
                        <Text style={styles.entryTime}>
                          {formatSleepClock(entry.start_time)} -{' '}
                          {formatSleepClock(entry.end_time)}
                        </Text>
                      </View>

                      <View style={styles.entryActions}>
                        <View
                          style={[
                            styles.scoreBadge,
                            { borderColor: withOpacity(qualityMeta.accent, 0.36) },
                          ]}
                        >
                          <Text style={styles.scoreEmoji}>{qualityMeta.emoji}</Text>
                          <Text
                            style={[
                              styles.scoreValue,
                              { color: qualityMeta.accent },
                            ]}
                          >
                            {entry.quality_score}
                          </Text>
                        </View>

                        <Pressable
                          onPress={() => handleDeletePress(entry)}
                          style={styles.deleteButton}
                          hitSlop={10}
                          accessibilityLabel="Eliminar registro de sueño"
                        >
                          <Ionicons name="trash-outline" size={16} color={Colors.textMuted} />
                        </Pressable>
                      </View>
                    </View>

                    <View style={styles.entryStats}>
                      <HistoryStat
                        label="Duracion"
                        value={`${(entry.duration_min / 60).toFixed(1)}h`}
                      />
                      <HistoryStat label="Profundo" value={`${entry.deep_min}m`} />
                      <HistoryStat label="REM" value={`${entry.rem_min}m`} />
                    </View>
                  </Card>
                );
              })}
            </View>
          ))
        )}
      </ScrollView>
    </SafeScreen>
  );
}

function HistoryStat({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.historyStat}>
      <Text style={styles.historyStatValue}>{value}</Text>
      <Text style={styles.historyStatLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: Spacing[5],
    paddingBottom: Spacing[10],
    gap: Spacing[4],
  },
  undoCard: {
    borderWidth: 1,
    borderColor: withOpacity(Colors.sleep, 0.2),
    backgroundColor: withOpacity(Colors.sleep, 0.08),
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
  emptyCard: {
    gap: Spacing[3],
    borderWidth: 1,
    borderColor: withOpacity(Colors.sleep, 0.28),
    backgroundColor: withOpacity(Colors.sleep, 0.08),
  },
  emptyTitle: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.lg,
    color: Colors.textPrimary,
  },
  emptyBody: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    lineHeight: FontSize.sm * 1.5,
    color: Colors.textSecondary,
  },
  group: {
    gap: Spacing[3],
  },
  groupTitle: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.base,
    color: Colors.textPrimary,
  },
  entryCard: {
    gap: Spacing[3],
  },
  entryTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing[3],
    alignItems: 'center',
  },
  entryActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[2],
  },
  entryDate: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.sm,
    color: Colors.textPrimary,
    textTransform: 'capitalize',
  },
  entryTime: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    marginTop: 2,
  },
  scoreBadge: {
    minWidth: 74,
    borderRadius: Radius.xl,
    borderWidth: 1,
    backgroundColor: Colors.bgElevated,
    paddingVertical: Spacing[2],
    paddingHorizontal: Spacing[3],
    alignItems: 'center',
    gap: 2,
  },
  scoreEmoji: {
    fontSize: 16,
  },
  scoreValue: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.base,
  },
  deleteButton: {
    width: 32,
    height: 32,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.bgElevated,
  },
  entryStats: {
    flexDirection: 'row',
    gap: Spacing[2],
  },
  historyStat: {
    flex: 1,
    borderRadius: Radius.lg,
    backgroundColor: Colors.bgElevated,
    paddingVertical: Spacing[2.5],
    alignItems: 'center',
  },
  historyStatValue: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.sm,
    color: Colors.textPrimary,
  },
  historyStatLabel: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    marginTop: 2,
  },
});
