import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Card from '@/components/ui/Card';
import { Colors } from '@/constants/colors';
import { FontFamily, FontSize, Spacing } from '@/constants/theme';
import useScreenBanner from '@/hooks/useScreenBanner';
import type { BannerPlacementKey } from '@/lib/ads/placements';

type BannerPlacementCardProps = {
  placementKey: BannerPlacementKey;
  eyebrow?: string;
  title?: string;
  body?: string;
  activateOnMount?: boolean;
};

export default function BannerPlacementCard({
  placementKey,
  eyebrow = 'Patrocinado',
  title = 'Espacio patrocinado',
  body = 'Este espacio ayuda a sostener Vyra sin cortar tus registros ni bloquear el historial.',
  activateOnMount = true,
}: BannerPlacementCardProps) {
  useScreenBanner(placementKey, 320, 50, activateOnMount);

  return (
    <Card style={styles.card}>
      <View style={styles.copy}>
        <Text style={styles.eyebrow}>{eyebrow}</Text>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.body}>{body}</Text>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: Spacing[3],
  },
  copy: {
    gap: 4,
  },
  eyebrow: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  title: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.sm,
    color: Colors.textPrimary,
  },
  body: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    lineHeight: 18,
    color: Colors.textSecondary,
  },
});
