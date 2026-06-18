import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, Stack } from 'expo-router';
import SafeScreen from '@/components/ui/SafeScreen';
import Card from '@/components/ui/Card';
import ConfirmationSheet from '@/components/ui/ConfirmationSheet';
import ScreenFooterSpacer from '@/components/ui/ScreenFooterSpacer';
import { Colors, withOpacity } from '@/constants/colors';
import { MODULES, type ModuleId } from '@/constants/modules';
import { Routes } from '@/constants/routes';
import { useLocalizedStrings } from '@/constants/strings';
import { FontFamily, FontSize, Radius, Spacing } from '@/constants/theme';
import { useAuthStore } from '@/stores/authStore';
import { useUIStore } from '@/stores/uiStore';
import { useWeight } from '@/hooks/useWeight';
import { useWorkout } from '@/hooks/useWorkout';
import { buildProfileContextUpdate } from '@/lib/profile-context';
import { buildProfileContextWithActiveModules, getActiveModules } from '@/lib/active-modules';
import { supabase } from '@/lib/supabase';
import { trackModuleDisabled, trackModuleEnabled } from '@/lib/analytics';
import { isGuestAuthUser, MANAGED_GUEST_NAME, normalizeManagedGuestName } from '@/lib/guest-auth';
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

function goalLabel(
  goal: string | null | undefined,
  profileStrings: ReturnType<typeof useLocalizedStrings>['ShellStrings']['profile'],
) {
  switch (goal) {
    case 'gain_muscle':
      return profileStrings.modes.gainMuscle;
    case 'lose_fat':
      return profileStrings.modes.loseFat;
    case 'sport_performance':
    case 'performance':
      return profileStrings.modes.performance;
    default:
      return profileStrings.modes.consistency;
  }
}

const MODULE_SETUP_ROUTES: Partial<Record<ModuleId, string>> = {
  workout: Routes.workout.settings,
  nutrition: Routes.nutrition.settings,
  water: Routes.water.settings,
  sleep: Routes.sleep.settings,
  steps: Routes.steps.settings,
  fasting: Routes.fasting.settings,
  female: Routes.female.settings,
  supplements: Routes.supplements.settings,
};

const MODULE_ICONS: Partial<Record<ModuleId, React.ComponentProps<typeof Ionicons>['name']>> = {
  workout: 'barbell-outline',
  nutrition: 'restaurant-outline',
  water: 'water-outline',
  sleep: 'moon-outline',
  steps: 'footsteps-outline',
  fasting: 'timer-outline',
  female: 'flower-outline',
  supplements: 'medical-outline',
};

