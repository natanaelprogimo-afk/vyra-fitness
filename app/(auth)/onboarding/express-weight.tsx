import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import OnboardingShell from '@/components/onboarding/OnboardingShell';
import Button from '@/components/ui/Button';
import { Colors, withOpacity } from '@/constants/colors';
import { Routes } from '@/constants/routes';
import { FontFamily, FontSize, Radius, Spacing } from '@/constants/theme';
import {
  loadOnboardingProgress,
  saveOnboardingProgress,
  type OnboardingDraft,
} from '@/lib/onboarding-storage';

export default function ExpressWeightScreen() {
  const [draft, setDraft] = useState<OnboardingDraft | null>(null);
  const [age, setAge] = useState(25);
  const [heightCm, setHeightCm] = useState(170);
  const [weightKg, setWeightKg] = useState(70);
  const [weightUnit, setWeightUnit] = useState<'kg' | 'lbs'>('kg');

  useEffect(() => {
    let active = true;

    void (async () => {
      const progress = await loadOnboardingProgress();
      if (!active) return;

      setDraft(progress.data ?? null);
      setAge(
        typeof progress.data?.age === 'number' && progress.data.age >= 13
          ? progress.data.age
          : 25,
      );
      setHeightCm(
        typeof progress.data?.height_cm === 'number' && progress.data.height_cm >= 120
          ? progress.data.height_cm
          : 170,
      );
      setWeightKg(
        typeof progress.data?.weight_start_kg === 'number' && progress.data.weight_start_kg >= 35
          ? Math.round(progress.data.weight_start_kg)
          : 70,
      );
    })();

    return () => {
      active = false;
    };
  }, []);

  const handleContinue = async () => {
    await saveOnboardingProgress(Routes.auth.onboarding.expressReady, {
      ...(draft ?? {}),
      age,
      height_cm: heightCm,
      weight_start_kg: weightKg,
      weight_current_kg: weightKg,
    });

    router.push(Routes.auth.onboarding.expressReady as never);
  };

  const displayWeight = weightUnit === 'lbs' ? Math.round(weightKg * 2.20462) : weightKg;

  const toggleWeightUnit = () => {
    setWeightUnit(weightUnit === 'kg' ? 'lbs' : 'kg');
  };

  return (
    <OnboardingShell
      pathname={Routes.auth.onboarding.expressWeight}
      eyebrow="Exprés • Paso 2 de 3"
      title="Tu base física"
      subtitle="Necesitamos estos datos para personalizar tu experiencia."
      scrollable
      contentStyle={styles.content}
      footer={
        <Button onPress={handleContinue} fullWidth size="md" haptic="medium">
          Siguiente
        </Button>
      }
    >
      <View style={styles.steppersContainer}>
        <NumberStepper 
          label="Edad" 
          value={age} 
          unit="años"
          min={13}
          max={120}
          onChange={setAge}
        />
        <NumberStepper 
          label="Altura" 
          value={heightCm} 
          unit="cm"
          min={120}
          max={250}
          onChange={setHeightCm}
        />
        <View style={styles.weightStepperWrapper}>
          <NumberStepper 
            label="Peso actual" 
            value={displayWeight} 
            unit={weightUnit === 'kg' ? 'kg' : 'lbs'}
            min={weightUnit === 'kg' ? 35 : 77}
            max={weightUnit === 'kg' ? 260 : 573}
            onChange={(newVal) => {
              if (weightUnit === 'kg') {
                setWeightKg(newVal);
              } else {
                setWeightKg(Math.round(newVal / 2.20462));
              }
            }}
          />
          <Pressable style={styles.unitToggle} onPress={toggleWeightUnit} hitSlop={8}>
            <Text style={styles.unitToggleText}>{weightUnit === 'kg' ? 'kg' : 'lbs'}</Text>
          </Pressable>
        </View>
      </View>

      <Text style={styles.trustNote}>
        💡 Solo usamos esto para calcular tus calorías y macros personalizados.
      </Text>
    </OnboardingShell>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: Spacing[2],
    paddingTop: 0,
    paddingBottom: Spacing[2],
  },
  steppersContainer: {
    gap: Spacing[2],
  },
  weightStepperWrapper: {
    flexDirection: 'row',
    gap: Spacing[1.5],
    alignItems: 'flex-start',
  },
  unitToggle: {
    minWidth: 52,
    minHeight: 32,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: withOpacity(Colors.action, 0.24),
    backgroundColor: withOpacity(Colors.action, 0.08),
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing[3],
  },
  unitToggleText: {
    fontFamily: FontFamily.semibold,
    fontSize: 11,
    color: Colors.action,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  trustNote: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    lineHeight: 15,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  stepperCard: {
    minHeight: 92,
    borderRadius: Radius['2xl'],
    borderWidth: 1,
    borderColor: withOpacity(Colors.white, 0.08),
    backgroundColor: withOpacity(Colors.surface2, 0.92),
    padding: Spacing[3],
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing[3],
  },
  stepperCopy: {
    flex: 1,
    gap: 4,
  },
  stepperLabel: {
    fontFamily: FontFamily.semibold,
    fontSize: 12,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  stepperValue: {
    fontFamily: FontFamily.display,
    fontSize: 28,
    lineHeight: 32,
    color: Colors.textPrimary,
    letterSpacing: -0.7,
  },
  stepperActions: {
    flexDirection: 'row',
    gap: Spacing[1.5],
  },
  stepperButton: {
    width: 44,
    height: 44,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: withOpacity(Colors.secondary, 0.12),
    borderWidth: 1,
    borderColor: withOpacity(Colors.secondary, 0.22),
  },
  stepperButtonText: {
    fontFamily: FontFamily.bold,
    fontSize: 24,
    lineHeight: 28,
    color: Colors.textPrimary,
  },
});

function NumberStepper({
  label,
  value,
  unit,
  min,
  max,
  onChange,
}: {
  label: string;
  value: number;
  unit: string;
  min: number;
  max: number;
  onChange: (value: number) => void;
}) {
  const changeBy = (delta: number) => {
    onChange(Math.max(min, Math.min(max, value + delta)));
  };

  return (
    <View style={styles.stepperCard}>
      <View style={styles.stepperCopy}>
        <Text style={styles.stepperLabel}>{label}</Text>
        <Text style={styles.stepperValue}>
          {value} {unit}
        </Text>
      </View>
      <View style={styles.stepperActions}>
        <Pressable
          onPress={() => changeBy(-1)}
          style={styles.stepperButton}
          accessibilityRole="button"
          accessibilityLabel={`Bajar ${label}`}
        >
          <Text style={styles.stepperButtonText}>-</Text>
        </Pressable>
        <Pressable
          onPress={() => changeBy(1)}
          style={styles.stepperButton}
          accessibilityRole="button"
          accessibilityLabel={`Subir ${label}`}
        >
          <Text style={styles.stepperButtonText}>+</Text>
        </Pressable>
      </View>
    </View>
  );
}
