import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Card from '@/components/ui/Card';
import ProgressBar from '@/components/ui/ProgressBar';
import { Colors, withOpacity } from '@/constants/colors';
import { FontFamily, FontSize, Radius, Spacing } from '@/constants/theme';

interface HomeMomentumLoopCardProps {
  streak: number;
  bestStreak: number;
  nextMilestone: number | null;
  milestoneProgressPct: number;
  claimableCount: number;
  coins: number;
  dailyMissionCoins: number;
  dailyMissionXp: number;
  streakInDanger: boolean;
  rescueCopy: string;
  rescueStatusLabel: string;
  firstWeekActive: boolean;
  firstWeekProgressPct: number;
  firstWeekProgressLabel: string;
  unlockedBadges: number;
  totalBadges: number;
  nextBadgeName?: string | null;
  nextBadgeDescription?: string | null;
  nextBadgeCoins?: number;
  nextBadgeXp?: number;
  onPrimaryAction: () => void;
  onOpenChallenges: () => void;
  onOpenBadges: () => void;
  onOpenShop: () => void;
  onOpenFirstWeek?: () => void;
}

export default function HomeMomentumLoopCard({
  streak,
  bestStreak,
  nextMilestone,
  milestoneProgressPct,
  claimableCount,
  coins,
  dailyMissionCoins,
  dailyMissionXp,
  streakInDanger,
  rescueCopy,
  rescueStatusLabel,
  firstWeekActive,
  firstWeekProgressPct,
  firstWeekProgressLabel,
  unlockedBadges,
  totalBadges,
  nextBadgeName,
  nextBadgeDescription,
  nextBadgeCoins,
  nextBadgeXp,
  onPrimaryAction,
  onOpenChallenges,
  onOpenBadges,
  onOpenShop,
  onOpenFirstWeek,
}: HomeMomentumLoopCardProps) {
  const primaryAccent = streakInDanger ? Colors.error : Colors.coins;
  const headline = streakInDanger ? 'Rescate activo' : 'Momentum diario';
  const headlineBody = streakInDanger ? rescueCopy : `Tu misión de hoy sigue pagando +${dailyMissionCoins} coins y +${dailyMissionXp} XP.`;
  const nextMilestoneLabel = nextMilestone ? `${streak}/${nextMilestone} días hacia tu siguiente hito` : 'Ya estás en tu máximo hito visible';

  return (
    <Card style={styles.card} accentColor={primaryAccent}>
      <View style={styles.header}>
        <View style={styles.headerCopy}>
          <Text style={[styles.eyebrow, { color: primaryAccent }]}>{headline}</Text>
          <Text style={styles.title}>
            {streak > 0 ? `${streak} d?as construidos` : 'Hoy empieza la racha'}
          </Text>
        </View>

        <View
          style={[
            styles.streakBadge,
            {
              borderColor: withOpacity(primaryAccent, 0.28),
              backgroundColor: withOpacity(primaryAccent, 0.14),
            },
          ]}
        >
          <Ionicons name={streakInDanger ? 'flame' : 'trophy'} size={15} color={primaryAccent} />
          <Text style={[styles.streakBadgeText, { color: primaryAccent }]}> 
            {nextMilestone ? `Meta ${nextMilestone}` : 'Hito alto'}
          </Text>
        </View>
      </View>

      <Text style={styles.body}>{headlineBody}</Text>

      <View style={styles.metricsRow}>
        <View style={styles.metricCard}>
          <Text style={styles.metricValue}>{bestStreak}</Text>
          <Text style={styles.metricLabel}>Mejor racha</Text>
        </View>
        <View style={styles.metricCard}>
          <Text style={styles.metricValue}>{claimableCount}</Text>
          <Text style={styles.metricLabel}>Recompensas</Text>
        </View>
        <View style={styles.metricCard}>
          <Text style={styles.metricValue}>{coins}</Text>
          <Text style={styles.metricLabel}>Coins útiles</Text>
        </View>
      </View>

      <View style={styles.progressBlock}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressTitle}>Siguiente hito</Text>
          <Text style={styles.progressHint}>{nextMilestoneLabel}</Text>
        </View>
        <ProgressBar
          value={milestoneProgressPct}
          color={primaryAccent}
          label={nextMilestone ? `${Math.round(milestoneProgressPct)}% del pr?ximo hito` : 'Hito máximo alcanzado'}
        />
      </View>

      {firstWeekActive ? (
        <View style={styles.firstWeekCard}>
          <View style={styles.firstWeekCopy}>
            <Text style={styles.firstWeekTitle}>Ruta de arranque</Text>
            <Text style={styles.firstWeekText}>{firstWeekProgressLabel}</Text>
          </View>
          <ProgressBar value={firstWeekProgressPct} color={Colors.brand} label={`${Math.round(firstWeekProgressPct)}% de tu primera semana`} />
        </View>
      ) : null}

      <View style={styles.achievementCard}>
        <View style={styles.achievementHeader}>
          <View style={styles.achievementCopy}>
            <Text style={styles.achievementEyebrow}>Logro siguiente</Text>
            <Text style={styles.achievementTitle}>{nextBadgeName ?? 'Tu siguiente badge'}</Text>
          </View>
          <View style={styles.achievementBadge}>
            <Text style={styles.achievementBadgeText}>
              {unlockedBadges}/{totalBadges}
            </Text>
          </View>
        </View>

        <Text style={styles.achievementBody}>
          {nextBadgeDescription ?? 'Cada hábito cerrado va desbloqueando pruebas visibles de avance real.'}
        </Text>

        {(nextBadgeCoins || nextBadgeXp) ? (
          <Text style={styles.achievementReward}>
            +{nextBadgeCoins ?? 0} coins • +{nextBadgeXp ?? 0} XP
          </Text>
        ) : null}

        <View style={styles.rescueRow}>
          <Ionicons name={streakInDanger ? 'shield-checkmark' : 'shield-outline'} size={15} color={streakInDanger ? Colors.error : Colors.textSecondary} />
          <Text style={styles.rescueText}>{rescueStatusLabel}</Text>
        </View>
      </View>

      <View style={styles.actions}>
        <Pressable
          style={[
            styles.primaryPill,
            {
              borderColor: withOpacity(primaryAccent, 0.28),
              backgroundColor: withOpacity(primaryAccent, 0.14),
            },
          ]}
          onPress={onPrimaryAction}
        >
          <Ionicons name={streakInDanger ? 'flash' : 'gift-outline'} size={15} color={primaryAccent} />
          <Text style={[styles.primaryPillText, { color: primaryAccent }]}> 
            {streakInDanger ? 'Salvar hoy' : claimableCount > 0 ? 'Reclamar y seguir' : 'Mantener ritmo'}
          </Text>
        </Pressable>

        <Pressable style={styles.secondaryPill} onPress={onOpenChallenges}>
          <Ionicons name="trophy-outline" size={14} color={Colors.warning} />
          <Text style={styles.secondaryPillText}>Retos</Text>
        </Pressable>

        <Pressable style={styles.secondaryPill} onPress={onOpenBadges}>
          <Ionicons name="ribbon-outline" size={14} color={Colors.brandLight} />
          <Text style={styles.secondaryPillText}>Logros</Text>
        </Pressable>

        <Pressable style={styles.secondaryPill} onPress={onOpenShop}>
          <Ionicons name="cash-outline" size={14} color={Colors.coins} />
          <Text style={styles.secondaryPillText}>Tienda</Text>
        </Pressable>

        {firstWeekActive && onOpenFirstWeek ? (
          <Pressable style={styles.secondaryPill} onPress={onOpenFirstWeek}>
            <Ionicons name="rocket-outline" size={14} color={Colors.brandLight} />
            <Text style={styles.secondaryPillText}>Primera semana</Text>
          </Pressable>
        ) : null}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: Spacing[4],
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing[3],
  },
  headerCopy: {
    flex: 1,
    gap: 4,
  },
  eyebrow: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.xs,
  },
  title: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.xl,
    color: Colors.textPrimary,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: Radius.full,
    borderWidth: 1,
    paddingHorizontal: Spacing[3],
    paddingVertical: 8,
  },
  streakBadgeText: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.xs,
  },
  body: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.base,
    lineHeight: 22,
    color: Colors.textSecondary,
  },
  metricsRow: {
    flexDirection: 'row',
    gap: Spacing[2],
  },
  metricCard: {
    flex: 1,
    borderRadius: Radius['2xl'],
    borderWidth: 1,
    borderColor: withOpacity(Colors.white, 0.08),
    backgroundColor: withOpacity(Colors.surface2, 0.92),
    padding: Spacing[4],
    gap: 6,
  },
  metricValue: {
    fontFamily: FontFamily.display,
    fontSize: FontSize['2xl'],
    color: Colors.textPrimary,
    letterSpacing: -0.8,
  },
  metricLabel: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
  },
  progressBlock: {
    gap: Spacing[3],
  },
  progressHeader: {
    gap: 4,
  },
  progressTitle: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.sm,
    color: Colors.textPrimary,
  },
  progressHint: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    lineHeight: 20,
    color: Colors.textSecondary,
  },
  firstWeekCard: {
    gap: Spacing[3],
    borderRadius: Radius['2xl'],
    borderWidth: 1,
    borderColor: withOpacity(Colors.brand, 0.16),
    backgroundColor: withOpacity(Colors.brand, 0.08),
    padding: Spacing[4],
  },
  firstWeekCopy: {
    gap: 4,
  },
  firstWeekTitle: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.sm,
    color: Colors.textPrimary,
  },
  firstWeekText: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    lineHeight: 20,
    color: Colors.textSecondary,
  },
  achievementCard: {
    gap: Spacing[3],
    borderRadius: Radius['2xl'],
    borderWidth: 1,
    borderColor: withOpacity(Colors.warning, 0.16),
    backgroundColor: withOpacity(Colors.warning, 0.08),
    padding: Spacing[4],
  },
  achievementHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing[3],
  },
  achievementCopy: {
    flex: 1,
    gap: 4,
  },
  achievementEyebrow: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.xs,
    color: Colors.warning,
  },
  achievementTitle: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.base,
    color: Colors.textPrimary,
  },
  achievementBadge: {
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: withOpacity(Colors.warning, 0.24),
    backgroundColor: withOpacity(Colors.warning, 0.14),
    paddingHorizontal: Spacing[3],
    paddingVertical: 8,
  },
  achievementBadgeText: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.xs,
    color: Colors.warning,
  },
  achievementBody: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    lineHeight: 20,
    color: Colors.textSecondary,
  },
  achievementReward: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.sm,
    color: Colors.textPrimary,
  },
  rescueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[2],
  },
  rescueText: {
    flex: 1,
    fontFamily: FontFamily.medium,
    fontSize: FontSize.xs,
    lineHeight: 18,
    color: Colors.textSecondary,
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing[2],
  },
  primaryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[2],
    borderRadius: Radius.full,
    borderWidth: 1,
    paddingHorizontal: Spacing[3],
    paddingVertical: 10,
  },
  primaryPillText: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.xs,
  },
  secondaryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[2],
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: withOpacity(Colors.white, 0.08),
    backgroundColor: Colors.glassLight,
    paddingHorizontal: Spacing[3],
    paddingVertical: 10,
  },
  secondaryPillText: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.xs,
    color: Colors.textPrimary,
  },
});
