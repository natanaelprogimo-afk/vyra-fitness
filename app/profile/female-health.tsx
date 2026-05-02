import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import SafeScreen from '@/components/ui/SafeScreen';
import Header from '@/components/layout/Header';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import NoticeCard from '@/components/ui/NoticeCard';
import ScreenFooterSpacer from '@/components/ui/ScreenFooterSpacer';
import SectionHeader from '@/components/ui/SectionHeader';
import SettingToggleRow from '@/components/ui/SettingToggleRow';
import { Colors, withOpacity } from '@/constants/colors';
import { FontFamily, FontSize, Radius, Spacing } from '@/constants/theme';
import { useAuthStore } from '@/stores/authStore';
import { supabase } from '@/lib/supabase';
import { useUIStore } from '@/stores/uiStore';

const PHASES = [
  {
    name: 'Menstrual · Días 1-5',
    color: Colors.error,
    desc: 'Baja un poco la exigencia y prioriza movimiento suave, descanso y recuperación.',
  },
  {
    name: 'Folicular · Días 6-13',
    color: Colors.steps,
    desc: 'Suele ser la fase con más energía y mejor tolerancia al esfuerzo.',
  },
  {
    name: 'Ovulación · Día 14',
    color: Colors.fasting,
    desc: 'Puede ser un buen momento para apretar un poco más si te sientes bien.',
  },
  {
    name: 'Lútea · Días 15-28',
    color: Colors.sleep,
    desc: 'Conviene vigilar fatiga, descanso y hambre para no forzar de más.',
  },
] as const;

export default function FemaleHealthScreen() {
  const showToast = useUIStore((state) => state.showToast);
  const { profile, setProfile } = useAuthStore();
  const [enabled, setEnabled] = useState(profile?.female_health_enabled ?? false);
  const [saving, setSaving] = useState(false);
  const [pendingEnable, setPendingEnable] = useState(false);
  const [inlineError, setInlineError] = useState<string | null>(null);

  const privacyBody = useMemo(
    () =>
      'La información del ciclo solo aparece dentro de tu cuenta y puedes desactivar este módulo cuando quieras. Esta lectura es orientativa: no la uses como método anticonceptivo ni como reemplazo de atención médica.',
    [],
  );

  async function save(nextValue: boolean) {
    if (!profile?.id) return;

    setSaving(true);
    setInlineError(null);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({ female_health_enabled: nextValue })
        .eq('id', profile.id)
        .select()
        .single();

      if (error) throw error;

      setEnabled(nextValue);
      setPendingEnable(false);
      setProfile(data);
      showToast(nextValue ? 'Salud femenina activada.' : 'Salud femenina desactivada.', 'success');
    } catch {
      setInlineError('No se pudo guardar este ajuste ahora mismo. Intenta de nuevo en unos segundos.');
      showToast('No se pudo guardar salud femenina.', 'error');
    } finally {
      setSaving(false);
    }
  }

  function handleToggle(nextValue: boolean) {
    if (nextValue && !enabled) {
      setPendingEnable(true);
      return;
    }

    void save(nextValue);
  }

  return (
    <SafeScreen padHorizontal={false} padBottom>
      <Header title="Salud femenina" showBack color={Colors.female} />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {pendingEnable ? (
          <NoticeCard
            title="Activación con privacidad explícita"
            body="VYRA puede ajustar entrenamiento, nutrición y recuperación según el ciclo. Esta información queda privada dentro de tu cuenta y puedes apagarla cuando quieras."
            tone="warning"
            actionLabel="Activar módulo"
            onAction={() => void save(true)}
            secondaryLabel="Cancelar"
            onSecondaryAction={() => setPendingEnable(false)}
          />
        ) : null}

        {inlineError ? (
          <NoticeCard title="No pudimos guardar este cambio" body={inlineError} tone="error" />
        ) : null}

        <Card style={styles.card}>
          <SectionHeader
            eyebrow="Módulo opcional"
            title="Control sensible y discreto"
            subtitle="Si no lo activas, no aparece en tu día a día. Si lo activas, la app puede leer mejor contexto de fatiga, hambre y entreno."
          />

          <SettingToggleRow
            title="Activar seguimiento del ciclo"
            description="Ajusta recomendaciones de entreno, nutrición y descanso según la fase actual."
            value={enabled}
            onValueChange={handleToggle}
            disabled={saving}
            accentColor={Colors.female}
          />
        </Card>

        {enabled ? (
          <Card style={styles.card}>
            <SectionHeader
              eyebrow="Lectura diaria"
              title="Cómo cambia tu día"
              subtitle="Las fases aparecen como tarjetas consistentes y no como una lista suelta de texto."
            />

            <View style={styles.phaseStack}>
              {PHASES.map((phase) => (
                <View key={phase.name} style={styles.phaseCard}>
                  <View style={[styles.phaseDot, { backgroundColor: phase.color }]} />
                  <View style={styles.phaseInfo}>
                    <Text style={styles.phaseName}>{phase.name}</Text>
                    <Text style={styles.phaseDesc}>{phase.desc}</Text>
                  </View>
                </View>
              ))}
            </View>

            <Button
              onPress={() => router.push('/modules/female' as never)}
              label="Abrir módulo de ciclo"
              variant="secondary"
              color={Colors.female}
              fullWidth
            />
          </Card>
        ) : null}

        <NoticeCard title="Privacidad" body={privacyBody} tone="info" />

        <ScreenFooterSpacer extra={Spacing[2]} />
      </ScrollView>
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingHorizontal: Spacing[5],
    paddingTop: Spacing[4],
    gap: Spacing[4],
  },
  card: {
    gap: Spacing[4],
  },
  phaseStack: {
    gap: Spacing[2],
  },
  phaseCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing[3],
    backgroundColor: Colors.surface2,
    borderRadius: Radius.xl,
    padding: Spacing[4],
    borderWidth: 1,
    borderColor: withOpacity(Colors.female, 0.12),
  },
  phaseDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginTop: 4,
  },
  phaseInfo: {
    flex: 1,
  },
  phaseName: {
    color: Colors.textPrimary,
    fontSize: FontSize.sm,
    fontFamily: FontFamily.semibold,
    marginBottom: 3,
  },
  phaseDesc: {
    color: Colors.textSecondary,
    fontSize: FontSize.xs,
    fontFamily: FontFamily.regular,
    lineHeight: 18,
  },
});
