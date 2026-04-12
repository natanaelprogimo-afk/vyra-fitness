import React from 'react';
import { ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import Header from '@/components/layout/Header';
import WorkoutTabs from '@/components/workout/WorkoutTabs';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import SafeScreen from '@/components/ui/SafeScreen';
import { Colors, withOpacity } from '@/constants/colors';
import { FontFamily, FontSize, Spacing } from '@/constants/theme';
import { useWorkout } from '@/hooks/useWorkout';

function ToggleRow({
  title,
  hint,
  value,
  onValueChange,
}: {
  title: string;
  hint: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
}) {
  return (
    <View style={styles.toggleRow}>
      <View style={styles.toggleCopy}>
        <Text style={styles.toggleTitle}>{title}</Text>
        <Text style={styles.toggleHint}>{hint}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: '#2A2F3E', true: withOpacity(Colors.workout, 0.42) }}
        thumbColor={value ? Colors.workout : '#7B8090'}
      />
    </View>
  );
}

export default function WorkoutSettingsScreen() {
  const { settings, updateSettings } = useWorkout();

  return (
    <SafeScreen padHorizontal={false} padBottom>
      <Header
        eyebrow="Entreno"
        title="Ajustes"
        subtitle="Descanso, háptica, foco de pantalla y pequeños defaults del módulo."
        color={Colors.workout}
      />
      <WorkoutTabs active="settings" />

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <Card accentColor={Colors.workout} style={styles.sectionCard}>
          <Text style={styles.sectionEyebrow}>Flujo de sesión</Text>
          <Text style={styles.sectionTitle}>Lo que pasa mientras entrenás</Text>
          <ToggleRow
            title="Descanso automático"
            hint="Abre el temporizador apenas registrás una serie."
            value={settings.autoStartRest}
            onValueChange={(value) => updateSettings({ autoStartRest: value })}
          />
          <ToggleRow
            title="Mantener pantalla activa"
            hint="Evita que el teléfono se bloquee en medio de la sesión."
            value={settings.keepScreenAwake}
            onValueChange={(value) => updateSettings({ keepScreenAwake: value })}
          />
          <ToggleRow
            title="Háptica"
            hint="Da feedback suave al registrar serie, PR o fin de bloque."
            value={settings.hapticsEnabled}
            onValueChange={(value) => updateSettings({ hapticsEnabled: value })}
          />
        </Card>

        <Card style={styles.sectionCard}>
          <Text style={styles.sectionEyebrow}>Ayuda visual</Text>
          <Text style={styles.sectionTitle}>Cuánto te acompaña la UI</Text>
          <ToggleRow
            title="Mostrar tips técnicos"
            hint="Deja visibles cues y errores comunes dentro de la sesión."
            value={settings.showHints}
            onValueChange={(value) => updateSettings({ showHints: value })}
          />
        </Card>

        <Card style={styles.sectionCard}>
          <Text style={styles.sectionEyebrow}>Descanso por defecto</Text>
          <Text style={styles.sectionTitle}>Presets rápidos</Text>
          <View style={styles.presetRow}>
            {settings.restPresets.map((preset) => (
              <Button
                key={preset}
                onPress={() => updateSettings({ defaultRestSeconds: preset })}
                variant={settings.defaultRestSeconds === preset ? 'primary' : 'secondary'}
                color={Colors.workout}
                style={styles.presetButton}
              >
                {preset}s
              </Button>
            ))}
          </View>
          <Text style={styles.sectionHint}>
            El descanso por defecto se usa como base al crear rutinas y sesiones rápidas.
          </Text>
        </Card>
      </ScrollView>
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing[5],
    paddingBottom: Spacing[10],
    gap: Spacing[4],
  },
  sectionCard: {
    gap: Spacing[2],
    backgroundColor: withOpacity(Colors.surface2, 0.82),
  },
  sectionEyebrow: {
    fontFamily: FontFamily.semibold,
    fontSize: 11,
    color: Colors.workout,
    textTransform: 'uppercase',
    letterSpacing: 1.1,
  },
  sectionTitle: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.lg,
    color: Colors.textPrimary,
  },
  sectionHint: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing[3],
    paddingVertical: Spacing[2],
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderSubtle,
  },
  toggleCopy: {
    flex: 1,
    gap: 4,
  },
  toggleTitle: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.sm,
    color: Colors.textPrimary,
  },
  toggleHint: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  presetRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing[2],
    marginTop: Spacing[1],
  },
  presetButton: {
    minWidth: 72,
  },
});
