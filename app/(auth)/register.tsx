import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import SafeScreen from '@/components/ui/SafeScreen';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import { useAuth } from '@/hooks/useAuth';
import { validateEmail, validateName, validatePassword } from '@/utils/validators';
import { Colors, withOpacity } from '@/constants/colors';
import { FontFamily, FontSize, Radius, Spacing } from '@/constants/theme';
import { Routes } from '@/constants/routes';

type RegisterStep = 'form' | 'consents';

export default function RegisterScreen() {
  const { register, isLoading } = useAuth();
  const [step, setStep] = useState<RegisterStep>('form');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [tosAccepted, setTosAccepted] = useState(false);
  const [healthConsent, setHealthConsent] = useState(false);
  const [medicalAccepted, setMedicalAccepted] = useState(false);
  const [showMedical, setShowMedical] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  const allConsentsGiven = tosAccepted && healthConsent && medicalAccepted;
  const sensitiveDataLabel = useMemo(
    () => (healthConsent ? 'Datos sensibles activados' : 'Datos sensibles desactivados'),
    [healthConsent],
  );

  const validateForm = () => {
    const nextErrors: Record<string, string> = {};
    const nameErr = validateName(name);
    const emailErr = validateEmail(email);
    const passwordErr = validatePassword(password);
    if (nameErr) nextErrors.name = nameErr;
    if (emailErr) nextErrors.email = emailErr;
    if (passwordErr) nextErrors.password = passwordErr;
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const validateConsents = () => {
    if (allConsentsGiven) return true;
    setErrors({ consents: 'Necesitas completar este paso para crear tu cuenta.' });
    return false;
  };

  const handleContinue = () => {
    setSubmitError(null);
    if (!validateForm()) return;
    setStep('consents');
  };

  const handleRegister = () => {
    setSubmitError(null);
    if (!validateConsents()) return;
    setShowMedical(true);
  };

  const handleMedicalAccept = async () => {
    setShowMedical(false);
    const result = await register(email.trim().toLowerCase(), password, name.trim());
    if (!result.ok) {
      setSubmitError(result.error ?? 'No pudimos crear tu cuenta.');
    }
  };

  return (
    <SafeScreen scrollable padBottom>
      <View style={styles.hero}>
        <Text style={styles.title}>{step === 'form' ? 'Crea tu cuenta' : 'Último paso'}</Text>
        <Text style={styles.subtitle}>
          {step === 'form'
            ? 'Empieza con lo mínimo. Lo legal y lo sensible vienen después, con más claridad.'
            : 'Este último paso es un acuerdo claro, no una barrera.'}
        </Text>
      </View>

      <Pressable onPress={() => router.push(Routes.auth.google as never)} style={styles.googleButton}>
        <Text style={styles.googleBadge}>G</Text>
        <Text style={styles.googleText}>Continuar con Google</Text>
      </Pressable>

      {step === 'form' ? (
        <View style={styles.step}>
          <Input
            label="Tu nombre"
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
            autoComplete="name"
            error={errors.name}
          />
          <Input
            label="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            error={errors.email}
          />
          <Input
            label="Contraseña"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoComplete="new-password"
            error={errors.password}
            hint="Mínimo 8 caracteres"
          />
          <Button onPress={handleContinue} fullWidth size="lg">
            Continuar
          </Button>
        </View>
      ) : (
        <View style={styles.step}>
          <View style={styles.legalLinksRow}>
            <Pressable onPress={() => router.push('/legal/terms' as never)} style={styles.legalPill}>
              <Text style={styles.legalPillText}>Términos</Text>
            </Pressable>
            <Pressable onPress={() => router.push('/legal/privacy' as never)} style={styles.legalPill}>
              <Text style={styles.legalPillText}>Privacidad</Text>
            </Pressable>
          </View>

          <CheckRow checked={tosAccepted} onToggle={() => setTosAccepted((value) => !value)}>
            Entiendo las reglas de uso y como se trata mi cuenta.
          </CheckRow>

          <Pressable style={styles.sensitiveCard} onPress={() => setHealthConsent((value) => !value)}>
            <View style={styles.sensitiveTop}>
            <Text style={styles.sensitiveTitle}>Privacidad de salud</Text>
              <View style={[styles.togglePill, healthConsent && styles.togglePillActive]}>
                <Text style={[styles.togglePillText, healthConsent && styles.togglePillTextActive]}>
                  {sensitiveDataLabel}
                </Text>
              </View>
            </View>
            <Text style={styles.sensitiveBody}>
              Tus datos de salud se usan para personalizar mejor la experiencia y se tratan con el máximo nivel de privacidad.
            </Text>
          </Pressable>

          <CheckRow checked={medicalAccepted} onToggle={() => setMedicalAccepted((value) => !value)}>
            Entiendo que VYRA no reemplaza a un médico.
          </CheckRow>

          {errors.consents ? <Text style={styles.consentError}>{errors.consents}</Text> : null}
          {submitError ? <Text style={styles.submitError}>{submitError}</Text> : null}

          <Button onPress={handleRegister} fullWidth size="lg" loading={isLoading}>
            Crear mi cuenta
          </Button>
          <Button onPress={() => setStep('form')} variant="ghost" fullWidth>
            Volver
          </Button>
        </View>
      )}

      <View style={styles.footer}>
        <Text style={styles.footerText}>¿Ya tienes cuenta? </Text>
        <Pressable onPress={() => router.replace('/(auth)/login' as never)}>
          <Text style={styles.footerLink}>Inicia sesión</Text>
        </Pressable>
      </View>

      <Modal
        visible={showMedical}
        onClose={() => setShowMedical(false)}
        title="Antes de seguir"
        showClose={false}
        ctaLabel="Crear mi cuenta"
        onCta={handleMedicalAccept}
      >
        <Text style={styles.modalBody}>
          VYRA no reemplaza diagnóstico médico profesional. Si tienes una condición o una duda de salud
          importante, consulta con un profesional antes de seguir.
        </Text>
      </Modal>
    </SafeScreen>
  );
}

function CheckRow({
  checked,
  onToggle,
  children,
}: {
  checked: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <Pressable onPress={onToggle} style={styles.checkRow}>
      <View style={[styles.checkbox, checked && styles.checkboxChecked]}>
        {checked ? <Text style={styles.checkmark}>✓</Text> : null}
      </View>
      <Text style={styles.checkText}>{children}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  hero: {
    gap: Spacing[2],
    marginTop: Spacing[3],
    marginBottom: Spacing[5],
  },
  title: {
    fontFamily: FontFamily.display,
    fontSize: 40,
    lineHeight: 40,
    color: Colors.textPrimary,
  },
  subtitle: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.base,
    lineHeight: 24,
    color: Colors.textSecondary,
  },
  googleButton: {
    height: 56,
    borderRadius: Radius.xl,
    backgroundColor: Colors.surface2,
    borderWidth: 1,
    borderColor: withOpacity(Colors.white, 0.08),
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: Spacing[3],
    marginBottom: Spacing[5],
  },
  googleBadge: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.base,
    color: '#4285F4',
    backgroundColor: Colors.white,
    width: 22,
    height: 22,
    lineHeight: 22,
    textAlign: 'center',
    borderRadius: 11,
  },
  googleText: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.sm,
    color: Colors.textPrimary,
  },
  step: {
    gap: Spacing[3],
  },
  legalLinksRow: {
    flexDirection: 'row',
    gap: Spacing[2],
  },
  legalPill: {
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: withOpacity(Colors.white, 0.08),
    backgroundColor: Colors.surface2,
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[2],
  },
  legalPillText: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
  },
  checkRow: {
    flexDirection: 'row',
    gap: Spacing[3],
    alignItems: 'flex-start',
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: withOpacity(Colors.white, 0.14),
    backgroundColor: Colors.surface2,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  checkboxChecked: {
    backgroundColor: Colors.brand,
    borderColor: Colors.brand,
  },
  checkmark: {
    fontFamily: FontFamily.bold,
    fontSize: 10,
    color: Colors.black,
  },
  checkText: {
    flex: 1,
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    lineHeight: 20,
    color: Colors.textSecondary,
  },
  sensitiveCard: {
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: withOpacity(Colors.white, 0.06),
    backgroundColor: Colors.surface2,
    padding: Spacing[5],
    gap: Spacing[2],
  },
  sensitiveTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: Spacing[2],
  },
  sensitiveTitle: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.sm,
    color: Colors.textPrimary,
  },
  togglePill: {
    borderRadius: Radius.full,
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[1.5],
    backgroundColor: withOpacity(Colors.white, 0.04),
    borderWidth: 1,
    borderColor: withOpacity(Colors.white, 0.08),
  },
  togglePillActive: {
    backgroundColor: withOpacity(Colors.brand, 0.12),
    borderColor: withOpacity(Colors.brand, 0.22),
  },
  togglePillText: {
    fontFamily: FontFamily.medium,
    fontSize: 11,
    color: Colors.textMuted,
  },
  togglePillTextActive: {
    color: Colors.brand,
  },
  sensitiveBody: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    lineHeight: 20,
    color: Colors.textSecondary,
  },
  consentError: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.xs,
    color: Colors.error,
  },
  submitError: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.xs,
    color: Colors.error,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: Spacing[6],
  },
  footerText: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  footerLink: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.sm,
    color: Colors.brand,
  },
  modalBody: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.base,
    lineHeight: 24,
    color: Colors.textSecondary,
  },
});
