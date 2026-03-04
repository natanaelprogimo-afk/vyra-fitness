import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import Svg, { Polyline, Circle, Line, Text as SvgText } from 'react-native-svg';
import { router } from 'expo-router';
import SafeScreen from '@/components/ui/SafeScreen';
import { Header } from '@/components/layout/Header';
import Card from '@/components/ui/Card';
import ProgressBar from '@/components/ui/ProgressBar';
import PremiumLock from '@/components/ui/PremiumLock';
import { Colors } from '@/constants/colors';
import { FontFamily, Spacing, Radius } from '@/constants/theme';
import { useReadiness, ScoreHistory } from '@/hooks/useReadiness';
import { useBadges } from '@/hooks/useBadges';
import { useAuthStore } from '@/stores/authStore';

type Period = '7' | '30' | '90';

// Gráfico de línea de scores históricos
function ScoreLineChart({
  data,
  period,
}: {
  data:   ScoreHistory[];
  period: Period;
}) {
  const W = 340;
  const H = 120;
  const PAD = { top: 16, bottom: 24, left: 8, right: 8 };

  if (!data || data.length < 2) {
    return (
      <View style={chartStyles.empty}>
        <Text style={chartStyles.emptyText}>
          Registrá actividad en los módulos para ver tu gráfico aquí.
        </Text>
      </View>
    );
  }

  const sorted = [...data].reverse(); // cronológico
  const scores = sorted.map((d) => d.total_score);
  const minS = Math.min(...scores, 0);
  const maxS = Math.max(...scores, 100);
  const range = maxS - minS || 1;

  const toX = (i: number) =>
    PAD.left + (i / (sorted.length - 1)) * (W - PAD.left - PAD.right);
  const toY = (v: number) =>
    PAD.top + (1 - (v - minS) / range) * (H - PAD.top - PAD.bottom);

  const points = sorted.map((d, i) => `${toX(i)},${toY(d.total_score)}`).join(' ');
  const avg = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);

  // Labels de fechas: primero, medio, último
  const labelIdxs = [0, Math.floor(sorted.length / 2), sorted.length - 1];
  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return `${d.getDate()}/${d.getMonth() + 1}`;
  };

  return (
    <View>
      <Svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={chartStyles.svg}>
        {/* Línea del promedio */}
        <Line
          x1={PAD.left}
          y1={toY(avg)}
          x2={W - PAD.right}
          y2={toY(avg)}
          stroke={Colors.textMuted}
          strokeWidth={1}
          strokeDasharray="4 4"
        />
        {/* Línea de datos */}
        <Polyline
          points={points}
          fill="none"
          stroke={Colors.brand}
          strokeWidth={2.5}
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        {/* Puntos */}
        {sorted.map((d, i) => (
          <Circle
            key={i}
            cx={toX(i)}
            cy={toY(d.total_score)}
            r={3}
            fill={d.total_score >= 80 ? Colors.success : d.total_score >= 60 ? Colors.warning : Colors.error}
          />
        ))}
        {/* Etiquetas de fecha */}
        {labelIdxs.map((idx) => (
          sorted[idx] && (
            <SvgText
              key={idx}
              x={toX(idx)}
              y={H - 4}
              fontSize={10}
              fill={Colors.textMuted}
              textAnchor="middle"
            >
              {formatDate(sorted[idx].date)}
            </SvgText>
          )
        ))}
      </Svg>
      <Text style={chartStyles.avgLabel}>Promedio: {avg} pts</Text>
    </View>
  );
}

const chartStyles = StyleSheet.create({
  svg: { alignSelf: 'center' },
  avgLabel: {
    fontFamily: FontFamily.regular,
    fontSize: 12,
    color: Colors.textMuted,
    textAlign: 'right',
    marginTop: 4,
  },
  empty: {
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontFamily: FontFamily.regular,
    fontSize: 13,
    color: Colors.textMuted,
    textAlign: 'center',
  },
});

