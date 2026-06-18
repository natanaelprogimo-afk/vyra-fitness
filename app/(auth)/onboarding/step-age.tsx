import { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { router } from 'expo-router';
import OnboardingShell from '@/components/onboarding/OnboardingShell';
import Button from '@/components/ui/Button';
import { Colors, withOpacity } from '@/constants/colors';
import { Routes } from '@/constants/routes';
import { FontFamily, Radius, Spacing } from '@/constants/theme';
import { GENDER_OPTIONS, normalizeOnboardingGender } from '@/lib/onboarding-profile';
import { getAccessibleOnboardingRoute } from '@/lib/onboarding-v2';
import type { OnboardingBinaryGender } from '@/lib/onboarding-v2';
import {
  loadOnboardingProgress,
  saveOnboardingProgress,
  type OnboardingDraft,
} from '@/lib/onboarding-storage';

function MacroPreview({
  opacity,
  protein,
  fat,
  carbs,
  tdee,
}: {
  opacity: ReturnType<typeof useSharedValue<number>>;
  protein: number;
  fat: number;
  carbs: number;
  tdee: number;
}) {
  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[styles.macroPreview, animatedStyle]}>
      <Text style={styles.macroPreviewTitle}>Estimación de macros</Text>
      <View style={styles.macroRow}>
        <View style={styles.macroItem}>
          <Text style={styles.macroLabel}>Proteína</Text>
          <Text style={styles.macroValue}>{protein}g</Text>
        </View>
        <View style={styles.macroItem}>
          <Text style={styles.macroLabel}>Grasas</Text>
          <Text style={styles.macroValue}>{fat}g</Text>
        </View>
        <View style={styles.macroItem}>
          <Text style={styles.macroLabel}>Carbs</Text>
          <Text style={styles.macroValue}>{carbs}g</Text>
        </View>
      </View>
      <Text style={styles.macroTDEE}>TDEE: ~{tdee.toLocaleString('es-AR')} kcal</Text>
    </Animated.View>
  );
}

