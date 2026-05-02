import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import FemaleModuleTabs from '@/components/female/FemaleModuleTabs';
import Header from '@/components/layout/Header';
import Card from '@/components/ui/Card';
import LinkRow from '@/components/ui/LinkRow';
import NoticeCard from '@/components/ui/NoticeCard';
import SafeScreen from '@/components/ui/SafeScreen';
import ScreenFooterSpacer from '@/components/ui/ScreenFooterSpacer';
import SectionHeader from '@/components/ui/SectionHeader';
import SettingToggleRow from '@/components/ui/SettingToggleRow';
import { Colors } from '@/constants/colors';
import { Routes } from '@/constants/routes';
import { FontFamily, FontSize, Spacing } from '@/constants/theme';
import { useFemaleHealth } from '@/hooks/useFemaleHealth';
import { isStrictSensitiveMode } from '@/lib/privacy-settings';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { useUIStore } from '@/stores/uiStore';

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

function formatCycleDate(value: string | null | undefined) {
  if (!value) return 'Pendiente';
  return new Date(`${value}T00:00:00`).toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'short',
  });
}

export default function FemaleSettingsScreen() {
  const profile = useAuthStore((state) => state.profile);
  const updateProfile = useAuthStore((state) => state.updateProfile);
  const showToast = useUIStore((state) => state.showToast);
  const strictSensitiveMode = isStrictSensitiveMode(profile);
  const femaleEnabled = Boolean(profile?.female_health_enabled);
  const femalePeriodDuration = useSettingsStore((state) => state.femalePeriodDuration);
  const femaleDisclaimerAccepted = useSettingsStore((state) => state.femaleDisclaimerAccepted);
  const { cycleLength, lastPeriodDate, nextPeriodDate, isInCycle } = useFemaleHealth();
  const [isUpdating, setIsUpdating] = useState(false);
  const [inlineError, setInlineError] = useState<string | null>(null);

  const handleToggleModule = async (value: boolean) => {
    if (!profile?.id) return;

    setIsUpdating(true);
    setInlineError(null);

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ female_health_enabled: value })
        .eq('id', profile.id);

      if (error) throw error;

      updateProfile({ female_health_enabled: value });
      showToast(value ? 'Módulo del ciclo activado.' : 'Módulo del ciclo desactivado.', 'success');

      if (value && !isInCycle) {
        router.push(Routes.profile.femaleHealth as never);
      }
    } catch {
      setInlineError('No se pudo guardar este ajuste ahora mismo. Intenta de nuevo en unos segundos.');
      showToast('No se pudo guardar la configuración del ciclo.', 'error');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <SafeScreen padHorizontal={false} padBottom>
      <Header
        title="Ajustes del ciclo"
        subtitle="Módulo, privacidad y continuidad del seguimiento."
        showBack
        color={Colors.female}
      />

      <FemaleModuleTabs active="settings" />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {inlineError ? (
          <NoticeCard
            title="No pudimos guardar este cambio"
            body={inlineError}
            tone="error"
          />
        ) : null}

        <Card accentColor={Colors.female} style={styles.card}>
          <SectionHeader
            eyebrow="Módulo"
            title="Seguimiento sensible y opcional"
            subtitle="Si lo activas, VYRA puede ajustar contexto de entreno, nutrición y recuperación según tu fase."
          />

          <SettingToggleRow
            title="Módulo activo"
            description="Activa o pausa la lectura del ciclo sin salir de tus ajustes."
            value={femaleEnabled}
            onValueChange={(value) => void handleToggleModule(value)}
            disabled={isUpdating}
            accentColor={Colors.female}
          />
        </Card>

        <Card style={styles.card}>
          <SectionHeader
            eyebrow="Datos base"
            title="Resumen del ciclo"
            subtitle="La lectura principal vive aquí en filas claras y la edición queda en una pantalla dedicada."
          />

          <View style={styles.infoStack}>
            <InfoRow
              label="Último período"
              value={lastPeriodDate ? formatCycleDate(lastPeriodDate) : 'Sin configurar'}
            />
            <InfoRow label="Duración del ciclo" value={`${cycleLength || 28} días`} />
            <InfoRow label="Duración menstrual" value={`${femalePeriodDuration} días`} />
            <InfoRow label="Próximo período" value={formatCycleDate(nextPeriodDate)} />
          </View>

          <LinkRow
            label="Editar datos del ciclo"
            description="Abre la configuración base del módulo para registrar fechas, duración y contexto."
            onPress={() => router.push(Routes.profile.femaleHealth as never)}
            accentColor={Colors.female}
          />
        </Card>

        <Card style={styles.card}>
          <SectionHeader
            eyebrow="Privacidad"
            title="Control y discreción"
            subtitle="Este módulo mantiene una capa sensible propia y te deja revisar el modo estricto cuando lo necesites."
          />

          <View style={styles.infoStack}>
            <InfoRow label="Datos protegidos" value="Solo tú puedes verlos dentro de tu cuenta." />
            <InfoRow
              label="Disclaimer médico"
              value={femaleDisclaimerAccepted ? 'Confirmado' : 'Pendiente'}
            />
            <InfoRow
              label="Modo estricto"
              value={strictSensitiveMode ? 'Solo en dispositivo' : 'Sincronización activa'}
            />
          </View>

          <LinkRow
            label="Abrir ajustes de privacidad"
            description="Revisa sincronización, exportación y controles sensibles del resto del sistema."
            onPress={() => router.push(Routes.settings.privacy as never)}
            accentColor={Colors.female}
          />
        </Card>

        <Card style={styles.card}>
          <SectionHeader
            eyebrow="Continuidad"
            title="Notificaciones y exportación"
            subtitle="Las acciones secundarias se mantienen en filas compartidas en vez de botones sueltos."
          />

          <LinkRow
            label="Abrir notificaciones"
            description="Controla avisos del ciclo, del próximo período y recordatorios asociados."
            onPress={() => router.push(Routes.settings.notificationsSettings as never)}
            accentColor={Colors.female}
          />

          <LinkRow
            label="Exportar historial del ciclo"
            description="Genera un PDF con tus registros recientes si necesitas compartirlos en una consulta."
            onPress={() => router.push(Routes.profile.exportData as never)}
            accentColor={Colors.female}
          />
        </Card>

        <ScreenFooterSpacer extra={Spacing[2]} />
      </ScrollView>
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: Spacing[5],
    paddingBottom: Spacing[8],
    gap: Spacing[4],
  },
  card: {
    gap: Spacing[4],
  },
  infoStack: {
    gap: Spacing[2],
  },
  infoRow: {
    gap: 2,
  },
  infoLabel: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  infoValue: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.sm,
    color: Colors.textPrimary,
    lineHeight: 20,
  },
});
