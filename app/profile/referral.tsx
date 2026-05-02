import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, Share, StyleSheet, Text, View } from 'react-native';
import * as Linking from 'expo-linking';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
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
import {
  getReferralOverview,
  redeemReferral,
  type ReferralOverview,
  type ReferralOverviewResult,
} from '@/services/backend/referrals';
import { useLoadingTimeout } from '@/hooks/useLoadingTimeout';

const HOW_IT_WORKS = [
  'Compartes tu código o el deep link listo.',
  'Si alguien entra con ese código, la invitación queda asociada a ambas cuentas.',
  'La invitacion queda ligada a tu cuenta y al historial de accesos.',
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
    <Pressable
      style={styles.shareAction}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Compartir por ${label}`}
      accessibilityHint="Abre este canal para compartir tu codigo y deep link."
    >
      <View style={[styles.shareIcon, { backgroundColor: withOpacity(accent, 0.12) }]}>
        <Ionicons name={icon} size={20} color={accent} />
      </View>
      <Text style={styles.shareLabel}>{label}</Text>
    </Pressable>
  );
}

export default function ProfileReferralScreen() {
  const [overview, setOverview] = useState<ReferralOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadResult, setLoadResult] = useState<ReferralOverviewResult | null>(null);
  const [codeInput, setCodeInput] = useState('');
  const [redeeming, setRedeeming] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [showHowItWorks, setShowHowItWorks] = useState(false);
  const apkUrl = process.env.EXPO_PUBLIC_APK_URL ?? '';
  const hasTimedOut = useLoadingTimeout(loading, 8000);

  const loadOverview = useCallback(async () => {
    setLoading(true);
    const result = await getReferralOverview();
    setLoadResult(result);
    setOverview(result.ok ? result.overview : null);
    setLoading(false);
  }, []);

  useEffect(() => {
    void loadOverview();
  }, [loadOverview]);

  const shareText = useMemo(() => {
    if (!overview?.code) return '';
    const deepLink = Linking.createURL('referral', { queryParams: { code: overview.code } });
    const downloadLine = apkUrl ? `\n\nDescarga directa: ${apkUrl}` : '';
    return `Sumate a VYRA con mi código ${overview.code}. Si entras con este enlace, la invitación queda vinculada a tu cuenta.\n\n${deepLink}${downloadLine}`;
  }, [apkUrl, overview?.code]);

  const referralRead = useMemo(() => {
    if (!overview) {
      return 'En cuanto cargue tu resumen, aquí veras si conviene volver a compartir o dejarlo en pausa.';
    }

    if ((overview.friend_count ?? 0) === 0) {
      return 'Todavía no hay invitaciones activas. El primer uso te confirma si vale la pena tener este acceso a mano.';
    }

    if ((overview.referral_count ?? 0) > (overview.friend_count ?? 0)) {
      return 'Ya hubo invitaciones usadas. El siguiente paso útil es volver a compartir tu enlace y sostener la rueda.';
    }

    return 'Tu red ya está viva. Ahora toca usar este acceso como impulso liviano, no como una seccion aparte.';
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
      setMessage('Código aplicado. La invitación ya quedó vinculada a tu cuenta.');
      setCodeInput('');
      await loadOverview();
    } else {
      setMessage(result.error ?? 'No se pudo canjear el código.');
    }
    setRedeeming(false);
  }

  const showLoading = loading && !hasTimedOut;
  const showErrorState = !showLoading && (hasTimedOut || (loadResult !== null && !loadResult.ok));
  const errorTitle = loadResult?.ok
    ? 'No pudimos abrir tus invitaciones'
    : loadResult?.reason === 'missing_backend'
      ? 'Invitaciones no está listo en este build'
      : loadResult?.reason === 'unauthorized'
        ? 'Tu sesión necesita reconectarse'
        : loadResult?.reason === 'network'
          ? 'No pudimos conectar invitaciones'
          : 'Invitaciones no está disponible ahora';
  const errorBody = hasTimedOut
    ? 'La pantalla está tardando más de lo normal. Reintenta en unos segundos.'
    : loadResult?.ok
      ? 'Reintenta y volvemos a traer tu código, tu estado y tu red.'
      : loadResult?.error;

  return (
    <SafeScreen padHorizontal={false} padBottom>
      <Header title="Invitar" showBack color={Colors.brand} />

      <AsyncStateView
        analyticsKey="profile_referral"
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
            eyebrow="Invitaciones no disponibles"
            title={errorTitle}
            subtitle={errorBody}
            ctaLabel={loadResult?.ok === false && !loadResult.retryable ? 'Volver' : 'Reintentar'}
            onCta={() => {
              if (loadResult?.ok === false && !loadResult.retryable) {
                router.back();
                return;
              }
              void loadOverview();
            }}
            tone="brand"
            style={styles.fullState}
          />
        }
      >
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <Card accentColor={Colors.brand}>
            <Text style={styles.eyebrow}>Tu código</Text>
            <Text style={styles.code}>{overview?.code ?? '----'}</Text>
            <Text style={styles.heroBody}>
              Compartir VYRA debería sentirse simple: das una entrada clara a la app y dejas el
              vínculo entre cuentas listo desde el primer uso.
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
                <Text style={styles.heroStatValue}>{overview?.redeemed ? 'Sí' : 'No'}</Text>
                <Text style={styles.heroStatLabel}>canje propio</Text>
              </View>
            </View>

            <View style={styles.shareRow}>
              <ShareCircle icon="logo-whatsapp" label="WhatsApp" onPress={() => void handleWhatsAppShare()} accent={Colors.success} />
              <ShareCircle icon="paper-plane-outline" label="Telegram" onPress={() => void handleTelegramShare()} accent={Colors.brand} />
              <ShareCircle icon="share-social-outline" label="Compartir" onPress={() => void handleShare()} accent={Colors.brand} />
            </View>
          </Card>

          <Card>
            <Text style={styles.sectionTitle}>Tu siguiente paso</Text>
            <Text style={styles.sectionHint}>{referralRead}</Text>
            <View style={styles.actionRow}>
              <Button variant="secondary" color={Colors.brand} onPress={() => void handleShare()}>
                Compartir ahora
              </Button>
            </View>
          </Card>

          <Card>
            <Pressable
              style={styles.collapseHeader}
              onPress={() => setShowHowItWorks((value) => !value)}
              accessibilityRole="button"
              accessibilityState={{ expanded: showHowItWorks }}
              accessibilityLabel="Como funciona"
              accessibilityHint="Expande o contrae la explicacion del sistema de invitaciones."
            >
              <View style={styles.collapseCopy}>
                <Text style={styles.sectionTitle}>Como funciona</Text>
                <Text style={styles.sectionHint}>Oculto por defecto para no meter marketing de más.</Text>
              </View>
              <Ionicons
                name={showHowItWorks ? 'chevron-up' : 'chevron-down'}
                size={16}
                color={Colors.textMuted}
              />
            </Pressable>

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
            <Text style={styles.sectionTitle}>Canjear un código</Text>
            <Input
              label="Código"
              value={codeInput}
              onChangeText={(value) => setCodeInput(value.toUpperCase())}
              placeholder="Ej. VYRA1234"
              autoCapitalize="characters"
            />
            <Button onPress={() => void handleRedeem()} loading={redeeming} disabled={!codeInput.trim()} fullWidth color={Colors.brand}>
              Aplicar código
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
