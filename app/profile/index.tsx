import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, Stack } from 'expo-router';
import SafeScreen from '@/components/ui/SafeScreen';
import Card from '@/components/ui/Card';
import ConfirmationSheet from '@/components/ui/ConfirmationSheet';
import ScreenFooterSpacer from '@/components/ui/ScreenFooterSpacer';
import { Colors, withOpacity } from '@/constants/colors';
import { MODULES } from '@/constants/modules';
import { Routes } from '@/constants/routes';
import { FontFamily, FontSize, Radius, Spacing } from '@/constants/theme';
import { useAuthStore } from '@/stores/authStore';
import { useUIStore } from '@/stores/uiStore';
import { useWeight } from '@/hooks/useWeight';
import { useWorkout } from '@/hooks/useWorkout';
import { getActiveModules } from '@/lib/active-modules';
import { triggerImpactHaptic } from '@/lib/haptics';

type ProfileRowItem = {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  label: string;
  value?: string;
  route?: string;
  destructive?: boolean;
  iconColor?: string;
  onPress?: () => void;
};

function goalLabel(goal?: string | null) {
  switch (goal) {
    case 'gain_muscle':
      return 'Modo ganar musculo';
    case 'lose_fat':
      return 'Modo perder peso';
    case 'sport_performance':
    case 'performance':
      return 'Modo rendimiento';
    default:
      return 'Modo constancia';
  }
}

