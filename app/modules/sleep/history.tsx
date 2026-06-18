import { useMemo, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import Header from '@/components/layout/Header';
import SleepModuleTabs from '@/components/sleep/SleepModuleTabs';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import SafeScreen from '@/components/ui/SafeScreen';
import { Colors, withOpacity } from '@/constants/colors';
import { Routes } from '@/constants/routes';
import { FontFamily, FontSize, Radius, Spacing } from '@/constants/theme';
import { useSleep, type SleepEntry } from '@/hooks/useSleep';
import {
  formatSleepClock,
  getSleepQualityMeta,
  groupSleepHistoryByWeek,
  scoreToQualityLevel,
  SLEEP_APP_LOCALE,
} from '@/lib/sleep-module';

function getSleepSourceHint(source: string) {
  if (source === 'manual') {
    return 'Profundo y REM se estiman a partir de tu carga manual.';
  }
  return 'Profundo y REM vienen de la fuente de sueño que conectaste.';
}

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
    pendingDeleteRef.current = null;
    void deleteSleepEntry(entry.id);
  };

  const handleDeletePress = (entry: SleepEntry) => {
    clearPendingTimer();

    if (pendingDeleteRef.current) {
      finalizePendingDelete(pendingDeleteRef.current);
    }

    pendingDeleteRef.current = entry;
    setPendingDelete(entry);
    deleteTimerRef.current = setTimeout(() => {
      finalizePendingDelete(entry);
      setPendingDelete(null);
      deleteTimerRef.current = null;
    }, 4500);
  };

  const handleUndoDelete = () => {
    clearPendingTimer();
    pendingDeleteRef.current = null;
    setPendingDelete(null);
  };

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
              Empieza desde la pantalla de registro y aquí verás cada semana
              agrupada con horarios, score y duración.
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
                const qualityMeta = getSleepQualityMeta(scoreToQualityLevel(entry.quality_score));

                return (
                  <Card key={entry.id} style={styles.entryCard}>
                    <View style={styles.entryTop}>
                      <View>
                        <Text style={styles.entryDate}>
                          {new Date(entry.end_time).toLocaleDateString(SLEEP_APP_LOCALE, {
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

                        <View style={styles.actionRow}>
                          <Pressable
                            onPress={() =>
                              router.push({
                                pathname: Routes.sleep.log,
                                params: { entryId: entry.id },
                              } as never)
                            }
                            style={styles.actionButton}
                            hitSlop={10}
                            accessibilityRole="button"
                            accessibilityLabel="Editar registro de sueño"
                            accessibilityHint="Abre este registro para corregir horarios o calidad."
                          >
                            <Ionicons name="create-outline" size={16} color={Colors.textMuted} />
                          </Pressable>
                          <Pressable
                            onPress={() => handleDeletePress(entry)}
                            style={styles.actionButton}
                            hitSlop={10}
                            accessibilityLabel="Eliminar registro de sueño"
                          >
                            <Ionicons name="trash-outline" size={16} color={Colors.textMuted} />
                          </Pressable>
                        </View>
                      </View>
                    </View>

                    <View style={styles.entryStats}>
                      <HistoryStat
                        label="Duración"
                        value={`${(entry.duration_min / 60).toFixed(1)}h`}
                      />
                      <HistoryStat label="Profundo" value={`${entry.deep_min}m`} />
                      <HistoryStat label="REM" value={`${entry.rem_min}m`} />
                    </View>
                    <Text style={styles.entryHint}>{getSleepSourceHint(entry.source)}</Text>
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
    <View style={styles.statItem}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: Spacing[5],
    paddingTop: Spacing[2],
    paddingBottom: Spacing[10],
    gap: Spacing[4],
  },
  undoCard: {
    borderColor: withOpacity(Colors.warning, 0.24),
    backgroundColor: withOpacity(Colors.warning, 0.08),
  },
  undoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[3],
  },
  undoCopy: {
    flex: 1,
    gap: Spacing[1],
  },
  undoTitle: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.sm,
    color: Colors.textPrimary,
  },
  undoBody: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  emptyCard: {
    gap: Spacing[3],
  },
  emptyTitle: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.base,
    color: Colors.textPrimary,
  },
  emptyBody: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  group: {
    gap: Spacing[2],
  },
  groupTitle: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  entryCard: {
    gap: Spacing[3],
  },
  entryTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing[3],
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
    color: Colors.textSecondary,
    marginTop: 4,
  },
  entryActions: {
    alignItems: 'flex-end',
    gap: Spacing[2],
  },
  actionRow: {
    flexDirection: 'row',
    gap: Spacing[1.5],
  },
  scoreBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[1.5],
    borderWidth: 1,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing[2],
    paddingVertical: Spacing[1],
  },
  scoreEmoji: {
    fontSize: 14,
  },
  scoreValue: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.xs,
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: withOpacity(Colors.white, 0.04),
  },
  entryStats: {
    flexDirection: 'row',
    gap: Spacing[2],
  },
  entryHint: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    lineHeight: 18,
  },
  statItem: {
    flex: 1,
    borderRadius: Radius.lg,
    backgroundColor: Colors.elevated,
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[2.5],
    gap: 4,
  },
  statLabel: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.xs,
    color: Colors.textMuted,
  },
  statValue: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.sm,
    color: Colors.textPrimary,
  },
});

