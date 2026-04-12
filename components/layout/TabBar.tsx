// ============================================================
// VYRA FITNESS — TabBar
// Tab bar custom con 5 tabs, indicadores y animaciones
// ============================================================

import React from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  type ViewStyle,
} from 'react-native';
import { type BottomTabBarProps } from '@react-navigation/bottom-tabs';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '@/constants/colors';
import { FontSize, FontFamily, Spacing, Radius } from '@/constants/theme';

const TAB_CONFIG: Record<string, { icon: string; label: string; activeColor: string }> = {
  index:   { icon: '🏠', label: 'Home',     activeColor: Colors.brand     },
  log:     { icon: '➕', label: 'Log',      activeColor: Colors.steps     },
  progress:{ icon: '📊', label: 'Progreso', activeColor: Colors.nutrition },
  coach:   { icon: '🤖', label: 'Coach',    activeColor: Colors.mental    },
  profile: { icon: '👤', label: 'Perfil',   activeColor: Colors.weight    },
};

function TabItem({
  route,
  isFocused,
  onPress,
  onLongPress,
}: {
  route: { name: string; key: string };
  isFocused:    boolean;
  onPress:      () => void;
  onLongPress:  () => void;
}) {
  const config  = TAB_CONFIG[route.name] ?? { icon: '●', label: route.name, activeColor: Colors.brand };
  const scale   = useSharedValue(1);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = () => {
    scale.value = withSpring(0.85, { damping: 10, stiffness: 300 }, () => {
      scale.value = withSpring(1, { damping: 12, stiffness: 200 });
    });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    onPress();
  };

  return (
    <Pressable
      onPress={handlePress}
      onLongPress={onLongPress}
      style={styles.tabItem}
      accessibilityRole="button"
      accessibilityState={{ selected: isFocused }}
      accessibilityLabel={config.label}
    >
      <Animated.View style={[styles.tabContent, animStyle]}>
        {/* Indicador activo */}
        {isFocused && (
          <View style={[styles.indicator, { backgroundColor: config.activeColor + '22' }]}>
            <View style={[styles.indicatorDot, { backgroundColor: config.activeColor }]} />
          </View>
        )}

        <Text style={[styles.icon, isFocused && { opacity: 1 }]}>{config.icon}</Text>
        <Text
          style={[
            styles.label,
            { color: isFocused ? config.activeColor : Colors.textMuted },
            isFocused && styles.labelActive,
          ]}
        >
          {config.label}
        </Text>
      </Animated.View>
    </Pressable>
  );
}

export default function TabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      <View style={styles.bar}>
        {state.routes.map((route, index) => {
          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type:   'tabPress',
              target: route.key,
              canPreventDefault: true,
            });
            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          const onLongPress = () => {
            navigation.emit({ type: 'tabLongPress', target: route.key });
          };

          return (
            <TabItem
              key={route.key}
              route={route}
              isFocused={isFocused}
              onPress={onPress}
              onLongPress={onLongPress}
            />
          );
        })}
      </View>
        <Pressable
          accessible
          accessibilityRole="button"
          onPress={() => navigation.navigate('log')}
          style={[styles.fab, { bottom: insets.bottom + 12 }]}
        >
          <View style={styles.fabInner}>
            <Text style={styles.fabIcon}>＋</Text>
          </View>
        </Pressable>
        <Pressable
          accessible
          accessibilityRole="button"
          onPress={() => navigation.navigate('coach')}
          style={[styles.coachBubble, { bottom: insets.bottom + 12 }]}
        >
          <Text style={styles.coachIcon}>🤖</Text>
        </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.bgSurface,
    borderTopWidth:  1,
    borderTopColor:  Colors.border,
  },
  bar: {
    flexDirection:  'row',
    height:         60,
    paddingTop:     Spacing[1],
  },
  tabItem: {
    flex:           1,
    alignItems:     'center',
    justifyContent: 'center',
  },
  tabContent: {
    alignItems:     'center',
    justifyContent: 'center',
    position:       'relative',
    paddingTop:     Spacing[1],
  },
  indicator: {
    position:       'absolute',
    top:            -Spacing[1],
    width:          40,
    height:         3,
    borderRadius:   Radius.full,
    alignItems:     'center',
    justifyContent: 'flex-start',
    flexDirection:  'column',
  },
  indicatorDot: {
    width:        24,
    height:       3,
    borderRadius: Radius.full,
  },
  icon: {
    fontSize: FontSize.xl,
    opacity:  0.6,
  },
  label: {
    fontFamily: FontFamily.medium,
    fontSize:   FontSize.xs,
    marginTop:  2,
  },
  labelActive: {
    fontFamily: FontFamily.semibold,
  },
  fab: {
    position: 'absolute',
    left: '50%',
    transform: [{ translateX: -36 }],
    width: 72,
    height: 72,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fabInner: {
    width: 60,
    height: 60,
    borderRadius: Radius.full,
    backgroundColor: Colors.brand,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.brand,
    shadowOpacity: 0.18,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 12,
  },
  fabIcon: {
    color: Colors.white,
    fontSize: FontSize.xl,
    fontFamily: FontFamily.semibold,
  },
  coachBubble: {
    position: 'absolute',
    right: Spacing[4],
    width: 48,
    height: 48,
    borderRadius: Radius.full,
    backgroundColor: Colors.brand,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
  },
  coachIcon: {
    fontSize: 20,
    color: Colors.white,
  },
});