function QuickStat({
  label,
  value,
  onPress,
  compact = false,
}: {
  label: string;
  value: string;
  onPress: () => void;
  compact?: boolean;
}) {
  return (
    <Pressable
      style={[styles.quickStat, compact && styles.quickStatCompact]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${label}: ${value}`}
      accessibilityHint="Abre el detalle relacionado."
    >
      <Text style={styles.quickStatValue}>{value}</Text>
      <Text style={styles.quickStatLabel}>{label}</Text>
    </Pressable>
  );
}

function ProfileRow({
  icon,
  iconColor,
  label,
  value,
  onPress,
  destructive = false,
}: ProfileRowItem) {
  const resolvedIconColor = destructive ? Colors.error : iconColor ?? Colors.textMuted;
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      style={styles.row}
      android_ripple={{ color: withOpacity(Colors.white, 0.05) }}
      accessibilityRole={onPress ? 'button' : undefined}
      accessibilityLabel={label}
      accessibilityHint={value}
    >
      <View style={styles.rowIcon}>
        <Ionicons name={icon} size={18} color={resolvedIconColor} />
      </View>
      <View style={styles.rowCopy}>
        <Text style={[styles.rowLabel, destructive && styles.rowLabelDanger]}>{label}</Text>
        {value ? <Text style={styles.rowValue}>{value}</Text> : null}
      </View>
      {onPress ? <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} /> : null}
    </Pressable>
  );
}

function Section({ title, items }: { title: string; items: ProfileRowItem[] }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <Card style={styles.sectionCard} shadow={false}>
        {items.map((item, index) => (
          <View key={`${title}-${item.label}`}>
            <ProfileRow {...item} />
            {index < items.length - 1 ? <View style={styles.rowDivider} /> : null}
          </View>
        ))}
      </Card>
    </View>
  );
}

export default function ProfileSheetScreen() {
  const { width } = useWindowDimensions();
  const { profile, signOut } = useAuthStore();
  const showToast = useUIStore((state) => state.showToast);
  const { stats } = useWeight();
  const { history, getConsistencyStats } = useWorkout();
  const activeModules = getActiveModules(profile);
  const [signOutOpen, setSignOutOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  const consistency = getConsistencyStats();
  const isCompactWidth = width <= 390;
  const name = profile?.name?.trim() || 'Usuario';
  const initials = name
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
  const currentWeight = stats.current != null ? `${stats.current.toFixed(1)} kg` : '--';
  const lastSession = history[0];
  const lastSessionLabel = lastSession?.started_at
    ? `Hace ${Math.max(0, Math.round((Date.now() - new Date(lastSession.started_at).getTime()) / 86400000))} días`
    : 'Sin sesiones';

  const activityItems: ProfileRowItem[] = [
    {
      icon: 'barbell-outline',
      label: 'Entrenamiento y bloque activo',
      value: 'Rutina de hoy, programas y sesiones',
      route: Routes.workout.index,
    },
    {
      icon: 'analytics-outline',
      label: 'Progreso completo',
      value: 'Rachas, peso y sesiones recientes',
      route: Routes.tabs.progress,
    },
  ];

  const moduleFallbackIcons: Record<string, React.ComponentProps<typeof Ionicons>['name']> = {
    workout: 'barbell-outline',
    nutrition: 'restaurant-outline',
    water: 'water-outline',
    sleep: 'moon-outline',
    steps: 'footsteps-outline',
    fasting: 'timer-outline',
    female: 'flower-outline',
    supplements: 'medical-outline',
  };

  const moduleDescriptions: Record<string, string> = {
    workout: 'Plan y sesiones',
    nutrition: 'Comidas y macros',
    water: 'Hidratación y meta',
    sleep: 'Última noche y registro',
    steps: 'Pasos y caminatas',
    fasting: 'Timer y protocolo',
    female: 'Ciclo y síntomas',
    supplements: 'Stack y adherencia',
  };

  const moduleItems = activeModules.reduce<Array<{ tier: 'core' | 'contextual'; item: ProfileRowItem }>>((items, moduleId) => {
      const meta = MODULES.find((item) => item.id === moduleId);
      if (!meta) return items;
      items.push({
        tier: meta.tier,
        item: {
          icon: moduleFallbackIcons[moduleId] ?? 'grid-outline',
          label: meta.name,
          value: moduleDescriptions[moduleId] ?? meta.description,
          route: meta.route,
          iconColor: meta.color,
        },
      });
      return items;
    }, []);
  const coreModuleItems = moduleItems
    .filter((entry) => entry.tier === 'core')
    .map((entry) => entry.item);
  const contextualModuleItems = moduleItems
    .filter((entry) => entry.tier === 'contextual')
    .map((entry) => entry.item);

  const accountItems: ProfileRowItem[] = [
    {
      icon: 'sparkles-outline',
      label: 'Todo incluido',
      value: 'Las funciones siguen abiertas y parte del soporte del producto ahora vive en anuncios discretos fuera de los flujos sensibles.',
      route: Routes.premium.manage,
      iconColor: Colors.action,
    },
    {
      icon: 'settings-outline',
      label: 'Ajustes',
      value: 'Apariencia, widgets, notificaciones y privacidad',
      route: Routes.settings.index,
    },
    {
      icon: 'create-outline',
      label: 'Editar perfil',
      route: Routes.profile.edit,
    },
    {
      icon: 'shield-checkmark-outline',
      label: 'Cuenta y seguridad',
      route: Routes.settings.account,
    },
    {
      icon: 'download-outline',
      label: 'Exportar datos',
      route: Routes.profile.exportData,
    },
    {
      icon: 'gift-outline',
      label: 'Invitar a alguien',
      value: 'Comparte tu codigo y suma gente a tu red',
      route: Routes.profile.referral,
    },
    {
      icon: 'help-circle-outline',
      label: 'Soporte',
      route: Routes.profile.support,
    },
    {
      icon: 'trash-outline',
      label: 'Eliminar cuenta',
      route: Routes.profile.deleteAccount,
      destructive: true,
    },
  ];

  const handleLogout = () => {
    setSignOutOpen(true);
  };

  const confirmLogout = async () => {
    setSigningOut(true);
    try {
      void triggerImpactHaptic('light');
      await signOut();
      router.replace(Routes.auth.welcome as never);
    } catch {
      showToast('No pudimos cerrar la sesion en este momento.', 'error');
    } finally {
      setSigningOut(false);
      setSignOutOpen(false);
    }
  };

  return (
    <SafeScreen padHorizontal={false} padBottom={false}>
      <Stack.Screen
        options={{
          presentation: 'modal',
          animation: 'slide_from_bottom',
          headerShown: false,
        }}
      />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.handle} />

        <View style={styles.headerRow}>
          <View style={styles.identityRow}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{initials || 'V'}</Text>
            </View>

            <View style={styles.identityCopy}>
              <View style={styles.nameRow}>
                <Text style={styles.name}>{name}</Text>
              </View>
              <Text style={styles.goal}>{goalLabel(profile?.goal)}</Text>
            </View>
          </View>

          <Pressable
            style={styles.closeButton}
            onPress={() => router.back()}
            accessibilityRole="button"
            accessibilityLabel="Cerrar perfil"
            accessibilityHint="Vuelve a la pantalla anterior."
          >
            <Ionicons name="close" size={18} color={Colors.textPrimary} />
          </Pressable>
        </View>

        <View style={[styles.quickStatsRow, isCompactWidth && styles.quickStatsRowCompact]}>
          <QuickStat
            label="Peso actual"
            value={currentWeight}
            compact={isCompactWidth}
            onPress={() => router.push(Routes.tabs.progress as never)}
          />
          <QuickStat
            label="Racha"
            value={`${consistency.currentStreak} días`}
            compact={isCompactWidth}
            onPress={() => router.push(Routes.tabs.progress as never)}
          />
          <QuickStat
            label="Última sesión"
            value={lastSessionLabel}
            compact={isCompactWidth}
            onPress={() => {
              if (!lastSession) {
                router.push(Routes.tabs.progress as never);
                return;
              }
              router.push({
                pathname: Routes.workout.sessionDetail,
                params: { sessionId: lastSession.id },
              } as never);
            }}
          />
        </View>

        <Section
          title="Actividad"
          items={activityItems.map((item) => ({
            ...item,
            onPress: item.route ? () => router.push(item.route as never) : item.onPress,
          }))}
        />

        <Section
          title="Modulos core"
          items={coreModuleItems.map((item) => ({
            ...item,
            onPress: item.route ? () => router.push(item.route as never) : item.onPress,
          }))}
        />

        {contextualModuleItems.length ? (
          <Section
            title="Modulos contextuales"
            items={contextualModuleItems.map((item) => ({
              ...item,
              onPress: item.route ? () => router.push(item.route as never) : item.onPress,
            }))}
          />
        ) : null}

        <Section
          title="Cuenta y ajustes"
          items={accountItems.map((item) => ({
            ...item,
            onPress: item.route ? () => router.push(item.route as never) : item.onPress,
          }))}
        />

        <Pressable
          style={styles.logoutButton}
          onPress={handleLogout}
          accessibilityRole="button"
          accessibilityLabel="Cerrar sesión"
          accessibilityHint="Cierra tu sesión en este dispositivo."
        >
          <Text style={styles.logoutText}>Cerrar sesión</Text>
        </Pressable>

        <ScreenFooterSpacer />
      </ScrollView>

      <ConfirmationSheet
        visible={signOutOpen}
        onClose={() => setSignOutOpen(false)}
        title="Cerrar sesion"
        body="Se cerrara tu sesion en este dispositivo. Tu cuenta y tu historial seguiran disponibles cuando vuelvas a entrar."
        confirmLabel={signingOut ? 'Cerrando sesion...' : 'Cerrar sesion'}
        onConfirm={() => {
          void confirmLogout();
        }}
        confirmVariant="danger"
        loading={signingOut}
      />
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingHorizontal: Spacing[5],
    paddingTop: Spacing[3],
    gap: Spacing[4],
  },
  handle: {
    alignSelf: 'center',
    width: 36,
    height: 4,
    borderRadius: Radius.full,
    backgroundColor: Colors.bgElevated,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: Spacing[3],
  },
  identityRow: {
    flexDirection: 'row',
    gap: Spacing[3],
    flex: 1,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: withOpacity(Colors.action, 0.12),
    borderWidth: 1,
    borderColor: withOpacity(Colors.action, 0.22),
  },
  avatarText: {
    fontFamily: FontFamily.display,
    fontSize: 24,
    color: Colors.action,
  },
  identityCopy: {
    flex: 1,
    gap: 6,
    justifyContent: 'center',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[2],
    flexWrap: 'wrap',
  },
  name: {
    fontFamily: FontFamily.bold,
    fontSize: 20,
    color: Colors.textPrimary,
  },
  goal: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.base,
    color: Colors.textSecondary,
  },
  premiumChip: {
    alignSelf: 'flex-start',
    borderRadius: Radius.full,
    paddingHorizontal: Spacing[2.5],
    paddingVertical: Spacing[1],
    backgroundColor: withOpacity(Colors.action, 0.14),
  },
  premiumChipText: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.xs,
    color: Colors.action,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.bgSurface,
    borderWidth: 1,
    borderColor: withOpacity(Colors.white, 0.08),
  },
  quickStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing[3],
  },
  quickStatsRowCompact: {
    flexDirection: 'column',
  },
  quickStat: {
    flex: 1,
    gap: 4,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: withOpacity(Colors.white, 0.06),
    backgroundColor: Colors.bgSurface,
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[3],
  },
  quickStatCompact: {
    flex: 0,
  },
  quickStatValue: {
    fontFamily: FontFamily.bold,
    fontSize: 20,
    color: Colors.textPrimary,
    flexShrink: 1,
  },
  quickStatLabel: {
    fontFamily: FontFamily.regular,
    fontSize: 12,
    color: Colors.textMuted,
    flexShrink: 1,
  },
  section: {
    gap: Spacing[2],
  },
  sectionTitle: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.xs,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: Colors.textMuted,
  },
  sectionCard: {
    paddingVertical: 0,
  },
  row: {
    minHeight: 60,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[3],
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[3],
  },
  rowIcon: {
    width: 28,
    alignItems: 'center',
  },
  rowCopy: {
    flex: 1,
    gap: 2,
  },
  rowLabel: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.base,
    color: Colors.textPrimary,
  },
  rowLabelDanger: {
    color: Colors.error,
  },
  rowValue: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  rowDivider: {
    height: 1,
    marginLeft: Spacing[4] + 28 + Spacing[3],
    backgroundColor: withOpacity(Colors.white, 0.06),
  },
  premiumUpsell: {
    gap: Spacing[2],
    borderWidth: 1,
    borderColor: withOpacity(Colors.action, 0.18),
    backgroundColor: withOpacity(Colors.action, 0.06),
  },
  premiumUpsellEyebrow: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.xs,
    color: Colors.action,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  premiumUpsellTitle: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.base,
    color: Colors.textPrimary,
  },
  premiumUpsellBody: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  logoutButton: {
    alignItems: 'center',
    paddingVertical: Spacing[3],
  },
  logoutText: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.base,
    color: Colors.error,
  },
});
