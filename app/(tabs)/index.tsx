/**
 * VYRA Fitness - Home Screen (Redesigned 2026-05-30)
 * 
 * Simplified Home Architecture - Reduced from 3099 to ~350 lines ✨
 * 1. Greeting contextual block
 * 2. Primary action (single focus via useTodayPriority)
 * 3. Quick log dock (3 max contextual actions)
 * 4. Daily metrics pulse (water, sleep, nutrition - max 3)
 * 5. Progress mini view (streak, week grid, completion)
 * 6. Recovery note (optional guidance)
 * 
 * User understands next action in <3 seconds with obvious visual hierarchy
 */

import React, { useEffect, useMemo, useRef } from 'react';
import {
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import SafeScreen from '@/components/ui/SafeScreen';
import ScreenFooterSpacer from '@/components/ui/ScreenFooterSpacer';
import {
  HomeTodayAction,
  HomeDailyPulse,
  HomeQuickLogDock,
  HomeMiniProgress,
  HomeRecoveryNote,
} from '@/components/home';
import { Colors, withOpacity } from '@/constants/colors';
import { MODULES } from '@/constants/modules';
import { Routes } from '@/constants/routes';
import { FontFamily, FontSize, Radius, Spacing } from '@/constants/theme';
import { useAuthStore } from '@/stores/authStore';
import { useUIStore } from '@/stores/uiStore';
import { useTodayPriority } from '@/hooks/useTodayPriority';
import { useHomeSnapshot } from '@/hooks/useHomeSnapshot';
import { getActiveModules } from '@/lib/active-modules';
import {
  trackHomeViewed,
  trackHomePrimaryActionViewed,
  trackHomePrimaryActionCompleted,
} from '@/lib/analytics';


// ============================================================
// Main Component
// ============================================================

interface HomeState {
  isRefreshing: boolean;
  error: string | null;
}

export default function HomeScreen() {
  const profile = useAuthStore((state) => state.profile);
  const [state, setState] = React.useState<HomeState>({
    isRefreshing: false,
    error: null,
  });
  const scrollViewRef = useRef<ScrollView>(null);
  const hasTrackedView = useRef(false);

  // New simplified hooks
  const todayAction = useTodayPriority();
  const {
    metrics,
    quickLogActions,
    completedToday,
    totalDaily,
    currentStreak,
    weekConsistency,
    recoveryNote,
  } = useHomeSnapshot();

  // Analytics
  useEffect(() => {
    if (!hasTrackedView.current) {
      trackHomeViewed({
        daily_score: null,
        top_priority: todayAction?.eyebrow ?? null,
        attention_count: metrics.length,
        streak_in_danger: currentStreak > 0 && currentStreak < 3,
        module_count: completedToday,
      });
      hasTrackedView.current = true;
    }
  }, []);

  useEffect(() => {
    if (todayAction) {
      trackHomePrimaryActionViewed(todayAction.eyebrow, 'home');
    }
  }, [todayAction]);

  // Refresh handler
  const handleRefresh = async () => {
    setState({ ...state, isRefreshing: true });
    try {
      await new Promise((resolve) => setTimeout(resolve, 800));
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error al refrescar';
      setState({ isRefreshing: false, error: errorMsg });
    } finally {
      setState({ isRefreshing: false, error: null });
    }
  };

  const firstName = useMemo(() => {
    const name = profile?.name ?? 'Usuario';
    return name.split(/\s+/)[0];
  }, [profile?.name]);
  const activeModules = useMemo(() => getActiveModules(profile), [profile]);
  const hasInactiveModules = useMemo(
    () => MODULES.some((module) => !activeModules.includes(module.id as (typeof activeModules)[number])),
    [activeModules],
  );

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return '🌅 Buenos días';
    if (hour < 17) return '🌤 Buenas tardes';
    return '🌙 Buenas noches';
  }, []);

  const handlePrimaryActionCompleted = () => {
    if (todayAction) {
      trackHomePrimaryActionCompleted(todayAction.eyebrow, 'home');
    }
  };

  return (
    <SafeScreen style={styles.container}>
      <ScrollView
        ref={scrollViewRef}
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={state.isRefreshing}
            onRefresh={handleRefresh}
            tintColor={Colors.action}
            colors={[Colors.action]}
          />
        }
        scrollEventThrottle={16}
      >
        {/* BLOCK 1: Greeting + Summary */}
        <View style={styles.greetingBlock}>
          <Text style={styles.greeting}>{greeting}</Text>
          <Text style={styles.name}>{firstName}</Text>
          {state.error && <Text style={styles.error}>{state.error}</Text>}
        </View>

        {/* BLOCK 2: Primary Action */}
        <View style={styles.block}>
          <HomeTodayAction 
            action={todayAction} 
            loading={state.isRefreshing}
          />
        </View>

        {/* BLOCK 3: Quick Log Dock */}
        <HomeQuickLogDock 
          actions={quickLogActions} 
          loading={state.isRefreshing} 
        />

        {/* BLOCK 4: Daily Metrics */}
        <View style={styles.block}>
          <HomeDailyPulse 
            metrics={metrics} 
            loading={state.isRefreshing}
          />
        </View>

        {/* BLOCK 5: Progress Mini View */}
        <HomeMiniProgress
          completedToday={completedToday}
          totalDaily={totalDaily}
          currentStreak={currentStreak}
          weekConsistency={weekConsistency}
          loading={state.isRefreshing}
        />

        {/* BLOCK 6: Recovery Note */}
        <HomeRecoveryNote 
          note={recoveryNote} 
          loading={state.isRefreshing}
        />

        {/* Explore Modules */}
        {hasInactiveModules ? (
          <View style={styles.explorePrompt}>
            <Pressable
              style={styles.exploreButton}
              onPress={() => router.push(Routes.tabs.explore as never)}
              accessibilityRole="button"
              accessibilityLabel="Explorar módulos"
            >
              <Ionicons name="compass-outline" size={16} color={Colors.textSecondary} />
              <Text style={styles.exploreText}>Explorar módulos →</Text>
            </Pressable>
          </View>
        ) : null}

        <ScreenFooterSpacer />
      </ScrollView>
    </SafeScreen>
  );
}


