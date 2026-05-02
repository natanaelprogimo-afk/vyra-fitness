import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
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
import { FontFamily, FontSize, Radius, Spacing } from '@/constants/theme';

const ITEMS = [
  {
    label: 'Apariencia y unidades',
    helper: 'Tema, contraste, tamano de texto, lectura asistida y unidades.',
    route: Routes.settings.appearance,
    accentColor: Colors.brand,
  },
  {
    label: 'Modulos activos',
    helper: 'Activa o pausa modulos sin entrar a Perfil y ajusta el foco real del producto.',
    route: Routes.settings.modules,
    accentColor: Colors.workout,
  },
  {
    label: 'Widgets de inicio',
    helper: 'Prioriza lo que quieres ver fuera de la app sin perder continuidad visual.',
    route: Routes.settings.widgets,
    accentColor: Colors.steps,
  },
  {
    label: 'Notificaciones',
    helper: 'Permisos, intensidad, plan adaptativo y entrega real.',
    route: Routes.settings.notificationsSettings,
    accentColor: Colors.water,
  },
  {
    label: 'Historial de notificaciones',
    helper: 'Inbox reciente y explicacion visible del plan adaptativo.',
    route: Routes.settings.notificationsHistory,
    accentColor: Colors.sleep,
  },
  {
    label: 'Privacidad',
    helper: 'Consentimientos sensibles, exportacion y controles de cuenta.',
    route: Routes.settings.privacy,
    accentColor: Colors.brand,
  },
  {
    label: 'Centro del sistema',
    helper: 'Backend, sync, IA semanal, widgets y salud operativa para QA o soporte.',
    route: Routes.settings.systemHealth,
    accentColor: Colors.info,
  },
] as const;

export default function SettingsScreen() {
  return (
    <SafeScreen padHorizontal={false} padBottom>
      <Header title="Ajustes" showBack color={Colors.brand} />

      <View style={styles.content}>
        <NoticeCard
          title="La configuracion ahora tiene mas control real"
          body="Accesibilidad, feedback inline y superficies de sistema ya no dependen solo de copy explicativo: ahora tambien tienen rutas visibles."
          tone="info"
        />

        <Card style={styles.card}>
          <SectionHeader
            eyebrow="Indice"
            title="Un solo mapa para no repetir superficies"
            subtitle="Cuenta y seguridad siguen dentro de Perfil. Aqui quedan sistema, notificaciones, widgets y privacidad."
          />

          <View style={styles.list}>
            {ITEMS.map((item, index) => (
              <View key={item.route}>
                <LinkRow
                  label={item.label}
                  description={item.helper}
                  accentColor={item.accentColor}
                  onPress={() => router.push(item.route as never)}
                />
                {index < ITEMS.length - 1 ? <View style={styles.divider} /> : null}
              </View>
            ))}
          </View>
        </Card>

        <View style={styles.footerNote}>
          <Text style={styles.footerNoteText}>
            Si una pantalla todavia se siente mas artesanal que sistemica, la revision ya vive dentro de la galeria y del centro del sistema.
          </Text>
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
