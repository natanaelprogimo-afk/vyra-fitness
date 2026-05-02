import React, { useEffect, useMemo, useState } from 'react';
import { Linking, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import SafeScreen from '@/components/ui/SafeScreen';
import Header from '@/components/layout/Header';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import SettingToggleRow from '@/components/ui/SettingToggleRow';
import { Colors, withOpacity } from '@/constants/colors';
import { FontFamily, FontSize, Radius, Spacing } from '@/constants/theme';
import { useNotifications, type NotifPreferences } from '@/hooks/useNotifications';
import {
  loadRecentNotificationActivity,
  type NotificationActivityRow,
} from '@/lib/notification-activity';
import { useSettingsStore } from '@/stores/settingsStore';
import { useAuthStore } from '@/stores/authStore';

type RouteKey =
  | 'notifSummary'
  | 'notifCoach'
  | 'notifStreak'
  | 'notifWater'
  | 'notifSteps'
  | 'notifFasting';

type GroupId = 'daily' | 'movement' | 'consistency' | 'special';

const GROUP_ROWS: Array<{
  id: GroupId;
  title: string;
  hint: string;
  icon: React.ComponentProps<typeof Ionicons>['name'];
  prefKeys: Array<keyof NotifPreferences>;
  routeKeys: RouteKey[];
}> = [
  {
    id: 'daily',
    title: 'Cuidado diario',
    hint: 'Agua, sueño y cierre del día.',
    icon: 'water-outline',
    prefKeys: ['water', 'sleep', 'dailySummary'],
    routeKeys: ['notifWater', 'notifSummary'],
  },
  {
    id: 'movement',
    title: 'Movimiento y entreno',
    hint: 'Pasos, entreno y atajos para volver o marcar rutina sin fricción.',
    icon: 'footsteps-outline',
    prefKeys: ['workout'],
    routeKeys: ['notifSteps'],
  },
  {
    id: 'consistency',
    title: 'Rachas y contexto',
    hint: 'Empujes suaves cuando el día se cae o la continuidad se enfría.',
    icon: 'sparkles-outline',
    prefKeys: ['mental', 'streakAtRisk'],
    routeKeys: ['notifCoach', 'notifStreak'],
  },
  {
    id: 'special',
    title: 'Ayuno y suplementos',
    hint: 'Ventanas activas y recordatorios que dependen del momento.',
    icon: 'hourglass-outline',
    prefKeys: ['supplements'],
    routeKeys: ['notifFasting'],
  },
];

function SectionHeader({ title, hint }: { title: string; hint: string }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <Text style={styles.sectionHint}>{hint}</Text>
    </View>
  );
}

function pickActivityString(row: NotificationActivityRow, keys: string[], fallback: string) {
  for (const key of keys) {
    const value = row[key];
    if (typeof value === 'string' && value.trim()) return value.trim();
  }
  return fallback;
}

