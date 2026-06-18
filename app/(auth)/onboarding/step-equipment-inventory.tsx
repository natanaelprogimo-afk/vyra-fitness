// REDESIGNED: 2026-06-11 - equipment inventory with OnboardingOptionCard
import { useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import OnboardingShell from '@/components/onboarding/OnboardingShell';
import OnboardingOptionCard from '@/components/onboarding/OnboardingOptionCard';
import Button from '@/components/ui/Button';
import { Colors, withOpacity } from '@/constants/colors';
import { Routes } from '@/constants/routes';
import { FontFamily, FontSize, Radius, Spacing } from '@/constants/theme';
import {
  getEquipmentInventoryOptions,
  getFirstIncompleteOnboardingRoute,
  sanitizeEquipmentInventory,
  type EquipmentInventoryId,
  type OnboardingEquipmentType,
} from '@/lib/onboarding-v2';
import {
  loadOnboardingProgress,
  saveOnboardingProgress,
  type OnboardingDraft,
} from '@/lib/onboarding-storage';

function buildHeading(equipment: OnboardingEquipmentType) {
  if (equipment === 'gym_full') {
    return {
      title: 'Marca lo que de verdad tiene tu gym.',
      subtitle: 'Deja solo el material que si puedes usar cada semana.',
    };
  }

  if (equipment === 'home_basic') {
    return {
      title: 'Ahora elige el material real que tienes en casa.',
      subtitle: 'Asi evitamos rutinas que se ven bien en teoria pero no puedes hacer en tu espacio.',
    };
  }

  if (equipment === 'gym_and_home') {
    return {
      title: 'Material que tienes disponible en ambos lugares.',
      subtitle: 'Asi armamos rutinas que funcionan tanto en gym como en casa.',
    };
  }

  return {
    title: 'Incluso con peso corporal podemos afinar apoyos.',
    subtitle: 'Marca si tienes algo minimo para variar mejor las sesiones.',
  };
}

export default function StepEquipmentInventoryScreen() {
  const [draft, setDraft] = useState<OnboardingDraft | null>(null);
  const [equipment, setEquipment] = useState<OnboardingEquipmentType | null>(null);
  const [selected, setSelected] = useState<EquipmentInventoryId[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const processingRef = useRef(false);

  useEffect(() => {
    let active = true;

    void (async () => {
      const progress = await loadOnboardingProgress();
      if (!active) return;

      const nextEquipment =
        progress.data?.equipment === 'gym_full' ||
        progress.data?.equipment === 'home_basic' ||
        progress.data?.equipment === 'gym_and_home' ||
        progress.data?.equipment === 'bodyweight'
          ? progress.data.equipment
          : null;

      if (!nextEquipment) {
        router.replace(Routes.auth.onboarding.equipment as never);
        return;
      }

      setDraft(progress.data ?? null);
      setEquipment(nextEquipment);
      setSelected(sanitizeEquipmentInventory(nextEquipment, progress.data?.equipment_inventory));
    })();

    return () => {
      active = false;
    };
  }, []);

  const options = useMemo(
    () => (equipment ? getEquipmentInventoryOptions(equipment) : []),
    [equipment],
  );

  const heading = useMemo(
    () => (equipment ? buildHeading(equipment) : { title: '', subtitle: '' }),
    [equipment],
  );

  const toggleItem = (itemId: EquipmentInventoryId) => {
    if (!equipment) return;

    setSelected((current) => {
      if (equipment === 'bodyweight' && itemId === 'none') {
        return ['none'];
      }

      const next = current.includes(itemId)
        ? current.filter((item) => item !== itemId)
        : [...current.filter((item) => item !== 'none'), itemId];

      return sanitizeEquipmentInventory(equipment, next);
    });
  };

  const handleContinue = async () => {
    if (!equipment || selected.length === 0 || processingRef.current) return;

    processingRef.current = true;
    setIsProcessing(true);
    setSaveError(null);

    try {
      const nextRoute = getFirstIncompleteOnboardingRoute({
        ...(draft ?? {}),
        equipment_inventory: selected,
      });

      // Don't re-save equipment - it was already saved in step-equipment.tsx
      // Only save equipment_inventory to avoid duplication/overwrite risk
      await saveOnboardingProgress(nextRoute, {
        ...(draft ?? {}),
        equipment_inventory: selected,
      });

      processingRef.current = false;
      router.push(nextRoute as never);
    } catch (err) {
      console.error('[Step Equipment Inventory] Failed to continue:', err);
      setSaveError('No pudimos guardar tu selección. Verifica tu conexión e intenta de nuevo.');
      setIsProcessing(false);
      processingRef.current = false;
    }
  };

  return (
    <OnboardingShell
      pathname={Routes.auth.onboarding.equipmentInventory}
      eyebrow="Material disponible"
      title={heading.title}
      subtitle={heading.subtitle}
      scrollable={false}
      contentStyle={styles.content}
      footer={
        <View>
          {saveError && (
            <View style={styles.errorBanner}>
              <Text style={styles.errorIcon}>⚠️</Text>
              <Text style={styles.errorText}>{saveError}</Text>
            </View>
          )}
          <Button
            onPress={handleContinue}
            disabled={selected.length === 0 || isProcessing}
            fullWidth
            size="md"
            haptic="medium"
            loading={isProcessing}
          >
            Continuar
          </Button>
        </View>
      }
    >
      <View style={styles.summaryRow}>
        <Text style={styles.counterLabel}>{selected.length} elemento{selected.length !== 1 ? 's' : ''} seleccionado{selected.length !== 1 ? 's' : ''}</Text>
        <Text style={styles.previewText}>Con este equipo podemos armar rutinas efectivas y variadas</Text>
      </View>

      <View style={styles.optionsContainer}>
        {options.map((option) => {
          const isSelected = selected.includes(option.id);

          return (
            <View key={option.id} style={styles.optionWrapper}>
              <OnboardingOptionCard
                id={option.id}
                label={option.label}
                subtitle={option.helper}
                icon={option.emoji}
                isSelected={isSelected}
                onPress={() => toggleItem(option.id)}
                accentColor={Colors.action}
              />
            </View>
          );
        })}
      </View>
    </OnboardingShell>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: Spacing[3],
    paddingTop: 0,
    paddingBottom: Spacing[2],
  },
  summaryRow: {
    gap: Spacing[1],
    paddingHorizontal: Spacing[2],
    paddingVertical: Spacing[2],
    backgroundColor: 'rgba(255, 152, 0, 0.08)',
    borderRadius: 12,
    borderLeftWidth: 3,
    borderLeftColor: Colors.action,
  },
  counterLabel: {
    fontFamily: FontFamily.semibold,
    fontSize: 12,
    color: Colors.textPrimary,
  },
  previewText: {
    fontFamily: FontFamily.regular,
    fontSize: 11,
    lineHeight: 15,
    color: Colors.textSecondary,
  },
  optionsContainer: {
    gap: Spacing[2],
  },
  optionWrapper: {
    minHeight: 96,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[2],
    backgroundColor: withOpacity(Colors.error, 0.1),
    borderLeftColor: Colors.error,
    borderLeftWidth: 4,
    paddingHorizontal: Spacing[2],
    paddingVertical: Spacing[2],
    borderRadius: Radius.sm,
    marginBottom: Spacing[2],
  },
  errorIcon: {
    fontSize: 18,
  },
  errorText: {
    flex: 1,
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    lineHeight: 18,
    color: Colors.error,
  },
});
