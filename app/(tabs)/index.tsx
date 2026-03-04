import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { router } from 'expo-router';
import SafeScreen from '@/components/ui/SafeScreen';
import { DailyScore } from '@/components/home/DailyScore';
import { ModuleGrid } from '@/components/home/ModuleGrid';
import { StreakBanner } from '@/components/home/StreakBanner';
import { MorningCheckIn } from '@/components/home/MorningCheckIn';
import { AIInsight } from '@/components/home/AIInsight';
import CoinBadge from '@/components/ui/CoinBadge';
import { Colors } from '@/constants/colors';
import { FontFamily, Spacing, Radius } from '@/constants/theme';
import { useReadiness } from '@/hooks/useReadiness';
import { useAuthStore } from '@/stores/authStore';
import { useDashboard } from '@/hooks/useDashboard';

export default function HomeScreen() {
  const { profile } = useAuthStore();
  const { dailyScore, loading, refreshing, refresh, scoreColor, scoreLabel } = useReadiness();
  const { todayData, mentalDoneToday } = useDashboard();

  const streak = profile?.current_streak ?? 0;
  const coins = profile?.coins ?? 0;
  const showMorningCheckin = !mentalDoneToday;

  const handleDismissCheckin = () => {
    // Dismiss will be handled by the component's onComplete
  };

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return '☀️ Buenos días';
    if (hour < 19) return '👋 Buenas tardes';
    return '🌙 Buenas noches';
  };

  const name = profile?.name?.split(' ')[0] ?? 'ahí';

  return (
    <SafeScreen padHorizontal={false} padBottom={false}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refresh}
            tintColor={Colors.brand}
            colors={[Colors.brand]}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.greeting}>{greeting()}, {name}</Text>
            <Text style={styles.date}>
              {new Date().toLocaleDateString('es-AR', {
                weekday: 'long', day: 'numeric', month: 'long',
              })}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.coinsBtn}
            onPress={() => router.push('/store/shop' as any)}
          >
            <CoinBadge amount={coins} />
          </TouchableOpacity>
        </View>

        {/* Check-in matutino modal */}
        {showMorningCheckin && (
          <MorningCheckIn onComplete={refresh} />
        )}

        {/* Racha */}
        {profile && profile.current_streak > 0 && (
          <StreakBanner profile={profile} />
        )}

        {/* Daily Score — REAL */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Tu readiness de hoy</Text>
            <TouchableOpacity onPress={() => router.push('/progress' as any)}>
              <Text style={styles.seeAll}>Historial →</Text>
            </TouchableOpacity>
          </View>
          <DailyScore
            data={dailyScore}
            loading={loading}
            onPress={() => router.push('/progress' as any)}
          />
        </View>

        {/* AI Insight */}
        {profile && (
          <AIInsight insight={null} />
        )}

        {/* Módulos */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tus módulos</Text>
          <ModuleGrid />
        </View>

        {/* Espacio inferior para la tab bar */}
        <View style={styles.bottomPad} />
      </ScrollView>
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingHorizontal: Spacing[5],
    paddingTop: Spacing[6],
    gap: Spacing[5],
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerLeft: {
    flex: 1,
    gap: 4,
  },
  greeting: {
    fontFamily: FontFamily.bold,
    fontSize: 24,
    color: Colors.textPrimary,
  },
  date: {
    fontFamily: FontFamily.regular,
    fontSize: 14,
    color: Colors.textSecondary,
    textTransform: 'capitalize',
  },
  coinsBtn: {
    marginTop: 4,
  },
  section: {
    gap: Spacing[3],
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontFamily: FontFamily.bold,
    fontSize: 18,
    color: Colors.textPrimary,
  },
  seeAll: {
    fontFamily: FontFamily.medium,
    fontSize: 14,
    color: Colors.brand,
  },
  bottomPad: {
    height: 100, // espacio para tab bar
  },
});