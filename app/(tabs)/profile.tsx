import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import * as StoreReview from 'expo-store-review';
import SafeScreen from '@/components/ui/SafeScreen';
import { Header } from '@/components/layout/Header';
import Card from '@/components/ui/Card';
import CoinBadge from '@/components/ui/CoinBadge';
import { Colors } from '@/constants/colors';
import { FontFamily, Spacing, Radius } from '@/constants/theme';
import { useAuthStore } from '@/stores/authStore';
import { usePremium } from '@/hooks/usePremium';
import { useCoins } from '@/hooks/useCoins';
import { useBadges } from '@/hooks/useBadges';
import { useSettingsStore } from '@/stores/settingsStore';

function ProfileRow({
  emoji,
  label,
  value,
  onPress,
  destructive = false,
}: {
  emoji:       string;
  label:       string;
  value?:      string;
  onPress?:    () => void;
  destructive?: boolean;
}) {
  return (
    <TouchableOpacity
      style={styles.row}
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <Text style={styles.rowEmoji}>{emoji}</Text>
      <Text style={[styles.rowLabel, destructive && styles.rowLabelDestructive]}>
        {label}
      </Text>
      {value && <Text style={styles.rowValue}>{value}</Text>}
      {onPress && <Text style={styles.rowChevron}>›</Text>}
    </TouchableOpacity>
  );
}

function SectionTitle({ title }: { title: string }) {
  return <Text style={styles.sectionTitle}>{title}</Text>;
}

