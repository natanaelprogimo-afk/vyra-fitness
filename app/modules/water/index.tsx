// ============================================================
// VYRA FITNESS — Módulo Agua: Pantalla Principal
// Ring de progreso, botones rápidos, lista de logs del día
// ============================================================

import { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import SafeScreen from '@/components/ui/SafeScreen';
import Header from '@/components/layout/Header';
import ProgressCircle from '@/components/charts/ProgressCircle';
import AnimatedNumber from '@/components/ui/AnimatedNumber';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import EmptyState from '@/components/ui/EmptyState';
import Skeleton, { ListSkeleton } from '@/components/ui/Skeleton';
import { useWater } from '@/hooks/useWater';
import { Colors } from '@/constants/colors';
import { FontSize, FontFamily, Spacing, Radius } from '@/constants/theme';
import { DRINK_TYPES } from '@/constants/modules';
import { formatTime, formatRelativeDate } from '@/utils/formatters';
import type { DrinkTypeId } from '@/types/modules';

// Cantidades rápidas en ml
const QUICK_AMOUNTS = [150, 250, 350, 500] as const;

export default function WaterScreen() {
  const {
    logs, totalHydro, goal, progressPct, remaining,
    hydrationAlert, isLoading, isLogging, logWater, deleteLog,
  } = useWater();

  const [selectedDrink, setSelectedDrink] = useState<DrinkTypeId>('water');
  const dropScale = useSharedValue(1);

  const handleQuickAdd = (ml: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    dropScale.value = withSequence(
      withSpring(1.3, { damping: 6, stiffness: 300 }),
      withSpring(1.0, { damping: 12 })
    );
    logWater(ml, selectedDrink);
  };

  const dropStyle = useAnimatedStyle(() => ({
    transform: [{ scale: dropScale.value }],
  }));

  const drink = DRINK_TYPES.find(d => d.id === selectedDrink);

  return (
    <SafeScreen padHorizontal={false} padBottom>
      <Header
        title="Hidratación"
        showBack
        color={Colors.water}
        rightAction={
          <Pressable onPress={() => router.push('/modules/water/history' as any)} style={styles.historyBtn}>
            <Text style={styles.historyText}>Historial</Text>
          </Pressable>
        }
      />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>

        {/* Ring principal */}
        <View style={styles.ringSection}>
          <ProgressCircle
            value={progressPct}
            size={200}
            strokeWidth={14}
            color={Colors.water}
            trackColor={Colors.bgElevated}
            animated
            duration={1000}
          >
            <Animated.View style={[styles.dropWrap, dropStyle]}>
              <Text style={styles.dropEmoji}>💧</Text>
            </Animated.View>
            <AnimatedNumber
              value={totalHydro}
              style={styles.ringTotal}
            />
            <Text style={styles.ringGoal}>de {goal}ml</Text>
            <Text style={[styles.ringPct, { color: Colors.water }]}>{Math.round(progressPct)}%</Text>
          </ProgressCircle>

          {remaining > 0 && (
            <Text style={styles.remaining}>
              Faltan <Text style={{ color: Colors.water, fontFamily: FontFamily.bold }}>{remaining}ml</Text> para tu meta
            </Text>
          )}
          {remaining === 0 && (
            <Text style={[styles.remaining, { color: Colors.steps }]}>
              ¡Meta alcanzada! 🎉
            </Text>
          )}
        </View>

        {/* Alerta de hidratación */}
        {hydrationAlert && (
          <Card style={[styles.alertCard, { borderColor: `${Colors.warning}44` }]}>
            <Text style={styles.alertText}>{hydrationAlert}</Text>
          </Card>
        )}

        {/* Selector de bebida */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tipo de bebida</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.drinkRow}>
            {DRINK_TYPES.map((d) => (
              <Pressable
                key={d.id}
                onPress={() => setSelectedDrink(d.id as DrinkTypeId)}
                style={[
                  styles.drinkChip,
                  selectedDrink === d.id && { borderColor: Colors.water, backgroundColor: `${Colors.water}15` },
                ]}
              >
                <Text style={styles.drinkEmoji}>{d.emoji}</Text>
                <Text style={[styles.drinkLabel, selectedDrink === d.id && { color: Colors.water }]}>
                  {d.label}
                </Text>
                {d.factor < 1 && (
                  <Text style={styles.drinkFactor}>{Math.round(d.factor * 100)}%</Text>
                )}
              </Pressable>
            ))}
          </ScrollView>
        </View>

        {/* Botones de cantidad rápida */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Agregar rápido</Text>
          <View style={styles.quickRow}>
            {QUICK_AMOUNTS.map((ml) => (
              <Pressable
                key={ml}
                onPress={() => handleQuickAdd(ml)}
                disabled={isLogging}
                style={[styles.quickBtn, isLogging && styles.quickBtnDisabled]}
              >
                <Text style={styles.quickEmoji}>{drink?.emoji ?? '💧'}</Text>
                <Text style={styles.quickMl}>{ml}ml</Text>
              </Pressable>
            ))}
          </View>
          <Button
            onPress={() => router.push('/modules/water/custom' as any)}
            variant="secondary"
            fullWidth
            style={styles.customBtn}
            size="sm"
          >
            Cantidad personalizada
          </Button>
        </View>

        {/* Lista de logs del día */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Hoy ({logs.length} registros)</Text>
          {isLoading ? (
            <ListSkeleton count={3} />
          ) : logs.length === 0 ? (
            <EmptyState
              emoji="💧"
              title="Sin registros hoy"
              subtitle="Tocá cualquier botón de arriba para empezar"
              compact
            />
          ) : (
            <View style={styles.logList}>
              {[...logs].reverse().map((log) => (
                <WaterLogItem
                  key={log.id}
                  log={log}
                  onDelete={() => deleteLog(log.id)}
                />
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeScreen>
  );
}

// ─── WaterLogItem ─────────────────────────────────────────
function WaterLogItem({
  log,
  onDelete,
}: {
  log: { id: string; amount_ml: number; drink_type: string; hydration_equivalent_ml: number; logged_at: string };
  onDelete: () => void;
}) {
  const drink = DRINK_TYPES.find(d => d.id === log.drink_type) ?? DRINK_TYPES[0];

  return (
    <View style={styles.logItem}>
      <Text style={styles.logEmoji}>{drink.emoji}</Text>
      <View style={styles.logInfo}>
        <Text style={styles.logLabel}>{drink.label}</Text>
        <Text style={styles.logTime}>{formatTime(new Date(log.logged_at))}</Text>
      </View>
      <Text style={[styles.logAmount, { color: Colors.water }]}>+{log.amount_ml}ml</Text>
      {log.hydration_equivalent_ml !== log.amount_ml && (
        <Text style={styles.logHydro}>≈{log.hydration_equivalent_ml}ml agua</Text>
      )}
      <Pressable onPress={onDelete} style={styles.logDelete} hitSlop={12}>
        <Text style={styles.logDeleteText}>✕</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: Spacing[5],
    paddingBottom:     Spacing[10],
  },

  // Header
  historyBtn:  { paddingHorizontal: Spacing[2] },
  historyText: { fontFamily: FontFamily.medium, fontSize: FontSize.sm, color: Colors.water },

  // Ring
  ringSection: {
    alignItems:    'center',
    paddingVertical: Spacing[6],
  },
  dropWrap:  { marginBottom: Spacing[1] },
  dropEmoji: { fontSize: 28 },
  ringTotal: {
    fontFamily: FontFamily.bold,
    fontSize:   FontSize['3xl'],
    color:      Colors.water,
    lineHeight: FontSize['3xl'] * 1.1,
  },
  ringGoal: {
    fontFamily: FontFamily.regular,
    fontSize:   FontSize.sm,
    color:      Colors.textMuted,
  },
  ringPct: {
    fontFamily: FontFamily.bold,
    fontSize:   FontSize.base,
    marginTop:  Spacing[1],
  },
  remaining: {
    fontFamily: FontFamily.regular,
    fontSize:   FontSize.sm,
    color:      Colors.textSecondary,
    marginTop:  Spacing[3],
  },

  // Alert
  alertCard: {
    borderWidth:   1,
    marginBottom:  Spacing[4],
    padding:       Spacing[3],
    backgroundColor: Colors.warningBg,
  },
  alertText: {
    fontFamily: FontFamily.medium,
    fontSize:   FontSize.sm,
    color:      Colors.warning,
    lineHeight: FontSize.sm * 1.5,
  },

  // Sections
  section:      { marginBottom: Spacing[6] },
  sectionTitle: {
    fontFamily:   FontFamily.bold,
    fontSize:     FontSize.base,
    color:        Colors.textPrimary,
    marginBottom: Spacing[3],
  },

  // Drink selector
  drinkRow:  { gap: Spacing[2], paddingVertical: Spacing[1] },
  drinkChip: {
    alignItems:      'center',
    paddingVertical: Spacing[2],
    paddingHorizontal: Spacing[3],
    borderRadius:    Radius.xl,
    borderWidth:     1.5,
    borderColor:     Colors.border,
    backgroundColor: Colors.bgSurface,
    minWidth:        70,
  },
  drinkEmoji:  { fontSize: 20, marginBottom: 2 },
  drinkLabel:  { fontFamily: FontFamily.medium, fontSize: 10, color: Colors.textSecondary, textAlign: 'center' },
  drinkFactor: { fontFamily: FontFamily.regular, fontSize: 9, color: Colors.textMuted, marginTop: 1 },

  // Quick buttons
  quickRow: {
    flexDirection:  'row',
    gap:            Spacing[3],
    marginBottom:   Spacing[3],
  },
  quickBtn: {
    flex:            1,
    alignItems:      'center',
    paddingVertical: Spacing[4],
    backgroundColor: `${Colors.water}15`,
    borderRadius:    Radius.xl,
    borderWidth:     1.5,
    borderColor:     `${Colors.water}44`,
  },
  quickBtnDisabled: { opacity: 0.5 },
  quickEmoji: { fontSize: 24, marginBottom: Spacing[1] },
  quickMl: {
    fontFamily: FontFamily.bold,
    fontSize:   FontSize.sm,
    color:      Colors.water,
  },
  customBtn: { borderColor: Colors.water },

  // Log list
  logList: { gap: Spacing[2] },
  logItem: {
    flexDirection:   'row',
    alignItems:      'center',
    backgroundColor: Colors.bgSurface,
    borderRadius:    Radius.lg,
    padding:         Spacing[3],
    gap:             Spacing[2],
    borderWidth:     1,
    borderColor:     Colors.border,
  },
  logEmoji:      { fontSize: 20 },
  logInfo:       { flex: 1 },
  logLabel:      { fontFamily: FontFamily.semibold, fontSize: FontSize.sm, color: Colors.textPrimary },
  logTime:       { fontFamily: FontFamily.regular, fontSize: FontSize.xs, color: Colors.textMuted, marginTop: 1 },
  logAmount:     { fontFamily: FontFamily.bold, fontSize: FontSize.sm },
  logHydro:      { fontFamily: FontFamily.regular, fontSize: FontSize.xs, color: Colors.textMuted },
  logDelete:     { padding: Spacing[1] },
  logDeleteText: { fontFamily: FontFamily.bold, fontSize: FontSize.sm, color: Colors.textMuted },
});