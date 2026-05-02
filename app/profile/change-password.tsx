import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import SafeScreen from '@/components/ui/SafeScreen';
import Header from '@/components/layout/Header';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import NoticeCard from '@/components/ui/NoticeCard';
import ScreenFooterSpacer from '@/components/ui/ScreenFooterSpacer';
import SectionHeader from '@/components/ui/SectionHeader';
import { Colors } from '@/constants/colors';
import { Spacing } from '@/constants/theme';
import { supabase } from '@/lib/supabase';
import { useUIStore } from '@/stores/uiStore';

export default function ChangePasswordScreen() {
  const showToast = useUIStore((state) => state.showToast);
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [saving, setSaving] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const validationError = useMemo(() => {
    if (!newPass && !confirmPass) return null;
    if (newPass.length < 8) return 'Usa al menos 8 caracteres para que la clave no quede fragil.';
    if (confirmPass.length > 0 && newPass !== confirmPass) return 'Las contrasenas no coinciden todavia.';
    return null;
  }, [confirmPass, newPass]);

  async function handleChange() {
    if (validationError) {
      setSubmitError(validationError);
      return;
    }

    setSaving(true);
    setSubmitError(null);
    setSaved(false);

    try {
      const { error } = await supabase.auth.updateUser({ password: newPass });
      if (error) throw error;
      setSaved(true);
      showToast('Contrasena actualizada.', 'success');
    } catch {
      setSubmitError('No pudimos cambiar la contrasena ahora mismo. Intenta de nuevo en unos segundos.');
      showToast('No se pudo actualizar la contrasena.', 'error');
    } finally {
      setSaving(false);
    }
  }

  return (
    <SafeScreen padHorizontal={false} padBottom>
      <Header title="Cambiar contrasena" showBack color={Colors.brand} />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {saved ? (
          <NoticeCard
            title="Contrasena actualizada"
            body="Tu acceso sigue listo en esta cuenta. Puedes volver cuando quieras."
            tone="success"
            actionLabel="Volver al perfil"
            onAction={() => router.back()}
          />
        ) : null}

        {submitError ? (
          <NoticeCard title="Revisemos este paso" body={submitError} tone="error" />
        ) : null}

        <Card style={styles.card}>
          <SectionHeader
            eyebrow="Seguridad"
            title="Actualiza tu acceso sin salir del flujo"
            subtitle="Validacion visible, feedback inline y el mismo sistema de inputs que el resto de la app."
          />

          <Input
            label="Nueva contrasena"
            value={newPass}
            onChangeText={setNewPass}
            secureTextEntry
            placeholder="Minimo 8 caracteres"
            autoCapitalize="none"
            secureToggleAccessibilityLabel="Mostrar nueva contrasena"
            error={submitError && newPass.length < 8 ? validationError : null}
          />

          <Input
            label="Confirmar contrasena"
            value={confirmPass}
            onChangeText={setConfirmPass}
            secureTextEntry
            placeholder="Repite la contrasena"
            autoCapitalize="none"
            secureToggleAccessibilityLabel="Mostrar confirmacion de contrasena"
            error={submitError && newPass !== confirmPass ? validationError : null}
          />

          <Button
            onPress={() => void handleChange()}
            label={saving ? 'Guardando...' : 'Actualizar contrasena'}
            loading={saving}
            color={Colors.brand}
            fullWidth
            disabled={Boolean(validationError) && confirmPass.length > 0}
          />
        </Card>

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
});