export default function ProfileScreen() {
  const { profile, signOut } = useAuthStore();
  const { isPremium, isInTrial, trialDaysLeft, checkStatus } = usePremium();
  const { balance } = useCoins();
  const { getProgress } = useBadges();
  const settings = useSettingsStore();

  const badgeProgress = getProgress();

  const handleStoreReview = async () => {
    const available = await StoreReview.isAvailableAsync();
    if (available) {
      await StoreReview.requestReview();
      return;
    }

    Alert.alert(
      'Valoracion no disponible',
      'La valoracion desde este dispositivo no esta disponible todavia. Podras hacerlo cuando la app este publicada en tu tienda.',
    );
  };

  const handleLogout = () => {
    Alert.alert(
      'Cerrar sesión',
      '¿Seguro que querés salir? Tus datos están guardados en la nube.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Cerrar sesión',
          style: 'destructive',
          onPress: async () => {
            await signOut();
            router.replace('/(auth)/welcome' as any);
          },
        },
      ],
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Eliminar cuenta',
      '¿Estás seguro? Esta acción es irreversible. Todos tus datos serán eliminados de forma permanente según nuestra política GDPR.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Sí, eliminar mi cuenta',
          style: 'destructive',
          onPress: () => router.push('/profile/delete-account' as any),
        },
      ],
    );
  };

  const name = profile?.name ?? 'Usuario';
  const email = profile?.email ?? '';
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <SafeScreen padHorizontal={false} padBottom={false}>
      <Header title="Perfil" color={Colors.brand} />

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Avatar + nombre */}
        <Card style={styles.avatarCard}>
          <View style={styles.avatarRow}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{initials}</Text>
            </View>
            <View style={styles.avatarInfo}>
              <Text style={styles.userName}>{name}</Text>
              <Text style={styles.userEmail}>{email}</Text>
              {isPremium ? (
                <View style={styles.premiumBadge}>
                  <Text style={styles.premiumBadgeText}>
                    {isInTrial ? `💎 Trial — ${trialDaysLeft}d restantes` : '💎 Premium'}
                  </Text>
                </View>
              ) : (
                <TouchableOpacity
                  style={styles.upgradeBadge}
                  onPress={() => router.push('/premium/paywall' as any)}
                >
                  <Text style={styles.upgradeBadgeText}>✦ Subir a Premium</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Stats rápidos */}
          <View style={styles.quickStats}>
            <QuickStat label="Coins" value={`${balance} 🪙`} />
            <View style={styles.statDivider} />
            <QuickStat label="Badges" value={`${badgeProgress.unlocked}/${badgeProgress.total}`} />
            <View style={styles.statDivider} />
            <QuickStat label="Racha" value={`${profile?.streak ?? profile?.current_streak ?? 0} 🔥`} />
          </View>
        </Card>

        {/* Cuenta */}
        <SectionTitle title="Cuenta" />
        <Card style={styles.card}>
          <ProfileRow
            emoji="👤"
            label="Editar perfil"
            onPress={() => router.push('/profile/edit' as any)}
          />
          <ProfileRow
            emoji="⚖️"
            label="Objetivo de peso"
            value={profile?.weight_goal_kg ? `${profile.weight_goal_kg} kg` : 'Sin definir'}
            onPress={() => router.push('/profile/weight-goal' as any)}
          />
          <ProfileRow
            emoji="🔒"
            label="Cambiar contraseña"
            onPress={() => router.push('/profile/change-password' as any)}
          />
        </Card>

        {/* Suscripción */}
        <SectionTitle title="Suscripción" />
        <Card style={styles.card}>
          {isPremium ? (
            <>
              <ProfileRow
                emoji="💎"
                label="Gestionar Premium"
                value="Activo"
                onPress={() => router.push('/premium/manage' as any)}
              />
            </>
          ) : (
          <ProfileRow
            emoji="✦"
            label="Subir a Premium"
            value="Mensual o anual"
            onPress={() => router.push('/premium/paywall' as any)}
          />
          )}
          <ProfileRow
            emoji="🛒"
            label="Tienda de coins"
            onPress={() => router.push('/store/shop' as any)}
          />
          <ProfileRow
            emoji="🏆"
            label="Mis badges"
            onPress={() => router.push('/gamification/badges' as any)}
          />
        </Card>

        {/* Módulos */}
        <SectionTitle title="Módulos" />
        <Card style={styles.card}>
          <ProfileRow
            emoji="💧"
            label="Ajustes de agua"
            onPress={() => router.push('/modules/water/settings' as any)}
          />
          <ProfileRow
            emoji="🚶"
            label="Ajustes de pasos"
            onPress={() => router.push('/modules/steps/settings' as any)}
          />
          <ProfileRow
            emoji="😴"
            label="Ajustes de sueño"
            onPress={() => router.push('/modules/sleep/settings' as any)}
          />
          <ToggleRow
            emoji="🌸"
            label="Salud femenina"
            value={profile?.female_health_enabled ?? false}
            onToggle={() => router.push('/profile/female-health' as any)}
          />
        </Card>

        {/* Preferencias */}
        <SectionTitle title="Preferencias" />
        <Card style={styles.card}>
          <ToggleRow
            emoji="🔔"
            label="Notificaciones"
            value={settings.notificationsEnabled ?? true}
            onToggle={(v) => settings.setNotificationsEnabled(v)}
          />
          <ToggleRow
            emoji="📳"
            label="Vibración (haptics)"
            value={settings.hapticsEnabled ?? true}
            onToggle={(v) => settings.setHapticsEnabled(v)}
          />
          <ProfileRow
            emoji="🌐"
            label="Idioma"
            value="Español (AR)"
            onPress={() => {}} // pendiente F25
          />
        </Card>

        {/* Legal */}
        <SectionTitle title="Legal" />
        <Card style={styles.card}>
          <ProfileRow
            emoji="📋"
            label="Términos de servicio"
            onPress={() => router.push('/legal/terms' as any)}
          />
          <ProfileRow
            emoji="🔏"
            label="Política de privacidad"
            onPress={() => router.push('/legal/privacy' as any)}
          />
          <ProfileRow
            emoji="🗑️"
            label="Solicitar eliminación de datos (GDPR)"
            onPress={handleDeleteAccount}
          />
        </Card>

        {/* Sobre la app */}
        <SectionTitle title="Sobre Vyra" />
        <Card style={styles.card}>
          <ProfileRow emoji="ℹ️" label="Versión" value="1.0.0 (build 1)" />
          <ProfileRow
            emoji="⭐"
            label="Valorar en la tienda"
            onPress={() => { void handleStoreReview(); }}
          />
          <ProfileRow
            emoji="💬"
            label="Contactar soporte"
            onPress={() => router.push('/profile/support' as any)}
          />
        </Card>

        {/* Logout */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Text style={styles.logoutText}>Cerrar sesión</Text>
        </TouchableOpacity>

        <View style={styles.bottomPad} />
      </ScrollView>
    </SafeScreen>
  );
}

