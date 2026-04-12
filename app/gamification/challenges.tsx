import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import SafeScreen from '@/components/ui/SafeScreen';
import { Header } from '@/components/layout/Header';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import ProgressBar from '@/components/ui/ProgressBar';
import { Colors, withOpacity } from '@/constants/colors';
import { Routes } from '@/constants/routes';
import { FontFamily, FontSize, Radius, Spacing } from '@/constants/theme';
import { useGamification, type DailyChallenge, type WeeklyChallenge } from '@/hooks/useGamification';

function MissionRow({
  title,
  subtitle,
  progressLabel,
  accent,
  rewardCoins,
  completed,
  claimed,
  loading,
  onPress,
}: {
  title: string;
  subtitle: string;
  progressLabel: string;
  accent: string;
  rewardCoins: number;
  completed: boolean;
  claimed: boolean;
  loading?: boolean;
  onPress: () => void;
}) {
  const readyToClaim = completed && !claimed;

  return (
    <View style={styles.missionRow}>
      <View style={[styles.missionDot, { backgroundColor: withOpacity(accent, 0.2), borderColor: withOpacity(accent, 0.3) }]}>
        <View style={[styles.missionDotInner, { backgroundColor: accent }]} />
      </View>

      <View style={styles.missionCopy}>
        <Text style={styles.missionTitle}>{title}</Text>
        <Text style={styles.missionMeta}>{progressLabel}</Text>
        <Text style={styles.missionSubtitle} numberOfLines={1}>{subtitle}</Text>
      </View>

      <View style={styles.missionRewardBlock}>
        <Text style={styles.missionReward}>+{rewardCoins}</Text>
        {claimed ? (
          <View style={styles.missionClaimed}>
            <Ionicons name="checkmark" size={14} color={Colors.success} />
          </View>
        ) : readyToClaim ? (
          <Pressable style={styles.missionClaimButton} onPress={onPress} disabled={loading}>
            <Text style={styles.missionClaimButtonText}>{loading ? '...' : 'Cobrar'}</Text>
          </Pressable>
        ) : (
          <View style={styles.missionPending}>
            <Ionicons name="ellipse-outline" size={18} color={Colors.textMuted} />
          </View>
        )}
      </View>
    </View>
  );
}

function MissionProgress({
  challenge,
}: {
  challenge: Pick<DailyChallenge | WeeklyChallenge, 'progress' | 'target'>;
}) {
  const pct = Math.max(0, Math.min(100, (challenge.progress / Math.max(1, challenge.target)) * 100));
  return <ProgressBar value={pct} color={Colors.brand} height={6} animated={false} trackColor={withOpacity(Colors.brand, 0.14)} />;
}

