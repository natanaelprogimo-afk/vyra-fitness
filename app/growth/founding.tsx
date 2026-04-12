import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import SafeScreen from '@/components/ui/SafeScreen';
import { Header } from '@/components/layout/Header';
import Card from '@/components/ui/Card';
import EmptyState from '@/components/ui/EmptyState';
import AsyncStateView from '@/components/ui/AsyncStateView';
import Skeleton from '@/components/ui/Skeleton';
import { Colors, withOpacity } from '@/constants/colors';
import { FontFamily, FontSize, Radius, Spacing } from '@/constants/theme';
import { getFoundingLeaderboard, type FoundingLeaderboardEntry } from '@/services/backend/founding';
import { useAuthStore } from '@/stores/authStore';
import { useLoadingTimeout } from '@/hooks/useLoadingTimeout';

export default function FoundingLeaderboardScreen() {
  const userId = useAuthStore((s) => s.profile?.id ?? null);
  const [entries, setEntries] = useState<FoundingLeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const hasTimedOut = useLoadingTimeout(loading, 8000);

  const loadFounding = useCallback(async () => {
    setLoading(true);
    const items = await getFoundingLeaderboard(50);
    setEntries(items);
    setLoading(false);
  }, []);

  useEffect(() => {
    void loadFounding();
  }, [loadFounding]);

  const yourEntry = useMemo(() => entries.find((entry) => entry.id === userId) ?? null, [entries, userId]);
  const firstEntry = entries[0] ?? null;
  const showLoading = loading && !hasTimedOut;
  const showEmptyState = !showLoading && entries.length === 0;

  return (
    <SafeScreen padHorizontal={false} padBottom>
      <Header title="Miembros fundadores" subtitle="Memoria visible del origen de VYRA" showBack color={Colors.premium} />

      <AsyncStateView
        analyticsKey="growth_founding"
        loading={showLoading}
        hasEmpty={showEmptyState}
        loadingView={(
          <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
            <Skeleton height={230} style={styles.skeleton} />
            <Skeleton height={180} style={styles.skeleton} />
            <Skeleton height={260} style={styles.skeleton} />
          </ScrollView>
        )}
        errorView={null}
        emptyView={(
          <EmptyState
            emoji="TOP"
            eyebrow="Sin miembros"
            title="Todavia no hay fundadores visibles"
            subtitle="Cuando el backend cargue la tabla, esta lista se completara automaticamente sin romper el resto del modulo."
            ctaLabel="Reintentar"
            onCta={() => void loadFounding()}
            tone="premium"
            style={styles.fullState}
          />
        )}
      >
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <Card style={styles.heroCard} accentColor={Colors.premium}>
            <View style={styles.heroHeader}>
              <View style={styles.heroCopy}>
                <Text style={styles.eyebrow}>Tabla de honor</Text>
                <Text style={styles.heroTitle}>{firstEntry ? `${firstEntry.name ?? 'Usuario'} llego primero` : 'Sin miembros visibles'}</Text>
                <Text style={styles.heroBody}>
                  Esta pantalla no compite por volumen: conserva el origen. Aqui se ve quienes llegaron antes, que nivel construyeron y donde estas tu dentro de esa historia.
                </Text>
              </View>
              <View style={styles.heroBadge}>
                <Ionicons name="medal-outline" size={22} color={Colors.premium} />
              </View>
            </View>

            <View style={styles.heroStats}>
              <View style={styles.heroStatCard}>
                <Text style={styles.heroStatValue}>{entries.length}</Text>
                <Text style={styles.heroStatLabel}>puestos visibles</Text>
              </View>
              <View style={styles.heroStatCard}>
                <Text style={styles.heroStatValue}>{yourEntry ? `#${yourEntry.founding_member_rank ?? '--'}` : '--'}</Text>
                <Text style={styles.heroStatLabel}>tu lugar</Text>
              </View>
              <View style={styles.heroStatCard}>
                <Text style={styles.heroStatValue}>{yourEntry?.level ?? '--'}</Text>
                <Text style={styles.heroStatLabel}>tu nivel</Text>
              </View>
            </View>
          </Card>

          <Card>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Tu lectura fundadora</Text>
              <Text style={styles.sectionHint}>{loading ? 'Actualizando...' : 'Tu posicion dentro del origen.'}</Text>
            </View>
            {yourEntry ? (
              <View style={styles.youCard}>
                <View style={styles.youBadge}><Text style={styles.youBadgeText}>#{yourEntry.founding_member_rank ?? '--'}</Text></View>
                <View style={styles.youCopy}>
                  <Text style={styles.youTitle}>{yourEntry.name ?? 'Tu cuenta'}</Text>
                  <Text style={styles.youBody}>Nivel {yourEntry.level} - {yourEntry.xp} XP - Racha {yourEntry.streak}. Tu lugar ya forma parte de la memoria base del producto.</Text>
                </View>
              </View>
            ) : (
              <EmptyState compact emoji="TOP" tone="premium" eyebrow="Aun no apareces" title="Sin posicion fundadora visible" subtitle="Si tu cuenta no entro en esta tabla, igual podras seguir viendo el origen del proyecto y los puestos mas altos." />
            )}
          </Card>

          <Card>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Ranking completo</Text>
              <Text style={styles.sectionHint}>{loading ? 'Actualizando...' : `${entries.length} posiciones cargadas`}</Text>
            </View>
            <View style={styles.list}>
              {entries.map((entry, index) => {
                const isYou = Boolean(userId) && entry.id === userId;
                const rank = entry.founding_member_rank ?? index + 1;
                const isTopThree = rank <= 3;
                return (
                  <View key={entry.id} style={[styles.row, isYou && styles.rowYou]}>
                    <View style={[styles.rankBubble, isTopThree && styles.rankBubbleTop, isYou && styles.rankBubbleYou]}>
                      <Text style={[styles.rankText, isTopThree && styles.rankTextTop, isYou && styles.rankTextYou]}>#{rank}</Text>
                    </View>
                    <View style={styles.rowCopy}>
                      <Text style={[styles.name, isYou && styles.nameYou]} numberOfLines={1}>{entry.name ?? 'Usuario'}</Text>
                      <Text style={styles.rowMeta}>Nivel {entry.level} - {entry.xp} XP - Racha {entry.streak}</Text>
                    </View>
                    {isTopThree ? <Ionicons name="sparkles" size={16} color={Colors.premium} /> : null}
                  </View>
                );
              })}
            </View>
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
  eyebrow: { fontFamily: FontFamily.semibold, fontSize: FontSize.xs, letterSpacing: 0.2, color: Colors.premium },
  heroTitle: { fontFamily: FontFamily.display, fontSize: FontSize['2xl'], color: Colors.textPrimary, lineHeight: 36 },
  heroBody: { fontFamily: FontFamily.regular, fontSize: FontSize.sm, color: Colors.textSecondary, lineHeight: 20 },
  heroBadge: {
    width: 46,
    height: 46,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: withOpacity(Colors.premium, 0.14),
  },
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
  youCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[3],
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: withOpacity(Colors.premium, 0.28),
    backgroundColor: Colors.premiumBg,
    padding: Spacing[3],
  },
  youBadge: {
    width: 48,
    height: 48,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: withOpacity(Colors.premium, 0.2),
  },
  youBadgeText: { fontFamily: FontFamily.bold, fontSize: FontSize.sm, color: Colors.premium },
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
  rowYou: { borderColor: withOpacity(Colors.premium, 0.28), backgroundColor: Colors.premiumBg },
  rankBubble: {
    width: 42,
    height: 42,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: withOpacity(Colors.white, 0.06),
  },
  rankBubbleTop: { backgroundColor: withOpacity(Colors.premium, 0.16) },
  rankBubbleYou: { backgroundColor: withOpacity(Colors.premium, 0.24) },
  rankText: { fontFamily: FontFamily.bold, fontSize: FontSize.xs, color: Colors.textMuted },
  rankTextTop: { color: Colors.premium },
  rankTextYou: { color: Colors.textPrimary },
  rowCopy: { flex: 1, gap: 3 },
  name: { fontFamily: FontFamily.bold, fontSize: FontSize.sm, color: Colors.textPrimary },
  nameYou: { color: Colors.premium },
  rowMeta: { fontFamily: FontFamily.regular, fontSize: FontSize.xs, color: Colors.textSecondary },
});
