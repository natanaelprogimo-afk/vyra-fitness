import React, { useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import SafeScreen from '@/components/ui/SafeScreen';
import Header from '@/components/layout/Header';
import Card from '@/components/ui/Card';
import LinkRow from '@/components/ui/LinkRow';
import MetricCard from '@/components/ui/MetricCard';
import NoticeCard from '@/components/ui/NoticeCard';
import ScreenFooterSpacer from '@/components/ui/ScreenFooterSpacer';
import SectionHeader from '@/components/ui/SectionHeader';
import { Colors } from '@/constants/colors';
import { Routes } from '@/constants/routes';
import { FontFamily, FontSize, Spacing } from '@/constants/theme';
import { useBackendHealth } from '@/hooks/useBackendHealth';
import { useOfflineSync } from '@/hooks/useOfflineSync';
import { getWidgetStatus } from '@/lib/widget-native';
import { getWeeklySummary, type WeeklySummaryPayload } from '@/services/backend/ai';
import {
  getNotificationAdaptivePlan,
  getNotificationLowHours,
  getNotificationTodayCount,
  type NotificationAdaptivePlan,
  type NotificationTodayCount,
} from '@/services/backend/notifications';

type NativeWidgetStatus = Awaited<ReturnType<typeof getWidgetStatus>>;

function formatTimestamp(value: string | number | null) {
  if (!value) return 'Sin registro todavía';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Sin registro todavía';
  return date.toLocaleString('es-UY', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatHourBlock(hour?: number, minute?: number) {
  if (!Number.isFinite(hour ?? NaN)) return 'Sin definir';
  return `${String(hour).padStart(2, '0')}:${String(minute ?? 0).padStart(2, '0')}`;
}

export default function SystemHealthScreen() {
  const { status, refresh, lastCheckedAt, error, isOnline } = useBackendHealth();
  const {
    status: syncStatus,
    pendingCount,
    lastSyncedAt,
    triggerSync,
    error: syncError,
    queueEnabled,
    syncModeLabel,
    syncModeDescription,
    supportedOfflineModules,
    localFirstModules,
  } = useOfflineSync();
  const [widgetStatus, setWidgetStatus] = useState<NativeWidgetStatus | null>(null);
  const [weeklySummary, setWeeklySummary] = useState<WeeklySummaryPayload | null>(null);
  const [adaptivePlan, setAdaptivePlan] = useState<NotificationAdaptivePlan | null>(null);
  const [todayCount, setTodayCount] = useState<NotificationTodayCount | null>(null);
  const [lowHours, setLowHours] = useState<{ water: number[]; summary: number[] }>({
    water: [],
    summary: [],
  });

  useEffect(() => {
    void getWidgetStatus().then(setWidgetStatus);
    void getWeeklySummary().then(setWeeklySummary);
    void getNotificationAdaptivePlan().then(setAdaptivePlan);
    void getNotificationTodayCount().then(setTodayCount);
    void Promise.all([
      getNotificationLowHours('water_reminder'),
      getNotificationLowHours('daily_summary'),
    ]).then(([water, summary]) => setLowHours({ water, summary }));
  }, []);

  const widgetSummary = useMemo(() => {
    if (!widgetStatus) return 'Cargando';
    const count = Number(widgetStatus.compactPinned) + Number(widgetStatus.expandedPinned);
    return `${count}/2 activos`;
  }, [widgetStatus]);

  const backendLabel = status === 'ok' ? 'Disponible' : status === 'checking' ? 'Revisando' : 'Caído';
  const syncLabel =
    syncStatus === 'syncing'
      ? 'Sincronizando'
      : syncStatus === 'offline'
        ? 'Offline'
        : syncStatus === 'limited'
          ? 'Parcial'
        : syncStatus === 'pending'
          ? 'Pendiente'
          : 'Al día';

  return (
    <SafeScreen padHorizontal={false} padBottom>
      <Header title="Centro del sistema" showBack color={Colors.brand} />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <NoticeCard
          title="Soporte útil, no solo técnico"
          body="Aquí vive el estado real de backend, sync, notificaciones adaptativas, IA semanal y widgets para QA o soporte."
          tone="info"
          actionLabel="Refrescar backend"
          onAction={() => void refresh()}
          secondaryLabel={queueEnabled ? 'Forzar sync' : 'Revisar sync parcial'}
          onSecondaryAction={() => void triggerSync()}
        />

        {!queueEnabled ? (
          <NoticeCard
            title="Sync parcial, no global"
            body={`${syncModeDescription} Modulos con soporte local activo: ${supportedOfflineModules.join(', ')}. Modulos local-first: ${localFirstModules.join(', ')}.`}
            tone="warning"
          />
        ) : null}

        <Card>
          <SectionHeader
            eyebrow="Estado"
            title="Salud general"
            subtitle="Lectura rápida para saber si el sistema acompaña lo que promete la UI."
          />

          <View style={styles.metricGrid}>
            <MetricCard
              value={isOnline ? 'Online' : 'Offline'}
              label="Conectividad"
              note={isOnline ? 'La app detecta internet disponible.' : 'La red no está disponible ahora mismo.'}
              accentColor={isOnline ? Colors.success : Colors.warning}
            />
            <MetricCard
              value={backendLabel}
              label="Backend"
              note={error ?? `Última revisión ${formatTimestamp(lastCheckedAt)}`}
              accentColor={status === 'ok' ? Colors.success : status === 'down' ? Colors.error : Colors.warning}
            />
            <MetricCard
              value={syncLabel}
              label="Sincronización"
              note={
                syncError ??
                (queueEnabled
                  ? `${pendingCount} cambios pendientes · ${formatTimestamp(lastSyncedAt)}`
                  : `Modo ${syncModeLabel} · ${formatTimestamp(lastSyncedAt)}`)
              }
              accentColor={
                syncStatus === 'idle'
                  ? Colors.success
                  : syncStatus === 'offline' || syncStatus === 'limited'
                    ? Colors.warning
                    : Colors.brand
              }
            />
            <MetricCard
              value={widgetSummary}
              label="Widgets"
              note={widgetStatus?.pinSupported ? 'Se pueden fijar desde la app.' : 'Este equipo usa flujo manual o no soporta pin directo.'}
              accentColor={widgetStatus?.compactPinned || widgetStatus?.expandedPinned ? Colors.success : Colors.textPrimary}
            />
          </View>
        </Card>

        <Card>
          <SectionHeader
            eyebrow="Notificaciones"
            title="Plan adaptativo"
            subtitle="Lo que ya sabe el backend sobre el mejor momento para avisar."
          />

          <View style={styles.planGrid}>
            <View style={styles.planItem}>
              <Text style={styles.planLabel}>Entrega</Text>
              <Text style={styles.planValue}>
                {adaptivePlan?.deliveryMode === 'remote' ? 'Remota' : adaptivePlan?.deliveryMode === 'local' ? 'Local' : 'Sin plan'}
              </Text>
            </View>
            <View style={styles.planItem}>
              <Text style={styles.planLabel}>Agua</Text>
              <Text style={styles.planValue}>{formatHourBlock(adaptivePlan?.water?.hour, adaptivePlan?.water?.minute)}</Text>
            </View>
            <View style={styles.planItem}>
              <Text style={styles.planLabel}>Resumen</Text>
              <Text style={styles.planValue}>{formatHourBlock(adaptivePlan?.summary?.hour, adaptivePlan?.summary?.minute)}</Text>
            </View>
            <View style={styles.planItem}>
              <Text style={styles.planLabel}>Racha</Text>
              <Text style={styles.planValue}>{formatHourBlock(adaptivePlan?.streak?.hour, adaptivePlan?.streak?.minute)}</Text>
            </View>
          </View>

          <Text style={styles.planBody}>
            Hoy hay {todayCount?.scheduled ?? 0} avisos programados, {todayCount?.opened ?? 0} abiertos y {todayCount?.actioned ?? 0} accionados.
          </Text>
          <Text style={styles.planBody}>
            Horas de bajo engagement detectadas:
            {` agua ${lowHours.water.length ? lowHours.water.join(', ') : 'sin bloqueo'} · resumen ${lowHours.summary.length ? lowHours.summary.join(', ') : 'sin bloqueo'}`}
          </Text>
        </Card>

        <Card>
          <SectionHeader
            eyebrow="IA"
            title="Resumen semanal visible"
            subtitle="Capacidad backend que antes estaba escondida y ahora queda legible dentro de la app."
          />

          {weeklySummary ? (
            <View style={styles.summaryStack}>
              <Text style={styles.summaryText}>{weeklySummary.summary}</Text>
              {weeklySummary.bullets.map((bullet) => (
                <View key={bullet} style={styles.bulletRow}>
                  <View style={styles.bulletDot} />
                  <Text style={styles.bulletText}>{bullet}</Text>
                </View>
              ))}
              {weeklySummary.nextFocus ? <Text style={styles.focusText}>{weeklySummary.nextFocus}</Text> : null}
            </View>
          ) : (
            <NoticeCard
              title="Todavía sin resumen listo"
              body="Si esta cuenta no tiene suficiente historial o el backend no respondió, aquí se mantiene una salida clara en vez de dejar el hueco oculto."
              tone="warning"
            />
          )}
        </Card>

        <Card>
          <SectionHeader
            eyebrow="QA"
            title="Galería interna"
            subtitle="Ruta de inspección para revisar primitives y contrastes sin entrar a pantallas enormes."
          />

          <LinkRow
            label="Abrir galería UI"
            description="Header, botones, inputs, notice cards, toggles, métricas y locks en aislamiento."
            onPress={() => router.push(Routes.internal.uiGallery as never)}
            hint="QA"
          />
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
    gap: Spacing[4],
  },
  metricGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing[3],
    marginTop: Spacing[4],
  },
  planGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing[3],
    marginTop: Spacing[4],
  },
  planItem: {
    minWidth: 120,
    flex: 1,
    gap: 4,
  },
  planLabel: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.9,
  },
  planValue: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.base,
    color: Colors.textPrimary,
  },
  planBody: {
    marginTop: Spacing[3],
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    lineHeight: 20,
    color: Colors.textSecondary,
  },
  summaryStack: {
    marginTop: Spacing[4],
    gap: Spacing[2],
  },
  summaryText: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    lineHeight: 20,
    color: Colors.textPrimary,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing[2],
  },
  bulletDot: {
    width: 8,
    height: 8,
    borderRadius: 8,
    marginTop: 6,
    backgroundColor: Colors.brand,
  },
  bulletText: {
    flex: 1,
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    lineHeight: 18,
    color: Colors.textSecondary,
  },
  focusText: {
    marginTop: Spacing[1],
    fontFamily: FontFamily.medium,
    fontSize: FontSize.sm,
    lineHeight: 20,
    color: Colors.brand,
  },
});
