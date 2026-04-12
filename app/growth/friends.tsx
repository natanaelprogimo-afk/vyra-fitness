import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import SafeScreen from '@/components/ui/SafeScreen';
import { Header } from '@/components/layout/Header';
import Card from '@/components/ui/Card';
import EmptyState from '@/components/ui/EmptyState';
import AsyncStateView from '@/components/ui/AsyncStateView';
import Skeleton from '@/components/ui/Skeleton';
import { Colors, withOpacity } from '@/constants/colors';
import { FontFamily, FontSize, Radius, Spacing } from '@/constants/theme';
import { getFriendsLeaderboard, type FriendsLeaderboardResponse, type FriendsRange } from '@/services/backend/friends';
import { useLoadingTimeout } from '@/hooks/useLoadingTimeout';

function PodiumCard({ label, name, steps, accent }: { label: string; name: string; steps: number | string; accent: string }) {
  return (
    <View style={[styles.podiumCard, { borderColor: withOpacity(accent, 0.24) }]}>
      <Text style={[styles.podiumLabel, { color: accent }]}>{label}</Text>
      <Text style={styles.podiumName} numberOfLines={1}>{name}</Text>
      <Text style={styles.podiumValue}>{typeof steps === 'number' ? steps.toLocaleString() : steps}</Text>
    </View>
  );
}

