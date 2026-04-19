import { ScrollView, StyleSheet, Text, View } from 'react-native';
import SafeScreen from '@/components/ui/SafeScreen';
import Header from '@/components/layout/Header';
import Card from '@/components/ui/Card';
import { useWater } from '@/hooks/useWater';
import { Colors, withOpacity } from '@/constants/colors';
import { FontSize, FontFamily, Spacing, Radius } from '@/constants/theme';

export default function WaterHistoryScreen() {
  const { weeklyData, history, goal, hourlyDistribution } = useWater();
  const maxVal = Math.max(...weeklyData.map((day) => day.total), goal, 1);
  const maxHour = Math.max(...hourlyDistribution.buckets.map((bucket) => bucket.totalMl), 1);

  return (
    <SafeScreen>
      <Header title="Historial de agua" showBack color={Colors.water} />

      <ScrollView showsVerticalScrollIndicator={false}>
        <Card style={styles.chartCard}>
          <Text style={styles.chartTitle}>Ultimos 7 dias</Text>
          <View style={styles.bars}>
            {weeklyData.map((day) => {
              const pct = Math.min(100, (day.total / maxVal) * 100);
              const isToday = day.date === new Date().toISOString().split('T')[0];
              const reachedGoal = day.total >= goal;
              const dayLabel = new Date(`${day.date}T12:00:00`).toLocaleDateString('es', { weekday: 'short' });

              return (
                <View key={day.date} style={styles.barWrap}>
                  <Text style={styles.barValue}>
                    {day.total >= 1000 ? `${(day.total / 1000).toFixed(1)}L` : `${day.total}ml`}
                  </Text>
                  <View style={styles.barTrack}>
                    <View style={[styles.goalLine, { bottom: `${(goal / maxVal) * 100}%` }]} />
                    <View
                      style={[
                        styles.barFill,
                        {
                          height: `${pct}%`,
                          backgroundColor: reachedGoal ? Colors.water : `${Colors.water}66`,
                        },
                      ]}
                    />
                  </View>
                  <Text style={[styles.barDay, isToday && { color: Colors.water, fontFamily: FontFamily.bold }]}>
                    {isToday ? 'Hoy' : dayLabel}
                  </Text>
                </View>
              );
            })}
          </View>
          <View style={styles.chartLegend}>
            <View style={[styles.legendDot, { backgroundColor: Colors.water }]} />
            <Text style={styles.legendText}>Meta diaria: {goal}ml</Text>
          </View>
        </Card>

        <Card style={styles.distributionCard}>
          <Text style={styles.chartTitle}>Cuando tomas mas agua</Text>
          <View style={styles.distributionList}>
            {hourlyDistribution.buckets.map((bucket) => (
              <View key={bucket.label} style={styles.distributionRow}>
                <Text style={styles.distributionLabel}>{bucket.label}</Text>
                <View style={styles.distributionTrack}>
                  <View
                    style={[
                      styles.distributionFill,
                      { width: `${Math.max(8, (bucket.totalMl / maxHour) * 100)}%` },
                    ]}
                  />
                </View>
                <Text style={styles.distributionValue}>{bucket.totalMl}ml</Text>
              </View>
            ))}
          </View>
          {hourlyDistribution.valley ? (
            <Text style={styles.valleyText}>
              Sueles tomar menos agua entre {hourlyDistribution.valley.label}. Ese es tu valle habitual.
            </Text>
          ) : (
            <Text style={styles.valleyText}>
              Cuando sumes mas historial, aqui vas a ver en que franja se te cae la hidratacion.
            </Text>
          )}
        </Card>

        <View style={styles.statsRow}>
          <StatCard
            label="Promedio semanal"
            value={weeklyData.length ? `${Math.round(weeklyData.reduce((sum, day) => sum + day.total, 0) / weeklyData.length)}ml` : '0ml'}
            emoji="AG"
          />
          <StatCard
            label="Dias con meta"
            value={`${weeklyData.filter((day) => day.total >= goal).length}/${weeklyData.length}`}
            emoji="OK"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Registros recientes</Text>
          {history.slice(0, 30).map((log, index) => (
            <View key={index} style={styles.historyItem}>
              <Text style={styles.historyDate}>
                {new Date(log.logged_at).toLocaleDateString('es', {
                  day: 'numeric',
                  month: 'short',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Text>
              <Text style={[styles.historyAmount, { color: Colors.water }]}>+{log.amount_ml}ml</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeScreen>
  );
}

function StatCard({ label, value, emoji }: { label: string; value: string; emoji: string }) {
  return (
    <Card style={styles.statCard}>
      <Text style={styles.statEmoji}>{emoji}</Text>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  chartCard: { marginBottom: Spacing[4] },
  chartTitle: { fontFamily: FontFamily.bold, fontSize: FontSize.base, color: Colors.textPrimary, marginBottom: Spacing[4] },
  bars: { flexDirection: 'row', gap: Spacing[2], height: 160, alignItems: 'flex-end', marginBottom: Spacing[3] },
  barWrap: { flex: 1, alignItems: 'center', gap: Spacing[1] },
  barValue: { fontFamily: FontFamily.regular, fontSize: 9, color: Colors.textMuted, textAlign: 'center' },
  barTrack: {
    width: '100%',
    flex: 1,
    backgroundColor: Colors.bgElevated,
    borderRadius: Radius.sm,
    overflow: 'hidden',
    position: 'relative',
    justifyContent: 'flex-end',
  },
  goalLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1.5,
    backgroundColor: Colors.water,
    opacity: 0.5,
    zIndex: 1,
  },
  barFill: { borderRadius: Radius.sm },
  barDay: { fontFamily: FontFamily.medium, fontSize: 9, color: Colors.textMuted },
  chartLegend: { flexDirection: 'row', alignItems: 'center', gap: Spacing[2] },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { fontFamily: FontFamily.regular, fontSize: FontSize.xs, color: Colors.textMuted },
  distributionCard: {
    marginBottom: Spacing[4],
    gap: Spacing[3],
    borderWidth: 1,
    borderColor: withOpacity(Colors.water, 0.18),
    backgroundColor: withOpacity(Colors.water, 0.06),
  },
  distributionList: {
    gap: Spacing[2],
  },
  distributionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[2],
  },
  distributionLabel: {
    width: 46,
    fontFamily: FontFamily.medium,
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
  },
  distributionTrack: {
    flex: 1,
    height: 8,
    borderRadius: Radius.full,
    backgroundColor: Colors.bgElevated,
    overflow: 'hidden',
  },
  distributionFill: {
    height: '100%',
    borderRadius: Radius.full,
    backgroundColor: Colors.water,
  },
  distributionValue: {
    width: 48,
    textAlign: 'right',
    fontFamily: FontFamily.medium,
    fontSize: FontSize.xs,
    color: Colors.textMuted,
  },
  valleyText: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    lineHeight: FontSize.sm * 1.5,
  },
  statsRow: { flexDirection: 'row', gap: Spacing[3], marginBottom: Spacing[4] },
  statCard: { flex: 1, alignItems: 'center', paddingVertical: Spacing[4] },
  statEmoji: { fontSize: 16, marginBottom: Spacing[2], color: Colors.textMuted },
  statValue: { fontFamily: FontFamily.bold, fontSize: FontSize.xl, color: Colors.textPrimary, marginBottom: Spacing[1] },
  statLabel: { fontFamily: FontFamily.regular, fontSize: FontSize.xs, color: Colors.textMuted, textAlign: 'center' },
  section: { marginBottom: Spacing[6] },
  sectionTitle: { fontFamily: FontFamily.bold, fontSize: FontSize.base, color: Colors.textPrimary, marginBottom: Spacing[3] },
  historyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing[2.5],
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  historyDate: { fontFamily: FontFamily.regular, fontSize: FontSize.sm, color: Colors.textSecondary },
  historyAmount: { fontFamily: FontFamily.semibold, fontSize: FontSize.sm },
});
