import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import SafeScreen from '@/components/ui/SafeScreen';
import { Header } from '@/components/layout/Header';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import MonetizationBridgeCard from '@/components/ui/MonetizationBridgeCard';
import { RewardedAdButton } from '@/components/ui/RewardedAdButton';
import { Colors, withOpacity } from '@/constants/colors';
import { FontFamily, FontSize, Radius, Spacing } from '@/constants/theme';
import { Routes } from '@/constants/routes';
import { useAds } from '@/hooks/useAds';
import { useCoins } from '@/hooks/useCoins';
import { useReadiness } from '@/hooks/useReadiness';
import { useStoreCatalog, type StoreCatalogItem } from '@/hooks/useStoreCatalog';
import { useAuthStore } from '@/stores/authStore';

function RouteStat({
  label,
  value,
  hint,
  accent,
}: {
  label: string;
  value: string;
  hint: string;
  accent: string;
}) {
  return (
    <View style={styles.routeStat}>
      <Text style={styles.routeStatLabel}>{label}</Text>
      <Text style={[styles.routeStatValue, { color: accent }]} numberOfLines={1}>
        {value}
      </Text>
      <Text style={styles.routeStatHint}>{hint}</Text>
    </View>
  );
}

function TensionCard({
  title,
  body,
  accent,
  icon,
}: {
  title: string;
  body: string;
  accent: string;
  icon: React.ComponentProps<typeof Ionicons>['name'];
}) {
  return (
    <View style={[styles.tensionCard, { borderColor: withOpacity(accent, 0.22) }]}>
      <View style={styles.tensionHeader}>
        <View style={[styles.tensionIcon, { backgroundColor: withOpacity(accent, 0.14) }]}>
          <Ionicons name={icon} size={18} color={accent} />
        </View>
        <Text style={styles.tensionTitle}>{title}</Text>
      </View>
      <Text style={styles.tensionBody}>{body}</Text>
    </View>
  );
}

function getAccent(item: StoreCatalogItem) {
  return item.accent_color ?? Colors.coins;
}

