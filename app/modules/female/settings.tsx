import React, { useEffect, useRef, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import FemaleModuleTabs from '@/components/female/FemaleModuleTabs';
import Header from '@/components/layout/Header';
import ConfirmationSheet from '@/components/ui/ConfirmationSheet';
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
import { FemaleModule } from '@/constants/strings';
import { useFemaleHealth } from '@/hooks/useFemaleHealth';
import { useFemaleSymptomPrediction } from '@/hooks/useFemaleSymptomPrediction';
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
  return new Date(`${value}T12:00:00`).toLocaleDateString('es-UY', {
    day: 'numeric',
    month: 'short',
  });
}

function formatAlertDate(value: Date | null | undefined) {
  if (!value) return 'Pendiente';
  return value.toLocaleString('es-UY', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
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
  const femalePredictionAlertsEnabled = useSettingsStore((state) => state.femalePredictionAlertsEnabled);
  const setFemaleDisclaimerAccepted = useSettingsStore((state) => state.setFemaleDisclaimerAccepted);
  const setFemalePredictionAlertsEnabled = useSettingsStore((state) => state.setFemalePredictionAlertsEnabled);
  const { cycleLength, lastPeriodDate, nextPeriodDate, isInCycle } = useFemaleHealth();
  const { topUpcomingAlert } = useFemaleSymptomPrediction();
  const [isUpdating, setIsUpdating] = useState(false);
  const [inlineError, setInlineError] = useState<string | null>(null);
  const [confirmDisableOpen, setConfirmDisableOpen] = useState(false);
  const clearErrorTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!inlineError) return undefined;
    if (clearErrorTimerRef.current) {
      clearTimeout(clearErrorTimerRef.current);
    }
    clearErrorTimerRef.current = setTimeout(() => {
      setInlineError(null);
      clearErrorTimerRef.current = null;
    }, 4000);

    return () => {
      if (clearErrorTimerRef.current) {
        clearTimeout(clearErrorTimerRef.current);
        clearErrorTimerRef.current = null;
      }
    };
  }, [inlineError]);

  const persistModuleToggle = async (value: boolean) => {
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
      showToast(value ? 'Modulo del ciclo activado.' : 'Modulo del ciclo desactivado.', 'success');

      if (value && !isInCycle) {
        router.push(Routes.profile.femaleHealth);
      }
    } catch {
      setInlineError(FemaleModule.errors.saveFailed);
      showToast(FemaleModule.errors.configSaveFailed, 'error');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleToggleModule = (value: boolean) => {
    if (!value && femaleEnabled) {
      setConfirmDisableOpen(true);
      return;
    }
    void persistModuleToggle(value);
  };

  return (
    <SafeScreen padHorizontal={false} padBottom>
      <Header
        title={FemaleModule.header.title}
        subtitle={FemaleModule.header.subtitle}
        showBack
        color={Colors.female}
      />

      <FemaleModuleTabs active="settings" />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {inlineError ? (
          <NoticeCard
            title={FemaleModule.errorCard.title}
            body={inlineError}
            tone="error"
          />
        ) : null}

        {!femaleDisclaimerAccepted ? (
          <NoticeCard
            title={FemaleModule.disclaimer.title}
            body={FemaleModule.disclaimer.body}
            tone="warning"
            actionLabel={FemaleModule.disclaimer.confirm}
            onAction={() => setFemaleDisclaimerAccepted(true)}
          />
        ) : null}

        <Card accentColor={Colors.female} style={styles.card}>
          <SectionHeader
            eyebrow={FemaleModule.moduleSection.eyebrow}
            title={FemaleModule.moduleSection.title}
            subtitle={FemaleModule.moduleSection.subtitle}
          />

          <SettingToggleRow
            title={FemaleModule.moduleSection.toggleLabel}
            description={FemaleModule.moduleSection.toggleDescription}
            value={femaleEnabled}
            onValueChange={handleToggleModule}
            disabled={isUpdating}
            accentColor={Colors.female}
          />
        </Card>

        <Card style={styles.card}>
          <SectionHeader
            eyebrow={FemaleModule.cycleData.eyebrow}
            title={FemaleModule.cycleData.title}
            subtitle={FemaleModule.cycleData.subtitle}
          />

          <View style={styles.infoStack}>
            <InfoRow
              label={FemaleModule.cycleData.lastPeriod}
              value={lastPeriodDate ? formatCycleDate(lastPeriodDate) : FemaleModule.cycleData.unconfigured}
            />
            <InfoRow label={FemaleModule.cycleData.cycleDuration} value={`${cycleLength || 28} ${FemaleModule.cycleData.daysLabel}`} />
            <InfoRow label={FemaleModule.cycleData.periodDuration} value={`${femalePeriodDuration} ${FemaleModule.cycleData.daysLabel}`} />
            <InfoRow label={FemaleModule.cycleData.nextPeriod} value={formatCycleDate(nextPeriodDate)} />
          </View>

          <LinkRow
            label={FemaleModule.cycleData.editLink}
            description={FemaleModule.cycleData.editDescription}
            onPress={() => router.push(Routes.profile.femaleHealth)}
            accentColor={Colors.female}
          />
        </Card>

        <Card style={styles.card}>
          <SectionHeader
            eyebrow="Privacidad"
            title="Control y discrecion"
            subtitle="Este modulo mantiene una capa sensible propia y te deja revisar el modo estricto cuando lo necesites."
          />

          <View style={styles.infoStack}>
            <InfoRow label="Datos protegidos" value="Solo tu puedes verlos dentro de tu cuenta." />
            <InfoRow
              label="Disclaimer medico"
              value={femaleDisclaimerAccepted ? 'Confirmado' : 'Pendiente'}
            />
            <InfoRow
              label="Modo estricto"
              value={strictSensitiveMode ? 'Solo en dispositivo' : 'Sincronizacion activa'}
            />
          </View>

          <LinkRow
            label={femaleDisclaimerAccepted ? 'Revisar disclaimer medico' : 'Confirmar disclaimer medico'}
            description="Mantiene claro que este modulo acompana, pero no reemplaza evaluacion profesional."
            onPress={() => setFemaleDisclaimerAccepted(true)}
            accentColor={Colors.female}
          />

          <LinkRow
            label="Abrir ajustes de privacidad"
            description="Revisa sincronizacion, exportacion y controles sensibles del resto del sistema."
            onPress={() => router.push(Routes.settings.privacy)}
            accentColor={Colors.female}
          />
        </Card>

        <Card style={styles.card}>
          <SectionHeader
            eyebrow="Continuidad"
            title="Notificaciones y exportacion"
            subtitle="Las acciones secundarias se mantienen en filas compartidas en vez de botones sueltos."
          />

          <SettingToggleRow
            title="Alertas predictivas"
            description={
              topUpcomingAlert
                ? `Avisamos antes de la ventana esperada de ${topUpcomingAlert.label.toLowerCase()}.`
                : 'Cuando VYRA detecte un patron repetido, te avisa antes de la proxima ventana.'
            }
            value={femalePredictionAlertsEnabled}
            onValueChange={setFemalePredictionAlertsEnabled}
            disabled={!femaleEnabled}
            accentColor={Colors.female}
          />

          {femalePredictionAlertsEnabled && topUpcomingAlert ? (
            <View style={styles.infoStack}>
              <InfoRow label="Proxima alerta" value={formatAlertDate(topUpcomingAlert.notifyAt)} />
              <InfoRow
                label="Ventana esperada"
                value={`${formatCycleDate(topUpcomingAlert.prediction.nextDateStart)} al ${formatCycleDate(topUpcomingAlert.prediction.nextDateEnd)}`}
              />
              <InfoRow label="Contexto" value={topUpcomingAlert.body} />
            </View>
          ) : null}

          <LinkRow
            label="Abrir notificaciones"
            description="Controla avisos del ciclo, del proximo periodo y recordatorios asociados."
            onPress={() => router.push(Routes.settings.notificationsSettings)}
            accentColor={Colors.female}
          />

          <LinkRow
            label="Exportar historial del ciclo"
            description="Genera un PDF con tus registros recientes si necesitas compartirlos en una consulta."
            onPress={() => router.push(Routes.profile.exportData)}
            accentColor={Colors.female}
          />
        </Card>

        <ScreenFooterSpacer extra={Spacing[2]} />
      </ScrollView>

      <ConfirmationSheet
        visible={confirmDisableOpen}
        onClose={() => setConfirmDisableOpen(false)}
        title="Desactivar modulo del ciclo"
        body="Si lo desactivas, VYRA deja de usar esta capa en el contexto diario hasta que vuelvas a activarla."
        confirmLabel="Desactivar"
        confirmVariant="danger"
        onConfirm={() => {
          setConfirmDisableOpen(false);
          void persistModuleToggle(false);
        }}
        loading={isUpdating}
      />
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
