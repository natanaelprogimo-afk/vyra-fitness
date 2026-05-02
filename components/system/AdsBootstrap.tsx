import React, { useEffect, useState } from 'react';
import { View, Text, NativeModules } from 'react-native';
import { captureError } from '@/lib/sentry';
import { initializeUnityAds, preloadCoreAds } from '@/lib/ads/runtime';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import { getAdConsent, setAdConsent } from '@/lib/ad-consent';

type VyraUnityAdsConsentModule = {
  setPersonalizedAdsAllowed?: (allowed: boolean) => Promise<void> | void;
};

export default function AdsBootstrap() {
  const [showConsentModal, setShowConsentModal] = useState(false);
  useEffect(() => {
    let cancelled = false;

    const init = async () => {
      try {
        const c = await getAdConsent();
        if (cancelled) return;
        if (c === 'unknown') {
          setShowConsentModal(true);
          return;
        }

        // propagate to native and initialize
        try {
          const personalized = c === 'personalized';
          await (NativeModules.VyraUnityAds as VyraUnityAdsConsentModule | undefined)?.setPersonalizedAdsAllowed?.(personalized);
        } catch {
          // ignore native failures
        }

        await initializeUnityAds();
        if (cancelled) return;
        await preloadCoreAds();
      } catch (error) {
        if (cancelled) return;
        captureError(error instanceof Error ? error : new Error(String(error)), {
          action: 'AdsBootstrap.bootAds',
        });
      }
    };

    void init();

    return () => {
      cancelled = true;
    };
  }, []);

  async function acceptConsent(personalized: boolean) {
    try {
      await setAdConsent(personalized ? 'personalized' : 'non_personalized');
      try {
        await (NativeModules.VyraUnityAds as VyraUnityAdsConsentModule | undefined)?.setPersonalizedAdsAllowed?.(personalized);
      } catch {
        // ignore
      }
      setShowConsentModal(false);
      // now initialize
      await initializeUnityAds();
      await preloadCoreAds();
    } catch (error) {
      captureError(error instanceof Error ? error : new Error(String(error)), {
        action: 'AdsBootstrap.acceptConsent',
      });
    }
  }

  return (
    <>
      <Modal
        visible={showConsentModal}
        onClose={() => setShowConsentModal(false)}
        title="Preferencias de anuncios"
        ctaLabel={undefined}
        showClose={true}
      >
        <View style={{ paddingVertical: 8 }}>
          <Text style={{ marginBottom: 12 }}>
            Podemos mostrar anuncios en la app. ¿Deseas anuncios personalizados para mejorar la relevancia?
          </Text>
          <Button fullWidth onPress={() => void acceptConsent(true)}>
            Permitir anuncios personalizados
          </Button>
          <Button fullWidth variant="ghost" style={{ marginTop: 12 }} onPress={() => void acceptConsent(false)}>
            No permitir anuncios personalizados
          </Button>
        </View>
      </Modal>
    </>
  );
}