export default function ProgressScreen() {
  const { profile } = useAuthStore();
  const {
    dailyScore,
    history,
    loading,
    refreshing,
    refresh,
    scoreColor,
    calculate,
  } = useReadiness();
  const { getProgress, unlockedBadges, allBadges } = useBadges();

  const [period, setPeriod] = useState<Period>('7');

  // Filtrar historial por período
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - parseInt(period));
  const filteredHistory = history.filter(
    (h) => new Date(h.date) >= cutoff,
  );

  // Calcular tendencia (últimos 7 vs previos 7)
  const last7  = history.slice(0, 7).map((h) => h.total_score);
  const prev7  = history.slice(7, 14).map((h) => h.total_score);
  const avg7   = last7.length  ? Math.round(last7.reduce((a, b) => a + b, 0)  / last7.length)  : 0;
  const avgP7  = prev7.length  ? Math.round(prev7.reduce((a, b) => a + b, 0)  / prev7.length)  : 0;
  const delta  = avg7 - avgP7;

  const badgeProgress = getProgress();
  const recentBadges  = unlockedBadges.slice(0, 3);

  // Score de hoy por módulo
  const breakdown = dailyScore?.breakdown;
  const moduleRows = breakdown
    ? [
        { label: '💧 Agua',      value: breakdown.hydration, color: Colors.water },
        { label: '🚶 Actividad', value: breakdown.activity,  color: Colors.steps },
        { label: '😴 Sueño',     value: breakdown.sleep,     color: Colors.sleep },
        { label: '🍎 Nutrición', value: breakdown.nutrition, color: Colors.nutrition },
        { label: '🧠 Mental',    value: breakdown.mental,    color: Colors.mental },
      ]
    : [];

  return (
    <SafeScreen padHorizontal={false} padBottom={false}>
      <Header title="Progreso" color={Colors.brand} />

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refresh}
            tintColor={Colors.brand}
            colors={[Colors.brand]}
          />
        }
      >
        {/* Score del día - resumen */}
        <Card style={styles.todayCard}>
          <View style={styles.todayHeader}>
            <View>
              <Text style={styles.todayLabel}>Score de hoy</Text>
              <Text style={[styles.todayScore, { color: scoreColor(dailyScore?.score ?? 0) }]}>
                {dailyScore?.score ?? '—'}
              </Text>
            </View>
            {delta !== 0 && (
              <View style={styles.trend}>
                <Text style={[styles.trendArrow, { color: delta > 0 ? Colors.success : Colors.error }]}>
                  {delta > 0 ? '↑' : '↓'}
                </Text>
                <Text style={[styles.trendValue, { color: delta > 0 ? Colors.success : Colors.error }]}>
                  {Math.abs(delta)} pts
                </Text>
                <Text style={styles.trendLabel}>vs sem. anterior</Text>
              </View>
            )}
          </View>

          {/* Breakdown por módulo */}
          {moduleRows.map((row, i) => (
            <View key={i} style={styles.moduleRow}>
              <Text style={styles.moduleLabel}>{row.label}</Text>
              <ProgressBar value={row.value} color={row.color} height={6} style={styles.moduleBar} />
              <Text style={[styles.moduleValue, { color: row.color }]}>{row.value}</Text>
            </View>
          ))}

          {!breakdown && !loading && (
            <Text style={styles.noBreakdown}>
              Completá actividad en los módulos para ver el detalle.
            </Text>
          )}
        </Card>

        {/* Gráfico de historial */}
        <Card>
          <View style={styles.chartHeader}>
            <Text style={styles.sectionTitle}>Historial de readiness</Text>
            <View style={styles.periodRow}>
              {(['7', '30', '90'] as Period[]).map((p) => (
                <TouchableOpacity
                  key={p}
                  style={[
                    styles.periodPill,
                    period === p && styles.periodPillActive,
                  ]}
                  onPress={() => { setPeriod(p); refresh(); }}
                >
                  <Text style={[
                    styles.periodText,
                    period === p && styles.periodTextActive,
                  ]}>
                    {p}d
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          <ScoreLineChart data={filteredHistory} period={period} />
        </Card>

        {/* Tendencias premium */}
        <PremiumLock feature="correlaciones" trigger="progress_trends">
          <Card>
            <Text style={styles.sectionTitle}>Correlaciones avanzadas</Text>
            <Text style={styles.correlationExample}>
              Tus mejores días (score ≥80) coinciden con dormir &gt;7h y tomar &gt;2.5L de agua.
            </Text>
          </Card>
        </PremiumLock>

        {/* Badges recientes */}
        <Card>
          <View style={styles.badgesHeader}>
            <Text style={styles.sectionTitle}>Badges</Text>
            <TouchableOpacity onPress={() => router.push('/gamification/badges' as any)}>
              <Text style={styles.seeAll}>Ver todos →</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.badgeProgressRow}>
            <ProgressBar value={badgeProgress.pct} color={Colors.coins} height={8} style={{ flex: 1 }} />
            <Text style={styles.badgeProgressCount}>
              {badgeProgress.unlocked}/{badgeProgress.total}
            </Text>
          </View>
          {recentBadges.length > 0 ? (
            <View style={styles.recentBadges}>
              {recentBadges.map((ub) => {
                const def = allBadges.find((b) => b.id === ub.badge_id);
                if (!def) return null;
                return (
                  <View key={ub.badge_id} style={styles.recentBadge}>
                    <Text style={styles.recentBadgeEmoji}>{def.emoji}</Text>
                    <View>
                      <Text style={styles.recentBadgeName}>{def.name}</Text>
                      <Text style={styles.recentBadgeDate}>
                        {new Date(ub.unlocked_at).toLocaleDateString('es-AR')}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>
          ) : (
            <Text style={styles.noBreakdown}>Completá desafíos para desbloquear badges 🏆</Text>
          )}
        </Card>

        {/* Ir a la tienda */}
        <TouchableOpacity
          style={styles.storeBtn}
          onPress={() => router.push('/store/shop' as any)}
        >
          <Text style={styles.storeBtnText}>🛒 Ir a la tienda de coins</Text>
        </TouchableOpacity>

        <View style={styles.bottomPad} />
      </ScrollView>
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingHorizontal: Spacing[5],
    paddingTop: Spacing[4],
    gap: Spacing[4],
  },
  todayCard: { gap: Spacing[3] },
  todayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  todayLabel: {
    fontFamily: FontFamily.regular,
    fontSize: 14,
    color: Colors.textSecondary,
  },
  todayScore: {
    fontFamily: FontFamily.bold,
    fontSize: 52,
    lineHeight: 60,
  },
  trend: { alignItems: 'flex-end', gap: 2 },
  trendArrow: {
    fontFamily: FontFamily.bold,
    fontSize: 28,
    lineHeight: 32,
  },
  trendValue: {
    fontFamily: FontFamily.bold,
    fontSize: 16,
  },
  trendLabel: {
    fontFamily: FontFamily.regular,
    fontSize: 11,
    color: Colors.textMuted,
  },
  moduleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[2],
  },
  moduleLabel: {
    fontFamily: FontFamily.regular,
    fontSize: 13,
    color: Colors.textSecondary,
    width: 100,
  },
  moduleBar: { flex: 1 },
  moduleValue: {
    fontFamily: FontFamily.bold,
    fontSize: 12,
    width: 28,
    textAlign: 'right',
  },
  noBreakdown: {
    fontFamily: FontFamily.regular,
    fontSize: 13,
    color: Colors.textMuted,
    textAlign: 'center',
    paddingVertical: Spacing[3],
  },
  sectionTitle: {
    fontFamily: FontFamily.bold,
    fontSize: 16,
    color: Colors.textPrimary,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing[3],
  },
  periodRow: {
    flexDirection: 'row',
    gap: Spacing[1],
  },
  periodPill: {
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[1],
    borderRadius: Radius.full,
    backgroundColor: Colors.bgElevated,
  },
  periodPillActive: { backgroundColor: Colors.brand },
  periodText: {
    fontFamily: FontFamily.medium,
    fontSize: 12,
    color: Colors.textMuted,
  },
  periodTextActive: { color: '#fff' },
  correlationExample: {
    fontFamily: FontFamily.regular,
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
    marginTop: Spacing[2],
  },
  badgesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing[3],
  },
  seeAll: {
    fontFamily: FontFamily.medium,
    fontSize: 14,
    color: Colors.brand,
  },
  badgeProgressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[3],
    marginBottom: Spacing[3],
  },
  badgeProgressCount: {
    fontFamily: FontFamily.bold,
    fontSize: 14,
    color: Colors.coins,
  },
  recentBadges: { gap: Spacing[3] },
  recentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[3],
  },
  recentBadgeEmoji: { fontSize: 32 },
  recentBadgeName: {
    fontFamily: FontFamily.bold,
    fontSize: 14,
    color: Colors.textPrimary,
  },
  recentBadgeDate: {
    fontFamily: FontFamily.regular,
    fontSize: 12,
    color: Colors.textMuted,
  },
  storeBtn: {
    backgroundColor: `${Colors.coins}15`,
    borderRadius: Radius.xl,
    padding: Spacing[4],
    alignItems: 'center',
    borderWidth: 1,
    borderColor: `${Colors.coins}40`,
  },
  storeBtnText: {
    fontFamily: FontFamily.bold,
    fontSize: 16,
    color: Colors.coins,
  },
  bottomPad: { height: 100 },
});