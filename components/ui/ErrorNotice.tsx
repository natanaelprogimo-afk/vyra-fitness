import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Button from './Button';
import { Colors } from '@/constants/colors';
import { FontFamily, FontSize, Radius, Spacing } from '@/constants/theme';

interface ErrorNoticeProps {
  message: string;
  onRetry?: () => void;
}

export default function ErrorNotice({ message, onRetry }: ErrorNoticeProps) {
  return (
    <View
      style={[
        styles.card,
        {
          borderColor: Colors.border,
          backgroundColor: Colors.bgSurface,
        },
      ]}
    >
      <Text style={[styles.title, { color: Colors.textPrimary }]}>Sin conexión</Text>
      <Text style={[styles.body, { color: Colors.textSecondary }]}>{message}</Text>
      {onRetry ? (
        <Button onPress={onRetry} variant="secondary" fullWidth>
          Reintentar
        </Button>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Radius.xl,
    borderWidth: 1,
    padding: Spacing[4],
    gap: Spacing[3],
  },
  title: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.base,
  },
  body: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    lineHeight: 20,
  },
});
