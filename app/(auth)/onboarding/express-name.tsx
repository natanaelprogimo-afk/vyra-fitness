import { useEffect, useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import OnboardingShell from '@/components/onboarding/OnboardingShell';
import Button from '@/components/ui/Button';
import { Colors, withOpacity } from '@/constants/colors';
import { Routes } from '@/constants/routes';
import { FontFamily, FontSize, Radius, Spacing } from '@/constants/theme';
import { getFirstIncompleteOnboardingRoute } from '@/lib/onboarding-v2';
import {
  loadOnboardingProgress,
  saveOnboardingProgress,
  type OnboardingDraft,
} from '@/lib/onboarding-storage';

export default function ExpressNameScreen() {
  const [draft, setDraft] = useState<OnboardingDraft | null>(null);
  const [name, setName] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    void (async () => {
      const progress = await loadOnboardingProgress();
      if (!active) return;

      // ARREGLO: Validar que vienen del express-ready
      // (nombre es el último paso antes de completar el onboarding)
      if (!progress.data?.gender || !progress.data?.goal) {
        console.warn('[Express Name] Missing gender or goal, redirecting to express-goal');
        router.replace(Routes.auth.onboarding.expressGoal as never);
        return;
      }

      setDraft(progress.data ?? null);
      setName(typeof progress.data?.name === 'string' ? progress.data.name : '');
    })();

    return () => {
      active = false;
    };
  }, []);

  const handleContinue = async () => {
    if (isProcessing) return;

    // Validate name
    const trimmedName = name.trim();
    if (!trimmedName || trimmedName.length < 2) {
      setSaveError('Por favor, ingresa un nombre de al menos 2 caracteres.');
      return;
    }

    if (trimmedName.length > 50) {
      setSaveError('El nombre no puede tener más de 50 caracteres.');
      return;
    }

    setIsProcessing(true);
    setSaveError(null);

    try {
      await saveOnboardingProgress(Routes.auth.onboarding.ready, {
        ...(draft ?? {}),
        name: trimmedName,
      });

      router.push(Routes.auth.onboarding.ready as never);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      console.error('[Express Name] Failed to continue:', err);
      setSaveError('No pudimos guardar tu nombre. Verifica tu conexión e intenta de nuevo.');
      setIsProcessing(false);
    }
  };

  const trimmedName = name.trim();
  const isValid = trimmedName.length >= 2 && trimmedName.length <= 50;

  return (
    <OnboardingShell
      pathname={Routes.auth.onboarding.expressName}
      eyebrow="Exprés • Paso 4 de 4"
      title="¿Cómo te llamas?"
      subtitle="Personalizaremos tu experiencia con tu nombre."
      scrollable
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
            disabled={!isValid || isProcessing}
            fullWidth
            size="md"
            haptic="medium"
            loading={isProcessing}
          >
            Completar
          </Button>
        </View>
      }
    >
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Nombre</Text>
        <TextInput
          style={styles.input}
          placeholder="Tu nombre"
          placeholderTextColor={withOpacity(Colors.textSecondary, 0.5)}
          value={name}
          onChangeText={setName}
          maxLength={50}
          editable={!isProcessing}
          accessibilityLabel="Ingresa tu nombre"
        />
        <Text style={styles.characterCount}>
          {trimmedName.length} / 50
        </Text>
      </View>

      <Text style={styles.trustNote}>
        💡 Usamos tu nombre para personalizaciones en la app.
      </Text>
    </OnboardingShell>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: Spacing[3],
    paddingTop: 0,
    paddingBottom: Spacing[2],
  },
  inputContainer: {
    gap: Spacing[1.5],
  },
  label: {
    fontFamily: FontFamily.semibold,
    fontSize: 12,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  input: {
    minHeight: 52,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: withOpacity(Colors.white, 0.08),
    backgroundColor: withOpacity(Colors.surface2, 0.92),
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[2.5],
    fontFamily: FontFamily.regular,
    fontSize: 16,
    color: Colors.textPrimary,
  },
  characterCount: {
    fontFamily: FontFamily.regular,
    fontSize: 11,
    color: Colors.textSecondary,
    textAlign: 'right',
  },
  trustNote: {
    fontFamily: FontFamily.regular,
    fontSize: 11,
    lineHeight: 15,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: Spacing[2],
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
