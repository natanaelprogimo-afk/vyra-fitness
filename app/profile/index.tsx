import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, Stack } from 'expo-router';
import * as Haptics from 'expo-haptics';
import SafeScreen from '@/components/ui/SafeScreen';
import Card from '@/components/ui/Card';
import { Colors, withOpacity } from '@/constants/colors';
import { Routes } from '@/constants/routes';
import { FontFamily, FontSize, Radius, Spacing } from '@/constants/theme';
import { useAuthStore } from '@/stores/authStore';
import { useWeight } from '@/hooks/useWeight';
import { useWorkout } from '@/hooks/useWorkout';
import { getActiveModules } from '@/lib/active-modules';

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

function QuickStat({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.quickStat}>
      <Text style={styles.quickStatValue}>{value}</Text>
      <Text style={styles.quickStatLabel}>{label}</Text>
    </View>
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
  const { profile, signOut } = useAuthStore();
  const { stats } = useWeight();
  const { history, getConsistencyStats } = useWorkout();
  const activeModules = getActiveModules(profile);

  const consistency = getConsistencyStats();
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
    ? `Hace ${Math.max(0, Math.round((Date.now() - new Date(lastSession.started_at).getTime()) / 86400000))} dias`
    : 'Sin sesiones';

  const trainingItems: ProfileRowItem[] = [
    {
      icon: 'barbell-outline',
      label: 'Plan actual',
      value: 'Ver bloque y programas',
      route: Routes.workout.programs,
    },
    {
      icon: 'albums-outline',
      label: 'Rutinas guardadas',
      value: 'Abrir biblioteca',
      route: Routes.workout.routines,
    },
    {
      icon: 'time-outline',
      label: 'Historial completo',
      value: 'Sesiones y detalle',
      route: Routes.progress.history,
    },
  ];

  const moduleItems: ProfileRowItem[] = [
    {
      icon: 'grid-outline',
      label: 'Modulos adicionales',
      value: 'Activar o desactivar modulos',
      route: Routes.settings.modules,
    },
    {
      icon: 'restaurant-outline',
      label: 'Nutricion',
      value: 'Registro y comidas del dia',
      route: Routes.nutrition.index,
      iconColor: Colors.nutrition,
    },
    {
      icon: 'water-outline',
      label: 'Agua',
      value: 'Registro rapido',
      route: Routes.water.index,
      iconColor: Colors.water,
    },
    {
      icon: 'moon-outline',
      label: 'Sueno',
      value: 'Ultimo descanso y log',
      route: Routes.sleep.index,
      iconColor: Colors.sleep,
    },
  ];

  if (profile?.female_health_enabled) {
    moduleItems.push({
      icon: 'flower-outline',
      label: 'Salud femenina',
      value: 'Ciclo y sintomas',
      route: Routes.female.index,
      iconColor: Colors.female,
    });
  }

  if (activeModules.includes('fasting')) {
    moduleItems.push({
      icon: 'timer-outline',
      label: 'Ayuno',
      value: 'Timer, protocolo e historial',
      route: Routes.fasting.index,
      iconColor: Colors.fasting,
    });
  }

  const accountItems: ProfileRowItem[] = [
    {
      icon: 'create-outline',
      label: 'Editar perfil',
      route: Routes.profile.edit,
    },
    {
      icon: 'notifications-outline',
      label: 'Notificaciones',
      route: Routes.settings.notificationsSettings,
    },
    {
      icon: 'shield-checkmark-outline',
      label: 'Privacidad',
      route: Routes.settings.privacy,
    },
    {
      icon: 'star-outline',
      label: 'Premium',
      route: Routes.premium.paywall,
    },
    {
      icon: 'download-outline',
      label: 'Exportar datos',
      route: Routes.profile.exportData,
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
    Alert.alert('Cerrar sesion', 'Se cerrara tu sesion en este dispositivo.', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Cerrar sesion',
        style: 'destructive',
        onPress: async () => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
          await signOut();
          router.replace(Routes.auth.welcome as never);
        },
      },
    ]);
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
              <Text style={styles.name}>{name}</Text>
              <Text style={styles.goal}>{goalLabel(profile?.goal)}</Text>
              {profile?.is_premium ? (
                <View style={styles.premiumChip}>
                  <Text style={styles.premiumChipText}>Premium</Text>
                </View>
              ) : null}
            </View>
          </View>

          <Pressable style={styles.closeButton} onPress={() => router.back()}>
            <Ionicons name="close" size={18} color={Colors.textPrimary} />
          </Pressable>
        </View>

        <View style={styles.quickStatsRow}>
          <QuickStat label="Peso actual" value={currentWeight} />
          <QuickStat label="Ultima sesion" value={lastSessionLabel} />
          <QuickStat label="Racha" value={`🔥 ${consistency.currentStreak}`} />
        </View>

        <Section
          title="Mi entrenamiento"
          items={trainingItems.map((item) => ({
            ...item,
            onPress: item.route ? () => router.push(item.route as never) : item.onPress,
          }))}
        />

        <Section
          title="Modulos adicionales"
          items={moduleItems.map((item) => ({
            ...item,
            onPress: item.route ? () => router.push(item.route as never) : item.onPress,
          }))}
        />

        <Section
          title="Cuenta"
          items={accountItems.map((item) => ({
            ...item,
            onPress: item.route ? () => router.push(item.route as never) : item.onPress,
          }))}
        />

        <Pressable style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Cerrar sesion</Text>
        </Pressable>

        <View style={styles.bottomPad} />
      </ScrollView>
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingHorizontal: Spacing[5],
    paddingTop: Spacing[3],
    paddingBottom: 56,
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
    backgroundColor: withOpacity(Colors.white, 0.08),
  },
  premiumChipText: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.xs,
    color: Colors.textPrimary,
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
  quickStat: {
    flex: 1,
    gap: 4,
  },
  quickStatValue: {
    fontFamily: FontFamily.bold,
    fontSize: 22,
    color: Colors.textPrimary,
  },
  quickStatLabel: {
    fontFamily: FontFamily.regular,
    fontSize: 12,
    color: Colors.textMuted,
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
  logoutButton: {
    alignItems: 'center',
    paddingVertical: Spacing[3],
  },
  logoutText: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.base,
    color: Colors.error,
  },
  bottomPad: {
    height: 12,
  },
});
