// REDESIGNED: 2026-05-23 — maintenance state made calmer and more informative
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
        <View style={styles.glow} pointerEvents="none" />

        <Card style={styles.card}>
          <View style={styles.headerRow}>
            <View style={styles.iconWrap}>
              <Ionicons name="construct-outline" size={34} color={withOpacity(Colors.brand, 0.78)} />
            </View>
            <View style={styles.titleWrap}>
              <Text style={styles.eyebrow}>Mantenimiento</Text>
              <Text style={styles.title}>Volvemos en breve</Text>
            </View>
          </View>

          <Text style={styles.subtitle}>
            Estamos ajustando una parte del sistema. Tus datos siguen ahi y la app deberia volver a
            alinearse apenas termine esta ventana.
          </Text>

          <View style={styles.metaRow}>
            <View style={styles.metaPill}>
              <Text style={styles.metaText}>Ultimo chequeo {formatLastChecked(lastCheckedAt)}</Text>
            </View>
            <View style={styles.metaPill}>
              <Text style={styles.metaText}>Sin perdida de datos local</Text>
            </View>
          </View>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          {onRetry ? (
            <Button onPress={handleRetry} disabled={retryCooldown > 0} fullWidth color={Colors.brand}>
              {retryCooldown > 0 ? `Reintentar en ${retryCooldown}s` : 'Reintentar'}
            </Button>
          ) : null}
        </Card>

        {!compact ? (
          <View style={styles.footnoteCard}>
            <Text style={styles.footnoteTitle}>Que queda estable mientras tanto</Text>
            <Text style={styles.footnote}>
              Si estabas usando agua, sueño, peso, nutrición o workout, lo local sigue ahí. Solo
              falta que el sistema vuelva y termine de alinear el resto.
            </Text>
          </View>
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
    gap: Spacing[4],
  },
  glow: {
    position: 'absolute',
    top: 80,
    right: 20,
    width: 220,
    height: 220,
    borderRadius: Radius.full,
    backgroundColor: withOpacity(Colors.brand, 0.08),
  },
  card: {
    gap: Spacing[4],
    borderColor: withOpacity(Colors.white, 0.05),
    backgroundColor: withOpacity(Colors.surface1, 0.9),
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[3],
  },
  iconWrap: {
    width: 64,
    height: 64,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: withOpacity(Colors.brand, 0.06),
    borderWidth: 1,
    borderColor: withOpacity(Colors.brand, 0.1),
  },
  titleWrap: {
    flex: 1,
    gap: 4,
  },
  eyebrow: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.xs,
    color: Colors.brand,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  title: {
    fontFamily: FontFamily.display,
    fontSize: 28,
    lineHeight: 32,
    color: Colors.textPrimary,
  },
  subtitle: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.base,
    lineHeight: 24,
    color: Colors.textSecondary,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing[2],
  },
  metaPill: {
    minHeight: 30,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing[3],
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
  },
  footnoteCard: {
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: withOpacity(Colors.white, 0.05),
    backgroundColor: withOpacity(Colors.surface1, 0.76),
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[4],
    gap: Spacing[2],
  },
  footnoteTitle: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.sm,
    color: Colors.textPrimary,
  },
  footnote: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    lineHeight: 18,
    color: Colors.textMuted,
  },
});
