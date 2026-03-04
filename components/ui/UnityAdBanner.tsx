import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { usePremiumStore } from '@/stores/premiumStore';
import { Colors } from '@/constants/colors';
import { FontFamily } from '@/constants/theme';

interface UnityAdBannerProps {
  style?: object;
}

export function UnityAdBanner({ style }: UnityAdBannerProps) {
  const { isPremium } = usePremiumStore();
  const [bannerReady, setBannerReady] = useState(false);

  // Unity Ads disabled: always show placeholder for now
  useEffect(() => {
    if (!isPremium) {
      // simulate banner availability for placeholder
      setTimeout(() => setBannerReady(true), 200);
    }
  }, [isPremium]);

  // Usuarios Premium no ven banners
  if (isPremium) return null;

  // Placeholder visual mientras carga (o si el SDK no está disponible en dev)
  if (!bannerReady || __DEV__) {
    return (
      <View style={[styles.placeholder, style]}>
        <Text style={styles.placeholderText}>[ Publicidad ]</Text>
      </View>
    );
  }

  // Cuando el SDK esté configurado, reemplazar con el componente real:
  // import { UnityBannerAd } from 'react-native-unity-ads';
  // return <UnityBannerAd placementId={AD_UNITS.BANNER} style={[styles.banner, style]} />;
  return (
    <View style={[styles.placeholder, style]}>
      <Text style={styles.placeholderText}>[ Publicidad ]</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  placeholder: {
    height: 50,
    backgroundColor: Colors.bgSurface,
    justifyContent: 'center',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  placeholderText: {
    fontFamily: FontFamily.regular,
    fontSize: 12,
    color: Colors.textMuted,
  },
});