function QuickStat({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.quickStat}>
      <Text style={styles.quickStatValue}>{value}</Text>
      <Text style={styles.quickStatLabel}>{label}</Text>
    </View>
  );
}

function ToggleRow({
  emoji,
  label,
  value,
  onToggle,
}: {
  emoji:    string;
  label:    string;
  value:    boolean;
  onToggle: (v: boolean) => void;
}) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowEmoji}>{emoji}</Text>
      <Text style={[styles.rowLabel, { flex: 1 }]}>{label}</Text>
      <Switch
        value={value}
        onValueChange={(v) => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          onToggle(v);
        }}
        trackColor={{ false: Colors.bgElevated, true: `${Colors.brand}80` }}
        thumbColor={value ? Colors.brand : Colors.textMuted}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingHorizontal: Spacing[5],
    paddingTop: Spacing[4],
    gap: Spacing[3],
  },
  avatarCard: { gap: Spacing[4] },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[4],
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.brand,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontFamily: FontFamily.bold,
    fontSize: 24,
    color: '#fff',
  },
  avatarInfo: { flex: 1, gap: 4 },
  userName: {
    fontFamily: FontFamily.bold,
    fontSize: 20,
    color: Colors.textPrimary,
  },
  userEmail: {
    fontFamily: FontFamily.regular,
    fontSize: 14,
    color: Colors.textSecondary,
  },
  premiumBadge: {
    alignSelf: 'flex-start',
    backgroundColor: `${Colors.premium}20`,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing[3],
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: Colors.premium,
    marginTop: 4,
  },
  premiumBadgeText: {
    fontFamily: FontFamily.bold,
    fontSize: 12,
    color: Colors.premium,
  },
  upgradeBadge: {
    alignSelf: 'flex-start',
    backgroundColor: `${Colors.brand}20`,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing[3],
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: Colors.brand,
    marginTop: 4,
  },
  upgradeBadgeText: {
    fontFamily: FontFamily.bold,
    fontSize: 12,
    color: Colors.brand,
  },
  quickStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: Spacing[4],
  },
  quickStat: { alignItems: 'center', gap: 4 },
  quickStatValue: {
    fontFamily: FontFamily.bold,
    fontSize: 18,
    color: Colors.textPrimary,
  },
  quickStatLabel: {
    fontFamily: FontFamily.regular,
    fontSize: 12,
    color: Colors.textMuted,
  },
  statDivider: {
    width: 1,
    backgroundColor: Colors.border,
    marginVertical: 4,
  },
  sectionTitle: {
    fontFamily: FontFamily.bold,
    fontSize: 12,
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    paddingHorizontal: Spacing[2],
    marginTop: Spacing[2],
  },
  card: { gap: 0, padding: 0, overflow: 'hidden' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: `${Colors.border}60`,
    gap: Spacing[3],
  },
  rowEmoji: { fontSize: 18, width: 28, textAlign: 'center' },
  rowLabel: {
    fontFamily: FontFamily.medium,
    fontSize: 15,
    color: Colors.textPrimary,
    flex: 1,
  },
  rowLabelDestructive: { color: Colors.error },
  rowValue: {
    fontFamily: FontFamily.regular,
    fontSize: 14,
    color: Colors.textMuted,
  },
  rowChevron: {
    fontFamily: FontFamily.bold,
    fontSize: 20,
    color: Colors.textMuted,
    lineHeight: 22,
  },
  logoutBtn: {
    backgroundColor: `${Colors.error}15`,
    borderRadius: Radius.xl,
    padding: Spacing[4],
    alignItems: 'center',
    borderWidth: 1,
    borderColor: `${Colors.error}40`,
    marginTop: Spacing[2],
  },
  logoutText: {
    fontFamily: FontFamily.bold,
    fontSize: 16,
    color: Colors.error,
  },
  bottomPad: { height: 100 },
});
