// REDESIGNED: 2026-05-20 - tab bar is calmer, clearer, and less dominant
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { type BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { router, usePathname } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import QuickLogSheet from '@/components/sheets/QuickLogSheet';
import { Colors } from '@/constants/colors';
import { FontFamily, Radius, Spacing } from '@/constants/theme';
import { TabBarCopy } from '@/constants/strings';
import { triggerImpactHaptic } from '@/lib/haptics';
import { resolveSupportedLanguage } from '@/lib/language';
import { useUIStore } from '@/stores/uiStore';

const TAB_CONFIG: Record<
  string,
  {
    activeIcon: React.ComponentProps<typeof Ionicons>['name'];
    inactiveIcon: React.ComponentProps<typeof Ionicons>['name'];
  }
> = {
  index: { activeIcon: 'home', inactiveIcon: 'home-outline' },
  explore: { activeIcon: 'compass', inactiveIcon: 'compass-outline' },
  progress: { activeIcon: 'stats-chart', inactiveIcon: 'stats-chart-outline' },
};

const TAB_COPY = {
  es: {
    tabs: {
      index: { label: 'Inicio', hint: 'Abre tu resumen del día.' },
      explore: { label: 'Plan', hint: 'Muestra rutas, programas y siguientes pasos.' },
      progress: { label: 'Progreso', hint: 'Abre tus tendencias y consistencia.' },
      profile: { label: 'Perfil', hint: 'Abre tu cuenta, módulos y ajustes.' },
    },
    nav: 'Navegacion principal',
    quickLog: {
      label: 'Registro rapido',
      hint: TabBarCopy.quickLogHint,
    },
  },
  en: {
    tabs: {
      index: { label: 'Home', hint: 'Opens your daily overview.' },
      explore: { label: 'Plan', hint: 'Shows paths, programs, and next steps.' },
      progress: { label: 'Progress', hint: 'Opens your trends and consistency.' },
      profile: { label: 'Profile', hint: 'Opens your account, modules, and settings.' },
    },
    nav: 'Main navigation',
    quickLog: {
      label: 'Quick log',
      hint: TabBarCopy.quickLogHint,
    },
  },
  pt: {
    tabs: {
      index: { label: 'Inicio', hint: 'Abre seu resumo diario.' },
      explore: { label: 'Plano', hint: 'Mostra rotas, programas e proximos passos.' },
      progress: { label: 'Progresso', hint: 'Abre suas tendencias e constancia.' },
      profile: { label: 'Perfil', hint: 'Abre sua conta, módulos e ajustes.' },
    },
    nav: 'Navegacao principal',
    quickLog: {
      label: 'Registro rapido',
      hint: TabBarCopy.quickLogHint,
    },
  },
} as const;

function TabItem({
  route,
  isFocused,
  onPress,
}: {
  route: { name: string; key: string };
  isFocused: boolean;
  onPress: () => void;
}) {
  const { i18n } = useTranslation();
  const copy = TAB_COPY[resolveSupportedLanguage(i18n.resolvedLanguage ?? i18n.language)];
  const config = TAB_CONFIG[route.name];
  const tabMeta = copy.tabs[route.name as keyof typeof copy.tabs];

  if (!config || !tabMeta) return null;

  return (
    <Pressable
      onPress={onPress}
      style={styles.tabItem}
      accessibilityRole="tab"
      accessibilityState={{ selected: isFocused }}
      accessibilityLabel={tabMeta.label}
      accessibilityHint={tabMeta.hint}
    >
      <Ionicons
        name={isFocused ? config.activeIcon : config.inactiveIcon}
        size={22}
        color={isFocused ? Colors.textPrimary : Colors.textMuted}
      />
      <Text
        style={[styles.label, isFocused ? styles.labelActive : styles.labelInactive]}
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.82}
        maxFontSizeMultiplier={1.2}
      >
        {tabMeta.label}
      </Text>
      <View style={[styles.activeDot, isFocused ? styles.activeDotVisible : null]} />
    </Pressable>
  );
}

export default function TabBar({ state, navigation }: BottomTabBarProps) {
  const { i18n } = useTranslation();
  const copy = TAB_COPY[resolveSupportedLanguage(i18n.resolvedLanguage ?? i18n.language)];
  const insets = useSafeAreaInsets();
  const pathname = usePathname();
  const openQuickLog = useUIStore((store) => store.openQuickLog);
  const visibleRoutes = state.routes.filter((route) => ['index', 'explore', 'progress'].includes(route.name));

  const buildTab = (route: { name: string; key: string }) => {
    const isFocused =
      route.name === 'index' ? pathname === '/' : pathname.startsWith(`/${route.name}`);

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

  const profileFocused = pathname.startsWith('/profile');

  return (
    <>
      <View
        style={[
          styles.container,
          {
            paddingBottom: insets.bottom + 8,
            backgroundColor: Colors.surface1,
            borderTopColor: Colors.borderSubtle,
          },
        ]}
        accessibilityRole="tablist"
        accessibilityLabel={copy.nav}
      >
        <View style={styles.bar}>
          {visibleRoutes.slice(0, 2).map(buildTab)}

          <View style={styles.fabSlot}>
            <Pressable
              onPress={() => {
                void triggerImpactHaptic('medium');
                openQuickLog();
              }}
              style={styles.fab}
              accessibilityRole="button"
              accessibilityLabel={copy.quickLog.label}
              accessibilityHint={copy.quickLog.hint}
            >
              <Ionicons name="add" size={26} color={Colors.black} />
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
            accessibilityState={{ selected: profileFocused }}
            accessibilityLabel={copy.tabs.profile.label}
            accessibilityHint={copy.tabs.profile.hint}
          >
            <Ionicons
              name={profileFocused ? 'person-circle' : 'person-circle-outline'}
              size={22}
              color={profileFocused ? Colors.textPrimary : Colors.textMuted}
            />
            <Text
              style={[styles.label, profileFocused ? styles.labelActive : styles.labelInactive]}
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.82}
              maxFontSizeMultiplier={1.2}
            >
              {copy.tabs.profile.label}
            </Text>
            <View style={[styles.activeDot, profileFocused ? styles.activeDotVisible : null]} />
          </Pressable>
        </View>
      </View>
      <QuickLogSheet />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing[3],
    paddingTop: Spacing[1.5],
    borderTopWidth: 1,
  },
  bar: {
    minHeight: 64,
    borderRadius: Radius.xl,
    backgroundColor: Colors.surface1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing[1.5],
    gap: Spacing[1],
  },
  tabItem: {
    flex: 1,
    minWidth: 0,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    paddingTop: 2,
  },
  label: {
    fontSize: 11,
    lineHeight: 14,
    textAlign: 'center',
  },
  labelActive: {
    color: Colors.textPrimary,
    fontFamily: FontFamily.semibold,
  },
  labelInactive: {
    color: Colors.textMuted,
    fontFamily: FontFamily.medium,
  },
  activeDot: {
    width: 4,
    height: 4,
    borderRadius: Radius.full,
    backgroundColor: Colors.textPrimary,
    opacity: 0,
    marginTop: 1,
  },
  activeDotVisible: {
    opacity: 1,
  },
  fabSlot: {
    width: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fab: {
    width: 52,
    height: 52,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    shadowColor: Colors.white,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  },
});
