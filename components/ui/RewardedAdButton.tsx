import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  View,
  ActivityIndicator,
} from 'react-native';
import { Colors } from '@/constants/colors';
import { FontFamily, Spacing, Radius } from '@/constants/theme';
import { useAds, AdContext } from '@/hooks/useAds';

interface RewardedAdButtonProps {
  context:  AdContext;
  label?:   string;
  coins?:   number;
  onReward: (coins: number) => void;
  compact?: boolean;
}

export function RewardedAdButton({
  context,
  label = 'Ver anuncio',
  coins = 15,
  onReward,
  compact = false,
}: RewardedAdButtonProps) {
  const { canShowRewarded, showRewarded, showing, isPremium } = useAds();

  // No mostrar si es Premium o si no hay anuncio disponible
  if (isPremium || !canShowRewarded(context)) return null;

  const handlePress = async () => {
    await showRewarded(context, onReward);
  };

  if (compact) {
    return (
      <TouchableOpacity
        style={styles.compactBtn}
        onPress={handlePress}
        disabled={showing}
      >
        {showing ? (
          <ActivityIndicator size="small" color={Colors.coins} />
        ) : (
          <>
            <Text style={styles.compactIcon}>▶</Text>
            <Text style={styles.compactLabel}>{label}</Text>
            <View style={styles.coinsPill}>
              <Text style={styles.coinsPillText}>+{coins} 🪙</Text>
            </View>
          </>
        )}
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={styles.fullBtn}
      onPress={handlePress}
      disabled={showing}
      activeOpacity={0.85}
    >
      {showing ? (
        <ActivityIndicator size="small" color={Colors.coins} />
      ) : (
        <View style={styles.fullContent}>
          <Text style={styles.fullIcon}>▶</Text>
          <Text style={styles.fullLabel}>{label}</Text>
          <View style={styles.coinsPill}>
            <Text style={styles.coinsPillText}>+{coins} 🪙</Text>
          </View>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  compactBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[2],
    backgroundColor: `${Colors.coins}15`,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[2],
    borderWidth: 1,
    borderColor: `${Colors.coins}40`,
    alignSelf: 'flex-start',
  },
  compactIcon: {
    fontSize: 12,
    color: Colors.coins,
  },
  compactLabel: {
    fontFamily: FontFamily.medium,
    fontSize: 13,
    color: Colors.coins,
  },
  coinsPill: {
    backgroundColor: Colors.coins,
    borderRadius: Radius.full,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  coinsPillText: {
    fontFamily: FontFamily.bold,
    fontSize: 11,
    color: Colors.bgPrimary,
  },
  fullBtn: {
    backgroundColor: `${Colors.coins}15`,
    borderRadius: Radius.xl,
    paddingVertical: Spacing[4],
    paddingHorizontal: Spacing[5],
    borderWidth: 1,
    borderColor: `${Colors.coins}40`,
  },
  fullContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing[3],
  },
  fullIcon: {
    fontSize: 16,
    color: Colors.coins,
  },
  fullLabel: {
    fontFamily: FontFamily.bold,
    fontSize: 16,
    color: Colors.coins,
  },
});