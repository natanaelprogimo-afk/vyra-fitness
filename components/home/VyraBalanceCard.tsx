import { Pressable, StyleSheet, Text, View } from 'react-native';
import AnimatedNumber from '@/components/ui/AnimatedNumber';
import GlowRing, { type GlowRingState } from '@/components/ui/GlowRing';
import { Colors, withOpacity } from '@/constants/colors';
import { FontFamily, FontSize, Radius, Spacing } from '@/constants/theme';
import type { DailyScore } from '@/hooks/useReadiness';
import {
  buildVyraBalanceTopContributions,
  getVyraBalanceMessage,
} from '@/lib/vyra-balance';

function scoreState(score: number): GlowRingState {
  if (score <= 0) return 'empty';
  if (score > 90) return 'excellent';
  if (score >= 75) return 'complete';
  return 'active';
}

interface VyraBalanceCardProps {
  score: DailyScore | null;
  loading?: boolean;
  onPress?: () => void;
  hidden?: boolean;
  stepsPct?: number;
}

export default function VyraBalanceCard({
  score,
  loading = false,
  onPress,
  hidden = false,
  stepsPct,
}: VyraBalanceCardProps) {
  if (hidden) return null;

  const total = score?.score ?? 0;
  const breakdownEntries = buildVyraBalanceTopContributions(score, stepsPct, 3);

  return (
    <Pressable
      disabled={!onPress}
      onPress={onPress}
      accessibilityRole={onPress ? 'button' : undefined}
      accessibilityLabel={
        score
          ? `VYRA Balance de hoy, ${Math.round(total)} puntos`
          : 'VYRA Balance de hoy, sin datos suficientes todavia'
      }
      accessibilityHint={
        onPress ? 'Abre el detalle del balance y sus factores de hoy.' : undefined
      }
      accessibilityState={{ busy: loading, disabled: !onPress }}
      hitSlop={8}
      style={[styles.card, loading && styles.cardLoading]}
    >
      <Text style={styles.eyebrow}>VYRA BALANCE HOY</Text>
      <View style={styles.heroRow}>
        <GlowRing
          value={total}
          size={144}
          strokeWidth={10}
          state={scoreState(total)}
          pulse={Boolean(score && total > 0 && total < 100)}
        >
          {score ? (
            <AnimatedNumber
              value={Math.round(total)}
              duration={800}
              style={styles.scoreValue}
              formatFn={(value) => String(Math.round(value))}
            />
          ) : (
            <Text style={styles.scoreValue}>-</Text>
          )}
        </GlowRing>

        <View style={styles.copy}>
          <Text style={styles.title}>VYRA Balance</Text>
          <Text style={styles.body}>
            {score ? getVyraBalanceMessage(total) : 'Sin datos suficientes todavía.'}
          </Text>
          {score ? (
            <View style={styles.breakdownRow}>
              {breakdownEntries.map((item) => (
                <View key={item.key} style={styles.breakdownPill}>
                  <Text style={styles.breakdownLabel}>{item.label}</Text>
                  <Text style={styles.breakdownValue}>
                    {Math.round(item.score)}/{item.max}
                  </Text>
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.emptyPrompt}>
              <Text style={styles.emptyPromptText}>Registrar hoy</Text>
            </View>
          )}
        </View>
      </View>
      <Text style={styles.disclaimer}>
        Escuchá siempre cómo te sentís vos. Esto es solo una guía.
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Radius['3xl'],
    borderWidth: 1,
    borderColor: withOpacity(Colors.white, 0.08),
    backgroundColor: Colors.bgSurface,
    padding: Spacing[5],
    gap: Spacing[4],
    minHeight: 180,
  },
  cardLoading: {
    opacity: 0.9,
  },
  eyebrow: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.xs,
    letterSpacing: 1.8,
    color: Colors.textMuted,
  },
  heroRow: {
    flexDirection: 'row',
    gap: Spacing[4],
    alignItems: 'center',
  },
  copy: {
    flex: 1,
    gap: Spacing[2],
  },
  title: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.xl,
    color: Colors.textPrimary,
  },
  scoreValue: {
    fontFamily: FontFamily.black,
    fontSize: FontSize['3xl'],
    lineHeight: FontSize['3xl'],
    color: Colors.action,
    letterSpacing: -3,
  },
  body: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    lineHeight: 20,
    color: Colors.textSecondary,
  },
  breakdownRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing[2],
    marginTop: Spacing[1],
  },
  breakdownPill: {
    borderRadius: Radius.full,
    backgroundColor: Colors.bgElevated,
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[2],
    gap: 2,
  },
  breakdownLabel: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.xs,
    color: Colors.textMuted,
  },
  breakdownValue: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.sm,
    color: Colors.textPrimary,
  },
  emptyPrompt: {
    alignSelf: 'flex-start',
    borderRadius: Radius.full,
    backgroundColor: Colors.actionBg,
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[2],
  },
  emptyPromptText: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.xs,
    color: Colors.action,
  },
  disclaimer: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    lineHeight: 18,
  },
});
