import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ScrollView, Share, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import * as Linking from 'expo-linking';
import { Ionicons } from '@expo/vector-icons';
import SafeScreen from '@/components/ui/SafeScreen';
import Header from '@/components/layout/Header';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import EmptyState from '@/components/ui/EmptyState';
import AsyncStateView from '@/components/ui/AsyncStateView';
import Skeleton from '@/components/ui/Skeleton';
import { Colors, withOpacity } from '@/constants/colors';
import { FontFamily, FontSize, Radius, Spacing } from '@/constants/theme';
import { getReferralOverview, redeemReferral, type ReferralOverview } from '@/services/backend/referrals';
import { useLoadingTimeout } from '@/hooks/useLoadingTimeout';

const HOW_IT_WORKS = [
  'Compartes tu codigo o el deep link listo.',
  'Si alguien entra con ese codigo, ambos ganan 7 dias Premium.',
  'Ese referral luego aparece en growth y amistad.',
] as const;

function ShareCircle({
  icon,
  label,
  onPress,
  accent,
}: {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  label: string;
  onPress: () => void;
  accent: string;
}) {
  return (
    <TouchableOpacity style={styles.shareAction} onPress={onPress} activeOpacity={0.85}>
      <View style={[styles.shareIcon, { backgroundColor: withOpacity(accent, 0.12) }]}>
        <Ionicons name={icon} size={20} color={accent} />
      </View>
      <Text style={styles.shareLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

export default function InviteScreen() {
  const [overview, setOverview] = useState<ReferralOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);
  const [codeInput, setCodeInput] = useState('');
  const [redeeming, setRedeeming] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [showHowItWorks, setShowHowItWorks] = useState(false);
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
    const downloadLine = apkUrl ? `\n\nDescarga directa: ${apkUrl}` : '';
    return `Sumate a VYRA con mi codigo ${overview.code}. Los dos ganamos 7 dias Premium.\n\n${deepLink}${downloadLine}`;
  }, [apkUrl, overview?.code]);

  const socialRead = useMemo(() => {
    if (!overview) {
      return 'En cuanto cargue tu overview, aqui veras si conviene compartir mas o activar tu red existente.';
    }

    if ((overview.friend_count ?? 0) === 0) {
      return 'Todavia no hay amigos activos. El primer referral es el paso que convierte growth en algo real.';
    }

    if ((overview.referral_count ?? 0) > (overview.friend_count ?? 0)) {
      return 'Ya hubo referrals. El siguiente paso util es volverlos visibles en amigos y rankings.';
    }

    return 'Tu red ya esta viva. Ahora toca usarla como motivacion suave, no solo como premio puntual.';
  }, [overview]);

  async function handleShare() {
    if (!shareText) return;
    await Share.share({ message: shareText });
  }

  async function handleWhatsAppShare() {
    if (!shareText) return;
    const url = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
    await Linking.openURL(url);
  }

  async function handleTelegramShare() {
    if (!shareText) return;
    const url = `https://t.me/share/url?url=${encodeURIComponent('https://vyra.app')}&text=${encodeURIComponent(shareText)}`;
    await Linking.openURL(url);
  }

  async function handleRedeem() {
    if (!codeInput.trim()) return;
    setRedeeming(true);
    setMessage(null);
    const result = await redeemReferral(codeInput.trim());
    if (result.ok) {
      setMessage('Codigo aplicado. Ya sumaste Premium a tu cuenta.');
      setCodeInput('');
      await loadOverview();
    } else {
      setMessage(result.error ?? 'No se pudo canjear el codigo.');
    }
    setRedeeming(false);
  }

  const showLoading = loading && !hasTimedOut;
  const showErrorState = !showLoading && (loadFailed || hasTimedOut);

  return (
    <SafeScreen padHorizontal={false} padBottom>
      <Header title="Invitar" showBack color={Colors.brand} />

      <AsyncStateView
        analyticsKey="growth_invite"
        loading={showLoading}
        hasError={showErrorState}
        loadingView={
          <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
            <Skeleton height={220} style={styles.skeleton} />
            <Skeleton height={180} style={styles.skeleton} />
            <Skeleton height={220} style={styles.skeleton} />
          </ScrollView>
        }
        errorView={
          <EmptyState
            emoji="STAR"
            eyebrow="Growth no cargo a tiempo"
            title="No pudimos abrir tus invitaciones"
            subtitle="Reintenta y volvemos a traer tu codigo, tus recompensas y tu red."
            ctaLabel="Reintentar"
            onCta={() => void loadOverview()}
            tone="brand"
            style={styles.fullState}
          />
        }
      >
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <Card accentColor={Colors.brand}>
            <Text style={styles.eyebrow}>Tu codigo</Text>
            <Text style={styles.code}>{overview?.code ?? '----'}</Text>
            <Text style={styles.heroBody}>
              Compartir VYRA deberia sentirse generoso: das una entrada clara a la app y ambos
              reciben algo que de verdad vale.
            </Text>

            <View style={styles.heroStats}>
              <View style={styles.heroStat}>
                <Text style={styles.heroStatValue}>{overview?.referral_count ?? 0}</Text>
                <Text style={styles.heroStatLabel}>usos</Text>
              </View>
              <View style={styles.heroStat}>
                <Text style={styles.heroStatValue}>{overview?.friend_count ?? 0}</Text>
                <Text style={styles.heroStatLabel}>amigos</Text>
              </View>
              <View style={styles.heroStat}>
                <Text style={styles.heroStatValue}>{overview?.reward_days ?? 7}d</Text>
                <Text style={styles.heroStatLabel}>recompensa</Text>
              </View>
            </View>

            <View style={styles.shareRow}>
              <ShareCircle icon="logo-whatsapp" label="WhatsApp" onPress={() => void handleWhatsAppShare()} accent={Colors.success} />
              <ShareCircle icon="paper-plane-outline" label="Telegram" onPress={() => void handleTelegramShare()} accent={Colors.brand} />
              <ShareCircle icon="share-social-outline" label="Compartir" onPress={() => void handleShare()} accent={Colors.premium} />
            </View>
          </Card>

          <Card>
            <Text style={styles.sectionTitle}>Tu siguiente paso</Text>
            <Text style={styles.sectionHint}>{socialRead}</Text>
            <View style={styles.actionRow}>
              <Button variant="secondary" color={Colors.brand} onPress={() => void handleShare()}>
                Compartir ahora
              </Button>
            </View>
          </Card>

          <Card>
            <TouchableOpacity
              style={styles.collapseHeader}
              activeOpacity={0.8}
              onPress={() => setShowHowItWorks((value) => !value)}
            >
              <View style={styles.collapseCopy}>
                <Text style={styles.sectionTitle}>Como funciona</Text>
                <Text style={styles.sectionHint}>Oculto por defecto para no meter marketing de mas.</Text>
              </View>
              <Ionicons
                name={showHowItWorks ? 'chevron-up' : 'chevron-down'}
                size={16}
                color={Colors.textMuted}
              />
            </TouchableOpacity>

            {showHowItWorks ? (
              <View style={styles.howStack}>
                {HOW_IT_WORKS.map((step, index) => (
                  <View key={step} style={styles.howRow}>
                    <View style={styles.stepBadge}>
                      <Text style={styles.stepBadgeText}>{index + 1}</Text>
                    </View>
                    <Text style={styles.stepText}>{step}</Text>
                  </View>
                ))}
              </View>
            ) : null}
          </Card>

          <Card>
            <Text style={styles.sectionTitle}>Canjear un codigo</Text>
            <Input
              label="Codigo"
              value={codeInput}
              onChangeText={(value) => setCodeInput(value.toUpperCase())}
              placeholder="Ej. VYRA1234"
              autoCapitalize="characters"
            />
            <Button onPress={() => void handleRedeem()} loading={redeeming} disabled={!codeInput.trim()} fullWidth color={Colors.brand}>
              Aplicar codigo
            </Button>
            {message ? <Text style={styles.message}>{message}</Text> : null}
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
  skeleton: {
    borderRadius: 24,
  },
  fullState: {
    paddingHorizontal: Spacing[5],
    paddingVertical: Spacing[8],
  },
  eyebrow: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.xs,
    color: Colors.brand,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  code: {
    fontFamily: FontFamily.display,
    fontSize: 44,
    lineHeight: 44,
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  heroBody: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    lineHeight: 20,
    color: Colors.textSecondary,
  },
  heroStats: {
    flexDirection: 'row',
    gap: Spacing[2],
    marginTop: Spacing[3],
  },
  heroStat: {
    flex: 1,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface2,
    padding: Spacing[3],
    gap: 4,
  },
  heroStatValue: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.lg,
    color: Colors.textPrimary,
  },
  heroStatLabel: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
  },
  shareRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing[2],
    marginTop: Spacing[3],
  },
  shareAction: {
    flex: 1,
    alignItems: 'center',
    gap: 8,
  },
  shareIcon: {
    width: 52,
    height: 52,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shareLabel: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
  },
  sectionTitle: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.base,
    color: Colors.textPrimary,
  },
  sectionHint: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    lineHeight: 19,
    color: Colors.textSecondary,
    marginTop: 6,
  },
  actionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing[2],
    marginTop: Spacing[3],
  },
  collapseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing[3],
  },
  collapseCopy: {
    flex: 1,
  },
  howStack: {
    gap: Spacing[2],
    marginTop: Spacing[3],
  },
  howRow: {
    flexDirection: 'row',
    gap: Spacing[2],
  },
  stepBadge: {
    width: 22,
    height: 22,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: withOpacity(Colors.brand, 0.12),
  },
  stepBadgeText: {
    fontFamily: FontFamily.bold,
    fontSize: 11,
    color: Colors.brand,
  },
  stepText: {
    flex: 1,
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    lineHeight: 20,
    color: Colors.textSecondary,
  },
  message: {
    marginTop: Spacing[3],
    fontFamily: FontFamily.medium,
    fontSize: FontSize.xs,
    lineHeight: 18,
    color: Colors.textSecondary,
  },
});
