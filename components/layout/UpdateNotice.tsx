import React, { useEffect, useMemo, useState } from 'react';
import { Linking, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Application from 'expo-application';
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { Colors } from '@/constants/colors';
import { FontFamily, FontSize, Spacing } from '@/constants/theme';
import { useUIStore } from '@/stores/uiStore';

function parseVersion(raw: string | null | undefined): number[] {
  if (!raw) return [];
  return raw
    .split('.')
    .map((part) => Number(part.replace(/[^0-9]/g, '')))
    .filter((value) => Number.isFinite(value));
}

function isNewerVersion(remote: string | null | undefined, current: string | null | undefined): boolean {
  const r = parseVersion(remote);
  const c = parseVersion(current);
  if (!r.length || !c.length) return false;
  const len = Math.max(r.length, c.length);
  for (let i = 0; i < len; i += 1) {
    const rv = r[i] ?? 0;
    const cv = c[i] ?? 0;
    if (rv > cv) return true;
    if (rv < cv) return false;
  }
  return false;
}

export default function UpdateNotice() {
  const showToast = useUIStore((state) => state.showToast);
  const [dismissed, setDismissed] = useState(false);
  const reduceMotion = useReducedMotion();
  const opacity = useSharedValue(0);
  const height = useSharedValue(0);

  const apkUrl = process.env.EXPO_PUBLIC_APK_URL ?? '';
  const latestVersion = process.env.EXPO_PUBLIC_LATEST_APK_VERSION ?? '';
  const currentVersion = Application.nativeApplicationVersion ?? '';

  const shouldShow = useMemo(
    () => Platform.OS === 'android' && Boolean(apkUrl) && !dismissed && isNewerVersion(latestVersion, currentVersion),
    [apkUrl, currentVersion, dismissed, latestVersion],
  );

  useEffect(() => {
    if (shouldShow) {
      opacity.value = withTiming(1, { duration: reduceMotion ? 0 : 220 });
      height.value = withTiming(58, { duration: reduceMotion ? 0 : 220 });
      return;
    }

    opacity.value = withTiming(0, { duration: reduceMotion ? 0 : 180 });
    height.value = withTiming(0, { duration: reduceMotion ? 0 : 180 });
  }, [height, opacity, reduceMotion, shouldShow]);

  const animStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    height: height.value,
  }));

  const handleOpen = async () => {
    if (!apkUrl) return;
    const opened = await Linking.openURL(apkUrl).catch(() => false);
    if (!opened) {
      showToast('No se pudo abrir el link de actualizacion.', 'error');
    }
  };

  if (!shouldShow) return null;

  return (
    <Animated.View style={[styles.container, animStyle]}>
      <Pressable onPress={handleOpen} style={styles.pressable} accessibilityRole="button">
        <View style={styles.copyWrap}>
          <View style={styles.iconWrap}>
            <Ionicons name="download-outline" size={14} color={Colors.brand} />
          </View>
          <View style={styles.textStack}>
            <Text style={styles.title}>Nueva version disponible</Text>
            <Text style={styles.text}>Actualiza tu APK para mantener mejoras y correcciones al dia.</Text>
          </View>
        </View>
        <Text style={styles.action}>Actualizar</Text>
      </Pressable>
      <Pressable onPress={() => setDismissed(true)} accessibilityRole="button" style={styles.closeButton}>
        <Ionicons name="close" size={16} color={Colors.textMuted} />
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[3],
    overflow: 'hidden',
    paddingHorizontal: Spacing[4],
    backgroundColor: `${Colors.brand}14`,
    borderBottomWidth: 1,
    borderBottomColor: `${Colors.brand}33`,
  },
  pressable: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing[3],
  },
  copyWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[2],
  },
  textStack: {
    flex: 1,
    gap: 2,
  },
  iconWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: `${Colors.brand}16`,
    borderWidth: 1,
    borderColor: `${Colors.brand}2A`,
  },
  title: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.xs,
    color: Colors.textPrimary,
  },
  text: {
    flex: 1,
    fontFamily: FontFamily.medium,
    fontSize: FontSize.xs,
    lineHeight: 17,
    color: Colors.textSecondary,
  },
  action: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.xs,
    color: Colors.brand,
  },
  closeButton: {
    paddingVertical: Spacing[2],
    paddingHorizontal: Spacing[1],
  },
});
