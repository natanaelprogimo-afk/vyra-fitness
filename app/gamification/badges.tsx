import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import SafeScreen from '@/components/ui/SafeScreen';
import { Header } from '@/components/layout/Header';
import Card from '@/components/ui/Card';
import ProgressBar from '@/components/ui/ProgressBar';
import Modal, { Achievement as AchievementModal } from '@/components/ui/Modal';
import BadgeDetailModal from '@/components/ui/BadgeDetailModal';
import { Colors } from '@/constants/colors';
import { FontFamily, Spacing, Radius } from '@/constants/theme';
import { useBadges, BADGES, BadgeDef, BadgeRarity } from '@/hooks/useBadges';

const RARITY_LABELS: Record<BadgeRarity, string> = {
  common:    'Común',
  rare:      'Raro',
  epic:      'Épico',
  legendary: 'Legendario',
};

function BadgeCard({
  badge,
  unlocked,
  onPress,
  rarityColor,
}: {
  badge:      BadgeDef;
  unlocked:   boolean;
  onPress:    () => void;
  rarityColor: string;
}) {
  const scale = useSharedValue(1);
  const style = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  const handlePress = () => {
    scale.value = withSpring(0.92, {}, () => { scale.value = withSpring(1); });
    onPress();
  };

  return (
    <Animated.View style={style}>
      <TouchableOpacity
        style={[
          styles.badgeCard,
          unlocked
            ? { borderColor: rarityColor, backgroundColor: `${rarityColor}10` }
            : styles.badgeCardLocked,
        ]}
        onPress={handlePress}
        activeOpacity={0.85}
      >
        <Text style={[styles.badgeEmoji, !unlocked && styles.lockedEmoji]}>
          {unlocked ? badge.emoji : '🔒'}
        </Text>
        <Text
          style={[
            styles.badgeName,
            { color: unlocked ? Colors.textPrimary : Colors.textMuted },
          ]}
          numberOfLines={2}
        >
          {unlocked ? badge.name : '???'}
        </Text>
        <Text style={[styles.badgeRarity, { color: unlocked ? rarityColor : Colors.textMuted }]}>
          {RARITY_LABELS[badge.rarity]}
        </Text>
        {unlocked && (
          <Text style={styles.badgeCoins}>+{badge.coins} 🪙</Text>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
}

export default function BadgesScreen() {
  const {
    allBadges,
    unlockedBadges,
    loading,
    isUnlocked,
    getProgress,
    rarityColor,
    newlyUnlocked,
    clearNewlyUnlocked,
  } = useBadges();

  const [selectedBadge, setSelectedBadge] = React.useState<BadgeDef | null>(null);
  const progress = getProgress();

  const byRarity: Record<BadgeRarity, BadgeDef[]> = {
    common:    allBadges.filter((b) => b.rarity === 'common'),
    rare:      allBadges.filter((b) => b.rarity === 'rare'),
    epic:      allBadges.filter((b) => b.rarity === 'epic'),
    legendary: allBadges.filter((b) => b.rarity === 'legendary'),
  };

  return (
    <SafeScreen padHorizontal={false} padBottom>
      <Header title="Badges" showBack color={Colors.coins} />

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Progreso general */}
        <Card style={styles.progressCard}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressTitle}>Tu colección</Text>
            <Text style={styles.progressCount}>
              {progress.unlocked}/{progress.total}
            </Text>
          </View>
          <ProgressBar value={progress.pct} color={Colors.coins} height={8} />
          <Text style={styles.progressSubtitle}>
            {progress.pct}% completado — ¡seguí así!
          </Text>
        </Card>

        {/* Por rareza */}
        {(['common', 'rare', 'epic', 'legendary'] as BadgeRarity[]).map((rarity) => {
          const badges = byRarity[rarity];
          const unlockedInGroup = badges.filter((b) => isUnlocked(b.id)).length;
          const color = rarityColor(rarity);
          return (
            <View key={rarity} style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { color }]}>
                  {RARITY_LABELS[rarity]}
                </Text>
                <Text style={styles.sectionCount}>
                  {unlockedInGroup}/{badges.length}
                </Text>
              </View>
              <View style={styles.grid}>
                {badges.map((badge) => (
                  <BadgeCard
                    key={badge.id}
                    badge={badge}
                    unlocked={isUnlocked(badge.id)}
                    rarityColor={color}
                    onPress={() => setSelectedBadge(badge)}
                  />
                ))}
              </View>
            </View>
          );
        })}
      </ScrollView>

      {/* Badge detail modal: uses a lightweight component */}
      {selectedBadge && (
        <BadgeDetailModal
          visible={!!selectedBadge}
          badge={selectedBadge}
          unlocked={isUnlocked(selectedBadge.id)}
          onClose={() => setSelectedBadge(null)}
        />
      )}

      {/* Modal de nuevo badge desbloqueado - using UIStore */}
      {/* {newlyUnlocked && (
        <AchievementModal
          badge={newlyUnlocked}
          unlocked
          isNew
          onClose={clearNewlyUnlocked}
        />
      )} */}
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingHorizontal: Spacing[5],
    paddingBottom: Spacing[10],
    paddingTop: Spacing[4],
    gap: Spacing[5],
  },
  progressCard: { gap: Spacing[3] },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressTitle: {
    fontFamily: FontFamily.bold,
    fontSize: 18,
    color: Colors.textPrimary,
  },
  progressCount: {
    fontFamily: FontFamily.bold,
    fontSize: 18,
    color: Colors.coins,
  },
  progressSubtitle: {
    fontFamily: FontFamily.regular,
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: -Spacing[1],
  },
  section: { gap: Spacing[3] },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontFamily: FontFamily.bold,
    fontSize: 16,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  sectionCount: {
    fontFamily: FontFamily.medium,
    fontSize: 14,
    color: Colors.textMuted,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing[3],
  },
  badgeCard: {
    width: '47%',
    borderRadius: Radius.xl,
    padding: Spacing[4],
    alignItems: 'center',
    gap: Spacing[2],
    borderWidth: 2,
    minHeight: 120,
    justifyContent: 'center',
  },
  badgeCardLocked: {
    borderColor: Colors.border,
    backgroundColor: Colors.bgSurface,
  },
  badgeEmoji: { fontSize: 36 },
  lockedEmoji: { opacity: 0.4 },
  badgeName: {
    fontFamily: FontFamily.bold,
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 17,
  },
  badgeRarity: {
    fontFamily: FontFamily.medium,
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  badgeCoins: {
    fontFamily: FontFamily.medium,
    fontSize: 12,
    color: Colors.coins,
  },
});