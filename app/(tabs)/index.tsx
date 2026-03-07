import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import Svg, { Polyline } from 'react-native-svg';
import { router } from 'expo-router';
import SafeScreen from '@/components/ui/SafeScreen';
import { DailyScore } from '@/components/home/DailyScore';
import { ModuleGrid } from '@/components/home/ModuleGrid';
import { StreakBanner } from '@/components/home/StreakBanner';
import { MorningCheckIn } from '@/components/home/MorningCheckIn';
import { AIInsight } from '@/components/home/AIInsight';
import MissionCard from '@/components/home/MissionCard';
import CoinBadge from '@/components/ui/CoinBadge';
import { Colors } from '@/constants/colors';
import { FontFamily, Spacing, Radius } from '@/constants/theme';
import { useReadiness } from '@/hooks/useReadiness';
import { useAuthStore } from '@/stores/authStore';
import { useDashboard } from '@/hooks/useDashboard';

function MomentumSparkline({ values }: { values: number[] }) {
  if (values.length < 2) return null;
  const width = 220;
  const height = 72;
  const min = Math.min(...values, 0);
  const max = Math.max(...values, 100);
  const span = Math.max(1, max - min);

  const points = values
    .map((value, index) => {
      const x = (index / (values.length - 1)) * width;
      const y = height - ((value - min) / span) * height;
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <Svg width={width} height={height} style={{ alignSelf: 'center' }}>
      <Polyline
        points={points}
        fill="none"
        stroke={Colors.brand}
        strokeWidth={3}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </Svg>
  );
}

export default function HomeScreen() {
  const { profile } = useAuthStore();
  const {
    dailyScore,
    loading,
    refreshing,
    refresh,
    scoreReasons,
    predictedScore,
    momentum14,
    morningNarrative,
  } = useReadiness();
  const { mentalDoneToday } = useDashboard();

  const streak = profile?.streak ?? profile?.current_streak ?? 0;
  const coins = profile?.coins ?? 0;
  const showMorningCheckin = !mentalDoneToday;

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Buenos dias';
    if (hour < 19) return 'Buenas tardes';
    return 'Buenas noches';
  };

  const name = profile?.name?.split(' ')[0] ?? 'ahi';
  const momentumValues = momentum14.map((item) => item.total_score);

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
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.greeting}>
              {greeting()}, {name}
            </Text>
            <Text style={styles.date}>
              {new Date().toLocaleDateString('es-AR', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
              })}
            </Text>
          </View>
          <TouchableOpacity style={styles.coinsBtn} onPress={() => router.push('/store/shop' as any)}>
            <CoinBadge amount={coins} />
          </TouchableOpacity>
        </View>

        {showMorningCheckin ? <MorningCheckIn onComplete={refresh} /> : null}

        {profile && streak > 0 ? <StreakBanner profile={profile} /> : null}
        {profile && !profile.first_week_completed ? <MissionCard /> : null}

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Tu readiness de hoy</Text>
            <TouchableOpacity onPress={() => router.push('/progress' as any)}>
              <Text style={styles.seeAll}>Historial →</Text>
            </TouchableOpacity>
          </View>
          <DailyScore data={dailyScore} loading={loading} onPress={() => router.push('/progress' as any)} />

          <View style={styles.insightCard}>
            <Text style={styles.insightTitle}>Por que este score</Text>
            {scoreReasons.map((reason, index) => (
              <Text
                key={`${reason.text}_${index}`}
                style={[styles.reason, reason.type === 'positive' ? styles.reasonPositive : styles.reasonNegative]}
              >
                • {reason.text}
              </Text>
            ))}
            {predictedScore !== null ? (
              <Text style={styles.prediction}>
                Si completas tus pendientes de hoy, tu score final estimado es ~{predictedScore}.
              </Text>
            ) : null}
          </View>

          <View style={styles.momentumCard}>
            <Text style={styles.insightTitle}>Momentum de 14 dias</Text>
            <MomentumSparkline values={momentumValues} />
          </View>
        </View>

        {morningNarrative ? <AIInsight insight={morningNarrative} /> : null}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tus modulos</Text>
          <ModuleGrid />
        </View>

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
  insightCard: {
    backgroundColor: Colors.bgSurface,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing[4],
    gap: Spacing[1.5],
  },
  momentumCard: {
    backgroundColor: Colors.bgSurface,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing[4],
    gap: Spacing[2],
  },
  insightTitle: {
    fontFamily: FontFamily.semibold,
    fontSize: 14,
    color: Colors.textPrimary,
  },
  reason: {
    fontFamily: FontFamily.medium,
    fontSize: 13,
  },
  reasonPositive: {
    color: Colors.success,
  },
  reasonNegative: {
    color: Colors.warning,
  },
  prediction: {
    marginTop: Spacing[1],
    fontFamily: FontFamily.medium,
    fontSize: 13,
    color: Colors.textSecondary,
  },
  bottomPad: {
    height: 100,
  },
});
