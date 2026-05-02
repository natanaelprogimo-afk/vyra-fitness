import React from 'react';
import { StyleSheet, Text, View, type ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Button from '@/components/ui/Button';
import { Colors, withOpacity } from '@/constants/colors';
import { FontFamily, FontSize, Radius, Spacing } from '@/constants/theme';

type NoticeTone = 'info' | 'success' | 'warning' | 'error';

interface NoticeCardProps {
  title: string;
  body: string;
  tone?: NoticeTone;
  actionLabel?: string;
  onAction?: () => void;
  secondaryLabel?: string;
  onSecondaryAction?: () => void;
  style?: ViewStyle;
}

const TONE_CONFIG: Record<
  NoticeTone,
  { icon: React.ComponentProps<typeof Ionicons>['name']; accent: string; background: string }
> = {
  info: {
    icon: 'information-circle-outline',
    accent: Colors.brand,
    background: withOpacity(Colors.brand, 0.08),
  },
  success: {
    icon: 'checkmark-circle-outline',
    accent: Colors.success,
    background: Colors.successBg,
  },
  warning: {
    icon: 'alert-circle-outline',
    accent: Colors.warning,
    background: Colors.warningBg,
  },
  error: {
    icon: 'warning-outline',
    accent: Colors.error,
    background: Colors.errorBg,
  },
};

export default function NoticeCard({
  title,
  body,
  tone = 'info',
  actionLabel,
  onAction,
  secondaryLabel,
  onSecondaryAction,
  style,
}: NoticeCardProps) {
  const config = TONE_CONFIG[tone];

  return (
    <View
      style={[
        styles.card,
        {
          borderColor: withOpacity(config.accent, 0.24),
          backgroundColor: config.background,
        },
        style,
      ]}
      accessibilityRole="summary"
      accessibilityLabel={`${title}. ${body}`}
    >
      <View style={styles.header}>
        <View
          style={[
            styles.iconWrap,
            {
              backgroundColor: withOpacity(config.accent, 0.16),
            },
          ]}
        >
          <Ionicons name={config.icon} size={18} color={config.accent} />
        </View>
        <View style={styles.copy}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.body}>{body}</Text>
        </View>
      </View>

      {actionLabel && onAction ? (
        <View style={styles.actions}>
          <Button
            onPress={onAction}
            label={actionLabel}
            size="sm"
            color={config.accent}
            accessibilityHint={body}
          />
          {secondaryLabel && onSecondaryAction ? (
            <Button
              onPress={onSecondaryAction}
              label={secondaryLabel}
              size="sm"
              variant="secondary"
              color={config.accent}
            />
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: Spacing[3],
    borderRadius: Radius.xl,
    borderWidth: 1,
    padding: Spacing[4],
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing[3],
  },
  iconWrap: {
    width: 34,
    height: 34,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  copy: {
    flex: 1,
    gap: 4,
  },
  title: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.sm,
    color: Colors.textPrimary,
  },
  body: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    lineHeight: 18,
    color: Colors.textSecondary,
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing[2],
  },
});

