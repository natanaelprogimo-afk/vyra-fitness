import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import MapView, { Polyline, type Region } from 'react-native-maps';
import ModuleScaffold from '@/components/modules/ModuleScaffold';
import StepsTabs from '@/components/steps/StepsTabs';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import MetricCard from '@/components/ui/MetricCard';
import NoticeCard from '@/components/ui/NoticeCard';
import SectionHeader from '@/components/ui/SectionHeader';
import { Colors, withOpacity } from '@/constants/colors';
import { FontFamily, FontSize, Radius, Spacing } from '@/constants/theme';
import { useSteps } from '@/hooks/useSteps';
import { useStepsRoutes } from '@/hooks/useStepsRoutes';
import { formatDistance } from '@/lib/format-distance';
import type { StepsRoute } from '@/lib/steps-route-task';
import { useSettingsStore } from '@/stores/settingsStore';
import { useUIStore } from '@/stores/uiStore';

function formatRouteStartedAt(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Sin inicio claro';
  return date.toLocaleString('es-UY', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatRouteDuration(startedAt?: string, endedAt?: string) {
  if (!startedAt) return '--';
  const start = new Date(startedAt).getTime();
  const end = endedAt ? new Date(endedAt).getTime() : Date.now();
  if (!Number.isFinite(start) || !Number.isFinite(end)) return '--';
  const diffMinutes = Math.max(0, Math.round((end - start) / 60000));
  if (diffMinutes < 60) return `${diffMinutes} min`;
  const hours = Math.floor(diffMinutes / 60);
  const minutes = diffMinutes % 60;
  return `${hours}h ${minutes.toString().padStart(2, '0')}m`;
}

function buildRouteRegion(route: StepsRoute | null): Region | null {
  const points = route?.points ?? [];
  if (points.length < 2) return null;

  const latitudes = points.map((point) => point.latitude);
  const longitudes = points.map((point) => point.longitude);
  const minLat = Math.min(...latitudes);
  const maxLat = Math.max(...latitudes);
  const minLng = Math.min(...longitudes);
  const maxLng = Math.max(...longitudes);

  const latitudeDelta = Math.max((maxLat - minLat) * 1.45, 0.008);
  const longitudeDelta = Math.max((maxLng - minLng) * 1.45, 0.008);

  return {
    latitude: (minLat + maxLat) / 2,
    longitude: (minLng + maxLng) / 2,
    latitudeDelta,
    longitudeDelta,
  };
}

function NeutralEmptyPanel({ title, body }: { title: string; body: string }) {
  return (
    <View style={styles.emptyPanel}>
      <Text style={styles.emptyPanelTitle}>{title}</Text>
      <Text style={styles.emptyPanelBody}>{body}</Text>
    </View>
  );
}

export default function StepsWeekScreen() {
  const { weeklyAvg, weeklyData, goal } = useSteps();
  const {
    storedRoutes,
    activeRoute,
    passiveRoute,
    manualTracking,
    passiveEnabled,
    isLoading,
    actionLoading,
    actionError,
    startManualRoute,
    stopManualRoute,
    setPassiveRouteEnabled,
  } = useStepsRoutes(5000);
  const distUnit = useSettingsStore((state) => state.distUnit);
  const showToast = useUIStore((state) => state.showToast);

  const currentWeek = weeklyData.slice(-7);
  const previousWeek = weeklyData.slice(0, 7);
  const previousAvg = previousWeek.length
    ? Math.round(previousWeek.reduce((sum, item) => sum + Number(item.steps ?? 0), 0) / previousWeek.length)
    : null;
  const delta =
    previousAvg && previousAvg > 0
      ? Math.round(((weeklyAvg - previousAvg) / previousAvg) * 100)
      : null;

  const distribution = useMemo(() => {
    const recordedDays = currentWeek.filter((item) => Number(item.steps ?? 0) > 0);
    const low = recordedDays.filter((item) => Number(item.steps ?? 0) < 4000).length;
    const medium = recordedDays.filter((item) => {
      const steps = Number(item.steps ?? 0);
      return steps >= 4000 && steps < goal;
    }).length;
    const high = recordedDays.filter((item) => Number(item.steps ?? 0) >= goal).length;
    return { low, medium, high, total: recordedDays.length };
  }, [currentWeek, goal]);

  const topRoutes = storedRoutes.slice(0, 3);
  const liveRoute = manualTracking ? activeRoute : passiveRoute ?? activeRoute;
  const previewRoute = liveRoute ?? topRoutes[0] ?? null;
  const previewRegion = useMemo(() => buildRouteRegion(previewRoute), [previewRoute]);
  const liveRouteDistance = liveRoute ? formatDistance(liveRoute.distanceKm, distUnit) : '--';
  const liveRoutePoints = liveRoute?.points?.length ?? 0;
  const liveRouteSource = manualTracking ? 'manual' : passiveEnabled ? 'pasivo' : 'inactivo';
  const insight =
    distribution.total === 0
      ? 'Todavia faltan suficientes datos para comparar tu semana.'
      : distribution.low >= 3
        ? 'Los dias suaves todavia pesan demasiado. Una caminata corta al inicio de la semana cambia mucho el bloque.'
        : (delta ?? 0) >= 0
          ? 'Vienes arriba de la semana anterior. Repetir tu ruta mas larga una vez mas puede cerrar mejor el bloque.'
          : 'La semana bajo un poco. Recuperarla con una salida breve hoy vale mas que esperar al proximo lunes.';

  const handleManualRoute = async () => {
    if (manualTracking) {
      const route = await stopManualRoute();
      if (route) {
        showToast(`Ruta guardada: ${formatDistance(route.distanceKm, distUnit)}.`, 'success');
      } else {
        showToast('No habia suficiente recorrido para guardar una ruta.', 'warning');
      }
      return;
    }

    const result = await startManualRoute();
    if (result.ok) {
      showToast('Ruta manual iniciada. Puedes bloquear la pantalla y seguir caminando.', 'success');
    } else if (result.error) {
      showToast(result.error, 'error');
    }
  };

  const handlePassiveToggle = async () => {
    const nextEnabled = !passiveEnabled;
    const result = await setPassiveRouteEnabled(nextEnabled);
    if (result.ok) {
      showToast(
        nextEnabled
          ? 'Tracking pasivo activado para guardar recorridos automaticamente.'
          : 'Tracking pasivo pausado.',
        nextEnabled ? 'success' : 'info',
      );
    } else if (result.error) {
      showToast(result.error, 'error');
    }
  };

  return (
    <ModuleScaffold
      title="Tu semana"
      subtitle="Pasos, GPS y lectura útil"
      color={Colors.steps}
      tabs={<StepsTabs active="week" />}
    >
      {actionError ? (
        <NoticeCard
          title="Rutas GPS"
          body={actionError}
          tone="error"
        />
      ) : null}

      <View style={styles.metricGrid}>
        <MetricCard
          value={weeklyAvg.toLocaleString('es-UY')}
          label="Promedio diario"
          note={
            delta === null
              ? 'Sin semana previa comparable'
              : `${delta >= 0 ? '+' : ''}${delta}% vs semana anterior`
          }
          accentColor={Colors.steps}
        />
        <MetricCard
          value={`${distribution.high}d`}
          label="Dias en meta"
          note={`${distribution.medium} activos · ${distribution.low} suaves`}
          accentColor={Colors.success}
        />
      </View>

      <Card style={styles.card}>
        <SectionHeader
          eyebrow="Distribución"
          title="Actividad por zona"
          subtitle="Qué tanto de tu semana quedó en suave, activa o en meta."
        />
        {distribution.total > 0 ? (
          <>
            <View style={styles.distributionBar}>
              <View
                style={[
                  styles.distributionFill,
                  { flex: Math.max(distribution.low, 1), backgroundColor: withOpacity(Colors.textMuted, 0.7) },
                ]}
              />
              <View
                style={[
                  styles.distributionFill,
                  { flex: Math.max(distribution.medium, 1), backgroundColor: Colors.warning },
                ]}
              />
              <View
                style={[
                  styles.distributionFill,
                  { flex: Math.max(distribution.high, 1), backgroundColor: Colors.steps },
                ]}
              />
            </View>
            <View style={styles.legendRow}>
              <Text style={styles.legendText}>Suave {distribution.low}d</Text>
              <Text style={[styles.legendText, { color: Colors.warning }]}>Activo {distribution.medium}d</Text>
              <Text style={[styles.legendText, { color: Colors.steps }]}>Meta {distribution.high}d</Text>
            </View>
          </>
        ) : (
          <NeutralEmptyPanel
            title="Todavía faltan días registrados"
            body="Cuando sumes más pasos esta semana, acá vas a ver cómo se reparte tu actividad."
          />
        )}
      </Card>

      <Card style={styles.card}>
        <SectionHeader
          eyebrow="Mapa y GPS"
          title="Rutas visibles"
          subtitle="Puedes iniciar recorridos manuales o dejar listo el tracking pasivo dentro del módulo."
        />

        {previewRoute && previewRegion ? (
          <View style={styles.mapPreviewShell}>
            <MapView
              style={styles.mapPreview}
              region={previewRegion}
              scrollEnabled={false}
              zoomEnabled={false}
              rotateEnabled={false}
              pitchEnabled={false}
              toolbarEnabled={false}
              pointerEvents="none"
            >
              <Polyline
                coordinates={previewRoute.points.map((point) => ({
                  latitude: point.latitude,
                  longitude: point.longitude,
                }))}
                strokeColor={Colors.steps}
                strokeWidth={4}
              />
            </MapView>
            <View style={styles.mapPreviewOverlay}>
              <Text style={styles.mapPreviewTitle}>
                {manualTracking ? 'Ruta actual en mapa' : 'Vista previa de tu mejor ruta reciente'}
              </Text>
              <Text style={styles.mapPreviewBody}>
                {manualTracking
                  ? 'El mapa se actualiza con tus puntos GPS mientras la ruta sigue abierta.'
                  : 'Aunque hoy no tengas una ruta abierta, aquí ves el trazado más útil para volver a salir.'}
              </Text>
            </View>
          </View>
        ) : null}

        {liveRoute ? (
          <View style={styles.liveRouteCard}>
            <View style={styles.liveRouteHeader}>
              <Text style={styles.liveRouteTitle}>
                {manualTracking ? 'Ruta manual activa' : passiveEnabled ? 'Ruta pasiva activa' : 'Ruta abierta'}
              </Text>
              <View style={styles.liveRouteBadge}>
                <Text style={styles.liveRouteBadgeText}>{liveRouteSource}</Text>
              </View>
            </View>

            <View style={styles.routeStatRow}>
              <View style={styles.routeStat}>
                <Text style={styles.routeStatLabel}>Distancia</Text>
                <Text style={styles.routeStatValue}>{liveRouteDistance}</Text>
                <Text style={styles.routeStatHint}>actual</Text>
              </View>
              <View style={styles.routeStat}>
                <Text style={styles.routeStatLabel}>Tiempo</Text>
                <Text style={styles.routeStatValue}>
                  {formatRouteDuration(liveRoute.startedAt, liveRoute.endedAt)}
                </Text>
                <Text style={styles.routeStatHint}>desde que arrancaste</Text>
              </View>
              <View style={styles.routeStat}>
                <Text style={styles.routeStatLabel}>Puntos</Text>
                <Text style={styles.routeStatValue}>{liveRoutePoints}</Text>
                <Text style={styles.routeStatHint}>muestras GPS</Text>
              </View>
            </View>

            <Text style={styles.liveRouteBody}>
              Inicio {formatRouteStartedAt(liveRoute.startedAt)}. Si cierras una ruta manual, se guarda en tu historial de recorridos.
            </Text>
          </View>
        ) : (
          <NeutralEmptyPanel
            title={isLoading ? 'Cargando rutas' : 'Todavía no hay ruta activa'}
            body={
              isLoading
                ? 'Estamos revisando si hay un recorrido abierto o rutas guardadas.'
                : 'Puedes iniciar una ruta manual ahora o dejar el tracking pasivo listo para registrar caminatas por día.'
            }
          />
        )}

        <View style={styles.actionStack}>
          <Button
            onPress={() => void handleManualRoute()}
            disabled={actionLoading}
            fullWidth
            color={Colors.steps}
          >
            {manualTracking ? 'Cerrar y guardar ruta manual' : 'Iniciar ruta manual'}
          </Button>
          <Button
            onPress={() => void handlePassiveToggle()}
            disabled={actionLoading}
            variant="secondary"
            fullWidth
            color={Colors.steps}
          >
            {passiveEnabled ? 'Pausar tracking pasivo' : 'Activar tracking pasivo'}
          </Button>
        </View>

        <Text style={styles.routeHelper}>
          El tracking pasivo resume recorridos por día. La ruta manual sirve cuando quieres guardar una salida concreta con más control.
        </Text>
      </Card>

      <Card style={styles.card}>
        <SectionHeader
          eyebrow="Rutas"
          title="Recorridos más usados"
          subtitle="La distancia respeta la unidad que elegiste y separa manual de pasivo."
        />

        {topRoutes.length ? (
          <View style={styles.routeStack}>
            {topRoutes.map((route) => (
              <View key={route.id} style={styles.routeRow}>
                <View style={styles.routeCopy}>
                  <Text style={styles.routeName}>{formatRouteStartedAt(route.startedAt)}</Text>
                  <Text style={styles.routeMeta}>
                    {route.source === 'passive' ? 'Pasiva' : 'Manual'} · {route.points.length} puntos
                  </Text>
                </View>
                <Text style={styles.routeDistance}>{formatDistance(route.distanceKm, distUnit)}</Text>
              </View>
            ))}
          </View>
        ) : (
          <NeutralEmptyPanel
            title="Todavía faltan recorridos"
            body="Cuando guardes más salidas, acá vas a ver cuál te conviene repetir."
          />
        )}
      </Card>

      <NoticeCard title="Lectura semanal" body={insight} tone="success" />
    </ModuleScaffold>
  );
}

const styles = StyleSheet.create({
  metricGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing[3],
  },
  card: {
    gap: Spacing[4],
  },
  emptyPanel: {
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: withOpacity(Colors.white, 0.08),
    backgroundColor: Colors.elevated,
    padding: Spacing[4],
    gap: Spacing[2],
  },
  emptyPanelTitle: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.sm,
    color: Colors.textPrimary,
  },
  emptyPanelBody: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    lineHeight: 20,
    color: Colors.textSecondary,
  },
  distributionBar: {
    flexDirection: 'row',
    height: 14,
    borderRadius: Radius.full,
    overflow: 'hidden',
    backgroundColor: Colors.surface2,
  },
  distributionFill: {
    height: '100%',
  },
  legendRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing[2],
  },
  legendText: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
  },
  liveRouteCard: {
    gap: Spacing[3],
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: withOpacity(Colors.steps, 0.18),
    backgroundColor: withOpacity(Colors.steps, 0.08),
    padding: Spacing[4],
  },
  mapPreviewShell: {
    overflow: 'hidden',
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: withOpacity(Colors.steps, 0.18),
    backgroundColor: Colors.surface2,
  },
  mapPreview: {
    height: 208,
    width: '100%',
  },
  mapPreviewOverlay: {
    gap: Spacing[1],
    padding: Spacing[4],
    borderTopWidth: 1,
    borderTopColor: withOpacity(Colors.white, 0.08),
    backgroundColor: withOpacity(Colors.steps, 0.08),
  },
  mapPreviewTitle: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.sm,
    color: Colors.textPrimary,
  },
  mapPreviewBody: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    lineHeight: 20,
    color: Colors.textSecondary,
  },
  liveRouteHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing[2],
  },
  liveRouteTitle: {
    flex: 1,
    fontFamily: FontFamily.bold,
    fontSize: FontSize.base,
    color: Colors.textPrimary,
  },
  liveRouteBadge: {
    borderRadius: Radius.full,
    paddingHorizontal: Spacing[3],
    paddingVertical: 6,
    backgroundColor: withOpacity(Colors.steps, 0.16),
  },
  liveRouteBadgeText: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    color: Colors.steps,
  },
  routeStatRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing[3],
  },
  routeStat: {
    minWidth: 96,
    flex: 1,
    gap: 2,
  },
  routeStatLabel: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    color: Colors.textMuted,
  },
  routeStatValue: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.base,
    color: Colors.textPrimary,
  },
  routeStatHint: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
  },
  liveRouteBody: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    lineHeight: 20,
    color: Colors.textSecondary,
  },
  actionStack: {
    gap: Spacing[2],
  },
  routeHelper: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    lineHeight: 20,
    color: Colors.textMuted,
  },
  routeStack: {
    gap: Spacing[2],
  },
  routeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: Spacing[3],
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface2,
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[3],
  },
  routeCopy: {
    flex: 1,
    gap: 2,
  },
  routeName: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.sm,
    color: Colors.textPrimary,
  },
  routeMeta: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
  },
  routeDistance: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.sm,
    color: Colors.steps,
  },
});

