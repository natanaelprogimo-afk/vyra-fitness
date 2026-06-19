import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import OnboardingShell from '@/components/onboarding/OnboardingShell';
import Button from '@/components/ui/Button';
import { Colors, withOpacity } from '@/constants/colors';
import { Routes } from '@/constants/routes';
import { FontFamily, FontSize, Radius, Spacing } from '@/constants/theme';
import { GENDER_OPTIONS } from '@/lib/onboarding-profile';
import { GOAL_OPTIONS, EQUIPMENT_OPTIONS, getFirstIncompleteOnboardingRoute } from '@/lib/onboarding-v2';
import {
  loadOnboardingProgress,
  saveOnboardingProgress,
  type OnboardingDraft,
} from '@/lib/onboarding-storage';

export default function ExpressReadyScreen() {
  const [draft, setDraft] = useState<OnboardingDraft | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let active = true;

    void (async () => {
      const progress = await loadOnboardingProgress();
      if (!active) return;

      // ARREGLO: Validar que el onboarding express está completo
      const nextRoute = getFirstIncompleteOnboardingRoute(progress.data ?? null);
      if (nextRoute !== Routes.auth.onboarding.expressReady) {
        router.replace(nextRoute as never);
        return;
      }

      setDraft(progress.data ?? null);
    })();

    return () => {
      active = false;
    };
  }, []);

  const handleComplete = async () => {
    if (!draft) return;

    setIsLoading(true);
    try {
      // Navigate to express-name to collect user's name
      await saveOnboardingProgress(Routes.auth.onboarding.expressName, draft);
      router.push(Routes.auth.onboarding.expressName as never);
    } catch (err) {
      console.error('Failed to navigate to express-name:', err);
      setIsLoading(false);
    }
  };

  if (!draft) {
    return (
      <OnboardingShell
        pathname={Routes.auth.onboarding.expressReady}
        eyebrow="Exprés • Paso 3 de 3"
        title="Cargando..."
        subtitle="Por favor espera"
        scrollable
      >
        <View />
      </OnboardingShell>
    );
  }

  const goalLabel = GOAL_OPTIONS.find((g) => g.profileGoal === draft.goal)?.label || draft.goal;
  const genderLabel = GENDER_OPTIONS.find((g) => g.id === draft.gender)?.label || draft.gender;
  const equipmentLabel = EQUIPMENT_OPTIONS.find((e) => e.id === draft.equipment)?.label || draft.equipment;

  return (
    <OnboardingShell
      pathname={Routes.auth.onboarding.expressReady}
      eyebrow="Exprés • Paso 3 de 3"
      title="¡Casi listo!"
      subtitle="Aquí está tu perfil configurado"
      scrollable
      contentStyle={styles.content}
      footer={
        <View style={styles.footerStack}>
          <Button
            onPress={handleComplete}
            fullWidth
            size="md"
            haptic="medium"
            loading={isLoading}
          >
            Siguiente
          </Button>
        </View>
      }
    >
      <View style={styles.summaryCard}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Objetivo</Text>
          <Pressable onPress={() => router.push(Routes.auth.onboarding.expressGoal as never)} hitSlop={8}>
            <Text style={styles.editButton}>✏️</Text>
          </Pressable>
        </View>
        <Text style={styles.sectionValue}>{goalLabel}</Text>
      </View>

      <View style={styles.summaryCard}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Datos Personales</Text>
          <Pressable onPress={() => router.push(Routes.auth.onboarding.expressWeight as never)} hitSlop={8}>
            <Text style={styles.editButton}>✏️</Text>
          </Pressable>
        </View>
        <View style={styles.metricRow}>
          <View style={styles.metricItem}>
            <Text style={styles.metricLabel}>Edad</Text>
            <Text style={styles.metricValue}>{draft.age} años</Text>
          </View>
          <View style={styles.metricItem}>
            <Text style={styles.metricLabel}>Altura</Text>
            <Text style={styles.metricValue}>{draft.height_cm} cm</Text>
          </View>
          <View style={styles.metricItem}>
            <Text style={styles.metricLabel}>Peso</Text>
            <Text style={styles.metricValue}>{draft.weight_current_kg ? Math.round(draft.weight_current_kg) : '—'} kg</Text>
          </View>
        </View>
      </View>

      <View style={styles.summaryCard}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Configuración</Text>
          <Pressable onPress={() => router.push(Routes.auth.onboarding.expressWeight as never)} hitSlop={8}>
            <Text style={styles.editButton}>✏️</Text>
          </Pressable>
        </View>
        <View style={styles.configItem}>
          <Text style={styles.configLabel}>Género:</Text>
          <Text style={styles.configValue}>{genderLabel}</Text>
        </View>
        <View style={styles.configItem}>
          <Text style={styles.configLabel}>Equipo:</Text>
          <Text style={styles.configValue}>{equipmentLabel}</Text>
        </View>
        <View style={styles.configItem}>
          <Text style={styles.configLabel}>Módulos activos:</Text>
          <Text style={styles.configValue}>{draft.active_modules?.length ?? 0}</Text>
        </View>
      </View>

      <Text style={styles.noteText}>
        💡 Puedes cambiar cualquier configuración después en tus preferencias.
      </Text>
      <Text style={styles.tipText}>
        ¡Bienvenido a VYRA! Tu ajuste perfecto de nutrición, entreno y sueño te espera.
      </Text>    </OnboardingShell>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: Spacing[2.5],
    paddingTop: 0,
    paddingBottom: Spacing[2],
    justifyContent: 'space-between',
  },
  footerStack: {
    gap: Spacing[2],
  },
  summaryCard: {
    borderRadius: Radius['2xl'],
    borderWidth: 1,
    borderColor: withOpacity(Colors.white, 0.08),
    backgroundColor: withOpacity(Colors.surface2, 0.92),
    padding: Spacing[3],
    gap: Spacing[1.5],
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontFamily: FontFamily.semibold,
    fontSize: 12,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  editButton: {
    fontSize: 16,
  },
  sectionValue: {
    fontFamily: FontFamily.display,
    fontSize: 24,
    lineHeight: 28,
    color: Colors.textPrimary,
    letterSpacing: -0.7,
  },
  metricRow: {
    flexDirection: 'row',
    gap: Spacing[2],
    justifyContent: 'space-between',
  },
  metricItem: {
    flex: 1,
    gap: Spacing[0.5],
  },
  metricLabel: {
    fontFamily: FontFamily.medium,
    fontSize: 10,
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  metricValue: {
    fontFamily: FontFamily.semibold,
    fontSize: 16,
    lineHeight: 20,
    color: Colors.textPrimary,
  },
  configItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: Spacing[2],
    paddingVertical: Spacing[1],
    borderBottomWidth: 1,
    borderBottomColor: withOpacity(Colors.white, 0.04),
  },
  configLabel: {
    fontFamily: FontFamily.medium,
    fontSize: 12,
    color: Colors.textSecondary,
  },
  configValue: {
    fontFamily: FontFamily.semibold,
    fontSize: 12,
    color: Colors.textPrimary,
  },
  noteText: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    lineHeight: 15,
    color: Colors.textMuted,
    textAlign: 'center',
  },
  tipText: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    lineHeight: 18,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: Spacing[1],
  },
});