export default function StoreRewardedScreen() {
  const { balance, addCoins, transactions } = useCoins();
  const {
    canShowRewarded,
    rewardedReady,
    isPremium,
    getRewardForContext,
    getViewsRemainingForContext,
    getCoinsEarnedTodayForContext,
    getCoinsRemainingForContext,
    isUnlimitedRewardedContext,
  } = useAds();
  const { items, isOwned } = useStoreCatalog();
  const { dailyScore, predictedScore, weeklyAverage, scoreColor, similarDayComparison, focusActions, morningNarrative } = useReadiness();
  const profile = useAuthStore((state) => state.profile);

  const unownedItems = useMemo(
    () => items.filter((item) => !isOwned(item.id)).sort((a, b) => a.coins_cost - b.coins_cost),
    [isOwned, items],
  );
  const affordableItems = useMemo(
    () => unownedItems.filter((item) => item.coins_cost <= balance),
    [balance, unownedItems],
  );
  const recommendedItem = affordableItems[0] ?? unownedItems[0] ?? null;
  const storeAdReward = getRewardForContext('store_coin_grind');
  const storeAdEarnedToday = getCoinsEarnedTodayForContext('store_coin_grind');
  const storeAdUnlimited = isUnlimitedRewardedContext('store_coin_grind');
  const remainingViews = getViewsRemainingForContext('store_coin_grind');
  const remainingCoins = getCoinsRemainingForContext('store_coin_grind');
  const canRunRewarded = canShowRewarded('store_coin_grind');
  const nextSpendGap = recommendedItem ? Math.max(0, recommendedItem.coins_cost - balance) : 0;
  const rewardViewsToGap = recommendedItem && nextSpendGap > 0 ? Math.ceil(nextSpendGap / Math.max(1, storeAdReward)) : 0;
  const balanceCoverage = recommendedItem ? Math.round((balance / Math.max(1, recommendedItem.coins_cost)) * 100) : 100;
  const coachName = profile?.coach_name_preference ?? 'Vyra';
  const focusAction = focusActions[0] ?? null;
  const dayScore = dailyScore?.score != null ? Math.round(dailyScore.score) : null;
  const scoreAccent = dayScore !== null ? scoreColor(dayScore) : Colors.coins;
  const scoreVsWeek = dayScore !== null && weeklyAverage !== null ? Math.round(dayScore - weeklyAverage) : null;
  const totalCoinFlow = useMemo(() => {
    return transactions.reduce(
      (acc, transaction) => {
        if (transaction.amount > 0) acc.earned += transaction.amount;
        if (transaction.amount < 0) acc.spent += Math.abs(transaction.amount);
        return acc;
      },
      { earned: 0, spent: 0 },
    );
  }, [transactions]);

  const routeMode = isPremium
    ? 'Premium'
    : !recommendedItem
      ? 'Acumular'
      : recommendedItem.coins_cost <= balance
        ? 'Comprar'
        : rewardViewsToGap > 0 && rewardViewsToGap <= 3
          ? 'Cobrar'
          : balanceCoverage >= 70
            ? 'Guardar'
            : 'Esperar';
  const rhythmValue = isPremium
    ? 'Sin anuncios'
    : storeAdEarnedToday > 0
      ? 'Activo'
      : recommendedItem?.coins_cost <= balance
        ? 'Listo'
        : canRunRewarded
          ? 'Abierto'
          : rewardedReady
            ? 'Pausa'
            : 'Carga';
  const rhythmHint = isPremium
    ? 'premium activo'
    : storeAdUnlimited
      ? 'sin tope diario'
      : remainingViews !== null
        ? `${remainingViews} vistas`
        : scoreVsWeek !== null
          ? `${scoreVsWeek >= 0 ? '+' : ''}${scoreVsWeek} vs semana`
          : `saldo ${balance}`;
  const routeTitle = isPremium
    ? `${coachName} ve Premium activo: hoy rewarded ya no es la salida.`
    : !recommendedItem
      ? `${coachName} ve la economia tranquila: hoy conviene acumular sin ansiedad.`
      : recommendedItem.coins_cost <= balance
        ? `${coachName} ve saldo suficiente y quiere evitar anuncios extra.`
        : rewardViewsToGap > 0 && rewardViewsToGap <= 3
          ? `${coachName} ve un gap corto y quiere usar rewarded como puente.`
          : balanceCoverage >= 70
            ? `${coachName} ve el item cerca, pero hoy conviene guardar coins.`
            : `${coachName} quiere que rewarded sume direccion, no ruido.`;
  const routeBody = isPremium
    ? 'Con Premium activo, mirar anuncios ya no es la mejor salida.'
    : !recommendedItem
      ? 'Si no hay compra clara, rewarded solo deberia sostener margen.'
      : recommendedItem.coins_cost <= balance
        ? `${recommendedItem.name} ya entra en tu balance.`
        : rewardViewsToGap > 0 && rewardViewsToGap <= 3
          ? `Te faltan ${nextSpendGap} coins para ${recommendedItem.name}.`
          : balanceCoverage >= 70
            ? `Tu cobertura ya va por ${balanceCoverage}%. Hoy puede valer mas guardar.`
            : `El item todavia esta lejos (${nextSpendGap} coins).`;
  const routeHint = isPremium
    ? 'Siguiente lectura util: vuelve a la tienda o a valor premium y usa esa ventaja para comprar con mas criterio.'
    : recommendedItem?.coins_cost <= balance
      ? `Siguiente lectura util: si ya puedes comprar ${recommendedItem?.name}, frena el bucle de anuncios y usa los coins con direccion.`
      : rewardViewsToGap > 0 && rewardViewsToGap <= 3
        ? `Siguiente lectura util: cierra ${nextSpendGap} coins con rewarded y vuelve a la compra cuando el gap desaparezca.`
        : balanceCoverage >= 70
          ? 'Siguiente lectura util: guardar coins hoy puede pagar mas que seguir cobrando si el dia ya esta bastante cubierto.'
          : similarDayComparison?.message
            ?? morningNarrative
            ?? 'Siguiente lectura util: si rewarded no cierra una compra clara, mejor usa esta capa para orientar la espera y no para entrar en inercia.';
  const nextActionTitle = isPremium
    ? 'Volver a la tienda'
    : recommendedItem?.coins_cost != null && recommendedItem.coins_cost <= balance
      ? `Comprar ${recommendedItem.name}`
      : rewardViewsToGap > 0 && rewardViewsToGap <= 3
        ? 'Ver anuncio y cerrar gap'
        : balanceCoverage >= 70
          ? 'Guardar coins'
          : 'Esperar mejor compra';
  const nextActionHint = isPremium
    ? 'Premium ya te ahorra esta friccion. Lo mejor ahora es usar la tienda o el valor premium con mas criterio.'
    : recommendedItem?.coins_cost != null && recommendedItem.coins_cost <= balance
      ? `La compra ya entra en tu balance y no necesita mas vueltas.`
      : rewardViewsToGap > 0 && rewardViewsToGap <= 3
        ? `${rewardViewsToGap} anuncio${rewardViewsToGap === 1 ? '' : 's'} dejan el item recomendado otra vez a tiro.`
        : balanceCoverage >= 70
          ? `Tu cobertura ya va por ${balanceCoverage}%, pero hoy conviene reservar antes de vaciar la economia.`
          : 'Rewarded suma coins, pero no siempre conviene convertirlo en accion inmediata.';

  return (
    <SafeScreen padHorizontal={false} padBottom>
      <Header title="Ruta rewarded" subtitle="Coins cuando cierran una compra" showBack color={Colors.coins} />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Card accentColor={Colors.coins}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionHeaderCopy}>
              <Text style={styles.sectionEyebrow}>Ruta rewarded</Text>
              <Text style={styles.sectionTitle}>{routeTitle}</Text>
              <Text style={styles.sectionHintWide} numberOfLines={3}>{routeBody}</Text>
            </View>
            <View style={styles.sectionIcon}>
              <Ionicons name="play-circle-outline" size={20} color={Colors.coins} />
            </View>
          </View>

          <View style={styles.actionRow}>
            {!isPremium ? (
              <RewardedAdButton
                context="store_coin_grind"
                label="Ver anuncio y sumar coins"
                coins={storeAdReward}
                hideWhenUnavailable={false}
                onReward={async (earned) => {
                  await addCoins(earned, 'ad_reward', 'Rewarded desde ruta economica de tienda');
                }}
              />
            ) : null}
            <Button
              variant="secondary"
              color={Colors.brand}
              onPress={() => {
                if (recommendedItem?.id) {
                  router.push({
                    pathname: Routes.store.item as any,
                    params: { itemId: recommendedItem.id },
                  });
                  return;
                }
                router.replace(Routes.store.shop as any);
              }}
            >
              {recommendedItem ? 'Ver recomendado' : 'Abrir tienda'}
            </Button>
          </View>

          <View style={styles.routeStatsRow}>
            <RouteStat
              label="Score"
              value={dayScore !== null ? `${dayScore}` : '--'}
              hint={predictedScore !== null ? `cierre ${predictedScore}` : 'sin score'}
              accent={scoreAccent}
            />
            <RouteStat label="Retorno" value={routeMode} hint="decision inmediata" accent={Colors.premium} />
            <RouteStat label="Ritmo" value={rhythmValue} hint={rhythmHint} accent={Colors.coins} />
          </View>

          <View style={styles.routeFocusCard}>
            <Text style={styles.routeFocusLabel}>Siguiente lectura</Text>
            <Text style={styles.routeFocusText} numberOfLines={3}>{routeHint}</Text>
          </View>

          <View style={styles.routeActionCard}>
            <Text style={styles.routeActionLabel}>Siguiente accion util</Text>
            <Text style={styles.routeActionTitle}>{nextActionTitle}</Text>
            <Text style={styles.routeActionHint} numberOfLines={3}>{nextActionHint}</Text>
          </View>
        </Card>

        <Card>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionHeaderCopy}>
              <Text style={styles.sectionTitle}>Pulso de coins</Text>
              <Text style={styles.sectionHintWide}>Lectura rapida de lo que ya movio la economia.</Text>
            </View>
          </View>

          <View style={styles.metricRow}>
            <View style={styles.metricCard}>
              <Text style={[styles.metricValue, { color: Colors.coins }]}>{storeAdEarnedToday}</Text>
              <Text style={styles.metricLabel}>ganados hoy</Text>
            </View>
            <View style={styles.metricCard}>
              <Text style={[styles.metricValue, { color: Colors.brand }]}>{storeAdReward}</Text>
              <Text style={styles.metricLabel}>por anuncio</Text>
            </View>
            <View style={styles.metricCard}>
              <Text style={[styles.metricValue, { color: Colors.premium }]}>
                {storeAdUnlimited ? 'Libre' : remainingCoins ?? 0}
              </Text>
              <Text style={styles.metricLabel}>{storeAdUnlimited ? 'sin tope' : 'coins restantes'}</Text>
            </View>
          </View>

          <View style={styles.metaRow}>
            <Text style={styles.metaText}>Ganados {totalCoinFlow.earned}</Text>
            <Text style={styles.metaText}>Gastados {totalCoinFlow.spent}</Text>
            <Text style={styles.metaText}>{canRunRewarded ? 'rewarded listo' : rewardedReady ? 'rewarded en pausa' : 'rewarded cargando'}</Text>
          </View>
        </Card>

        <Card accentColor={recommendedItem ? getAccent(recommendedItem) : Colors.coins}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionHeaderCopy}>
              <Text style={[styles.sectionEyebrow, recommendedItem ? { color: getAccent(recommendedItem) } : null]}>
                Cobrar o guardar
              </Text>
              <Text style={styles.sectionTitle}>Donde paga mirar otro anuncio</Text>
              <Text style={styles.sectionHintWide}>
                {recommendedItem
                  ? `${recommendedItem.name} marca si rewarded hoy acerca de verdad una compra o si conviene frenar.`
                  : 'Si no hay item claro, rewarded deberia sostener margen y no empujarte a gastar.'}
              </Text>
            </View>
          </View>

          <View style={styles.tensionGrid}>
            <TensionCard
              title={recommendedItem?.coins_cost != null && recommendedItem.coins_cost <= balance ? 'Compra lista' : 'Cobrar ahora'}
              body={
                recommendedItem
                  ? recommendedItem.coins_cost <= balance
                    ? `${recommendedItem.name} ya entra con tu balance actual (${balance} coins).`
                    : rewardViewsToGap > 0
                      ? `${rewardViewsToGap} rewarded ${rewardViewsToGap === 1 ? 'te deja' : 'te dejan'} cerca de ${recommendedItem.name}.`
                      : `Todavia faltan ${nextSpendGap} coins para el recomendado.`
                  : 'Hoy rewarded solo suma balance, no cierra una compra concreta.'
              }
              accent={Colors.coins}
              icon="flash-outline"
            />
            <TensionCard
              title="Esperar mejor"
              body={
                recommendedItem
                  ? balanceCoverage >= 70
                    ? `Tu cobertura ya va por ${balanceCoverage}%. Guardar coins hoy puede pagar mas que vaciar la caja.`
                    : 'Si el gap sigue largo, mejor usar rewarded con calma y no entrar en piloto automatico.'
                  : 'Sin item claro, esperar una recompensa mejor protege la economia del dia.'
              }
              accent={Colors.premium}
              icon="hourglass-outline"
            />
          </View>
        </Card>

        <Card accentColor={Colors.premium}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionHeaderCopy}>
              <Text style={[styles.sectionEyebrow, { color: Colors.premium }]}>Salida premium</Text>
              <Text style={styles.sectionTitle}>Cuando conviene no mirar anuncios</Text>
              <Text style={styles.sectionHintWide}>
                Premium paga cuando quieres comprar, analizar y moverte por VYRA sin depender del bucle de rewarded.
              </Text>
            </View>
          </View>

          <View style={styles.actionRow}>
            <Button variant="secondary" color={Colors.premium} onPress={() => router.push(Routes.premium.value as any)}>
              Abrir valor premium
            </Button>
            <Button variant="secondary" color={Colors.coach} onPress={() => router.push(Routes.premium.economy as any)}>
              Abrir economia
            </Button>
            <Button variant="secondary" color={Colors.brand} onPress={() => router.replace(Routes.store.shop as any)}>
              Volver a la tienda
            </Button>
          </View>

          {focusAction ? (
            <Text style={styles.footerHint}>
              Si el dia ya pide otra cosa, rewarded no deberia ganarle a {focusAction.title.toLowerCase()}.
            </Text>
          ) : null}
        </Card>

        <MonetizationBridgeCard
          current="rewarded"
          body="Rewarded ya no deberia sentirse como un desvio: ahora puede puentear tienda, economia y premium sin que pierdas la decision del dia."
          hint="Si rewarded ya cerro el gap, salta directo a compra o a economia. Si no, vuelve a valor premium y decide sin entrar en piloto automatico."
        />
      </ScrollView>
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
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: Spacing[3],
    marginBottom: Spacing[3],
  },
  sectionHeaderCopy: {
    flex: 1,
    gap: 4,
  },
  sectionEyebrow: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.xs,
    color: Colors.coins,
    letterSpacing: 0.3,
  },
  sectionTitle: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize['2xl'],
    color: Colors.textPrimary,
  },
  sectionHintWide: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  sectionIcon: {
    width: 42,
    height: 42,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: withOpacity(Colors.coins, 0.14),
  },
  routeStatsRow: {
    flexDirection: 'row',
    gap: Spacing[2],
    marginBottom: Spacing[3],
  },
  routeStat: {
    flex: 1,
    borderRadius: Radius.xl,
    padding: Spacing[4],
    backgroundColor: withOpacity(Colors.white, 0.04),
    borderWidth: 1,
    borderColor: withOpacity(Colors.white, 0.08),
    gap: 6,
  },
  routeStatLabel: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
  },
  routeStatValue: {
    fontFamily: FontFamily.display,
    fontSize: FontSize['2xl'],
  },
  routeStatHint: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    lineHeight: 16,
  },
  routeFocusCard: {
    borderRadius: Radius['2xl'],
    padding: Spacing[4],
    gap: 6,
    backgroundColor: withOpacity(Colors.coins, 0.08),
    borderWidth: 1,
    borderColor: withOpacity(Colors.coins, 0.18),
    marginBottom: Spacing[3],
  },
  routeFocusLabel: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.xs,
    color: Colors.coins,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  routeFocusText: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  routeActionCard: {
    borderRadius: Radius['2xl'],
    padding: Spacing[4],
    gap: 6,
    backgroundColor: withOpacity(Colors.premium, 0.08),
    borderWidth: 1,
    borderColor: withOpacity(Colors.premium, 0.18),
    marginBottom: Spacing[3],
  },
  routeActionLabel: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.xs,
    color: Colors.premium,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  routeActionTitle: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.lg,
    color: Colors.textPrimary,
  },
  routeActionHint: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  actionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing[2],
  },
  tensionGrid: {
    gap: Spacing[3],
  },
  tensionCard: {
    borderWidth: 1,
    borderRadius: Radius['2xl'],
    backgroundColor: withOpacity(Colors.surface2, 0.92),
    padding: Spacing[4],
    gap: Spacing[3],
  },
  tensionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[3],
  },
  tensionIcon: {
    width: 40,
    height: 40,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tensionTitle: {
    flex: 1,
    fontFamily: FontFamily.bold,
    fontSize: FontSize.base,
    color: Colors.textPrimary,
  },
  tensionBody: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  metricRow: {
    flexDirection: 'row',
    gap: Spacing[2],
  },
  metricCard: {
    flex: 1,
    borderRadius: Radius.xl,
    padding: Spacing[4],
    backgroundColor: withOpacity(Colors.white, 0.04),
    borderWidth: 1,
    borderColor: withOpacity(Colors.white, 0.08),
    gap: 6,
  },
  metricValue: {
    fontFamily: FontFamily.display,
    fontSize: FontSize['2xl'],
  },
  metricLabel: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    lineHeight: 16,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing[2],
    marginTop: Spacing[3],
  },
  metaText: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.xs,
    color: Colors.textMuted,
  },
  footerHint: {
    marginTop: Spacing[3],
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    lineHeight: 18,
    color: Colors.textSecondary,
  },
});
