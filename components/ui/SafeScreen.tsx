// REDESIGNED: 2026-05-20 - safe shell is calmer and more instrument-like
import React from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  View,
  useColorScheme,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
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
  onScroll?: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
  stickyHeaderIndices?: number[] | undefined;
}

export function SafeScreen({
  children,
  scrollable = false,
  padHorizontal = true,
  padTop = true,
  padBottom = true,
  disableAtmosphere = false,
  backgroundColor = Colors.base,
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
      onScroll={onScroll}
      scrollEventThrottle={16}
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
            <View
              style={[
                styles.topGlow,
                { backgroundColor: withOpacity(Colors.info, resolvedColorScheme === 'dark' ? 0.045 : 0.03) },
              ]}
            />
            <View
              style={[
                styles.cornerGlow,
                { backgroundColor: withOpacity(Colors.action, resolvedColorScheme === 'dark' ? 0.035 : 0.02) },
              ]}
            />
          </View>
          <View
            pointerEvents="none"
            style={[
              styles.overlayWash,
              {
                backgroundColor:
                  resolvedColorScheme === 'dark'
                    ? withOpacity(Colors.base, 0.02)
                    : withOpacity(Colors.white, 0.18),
              },
            ]}
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
  topGlow: {
    position: 'absolute',
    width: 280,
    height: 280,
    borderRadius: 280,
    top: -180,
    right: -140,
  },
  cornerGlow: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 180,
    bottom: -120,
    left: -110,
  },
  overlayWash: {
    ...StyleSheet.absoluteFillObject,
  },
});

export default SafeScreen;
