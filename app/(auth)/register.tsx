// ============================================================
// VYRA FITNESS — Register Screen
// Con checkboxes GDPR, disclaimer médico, validación completa
// ============================================================

import { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { router } from 'expo-router';
import SafeScreen from '@/components/ui/SafeScreen';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import Header from '@/components/layout/Header';
import { useAuth } from '@/hooks/useAuth';
import { validateEmail, validatePassword, validateName, isMinor } from '@/utils/validators';
import { Colors } from '@/constants/colors';
import { FontSize, FontFamily, Spacing, Radius } from '@/constants/theme';
import { AuthStrings, Disclaimers } from '@/constants/strings';

export default function RegisterScreen() {
  const { register, isLoading } = useAuth();

  const [name,     setName]     = useState('');
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [errors,   setErrors]   = useState<Record<string, string>>({});

  // GDPR Checkboxes — TODOS obligatorios
  const [tosAccepted,    setTosAccepted]    = useState(false);
  const [healthConsent,  setHealthConsent]  = useState(false);
  const [medicalAccepted,setMedicalAccepted]= useState(false);

  // Modal de disclaimer médico
  const [showMedical, setShowMedical] = useState(false);

  const allConsentsGiven = tosAccepted && healthConsent && medicalAccepted;

  const validate = () => {
    const e: Record<string, string> = {};
    const nameErr     = validateName(name);
    const emailErr    = validateEmail(email);
    const passwordErr = validatePassword(password);
    if (nameErr)     e.name     = nameErr;
    if (emailErr)    e.email    = emailErr;
    if (passwordErr) e.password = passwordErr;
    if (!allConsentsGiven) e.consents = 'Debés aceptar todos los términos para continuar.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleRegister = () => {
    if (!validate()) return;
    // Mostrar disclaimer médico primero
    setShowMedical(true);
  };

  const handleMedicalAccept = async () => {
    setShowMedical(false);
    await register(email.trim().toLowerCase(), password, name.trim());
  };

  return (
    <SafeScreen scrollable padBottom>
      <Header title={AuthStrings.register.title} showBack />

      <View style={styles.form}>
        <Input
          label="Tu nombre"
          value={name}
          onChangeText={setName}
          autoCapitalize="words"
          autoComplete="name"
          error={errors.name}
          returnKeyType="next"
        />
        <Input
          label={AuthStrings.register.email}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          error={errors.email}
          returnKeyType="next"
        />
        <Input
          label={AuthStrings.register.password}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoComplete="new-password"
          error={errors.password}
          hint="Mínimo 8 caracteres"
          returnKeyType="done"
        />

        {/* Checkboxes GDPR */}
        <View style={styles.consents}>
          <CheckRow
            checked={tosAccepted}
            onToggle={() => setTosAccepted(!tosAccepted)}
          >
            <Text style={styles.consentText}>
              Acepto los{' '}
              <Text style={styles.link}>Términos de Servicio</Text>
              {' '}y la{' '}
              <Text style={styles.link}>Política de Privacidad</Text>
            </Text>
          </CheckRow>

          <CheckRow
            checked={healthConsent}
            onToggle={() => setHealthConsent(!healthConsent)}
          >
            <Text style={styles.consentText}>
              Consiento que Vyra procese mis datos de salud para personalizar mi experiencia
            </Text>
          </CheckRow>

          <CheckRow
            checked={medicalAccepted}
            onToggle={() => setMedicalAccepted(!medicalAccepted)}
          >
            <Text style={styles.consentText}>
              Entiendo que Vyra no es un dispositivo médico y no reemplaza el diagnóstico médico profesional
            </Text>
          </CheckRow>

          {errors.consents && (
            <Text style={styles.consentError}>{errors.consents}</Text>
          )}
        </View>

        <Button
          onPress={handleRegister}
          variant="primary"
          fullWidth
          size="lg"
          loading={isLoading}
          style={styles.cta}
        >
          {AuthStrings.register.cta}
        </Button>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>{AuthStrings.register.haveAccount} </Text>
        <Pressable onPress={() => router.replace('/(auth)/login' as any)}>
          <Text style={styles.footerLink}>{AuthStrings.register.login}</Text>
        </Pressable>
      </View>

      {/* Modal disclaimer médico obligatorio */}
      <Modal
        visible={showMedical}
        onClose={() => setShowMedical(false)}
        title={AuthStrings.medicalModal.title}
        showClose={false}
        ctaLabel={AuthStrings.medicalModal.cta}
        onCta={handleMedicalAccept}
      >
        <View style={styles.medicalIcon}>
          <Text style={styles.medicalIconText}>🏥</Text>
        </View>
        <Text style={styles.medicalText}>{AuthStrings.medicalModal.body}</Text>
      </Modal>
    </SafeScreen>
  );
}

function CheckRow({
  checked, onToggle, children,
}: { checked: boolean; onToggle: () => void; children: React.ReactNode }) {
  return (
    <Pressable onPress={onToggle} style={styles.checkRow}>
      <View style={[styles.checkbox, checked && styles.checkboxChecked]}>
        {checked && <Text style={styles.checkmark}>✓</Text>}
      </View>
      <View style={styles.checkContent}>{children}</View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  form:          { flex: 1, paddingTop: Spacing[6] },
  consents:      { marginTop: Spacing[4], gap: Spacing[3] },
  checkRow:      { flexDirection: 'row', gap: Spacing[3], alignItems: 'flex-start' },
  checkbox: {
    width:        22,
    height:       22,
    borderRadius: 6,
    borderWidth:  1.5,
    borderColor:  Colors.border,
    backgroundColor: Colors.bgElevated,
    alignItems:   'center',
    justifyContent: 'center',
    marginTop:    2,
    flexShrink:   0,
  },
  checkboxChecked: { backgroundColor: Colors.brand, borderColor: Colors.brand },
  checkmark:     { color: Colors.white, fontSize: 13, fontFamily: FontFamily.bold },
  checkContent:  { flex: 1 },
  consentText:   { fontFamily: FontFamily.regular, fontSize: FontSize.sm, color: Colors.textSecondary, lineHeight: FontSize.sm * 1.5 },
  link:          { color: Colors.brand, fontFamily: FontFamily.medium },
  consentError:  { fontFamily: FontFamily.regular, fontSize: FontSize.xs, color: Colors.error, marginTop: Spacing[1] },
  cta:           { marginTop: Spacing[6] },
  footer:        { flexDirection: 'row', justifyContent: 'center', paddingVertical: Spacing[6] },
  footerText:    { fontFamily: FontFamily.regular, fontSize: FontSize.sm, color: Colors.textSecondary },
  footerLink:    { fontFamily: FontFamily.semibold, fontSize: FontSize.sm, color: Colors.brand },
  medicalIcon:   { alignItems: 'center', paddingVertical: Spacing[4] },
  medicalIconText:{ fontSize: 48 },
  medicalText:   { fontFamily: FontFamily.regular, fontSize: FontSize.base, color: Colors.textSecondary, lineHeight: FontSize.base * 1.6 },
});