export default function StepAgeScreen() {
  const [draft, setDraft] = useState<OnboardingDraft | null>(null);
  const [gender, setGender] = useState<OnboardingBinaryGender | null>(null);
  const [femaleHealthEnabled, setFemaleHealthEnabled] = useState<boolean | null>(null);
  const [age, setAge] = useState(25);
  const [heightCm, setHeightCm] = useState(170);
  const [weightKg, setWeightKg] = useState(70);
  const [weightUnit, setWeightUnit] = useState<'kg' | 'lbs'>('kg');
  const [heightUnit, setHeightUnit] = useState<'cm' | 'ft'>('cm');
  const [isProcessing, setIsProcessing] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const macroPreviewOpacity = useSharedValue(0);
  const processingRef = useRef(false);

  useEffect(() => {
    let active = true;

    void (async () => {
      const progress = await loadOnboardingProgress();
      if (!active) return;

      const nextRoute = getAccessibleOnboardingRoute(
        Routes.auth.onboarding.age,
        progress.data ?? null,
      );
      if (nextRoute !== Routes.auth.onboarding.age) {
        router.replace(nextRoute as never);
        return;
      }

      setDraft(progress.data ?? null);
      setGender(normalizeOnboardingGender(progress.data?.gender));
      setFemaleHealthEnabled(
        typeof progress.data?.female_health_enabled === 'boolean'
          ? progress.data.female_health_enabled
          : null,
      );
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

  // Macro preview animation on weight change
  useEffect(() => {
    macroPreviewOpacity.value = 0;
    macroPreviewOpacity.value = withTiming(1, { duration: 300, easing: Easing.out(Easing.ease) });
    
    const hideTimer = setTimeout(() => {
      macroPreviewOpacity.value = withTiming(0, { duration: 500, easing: Easing.out(Easing.ease) });
    }, 3000);

    return () => clearTimeout(hideTimer);
  }, [weightKg]);

  const handleContinue = async () => {
    if (!gender || processingRef.current) return;

    processingRef.current = true;
    setIsProcessing(true);
    setSaveError(null);

    try {
      // Note: height_cm and weight are collected in dedicated step-height.tsx and step-weight.tsx
      // Don't collect them here to avoid duplication
      await saveOnboardingProgress(Routes.auth.onboarding.height, {
        ...(draft ?? {}),
        gender,
        age,
        female_health_enabled: gender === 'female' ? femaleHealthEnabled ?? false : false,
      });

      // Success: navigate
      processingRef.current = false;
      router.push(Routes.auth.onboarding.height as never);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      console.error('[Step Age] Failed to continue:', err);
      setSaveError('No pudimos guardar tu selección. Verifica tu conexión e intenta de nuevo.');
      setIsProcessing(false);
      processingRef.current = false;
    }
  };

  const canContinue = gender !== 'female' || femaleHealthEnabled !== null;

  const displayWeight = weightUnit === 'lbs' ? Math.round(weightKg * 2.20462) : weightKg;
  const displayHeight = heightUnit === 'ft' ? Math.round(heightCm / 30.48 * 12) / 12 : heightCm;
  const heightFtIn = heightUnit === 'ft' ? `${Math.floor(heightCm / 30.48)}'${Math.round((heightCm % 30.48) / 2.54)}"` : undefined;

  const toggleWeightUnit = () => {
    setWeightUnit(weightUnit === 'kg' ? 'lbs' : 'kg');
  };

  const toggleHeightUnit = () => {
    setHeightUnit(heightUnit === 'cm' ? 'ft' : 'cm');
  };

  // Calculate estimated macros (rough estimate)
  const estimatedTDEE = Math.round(
    (gender === 'male' 
      ? 10 * weightKg + 6.25 * heightCm - 5 * age + 5
      : 10 * weightKg + 6.25 * heightCm - 5 * age - 161) * 1.55 // moderate activity
  );
  const protein = Math.round(weightKg * 1.8); // 1.8g per kg
  const fat = Math.round(estimatedTDEE * 0.25 / 9); // 25% of calories
  const carbs = Math.round((estimatedTDEE - protein * 4 - fat * 9) / 4);

  return (
    <OnboardingShell
      pathname={Routes.auth.onboarding.age}
      eyebrow="Base física"
      title="Tu información física"
      subtitle="Sexo biológico, edad, altura y peso. (Todo ajustable después)"
      scrollable
      contentStyle={styles.content}
      footer={
        <View style={styles.footerStack}>
          {saveError && (
            <View style={styles.errorBanner}>
              <Text style={styles.errorIcon}>⚠️</Text>
              <Text style={styles.errorText}>{saveError}</Text>
            </View>
          )}
          <Text style={styles.trustNote}>
            💡 Solo usamos esto para calcular tus calorías y metas personalizadas.
          </Text>
          <Button onPress={handleContinue} disabled={!gender || !canContinue || isProcessing} fullWidth size="md" haptic="medium" loading={isProcessing}>
            Continuar
          </Button>
        </View>
      }
    >
      <View style={styles.unitToggles}>
        <Pressable style={styles.unitToggle} onPress={toggleWeightUnit} hitSlop={8}>
          <Text style={styles.unitToggleText}>{weightUnit === 'kg' ? 'kg' : 'lbs'}</Text>
        </Pressable>
        <Pressable style={styles.unitToggle} onPress={toggleHeightUnit} hitSlop={8}>
          <Text style={styles.unitToggleText}>{heightUnit === 'cm' ? 'cm' : 'ft'}</Text>
        </Pressable>
      </View>

      <View style={styles.genderBlock}>
        <Text style={styles.sectionLabel}>Sexo biologico</Text>
        <View style={styles.genderRow} accessibilityRole="radiogroup" accessibilityLabel="Sexo biologico">
          {GENDER_OPTIONS.map((option) => {
            const selected = gender === option.id;
            return (
              <Pressable
                key={option.id}
                onPress={() => setGender(option.id)}
                style={[styles.genderCard, selected ? styles.genderCardActive : null]}
                accessibilityRole="radio"
                accessibilityLabel={option.label}
                accessibilityHint={option.helper}
                accessibilityState={{ selected }}
              >
                <View style={[styles.genderDot, selected ? styles.genderDotActive : null]} />
                <Text style={styles.genderTitle}>{option.label}</Text>
                <Text style={styles.genderHelper}>{option.helper}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View style={styles.stack}>
        <NumberStepper label="Edad" value={age} unit="años" min={13} max={90} onChange={setAge} />
        <NumberStepper 
          label="Altura" 
          value={displayHeight} 
          unit={heightUnit === 'cm' ? 'cm' : 'ft'}
          min={heightUnit === 'cm' ? 120 : 4} 
          max={heightUnit === 'cm' ? 230 : 8} 
          onChange={(newVal) => {
            if (heightUnit === 'cm') {
              setHeightCm(newVal);
            } else {
              // Convert feet to cm: 5.9 ft ≈ 180cm
              setHeightCm(Math.round(newVal * 30.48));
            }
          }} 
        />
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
              // Convert lbs to kg
              setWeightKg(Math.round(newVal / 2.20462));
            }
          }} 
        />
      </View>

      <MacroPreview opacity={macroPreviewOpacity} protein={protein} fat={fat} carbs={carbs} tdee={estimatedTDEE} />

      {gender === 'female' ? (
        <View style={styles.femaleOffer}>
          <Text style={styles.sectionLabel}>Seguimiento femenino</Text>
          <Text style={styles.femaleTitle}>Quieres activar el seguimiento de ciclo menstrual?</Text>
          <Text style={styles.femaleBody}>
            VYRA registra sintomas, estado de animo y fases del ciclo para personalizar tus semanas de entreno y nutricion.
          </Text>

          <View style={styles.femaleChoices} accessibilityRole="radiogroup" accessibilityLabel="Seguimiento femenino">
            <Pressable
              onPress={() => setFemaleHealthEnabled(true)}
              style={[
                styles.femaleChoice,
                femaleHealthEnabled === true && styles.femaleChoiceActive,
              ]}
              accessibilityRole="radio"
              accessibilityLabel="Si, activarlo"
              accessibilityState={{ selected: femaleHealthEnabled === true }}
            >
              <Text style={styles.femaleChoiceTitle}>Si, activarlo</Text>
            </Pressable>
            <Pressable
              onPress={() => setFemaleHealthEnabled(false)}
              style={[
                styles.femaleChoice,
                femaleHealthEnabled === false && styles.femaleChoiceInactive,
              ]}
              accessibilityRole="radio"
              accessibilityLabel="Ahora no"
              accessibilityState={{ selected: femaleHealthEnabled === false }}
            >
              <Text style={styles.femaleChoiceTitle}>Ahora no</Text>
            </Pressable>
          </View>
        </View>
      ) : null}
    </OnboardingShell>
  );
}

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
  const [pressing, setPressing] = useState<'up' | 'down' | null>(null);
  const [pressInterval, setPressInterval] = useState<NodeJS.Timeout | null>(null);

  const changeBy = (delta: number) => {
    onChange(Math.max(min, Math.min(max, value + delta)));
  };

  const handlePressIn = (direction: 'up' | 'down') => {
    setPressing(direction);
    changeBy(direction === 'up' ? 1 : -1);
    
    // Start accelerating after 500ms
    const timer = setTimeout(() => {
      let increment = 1;
      let counter = 0;
      const interval = setInterval(() => {
        counter++;
        // Accelerate: 1x for first 5 presses, then 5x
        if (counter > 5) increment = 5;
        changeBy(direction === 'up' ? increment : -increment);
      }, 150);
      setPressInterval(interval);
    }, 500);
    return () => clearTimeout(timer);
  };

  const handlePressOut = () => {
    setPressing(null);
    if (pressInterval) {
      clearInterval(pressInterval);
      setPressInterval(null);
    }
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
          onPressIn={() => handlePressIn('down')}
          onPressOut={handlePressOut}
          style={[styles.stepperButton, pressing === 'down' && styles.stepperButtonActive]}
          accessibilityRole="button"
          accessibilityLabel={`Bajar ${label}`}
        >
          <Text style={styles.stepperButtonText}>−</Text>
        </Pressable>
        <Pressable
          onPressIn={() => handlePressIn('up')}
          onPressOut={handlePressOut}
          style={[styles.stepperButton, pressing === 'up' && styles.stepperButtonActive]}
          accessibilityRole="button"
          accessibilityLabel={`Subir ${label}`}
        >
          <Text style={styles.stepperButtonText}>+</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: Spacing[3],
    paddingTop: 0,
    paddingBottom: Spacing[2],
  },
  genderBlock: {
    gap: Spacing[1.5],
  },
  sectionLabel: {
    fontFamily: FontFamily.semibold,
    fontSize: 12,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  genderRow: {
    flexDirection: 'row',
    gap: Spacing[1.5],
  },
  genderCard: {
    flex: 1,
    minHeight: 90,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: withOpacity(Colors.white, 0.08),
    backgroundColor: withOpacity(Colors.surface2, 0.92),
    paddingHorizontal: Spacing[2.5],
    paddingVertical: Spacing[2],
    gap: Spacing[1],
    alignItems: 'center',
    justifyContent: 'center',
  },
  genderCardActive: {
    borderColor: withOpacity(Colors.secondary, 0.34),
    backgroundColor: withOpacity(Colors.secondary, 0.1),
  },
  genderDot: {
    width: 12,
    height: 12,
    borderRadius: Radius.full,
    borderWidth: 1.5,
    borderColor: withOpacity(Colors.white, 0.18),
  },
  genderDotActive: {
    backgroundColor: Colors.secondary,
    borderColor: Colors.secondary,
  },
  genderTitle: {
    fontFamily: FontFamily.semibold,
    fontSize: 14,
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  genderHelper: {
    fontFamily: FontFamily.regular,
    fontSize: 10,
    lineHeight: 13,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  stack: {
    gap: Spacing[2.5],
  },
  femaleOffer: {
    gap: Spacing[1.5],
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: withOpacity(Colors.female, 0.24),
    backgroundColor: withOpacity(Colors.female, 0.08),
    padding: Spacing[2],
    marginTop: Spacing[2],
  },
  femaleTitle: {
    fontFamily: FontFamily.bold,
    fontSize: 14,
    color: Colors.textPrimary,
  },
  femaleBody: {
    fontFamily: FontFamily.regular,
    fontSize: 11,
    lineHeight: 16,
    color: Colors.textSecondary,
  },
  femaleChoices: {
    flexDirection: 'row',
    gap: Spacing[1.5],
  },
  femaleChoice: {
    flex: 1,
    minHeight: 46,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: withOpacity(Colors.white, 0.08),
    backgroundColor: withOpacity(Colors.white, 0.03),
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing[2],
  },
  femaleChoiceActive: {
    borderColor: withOpacity(Colors.female, 0.36),
    backgroundColor: withOpacity(Colors.female, 0.12),
  },
  femaleChoiceInactive: {
    borderColor: withOpacity(Colors.white, 0.18),
    backgroundColor: withOpacity(Colors.white, 0.06),
  },
  femaleChoiceTitle: {
    fontFamily: FontFamily.semibold,
    fontSize: 12,
    color: Colors.textPrimary,
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
  footerStack: {
    gap: Spacing[2],
  },
  trustNote: {
    fontFamily: FontFamily.regular,
    fontSize: 11,
    lineHeight: 15,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  unitToggles: {
    flexDirection: 'row',
    gap: Spacing[1.5],
    justifyContent: 'flex-end',
    marginBottom: Spacing[2],
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
  },
  unitToggleText: {
    fontFamily: FontFamily.semibold,
    fontSize: 11,
    color: Colors.action,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
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
  stepperButtonActive: {
    backgroundColor: withOpacity(Colors.secondary, 0.24),
    borderColor: withOpacity(Colors.secondary, 0.36),
  },
  stepperButtonText: {
    fontFamily: FontFamily.bold,
    fontSize: 24,
    lineHeight: 28,
    color: Colors.textPrimary,
  },
  macroPreview: {
    borderRadius: Radius.lg,
    backgroundColor: withOpacity(Colors.nutrition, 0.08),
    borderLeftWidth: 3,
    borderLeftColor: Colors.nutrition,
    paddingHorizontal: Spacing[2.5],
    paddingVertical: Spacing[2],
    marginTop: Spacing[2],
  },
  macroPreviewTitle: {
    fontFamily: FontFamily.semibold,
    fontSize: 12,
    color: Colors.textPrimary,
    marginBottom: Spacing[1.5],
  },
  macroRow: {
    flexDirection: 'row',
    gap: Spacing[1.5],
    marginBottom: Spacing[1.5],
  },
  macroItem: {
    flex: 1,
    alignItems: 'center',
  },
  macroLabel: {
    fontFamily: FontFamily.regular,
    fontSize: 10,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  macroValue: {
    fontFamily: FontFamily.bold,
    fontSize: 14,
    color: Colors.nutrition,
    letterSpacing: -0.3,
  },
  macroTDEE: {
    fontFamily: FontFamily.regular,
    fontSize: 11,
    color: Colors.textSecondary,
    textAlign: 'center',
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
    fontSize: 12,
    lineHeight: 18,
    color: Colors.error,
  },
});
