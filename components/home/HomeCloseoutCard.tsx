import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Card from '@/components/ui/Card';
import { Colors, withOpacity } from '@/constants/colors';
import { FontFamily, FontSize, Radius, Spacing } from '@/constants/theme';

interface HomeCloseoutCardProps {
  score: number | null;
  weeklyAverage: number | null;
  streakInDanger: boolean;
  timeLeftLabel: string;
  claimableCount: number;
  dailyMissionReady: boolean;
  dailyMissionRewardXp: number;
  dailyMissionRewardCoins: number;
  onPrimaryAction: () => void;
  onOpenSummary: () => void;
  onOpenProgress: () => void;
}

export default function HomeCloseoutCard({
  score,
  weeklyAverage,
  streakInDanger,
  timeLeftLabel,
  claimableCount,
  dailyMissionReady,
  dailyMissionRewardXp,
  dailyMissionRewardCoins,
  onPrimaryAction,
  onOpenSummary,
  onOpenProgress,
}: HomeCloseoutCardProps) {
  const accent = streakInDanger ? Colors.error : dailyMissionReady ? Colors.coins : Colors.brand;
  const title = streakInDanger ? 'No cierres en rojo' : 'Cierre del día';
  const body = streakInDanger
    ? `Todavía puedes salvar hoy si haces una acción útil en ${timeLeftLabel}. Luego entra al resumen para ver cómo quedó tu día.`
    : dailyMissionReady
    ? `Tu misión quedó lista. Reclama +${dailyMissionRewardCoins} coins y +${dailyMissionRewardXp} XP antes de cerrar el día.`
    : 'Abre tu resumen diario para ver score, tendencia y lo que conviene ajustar antes de mañana.';
  const primaryLabel = streakInDanger ? 'Salvar y revisar' : dailyMissionReady ? 'Reclamar y cerrar' : 'Abrir resumen';

  return (
    <Card style={styles.card} accentColor={accent}>
      <View style={styles.header}>
        <View style={styles.headerCopy}>
          <Text style={[styles.eyebrow, { color: accent }]}>Puente de retorno</Text>
          <Text style={styles.title}>{title}</Text>
        </View>

        <View
          style={[
            styles.badge,
            {
              borderColor: withOpacity(accent, 0.26),
              backgroundColor: withOpacity(accent, 0.14),
            },
          ]}
        >
          <Ionicons
            name={streakInDanger ? 'warning-outline' : dailyMissionReady ? 'gift-outline' : 'analytics-outline'}
            size={15}
            color={accent}
          />
          <Text style={[styles.badgeText, { color: accent }]}> 
            {streakInDanger ? timeLeftLabel : dailyMissionReady ? 'Reward ready' : 'Resumen'}
          </Text>
        </View>
      </View>

      <Text style={styles.body}>{body}</Text>

      <View style={styles.metricsRow}>
        <View style={styles.metricCard}>
          <Text style={styles.metricValue}>{score != null ? Math.round(score) : '--'}</Text>
          <Text style={styles.metricLabel}>Score hoy</Text>
        </View>
        <View style={styles.metricCard}>
          <Text style={styles.metricValue}>{claimableCount}</Text>
          <Text style={styles.metricLabel}>Claimables</Text>
        </View>
        <View style={styles.metricCard}>
          <Text style={styles.metricValue}>{weeklyAverage != null ? Math.round(weeklyAverage) : '--'}</Text>
          <Text style={styles.metricLabel}>Prom. semana</Text>
        </View>
      </View>

      <View style={styles.signalCard}>
        <View style={styles.signalRow}>
          <Ionicons name="sparkles-outline" size={15} color={Colors.brandLight} />
          <Text style={styles.signalText}>
            {dailyMissionReady
              ? 'Tu recompensa diaria ya está lista y conviene reclamarla antes de salir.'
              : claimableCount > 0
              ? `Tienes ${claimableCount} recompensa${claimableCount === 1 ? '' : 's'} esperando en tu loop.`
              : 'Aunque no reclames nada hoy, abrir el resumen te ayuda a no perder dirección mañana.'}
          </Text>
        </View>
      </View>

      <View style={styles.actions}>
        <Pressable
          style={[
            styles.primaryPill,
            {
              borderColor: withOpacity(accent, 0.26),
              backgroundColor: withOpacity(accent, 0.14),
            },
          ]}
          onPress={onPrimaryAction}
        >
          <Ionicons
            name={streakInDanger ? 'flash' : dailyMissionReady ? 'gift-outline' : 'analytics-outline'}
            size={15}
            color={accent}
          />
          <Text style={[styles.primaryPillText, { color: accent }]}>{primaryLabel}</Text>
        </Pressable>

        <Pressable style={styles.secondaryPill} onPress={onOpenSummary}>
          <Ionicons name="reader-outline" size={14} color={Colors.brandLight} />
          <Text style={styles.secondaryPillText}>Resumen</Text>
        </Pressable>

        <Pressable style={styles.secondaryPill} onPress={onOpenProgress}>
          <Ionicons name="bar-chart-outline" size={14} color={Colors.warning} />
          <Text style={styles.secondaryPillText}>Progreso</Text>
        </Pressable>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: Spacing[4],
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing[3],
  },
  headerCopy: {
    flex: 1,
    gap: 4,
  },
  eyebrow: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.xs,
  },
  title: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.xl,
    color: Colors.textPrimary,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: Radius.full,
    borderWidth: 1,
    paddingHorizontal: Spacing[3],
    paddingVertical: 8,
  },
  badgeText: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.xs,
  },
  body: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.base,
    lineHeight: 22,
    color: Colors.textSecondary,
  },
  metricsRow: {
    flexDirection: 'row',
    gap: Spacing[2],
  },
  metricCard: {
    flex: 1,
    borderRadius: Radius['2xl'],
    borderWidth: 1,
    borderColor: withOpacity(Colors.white, 0.08),
    backgroundColor: withOpacity(Colors.surface2, 0.92),
    padding: Spacing[4],
    gap: 6,
  },
  metricValue: {
    fontFamily: FontFamily.display,
    fontSize: FontSize['2xl'],
    color: Colors.textPrimary,
    letterSpacing: -0.8,
  },
  metricLabel: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
  },
  signalCard: {
    borderRadius: Radius['2xl'],
    borderWidth: 1,
    borderColor: withOpacity(Colors.brandLight, 0.14),
    backgroundColor: withOpacity(Colors.brandLight, 0.06),
    padding: Spacing[4],
  },
  signalRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing[2],
  },
  signalText: {
    flex: 1,
    fontFamily: FontFamily.medium,
    fontSize: FontSize.sm,
    lineHeight: 20,
    color: Colors.textSecondary,
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing[2],
  },
  primaryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[2],
    borderRadius: Radius.full,
    borderWidth: 1,
    paddingHorizontal: Spacing[3],
    paddingVertical: 10,
  },
  primaryPillText: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.xs,
  },
  secondaryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[2],
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: withOpacity(Colors.white, 0.08),
    backgroundColor: Colors.glassLight,
    paddingHorizontal: Spacing[3],
    paddingVertical: 10,
  },
  secondaryPillText: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.xs,
    color: Colors.textPrimary,
  },
});