function getModuleSetupRoute(moduleId: ModuleId): string | null {
  return MODULE_SETUP_ROUTES[moduleId] ?? null;
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
  const { profile, signOut, setProfile, user } = useAuthStore();
  const showToast = useUIStore((state) => state.showToast);
  const { stats } = useWeight();
  const { history, getConsistencyStats } = useWorkout();
  const { ShellStrings: shellStrings, ModuleNames: moduleNames } = useLocalizedStrings();
  const profileStrings = shellStrings.profile;
  const activeModules = getActiveModules(profile);
  const activeModuleSet = useMemo(() => new Set(activeModules), [activeModules]);
  const [signOutOpen, setSignOutOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [modulePendingDisable, setModulePendingDisable] = useState<ModuleId | null>(null);
  const [moduleSaving, setModuleSaving] = useState<ModuleId | null>(null);

  const consistency = getConsistencyStats();
  const isCompactWidth = width <= 390;
  const name = isGuestAuthUser(user)
    ? MANAGED_GUEST_NAME
    : normalizeManagedGuestName(profile?.name) || 'Usuario';
  const email = profile?.email?.trim() || profileStrings.membership.emailFallback;
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
    ? profileStrings.stats.daysAgo.replace(
        '{{days}}',
        String(Math.max(0, Math.round((Date.now() - new Date(lastSession.started_at).getTime()) / 86400000))),
      )
    : profileStrings.stats.noSessions;

  const activityItems: ProfileRowItem[] = [
    {
      icon: 'barbell-outline',
      label: profileStrings.rows.workout.label,
      value: profileStrings.rows.workout.value,
      route: Routes.workout.index,
    },
    {
      icon: 'analytics-outline',
      label: profileStrings.rows.progress.label,
      value: profileStrings.rows.progress.value,
      route: Routes.tabs.progress,
    },
  ];

  const moduleCards = useMemo(
    () =>
      MODULES.map((module) => {
        const moduleId = module.id as ModuleId;
        return {
          ...module,
          moduleId,
          label: module.shortName ?? moduleNames[moduleId as keyof typeof moduleNames] ?? module.name,
          active: activeModuleSet.has(moduleId),
        };
      }),
    [activeModuleSet, moduleNames],
  );
  const activeModuleCount = moduleCards.filter((module) => module.active).length;
  const inactiveModuleCount = moduleCards.length - activeModuleCount;

  const resolvedGoalLabel = goalLabel(profile?.goal, profileStrings);
  const localizedLastSessionLabel = lastSession?.started_at
    ? profileStrings.stats.daysAgo.replace(
        '{{days}}',
        String(Math.max(0, Math.round((Date.now() - new Date(lastSession.started_at).getTime()) / 86400000))),
      )
    : lastSessionLabel;
  const localizedActivityItems = activityItems.map((item, index) =>
    index === 0
      ? { ...item, label: profileStrings.rows.workout.label, value: profileStrings.rows.workout.value }
      : { ...item, label: profileStrings.rows.progress.label, value: profileStrings.rows.progress.value },
  );
  const isPremium =
    Boolean(profile?.founding_member) ||
    Boolean(profile?.paypal_subscription_id) ||
    Boolean(profile?.premium_until && new Date(profile.premium_until).getTime() > Date.now());
  const membershipLabel = profile?.founding_member
    ? profileStrings.membership.founding
    : isPremium
      ? profileStrings.membership.premium
      : profileStrings.membership.free;
  const modulesSummary = profileStrings.membership.modulesSummary.replace(
    '{{count}}',
    String(activeModuleCount),
  );

  const preferenceItems: ProfileRowItem[] = [
    {
      icon: 'settings-outline',
      label: profileStrings.rows.settings.label,
      value: profileStrings.rows.settings.value,
      route: Routes.settings.index,
    },
  ];

  const accountItems: ProfileRowItem[] = [
    {
      icon: 'create-outline',
      label: profileStrings.rows.editProfile,
      route: Routes.profile.edit,
    },
    {
      icon: 'shield-checkmark-outline',
      label: profileStrings.rows.security,
      route: Routes.settings.account,
    },
    {
      icon: 'download-outline',
      label: profileStrings.rows.exportData,
      route: Routes.profile.exportData,
    },
  ];

  const supportItems: ProfileRowItem[] = [
    {
      icon: 'help-circle-outline',
      label: profileStrings.rows.support,
      route: Routes.profile.support,
    },
  ];

  const legalItems: ProfileRowItem[] = [
    {
      icon: 'document-text-outline',
      label: profileStrings.rows.terms,
      route: Routes.legal.terms,
    },
    {
      icon: 'shield-outline',
      label: profileStrings.rows.privacy,
      route: Routes.legal.privacy,
    },
  ];

  const dangerItems: ProfileRowItem[] = [
    {
      icon: 'trash-outline',
      label: profileStrings.rows.deleteAccount,
      route: Routes.profile.deleteAccount,
      destructive: true,
    },
  ];

  const getModuleLabel = (moduleId: ModuleId) =>
    moduleCards.find((module) => module.moduleId === moduleId)?.label ??
    MODULES.find((module) => module.id === moduleId)?.name ??
    'Módulo';

  const persistModuleSelection = async (
    nextModules: ModuleId[],
    moduleId: ModuleId,
    mode: 'enable' | 'disable',
  ) => {
    if (!profile?.id) return false;

    setModuleSaving(moduleId);
    try {
      const nextContextMemory = buildProfileContextWithActiveModules(profile, nextModules);
      const { data, error } = await supabase
        .from('profiles')
        .update({
          ...buildProfileContextUpdate({ memory: nextContextMemory }),
          updated_at: new Date().toISOString(),
        })
        .eq('id', profile.id)
        .select('*')
        .single();

      if (error) throw error;

      setProfile(data);

      if (mode === 'enable') {
        trackModuleEnabled(moduleId, 'profile');
      } else {
        trackModuleDisabled(moduleId, 'profile');
      }

      showToast(
        mode === 'enable'
          ? `${getModuleLabel(moduleId)} activado.`
          : `${getModuleLabel(moduleId)} desactivado.`,
        'success',
      );

      return true;
    } catch {
      showToast('No se pudieron guardar los módulos.', 'error');
      return false;
    } finally {
      setModuleSaving(null);
    }
  };

  const handleModulePress = async (moduleId: ModuleId) => {
    if (moduleSaving) return;

    const isActive = activeModuleSet.has(moduleId);
    if (isActive) {
      if (activeModules.length <= 1) {
        showToast('Mantén al menos 1 módulo activo.', 'warning');
        return;
      }

      setModulePendingDisable(moduleId);
      return;
    }

    const saved = await persistModuleSelection([...activeModules, moduleId], moduleId, 'enable');
    if (!saved) return;

    const setupRoute = getModuleSetupRoute(moduleId);
    if (setupRoute) {
      router.push(setupRoute as never);
    }
  };

  const confirmModuleDisable = async () => {
    if (!modulePendingDisable) return;

    const moduleId = modulePendingDisable;
    if (activeModules.length <= 1) {
      setModulePendingDisable(null);
      showToast('Mantén al menos 1 módulo activo.', 'warning');
      return;
    }

    const nextModules = activeModules.filter((item) => item !== moduleId);
    await persistModuleSelection(nextModules, moduleId, 'disable');
    setModulePendingDisable(null);
  };

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
      showToast(profileStrings.closeSessionError, 'error');
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
            <Text style={styles.sheetTitle}>Mi perfil</Text>
          </View>

          <Pressable
            style={styles.closeButton}
            onPress={() => router.back()}
            accessibilityRole="button"
            accessibilityLabel={profileStrings.closeProfile}
            accessibilityHint={profileStrings.closeProfileHint}
          >
            <Ionicons name="close" size={18} color={Colors.textPrimary} />
          </Pressable>
        </View>

        <Card style={styles.identityCard} accentColor={isPremium ? Colors.action : Colors.workout} shadow={false}>
          <View style={styles.identityHeroRow}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{initials || 'V'}</Text>
            </View>

            <View style={styles.identityCopy}>
              <View style={styles.nameRow}>
                <Text style={styles.name}>{name}</Text>
                <View
                  style={[
                    styles.membershipBadge,
                    {
                      backgroundColor: withOpacity(isPremium ? Colors.action : Colors.textMuted, 0.12),
                      borderColor: withOpacity(isPremium ? Colors.action : Colors.textMuted, 0.18),
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.membershipBadgeText,
                      { color: isPremium ? Colors.action : Colors.textSecondary },
                    ]}
                  >
                    {membershipLabel}
                  </Text>
                </View>
              </View>
              <Text style={styles.email}>{email}</Text>
              <Text style={styles.goal}>{resolvedGoalLabel}</Text>
              <Text style={styles.modulesSummary}>{modulesSummary}</Text>
            </View>
          </View>

          <View style={[styles.quickStatsRow, isCompactWidth && styles.quickStatsRowCompact]}>
            <QuickStat
              label={profileStrings.stats.currentWeight}
              value={currentWeight}
              compact={isCompactWidth}
              onPress={() => router.push(Routes.tabs.progress as never)}
            />
            <QuickStat
              label={profileStrings.stats.streak}
              value={profileStrings.stats.streakDays.replace('{{days}}', String(consistency.currentStreak))}
              compact={isCompactWidth}
              onPress={() => router.push(Routes.tabs.progress as never)}
            />
            <QuickStat
              label={profileStrings.stats.lastSession}
              value={localizedLastSessionLabel}
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
        </Card>

        <Section
          title={profileStrings.sections.activity}
          items={localizedActivityItems.map((item) => ({
            ...item,
            onPress: item.route ? () => router.push(item.route as never) : item.onPress,
          }))}
        />

        <View style={styles.modulesSection}>
          <View style={styles.modulesSectionHeader}>
            <View style={styles.modulesSectionCopy}>
              <Text style={styles.modulesEyebrow}>Módulos activos</Text>
              <Text style={styles.modulesTitle}>Toca para activar o desactivar</Text>
            </View>
            <View style={styles.modulesCountPill}>
              <Text style={styles.modulesCountText}>{activeModuleCount} activos</Text>
            </View>
          </View>

          <Card style={styles.modulesCard} shadow={false}>
            <View style={styles.moduleGrid}>
              {moduleCards.map((module) => {
                const isActive = module.active;
                const isBusy = moduleSaving === module.moduleId;

                return (
                  <Pressable
                    key={module.moduleId}
                    style={[
                      styles.moduleChip,
                      isActive && {
                        borderColor: module.color,
                        backgroundColor: withOpacity(module.color, 0.12),
                      },
                      isBusy && styles.moduleChipBusy,
                    ]}
                    onPress={() => void handleModulePress(module.moduleId)}
                    disabled={moduleSaving !== null}
                    accessibilityRole="button"
                    accessibilityState={{ selected: isActive, disabled: moduleSaving !== null }}
                    accessibilityLabel={module.label}
                    accessibilityHint={
                      isActive
                        ? `Desactiva ${module.label} y conserva tus registros.`
                        : `Activa ${module.label} y abre su configuración si corresponde.`
                    }
                  >
                    <View style={styles.moduleChipTopRow}>
                      <View
                        style={[
                          styles.moduleIconWrap,
                          {
                            backgroundColor: withOpacity(module.color, isActive ? 0.16 : 0.08),
                          },
                        ]}
                      >
                        <Ionicons
                          name={MODULE_ICONS[module.moduleId] ?? 'grid-outline'}
                          size={18}
                          color={isActive ? module.color : Colors.textMuted}
                        />
                      </View>
                      <Ionicons
                        name={isActive ? 'checkmark-circle' : 'ellipse-outline'}
                        size={18}
                        color={isActive ? module.color : Colors.textMuted}
                      />
                    </View>
                    <Text style={styles.moduleChipName} numberOfLines={1}>
                      {module.label}
                    </Text>
                    <Text style={[styles.moduleChipState, { color: isActive ? module.color : Colors.textMuted }]}>
                      {isActive ? 'Activo' : 'Inactivo'}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
            <Text style={styles.modulesNote}>
              {inactiveModuleCount > 0
                ? `Quedan ${inactiveModuleCount} módulos disponibles para explorar.`
                : 'Ya tienes todos los módulos visibles activos.'}
            </Text>
          </Card>
        </View>

        <Section
          title={profileStrings.sections.preferences}
          items={preferenceItems.map((item) => ({
            ...item,
            onPress: item.route ? () => router.push(item.route as never) : item.onPress,
          }))}
        />

        <Section
          title={profileStrings.sections.account}
          items={accountItems.map((item) => ({
            ...item,
            onPress: item.route ? () => router.push(item.route as never) : item.onPress,
          }))}
        />

        <Section
          title={profileStrings.sections.support}
          items={supportItems.map((item) => ({
            ...item,
            onPress: item.route ? () => router.push(item.route as never) : item.onPress,
          }))}
        />

        <Section
          title={profileStrings.sections.legal}
          items={legalItems.map((item) => ({
            ...item,
            onPress: item.route ? () => router.push(item.route as never) : item.onPress,
          }))}
        />

        <Section
          title=""
          items={dangerItems.map((item) => ({
            ...item,
            onPress: item.route ? () => router.push(item.route as never) : item.onPress,
          }))}
        />

        <Pressable
          style={styles.logoutButton}
          onPress={handleLogout}
          accessibilityRole="button"
          accessibilityLabel={profileStrings.rows.logout}
          accessibilityHint={profileStrings.logout.accessibilityHint}
        >
          <Text style={styles.logoutText}>{profileStrings.rows.logout}</Text>
        </Pressable>

        <ScreenFooterSpacer />
      </ScrollView>

      <ConfirmationSheet
        visible={signOutOpen}
        onClose={() => setSignOutOpen(false)}
        title={profileStrings.logout.title}
        body={profileStrings.logout.body}
        confirmLabel={signingOut ? profileStrings.logout.loading : profileStrings.logout.confirm}
        onConfirm={() => {
          void confirmLogout();
        }}
        confirmVariant="danger"
        loading={signingOut}
      />

      <ConfirmationSheet
        visible={modulePendingDisable !== null}
        onClose={() => setModulePendingDisable(null)}
        title={
          modulePendingDisable
            ? `Desactivar ${getModuleLabel(modulePendingDisable)}`
            : 'Desactivar módulo'
        }
        body={
          modulePendingDisable
            ? `Tus registros se guardan. Puedes volver a activarlo cuando quieras.`
            : 'Tus registros se guardan. Puedes volver a activarlo cuando quieras.'
        }
        confirmLabel="Desactivar"
        confirmVariant="danger"
        onConfirm={() => {
          void confirmModuleDisable();
        }}
        loading={moduleSaving !== null}
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
    backgroundColor: Colors.elevated,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: Spacing[3],
  },
  identityRow: {
    flex: 1,
  },
  sheetTitle: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.lg,
    color: Colors.textPrimary,
  },
  identityCard: {
    gap: Spacing[4],
  },
  identityHeroRow: {
    flexDirection: 'row',
    gap: Spacing[3],
    alignItems: 'center',
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: withOpacity(Colors.secondary, 0.12),
    borderWidth: 1,
    borderColor: withOpacity(Colors.secondary, 0.22),
  },
  avatarText: {
    fontFamily: FontFamily.display,
    fontSize: FontSize['2.75xl'],
    color: Colors.secondary,
  },
  identityCopy: {
    flex: 1,
    gap: 6,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[2],
    flexWrap: 'wrap',
  },
  name: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize['lg+'],
    color: Colors.textPrimary,
  },
  goal: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.base,
    color: Colors.textSecondary,
  },
  email: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    color: Colors.textMuted,
  },
  modulesSummary: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
  },
  membershipBadge: {
    borderRadius: Radius.full,
    borderWidth: 1,
    paddingHorizontal: Spacing[2.5],
    paddingVertical: Spacing[1],
  },
  membershipBadgeText: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.xs,
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
    fontSize: FontSize['lg+'],
    color: Colors.textPrimary,
    flexShrink: 1,
  },
  quickStatLabel: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize['sm'],
    color: Colors.textMuted,
    flexShrink: 1,
  },
  modulesSection: {
    gap: Spacing[2],
  },
  modulesSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: Spacing[3],
  },
  modulesSectionCopy: {
    flex: 1,
    gap: 3,
  },
  modulesEyebrow: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.xs,
    letterSpacing: 1.1,
    textTransform: 'uppercase',
    color: Colors.textMuted,
  },
  modulesTitle: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.base,
    color: Colors.textPrimary,
  },
  modulesCountPill: {
    borderRadius: Radius.full,
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[1.5],
    borderWidth: 1,
    borderColor: withOpacity(Colors.white, 0.08),
    backgroundColor: Colors.bgSurface,
  },
  modulesCountText: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
  },
  modulesCard: {
    gap: Spacing[3],
  },
  moduleGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing[2.5],
  },
  moduleChip: {
    flexGrow: 1,
    flexBasis: '49%',
    minWidth: 104,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: withOpacity(Colors.white, 0.06),
    backgroundColor: Colors.bgSurface,
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[3],
    gap: Spacing[2],
  },
  moduleChipBusy: {
    opacity: 0.72,
  },
  moduleChipTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: Spacing[2],
  },
  moduleIconWrap: {
    width: 32,
    height: 32,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  moduleChipName: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.sm,
    color: Colors.textPrimary,
  },
  moduleChipState: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.xs,
  },
  modulesNote: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    lineHeight: 18,
    color: Colors.textSecondary,
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
    borderColor: withOpacity(Colors.secondary, 0.18),
    backgroundColor: withOpacity(Colors.secondary, 0.06),
  },
  premiumUpsellEyebrow: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.xs,
    color: Colors.secondary,
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

