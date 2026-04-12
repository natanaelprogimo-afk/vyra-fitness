import React from 'react';
import { TouchableOpacity, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import Card from '@/components/ui/Card';
import { Colors, withOpacity } from '@/constants/colors';
import { Routes } from '@/constants/routes';
import { FontFamily, FontSize, Radius, Spacing } from '@/constants/theme';

export type MonetizationSurface =
  | 'paywall'
  | 'manage'
  | 'value'
  | 'pricing'
  | 'economy'
  | 'shop'
  | 'rewarded';

type MonetizationBridgeCardProps = {
  current: MonetizationSurface;
  title?: string;
  body?: string;
  hint?: string;
  surfaces?: MonetizationSurface[];
};

const SURFACE_META: Record<
  MonetizationSurface,
  {
    label: string;
    icon: keyof typeof Ionicons.glyphMap;
    accent: string;
    route: string;
  }
> = {
  paywall: {
    label: 'Paywall',
    icon: 'sparkles-outline',
    accent: Colors.premium,
    route: Routes.premium.paywall,
  },
  manage: {
    label: 'Gestion',
    icon: 'shield-checkmark-outline',
    accent: Colors.premium,
    route: Routes.premium.manage,
  },
  value: {
    label: 'Valor',
    icon: 'stats-chart-outline',
    accent: Colors.coach,
    route: Routes.premium.value,
  },
  pricing: {
    label: 'Pricing',
    icon: 'pricetag-outline',
    accent: Colors.premium,
    route: Routes.premium.pricing,
  },
  economy: {
    label: 'Economia',
    icon: 'swap-horizontal-outline',
    accent: Colors.coach,
    route: Routes.premium.economy,
  },
  shop: {
    label: 'Tienda',
    icon: 'bag-handle-outline',
    accent: Colors.coins,
    route: Routes.store.shop,
  },
  rewarded: {
    label: 'Rewarded',
    icon: 'play-circle-outline',
    accent: Colors.coins,
    route: Routes.store.rewarded,
  },
};

const DEFAULT_ORDER: MonetizationSurface[] = ['paywall', 'value', 'pricing', 'economy', 'shop', 'rewarded', 'manage'];

export default function MonetizationBridgeCard({
  current,
  title = 'Puente de monetizacion',
  body = 'Premium, pricing, tienda y rewarded funcionan mejor cuando saltas entre capas sin perder la lectura del dia.',
  hint = 'Si esta capa ya te dio una decision clara, usa el puente solo para seguir con continuidad y no para abrir mas ruido.',
  surfaces = DEFAULT_ORDER,
}: MonetizationBridgeCardProps) {
  const currentMeta = SURFACE_META[current];

  return (
    <Card style={styles.card} accentColor={currentMeta.accent}>
      <Text style={[styles.eyebrow, { color: currentMeta.accent }]}>{title}</Text>
      <Text style={styles.title}>Toda la monetizacion deberia sentirse como una sola ruta util.</Text>
      <Text style={styles.body}>{body}</Text>

      <View style={styles.grid}>
        {surfaces.map((surface) => {
          const meta = SURFACE_META[surface];
          const isCurrent = surface === current;
          const chip = (
            <>
              <View style={[styles.iconWrap, { backgroundColor: withOpacity(meta.accent, 0.16) }]}>
                <Ionicons name={meta.icon} size={16} color={meta.accent} />
              </View>
              <Text style={styles.chipLabel}>{meta.label}</Text>
              <View
                style={[
                  styles.badge,
                  isCurrent
                    ? { backgroundColor: withOpacity(meta.accent, 0.2), borderColor: withOpacity(meta.accent, 0.3) }
                    : undefined,
                ]}
              >
                <Text style={[styles.badgeText, isCurrent ? { color: meta.accent } : undefined]}>
                  {isCurrent ? 'Ahora' : 'Abrir'}
                </Text>
              </View>
            </>
          );

          if (isCurrent) {
            return (
              <View
                key={surface}
                style={[
                  styles.chip,
                  styles.chipCurrent,
                  {
                    borderColor: withOpacity(meta.accent, 0.34),
                    backgroundColor: withOpacity(meta.accent, 0.1),
                  },
                ]}
              >
                {chip}
              </View>
            );
          }

          return (
            <TouchableOpacity
              key={surface}
              activeOpacity={0.88}
              style={styles.chip}
              onPress={() => router.push(meta.route as any)}
            >
              {chip}
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.hintCard}>
        <Ionicons name="git-network-outline" size={16} color={currentMeta.accent} />
        <Text style={styles.hintText}>{hint}</Text>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: Spacing[3],
  },
  eyebrow: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.xs,
    letterSpacing: 0.3,
  },
  title: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.lg,
    color: Colors.textPrimary,
    lineHeight: 28,
  },
  body: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    lineHeight: 22,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing[2],
  },
  chip: {
    minWidth: '30%',
    flexGrow: 1,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
    backgroundColor: withOpacity(Colors.white, 0.03),
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[3],
    gap: Spacing[2],
  },
  chipCurrent: {
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 18,
    elevation: 4,
  },
  iconWrap: {
    width: 30,
    height: 30,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipLabel: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.sm,
    color: Colors.textPrimary,
  },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing[2],
    paddingVertical: Spacing[1],
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
    backgroundColor: withOpacity(Colors.white, 0.04),
  },
  badgeText: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.xs,
    color: Colors.textMuted,
  },
  hintCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing[2],
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
    backgroundColor: withOpacity(Colors.white, 0.03),
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[3],
  },
  hintText: {
    flex: 1,
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    lineHeight: 20,
    color: Colors.textSecondary,
  },
});
