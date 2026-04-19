import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { type BottomTabBarProps } from '@react-navigation/bottom-tabs';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '@/constants/colors';
import { FontFamily, FontSize, Radius, Spacing } from '@/constants/theme';

const TAB_CONFIG: Record<
  string,
  { icon: React.ComponentProps<typeof Ionicons>['name']; label: string }
> = {
  index: { icon: 'home', label: 'Inicio' },
  progress: { icon: 'trending-up', label: 'Progreso' },
};

function TabItem({
  route,
  isFocused,
  onPress,
}: {
  route: { name: string; key: string };
  isFocused: boolean;
  onPress: () => void;
}) {
  const config = TAB_CONFIG[route.name];
  if (!config) return null;

  return (
    <Pressable onPress={onPress} style={styles.tabItem}>
      <Ionicons
        name={config.icon}
        size={22}
        color={isFocused ? Colors.action : Colors.textMuted}
      />
      <Text style={[styles.label, isFocused && styles.labelActive]}>{config.label}</Text>
    </Pressable>
  );
}

export default function TabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const visibleRoutes = state.routes.filter((route) => ['index', 'progress'].includes(route.name));

  const buildTab = (route: { name: string; key: string }) => {
    const isFocused = state.routes[state.index]?.name === route.name;
    const onPress = () => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
      const event = navigation.emit({
        type: 'tabPress',
        target: route.key,
        canPreventDefault: true,
      });
      if (!isFocused && !event.defaultPrevented) {
        navigation.navigate(route.name);
      }
    };

    return <TabItem key={route.key} route={route} isFocused={isFocused} onPress={onPress} />;
  };

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom + 8 }]}>
      <View style={styles.bar}>{visibleRoutes.map(buildTab)}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.bgBase,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingHorizontal: 0,
    paddingTop: Spacing[2],
  },
  bar: {
    minHeight: 64,
    backgroundColor: Colors.bgSurface,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: Spacing[4],
  },
  tabItem: {
    minWidth: 96,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  label: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    letterSpacing: 0.2,
  },
  labelActive: {
    color: Colors.action,
    fontFamily: FontFamily.semibold,
  },
});
