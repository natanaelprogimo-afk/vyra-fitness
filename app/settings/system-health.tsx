import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Redirect } from 'expo-router';
import SafeScreen from '@/components/ui/SafeScreen';
import Header from '@/components/layout/Header';
import Card from '@/components/ui/Card';
import MetricCard from '@/components/ui/MetricCard';
import NoticeCard from '@/components/ui/NoticeCard';
import ScreenFooterSpacer from '@/components/ui/ScreenFooterSpacer';
import SectionHeader from '@/components/ui/SectionHeader';
import { Colors } from '@/constants/colors';
import { FontFamily, FontSize, Spacing } from '@/constants/theme';
import { Routes } from '@/constants/routes';
import { useBackendHealth } from '@/hooks/useBackendHealth';
import { useOfflineSync } from '@/hooks/useOfflineSync';

const INTERNAL_SETTINGS_ENABLED =
  __DEV__ && process.env.EXPO_PUBLIC_ENABLE_INTERNAL_ROUTES === 'true';

function formatTimestamp(value: string | number | null) {
  if (!value) return 'Sin registro todavia';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Sin registro todavia';
  return date.toLocaleString('es-UY', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function SystemHealthScreen() {
  if (!INTERNAL_SETTINGS_ENABLED) {
    return <Redirect href={Routes.settings.index as never} />;
  }

  return <SystemHealthContent />;
}

function SystemHealthContent() {
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

  const backendLabel = status === 'ok' ? 'Disponible' : status === 'checking' ? 'Revisando' : 'Caido';
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
      <Header title="Soporte tecnico" showBack color={Colors.brand} />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <NoticeCard
          title="Superficie interna"
          body="Esta lectura queda para soporte y QA. La experiencia normal ya no expone diagnosticos tecnicos ni monetizacion al usuario final."
          tone="info"
          actionLabel="Refrescar backend"
          onAction={() => void refresh()}
          secondaryLabel={queueEnabled ? 'Forzar sync' : 'Revisar sync parcial'}
          onSecondaryAction={() => void triggerSync()}
        />

        {!queueEnabled ? (
          <NoticeCard
            title="Sync parcial, no global"
            body={`${syncModeDescription} Módulos con soporte local activo: ${supportedOfflineModules.join(', ')}. Módulos local-first: ${localFirstModules.join(', ')}.`}
            tone="warning"
          />
        ) : null}

        <Card>
          <SectionHeader
            eyebrow="Estado"
            title="Salud operativa"
            subtitle="Lectura minima para soporte. No debe formar parte del flujo normal de producto."
          />

          <View style={styles.metricGrid}>
            <MetricCard
              value={isOnline ? 'Online' : 'Offline'}
              label="Conectividad"
              note={isOnline ? 'La app detecta internet disponible.' : 'La red no esta disponible ahora mismo.'}
              accentColor={isOnline ? Colors.success : Colors.warning}
            />
            <MetricCard
              value={backendLabel}
              label="Backend"
              note={error ?? `Ultima revision ${formatTimestamp(lastCheckedAt)}`}
              accentColor={status === 'ok' ? Colors.success : status === 'down' ? Colors.error : Colors.warning}
            />
            <MetricCard
              value={syncLabel}
              label="Sincronizacion"
              note={
                syncError ??
                (queueEnabled
                  ? `${pendingCount} cambios pendientes - ${formatTimestamp(lastSyncedAt)}`
                  : `Modo ${syncModeLabel} - ${formatTimestamp(lastSyncedAt)}`)
              }
              accentColor={
                syncStatus === 'idle'
                  ? Colors.success
                  : syncStatus === 'offline' || syncStatus === 'limited'
                    ? Colors.warning
                    : Colors.brand
              }
            />
          </View>
        </Card>

        <Card>
          <SectionHeader
            eyebrow="Producto"
            title="Monetizacion retirada"
            subtitle="La experiencia normal ya no debe exponer superficies internas ni diagnosticos tecnicos."
          />
          <Text style={styles.body}>
            Si necesitas diagnosticar un problema, usa esta pantalla como apoyo interno. Si un usuario final necesita verla para entender VYRA, el producto esta fallando.
          </Text>
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
    gap: Spacing[3],
  },
  body: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    lineHeight: 20,
    color: Colors.textSecondary,
  },
});