function formatActivityStamp(value: string | null) {
  if (!value) return 'Sin fecha';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Sin fecha';
  return new Intl.DateTimeFormat('es-UY', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

function formatHourLabel(hour: number) {
  const normalized = ((Math.round(hour) % 24) + 24) % 24;
  return `${String(normalized).padStart(2, '0')}:00`;
}

export default function NotificationsSettingsScreen() {
  const profile = useAuthStore((state) => state.profile);
  const {
    permissionGranted,
    prefs,
    updatePref,
    savePrefs,
    requestPermissions,
    smartNotifsSentToday,
    deliveryMode,
  } = useNotifications();
  const settings = useSettingsStore();
  const [saving, setSaving] = useState(false);
  const [activityRows, setActivityRows] = useState<NotificationActivityRow[]>([]);
  const [loadingActivity, setLoadingActivity] = useState(true);

  const isGroupEnabled = (group: (typeof GROUP_ROWS)[number]) =>
    group.prefKeys.some((key) => Boolean(prefs[key])) || group.routeKeys.some((key) => Boolean(settings[key]));

  const setGroupEnabled = (group: (typeof GROUP_ROWS)[number], nextValue: boolean) => {
    group.prefKeys.forEach((key) => {
      updatePref(key, nextValue);
    });
    useSettingsStore.setState({
      ...Object.fromEntries(group.routeKeys.map((key) => [key, nextValue])),
    } as Partial<ReturnType<typeof useSettingsStore.getState>>);
  };

  const activeGroupCount = useMemo(
    () => GROUP_ROWS.reduce((sum, group) => sum + Number(isGroupEnabled(group)), 0),
    [prefs, settings],
  );

  const totalActive = settings.notificationsEnabled ? activeGroupCount : 0;
  const totalPossible = GROUP_ROWS.length;
  const quietHoursSummary = settings.notificationQuietHoursEnabled
    ? `${formatHourLabel(settings.notificationQuietHoursStart)} a ${formatHourLabel(settings.notificationQuietHoursEnd)}`
    : 'Desactivadas';

  const statusTitle = !permissionGranted
    ? 'Permiso del sistema desactivado'
    : settings.notificationsEnabled
      ? 'Notificaciones activas'
      : 'Notificaciones pausadas';

  const statusBody = !permissionGranted
    ? 'Sin permiso, la app no puede volver a aparecer cuando el día se enfría.'
    : settings.notificationsEnabled
      ? `${totalActive} de ${totalPossible} grupos activos. Hoy ya salieron ${smartNotifsSentToday} avisos y el tope está en ${settings.maxNotifsPerDay}.`
      : 'La capa de avisos está apagada. Cuando la reactives, volveremos a usar tus preferencias actuales.';

  useEffect(() => {
    let alive = true;

    const loadActivity = async () => {
      if (!profile?.id) {
        if (alive) {
          setActivityRows([]);
          setLoadingActivity(false);
        }
        return;
      }

      setLoadingActivity(true);
      try {
        const data = await loadRecentNotificationActivity(profile.id, 4);
        if (alive) {
          setActivityRows(Array.isArray(data) ? (data as NotificationActivityRow[]) : []);
        }
      } catch {
        if (alive) {
          setActivityRows([]);
        }
      } finally {
        if (alive) {
          setLoadingActivity(false);
        }
      }
    };

    void loadActivity();
    return () => {
      alive = false;
    };
  }, [profile?.id]);

  async function persistPanel() {
    setSaving(true);
    try {
      await savePrefs();
    } finally {
      setSaving(false);
    }
  }

  async function handleMasterToggle(nextValue: boolean) {
    if (nextValue && !permissionGranted) {
      const granted = await requestPermissions();
      if (!granted) {
        await Linking.openSettings();
        return;
      }
    }

    settings.setNotificationsEnabled(nextValue);
    await persistPanel();
  }

  async function handleRequestPermission() {
    const granted = await requestPermissions();
    if (!granted) {
      await Linking.openSettings();
    }
  }

  return (
    <SafeScreen padHorizontal={false} padBottom>
      <Header title="Notificaciones" showBack color={Colors.brand} />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Card accentColor={Colors.brand}>
          <Text style={styles.eyebrow}>Estado actual</Text>
          <Text style={styles.heroTitle}>{statusTitle}</Text>
          <Text style={styles.heroBody}>{statusBody}</Text>

          <View style={styles.heroMetaRow}>
            <View style={styles.metaPill}>
              <Text style={styles.metaPillText}>{deliveryMode === 'remote' ? 'Entrega remota' : 'Entrega local'}</Text>
            </View>
            <View style={styles.metaPill}>
              <Text style={styles.metaPillText}>Tope diario {settings.maxNotifsPerDay}</Text>
            </View>
            <View style={styles.metaPill}>
              <Text style={styles.metaPillText}>Atajos: agua y rutina</Text>
            </View>
            <View style={styles.metaPill}>
              <Text style={styles.metaPillText}>Quiet hours {quietHoursSummary}</Text>
            </View>
          </View>
        </Card>

        {!permissionGranted ? (
          <Card>
            <Text style={styles.sectionTitle}>Falta el permiso del sistema</Text>
            <Text style={styles.sectionHint}>
              Primero intenta habilitarlo desde aquí. Si ya lo negaste antes, te llevamos a los ajustes del telefono.
            </Text>
            <View style={styles.permissionActions}>
              <Button onPress={() => void handleRequestPermission()} fullWidth color={Colors.brand}>
                Pedir permiso ahora
              </Button>
              <Button onPress={() => void Linking.openSettings()} fullWidth variant="secondary" color={Colors.brand}>
                Abrir ajustes del telefono
              </Button>
            </View>
          </Card>
        ) : null}

        <Card>
          <SectionHeader
            title="Interruptor maestro"
            hint="Si se apaga, el resto se esconde para no abrumar."
          />
          <SettingToggleRow
            title="Activar notificaciones"
            description="Control general de la capa de avisos."
            value={settings.notificationsEnabled}
            onValueChange={(value) => void handleMasterToggle(value)}
            disabled={saving}
            accentColor={Colors.brand}
            icon={
              <View style={styles.iconWrap}>
                <Ionicons name="notifications-outline" size={17} color={Colors.brand} />
              </View>
            }
          />
        </Card>

        {settings.notificationsEnabled ? (
          <>
            <Card>
              <SectionHeader
                title="Cuanto puede hablarte la app"
                hint="Elige el tope diario visible."
              />
              <View style={styles.capTrack}>
                {[1, 2].map((value) => {
                  const active = settings.maxNotifsPerDay === value;
                  return (
                    <Button
                      key={value}
                      size="sm"
                      variant={active ? 'primary' : 'secondary'}
                      color={Colors.brand}
                      onPress={() => settings.setMaxNotifsPerDay(value)}
                      style={styles.capButton}
                    >
                      {value}
                    </Button>
                  );
                })}
              </View>
              <Text style={styles.capHint}>
                {settings.maxNotifsPerDay === 1
                  ? 'Modo fino: solo lo más importante.'
                  : settings.maxNotifsPerDay === 2
                    ? 'Modo balanceado: suficiente retorno sin ruido.'
                    : 'Modo amplio: más cobertura, pero también más interrupción.'}
              </Text>
            </Card>

            <Card>
              <SectionHeader
                title="Quiet hours"
                hint="La capa inteligente evita avisos contextuales dentro de esta franja."
              />
              <SettingToggleRow
                title="Silencio nocturno"
                description={
                  settings.notificationQuietHoursEnabled
                    ? `Ahora bloquea avisos inteligentes entre ${quietHoursSummary}.`
                    : 'Desactivado. La app puede usar avisos contextuales tambiÃ©n de madrugada.'
                }
                value={settings.notificationQuietHoursEnabled}
                onValueChange={(value) => settings.setNotificationQuietHoursEnabled(value)}
                disabled={saving}
                accentColor={Colors.brand}
                icon={
                  <View style={styles.iconWrap}>
                    <Ionicons name="moon-outline" size={17} color={Colors.brand} />
                  </View>
                }
              />

              {settings.notificationQuietHoursEnabled ? (
                <View style={styles.quietHoursPanel}>
                  <View style={styles.quietHoursSection}>
                    <Text style={styles.quietHoursLabel}>Empieza</Text>
                    <View style={styles.capTrack}>
                      {[21, 22, 23].map((hour) => {
                        const active = settings.notificationQuietHoursStart === hour;
                        return (
                          <Button
                            key={`quiet_start_${hour}`}
                            size="sm"
                            variant={active ? 'primary' : 'secondary'}
                            color={Colors.brand}
                            onPress={() => settings.setNotificationQuietHoursStart(hour)}
                            style={styles.capButton}
                          >
                            {formatHourLabel(hour)}
                          </Button>
                        );
                      })}
                    </View>
                  </View>

                  <View style={styles.quietHoursSection}>
                    <Text style={styles.quietHoursLabel}>Termina</Text>
                    <View style={styles.capTrack}>
                      {[6, 7, 8].map((hour) => {
                        const active = settings.notificationQuietHoursEnd === hour;
                        return (
                          <Button
                            key={`quiet_end_${hour}`}
                            size="sm"
                            variant={active ? 'primary' : 'secondary'}
                            color={Colors.brand}
                            onPress={() => settings.setNotificationQuietHoursEnd(hour)}
                            style={styles.capButton}
                          >
                            {formatHourLabel(hour)}
                          </Button>
                        );
                      })}
                    </View>
                  </View>

                  <Text style={styles.capHint}>
                    Sirve para avisos adaptativos y de rescate. Los recordatorios fijos siguen usando su propio horario previsto.
                  </Text>
                </View>
              ) : null}
            </Card>

            <Card>
              <SectionHeader
                title="Que tipo de avisos quieres"
                hint="Cuatro grupos claros en lugar de una lista interminable de switches."
              />
              <View style={styles.stack}>
                {GROUP_ROWS.map((group, index) => (
                  <View key={group.id}>
                    <SettingToggleRow
                      title={group.title}
                      description={group.hint}
                      value={isGroupEnabled(group)}
                      onValueChange={(value) => setGroupEnabled(group, value)}
                      disabled={saving}
                      accentColor={Colors.brand}
                      icon={
                        <View style={styles.iconWrap}>
                          <Ionicons name={group.icon} size={17} color={Colors.brand} />
                        </View>
                      }
                    />
                    {index < GROUP_ROWS.length - 1 ? <View style={styles.divider} /> : null}
                  </View>
                ))}
              </View>
            </Card>

            <Card>
              <SectionHeader
                title="Actividad reciente"
                hint="Solo lo último para confirmar si el sistema está ayudando o ya se pasó de rosca."
              />
              <View style={styles.stack}>
                {loadingActivity ? (
                  <Text style={styles.activityMeta}>Cargando actividad reciente...</Text>
                ) : !activityRows.length ? (
                  <Text style={styles.activityMeta}>
                    Todavía no hay historial reciente. En cuanto salgan avisos útiles, apareceran aquí.
                  </Text>
                ) : (
                  activityRows.map((row, index) => {
                    const title = pickActivityString(
                      row,
                      ['title', 'message_title', 'body', 'message_body'],
                      'Notificacion programada',
                    );
                    const type = pickActivityString(
                      row,
                      ['notification_type', 'type', 'category', 'kind'],
                      'contexto',
                    );
                    const stamp = formatActivityStamp(
                      pickActivityString(row, ['scheduled_for', 'created_at', 'updated_at'], ''),
                    );

                    return (
                      <View key={`${type}_${stamp}_${index}`}>
                        <View style={styles.activityRow}>
                          <View style={styles.activityCopy}>
                            <Text style={styles.activityTitle}>{title}</Text>
                            <Text style={styles.activityMeta}>{stamp}</Text>
                          </View>
                          <View style={styles.activityPill}>
                            <Text style={styles.activityPillText}>{type}</Text>
                          </View>
                        </View>
                        {index < activityRows.length - 1 ? <View style={styles.divider} /> : null}
                      </View>
                    );
                  })
                )}
              </View>
              <Button
                onPress={() => router.push('/settings/notifications-history' as never)}
                variant="secondary"
                fullWidth
                color={Colors.brand}
              >
                Abrir historial completo
              </Button>
            </Card>

            <Button onPress={() => void persistPanel()} loading={saving} fullWidth color={Colors.brand}>
              Guardar panel
            </Button>
          </>
        ) : null}
      </ScrollView>
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingHorizontal: Spacing[5],
    paddingTop: Spacing[4],
    paddingBottom: Spacing[10],
    gap: Spacing[4],
  },
  eyebrow: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.xs,
    color: Colors.brand,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  heroTitle: {
    fontFamily: FontFamily.display,
    fontSize: 26,
    lineHeight: 28,
    color: Colors.textPrimary,
    marginBottom: 6,
  },
  heroBody: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    lineHeight: 20,
    color: Colors.textSecondary,
  },
  heroMetaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing[2],
    marginTop: Spacing[3],
  },
  metaPill: {
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: withOpacity(Colors.brand, 0.2),
    backgroundColor: withOpacity(Colors.brand, 0.08),
    paddingHorizontal: Spacing[3],
    paddingVertical: 6,
  },
  metaPillText: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.xs,
    color: Colors.textPrimary,
  },
  sectionHeader: {
    gap: 4,
    marginBottom: Spacing[3],
  },
  sectionTitle: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.base,
    color: Colors.textPrimary,
  },
  sectionHint: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    lineHeight: 18,
    color: Colors.textSecondary,
  },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: withOpacity(Colors.brand, 0.12),
  },
  capTrack: {
    flexDirection: 'row',
    gap: Spacing[2],
  },
  quietHoursPanel: {
    gap: Spacing[3],
    marginTop: Spacing[3],
  },
  quietHoursSection: {
    gap: Spacing[2],
  },
  quietHoursLabel: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  capButton: {
    flex: 1,
  },
  capHint: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    lineHeight: 18,
    color: Colors.textSecondary,
    marginTop: Spacing[3],
  },
  permissionActions: {
    gap: Spacing[2],
    marginTop: Spacing[3],
  },
  stack: {
    gap: Spacing[2],
  },
  divider: {
    height: 1,
    backgroundColor: withOpacity(Colors.white, 0.06),
  },
  activityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[3],
    paddingVertical: Spacing[2],
  },
  activityCopy: {
    flex: 1,
    gap: 2,
  },
  activityTitle: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.sm,
    color: Colors.textPrimary,
  },
  activityMeta: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    lineHeight: 18,
    color: Colors.textSecondary,
  },
  activityPill: {
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: withOpacity(Colors.brand, 0.2),
    backgroundColor: withOpacity(Colors.brand, 0.08),
    paddingHorizontal: Spacing[2.5],
    paddingVertical: 5,
  },
  activityPillText: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.xs,
    color: Colors.brand,
  },
});