export default function GamificationChallengesScreen() {
  const {
    balance,
    coinsEarnedToday,
    currentTier,
    dailyMissions,
    weeklyChallenges,
    monthlyChallenge,
    claimDailyMission,
    claimChallenge,
    claimMonthlyChallenge,
    claimableCount,
  } = useGamification();
  const [claimingId, setClaimingId] = useState<string | null>(null);

  const handleClaim = async (id: string, kind: 'daily' | 'weekly' | 'event') => {
    setClaimingId(id);
    try {
      if (kind === 'daily') await claimDailyMission(id);
      if (kind === 'weekly') await claimChallenge(id);
      if (kind === 'event') await claimMonthlyChallenge();
    } finally {
      setClaimingId(null);
    }
  };

  return (
    <SafeScreen padHorizontal={false} padBottom>
      <Header title="Tus desafíos" subtitle="Completá hábitos y ganá coins" showBack color={Colors.coins} />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Card style={styles.heroCard} accentColor={Colors.coins} decorative={false}>
          <View style={styles.heroTop}>
            <View style={styles.heroCoinIcon}>
              <Ionicons name="logo-bitcoin" size={18} color={Colors.coins} />
            </View>
            <View style={styles.heroCopy}>
              <Text style={styles.heroValue}>{balance}</Text>
              <Text style={styles.heroLabel}>VYRA Coins</Text>
            </View>
            <View style={styles.heroDeltaPill}>
              <Text style={styles.heroDeltaText}>+{coinsEarnedToday} hoy</Text>
            </View>
          </View>

          <View style={styles.heroFooter}>
            <Text style={[styles.heroTier, { color: currentTier.accent }]}>{currentTier.name}</Text>
            <Text style={styles.heroTierHint}>{claimableCount > 0 ? `${claimableCount} recompensa${claimableCount === 1 ? '' : 's'} lista${claimableCount === 1 ? '' : 's'}` : currentTier.perk}</Text>
          </View>
        </Card>

        <Card decorative={false}>
          <Text style={styles.sectionEyebrow}>Misiones de hoy</Text>
          <View style={styles.sectionStack}>
            {dailyMissions.map((mission) => (
              <View key={mission.id} style={styles.progressStack}>
                <MissionRow
                  title={mission.title}
                  subtitle={mission.description}
                  progressLabel={`${Math.min(mission.progress, mission.target)} de ${mission.target} ${mission.unit}`}
                  accent={mission.accent}
                  rewardCoins={mission.rewardCoins}
                  completed={mission.completed}
                  claimed={mission.claimed}
                  loading={claimingId === mission.id}
                  onPress={() => void handleClaim(mission.id, 'daily')}
                />
                <MissionProgress challenge={mission} />
              </View>
            ))}
          </View>
        </Card>

        <Card decorative={false}>
          <Text style={styles.sectionEyebrow}>Esta semana</Text>
          <View style={styles.sectionStack}>
            {weeklyChallenges.map((mission) => (
              <View key={mission.id} style={styles.progressStack}>
                <MissionRow
                  title={mission.title}
                  subtitle={mission.description}
                  progressLabel={`${mission.progress} de ${mission.target} ${mission.unit}`}
                  accent={mission.accent}
                  rewardCoins={mission.rewardCoins}
                  completed={mission.completed}
                  claimed={mission.claimed}
                  loading={claimingId === mission.id}
                  onPress={() => void handleClaim(mission.id, 'weekly')}
                />
                <MissionProgress challenge={mission} />
              </View>
            ))}
          </View>
        </Card>

        <Card accentColor={monthlyChallenge.accent} decorative={false}>
          <Text style={[styles.sectionEyebrow, { color: monthlyChallenge.accent }]}>Evento temporal</Text>
          <Text style={styles.eventTitle}>{monthlyChallenge.title}</Text>
          <Text style={styles.eventBody}>{monthlyChallenge.description}</Text>
          <View style={styles.progressStack}>
            <View style={styles.eventMetaRow}>
              <Text style={styles.eventMeta}>{monthlyChallenge.progress} / {monthlyChallenge.target} {monthlyChallenge.unit}</Text>
              <Text style={[styles.eventReward, { color: monthlyChallenge.accent }]}>+{monthlyChallenge.rewardCoins}</Text>
            </View>
            <ProgressBar
              value={(monthlyChallenge.progress / Math.max(1, monthlyChallenge.target)) * 100}
              color={monthlyChallenge.accent}
              height={8}
              animated={false}
              trackColor={withOpacity(monthlyChallenge.accent, 0.14)}
            />
          </View>
          {monthlyChallenge.completed && !monthlyChallenge.claimed ? (
            <Button
              onPress={() => void handleClaim(monthlyChallenge.id, 'event')}
              loading={claimingId === monthlyChallenge.id}
              color={monthlyChallenge.accent}
              fullWidth
            >
              Reclamar evento
            </Button>
          ) : null}
        </Card>

        <View style={styles.actionsRow}>
          <Button variant="secondary" color={Colors.brand} onPress={() => router.push(Routes.gamification.rank as any)}>
            Ver rango
          </Button>
          <Button variant="secondary" color={Colors.coins} onPress={() => router.push(Routes.store.shop as any)}>
            Ir a tienda
          </Button>
          <Button variant="secondary" color={Colors.premium} onPress={() => router.push(Routes.gamification.badges as any)}>
            Ver insignias
          </Button>
        </View>
      </ScrollView>
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingHorizontal: Spacing[5],
    paddingTop: Spacing[5],
    paddingBottom: Spacing[12],
    gap: Spacing[4],
  },
  heroCard: {
    gap: Spacing[3],
  },
  heroTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[3],
  },
  heroCoinIcon: {
    width: 42,
    height: 42,
    borderRadius: Radius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: withOpacity(Colors.coins, 0.12),
    borderWidth: 1,
    borderColor: withOpacity(Colors.coins, 0.24),
  },
  heroCopy: {
    flex: 1,
  },
  heroValue: {
    fontFamily: FontFamily.display,
    fontSize: 34,
    lineHeight: 36,
    color: Colors.textPrimary,
  },
  heroLabel: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.xs,
    color: Colors.textMuted,
  },
  heroDeltaPill: {
    borderRadius: Radius.full,
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[1.5],
    backgroundColor: withOpacity(Colors.success, 0.12),
    borderWidth: 1,
    borderColor: withOpacity(Colors.success, 0.2),
  },
  heroDeltaText: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.xs,
    color: Colors.success,
  },
  heroFooter: {
    gap: 2,
  },
  heroTier: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.sm,
  },
  heroTierHint: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
  },
  sectionEyebrow: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: Spacing[3],
  },
  sectionStack: {
    gap: Spacing[3],
  },
  progressStack: {
    gap: Spacing[2],
  },
  missionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[3],
  },
  missionDot: {
    width: 22,
    height: 22,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  missionDotInner: {
    width: 8,
    height: 8,
    borderRadius: Radius.full,
  },
  missionCopy: {
    flex: 1,
    gap: 2,
  },
  missionTitle: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.sm,
    color: Colors.textPrimary,
  },
  missionMeta: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.xs,
    color: Colors.textMuted,
  },
  missionSubtitle: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
  },
  missionRewardBlock: {
    alignItems: 'flex-end',
    gap: Spacing[1.5],
  },
  missionReward: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.base,
    color: Colors.coins,
  },
  missionClaimButton: {
    borderRadius: Radius.full,
    paddingHorizontal: Spacing[3],
    paddingVertical: 6,
    backgroundColor: withOpacity(Colors.brand, 0.14),
    borderWidth: 1,
    borderColor: withOpacity(Colors.brand, 0.22),
  },
  missionClaimButtonText: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.xs,
    color: Colors.brandLight,
  },
  missionClaimed: {
    width: 22,
    height: 22,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: withOpacity(Colors.success, 0.12),
    borderWidth: 1,
    borderColor: withOpacity(Colors.success, 0.2),
  },
  missionPending: {
    width: 22,
    height: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  eventTitle: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.lg,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  eventBody: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    lineHeight: 20,
    color: Colors.textSecondary,
    marginBottom: Spacing[3],
  },
  eventMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  eventMeta: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
  },
  eventReward: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.base,
  },
  actionsRow: {
    gap: Spacing[2],
  },
});
