import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import SafeScreen from '@/components/ui/SafeScreen';
import { Header } from '@/components/layout/Header';
import Card from '@/components/ui/Card';
import { Colors } from '@/constants/colors';
import { Spacing, Radius, FontFamily } from '@/constants/theme';
import { useWeight } from '@/hooks/useWeight';
import { WeightMiniChart } from './components/WeightMiniChart';
import EmptyState from '@/components/ui/EmptyState';

type Period = 30 | 60 | 90;

export default function WeightHistoryScreen() {
  const { logs, stats, loading, getChartData, deleteLog } = useWeight();
  const [period, setPeriod] = useState<Period>(30);

  const chartData = getChartData(period);

  return (
    <SafeScreen padHorizontal={false} padBottom>
      <Header title="Historial de peso" showBack color={Colors.weight} />

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Selector período */}
        <View style={styles.periodRow}>
          {([30, 60, 90] as Period[]).map((p) => (
            <TouchableOpacity
              key={p}
              style={[styles.periodBtn, period === p && styles.periodBtnActive]}
              onPress={() => setPeriod(p)}
            >
              <Text style={[styles.periodLabel, period === p && styles.periodLabelActive]}>
                {p} días
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Gráfico */}
        {chartData.length > 1 ? (
          <Card style={styles.chartCard}>
            <WeightMiniChart data={chartData} color={Colors.weight} />
          </Card>
        ) : (
          <EmptyState
            icon="⚖️"
            title="Sin datos suficientes"
            description={`Registrá más pesajes para ver el gráfico de ${period} días`}
          />
        )}

        {/* Stats resumen */}
        {logs.length > 0 && (
          <Card>
            <Text style={styles.sectionTitle}>Resumen</Text>
            <View style={styles.statsGrid}>
              <StatItem label="Máximo" value={`${Math.max(...logs.map(l => l.weight_kg)).toFixed(1)} kg`} />
              <StatItem label="Mínimo" value={`${Math.min(...logs.map(l => l.weight_kg)).toFixed(1)} kg`} />
              <StatItem label="Promedio" value={`${(logs.reduce((s, l) => s + l.weight_kg, 0) / logs.length).toFixed(1)} kg`} />
              <StatItem label="Registros" value={`${logs.length}`} />
            </View>
          </Card>
        )}

        {/* Lista de logs */}
        <Card>
          <Text style={styles.sectionTitle}>Todos los registros</Text>
          {logs.length === 0 ? (
            <EmptyState
              icon="⚖️"
              title="Sin registros aún"
              description="Registrá tu peso desde la pantalla principal"
            />
          ) : (
            logs.map((log) => (
              <View key={log.id} style={styles.logItem}>
                <View style={styles.logLeft}>
                  <Text style={styles.logWeight}>{log.weight_kg.toFixed(1)} kg</Text>
                  {log.body_fat_pct && (
                    <Text style={styles.logFat}>{log.body_fat_pct}% grasa</Text>
                  )}
                </View>
                <View style={styles.logRight}>
                  <Text style={styles.logDate}>
                    {new Date(log.logged_at).toLocaleDateString('es-AR', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </Text>
                  {log.note && (
                    <Text style={styles.logNote} numberOfLines={1}>{log.note}</Text>
                  )}
                </View>
              </View>
            ))
          )}
        </Card>
      </ScrollView>
    </SafeScreen>
  );
}

function StatItem({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.statItem}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingHorizontal: Spacing[5],
    paddingBottom: Spacing[10],
    gap: Spacing[4],
    paddingTop: Spacing[4],
  },
  periodRow: {
    flexDirection: 'row',
    backgroundColor: Colors.bgSurface,
    borderRadius: Radius.full,
    padding: 4,
  },
  periodBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: Radius.full,
  },
  periodBtnActive: {
    backgroundColor: Colors.weight,
  },
  periodLabel: {
    fontFamily: FontFamily.medium,
    fontSize: 14,
    color: Colors.textSecondary,
  },
  periodLabelActive: {
    color: '#fff',
  },
  chartCard: {
    paddingVertical: Spacing[3],
  },
  sectionTitle: {
    fontFamily: FontFamily.bold,
    fontSize: 16,
    color: Colors.textPrimary,
    marginBottom: Spacing[3],
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing[3],
  },
  statItem: {
    flex: 1,
    minWidth: '40%',
    alignItems: 'center',
    backgroundColor: Colors.bgElevated,
    borderRadius: Radius.lg,
    padding: Spacing[3],
  },
  statValue: {
    fontFamily: FontFamily.bold,
    fontSize: 18,
    color: Colors.weight,
  },
  statLabel: {
    fontFamily: FontFamily.regular,
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  logItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  logLeft: {
    gap: 2,
  },
  logWeight: {
    fontFamily: FontFamily.bold,
    fontSize: 18,
    color: Colors.textPrimary,
  },
  logFat: {
    fontFamily: FontFamily.regular,
    fontSize: 12,
    color: Colors.textSecondary,
  },
  logRight: {
    alignItems: 'flex-end',
    gap: 2,
  },
  logDate: {
    fontFamily: FontFamily.medium,
    fontSize: 13,
    color: Colors.textSecondary,
  },
  logNote: {
    fontFamily: FontFamily.regular,
    fontSize: 12,
    color: Colors.textMuted,
    maxWidth: 150,
  },
});