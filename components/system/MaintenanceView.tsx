import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import SafeScreen from '@/components/ui/SafeScreen';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { Colors } from '@/constants/colors';
import { FontFamily, Spacing, Radius } from '@/constants/theme';

interface MaintenanceViewProps {
  onRetry?: () => void;
  lastCheckedAt?: number | null;
  error?: string | null;
  compact?: boolean;
}

function formatLastChecked(value?: number | null) {
  if (!value) return 'Recien';
  return new Date(value).toLocaleTimeString('es-AR', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

export default function MaintenanceView({
  onRetry,
  lastCheckedAt,
  error,
  compact = false,
}: MaintenanceViewProps) {
  return (
    <SafeScreen>
      <View style={styles.container}>
        <Card style={styles.card} accentColor={Colors.warning}>
          <View style={styles.heroRow}>
            <View style={styles.iconWrap}>
              <Ionicons name="construct" size={28} color={Colors.warning} />
            </View>
            <View style={styles.heroBadge}>
              <Ionicons name="pulse" size={13} color={Colors.warning} />
              <Text style={styles.heroBadgeText}>Servicio pausado</Text>
            </View>
          </View>
          <Text style={styles.eyebrow}>Estado del servicio</Text>
          <Text style={styles.title}>Estamos en mantenimiento</Text>
          <Text style={styles.subtitle}>
            El backend no responde por ahora. Tus registros offline siguen guardados y se
            sincronizan cuando vuelva la senal.
          </Text>
          <View style={styles.bulletList}>
            <View style={styles.bulletRow}>
              <Ionicons name="shield-checkmark" size={14} color={Colors.warning} />
              <Text style={styles.bulletItem}>Tus datos locales siguen seguros.</Text>
            </View>
            <View style={styles.bulletRow}>
              <Ionicons name="sync" size={14} color={Colors.warning} />
              <Text style={styles.bulletItem}>La app retomara el sync cuando el servicio vuelva.</Text>
            </View>
          </View>
          {error ? <Text style={styles.errorText}>Detalle: {error}</Text> : null}
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Ultimo chequeo</Text>
            <Text style={styles.metaValue}>{formatLastChecked(lastCheckedAt)}</Text>
          </View>
          {onRetry ? (
            <Button
              label="Reintentar"
              onPress={onRetry}
              size="primary"
              variant="primary"
              fullWidth
            />
          ) : null}
        </Card>
        {!compact ? (
          <Text style={styles.footnote}>
            Si el problema persiste, revisa la pagina de estado o intenta mas tarde.
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
  card: {
    gap: Spacing[4],
    paddingVertical: Spacing[5],
  },
  heroRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing[3],
  },
  eyebrow: {
    fontFamily: FontFamily.semibold,
    fontSize: 12,
    color: Colors.warning,
    letterSpacing: 0.2,
    
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: `${Colors.warning}18`,
  },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[1.5],
    paddingHorizontal: Spacing[3],
    paddingVertical: 7,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: `${Colors.warning}38`,
    backgroundColor: `${Colors.warning}12`,
  },
  heroBadgeText: {
    fontFamily: FontFamily.semibold,
    fontSize: 12,
    color: Colors.warning,
  },
  title: {
    fontFamily: FontFamily.bold,
    fontSize: 20,
    color: Colors.textPrimary,
  },
  subtitle: {
    fontFamily: FontFamily.regular,
    fontSize: 14,
    lineHeight: 20,
    color: Colors.textSecondary,
  },
  bulletList: {
    gap: Spacing[1.5],
    padding: Spacing[3],
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.bgElevated,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing[2],
  },
  bulletItem: {
    flex: 1,
    fontFamily: FontFamily.medium,
    fontSize: 13,
    lineHeight: 18,
    color: Colors.textPrimary,
  },
  errorText: {
    fontFamily: FontFamily.regular,
    fontSize: 12,
    color: Colors.textMuted,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing[2],
    paddingHorizontal: Spacing[3],
    borderRadius: Radius.lg,
    backgroundColor: Colors.bgElevated,
  },
  metaLabel: {
    fontFamily: FontFamily.regular,
    fontSize: 12,
    color: Colors.textMuted,
  },
  metaValue: {
    fontFamily: FontFamily.semibold,
    fontSize: 12,
    color: Colors.textPrimary,
    flexShrink: 0,
  },
  footnote: {
    marginTop: Spacing[4],
    textAlign: 'center',
    fontFamily: FontFamily.regular,
    fontSize: 12,
    color: Colors.textMuted,
  },
});
