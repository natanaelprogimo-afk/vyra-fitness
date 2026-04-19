// ============================================================
// VYRA FITNESS — SafeScreen
// Wrapper base para todas las pantallas. Safe area + scroll opcional.
// ============================================================

import React from 'react';
import {
  View,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  StyleSheet,
  type ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '@/constants/colors';

interface SafeScreenProps {
  children:       React.ReactNode;
  scrollable?:    boolean;
  padHorizontal?: boolean;
  padTop?:        boolean;
  padBottom?:     boolean;
  disableAtmosphere?: boolean;
  backgroundColor?:string;
  style?:         ViewStyle;
  contentStyle?:  ViewStyle;
  onScroll?:      () => void;
  stickyHeaderIndices?: number[] | undefined;
}

export function SafeScreen({
  children,
  scrollable      = false,
  padHorizontal   = true,
  padTop          = true,
  padBottom       = true,
  disableAtmosphere = false,
  backgroundColor = Colors.bgBase,
  style,
  contentStyle,
  onScroll,
  stickyHeaderIndices,
}: SafeScreenProps) {
  const insets = useSafeAreaInsets();

  const containerStyle: ViewStyle = {
    flex:            1,
    backgroundColor,
    position:        'relative',
    paddingTop:      padTop ? insets.top : 0,
    paddingBottom:   padBottom ? insets.bottom : 0,
    paddingLeft:     padHorizontal ? 20 : 0,
    paddingRight:    padHorizontal ? 20 : 0,
  };

  const content = scrollable ?  (
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
      <StatusBar barStyle="light-content" backgroundColor={backgroundColor} />
      {content}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex:          { flex: 1 },
  scroll:        { flex: 1 },
  scrollContent: { flexGrow: 1 },
});

export default SafeScreen;
