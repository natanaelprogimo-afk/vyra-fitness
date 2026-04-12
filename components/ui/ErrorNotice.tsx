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
    <View style={styles.card}>
      <Text style={styles.title}>Sin conexion</Text>
      <Text style={styles.body}>{message}</Text>
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
    borderColor: Colors.border,
    backgroundColor: Colors.bgSurface,
    padding: Spacing[4],
    gap: Spacing[3],
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