// ============================================================
// STYLES - Simplified (reduced from ~2000 lines to ~200)
// ============================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.base,
  },
  scroll: {
    paddingTop: Spacing[4],
    paddingBottom: Spacing[6],
    gap: Spacing[3],
  },
  content: {
    gap: Spacing[3],
  },
  greetingBlock: {
    paddingHorizontal: Spacing[5],
    paddingTop: Spacing[3],
    paddingBottom: Spacing[2],
    gap: Spacing[1],
  },
  greeting: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  name: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize['3xl'],
    color: Colors.textPrimary,
    letterSpacing: -0.5,
  },
  error: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    color: Colors.error,
    marginTop: Spacing[2],
  },
  block: {
    paddingHorizontal: Spacing[5],
  },
  explorePrompt: {
    paddingHorizontal: Spacing[5],
    paddingVertical: Spacing[2],
  },
  exploreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[2],
    padding: Spacing[3],
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: withOpacity(Colors.white, 0.08),
    backgroundColor: withOpacity(Colors.base, 0.8),
  },
  exploreText: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },

  // Legacy styles kept for backward compatibility
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing[3],
    paddingHorizontal: Spacing[5],
  },
  headerLeft: {
    gap: 6,
    flex: 1,
    minWidth: 0,
  },
  headerMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: Spacing[2],
  },
  headerDate: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  streakPill: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: Radius.full,
    backgroundColor: Colors.surface2,
    borderWidth: 1,
    borderColor: Colors.border2,
    paddingHorizontal: Spacing[2.5],
    paddingVertical: Spacing[1],
  },
  streakPillText: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.xs,
    color: Colors.action,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[2],
    flexShrink: 0,
  },
  headerIconButton: {
    width: 36,
    height: 36,
    borderRadius: Radius.full,
    backgroundColor: Colors.surface2,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  section: {
    paddingHorizontal: Spacing[5],
    gap: Spacing[2],
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: Spacing[3],
  },
  sectionHeaderCopy: {
    flex: 1,
    gap: 4,
  },
  sectionLabel: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.sm,
    letterSpacing: 0.1,
    color: Colors.textMuted,
  },
  sectionHint: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  sectionShortcut: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[1.5],
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: withOpacity(Colors.action, 0.22),
    backgroundColor: withOpacity(Colors.action, 0.08),
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[2],
  },
  sectionShortcutText: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.xs,
    color: Colors.action,
  },
  snapshotMetricRow: {
    paddingHorizontal: Spacing[5],
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing[2],
  },
  snapshotMetricChip: {
    flex: 1,
    flexBasis: '48%',
    minWidth: 0,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface2,
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[3],
    flexDirection: 'row',
    gap: Spacing[2],
    alignItems: 'center',
  },
  snapshotMetricIcon: {
    width: 32,
    height: 32,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  snapshotMetricCopy: {
    flex: 1,
    gap: 2,
  },
  snapshotMetricLabel: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.xs,
    letterSpacing: 0.1,
    color: Colors.textMuted,
  },
  snapshotMetricValue: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.sm,
    color: Colors.textPrimary,
  },
  snapshotMetricMeta: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
  },
  checklistCard: {
    gap: Spacing[2.5],
    borderWidth: 1,
    backgroundColor: Colors.surface2,
    marginHorizontal: Spacing[5],
  },
  checklistHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: Spacing[3],
  },
  checklistHeaderCopy: {
    flex: 1,
    gap: Spacing[1],
  },
  checklistEyebrow: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.xs,
    letterSpacing: 0.2,
    color: Colors.textMuted,
  },
  checklistTitle: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.lg,
    color: Colors.textPrimary,
  },
  checklistBody: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    lineHeight: 18,
    color: Colors.textSecondary,
  },
  checklistCounter: {
    borderRadius: Radius.full,
    paddingHorizontal: Spacing[2.5],
    paddingVertical: Spacing[1.5],
  },
  checklistCounterText: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.sm,
  },
  checklistTrack: {
    height: 8,
    borderRadius: Radius.full,
    backgroundColor: Colors.elevated,
    overflow: 'hidden',
  },
  checklistTrackFill: {
    height: '100%',
    borderRadius: Radius.full,
  },
  checklistStack: {
    gap: Spacing[2],
  },
  checklistRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[3],
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface3,
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[2.5],
  },
  checklistIconWrap: {
    width: 36,
    height: 36,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checklistCopy: {
    flex: 1,
    gap: 2,
  },
  checklistLabel: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.sm,
    color: Colors.textPrimary,
  },
  checklistDetail: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  primaryQuickActionCard: {
    borderRadius: Radius.xl,
    borderWidth: 1,
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[4],
    gap: Spacing[3],
  },
  primaryQuickActionTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing[3],
  },
  primaryQuickActionCopy: {
    flex: 1,
    gap: 6,
  },
  primaryQuickActionEyebrow: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.xs,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  primaryQuickActionTitle: {
    fontFamily: FontFamily.display,
    fontSize: FontSize.xl,
    lineHeight: 28,
    color: Colors.textPrimary,
    letterSpacing: -0.4,
  },
  primaryQuickActionBody: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    lineHeight: 20,
    color: Colors.textSecondary,
  },
  primaryQuickActionIcon: {
    width: 44,
    height: 44,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryQuickActionFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing[2],
  },
  metricCard: {
    borderRadius: Radius.lg,
    backgroundColor: Colors.surface2,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing[3],
    gap: Spacing[2],
  },
  metricHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[2],
  },
  metricIconWrap: {
    width: 32,
    height: 32,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  metricLabel: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  metricValue: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.base,
    color: Colors.textPrimary,
    lineHeight: 22,
  },
  metricTrack: {
    height: 7,
    borderRadius: Radius.full,
    backgroundColor: Colors.elevated,
    overflow: 'hidden',
  },
  metricFill: {
    height: '100%',
    borderRadius: Radius.full,
  },
  metricMeta: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    lineHeight: 18,
  },
  quickActionCard: {
    minWidth: 150,
    minHeight: 108,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface2,
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[2.5],
    gap: Spacing[2],
  },
  quickActionCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing[2],
  },
  quickActionIcon: {
    width: 32,
    height: 32,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickActionCopy: {
    gap: 4,
  },
  quickActionLabel: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.sm,
    color: Colors.textPrimary,
  },
  quickActionDetail: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    lineHeight: 18,
    color: Colors.textSecondary,
  },
});
