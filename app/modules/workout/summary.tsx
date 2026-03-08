import React, { useEffect, useMemo, useState, useCallback } from 'react';
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
} from 'react-native-reanimated';
import LottieView from 'lottie-react-native';
import * as Haptics from 'expo-haptics';
import { useLocalSearchParams, router } from 'expo-router';
import SafeScreen from '@/components/ui/SafeScreen';
import { RewardedAdButton } from '@/components/ui/RewardedAdButton';
import { Colors } from '@/constants/colors';
import { Spacing, Radius, FontFamily } from '@/constants/theme';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';
import { useUIStore } from '@/stores/uiStore';
import { captureError } from '@/lib/sentry';

const BASE_WORKOUT_XP = 50;
const PR_XP_BONUS = 100;

export default function WorkoutSummaryScreen() {
  const params = useLocalSearchParams<{
    sessionId?: string;
    duration?: string;
    volume?: string;
    sets?: string;
    prs?: string;
    name?: string;
  }>();

  const userId = useAuthStore((state) => state.profile?.id ?? null);
  const updateProfile = useAuthStore((state) => state.updateProfile);
  const showToast = useUIStore((state) => state.showToast);

  const sessionId = typeof params.sessionId === 'string' ? params.sessionId : null;
  const duration = parseInt(params.duration ?? '0', 10) || 0;
  const volume = parseInt(params.volume ?? '0', 10) || 0;
  const sets = parseInt(params.sets ?? '0', 10) || 0;
  const prs = parseInt(params.prs ?? '0', 10) || 0;
  const name = params.name ?? 'Entreno';

  const rewardXp = useMemo(() => BASE_WORKOUT_XP + (prs * PR_XP_BONUS), [prs]);
  const rewardContext = sessionId ? `post_workout_2x_xp:${sessionId}` : null;

  const [claimingXp, setClaimingXp] = useState(false);
  const [xpBoostClaimed, setXpBoostClaimed] = useState(false);

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
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => undefined);
    titleScale.value = withSpring(1, { damping: 8, stiffness: 100 });
    statsOpacity.value = withDelay(300, withTiming(1, { duration: 600 }));

    if (prs > 0) {
      badgeScale.value = withDelay(600, withSpring(1, { damping: 6, stiffness: 90 }));
    }
  }, [badgeScale, prs, statsOpacity, titleScale]);

  useEffect(() => {
    if (!userId || !rewardContext) return;

    let mounted = true;

    void supabase
      .from('ad_interactions')
      .select('id')
      .eq('user_id', userId)
      .eq('ad_type', 'rewarded')
      .eq('context', rewardContext)
      .maybeSingle()
      .then(({ data, error }) => {
        if (!mounted) return;
        if (error) {
          captureError(new Error(error.message), {
            action: 'WorkoutSummaryScreen.checkXpBoost',
            rewardContext,
          });
          return;
        }
        setXpBoostClaimed(Boolean(data?.id));
      });

    return () => {
      mounted = false;
    };
  }, [rewardContext, userId]);

  const handleXpBoostReward = useCallback(async () => {
    if (!userId || !sessionId || rewardXp <= 0 || claimingXp) return;

    setClaimingXp(true);
    try {
      const { data, error } = await supabase.rpc('claim_rewarded_workout_bonus', {
        p_user_id: userId,
        p_session_id: sessionId,
        p_bonus_xp: rewardXp,
      });

      if (error) {
        throw error;
      }

      const payload = Array.isArray(data) ? data[0] : data;
      if (!payload || payload.success !== true) {
        if (payload?.already_claimed) {
          setXpBoostClaimed(true);
          showToast('El bonus de XP de este entreno ya fue reclamado.', 'info');
          return;
        }
        throw new Error(payload?.error ?? 'No se pudo aplicar el bonus de XP.');
      }

      setXpBoostClaimed(true);
      const nextProfilePatch: { xp?: number; level?: number } = {};
      if (typeof payload.new_xp === 'number') {
        nextProfilePatch.xp = payload.new_xp;
      }
      if (typeof payload.new_level === 'number') {
        nextProfilePatch.level = payload.new_level;
      }
      updateProfile(nextProfilePatch);
      showToast(`XP duplicado: +${rewardXp} XP`, 'success');
    } catch (error) {
      captureError(error instanceof Error ? error : new Error(String(error)), {
        action: 'WorkoutSummaryScreen.handleXpBoostReward',
        sessionId,
      });
      showToast('No pudimos aplicar el bonus de XP.', 'error');
    } finally {
      setClaimingXp(false);
    }
  }, [claimingXp, rewardXp, sessionId, showToast, updateProfile, userId]);

  return (
    <SafeScreen padHorizontal={false} padBottom>
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
        <Animated.View style={[styles.titleSection, titleStyle]}>
          <Text style={styles.emoji}>DONE</Text>
          <Text style={styles.title}>Entreno completado</Text>
          <Text style={styles.sessionName}>{name}</Text>
        </Animated.View>

        {prs > 0 && (
          <Animated.View style={[styles.prBanner, badgeStyle]}>
            <Text style={styles.prBannerText}>
              {prs} nuevo{prs > 1 ? 's' : ''} record{prs > 1 ? 's' : ''} personal{prs > 1 ? 'es' : ''}
            </Text>
          </Animated.View>
        )}

        <Animated.View style={[styles.statsGrid, statsStyle]}>
          <StatCard icon="TIME" label="Duracion" value={`${duration} min`} />
          <StatCard icon="VOL" label="Volumen total" value={`${volume.toLocaleString()} kg`} />
          <StatCard icon="SETS" label="Sets completados" value={`${sets}`} />
          <StatCard
            icon="PR"
            label="Records"
            value={prs > 0 ? `${prs} PR` : '-'}
            highlight={prs > 0}
          />
        </Animated.View>

        <View style={styles.rewardsCard}>
          <Text style={styles.rewardLine}>+25 coins por completar el entreno</Text>
          <Text style={styles.rewardLine}>+{BASE_WORKOUT_XP} XP por completar el entreno</Text>
          {prs > 0 && (
            <>
              <Text style={styles.rewardLine}>+{prs * 50} coins por records personales</Text>
              <Text style={styles.rewardLine}>+{prs * PR_XP_BONUS} XP por records personales</Text>
            </>
          )}
        </View>

        {sessionId && rewardXp > 0 && !xpBoostClaimed ? (
          <RewardedAdButton
            context="post_workout_2x_xp"
            label={claimingXp ? 'Aplicando bonus...' : `Ver anuncio para duplicar XP (+${rewardXp} XP)`}
            coins={0}
            onReward={handleXpBoostReward}
          />
        ) : null}

        {xpBoostClaimed ? (
          <View style={styles.xpClaimedCard}>
            <Text style={styles.xpClaimedText}>Bonus de XP reclamado para este entreno.</Text>
          </View>
        ) : null}

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
  emoji: {
    fontSize: 16,
    letterSpacing: 2,
    color: Colors.textSecondary,
    fontFamily: FontFamily.bold,
  },
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
    textAlign: 'center',
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
  statIcon: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontFamily: FontFamily.bold,
  },
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
  rewardsCard: {
    backgroundColor: `${Colors.coins}15`,
    borderRadius: Radius.xl,
    padding: Spacing[4],
    width: '100%',
    gap: Spacing[1],
    borderWidth: 1,
    borderColor: `${Colors.coins}40`,
  },
  rewardLine: {
    fontFamily: FontFamily.bold,
    fontSize: 16,
    color: Colors.coins,
  },
  xpClaimedCard: {
    width: '100%',
    backgroundColor: `${Colors.success}15`,
    borderRadius: Radius.xl,
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[3],
    borderWidth: 1,
    borderColor: `${Colors.success}40`,
  },
  xpClaimedText: {
    fontFamily: FontFamily.medium,
    fontSize: 14,
    color: Colors.success,
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
    color: Colors.white,
    fontFamily: FontFamily.bold,
    fontSize: 16,
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
    color: Colors.textPrimary,
    fontFamily: FontFamily.bold,
    fontSize: 16,
  },
});
