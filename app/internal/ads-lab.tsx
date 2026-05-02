import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import Header from '@/components/layout/Header';
import BannerPlacementCard from '@/components/ads/BannerPlacementCard';
import RewardedUnlockCard from '@/components/ads/RewardedUnlockCard';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import NoticeCard from '@/components/ui/NoticeCard';
import SafeScreen from '@/components/ui/SafeScreen';
import SectionHeader from '@/components/ui/SectionHeader';
import { Colors } from '@/constants/colors';
import { FontFamily, FontSize, Spacing } from '@/constants/theme';
import {
  getUnityAdsDebugState,
  hideBannerPlacement,
  initializeUnityAds,
  preloadPlacement,
  showBannerPlacement,
  showRewardedPlacement,
  tryShowInterstitialPlacement,
} from '@/lib/ads/runtime';

const QA_LAB_ENABLED =
  __DEV__ || process.env.EXPO_PUBLIC_ENABLE_QA_SESSION_BRIDGE === 'true';

export default function AdsLabScreen() {
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<string>('Todavia no corriste ninguna prueba.');
  const [debugState, setDebugState] = useState<Record<string, unknown> | null>(null);
  const [rewardUnlocked, setRewardUnlocked] = useState(false);

  const stateText = useMemo(
    () => (debugState ? JSON.stringify(debugState, null, 2) : 'Sin snapshot nativo todavia.'),
    [debugState],
  );

  const refreshState = async () => {
    setBusy(true);
    try {
      const state = await getUnityAdsDebugState();
      setDebugState(state as Record<string, unknown>);
      setStatus('Estado de Unity Ads actualizado.');
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'No pudimos leer el estado de anuncios.');
    } finally {
      setBusy(false);
    }
  };

  const runAction = async (label: string, task: () => Promise<void>) => {
    setBusy(true);
    try {
      await task();
      setStatus(label);
      const state = await getUnityAdsDebugState();
      setDebugState(state as Record<string, unknown>);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : `No pudimos completar ${label.toLowerCase()}.`);
    } finally {
      setBusy(false);
    }
  };

  if (!QA_LAB_ENABLED) {
    return (
      <SafeScreen padHorizontal={false} padBottom>
        <Header title="Laboratorio de anuncios" showBack color={Colors.warning} />
        <View style={styles.centered}>
          <NoticeCard
            title="QA interno desactivado"
            body="Esta ruta solo vive en builds locales con el bridge QA habilitado."
            tone="warning"
          />
        </View>
      </SafeScreen>
    );
  }

  return (
    <SafeScreen padHorizontal={false} padBottom>
      <Header title="Laboratorio de anuncios" showBack color={Colors.brand} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <NoticeCard
          title="Unity Ads QA"
          body="Desde aqui podemos probar inicializacion, preload, rewarded, interstitial y banner sin depender del recorrido completo de la app."
          tone="info"
        />

        <Card>
          <SectionHeader
            eyebrow="Bootstrap"
            title="Estado del SDK"
            subtitle="Primero inicializamos el SDK y luego pedimos un snapshot nativo para revisar test mode, placements cargados y ultimo evento de banner."
          />
          <View style={styles.buttonStack}>
            <Button
              fullWidth
              color={Colors.brand}
              disabled={busy}
              onPress={() =>
                void runAction('Unity Ads inicializado.', async () => {
                  await initializeUnityAds();
                })
              }
            >
              {busy ? 'Procesando...' : 'Inicializar SDK'}
            </Button>
            <Button
              fullWidth
              variant="secondary"
              disabled={busy}
              onPress={() => {
                void refreshState();
              }}
            >
              {busy ? 'Leyendo...' : 'Refrescar estado'}
            </Button>
          </View>
        </Card>

        <Card>
          <SectionHeader
            eyebrow="Full screen"
            title="Preload"
            subtitle="Cargamos rewarded e interstitial por separado para confirmar que los placements quedan listos antes de mostrarlos."
          />
          <View style={styles.buttonStack}>
            <Button
              fullWidth
              color={Colors.workout}
              disabled={busy}
              onPress={() =>
                void runAction('Rewarded precargado.', async () => {
                  await preloadPlacement('workout_summary_extended');
                })
              }
            >
              Precargar rewarded
            </Button>
            <Button
              fullWidth
              color={Colors.action}
              disabled={busy}
              onPress={() =>
                void runAction('Interstitial precargado.', async () => {
                  await preloadPlacement('explore_deep_dive');
                })
              }
            >
              Precargar interstitial
            </Button>
          </View>
        </Card>

        <RewardedUnlockCard
          title="Rewarded QA"
          body={
            rewardUnlocked
              ? 'La recompensa ya quedo desbloqueada en este laboratorio.'
              : 'Esto debe abrir un video recompensado y, si se completa, desbloquear el estado local de prueba.'
          }
          buttonLabel={rewardUnlocked ? 'Rewarded ya completado' : 'Mostrar rewarded'}
          loading={busy}
          accent={Colors.workout}
          onPress={() =>
            void runAction('Rewarded probado.', async () => {
              const outcome = await showRewardedPlacement('workout_summary_extended');
              if (outcome.shown && outcome.result.completed) {
                setRewardUnlocked(true);
                return;
              }
              throw new Error(
                outcome.shown
                  ? 'El rewarded se mostro, pero no quedo completado.'
                  : `El rewarded no se mostro: ${outcome.reason}.`,
              );
            })
          }
        />

        <Card>
          <SectionHeader
            eyebrow="Explore"
            title="Interstitial QA"
            subtitle="Tiene que mostrarse si el placement ya esta listo. Si no esta listo, el helper debe degradar con elegancia."
          />
          <Button
            fullWidth
            color={Colors.action}
            disabled={busy}
            onPress={() =>
              void runAction('Interstitial probado.', async () => {
                const outcome = await tryShowInterstitialPlacement('explore_deep_dive');
                if (!outcome.shown) {
                  throw new Error(`El interstitial no se mostro: ${outcome.reason}.`);
                }
              })
            }
          >
            {busy ? 'Mostrando...' : 'Mostrar interstitial'}
          </Button>
        </Card>

        <BannerPlacementCard
          placementKey="internal_ads_lab_banner"
          title="Banner QA"
          body="El banner real ahora debe quedar anclado al pie de la pantalla. Estas acciones fuerzan el show y el hide del overlay nativo."
          activateOnMount={false}
        />

        <Card>
          <SectionHeader
            eyebrow="Banner"
            title="Overlay QA"
            subtitle="Forzamos el banner fijo del Activity para verificar si el bridge nativo responde incluso cuando el banner embebido no sirve como referencia."
          />
          <View style={styles.buttonStack}>
            <Button
              fullWidth
              color={Colors.info}
              disabled={busy}
              onPress={() =>
                void runAction('Banner overlay solicitado.', async () => {
                  const shown = await showBannerPlacement('internal_ads_lab_banner');
                  if (!shown) {
                    throw new Error('El bridge de banner no quedo disponible para esta build.');
                  }
                })
              }
            >
              Mostrar banner fijo
            </Button>
            <Button
              fullWidth
              variant="secondary"
              color={Colors.info}
              disabled={busy}
              onPress={() =>
                void runAction('Banner overlay ocultado.', async () => {
                  await hideBannerPlacement();
                })
              }
            >
              Ocultar banner fijo
            </Button>
          </View>
        </Card>

        <Card>
          <SectionHeader
            eyebrow="Ultimo estado"
            title="Diagnostico"
            subtitle="Sirve para confirmar si el SDK quedo inicializado, si hay placements cargados y como quedo el ultimo banner."
          />
          <Text style={styles.statusText}>{status}</Text>
          <Text style={styles.debugText}>{stateText}</Text>
        </Card>
      </ScrollView>
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    paddingHorizontal: Spacing[5],
    justifyContent: 'center',
  },
  content: {
    paddingHorizontal: Spacing[5],
    paddingTop: Spacing[4],
    paddingBottom: Spacing[8],
    gap: Spacing[4],
  },
  buttonStack: {
    gap: Spacing[3],
  },
  statusText: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.sm,
    lineHeight: 20,
    color: Colors.textPrimary,
    marginBottom: Spacing[3],
  },
  debugText: {
    fontFamily: FontFamily.mono,
    fontSize: FontSize.xs,
    lineHeight: 18,
    color: Colors.textSecondary,
  },
});
