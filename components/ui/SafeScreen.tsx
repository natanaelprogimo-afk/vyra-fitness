// ============================================================
// VYRA FITNESS - SafeScreen
// Wrapper base para todas las pantallas. Safe area + scroll opcional.
// ============================================================

import React from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  View,
  useColorScheme,
  type ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, resolveColorSchemePreference, withOpacity } from '@/constants/colors';
import { Spacing } from '@/constants/theme';
import { useSettingsStore } from '@/stores/settingsStore';

interface SafeScreenProps {
  children: React.ReactNode;
  scrollable?: boolean;
  padHorizontal?: boolean;
  padTop?: boolean;
  padBottom?: boolean;
  disableAtmosphere?: boolean;
  backgroundColor?: string;
  style?: ViewStyle;
  contentStyle?: ViewStyle;
  onScroll?: () => void;
  stickyHeaderIndices?: number[] | undefined;
}

export function SafeScreen({
  children,
  scrollable = false,
  padHorizontal = true,
  padTop = true,
  padBottom = true,
  disableAtmosphere = false,
  backgroundColor = Colors.bgBase,
  style,
  contentStyle,
  onScroll,
  stickyHeaderIndices,
}: SafeScreenProps) {
  const insets = useSafeAreaInsets();
  const colorSchemePreference = useSettingsStore((state) => state.colorScheme);
  const systemColorScheme = useColorScheme();
  const resolvedColorScheme = resolveColorSchemePreference(colorSchemePreference, systemColorScheme);

  const containerStyle: ViewStyle = {
    flex: 1,
    backgroundColor,
    position: 'relative',
    paddingTop: padTop ? insets.top : 0,
    paddingBottom: padBottom ? insets.bottom : 0,
    paddingLeft: padHorizontal ? Spacing[5] : 0,
    paddingRight: padHorizontal ? Spacing[5] : 0,
    overflow: 'hidden',
  };

  const content = scrollable ? (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={[styles.scrollContent, contentStyle]}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      onScrollBeginDrag={onScroll}
      stickyHeaderIndices={stickyHeaderIndices}
    >
      {children}
    </ScrollView>
  ) : (
    <View style={[styles.flex, contentStyle]}>{children}</View>
  );

  return (
    <KeyboardAvoidingView
      style={[containerStyle, style]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar
        barStyle={resolvedColorScheme === 'dark' ? 'light-content' : 'dark-content'}
        backgroundColor={backgroundColor}
      />

      {!disableAtmosphere ? (
        <>
          <View pointerEvents="none" style={styles.atmosphereLayer}>
            <View style={[styles.glow, styles.topGlow, { backgroundColor: withOpacity(Colors.action, 0.12) }]} />
            <View style={[styles.glow, styles.bottomGlow, { backgroundColor: withOpacity(Colors.sleep, 0.08) }]} />
          </View>
          <View
            pointerEvents="none"
            style={[styles.overlayWash, { backgroundColor: withOpacity(Colors.bgBase, 0.18) }]}
          />
        </>
      ) : null}

      {content}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  scroll: { flex: 1 },
  scrollContent: { flexGrow: 1 },
  atmosphereLayer: {
    ...StyleSheet.absoluteFillObject,
  },
  glow: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 220,
    opacity: 0.9,
  },
  topGlow: {
    top: -92,
    right: -60,
  },
  bottomGlow: {
    bottom: 40,
    left: -90,
  },
  overlayWash: {
    ...StyleSheet.absoluteFillObject,
  },
});

export default SafeScreen;
