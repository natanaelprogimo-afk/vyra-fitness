import React, { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { router } from 'expo-router';

import Header from '@/components/layout/Header';
import FemaleModuleTabs from '@/components/female/FemaleModuleTabs';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import SafeScreen from '@/components/ui/SafeScreen';
import { Colors, withOpacity } from '@/constants/colors';
import { Routes } from '@/constants/routes';
import { FontFamily, FontSize, Radius, Spacing } from '@/constants/theme';
import { useFemaleHealth } from '@/hooks/useFemaleHealth';
import { isStrictSensitiveMode } from '@/lib/privacy-settings';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';
import { useSettingsStore } from '@/stores/settingsStore';

function SettingRow({
  label,
  value,
  actionLabel,
  onPress,
}: {
  label: string;
  value: string;
  actionLabel?: string;
  onPress?: () => void;
}) {
  return (
    <View style={styles.settingRow}>
      <View style={styles.settingCopy}>
        <Text style={styles.settingLabel}>{label}</Text>
        <Text style={styles.settingValue}>{value}</Text>
      </View>
      {actionLabel && onPress ? (
        <Pressable onPress={onPress} style={styles.inlineAction}>
          <Text style={styles.inlineActionText}>{actionLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

export default function FemaleSettingsScreen() {
  const profile = useAuthStore((state) => state.profile);
  const updateProfile = useAuthStore((state) => state.updateProfile);
  const strictSensitiveMode = isStrictSensitiveMode(profile);
  const femaleEnabled = Boolean(profile?.female_health_enabled);
  const femalePeriodDuration = useSettingsStore((state) => state.femalePeriodDuration);
  const femaleDisclaimerAccepted = useSettingsStore((state) => state.femaleDisclaimerAccepted);
  const { cycleLength, lastPeriodDate, nextPeriodDate, isInCycle } = useFemaleHealth();
  const [isUpdating, setIsUpdating] = useState(false);

  const handleToggleModule = async (value: boolean) => {
    if (!profile?.id) return;
    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ female_health_enabled: value })
        .eq('id', profile.id);
      if (error) throw error;
      updateProfile({ female_health_enabled: value });
      if (value && !isInCycle) {
        router.push(Routes.profile.femaleHealth as any);
      }
    } catch {
      Alert.alert('No se pudo guardar', 'Intenta de nuevo en unos segundos.');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <SafeScreen padHorizontal={false} padBottom>
      <Header
        title="Ajustes"
        subtitle="Configuracion del modulo, privacidad y exportacion del ciclo."
        showBack
        color={Colors.female}
      />

      <FemaleModuleTabs active="settings" />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <Card accentColor={Colors.female}>
          <Text style={styles.sectionTitle}>Configuracion del modulo</Text>
          <View style={styles.toggleRow}>
            <View style={styles.toggleCopy}>
              <Text style={styles.toggleTitle}>Modulo activo</Text>
              <Text style={styles.toggleText}>
                Adapta entreno, nutricion y pasos usando tu fase actual.
              </Text>
            </View>
            <Switch
              value={femaleEnabled}
              onValueChange={(value) => void handleToggleModule(value)}
              disabled={isUpdating}
              trackColor={{ false: '#2C2742', true: withOpacity(Colors.female, 0.54) }}
              thumbColor={femaleEnabled ? Colors.female : Colors.textMuted}
            />
          </View>
        </Card>

        <Card>
          <Text style={styles.sectionTitle}>Datos del ciclo</Text>
          <SettingRow
            label="Ultimo periodo"
            value={
              lastPeriodDate
                ? new Date(`${lastPeriodDate}T00:00:00`).toLocaleDateString('es-ES', {
                    day: 'numeric',
                    month: 'short',
                  })
                : 'Sin configurar'
            }
          />
          <SettingRow label="Duracion del ciclo" value={`${cycleLength || 28} dias`} />
          <SettingRow label="Duracion mens." value={`${femalePeriodDuration} dias`} />
          <SettingRow
            label="Proximo periodo"
            value={
              nextPeriodDate
                ? new Date(`${nextPeriodDate}T00:00:00`).toLocaleDateString('es-ES', {
                    day: 'numeric',
                    month: 'short',
                  })
                : 'Pendiente'
            }
          />
          <Button
            label="Editar datos del ciclo"
            onPress={() => router.push(Routes.profile.femaleHealth as any)}
            color={Colors.female}
            fullWidth
            style={styles.sectionButton}
          />
        </Card>

        <Card>
          <Text style={styles.sectionTitle}>Privacidad</Text>
          <SettingRow label="Datos protegidos" value="Solo vos puedes verlos." />
          <SettingRow
            label="Modo estricto"
            value={strictSensitiveMode ? 'Solo en dispositivo' : 'Sincronizacion activa'}
            actionLabel="Abrir"
            onPress={() => router.push(Routes.settings.privacy as any)}
          />
          <SettingRow
            label="Disclaimer medico"
            value={femaleDisclaimerAccepted ? 'Confirmado' : 'Pendiente'}
          />
        </Card>

        <Card>
          <Text style={styles.sectionTitle}>Notificaciones</Text>
          <Text style={styles.sectionText}>
            Controla avisos del ciclo, proximo periodo y recordatorios desde la configuracion
            general.
          </Text>
          <Button
            label="Abrir notificaciones"
            onPress={() => router.push(Routes.settings.notificationsSettings as any)}
            variant="secondary"
            color={Colors.female}
            fullWidth
            style={styles.sectionButton}
          />
        </Card>

        <Card>
          <Text style={styles.sectionTitle}>Exportar datos</Text>
          <Text style={styles.sectionText}>
            PDF de tus ultimos ciclos para compartirlo en una consulta si lo necesitas.
          </Text>
          <Button
            label="Generar PDF del historial"
            onPress={() => router.push(Routes.profile.exportData as any)}
            variant="secondary"
            color={Colors.female}
            fullWidth
            style={styles.sectionButton}
          />
        </Card>
      </ScrollView>
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: Spacing[5],
    paddingBottom: Spacing[8],
    gap: Spacing[3],
  },
  sectionTitle: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.lg,
    color: Colors.textPrimary,
    marginBottom: Spacing[3],
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[3],
  },
  toggleCopy: {
    flex: 1,
    gap: 4,
  },
  toggleTitle: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.sm,
    color: Colors.textPrimary,
  },
  toggleText: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing[2],
    paddingVertical: Spacing[2.5],
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Colors.border,
  },
  settingCopy: {
    flex: 1,
    gap: 2,
  },
  settingLabel: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.xs,
    color: Colors.textMuted,
  },
  settingValue: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.sm,
    color: Colors.textPrimary,
  },
  inlineAction: {
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: withOpacity(Colors.female, 0.24),
    backgroundColor: withOpacity(Colors.female, 0.1),
    paddingHorizontal: Spacing[2.5],
    paddingVertical: Spacing[1.25],
  },
  inlineActionText: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.xs,
    color: Colors.female,
  },
  sectionText: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  sectionButton: {
    marginTop: Spacing[3],
  },
});
