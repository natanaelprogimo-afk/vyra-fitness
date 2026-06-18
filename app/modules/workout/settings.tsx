import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import Header from '@/components/layout/Header';
import WorkoutTabs from '@/components/workout/WorkoutTabs';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import NoticeCard from '@/components/ui/NoticeCard';
import SafeScreen from '@/components/ui/SafeScreen';
import ScreenFooterSpacer from '@/components/ui/ScreenFooterSpacer';
import SectionHeader from '@/components/ui/SectionHeader';
import SettingToggleRow from '@/components/ui/SettingToggleRow';
import { Colors, withOpacity } from '@/constants/colors';
import { FontFamily, FontSize, Spacing } from '@/constants/theme';
import { useWorkout } from '@/hooks/useWorkout';

const REST_ALERT_OPTIONS: Array<{
  id: 'soft' | 'strong' | 'sound' | 'silent';
  label: string;
  hint: string;
}> = [
  { id: 'soft', label: 'Suave', hint: 'Pulso corto y discreto al cerrar el descanso.' },
  { id: 'strong', label: 'Fuerte', hint: 'Feedback mas marcado para no perder el cierre.' },
  { id: 'sound', label: 'Intensa', hint: 'La alerta tactil mas fuerte disponible ahora.' },
  { id: 'silent', label: 'Nada', hint: 'Sin vibracion al terminar el descanso.' },
];

export default function WorkoutSettingsScreen() {
  const { settings, updateSettings } = useWorkout();
  const selectedAlertHint =
    REST_ALERT_OPTIONS.find((option) => option.id === settings.restAlertMode)?.hint ??
    REST_ALERT_OPTIONS[0]?.hint ??
    '';

  return (
    <SafeScreen padHorizontal={false} padBottom>
      <Header
        eyebrow="Entreno"
        title="Ajustes"
        subtitle="Descanso, haptica y defaults del modulo."
        color={Colors.workout}
      />
      <WorkoutTabs active="settings" />

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <NoticeCard
          title="Entrenamiento local por cuenta"
          body="Rutinas, historial y sesiones de entreno se guardan primero en este dispositivo para esta cuenta. Vyra los mezcla en timeline y export, y si entra otra cuenta se separan para no cruzar datos."
          tone="info"
        />

        <NoticeCard
          title="Menos reglas locales"
          body="Este panel ya usa el mismo sistema de toggles y bloques que el resto de la app, sin switches sueltos ni estados paralelos."
          tone="info"
        />

        <Card accentColor={Colors.workout} style={styles.card}>
          <SectionHeader
            eyebrow="Sesion"
            title="Lo que pasa mientras entrenas"
            subtitle="Todo lo que acompana el flujo activo vive en filas compartidas y mas faciles de mantener."
          />

          <SettingToggleRow
            title="Descanso automatico"
            description="Abre el temporizador apenas registras una serie."
            value={settings.autoStartRest}
            onValueChange={(value) => updateSettings({ autoStartRest: value })}
            accentColor={Colors.workout}
          />
          <SettingToggleRow
            title="Mantener pantalla activa"
            description="Evita que el telefono se bloquee en medio de la sesion."
            value={settings.keepScreenAwake}
            onValueChange={(value) => updateSettings({ keepScreenAwake: value })}
            accentColor={Colors.workout}
          />
          <SettingToggleRow
            title="Haptica"
            description="Da feedback suave al registrar series, PRs y cierres de bloque."
            value={settings.hapticsEnabled}
            onValueChange={(value) => updateSettings({ hapticsEnabled: value })}
            accentColor={Colors.workout}
          />
        </Card>

        <Card style={styles.card}>
          <SectionHeader
            eyebrow="Ayuda visual"
            title="Cuanto te acompana la UI"
            subtitle="El módulo puede ser directo o más guiado según cómo quieras llevar la sesión."
          />

          <SettingToggleRow
            title="Mostrar tips tecnicos"
            description="Deja visibles cues y errores comunes dentro de la sesion."
            value={settings.showHints}
            onValueChange={(value) => updateSettings({ showHints: value })}
            accentColor={Colors.workout}
          />
        </Card>

        <Card style={styles.card}>
          <SectionHeader
            eyebrow="Descanso base"
            title="Presets rapidos"
            subtitle="Se usan como base al crear rutinas y sesiones cortas."
          />

          <View style={styles.buttonGrid}>
            {settings.restPresets.map((preset) => {
              const active = settings.defaultRestSeconds === preset;
              return (
                <Button
                  key={preset}
                  onPress={() => updateSettings({ defaultRestSeconds: preset })}
                  variant={active ? 'primary' : 'secondary'}
                  color={Colors.workout}
                  size="sm"
                  style={styles.buttonPill}
                  accessibilityLabel={`Usar ${preset} segundos de descanso`}
                  accessibilityHint={active ? 'Es el descanso por defecto actual.' : 'Lo deja como descanso por defecto.'}
                >
                  {preset}s
                </Button>
              );
            })}
          </View>

          <Text style={styles.note}>
            El descanso por defecto se reutiliza cuando armas bloques nuevos o entras rapido al registro.
          </Text>
        </Card>

        <Card style={styles.card}>
          <SectionHeader
            eyebrow="Cierre"
            title="Como te avisa el timer"
            subtitle="Una sola gramatica visual para elegir el nivel de feedback."
          />

          <View style={styles.buttonGrid}>
            {REST_ALERT_OPTIONS.map((option) => {
              const active = settings.restAlertMode === option.id;
              return (
                <Button
                  key={option.id}
                  onPress={() => updateSettings({ restAlertMode: option.id })}
                  variant={active ? 'primary' : 'secondary'}
                  color={Colors.workout}
                  size="sm"
                  style={styles.alertButton}
                  accessibilityLabel={`Usar alerta ${option.label.toLowerCase()}`}
                  accessibilityHint={option.hint}
                >
                  {option.label}
                </Button>
              );
            })}
          </View>

          <Text style={styles.note}>{selectedAlertHint}</Text>
        </Card>

        <ScreenFooterSpacer extra={Spacing[2]} />
      </ScrollView>
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing[5],
    paddingTop: Spacing[4],
    gap: Spacing[4],
  },
  card: {
    gap: Spacing[4],
    backgroundColor: withOpacity(Colors.surface2, 0.82),
  },
  buttonGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing[2],
  },
  buttonPill: {
    minWidth: 78,
  },
  alertButton: {
    minWidth: 96,
  },
  note: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    lineHeight: 18,
    color: Colors.textSecondary,
  },
});
