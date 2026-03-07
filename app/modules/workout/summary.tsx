import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withDelay,
  withSpring,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import LottieView from 'lottie-react-native';
import * as Haptics from 'expo-haptics';
import { useLocalSearchParams, router } from 'expo-router';
import SafeScreen from '@/components/ui/SafeScreen';
import { RewardedAdButton } from '@/components/ui/RewardedAdButton';
import { Colors } from '@/constants/colors';
import { Spacing, Radius, FontFamily } from '@/constants/theme';

export default function WorkoutSummaryScreen() {
  const params = useLocalSearchParams<{
    duration: string;
    volume: string;
    sets: string;
    prs: string;
    name: string;
  }>();

  const duration = parseInt(params.duration ?? '0');
  const volume = parseInt(params.volume ?? '0');
  const sets = parseInt(params.sets ?? '0');
  const prs = parseInt(params.prs ?? '0');
  const name = params.name ?? 'Entreno';

  // Animaciones de entrada
  const titleScale = useSharedValue(0);
  const statsOpacity = useSharedValue(0);
  const badgeScale = useSharedValue(0);

  const titleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: titleScale.value }],
  }));
  const statsStyle = useAnimatedStyle(() => ({
    opacity: statsOpacity.value,
    transform: [{ translateY: (1 - statsOpacity.value) * 20 }],
  }));
  const badgeStyle = useAnimatedStyle(() => ({
    transform: [{ scale: badgeScale.value }],
  }));

  useEffect(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    titleScale.value = withSpring(1, { damping: 8, stiffness: 100 });
    statsOpacity.value = withDelay(300, withTiming(1, { duration: 600 }));

    if (prs > 0) {
      badgeScale.value = withDelay(
        600,
        withSpring(1.0, { damping: 6, stiffness: 90 }),
      );
    }
  }, []);

  return (
    <SafeScreen padHorizontal={false} padBottom>
      {/* Confetti fullscreen */}
      <LottieView
        source={require('@/assets/lottie/confetti.json')}
        autoPlay
        loop={false}
        style={StyleSheet.absoluteFill}
        resizeMode="cover"
      />

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Emoji + título */}
        <Animated.View style={[styles.titleSection, titleStyle]}>
          <Text style={styles.emoji}>🎉</Text>
          <Text style={styles.title}>¡Entreno completado!</Text>
          <Text style={styles.sessionName}>{name}</Text>
        </Animated.View>

        {/* PR badge */}
        {prs > 0 && (
          <Animated.View style={[styles.prBanner, badgeStyle]}>
            <Text style={styles.prBannerText}>
              🏆 {prs} nuevo{prs > 1 ? 's' : ''} récord{prs > 1 ? 's' : ''} personal{prs > 1 ? 'es' : ''}
            </Text>
          </Animated.View>
        )}

        {/* Stats */}
        <Animated.View style={[styles.statsGrid, statsStyle]}>
          <StatCard icon="⏱" label="Duración" value={`${duration} min`} />
          <StatCard
            icon="🏋️"
            label="Volumen total"
            value={`${volume.toLocaleString()} kg`}
          />
          <StatCard icon="✅" label="Sets completados" value={`${sets}`} />
          <StatCard
            icon="🏆"
            label="Récords"
            value={prs > 0 ? `${prs} PR` : '—'}
            highlight={prs > 0}
          />
        </Animated.View>

        {/* Monedas ganadas */}
        <View style={styles.coinsCard}>
          <Text style={styles.coinsText}>+25 🪙 por completar el entreno</Text>
          {prs > 0 && (
            <Text style={styles.coinsText}>+{prs * 50} 🪙 por récords personales</Text>
          )}
        </View>

        <RewardedAdButton
          context="post_workout_2x_xp"
          label="Ver anuncio para x2 XP"
          coins={0}
          onReward={() => {}}
        />

        {/* Botones */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.homeBtn}
            onPress={() => router.replace('/(tabs)' as any)}
          >
            <Text style={styles.homeBtnText}>Volver al inicio</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.historyBtn}
            onPress={() => router.replace('/modules/workout/history' as any)}
          >
            <Text style={styles.historyBtnText}>Ver historial</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeScreen>
  );
}

function StatCard({
  icon,
  label,
  value,
  highlight = false,
}: {
  icon: string;
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <View style={[styles.statCard, highlight && styles.statCardHighlight]}>
      <Text style={styles.statIcon}>{icon}</Text>
      <Text style={[styles.statValue, highlight && styles.statValueHighlight]}>
        {value}
      </Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingHorizontal: Spacing[5],
    paddingBottom: Spacing[12],
    paddingTop: Spacing[10],
    gap: Spacing[6],
    alignItems: 'center',
  },
  titleSection: {
    alignItems: 'center',
    gap: Spacing[2],
  },
  emoji: { fontSize: 64 },
  title: {
    fontFamily: FontFamily.bold,
    fontSize: 30,
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  sessionName: {
    fontFamily: FontFamily.medium,
    fontSize: 18,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  prBanner: {
    backgroundColor: `${Colors.coins}22`,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing[6],
    paddingVertical: Spacing[3],
    borderWidth: 2,
    borderColor: Colors.coins,
  },
  prBannerText: {
    fontFamily: FontFamily.bold,
    fontSize: 18,
    color: Colors.coins,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing[3],
    width: '100%',
  },
  statCard: {
    flex: 1,
    minWidth: '44%',
    backgroundColor: Colors.bgSurface,
    borderRadius: Radius.xl,
    padding: Spacing[4],
    alignItems: 'center',
    gap: Spacing[1],
  },
  statCardHighlight: {
    backgroundColor: `${Colors.coins}15`,
    borderWidth: 1,
    borderColor: Colors.coins,
  },
  statIcon: { fontSize: 28 },
  statValue: {
    fontFamily: FontFamily.bold,
    fontSize: 22,
    color: Colors.workout,
  },
  statValueHighlight: {
    color: Colors.coins,
  },
  statLabel: {
    fontFamily: FontFamily.regular,
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  coinsCard: {
    backgroundColor: `${Colors.coins}15`,
    borderRadius: Radius.xl,
    padding: Spacing[4],
    width: '100%',
    gap: Spacing[1],
    borderWidth: 1,
    borderColor: `${Colors.coins}40`,
  },
  coinsText: {
    fontFamily: FontFamily.bold,
    fontSize: 16,
    color: Colors.coins,
    textAlign: 'center',
  },
  actions: {
    width: '100%',
    gap: Spacing[3],
  },
  homeBtn: {
    backgroundColor: Colors.workout,
    borderRadius: Radius.xl,
    paddingVertical: Spacing[4],
    alignItems: 'center',
  },
  homeBtnText: {
    fontFamily: FontFamily.bold,
    fontSize: 17,
    color: '#fff',
  },
  historyBtn: {
    backgroundColor: Colors.bgSurface,
    borderRadius: Radius.xl,
    paddingVertical: Spacing[4],
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  historyBtnText: {
    fontFamily: FontFamily.bold,
    fontSize: 17,
    color: Colors.textSecondary,
  },
});
