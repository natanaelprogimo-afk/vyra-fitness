import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { Colors, withOpacity } from '@/constants/colors';
import { FontFamily, FontSize, Radius, Spacing } from '@/constants/theme';

interface ModuleIntroScreenProps {
  accentColor: string;
  eyebrow?: string;
  icon: string;
  title: string;
  body: string;
  ctaLabel?: string;
  secondaryLabel?: string;
  onContinue: () => void;
  onSecondary?: () => void;
}

export default function ModuleIntroScreen({
  accentColor,
  eyebrow = 'Primer uso',
  icon,
  title,
  body,
  ctaLabel = 'Empezar',
  secondaryLabel,
  onContinue,
  onSecondary,
}: ModuleIntroScreenProps) {
  return (
    <View style={styles.wrap}>
      <Card accentColor={accentColor} style={styles.card}>
        <View style={[styles.iconOrb, { backgroundColor: withOpacity(accentColor, 0.16) }]}>
          <Text style={styles.icon}>{icon}</Text>
        </View>

        <Text style={[styles.eyebrow, { color: accentColor }]}>{eyebrow}</Text>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.body}>{body}</Text>

        <View style={styles.actions}>
          <Button onPress={onContinue} color={accentColor} fullWidth>
            {ctaLabel}
          </Button>
          {secondaryLabel && onSecondary ? (
            <Button onPress={onSecondary} variant="secondary" color={accentColor} fullWidth>
              {secondaryLabel}
            </Button>
          ) : null}
        </View>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: Spacing[5],
    paddingTop: Spacing[5],
    paddingBottom: Spacing[8],
  },
  card: {
    alignItems: 'center',
    gap: Spacing[3],
    paddingVertical: Spacing[6],
  },
  iconOrb: {
    width: 96,
    height: 96,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: withOpacity(Colors.white, 0.08),
  },
  icon: {
    fontSize: 38,
  },
  eyebrow: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  title: {
    fontFamily: FontFamily.display,
    fontSize: 32,
    lineHeight: 34,
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  body: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    lineHeight: 22,
    color: Colors.textSecondary,
    textAlign: 'center',
    maxWidth: 320,
  },
  actions: {
    width: '100%',
    gap: Spacing[2],
    marginTop: Spacing[2],
  },
});
