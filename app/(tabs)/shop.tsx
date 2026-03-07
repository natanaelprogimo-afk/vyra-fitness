import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import SafeScreen from '@/components/ui/SafeScreen';
import { Header } from '@/components/layout/Header';
import Card from '@/components/ui/Card';
import CoinBadge from '@/components/ui/CoinBadge';
import { RewardedAdButton } from '@/components/ui/RewardedAdButton';
import UnityAdBanner from '@/components/ui/UnityAdBanner';
import Button from '@/components/ui/Button';
import { Colors } from '@/constants/colors';
import { FontFamily, Spacing, Radius } from '@/constants/theme';
import { useCoins } from '@/hooks/useCoins';
import { useAds } from '@/hooks/useAds';

interface StoreItem {
  id:          string;
  name:        string;
  description: string;
  emoji:       string;
  price:       number;
  category:    'boost' | 'cosmetic' | 'feature';
}

const STORE_ITEMS: StoreItem[] = [
  // Boosts
  {
    id: 'streak_rescue',
    name: 'Rescate de racha',
    description: 'Protegé tu racha por 24 horas extra si perdés un día',
    emoji: '🛡️',
    price: 100,
    category: 'boost',
  },
  {
    id: 'double_xp_day',
    name: '2× XP — 24 horas',
    description: 'Todo el XP que ganes hoy se duplica',
    emoji: '⚡',
    price: 150,
    category: 'boost',
  },
  {
    id: 'barcode_pack',
    name: '50 scans de barcode',
    description: 'Pack de 50 escaneos extra para el semana',
    emoji: '📦',
    price: 80,
    category: 'boost',
  },
  {
    id: 'coach_messages_pack',
    name: '+20 mensajes coach',
    description: '20 mensajes extra al coach IA esta semana',
    emoji: '🤖',
    price: 120,
    category: 'boost',
  },
  // Cosméticos
  {
    id: 'theme_dark_gold',
    name: 'Tema Dark Gold',
    description: 'Acento dorado premium en toda la interfaz',
    emoji: '✨',
    price: 200,
    category: 'cosmetic',
  },
  {
    id: 'coach_name_custom',
    name: 'Nombre del coach',
    description: 'Elegí el nombre de tu coach IA',
    emoji: '🏷️',
    price: 75,
    category: 'cosmetic',
  },
  {
    id: 'avatar_fire',
    name: 'Avatar Fuego',
    description: 'Avatar exclusivo de llama para tu perfil',
    emoji: '🔥',
    price: 150,
    category: 'cosmetic',
  },
  // Features
  {
    id: 'weight_photos_pack',
    name: 'Pack fotos de progreso',
    description: '30 fotos extra en el módulo de peso',
    emoji: '📸',
    price: 100,
    category: 'feature',
  },
  {
    id: 'export_csv',
    name: 'Exportar datos (CSV)',
    description: 'Exportá todos tus datos a un archivo CSV',
    emoji: '📊',
    price: 50,
    category: 'feature',
  },
];

const CATEGORY_LABELS = {
  boost:    '⚡ Boosts',
  cosmetic: '🎨 Cosméticos',
  feature:  '🔧 Features',
};

