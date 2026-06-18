/**
 * VYRA Fitness - Weight Tracking Tab
 * Display weight logs, BMI with disclaimer, and body composition trends
 */

import React, { useRef } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import SafeScreen from '@/components/ui/SafeScreen';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import ScreenFooterSpacer from '@/components/ui/ScreenFooterSpacer';
import { Colors, withOpacity } from '@/constants/colors';
import { FontFamily, FontSize, Spacing } from '@/constants/theme';
import { useWeight } from '@/hooks/useWeight';
import { formatWeight } from '@/utils/formatters';
import { useUIStore } from '@/stores/uiStore';

export default function WeightScreen() {
  const scrollViewRef = useRef<ScrollView>(null);
  const showToast = useUIStore((state) => state.showToast);
  const { logs, stats } = useWeight();

  const lastLog = logs.length ? logs[logs.length - 1] : null;
  const weightKg = lastLog?.weight_kg ?? 0;
  const bodyFatPct = lastLog?.body_fat_pct ?? null;
  const bmi = stats.bmi ?? 0;

  const bmiCategory = bmi < 18.5 ? 'Bajo' : bmi < 25 ? 'Normal' : bmi < 30 ? 'Sobrepeso' : 'Obesidad';
  const bmiColor =
    bmi < 18.5 ? Colors.warning :
    bmi < 25 ? Colors.success :
    bmi < 30 ? Colors.warning :
    Colors.error;

  const trend = logs.length >= 2
    ? logs[logs.length - 1]!.weight_kg - logs[logs.length - 2]!.weight_kg
    : 0;

  const handleLogWeight = () => {
    showToast('Abre settings para loguear peso, o desliza el peso para editar.', 'info');
  };

  return (
    <SafeScreen>
      <ScrollView
        ref={scrollViewRef}
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
        refreshControl={undefined}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Peso</Text>
          <Pressable onPress={handleLogWeight} hitSlop={8}>
            <Ionicons name="add-circle" size={28} color={Colors.action} />
          </Pressable>
        </View>

        {/* Current Weight Card */}
        <Card style={styles.card}>
          <View style={styles.currentWeightContainer}>
            <View>
              <Text style={styles.label}>Peso actual</Text>
              <Text style={styles.largeValue}>
                {formatWeight(weightKg)}
              </Text>
              {trend !== 0 && (
                <Text style={[styles.trendText, trend > 0 ? styles.trendUp : styles.trendDown]}>
                  {trend > 0 ? '↑' : '↓'} {Math.abs(trend).toFixed(1)} kg
                </Text>
              )}
            </View>
            {bodyFatPct !== null && (
              <View>
                <Text style={styles.label}>Grasa corporal</Text>
                <Text style={styles.largeValue}>
                  {bodyFatPct.toFixed(1)}%
                </Text>
              </View>
            )}
          </View>
        </Card>

        {/* BMI Card with Disclaimer */}
        <Card style={styles.card}>
          <View style={styles.bmiContainer}>
            <View style={styles.bmiContent}>
              <Text style={styles.label}>IMC</Text>
              <Text style={[styles.largeValue, { color: bmiColor }]}>
                {bmi.toFixed(1)}
              </Text>
              <Text style={styles.bmiCategory}>{bmiCategory}</Text>
            </View>
          </View>
          {/* NEW: BMI Disclaimer */}
          <View style={styles.disclaimer}>
            <Ionicons name="information-circle" size={16} color={Colors.warning} />
            <Text style={styles.disclaimerText}>
              El IMC no cuenta la masa muscular. Si entrenas regularmente, tu IMC puede ser alto pero tu composición corporal ser excelente. {bodyFatPct !== null ? 'Tu % de grasa corporal es más preciso.' : 'Log grasa corporal para datos más precisos.'}
            </Text>
          </View>
        </Card>

        {/* Recent Logs */}
        {logs.length > 0 && (
          <Card style={styles.card}>
            <Text style={styles.sectionTitle}>Histórico reciente</Text>
            <View style={styles.logList}>
              {logs.slice(-5).reverse().map((log, idx) => (
                <View key={log.id} style={[styles.logItem, idx < 4 && styles.logItemBorder]}>
                  <View>
                    <Text style={styles.logDate}>
                      {new Date(log.logged_at).toLocaleDateString('es-ES', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </Text>
                    {log.note && <Text style={styles.logNote}>{log.note}</Text>}
                  </View>
                  <Text style={styles.logWeight}>{formatWeight(log.weight_kg)}</Text>
                </View>
              ))}
            </View>
          </Card>
        )}

        {/* Empty State */}
        {logs.length === 0 && (
          <Card style={[styles.card, styles.emptyCard]}>
            <View style={styles.emptyContent}>
              <Ionicons name="scale-outline" size={48} color={withOpacity(Colors.text, 0.4)} />
              <Text style={styles.emptyTitle}>Sin registros</Text>
              <Text style={styles.emptySubtitle}>
                Comienza a registrar tu peso para ver tendencias
              </Text>
              <Button
                label="Registrar peso"
                onPress={handleLogWeight}
                variant="primary"
                style={styles.logButton}
              />
            </View>
          </Card>
        )}

        <ScreenFooterSpacer />
      </ScrollView>
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    gap: Spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  title: {
    fontSize: FontSize['2xl'],
    fontFamily: FontFamily.bold,
    color: Colors.text,
  },
  card: {
    gap: Spacing.md,
  },
  currentWeightContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  label: {
    fontSize: FontSize.sm,
    fontFamily: FontFamily.medium,
    color: withOpacity(Colors.text, 0.6),
    marginBottom: Spacing.xs,
  },
  largeValue: {
    fontSize: FontSize['3xl'],
    fontFamily: FontFamily.bold,
    color: Colors.text,
  },
  trendText: {
    fontSize: FontSize.sm,
    fontFamily: FontFamily.medium,
    marginTop: Spacing.xs,
  },
  trendUp: {
    color: Colors.error,
  },
  trendDown: {
    color: Colors.success,
  },
  bmiContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bmiContent: {
    flex: 1,
  },
  bmiCategory: {
    fontSize: FontSize.sm,
    fontFamily: FontFamily.medium,
    color: withOpacity(Colors.text, 0.6),
    marginTop: Spacing.xs,
  },
  disclaimer: {
    flexDirection: 'row',
    gap: Spacing.sm,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: withOpacity(Colors.border, 0.3),
  },
  disclaimerText: {
    flex: 1,
    fontSize: FontSize.xs,
    fontFamily: FontFamily.regular,
    color: withOpacity(Colors.text, 0.7),
    lineHeight: 16,
  },
  sectionTitle: {
    fontSize: FontSize.lg,
    fontFamily: FontFamily.semibold,
    color: Colors.text,
  },
  logList: {
    gap: 0,
  },
  logItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.md,
  },
  logItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: withOpacity(Colors.border, 0.2),
  },
  logDate: {
    fontSize: FontSize.sm,
    fontFamily: FontFamily.medium,
    color: withOpacity(Colors.text, 0.7),
  },
  logNote: {
    fontSize: FontSize.xs,
    fontFamily: FontFamily.regular,
    color: withOpacity(Colors.text, 0.5),
    marginTop: Spacing.xs,
  },
  logWeight: {
    fontSize: FontSize.lg,
    fontFamily: FontFamily.semibold,
    color: Colors.text,
  },
  emptyCard: {
    minHeight: 300,
  },
  emptyContent: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.md,
  },
  emptyTitle: {
    fontSize: FontSize.lg,
    fontFamily: FontFamily.semibold,
    color: Colors.text,
  },
  emptySubtitle: {
    fontSize: FontSize.sm,
    fontFamily: FontFamily.regular,
    color: withOpacity(Colors.text, 0.6),
    textAlign: 'center',
  },
  logButton: {
    marginTop: Spacing.md,
  },
});
