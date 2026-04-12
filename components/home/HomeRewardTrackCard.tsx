import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Card from '@/components/ui/Card';
import ProgressBar from '@/components/ui/ProgressBar';
import { Colors, withOpacity } from '@/constants/colors';
import { FontFamily, FontSize, Radius, Spacing } from '@/constants/theme';

interface HomeRewardTrackCardProps {
  level: number;
  xpToNextLevel: number;
  xpProgressPct: number;
  currentTierName: string;
  nextTierName?: string | null;
  weeklyTitle?: string | null;
  weeklyProgressLabel?: string | null;
  onOpenChallenges: () => void;
  onOpenProgress: () => void;
}

export default function HomeRewardTrackCard({
  level,
  xpToNextLevel,
  xpProgressPct,
  currentTierName,
  nextTierName,
  weeklyTitle,
  weeklyProgressLabel,
  onOpenChallenges,
  onOpenProgress,
}: HomeRewardTrackCardProps) {
  return (
    <Card style={styles.card} accentColor={Colors.coins}>
      <View style={styles.header}>
        <View style={styles.headerCopy}>
          <Text style={styles.eyebrow}>Prxima recompensa</Text>
          <Text style={styles.title}>Te faltan {xpToNextLevel} XP para subir</Text>
        </View>
        <View style={styles.levelBadge}>
          <Text style={styles.levelBadgeText}>L{level}</Text>
        </View>
      </View>

      <Text style={styles.summary}>
        Ya estas en <Text style={styles.summaryStrong}>{currentTierName}</Text>
        {nextTierName ? ` y el m?síguiente salto es ${nextTierName}.` : '.'}
      </Text>

      <ProgressBar value={xpProgressPct} color={Colors.coins} label={`${Math.round(xpProgressPct)}% del nivel actual`} />

      <View style={styles.tracks}>
        <View style={styles.trackRow}>
          <View style={[styles.iconWrap, styles.iconWrapPrimary]}>
            <Ionicons name="sparkles" size={16} color={Colors.coins} />
          </View>
          <View style={styles.trackCopy}>
            <Text style={styles.trackTitle}>Nivel y rango</Text>
            <Text style={styles.trackSubtitle}>Cada hbito cerrado te acerca al siguiente escaln visible.</Text>
          </View>
        </View>

        {weeklyTitle ? (
          <View style={styles.trackRow}>
            <View style={styles.iconWrap}>
              <Ionicons name="trophy-outline" size={16} color={Colors.warning} />
            </View>
            <View style={styles.trackCopy}>
              <Text style={styles.trackTitle}>{weeklyTitle}</Text>
              <Text style={styles.trackSubtitle}>{weeklyProgressLabel ?? 'Tu siguiente reto semanal ya está activo.'}</Text>
            </View>
          </View>
        ) : null}
      </View>

      <View style={styles.actions}>
        <Pressable style={styles.actionPill} onPress={onOpenChallenges}>
          <Ionicons name="trophy-outline" size={14} color={Colors.warning} />
          <Text style={styles.actionText}>Abrir retos</Text>
        </Pressable>
        <Pressable style={styles.actionPill} onPress={onOpenProgress}>
          <Ionicons name="analytics-outline" size={14} color={Colors.brandLight} />
          <Text style={styles.actionText}>Ver progreso</Text>
        </Pressable>
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
    color: Colors.coins,
  },
  title: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.xl,
    color: Colors.textPrimary,
  },
  levelBadge: {
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: withOpacity(Colors.coins, 0.28),
    backgroundColor: withOpacity(Colors.coins, 0.14),
    paddingHorizontal: Spacing[3],
    paddingVertical: 8,
  },
  levelBadgeText: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.sm,
    color: Colors.coins,
  },
  summary: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.base,
    lineHeight: 22,
    color: Colors.textSecondary,
  },
  summaryStrong: {
    fontFamily: FontFamily.bold,
    color: Colors.textPrimary,
  },
  tracks: {
    gap: Spacing[3],
  },
  trackRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing[3],
  },
  iconWrap: {
    width: 38,
    height: 38,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: withOpacity(Colors.white, 0.08),
    backgroundColor: withOpacity(Colors.surface2, 0.92),
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapPrimary: {
    borderColor: withOpacity(Colors.coins, 0.28),
    backgroundColor: withOpacity(Colors.coins, 0.12),
  },
  trackCopy: {
    flex: 1,
    gap: 4,
  },
  trackTitle: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.sm,
    color: Colors.textPrimary,
  },
  trackSubtitle: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    lineHeight: 20,
    color: Colors.textSecondary,
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing[2],
  },
  actionPill: {
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
  actionText: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.xs,
    color: Colors.textPrimary,
  },
});
