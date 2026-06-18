import React, { useMemo, useState } from 'react';
import { Linking, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import SafeScreen from '@/components/ui/SafeScreen';
import Header from '@/components/layout/Header';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import SettingToggleRow from '@/components/ui/SettingToggleRow';
import { Colors, withOpacity } from '@/constants/colors';
import { FontFamily, FontSize, LineHeight, Radius, Spacing } from '@/constants/theme';
import { useNotifications, type NotifPreferences } from '@/hooks/useNotifications';
import { useSettingsStore } from '@/stores/settingsStore';

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
    hint: 'Pasos y vuelta rapida al valor real.',
    icon: 'footsteps-outline',
    prefKeys: ['workout'],
    routeKeys: ['notifSteps'],
  },
  {
    id: 'consistency',
    title: 'Ritmo y contexto',
    hint: 'Empujes suaves cuando el día se enfía.',
    icon: 'sparkles-outline',
    prefKeys: ['mental', 'streakAtRisk'],
    routeKeys: ['notifCoach', 'notifStreak'],
  },
  {
    id: 'special',
    title: 'Ayuno y suplementos',
    hint: 'Ventanas activas y recordatorios puntuales.',
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

function formatHourLabel(hour: number) {
  const normalized = ((Math.round(hour) % 24) + 24) % 24;
  return `${String(normalized).padStart(2, '0')}:00`;
}

export default function NotificationsSettingsScreen() {
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

  const isGroupEnabled = (group: (typeof GROUP_ROWS)[number]) =>
    group.prefKeys.some((key) => Boolean(prefs[key])) || group.routeKeys.some((key) => Boolean(settings[key]));

  const setGroupEnabled = (group: (typeof GROUP_ROWS)[number], nextValue: boolean) => {
    group.prefKeys.forEach((key) => updatePref(key, nextValue));
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
  const effectiveMaxNotifsPerDay = 1;

  const statusTitle = !permissionGranted
    ? 'Permiso del sistema desactivado'
    : settings.notificationsEnabled
      ? 'Notificaciones activas'
      : 'Notificaciones pausadas';

  const statusBody = !permissionGranted
    ? 'Sin permiso, la app no puede volver a aparecer cuando el día se enfía.'
    : settings.notificationsEnabled
      ? `${totalActive} de ${totalPossible} grupos activos. Hoy ya salieron ${smartNotifsSentToday} avisos y el tope esta en ${effectiveMaxNotifsPerDay}.`
      : 'La capa de avisos esta apagada. Cuando la reactives, volveremos a usar tus preferencias actuales.';

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
              <Text style={styles.metaPillText}>Tope diario {effectiveMaxNotifsPerDay}</Text>
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
              Primero intenta habilitarlo desde aqui. Si ya lo negaste antes, te llevamos a los ajustes del telefono.
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
          <SectionHeader title="Interruptor maestro" hint="Si se apaga, el resto se esconde para no abrumar." />
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
                hint="Al inicio VYRA solo puede interrumpirte una vez al día."
              />
              <View style={styles.capTrack}>
                {[1].map((value) => {
                  const active = effectiveMaxNotifsPerDay === value;
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
                Modo fino: solo lo mas importante. Si VYRA necesita mas avisos para retenerte, el producto esta
                fallando.
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
                    : 'Desactivado. La app puede usar avisos contextuales tambien de madrugada.'
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
                    Sirve para avisos adaptativos y de rescate. Los recordatorios fijos siguen usando su propio horario
                    previsto.
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
          </>
        ) : null}

        <Button onPress={() => void persistPanel()} loading={saving} fullWidth color={Colors.brand}>
          Guardar panel
        </Button>
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
    fontSize: FontSize['2.5xl'],
    lineHeight: LineHeight.px28,
    color: Colors.textPrimary,
    marginBottom: 6,
  },
  heroBody: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    lineHeight: 20,
    color: Colors.textSecondary,
    marginBottom: Spacing[4],
  },
  heroMetaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing[2],
  },
  metaPill: {
    paddingHorizontal: Spacing[3],
    paddingVertical: 8,
    borderRadius: Radius.full,
    backgroundColor: withOpacity(Colors.brand, 0.1),
  },
  metaPillText: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.xs,
    color: Colors.textPrimary,
  },
  sectionTitle: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.lg,
    color: Colors.textPrimary,
  },
  sectionHint: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    lineHeight: 20,
    color: Colors.textSecondary,
  },
  sectionHeader: {
    gap: 6,
    marginBottom: Spacing[3],
  },
  permissionActions: {
    gap: Spacing[2],
    marginTop: Spacing[3],
  },
  iconWrap: {
    width: 30,
    height: 30,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: withOpacity(Colors.brand, 0.12),
  },
  capTrack: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing[2],
    marginTop: Spacing[2],
  },
  capButton: {
    minWidth: 60,
  },
  capHint: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    lineHeight: 18,
    color: Colors.textMuted,
    marginTop: Spacing[2],
  },
  quietHoursPanel: {
    marginTop: Spacing[3],
    paddingTop: Spacing[3],
    borderTopWidth: 1,
    borderTopColor: withOpacity(Colors.white, 0.06),
    gap: Spacing[3],
  },
  quietHoursSection: {
    gap: Spacing[1],
  },
  quietHoursLabel: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  stack: {
    gap: 0,
  },
  divider: {
    height: 1,
    marginLeft: 4,
    backgroundColor: withOpacity(Colors.white, 0.06),
  },
});
