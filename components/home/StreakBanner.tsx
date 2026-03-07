// ============================================================
// VYRA FITNESS — StreakBanner
// Banner de racha con display de coins y nivel
// ============================================================

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '@/constants/colors';
import { FontSize, FontFamily, Spacing, Radius } from '@/constants/theme';
import type { UserProfile } from '@/types/user';

interface StreakBannerProps {
  profile: UserProfile;
}

export const StreakBanner = ({ profile }: StreakBannerProps) => {
  const { level, xp, coins } = profile;
  const currentStreak = profile.current_streak ?? profile.streak ?? 0;
  const xpForLevel = 1000;
  const xpProgress = xp % xpForLevel;
  const xpPct      = (xpProgress / xpForLevel) * 100;

  return (
    <View style={styles.container}>
      {/* Racha */}
      <View style={styles.stat}>
        <Text style={styles.statEmoji}>🔥</Text>
        <Text style={styles.statValue}>{currentStreak}</Text>
        <Text style={styles.statLabel}>días</Text>
      </View>

      <View style={styles.divider} />

      {/* Nivel + XP */}
      <View style={styles.levelSection}>
        <View style={styles.levelHeader}>
          <Text style={styles.levelLabel}>Nivel {level}</Text>
          <Text style={styles.xpText}>{xpProgress}/{xpForLevel} XP</Text>
        </View>
        <View style={styles.xpBar}>
          <View style={[styles.xpFill, { width: `${xpPct}%` }]} />
        </View>
      </View>

      <View style={styles.divider} />

      {/* Coins */}
      <View style={styles.stat}>
        <Text style={styles.statEmoji}>🪙</Text>
        <Text style={[styles.statValue, { color: Colors.coins }]}>
          {coins >= 1000 ? `${(coins/1000).toFixed(1)}K` : coins}
        </Text>
        <Text style={styles.statLabel}>coins</Text>
      </View>
    </View>
  );
};

export default StreakBanner;

const styles = StyleSheet.create({
  container: {
    flexDirection:  'row',
    alignItems:     'center',
    backgroundColor:Colors.bgSurface,
    borderRadius:   Radius.xl,
    padding:        Spacing[4],
    borderWidth:    1,
    borderColor:    Colors.border,
    gap:            Spacing[4],
  },
  stat: {
    alignItems: 'center',
    minWidth:   60,
  },
  statEmoji: { fontSize: 20, marginBottom: Spacing[0.5] },
  statValue: {
    fontFamily: FontFamily.bold,
    fontSize:   FontSize.xl,
    color:      Colors.textPrimary,
    lineHeight: FontSize.xl * 1.1,
  },
  statLabel: {
    fontFamily: FontFamily.regular,
    fontSize:   FontSize.xs,
    color:      Colors.textMuted,
  },
  divider: {
    width:  1,
    height: 40,
    backgroundColor: Colors.divider,
  },
  levelSection: {
    flex: 1,
  },
  levelHeader: {
    flexDirection:  'row',
    justifyContent: 'space-between',
    marginBottom:   Spacing[1.5],
  },
  levelLabel: {
    fontFamily: FontFamily.semibold,
    fontSize:   FontSize.sm,
    color:      Colors.textPrimary,
  },
  xpText: {
    fontFamily: FontFamily.medium,
    fontSize:   FontSize.xs,
    color:      Colors.textMuted,
  },
  xpBar: {
    height:          6,
    borderRadius:    3,
    backgroundColor: Colors.bgElevated,
    overflow:        'hidden',
  },
  xpFill: {
    height:       '100%',
    borderRadius: 3,
    backgroundColor: Colors.brand,
    minWidth:     6,
  },
});
