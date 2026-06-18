import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import SafeScreen from '@/components/ui/SafeScreen';
import Header from '@/components/layout/Header';
import Card from '@/components/ui/Card';
import LinkRow from '@/components/ui/LinkRow';
import NoticeCard from '@/components/ui/NoticeCard';
import ScreenFooterSpacer from '@/components/ui/ScreenFooterSpacer';
import SectionHeader from '@/components/ui/SectionHeader';
import { Colors, withOpacity } from '@/constants/colors';
import { Routes } from '@/constants/routes';
import { useLocalizedStrings } from '@/constants/strings';
import { FontFamily, FontSize, Radius, Spacing } from '@/constants/theme';
import { useAuthStore } from '@/stores/authStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { getActiveModules } from '@/lib/active-modules';

export default function SettingsScreen() {
  const { ShellStrings: shellStrings } = useLocalizedStrings();
  const settingsStrings = shellStrings.settingsIndex;
  const profile = useAuthStore((state) => state.profile);
  const colorScheme = useSettingsStore((state) => state.colorScheme);
  const reduceMotion = useSettingsStore((state) => state.reduceMotion);
  const highContrast = useSettingsStore((state) => state.highContrast);
  const activeModuleCount = getActiveModules(profile).length;

  const items = [
    {
      label: settingsStrings.items.account.label,
      helper: settingsStrings.items.account.helper,
      route: Routes.settings.account,
      accentColor: Colors.brand,
    },
    {
      label: settingsStrings.items.appearance.label,
      helper: settingsStrings.items.appearance.helper,
      route: Routes.settings.appearance,
      accentColor: Colors.brand,
    },
    {
      label: settingsStrings.items.modules.label,
      helper: settingsStrings.items.modules.helper,
      route: Routes.settings.modules,
      accentColor: Colors.workout,
    },
    {
      label: settingsStrings.items.notifications.label,
      helper: settingsStrings.items.notifications.helper,
      route: Routes.settings.notificationsSettings,
      accentColor: Colors.water,
    },
    {
      label: settingsStrings.items.privacy.label,
      helper: settingsStrings.items.privacy.helper,
      route: Routes.settings.privacy,
      accentColor: Colors.brand,
      },
    ] as const;
  const accountItems = items.slice(0, 1);
  const personalizationItems = items.slice(1, 3);
  const notificationItems = items.slice(3, 4);
  const privacyItems = items.slice(4, 5);
  const themeLabel =
    colorScheme === 'system' ? 'Sistema' : colorScheme === 'light' ? 'Claro' : 'Oscuro';
  const accessibilitySummary = [
    highContrast ? 'alto contraste' : null,
    reduceMotion ? 'menos motion' : null,
  ]
    .filter(Boolean)
    .join(' · ') || 'modo base';

  return (
    <SafeScreen padHorizontal={false} padBottom>
      <Header title={settingsStrings.title} showBack color={Colors.brand} />

      <View style={styles.content}>
        <Card style={styles.heroCard} accentColor={Colors.brand} shadow={false}>
          <View style={styles.heroTopRow}>
            <View style={styles.heroCopy}>
              <Text style={styles.heroEyebrow}>{settingsStrings.indexEyebrow}</Text>
              <Text style={styles.heroTitle}>{settingsStrings.indexTitle}</Text>
              <Text style={styles.heroBody}>{settingsStrings.indexSubtitle}</Text>
            </View>
            <View style={styles.heroIconWrap}>
              <Ionicons name="settings-outline" size={20} color={Colors.action} />
            </View>
          </View>

          <View style={styles.snapshotRow}>
            <View style={styles.snapshotCard}>
              <Text style={styles.snapshotLabel}>Tema</Text>
              <Text style={styles.snapshotValue}>{themeLabel}</Text>
            </View>
            <View style={styles.snapshotCard}>
              <Text style={styles.snapshotLabel}>Módulos</Text>
              <Text style={styles.snapshotValue}>{activeModuleCount}</Text>
            </View>
            <View style={styles.snapshotCard}>
              <Text style={styles.snapshotLabel}>Acceso</Text>
              <Text style={styles.snapshotValue}>{accessibilitySummary}</Text>
            </View>
          </View>
        </Card>

        <NoticeCard title={settingsStrings.noticeTitle} body={settingsStrings.noticeBody} tone="info" />

        <Card style={styles.card}>
          <SectionHeader
            eyebrow="Cuenta"
            title="Control principal"
            subtitle="Email, contrasena, exportacion y baja de cuenta tienen su acceso claro y directo."
          />

          <View style={styles.list}>
            {accountItems.map((item, index) => (
              <View key={item.route}>
                <LinkRow
                  label={item.label}
                  description={item.helper}
                  accentColor={item.accentColor}
                  onPress={() => router.push(item.route as never)}
                />
                {index < accountItems.length - 1 ? <View style={styles.divider} /> : null}
              </View>
            ))}
          </View>
        </Card>

        <Card style={styles.card}>
          <SectionHeader
            eyebrow="Personalización"
            title="Tu espacio de uso"
            subtitle="Tema y módulos definen lo que ves primero. Lo avanzado no compite por atención."
          />

          <View style={styles.list}>
            {personalizationItems.map((item, index) => (
              <View key={item.route}>
                <LinkRow
                  label={item.label}
                  description={item.helper}
                  accentColor={item.accentColor}
                  onPress={() => router.push(item.route as never)}
                />
                {index < personalizationItems.length - 1 ? <View style={styles.divider} /> : null}
              </View>
            ))}
          </View>
        </Card>

        <Card style={styles.card}>
          <SectionHeader
            eyebrow="Notificaciones"
            title="Entrega y ruido"
            subtitle="Permisos y control simple. El historial queda detrás, no al frente."
          />

          <View style={styles.list}>
            {notificationItems.map((item, index) => (
              <View key={item.route}>
                <LinkRow
                  label={item.label}
                  description={item.helper}
                  accentColor={item.accentColor}
                  onPress={() => router.push(item.route as never)}
                />
                {index < notificationItems.length - 1 ? <View style={styles.divider} /> : null}
              </View>
            ))}
          </View>
        </Card>

        <Card style={styles.card}>
          <SectionHeader
            eyebrow="Privacidad"
            title="Control de datos"
            subtitle="Consentimientos, exportaciones y visibilidad de lo sensible sin tono alarmista."
          />

          <View style={styles.list}>
            {privacyItems.map((item, index) => (
              <View key={item.route}>
                <LinkRow
                  label={item.label}
                  description={item.helper}
                  accentColor={item.accentColor}
                  onPress={() => router.push(item.route as never)}
                />
                {index < privacyItems.length - 1 ? <View style={styles.divider} /> : null}
              </View>
            ))}
          </View>
        </Card>

        <View style={styles.footerNote}>
          <Text style={styles.footerNoteText}>{settingsStrings.footer}</Text>
        </View>

        <ScreenFooterSpacer extra={Spacing[2]} />
      </View>
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    paddingHorizontal: Spacing[5],
    paddingTop: Spacing[4],
    gap: Spacing[4],
  },
  heroCard: {
    gap: Spacing[4],
  },
  heroTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing[3],
    alignItems: 'flex-start',
  },
  heroCopy: {
    flex: 1,
    gap: 6,
  },
  heroEyebrow: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  heroTitle: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.xl,
    color: Colors.textPrimary,
  },
  heroBody: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    lineHeight: 20,
    color: Colors.textSecondary,
  },
  heroIconWrap: {
    width: 40,
    height: 40,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: withOpacity(Colors.action, 0.12),
  },
  snapshotRow: {
    flexDirection: 'row',
    gap: Spacing[2],
  },
  snapshotCard: {
    flex: 1,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: withOpacity(Colors.white, 0.06),
    backgroundColor: withOpacity(Colors.white, 0.03),
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[3],
    gap: 4,
  },
  snapshotLabel: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.xs,
    color: Colors.textMuted,
  },
  snapshotValue: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.sm,
    color: Colors.textPrimary,
  },
  card: {
    gap: Spacing[4],
  },
  list: {
    gap: 0,
  },
  divider: {
    marginLeft: 4,
    height: 1,
    backgroundColor: withOpacity(Colors.white, 0.06),
  },
  footerNote: {
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: withOpacity(Colors.brand, 0.12),
    padding: Spacing[4],
    backgroundColor: withOpacity(Colors.brand, 0.05),
  },
  footerNoteText: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    lineHeight: 18,
    color: Colors.textSecondary,
  },
});
