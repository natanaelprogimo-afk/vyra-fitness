import React, { useCallback, useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import Header from '@/components/layout/Header';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import NoticeCard from '@/components/ui/NoticeCard';
import SafeScreen from '@/components/ui/SafeScreen';
import ScreenFooterSpacer from '@/components/ui/ScreenFooterSpacer';
import SectionHeader from '@/components/ui/SectionHeader';
import Skeleton from '@/components/ui/Skeleton';
import { Colors, withOpacity } from '@/constants/colors';
import { FontFamily, FontSize, Radius, Spacing } from '@/constants/theme';
import { loadRecentNotificationActivity, type NotificationActivityRow } from '@/lib/notification-activity';
import {
  getNotificationAdaptivePlan,
  getNotificationTodayCount,
  type NotificationAdaptivePlan,
  type NotificationTodayCount,
} from '@/services/backend/notifications';
import { useAuthStore } from '@/stores/authStore';

function pickActivityString(row: NotificationActivityRow, keys: string[], fallback: string) {
  for (const key of keys) {
    const value = row[key];
    if (typeof value === 'string' && value.trim()) return value.trim();
  }
  return fallback;
}

function formatStamp(value: string | null) {
  if (!value) return 'Sin fecha';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Sin fecha';
  return new Intl.DateTimeFormat('es-UY', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

function formatHour(slot?: { hour?: number; minute?: number }) {
  if (typeof slot?.hour !== 'number' || typeof slot?.minute !== 'number') return 'Pendiente';
  return `${String(slot.hour).padStart(2, '0')}:${String(slot.minute).padStart(2, '0')}`;
}

function LoadingRows({ count = 3 }: { count?: number }) {
  return (
    <View style={styles.loadingStack}>
      {Array.from({ length: count }, (_, index) => (
        <Skeleton key={index} height={58} style={styles.loadingRow} />
      ))}
    </View>
  );
}

export default function NotificationsHistoryScreen() {
  const profile = useAuthStore((state) => state.profile);
  const [loading, setLoading] = useState(true);
  const [activityRows, setActivityRows] = useState<NotificationActivityRow[]>([]);
  const [adaptivePlan, setAdaptivePlan] = useState<NotificationAdaptivePlan | null>(null);
  const [todayCount, setTodayCount] = useState<NotificationTodayCount | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [partialWarning, setPartialWarning] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!profile?.id) {
      setActivityRows([]);
      setAdaptivePlan(null);
      setTodayCount(null);
      setLoadError(null);
      setPartialWarning(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setLoadError(null);
    setPartialWarning(null);

    let activityFailed = false;

    try {
      const [activity, plan, count] = await Promise.all([
        loadRecentNotificationActivity(profile.id, 12).catch((e) => {
          activityFailed = true;
          console.debug?.('[notifications-history] loadRecentNotificationActivity failed', e);
          return [] as NotificationActivityRow[];
        }),
        getNotificationAdaptivePlan().catch((e) => {
          console.debug?.('[notifications-history] getNotificationAdaptivePlan failed', e);
          return null;
        }),
        getNotificationTodayCount().catch((e) => {
          console.debug?.('[notifications-history] getNotificationTodayCount failed', e);
          return null;
        }),
      ]);

      setActivityRows(Array.isArray(activity) ? activity : []);
      setAdaptivePlan(plan);
      setTodayCount(count);

      if (activityFailed && !plan && !count) {
        setLoadError('No pudimos actualizar esta vista ahora mismo. Reintenta en unos segundos.');
      } else if (activityFailed) {
        setPartialWarning('La actividad reciente no se pudo refrescar completa. Debajo te mostramos lo que si alcanzo a cargar.');
      }
    } finally {
      setLoading(false);
    }
  }, [profile?.id]);

  useEffect(() => {
    void load();
  }, [load]);

  const showHardError = Boolean(loadError && !activityRows.length && !adaptivePlan && !todayCount);

  return (
    <SafeScreen padHorizontal={false} padBottom>
      <Header title="Historial de notificaciones" showBack color={Colors.brand} />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <NoticeCard
          title="Actividad visible"
          body="Esta pantalla junta el historial reciente y el plan adaptativo para que el sistema ya no se sienta como una caja negra."
          tone="info"
        />

        {partialWarning ? (
          <NoticeCard
            title="Actualizacion parcial"
            body={partialWarning}
            tone="warning"
          />
        ) : null}

        <Card style={styles.card}>
          <SectionHeader
            eyebrow="Hoy"
            title="Entrega del dia"
            subtitle="Cuantos avisos salieron y cuanto se interactuo con ellos."
          />

          {loading ? (
            <View style={styles.statGrid}>
              <Skeleton height={76} style={styles.statSkeleton} />
              <Skeleton height={76} style={styles.statSkeleton} />
              <Skeleton height={76} style={styles.statSkeleton} />
            </View>
          ) : todayCount ? (
            <View style={styles.statGrid}>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{todayCount.scheduled}</Text>
                <Text style={styles.statLabel}>Programadas</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{todayCount.opened}</Text>
                <Text style={styles.statLabel}>Abiertas</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{todayCount.actioned}</Text>
                <Text style={styles.statLabel}>Accionadas</Text>
              </View>
            </View>
          ) : (
            <Text style={styles.mutedBody}>
              Todavia no hay conteo disponible para hoy.
            </Text>
          )}
        </Card>

        <Card style={styles.card}>
          <SectionHeader
            eyebrow="Plan adaptativo"
            title="Por que VYRA avisa cuando avisa"
            subtitle="Hace visible el modo de entrega y las ventanas principales del sistema."
          />

          {loading ? (
            <LoadingRows count={5} />
          ) : adaptivePlan ? (
            <View style={styles.planStack}>
              <View style={styles.planRow}>
                <Text style={styles.planLabel}>Modo</Text>
                <Text style={styles.planValue}>
                  {adaptivePlan.deliveryMode === 'remote' ? 'Remoto' : 'Local'}
                </Text>
              </View>
              <View style={styles.planRow}>
                <Text style={styles.planLabel}>Agua</Text>
                <Text style={styles.planValue}>{formatHour(adaptivePlan.water)}</Text>
              </View>
              <View style={styles.planRow}>
                <Text style={styles.planLabel}>Sueno</Text>
                <Text style={styles.planValue}>{formatHour(adaptivePlan.sleep)}</Text>
              </View>
              <View style={styles.planRow}>
                <Text style={styles.planLabel}>Resumen</Text>
                <Text style={styles.planValue}>{formatHour(adaptivePlan.summary)}</Text>
              </View>
              <View style={styles.planRow}>
                <Text style={styles.planLabel}>Racha</Text>
                <Text style={styles.planValue}>{formatHour(adaptivePlan.streak)}</Text>
              </View>
            </View>
          ) : (
            <Text style={styles.mutedBody}>
              El plan adaptativo no esta disponible ahora mismo.
            </Text>
          )}
        </Card>

        <Card style={styles.card}>
          <SectionHeader
            eyebrow="Inbox"
            title="Ultimos avisos"
            subtitle="Historial reciente para entender que se programo, cuando salio y con que copy."
          />

          {loading ? (
            <LoadingRows count={4} />
          ) : showHardError ? (
            <View style={styles.errorStack}>
              <NoticeCard
                title="No pudimos abrir el inbox ahora"
                body={loadError ?? 'Reintenta en unos segundos y volvemos a consultar el historial.'}
                tone="warning"
              />
              <Button
                label="Reintentar"
                onPress={() => void load()}
                variant="secondary"
                fullWidth
                color={Colors.brand}
              />
            </View>
          ) : activityRows.length ? (
            <View style={styles.activityStack}>
              {activityRows.map((row, index) => {
                const title = pickActivityString(
                  row,
                  ['title', 'message_title', 'notification_title', 'type'],
                  'Notificacion Vyra',
                );
                const body = pickActivityString(
                  row,
                  ['body', 'message_body', 'notification_body', 'copy'],
                  'Actividad reciente disponible.',
                );
                const kind = pickActivityString(
                  row,
                  ['notification_type', 'type', 'category', 'kind'],
                  'contexto',
                );
                const stamp = formatStamp(
                  pickActivityString(row, ['scheduled_for', 'created_at', 'updated_at'], ''),
                );

                return (
                  <View key={`${kind}_${stamp}_${index}`}>
                    <View style={styles.activityRow}>
                      <View style={styles.activityCopy}>
                        <Text style={styles.activityTitle}>{title}</Text>
                        <Text style={styles.activityBody}>{body}</Text>
                        <Text style={styles.activityStamp}>{stamp}</Text>
                      </View>
                      <View style={styles.activityPill}>
                        <Text style={styles.activityPillText}>{kind}</Text>
                      </View>
                    </View>
                    {index < activityRows.length - 1 ? <View style={styles.divider} /> : null}
                  </View>
                );
              })}
            </View>
          ) : (
            <NoticeCard
              title="Sin historial reciente"
              body="En cuanto haya avisos programados o enviados, apareceran aqui con su contexto."
              tone="info"
            />
          )}
        </Card>

        <ScreenFooterSpacer extra={Spacing[2]} />
      </ScrollView>
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingHorizontal: Spacing[5],
    paddingTop: Spacing[4],
    paddingBottom: Spacing[8],
    gap: Spacing[4],
  },
  card: {
    gap: Spacing[4],
  },
  statGrid: {
    flexDirection: 'row',
    gap: Spacing[2],
  },
  statCard: {
    flex: 1,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface2,
    padding: Spacing[3],
    gap: 4,
  },
  statSkeleton: {
    flex: 1,
    borderRadius: Radius.xl,
  },
  statValue: {
    fontFamily: FontFamily.display,
    fontSize: 24,
    lineHeight: 24,
    color: Colors.textPrimary,
  },
  statLabel: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
  },
  loadingStack: {
    gap: Spacing[2],
  },
  loadingRow: {
    borderRadius: Radius.xl,
  },
  planStack: {
    gap: Spacing[2],
  },
  planRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing[3],
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface2,
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[3],
  },
  planLabel: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.sm,
    color: Colors.textPrimary,
  },
  planValue: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.sm,
    color: Colors.brand,
  },
  errorStack: {
    gap: Spacing[3],
  },
  activityStack: {
    gap: Spacing[2],
  },
  activityRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing[3],
  },
  activityCopy: {
    flex: 1,
    gap: 2,
  },
  activityTitle: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.sm,
    color: Colors.textPrimary,
  },
  activityBody: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    lineHeight: 18,
    color: Colors.textSecondary,
  },
  activityStamp: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    color: Colors.textMuted,
  },
  activityPill: {
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: withOpacity(Colors.brand, 0.2),
    backgroundColor: withOpacity(Colors.brand, 0.08),
    paddingHorizontal: Spacing[2.5],
    paddingVertical: 5,
  },
  activityPillText: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.xs,
    color: Colors.brand,
  },
  divider: {
    height: 1,
    backgroundColor: withOpacity(Colors.white, 0.06),
  },
  mutedBody: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    lineHeight: 20,
    color: Colors.textSecondary,
  },
});