export default function FriendsLeaderboardScreen() {
  const [range, setRange] = useState<FriendsRange>('week');
  const [data, setData] = useState<FriendsLeaderboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);
  const hasTimedOut = useLoadingTimeout(loading, 8000);

  const loadLeaderboard = useCallback(async (nextRange: FriendsRange) => {
    setLoading(true);
    setLoadFailed(false);
    const payload = await getFriendsLeaderboard(nextRange);
    setData(payload);
    setLoadFailed(!payload);
    setLoading(false);
  }, []);

  useEffect(() => {
    void loadLeaderboard(range);
  }, [loadLeaderboard, range]);

  const entries = data?.leaderboard ?? [];
  const topThree = entries.slice(0, 3);
  const yourEntry = useMemo(() => entries.find((entry) => entry.isYou) ?? null, [entries]);
  const leader = topThree[0] ?? null;
  const showLoading = loading && !hasTimedOut;
  const showErrorState = !showLoading && (loadFailed || hasTimedOut);

  return (
    <SafeScreen padHorizontal={false} padBottom>
      <Header title="Amigos" subtitle="Ranking social y ritmo compartido" showBack color={Colors.coins} />

      <AsyncStateView
        analyticsKey="growth_friends"
        loading={showLoading}
        hasError={showErrorState}
        loadingView={(
          <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
            <Skeleton height={230} style={styles.skeleton} />
            <Skeleton height={180} style={styles.skeleton} />
            <Skeleton height={260} style={styles.skeleton} />
          </ScrollView>
        )}
        errorView={(
          <EmptyState
            emoji="TOP"
            eyebrow="Ranking no cargo a tiempo"
            title="No pudimos abrir tus amigos"
            subtitle="Reintenta y volvemos a consultar el leaderboard, tus pasos y el podio compartido."
            ctaLabel="Reintentar"
            onCta={() => void loadLeaderboard(range)}
            tone="premium"
            style={styles.fullState}
          />
        )}
      >
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <Card style={styles.heroCard} accentColor={Colors.coins}>
            <View style={styles.heroHeader}>
              <View style={styles.heroCopy}>
                <Text style={styles.eyebrow}>{range === 'week' ? 'Semana en juego' : 'Mes en juego'}</Text>
                <Text style={styles.heroTitle}>{leader ? `${leader.name} va primero` : 'Todavia no hay lider'}</Text>
                <Text style={styles.heroBody}>
                  Este ranking convierte invitaciones en constancia real: ves quien viene fuerte, donde estas tu y cuanto margen tienes para moverte hoy.
                </Text>
              </View>
              <View style={styles.heroBadge}>
                <Ionicons name="trophy-outline" size={22} color={Colors.coins} />
              </View>
            </View>

            <View style={styles.rangeRow}>
              {(['week', 'month'] as FriendsRange[]).map((value) => {
                const active = range === value;
                return (
                  <TouchableOpacity key={value} onPress={() => setRange(value)} style={[styles.rangePill, active && styles.rangePillActive]}>
                    <Text style={[styles.rangePillText, active && styles.rangePillTextActive]}>{value === 'week' ? 'Semana' : 'Mes'}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={styles.heroStats}>
              <View style={styles.heroStatCard}>
                <Text style={styles.heroStatValue}>{data?.friendCount ?? 0}</Text>
                <Text style={styles.heroStatLabel}>amigos visibles</Text>
              </View>
              <View style={styles.heroStatCard}>
                <Text style={styles.heroStatValue}>{yourEntry ? `#${yourEntry.rank}` : '--'}</Text>
                <Text style={styles.heroStatLabel}>tu puesto</Text>
              </View>
              <View style={styles.heroStatCard}>
                <Text style={styles.heroStatValue}>{leader ? leader.steps.toLocaleString() : '--'}</Text>
                <Text style={styles.heroStatLabel}>pasos del lider</Text>
              </View>
            </View>
          </Card>

          {topThree.length > 0 ? (
            <Card>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Podio actual</Text>
                <Text style={styles.sectionHint}>Los tres ritmos que estan marcando la semana.</Text>
              </View>
              <View style={styles.podiumRow}>
                <PodiumCard label="Top 1" name={topThree[0]?.name ?? '--'} steps={topThree[0]?.steps ?? '--'} accent={Colors.coins} />
                <PodiumCard label="Top 2" name={topThree[1]?.name ?? '--'} steps={topThree[1]?.steps ?? '--'} accent={Colors.brand} />
                <PodiumCard label="Top 3" name={topThree[2]?.name ?? '--'} steps={topThree[2]?.steps ?? '--'} accent={Colors.steps} />
              </View>
            </Card>
          ) : null}

          <Card>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Tu lectura rapida</Text>
              <Text style={styles.sectionHint}>{loading ? 'Actualizando...' : 'Donde estas parado ahora mismo.'}</Text>
            </View>
            {yourEntry ? (
              <View style={styles.youCard}>
                <View style={styles.youBadge}><Text style={styles.youBadgeText}>#{yourEntry.rank}</Text></View>
                <View style={styles.youCopy}>
                  <Text style={styles.youTitle}>Tu posicion actual</Text>
                  <Text style={styles.youBody}>{yourEntry.steps.toLocaleString()} pasos registrados. {leader ? `Estas a ${(leader.steps - yourEntry.steps).toLocaleString()} del lider.` : 'Todavia no hay referencia arriba.'}</Text>
                </View>
              </View>
            ) : (
              <EmptyState compact emoji="STEP" tone="warning" eyebrow="Aun no apareces" title="Sin posicion propia todavia" subtitle="En cuanto registres pasos dentro del rango activo, tu fila aparecera aqui automaticamente." />
            )}
          </Card>

          <Card>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Tabla completa</Text>
              <Text style={styles.sectionHint}>{loading ? 'Actualizando...' : `${entries.length} posiciones visibles`}</Text>
            </View>
            {entries.length === 0 ? (
              <EmptyState compact emoji="STEP" tone="warning" eyebrow="Ranking vacio" title="Todavia no hay pasos registrados" subtitle="Invita a alguien o espera el primer sync para que esta tabla empiece a tomar forma." />
            ) : (
              <View style={styles.list}>
                {entries.map((entry, index) => {
                  const isTop = index === 0;
                  return (
                    <View key={entry.userId} style={[styles.row, entry.isYou && styles.rowYou]}>
                      <View style={[styles.rankBubble, isTop && styles.rankBubbleTop, entry.isYou && styles.rankBubbleYou]}>
                        <Text style={[styles.rankText, isTop && styles.rankTextTop, entry.isYou && styles.rankTextYou]}>#{entry.rank}</Text>
                      </View>
                      <View style={styles.rowCopy}>
                        <Text style={[styles.name, entry.isYou && styles.nameYou]} numberOfLines={1}>{entry.name}</Text>
                        <Text style={styles.rowMeta}>{entry.isYou ? 'Tu cuenta' : 'Amigo'} - {entry.steps.toLocaleString()} pasos</Text>
                      </View>
                      {isTop ? <Ionicons name="flame" size={16} color={Colors.coins} /> : null}
                    </View>
                  );
                })}
              </View>
            )}
          </Card>
        </ScrollView>
      </AsyncStateView>
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingHorizontal: Spacing[5],
    paddingTop: Spacing[5],
    paddingBottom: Spacing[12],
    gap: Spacing[4],
  },
  skeleton: { borderRadius: 24 },
  fullState: {
    paddingHorizontal: Spacing[5],
    paddingVertical: Spacing[8],
  },
  heroCard: { gap: Spacing[4] },
  heroHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: Spacing[3],
  },
  heroCopy: { flex: 1, gap: 6 },
  eyebrow: { fontFamily: FontFamily.semibold, fontSize: FontSize.xs, letterSpacing: 0.2, color: Colors.coins },
  heroTitle: { fontFamily: FontFamily.display, fontSize: FontSize['2xl'], color: Colors.textPrimary, lineHeight: 36 },
  heroBody: { fontFamily: FontFamily.regular, fontSize: FontSize.sm, color: Colors.textSecondary, lineHeight: 20 },
  heroBadge: {
    width: 46,
    height: 46,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: withOpacity(Colors.coins, 0.14),
  },
  rangeRow: {
    flexDirection: 'row',
    gap: Spacing[2],
    backgroundColor: Colors.surface2,
    borderRadius: Radius.full,
    padding: 4,
  },
  rangePill: {
    flex: 1,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
  },
  rangePillActive: { backgroundColor: Colors.coins },
  rangePillText: { fontFamily: FontFamily.semibold, fontSize: FontSize.sm, color: Colors.textSecondary },
  rangePillTextActive: { color: Colors.bgBase },
  heroStats: { flexDirection: 'row', gap: Spacing[2] },
  heroStatCard: {
    flex: 1,
    borderRadius: Radius.xl,
    padding: Spacing[3],
    backgroundColor: withOpacity(Colors.white, 0.04),
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 4,
  },
  heroStatValue: { fontFamily: FontFamily.bold, fontSize: FontSize.lg, color: Colors.textPrimary },
  heroStatLabel: { fontFamily: FontFamily.medium, fontSize: FontSize.xs, color: Colors.textSecondary },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: Spacing[3],
    marginBottom: Spacing[3],
  },
  sectionTitle: { fontFamily: FontFamily.bold, fontSize: FontSize.lg, color: Colors.textPrimary },
  sectionHint: { fontFamily: FontFamily.regular, fontSize: FontSize.xs, color: Colors.textSecondary },
  podiumRow: { flexDirection: 'row', gap: Spacing[2] },
  podiumCard: {
    flex: 1,
    borderRadius: Radius.xl,
    borderWidth: 1,
    backgroundColor: Colors.surface2,
    padding: Spacing[3],
    gap: 6,
  },
  podiumLabel: { fontFamily: FontFamily.semibold, fontSize: FontSize.xs },
  podiumName: { fontFamily: FontFamily.bold, fontSize: FontSize.sm, color: Colors.textPrimary },
  podiumValue: { fontFamily: FontFamily.medium, fontSize: FontSize.xs, color: Colors.textSecondary },
  youCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[3],
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: withOpacity(Colors.coins, 0.28),
    backgroundColor: Colors.coinsBg,
    padding: Spacing[3],
  },
  youBadge: {
    width: 48,
    height: 48,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: withOpacity(Colors.coins, 0.2),
  },
  youBadgeText: { fontFamily: FontFamily.bold, fontSize: FontSize.sm, color: Colors.coins },
  youCopy: { flex: 1, gap: 4 },
  youTitle: { fontFamily: FontFamily.bold, fontSize: FontSize.base, color: Colors.textPrimary },
  youBody: { fontFamily: FontFamily.regular, fontSize: FontSize.sm, lineHeight: 20, color: Colors.textSecondary },
  list: { gap: Spacing[2] },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[3],
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface2,
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[3],
  },
  rowYou: { borderColor: withOpacity(Colors.coins, 0.28), backgroundColor: Colors.coinsBg },
  rankBubble: {
    width: 42,
    height: 42,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: withOpacity(Colors.white, 0.06),
  },
  rankBubbleTop: { backgroundColor: withOpacity(Colors.coins, 0.16) },
  rankBubbleYou: { backgroundColor: withOpacity(Colors.coins, 0.24) },
  rankText: { fontFamily: FontFamily.bold, fontSize: FontSize.xs, color: Colors.textMuted },
  rankTextTop: { color: Colors.coins },
  rankTextYou: { color: Colors.textPrimary },
  rowCopy: { flex: 1, gap: 3 },
  name: { fontFamily: FontFamily.bold, fontSize: FontSize.sm, color: Colors.textPrimary },
  nameYou: { color: Colors.coins },
  rowMeta: { fontFamily: FontFamily.regular, fontSize: FontSize.xs, color: Colors.textSecondary },
});
