import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ScrollView, Share, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import * as Linking from 'expo-linking';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import SafeScreen from '@/components/ui/SafeScreen';
import { Header } from '@/components/layout/Header';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import EmptyState from '@/components/ui/EmptyState';
import AsyncStateView from '@/components/ui/AsyncStateView';
import Skeleton from '@/components/ui/Skeleton';
import { Colors, withOpacity } from '@/constants/colors';
import { Routes } from '@/constants/routes';
import { FontFamily, FontSize, Radius, Spacing } from '@/constants/theme';
import { getReferralOverview, redeemReferral, type ReferralOverview } from '@/services/backend/referrals';
import { useLoadingTimeout } from '@/hooks/useLoadingTimeout';

const HOW_IT_WORKS = [
  'Tu codigo se comparte con deep link listo y opcionalmente descarga directa.',
  'Cuando alguien se registra con ese codigo, ambos reciben 7 dias Premium.',
  'La invitacion se convierte en amistad y queda reflejada en growth y rankings.',
] as const;

export default function InviteScreen() {
  const [overview, setOverview] = useState<ReferralOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);
  const [codeInput, setCodeInput] = useState('');
  const [redeeming, setRedeeming] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const apkUrl = process.env.EXPO_PUBLIC_APK_URL ?? '';
  const hasTimedOut = useLoadingTimeout(loading, 8000);

  const loadOverview = useCallback(async () => {
    setLoading(true);
    setLoadFailed(false);
    const data = await getReferralOverview();
    setOverview(data);
    setLoadFailed(!data);
    setLoading(false);
  }, []);

  useEffect(() => {
    void loadOverview();
  }, [loadOverview]);

  const shareText = useMemo(() => {
    if (!overview?.code) return '';
    const deepLink = Linking.createURL('referral', { queryParams: { code: overview.code } });
    const downloadLine = apkUrl ? `
Descarga directa: ${apkUrl}` : '';
    return `Sumate a VYRA con mi codigo ${overview.code}. Los dos ganamos 7 dias Premium.
${deepLink}${downloadLine}`;
  }, [apkUrl, overview?.code]);

  const handleShare = async () => {
    if (!shareText) return;
    await Share.share({ message: shareText });
  };

  const handleRedeem = async () => {
    if (!codeInput.trim()) return;
    setRedeeming(true);
    setMessage(null);
    const result = await redeemReferral(codeInput.trim());
    if (result.ok) {
      setMessage('Codigo aplicado. Ya sumaste 7 dias Premium a tu cuenta.');
      setCodeInput('');
      await loadOverview();
    } else {
      setMessage(result.error ?? 'No se pudo canjear el codigo.');
    }
    setRedeeming(false);
  };

  const showLoading = loading && !hasTimedOut;
  const showErrorState = !showLoading && (loadFailed || hasTimedOut);

  return (
    <SafeScreen padHorizontal={false} padBottom>
      <Header title="Invitar amigos" subtitle="Growth claro, premium y accionable" showBack color={Colors.brand} />

      <AsyncStateView
        analyticsKey="growth_invite"
        loading={showLoading}
        hasError={showErrorState}
        loadingView={(
          <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
            <Skeleton height={220} style={styles.skeleton} />
            <Skeleton height={180} style={styles.skeleton} />
            <Skeleton height={220} style={styles.skeleton} />
          </ScrollView>
        )}
        errorView={(
          <EmptyState
            emoji="STAR"
            eyebrow="Growth no cargo a tiempo"
            title="No pudimos abrir tus invitaciones"
            subtitle="Reintenta y volvemos a traer tu codigo, recompensas y accesos rapidos de growth."
            ctaLabel="Reintentar"
            onCta={() => void loadOverview()}
            tone="brand"
            style={styles.fullState}
          />
        )}
      >
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <Card style={styles.heroCard} accentColor={Colors.brand}>
            <View style={styles.heroHeader}>
              <View style={styles.heroCopy}>
                <Text style={styles.eyebrow}>Tu codigo activo</Text>
                <Text style={styles.heroTitle}>{overview?.code ?? 'Sin codigo'}</Text>
                <Text style={styles.heroBody}>
                  Comparte una entrada limpia a VYRA: cada invitacion bien hecha suma Premium y convierte el crecimiento en algo visible para ambos.
                </Text>
              </View>
              <View style={styles.heroBadge}>
                <Ionicons name="people-outline" size={22} color={Colors.brand} />
              </View>
            </View>

            <View style={styles.heroStats}>
              <View style={styles.heroStatCard}>
                <Text style={styles.heroStatValue}>{overview?.referral_count ?? 0}</Text>
                <Text style={styles.heroStatLabel}>invitaciones usadas</Text>
              </View>
              <View style={styles.heroStatCard}>
                <Text style={styles.heroStatValue}>{overview?.friend_count ?? 0}</Text>
                <Text style={styles.heroStatLabel}>amistades activas</Text>
              </View>
              <View style={styles.heroStatCard}>
                <Text style={styles.heroStatValue}>{overview?.reward_days ?? 7}d</Text>
                <Text style={styles.heroStatLabel}>recompensa</Text>
              </View>
            </View>

            <Button onPress={() => void handleShare()} fullWidth>
              Compartir codigo
            </Button>

            {overview?.founding_member ? (
              <View style={styles.foundingPill}>
                <Ionicons name="medal-outline" size={15} color={Colors.premium} />
                <Text style={styles.foundingText}>Miembro fundador #{overview.founding_member_rank ?? '--'}</Text>
              </View>
            ) : null}
          </Card>

          <Card>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Como funciona</Text>
              <Text style={styles.sectionHint}>Un flujo corto y entendible.</Text>
            </View>
            <View style={styles.stepsList}>
              {HOW_IT_WORKS.map((step, index) => (
                <View key={step} style={styles.stepRow}>
                  <View style={styles.stepBadge}><Text style={styles.stepBadgeText}>{index + 1}</Text></View>
                  <Text style={styles.stepText}>{step}</Text>
                </View>
              ))}
            </View>
          </Card>

          <Card>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Canjear un codigo</Text>
              <Text style={styles.sectionHint}>Solo se usa una vez por cuenta.</Text>
            </View>
            <Input
              label="Codigo"
              value={codeInput}
              onChangeText={(value) => setCodeInput(value.toUpperCase())}
              placeholder="Ej. VYRA1234"
              autoCapitalize="characters"
            />
            <Button onPress={() => void handleRedeem()} loading={redeeming} disabled={!codeInput.trim()} fullWidth>
              Aplicar codigo
            </Button>
            {message ? <Text style={styles.message}>{message}</Text> : null}
          </Card>

          <View style={styles.dualGrid}>
            <Card style={styles.linkCard} accentColor={Colors.coins}>
              <View style={styles.linkHeader}>
                <Text style={styles.linkTitle}>Ranking de amigos</Text>
                <Ionicons name="trophy-outline" size={18} color={Colors.coins} />
              </View>
              <Text style={styles.linkBody}>
                Convierte las invitaciones en una red que realmente empuja constancia: pasos, posiciones y ritmo compartido.
              </Text>
              <TouchableOpacity style={styles.linkRow} onPress={() => router.push(Routes.growth.friends as any)}>
                <Text style={styles.linkText}>Ver amigos</Text>
                <Ionicons name="arrow-forward" size={14} color={Colors.textPrimary} />
              </TouchableOpacity>
            </Card>

            <Card style={styles.linkCard} accentColor={Colors.premium}>
              <View style={styles.linkHeader}>
                <Text style={styles.linkTitle}>Tabla de fundadores</Text>
                <Ionicons name="sparkles-outline" size={18} color={Colors.premium} />
              </View>
              <Text style={styles.linkBody}>
                Los primeros usuarios quedan en una capa especial de memoria. Si ya entraste, aqui ves tu lugar y el origen del proyecto.
              </Text>
              <TouchableOpacity style={styles.linkRow} onPress={() => router.push(Routes.growth.founding as any)}>
                <Text style={styles.linkText}>Ver tabla</Text>
                <Ionicons name="arrow-forward" size={14} color={Colors.textPrimary} />
              </TouchableOpacity>
            </Card>
          </View>
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
  eyebrow: { fontFamily: FontFamily.semibold, fontSize: FontSize.xs, color: Colors.brand, letterSpacing: 0.2 },
  heroTitle: { fontFamily: FontFamily.display, fontSize: FontSize['2xl'], color: Colors.textPrimary },
  heroBody: { fontFamily: FontFamily.regular, fontSize: FontSize.sm, color: Colors.textSecondary, lineHeight: 20 },
  heroBadge: {
    width: 46,
    height: 46,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: withOpacity(Colors.brand, 0.14),
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
  foundingPill: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: withOpacity(Colors.premium, 0.28),
    backgroundColor: Colors.premiumBg,
    paddingHorizontal: Spacing[3],
    paddingVertical: 6,
  },
  foundingText: { fontFamily: FontFamily.semibold, fontSize: FontSize.xs, color: Colors.premium },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: Spacing[3],
    marginBottom: Spacing[3],
  },
  sectionTitle: { fontFamily: FontFamily.bold, fontSize: FontSize.lg, color: Colors.textPrimary },
  sectionHint: { fontFamily: FontFamily.regular, fontSize: FontSize.xs, color: Colors.textSecondary },
  stepsList: { gap: Spacing[3] },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing[3],
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface2,
    padding: Spacing[3],
  },
  stepBadge: {
    width: 28,
    height: 28,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: withOpacity(Colors.brand, 0.16),
  },
  stepBadgeText: { fontFamily: FontFamily.bold, fontSize: FontSize.xs, color: Colors.brand },
  stepText: { flex: 1, fontFamily: FontFamily.regular, fontSize: FontSize.sm, lineHeight: 20, color: Colors.textSecondary },
  message: { marginTop: Spacing[2], fontFamily: FontFamily.medium, fontSize: FontSize.xs, color: Colors.textSecondary },
  dualGrid: { gap: Spacing[3] },
  linkCard: { gap: Spacing[3] },
  linkHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: Spacing[3] },
  linkTitle: { fontFamily: FontFamily.bold, fontSize: FontSize.base, color: Colors.textPrimary },
  linkBody: { fontFamily: FontFamily.regular, fontSize: FontSize.sm, lineHeight: 20, color: Colors.textSecondary },
  linkRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: Radius.xl,
    backgroundColor: Colors.surface2,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[3],
  },
  linkText: { fontFamily: FontFamily.semibold, fontSize: FontSize.sm, color: Colors.textPrimary },
});