export default function StoreScreen() {
  const { balance, spendCoins, addCoins } = useCoins();
  const { showInterstitial } = useAds();
  const [purchasing, setPurchasing] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<'boost' | 'cosmetic' | 'feature'>('boost');

  useEffect(() => {
    void showInterstitial();
  }, [showInterstitial]);

  const filteredItems = STORE_ITEMS.filter((i) => i.category === activeCategory);

  const handlePurchase = async (item: StoreItem) => {
    if (balance < item.price) {
      Alert.alert(
        'Coins insuficientes',
        `Necesitás ${item.price} 🪙 pero tenés ${balance}. Ganá más completando módulos o viendo anuncios.`,
      );
      return;
    }

    Alert.alert(
      `Comprar ${item.name}`,
      `¿Confirmás el gasto de ${item.price} 🪙?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Confirmar',
          onPress: async () => {
            setPurchasing(item.id);
            const ok = await spendCoins(item.price, `Compra: ${item.name}`);
            if (ok) {
              await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              Alert.alert('¡Comprado! 🎉', `${item.emoji} ${item.name} ya está activo.`);
            } else {
              Alert.alert('Error', 'No se pudo completar la compra. Tus coins no se modificaron.');
            }
            setPurchasing(null);
          },
        },
      ],
    );
  };

  return (
    <SafeScreen padHorizontal={false} padBottom>
      <Header title="Tienda" showBack color={Colors.coins} />

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Balance */}
        <Card style={styles.balanceCard}>
          <View style={styles.balanceRow}>
            <View>
              <Text style={styles.balanceLabel}>Tus coins</Text>
              <Text style={styles.balanceAmount}>{balance} 🪙</Text>
            </View>
            <RewardedAdButton
              context="store_discount"
              label="Ganar coins"
              coins={15}
              onReward={(earned) => addCoins(earned, 'ad_reward', 'Anuncio en tienda')}
            />
          </View>

          {/* Cómo ganar más */}
          <View style={styles.earnTips}>
            <Text style={styles.earnTipsTitle}>Cómo ganar más coins</Text>
            {[
              ['✅', 'Completar módulos del día', '+5–15 🪙'],
              ['🔥', 'Mantener tu racha diaria', '+10 🪙/día'],
              ['🏆', 'Desbloquear un badge', '+25–400 🪙'],
              ['💪', 'Completar un entreno', '+25 🪙'],
              ['▶', 'Ver anuncio rewarded', '+15 🪙'],
            ].map(([icon, label, amount], i) => (
              <View key={i} style={styles.earnTip}>
                <Text style={styles.earnTipIcon}>{icon}</Text>
                <Text style={styles.earnTipLabel}>{label}</Text>
                <Text style={styles.earnTipAmount}>{amount}</Text>
              </View>
            ))}
          </View>
        </Card>

        <UnityAdBanner style={styles.banner} />

        {/* Filtro categorías */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryRow}
        >
          {(['boost', 'cosmetic', 'feature'] as const).map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[
                styles.categoryPill,
                activeCategory === cat && styles.categoryPillActive,
              ]}
              onPress={() => setActiveCategory(cat)}
            >
              <Text style={[
                styles.categoryPillText,
                activeCategory === cat && styles.categoryPillTextActive,
              ]}>
                {CATEGORY_LABELS[cat]}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Items */}
        {filteredItems.map((item) => {
          const canAfford = balance >= item.price;
          const isBuying = purchasing === item.id;
          return (
            <TouchableOpacity
              key={item.id}
              style={[styles.itemCard, !canAfford && styles.itemCardDisabled]}
              onPress={() => handlePurchase(item)}
              disabled={isBuying}
              activeOpacity={0.85}
            >
              <Text style={styles.itemEmoji}>{item.emoji}</Text>
              <View style={styles.itemInfo}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemDesc}>{item.description}</Text>
              </View>
              <View style={styles.itemPrice}>
                <Text style={[styles.itemPriceText, !canAfford && styles.itemPriceInsufficient]}>
                  {item.price} 🪙
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingHorizontal: Spacing[5],
    paddingBottom: Spacing[10],
    paddingTop: Spacing[4],
    gap: Spacing[4],
  },
  balanceCard: { gap: Spacing[4] },
  balanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  balanceLabel: {
    fontFamily: FontFamily.regular,
    fontSize: 14,
    color: Colors.textSecondary,
  },
  balanceAmount: {
    fontFamily: FontFamily.bold,
    fontSize: 32,
    color: Colors.coins,
  },
  earnTips: {
    backgroundColor: Colors.bgElevated,
    borderRadius: Radius.lg,
    padding: Spacing[3],
    gap: Spacing[2],
  },
  earnTipsTitle: {
    fontFamily: FontFamily.bold,
    fontSize: 14,
    color: Colors.textPrimary,
    marginBottom: Spacing[1],
  },
  earnTip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[2],
  },
  earnTipIcon: { fontSize: 16, width: 24 },
  earnTipLabel: {
    fontFamily: FontFamily.regular,
    fontSize: 13,
    color: Colors.textSecondary,
    flex: 1,
  },
  earnTipAmount: {
    fontFamily: FontFamily.bold,
    fontSize: 13,
    color: Colors.coins,
  },
  categoryRow: {
    gap: Spacing[2],
    paddingVertical: Spacing[1],
  },
  categoryPill: {
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[2],
    borderRadius: Radius.full,
    backgroundColor: Colors.bgSurface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  categoryPillActive: {
    backgroundColor: Colors.coins,
    borderColor: Colors.coins,
  },
  categoryPillText: {
    fontFamily: FontFamily.medium,
    fontSize: 14,
    color: Colors.textSecondary,
  },
  categoryPillTextActive: {
    color: Colors.bgPrimary,
  },
  itemCard: {
    backgroundColor: Colors.bgSurface,
    borderRadius: Radius.xl,
    padding: Spacing[4],
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[3],
    borderWidth: 1,
    borderColor: Colors.border,
  },
  itemCardDisabled: { opacity: 0.5 },
  itemEmoji: { fontSize: 32, width: 44, textAlign: 'center' },
  itemInfo: { flex: 1, gap: 4 },
  itemName: {
    fontFamily: FontFamily.bold,
    fontSize: 15,
    color: Colors.textPrimary,
  },
  itemDesc: {
    fontFamily: FontFamily.regular,
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  itemPrice: { alignItems: 'flex-end' },
  itemPriceText: {
    fontFamily: FontFamily.bold,
    fontSize: 15,
    color: Colors.coins,
  },
  itemPriceInsufficient: { color: Colors.textMuted },
  banner: {
    alignSelf: 'center',
  },
});
