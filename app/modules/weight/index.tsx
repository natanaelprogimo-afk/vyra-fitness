import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import SafeScreen from '@/components/ui/SafeScreen';
import { Header } from '@/components/layout/Header';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import AnimatedNumber from '@/components/ui/AnimatedNumber';
import Skeleton from '@/components/ui/Skeleton';
import { Colors } from '@/constants/colors';
import { Spacing, Radius, FontFamily } from '@/constants/theme';
import { useWeight } from '@/hooks/useWeight';
import { WeightLogSheet } from '@/components/log/WeightLogSheet';
import { WeightMiniChart } from './components/WeightMiniChart';
import { BmiGauge } from './components/BmiGauge';
import { NewMinConfetti } from './components/NewMinConfetti';

const { width } = Dimensions.get('window');

export default function WeightScreen() {
  const { stats, logs, loading, logWeight, getChartData } = useWeight();
  const [showLog, setShowLog] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  // Animación badge nuevo mínimo
  const badgeScale = useSharedValue(0);
  const badgeStyle = useAnimatedStyle(() => ({
    transform: [{ scale: badgeScale.value }],
  }));

  const handleLog = useCallback(
    async (weightKg: number, bodyFatPct?: number, note?: string) => {
      setShowLog(false);
      const { isNewMin } = await logWeight(weightKg, bodyFatPct, note);

      if (isNewMin) {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setShowConfetti(true);
        badgeScale.value = withSequence(
          withSpring(1.3, { damping: 5 }),
          withSpring(1.0, { damping: 8 }),
        );
        setTimeout(() => setShowConfetti(false), 3000);
      } else {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
    },
    [logWeight],
  );

  if (loading) {
    return (
      <SafeScreen padHorizontal={false} padBottom>
        <Header title="Peso" showBack color={Colors.weight} />
        <ScrollView contentContainerStyle={styles.scroll}>
          <Skeleton height={160} style={styles.skeletonCard} />
          <Skeleton height={120} style={styles.skeletonCard} />
          <Skeleton height={200} style={styles.skeletonCard} />
        </ScrollView>
      </SafeScreen>
    );
  }

  const chartData = getChartData(30);

  return (
    <SafeScreen padHorizontal={false} padBottom>
      <Header title="Peso" showBack color={Colors.weight} />
      {showConfetti && <NewMinConfetti />}

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Peso actual */}
        <Card style={styles.mainCard}>
          <View style={styles.mainRow}>
            <View style={styles.mainLeft}>
              <Text style={styles.mainLabel}>Peso actual</Text>
              {stats.current ? (
                <View style={styles.weightRow}>
                  <AnimatedNumber
                    value={stats.current}
                    style={styles.mainWeight}
                    decimals={1}
                  />
                  <Text style={styles.unit}>kg</Text>
                </View>
              ) : (
                <Text style={styles.mainWeightEmpty}>—</Text>
              )}

              {stats.isNewMin && (
                <Animated.View style={[styles.newMinBadge, badgeStyle]}>
                  <Text style={styles.newMinText}>🏆 ¡Nuevo mínimo!</Text>
                </Animated.View>
              )}

              {stats.trend && (
                <View style={styles.trendRow}>
                  <Text style={styles.trendIcon}>
                    {stats.trend === 'down' ? '📉' : stats.trend === 'up' ? '📈' : '➡️'}
                  </Text>
                  <Text style={styles.trendText}>
                    {stats.trend === 'down'
                      ? 'Tendencia bajando'
                      : stats.trend === 'up'
                      ? 'Tendencia subiendo'
                      : 'Peso estable'}
                  </Text>
                </View>
              )}
            </View>

            {stats.goal && (
              <View style={styles.goalBox}>
                <Text style={styles.goalLabel}>Meta</Text>
                <Text style={styles.goalValue}>{stats.goal} kg</Text>
                {stats.toGoal !== null && (
                  <Text style={[styles.toGoal, { color: stats.toGoal > 0 ? Colors.warning : Colors.success }]}>
                    {stats.toGoal > 0 ? `Faltan ${stats.toGoal} kg` : '¡Alcanzaste la meta!'}
                  </Text>
                )}
              </View>
            )}
          </View>

          <Button
            label="+ Registrar peso"
            onPress={() => setShowLog(true)}
            color={Colors.weight}
            style={styles.logBtn}
          />
        </Card>

        {/* Progreso */}
        {stats.totalLost !== null && Math.abs(stats.totalLost) > 0 && (
          <Card style={styles.progressCard}>
            <Text style={styles.sectionTitle}>Desde que empezaste</Text>
            <View style={styles.progressRow}>
              <View style={styles.progressItem}>
                <Text style={styles.progressValue}>
                  {stats.totalLost > 0 ? `-${stats.totalLost}` : `+${Math.abs(stats.totalLost)}`} kg
                </Text>
                <Text style={styles.progressLabel}>
                  {stats.totalLost > 0 ? 'Perdidos' : 'Ganados'}
                </Text>
              </View>
              {stats.start && (
                <View style={styles.progressItem}>
                  <Text style={styles.progressValue}>{stats.start} kg</Text>
                  <Text style={styles.progressLabel}>Inicial</Text>
                </View>
              )}
              <View style={styles.progressItem}>
                <Text style={styles.progressValue}>{logs.length}</Text>
                <Text style={styles.progressLabel}>Registros</Text>
              </View>
            </View>
          </Card>
        )}

        {/* BMI */}
        {stats.bmi && (
          <Card style={styles.bmiCard}>
            <Text style={styles.sectionTitle}>Índice de masa corporal</Text>
            <BmiGauge bmi={stats.bmi} category={stats.bmiCategory} />
            <Text style={styles.bmiDisclaimer}>
              ℹ️ El IMC es una estimación. Para diagnóstico médico consultá a tu médico.
            </Text>
          </Card>
        )}

        {/* Gráfico */}
        {chartData.length > 1 && (
          <Card style={styles.chartCard}>
            <View style={styles.chartHeader}>
              <Text style={styles.sectionTitle}>Últimos 30 días</Text>
              <TouchableOpacity onPress={() => router.push('/modules/weight/history' as any)}>
                <Text style={styles.seeAll}>Ver todo →</Text>
              </TouchableOpacity>
            </View>
            <WeightMiniChart data={chartData} color={Colors.weight} />
          </Card>
        )}

        {/* Fotos progreso */}
        <Card style={styles.photosCard}>
          <Text style={styles.sectionTitle}>Fotos de progreso</Text>
          <TouchableOpacity
            onPress={() => router.push('/modules/weight/photos' as any)}
            style={styles.photosBtn}
          >
            <Text style={styles.photosBtnIcon}>📸</Text>
            <Text style={styles.photosBtnText}>Ver mis fotos de progreso</Text>
            <Text style={styles.photosBtnArrow}>→</Text>
          </TouchableOpacity>
        </Card>
      </ScrollView>

      <WeightLogSheet
        visible={showLog}
        onClose={() => setShowLog(false)}
        onSave={handleLog}
        currentWeight={stats.current}
      />
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingHorizontal: Spacing[5],
    paddingBottom: Spacing[10],
    gap: Spacing[4],
    paddingTop: Spacing[4],
  },
  skeletonCard: {
    borderRadius: Radius.xl,
    marginBottom: Spacing[3],
  },
  mainCard: {
    gap: Spacing[4],
  },
  mainRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  mainLeft: {
    flex: 1,
    gap: Spacing[2],
  },
  mainLabel: {
    fontFamily: FontFamily.medium,
    fontSize: 14,
    color: Colors.textSecondary,
  },
  weightRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: Spacing[1],
  },
  mainWeight: {
    fontFamily: FontFamily.bold,
    fontSize: 48,
    color: Colors.weight,
  },
  mainWeightEmpty: {
    fontFamily: FontFamily.bold,
    fontSize: 48,
    color: Colors.textMuted,
  },
  unit: {
    fontFamily: FontFamily.medium,
    fontSize: 20,
    color: Colors.textSecondary,
  },
  newMinBadge: {
    backgroundColor: `${Colors.coins}22`,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[1],
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: Colors.coins,
  },
  newMinText: {
    fontFamily: FontFamily.bold,
    fontSize: 13,
    color: Colors.coins,
  },
  trendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[1],
  },
  trendIcon: { fontSize: 16 },
  trendText: {
    fontFamily: FontFamily.medium,
    fontSize: 13,
    color: Colors.textSecondary,
  },
  goalBox: {
    alignItems: 'center',
    backgroundColor: `${Colors.weight}15`,
    borderRadius: Radius.lg,
    padding: Spacing[3],
    minWidth: 90,
  },
  goalLabel: {
    fontFamily: FontFamily.medium,
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  goalValue: {
    fontFamily: FontFamily.bold,
    fontSize: 22,
    color: Colors.weight,
  },
  toGoal: {
    fontFamily: FontFamily.medium,
    fontSize: 11,
    marginTop: 2,
    textAlign: 'center',
  },
  logBtn: {
    marginTop: Spacing[2],
  },
  progressCard: {},
  sectionTitle: {
    fontFamily: FontFamily.bold,
    fontSize: 16,
    color: Colors.textPrimary,
    marginBottom: Spacing[3],
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  progressItem: {
    alignItems: 'center',
    gap: Spacing[1],
  },
  progressValue: {
    fontFamily: FontFamily.bold,
    fontSize: 22,
    color: Colors.textPrimary,
  },
  progressLabel: {
    fontFamily: FontFamily.regular,
    fontSize: 13,
    color: Colors.textSecondary,
  },
  bmiCard: {},
  bmiDisclaimer: {
    fontFamily: FontFamily.regular,
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: Spacing[3],
    textAlign: 'center',
  },
  chartCard: {},
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing[3],
  },
  seeAll: {
    fontFamily: FontFamily.medium,
    fontSize: 13,
    color: Colors.weight,
  },
  photosCard: {},
  photosBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[3],
    backgroundColor: Colors.bgElevated,
    borderRadius: Radius.lg,
    padding: Spacing[4],
  },
  photosBtnIcon: { fontSize: 24 },
  photosBtnText: {
    flex: 1,
    fontFamily: FontFamily.medium,
    fontSize: 15,
    color: Colors.textPrimary,
  },
  photosBtnArrow: {
    fontFamily: FontFamily.bold,
    fontSize: 16,
    color: Colors.textMuted,
  },
});