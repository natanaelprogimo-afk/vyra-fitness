import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { Colors, withOpacity } from '@/constants/colors';
import { FontFamily, FontSize, Radius, Spacing } from '@/constants/theme';

type RewardedUnlockCardProps = {
  title: string;
  body: string;
  buttonLabel: string;
  onPress: () => void;
  loading?: boolean;
  accent?: string;
};

export default function RewardedUnlockCard({
  title,
  body,
  buttonLabel,
  onPress,
  loading = false,
  accent = Colors.brand,
}: RewardedUnlockCardProps) {
  return (
    <Card style={[styles.card, { borderColor: withOpacity(accent, 0.2) }]}>
      <View style={styles.eyebrowWrap}>
        <Text style={[styles.eyebrow, { color: accent }]}>Extra desbloqueable</Text>
        <View style={[styles.dot, { backgroundColor: accent }]} />
        <Text style={styles.meta}>Video recompensado</Text>
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.body}>{body}</Text>
      <Button
        onPress={onPress}
        fullWidth
        loading={loading}
        color={accent}
        accessibilityHint="Abre un video recompensado para desbloquear esta lectura extra."
      >
        {buttonLabel}
      </Button>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: Spacing[3],
    borderWidth: 1,
    backgroundColor: Colors.surface2,
  },
  eyebrowWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[2],
  },
  eyebrow: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.xs,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: Radius.full,
  },
  meta: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.xs,
    color: Colors.textMuted,
  },
  title: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.base,
    color: Colors.textPrimary,
  },
  body: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    lineHeight: 20,
    color: Colors.textSecondary,
  },
});
