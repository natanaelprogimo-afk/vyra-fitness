import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
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
import { useGamification } from '@/hooks/useGamification';

export default function GamificationRankScreen() {
  const {
    balance,
    currentTier,
    nextTier,
    level,
    xp,
    xpIntoLevel,
    xpToNextLevel,
    claimableCount,
    upcomingTiers,
  } = useGamification();

  return (
    <SafeScreen padHorizontal={false} padBottom>
      <Header title="Tu progreso" subtitle="Nivel y próximo rango" showBack color={currentTier.accent} />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Card style={styles.heroCard} accentColor={currentTier.accent} decorative={false}>
          <View style={styles.heroTop}>
            <View style={[styles.heroIcon, { backgroundColor: withOpacity(currentTier.accent, 0.16) }]}>
              <Text style={styles.heroGlyph}>{currentTier.glyph}</Text>
            </View>
            <View style={styles.heroCopy}>
              <Text style={styles.heroRank}>{currentTier.name}</Text>
              <Text style={styles.heroLevel}>Niv. {level} · próximo rango</Text>
              <Text style={styles.heroXp}>{xp.toLocaleString()} / {(nextTier?.minXp ?? xp).toLocaleString()} XP</Text>
            </View>
            <View style={styles.levelBadge}>
              <Text style={[styles.levelBadgeText, { color: currentTier.accent }]}>Lvl {level}</Text>
            </View>
          </View>

          <View style={styles.progressWrap}>
            <ProgressBar
              value={nextTier ? ((xp - currentTier.minXp) / Math.max(1, nextTier.minXp - currentTier.minXp)) * 100 : 100}
              color={currentTier.accent}
              height={10}
              animated={false}
              trackColor={withOpacity(currentTier.accent, 0.14)}
            />
            <Text style={styles.progressHint}>
              {nextTier ? `${Math.max(nextTier.minXp - xp, 0).toLocaleString()} XP para ${nextTier.name}` : 'Rango máximo alcanzado'}
            </Text>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{xpIntoLevel.toLocaleString()}</Text>
              <Text style={styles.statLabel}>XP nivel</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={[styles.statValue, { color: Colors.coins }]}>{balance}</Text>
              <Text style={styles.statLabel}>Coins</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={[styles.statValue, { color: Colors.recovery }]}>{claimableCount}</Text>
              <Text style={styles.statLabel}>Pendientes</Text>
            </View>
          </View>
        </Card>

        <Card decorative={false}>
          <Text style={styles.sectionEyebrow}>Próximos rangos</Text>
          <View style={styles.rankList}>
            {upcomingTiers.map((rank) => (
              <View key={rank.id} style={styles.rankRow}>
                <View style={[styles.rankRowIcon, { backgroundColor: withOpacity(rank.accent, 0.12) }]}>
                  <Text style={styles.rankRowGlyph}>{rank.glyph}</Text>
                </View>
                <View style={styles.rankRowCopy}>
                  <Text style={styles.rankRowTitle}>{rank.name}</Text>
                  <Text style={styles.rankRowBody}>{rank.perk}</Text>
                </View>
                <Text style={styles.rankRowXp}>{Math.max(rank.minXp - xp, 0).toLocaleString()} XP</Text>
              </View>
            ))}
          </View>
        </Card>

        <Button color={Colors.brand} fullWidth onPress={() => router.push(Routes.store.shop as any)}>
          Ir a la tienda
        </Button>
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
    gap: Spacing[4],
  },
  heroTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[3],
  },
  heroIcon: {
    width: 52,
    height: 52,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: withOpacity(Colors.white, 0.08),
  },
  heroGlyph: {
    fontSize: 24,
  },
  heroCopy: {
    flex: 1,
    gap: 2,
  },
  heroRank: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.xl,
    color: Colors.textPrimary,
  },
  heroLevel: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
  },
  heroXp: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.sm,
    color: Colors.textMuted,
  },
  levelBadge: {
    borderRadius: Radius.full,
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[1.5],
    backgroundColor: withOpacity(Colors.white, 0.06),
  },
  levelBadgeText: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.xs,
  },
  progressWrap: {
    gap: Spacing[2],
  },
  progressHint: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
  },
  statsRow: {
    flexDirection: 'row',
    gap: Spacing[2],
  },
  statCard: {
    flex: 1,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: withOpacity(Colors.white, 0.08),
    backgroundColor: withOpacity(Colors.white, 0.04),
    padding: Spacing[3],
    gap: 4,
  },
  statValue: {
    fontFamily: FontFamily.display,
    fontSize: FontSize.xl,
    color: Colors.textPrimary,
  },
  statLabel: {
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
  rankList: {
    gap: Spacing[3],
  },
  rankRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[3],
    borderRadius: Radius['2xl'],
    borderWidth: 1,
    borderColor: withOpacity(Colors.white, 0.08),
    backgroundColor: withOpacity(Colors.surface2, 0.92),
    padding: Spacing[3],
  },
  rankRowIcon: {
    width: 42,
    height: 42,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankRowGlyph: {
    fontSize: 18,
  },
  rankRowCopy: {
    flex: 1,
    gap: 2,
  },
  rankRowTitle: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.sm,
    color: Colors.textPrimary,
  },
  rankRowBody: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
  },
  rankRowXp: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.xs,
    color: Colors.brandLight,
  },
});
