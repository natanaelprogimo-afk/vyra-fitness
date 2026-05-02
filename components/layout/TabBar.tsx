import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { type BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { router, usePathname } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '@/constants/colors';
import { FontFamily, FontSize, Radius, Spacing } from '@/constants/theme';
import PulseOrb from '@/components/ui/PulseOrb';
import QuickLogSheet from '@/components/sheets/QuickLogSheet';
import { useUIStore } from '@/stores/uiStore';
import { triggerImpactHaptic } from '@/lib/haptics';

const TAB_CONFIG: Record<
  string,
  {
    icon: React.ComponentProps<typeof Ionicons>['name'];
    label: string;
    hint: string;
  }
> = {
  index: { icon: 'home', label: 'Inicio', hint: 'Abre tu resumen del dia.' },
  explore: { icon: 'compass-outline', label: 'Explorar', hint: 'Muestra rutas, programas y siguientes pasos.' },
  progress: { icon: 'trending-up', label: 'Progreso', hint: 'Abre tus tendencias y consistencia.' },
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
    <Pressable
      onPress={onPress}
      style={styles.tabItem}
      accessibilityRole="tab"
      accessibilityState={{ selected: isFocused }}
      accessibilityLabel={config.label}
      accessibilityHint={config.hint}
    >
      <Ionicons
        name={config.icon}
        size={22}
        color={isFocused ? Colors.action : Colors.textMuted}
      />
      <Text
        style={[
          styles.label,
          { color: isFocused ? Colors.action : Colors.textMuted },
          isFocused && styles.labelActive,
        ]}
        maxFontSizeMultiplier={1.2}
      >
        {config.label}
      </Text>
    </Pressable>
  );
}

export default function TabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const pathname = usePathname();
  const openQuickLog = useUIStore((store) => store.openQuickLog);
  const visibleRoutes = state.routes.filter((route) => ['index', 'explore', 'progress'].includes(route.name));

  const buildTab = (route: { name: string; key: string }) => {
    const isFocused =
      route.name === 'index'
        ? pathname === '/'
        : pathname.startsWith(`/${route.name}`);

    const onPress = () => {
      void triggerImpactHaptic('light');
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
    <>
      <View
        style={[
          styles.container,
          {
            paddingBottom: insets.bottom + 8,
            backgroundColor: Colors.bgBase,
          },
        ]}
        accessibilityRole="tablist"
        accessibilityLabel="Navegacion principal"
      >
        <View
          style={[
            styles.bar,
            {
              backgroundColor: Colors.bgGlass,
              borderColor: Colors.border,
            },
          ]}
        >
          {visibleRoutes.slice(0, 2).map(buildTab)}

          <View style={styles.fabSlot}>
            <Pressable
              onPress={() => {
                void triggerImpactHaptic('medium');
                openQuickLog();
              }}
              style={styles.fab}
              accessibilityRole="button"
              accessibilityLabel="Registro rapido"
              accessibilityHint="Abre el panel para registrar agua, peso, ayuno o sueño."
            >
              <Ionicons name="add" size={24} color={Colors.white} />
              <PulseOrb color={Colors.action} size={6} style={styles.fabPulse} />
            </Pressable>
          </View>

          {visibleRoutes.slice(2).map(buildTab)}

          <Pressable
            onPress={() => {
              void triggerImpactHaptic('light');
              router.push('/profile/sheet' as never);
            }}
            style={styles.tabItem}
            accessibilityRole="tab"
            accessibilityState={{ selected: pathname.startsWith('/profile') }}
            accessibilityLabel="Perfil"
            accessibilityHint="Abre tu cuenta, modulos y ajustes."
          >
            <Ionicons
              name="person-circle-outline"
              size={22}
              color={pathname.startsWith('/profile') ? Colors.action : Colors.textMuted}
            />
            <Text
              style={[
                styles.label,
                { color: pathname.startsWith('/profile') ? Colors.action : Colors.textMuted },
                pathname.startsWith('/profile') && styles.labelActive,
              ]}
              maxFontSizeMultiplier={1.2}
            >
              Perfil
            </Text>
          </Pressable>
        </View>
      </View>
      <QuickLogSheet />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing[4],
    paddingTop: Spacing[2],
  },
  bar: {
    minHeight: 76,
    borderWidth: 1,
    borderRadius: Radius.full,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing[3],
  },
  tabItem: {
    flex: 1,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  label: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.xs,
    letterSpacing: 0.2,
  },
  labelActive: {
    fontFamily: FontFamily.semibold,
  },
  fabSlot: {
    width: 82,
    alignItems: 'center',
  },
  fab: {
    width: 58,
    height: 58,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.action,
    shadowColor: Colors.action,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.22,
    shadowRadius: 20,
    elevation: 10,
  },
  fabPulse: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
});
