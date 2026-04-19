import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import SafeScreen from '@/components/ui/SafeScreen';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { Colors, withOpacity } from '@/constants/colors';
import { FontFamily, FontSize, Radius, Spacing } from '@/constants/theme';

interface MaintenanceViewProps {
  onRetry?: () => void;
  lastCheckedAt?: number | null;
  compact?: boolean;
  error?: string | null;
}

function formatLastChecked(value?: number | null) {
  if (!value) return 'Hace un momento';
  const diffMinutes = Math.max(1, Math.floor((Date.now() - value) / 60_000));
  if (diffMinutes < 60) return `Hace ${diffMinutes} min`;
  const hours = Math.floor(diffMinutes / 60);
  return `Hace ${hours} h`;
}

export default function MaintenanceView({
  onRetry,
  lastCheckedAt,
  compact = false,
  error,
}: MaintenanceViewProps) {
  const [retryCooldown, setRetryCooldown] = useState(0);

  useEffect(() => {
    if (retryCooldown <= 0) return undefined;
    const interval = setInterval(() => {
      setRetryCooldown((value) => (value > 0 ? value - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [retryCooldown]);

  const handleRetry = () => {
    if (!onRetry || retryCooldown > 0) return;
    onRetry();
    setRetryCooldown(30);
  };

  return (
    <SafeScreen>
      <View style={styles.container}>
        <View style={styles.noise} pointerEvents="none" />
        <Card style={styles.card}>
          <View style={styles.iconWrap}>
            <Ionicons name="construct-outline" size={38} color={withOpacity(Colors.brand, 0.72)} />
          </View>
          <Text style={styles.title}>Volvemos pronto</Text>
          <Text style={styles.subtitle}>Estamos ajustando algo. Tus datos estan bien y no deberias perder nada.</Text>
          <View style={styles.metaPill}>
            <Text style={styles.metaText}>Ultimo chequeo: {formatLastChecked(lastCheckedAt)}</Text>
          </View>
          {error ? <Text style={styles.errorText}>{error}</Text> : null}
          {onRetry ? (
            <Button onPress={handleRetry} disabled={retryCooldown > 0} variant="ghost" fullWidth>
              {retryCooldown > 0 ? `Reintentar en ${retryCooldown}s` : 'Reintentar'}
            </Button>
          ) : null}
        </Card>
        {!compact ? (
          <Text style={styles.footnote}>
            Si estabas usando la app sin conexion, lo local sigue guardado. Solo falta que el sistema vuelva.
          </Text>
        ) : null}
      </View>
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: Spacing[5],
  },
  noise: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: withOpacity(Colors.white, 0.015),
  },
  card: {
    alignItems: 'center',
    gap: Spacing[4],
    borderColor: withOpacity(Colors.white, 0.05),
    backgroundColor: withOpacity(Colors.surface1, 0.9),
  },
  iconWrap: {
    width: 72,
    height: 72,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: withOpacity(Colors.brand, 0.06),
    borderWidth: 1,
    borderColor: withOpacity(Colors.brand, 0.1),
  },
  title: {
    fontFamily: FontFamily.display,
    fontSize: 34,
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.base,
    lineHeight: 24,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  metaPill: {
    borderRadius: Radius.full,
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[2],
    backgroundColor: withOpacity(Colors.white, 0.04),
    borderWidth: 1,
    borderColor: withOpacity(Colors.white, 0.06),
  },
  metaText: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
  },
  errorText: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    lineHeight: 18,
    color: Colors.textMuted,
    textAlign: 'center',
  },
  footnote: {
    marginTop: Spacing[4],
    textAlign: 'center',
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    color: Colors.textMuted,
  },
});
