import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';
import { router } from 'expo-router';
import SafeScreen from '@/components/ui/SafeScreen';
import Header from '@/components/layout/Header';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import ConfirmationSheet from '@/components/ui/ConfirmationSheet';
import Input from '@/components/ui/Input';
import SettingToggleRow from '@/components/ui/SettingToggleRow';
import BmiGauge from '@/components/progress/BmiGauge';
import { Colors } from '@/constants/colors';
import { Routes } from '@/constants/routes';
import { FontFamily, FontSize, Radius, Spacing } from '@/constants/theme';
import { supabase } from '@/lib/supabase';
import { isGuestAuthUser } from '@/lib/guest-auth';
import { useAuthStore } from '@/stores/authStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { useUIStore } from '@/stores/uiStore';
import { calculateBMI, getBMICategory, BMI_CATEGORY_LABELS } from '@/utils/calculations';

type AccountItem = {
  emoji: string;
  title: string;
  description: string;
  route: string;
  destructive?: boolean;
};

const ACCOUNT_ITEMS: AccountItem[] = [
  {
    emoji: '👤',
    title: 'Editar perfil',
    description: 'Nombre, objetivo y datos visibles de tu cuenta.',
    route: Routes.profile.edit,
  },
  {
    emoji: '🔒',
    title: 'Cambiar contrasena',
    description: 'Actualiza la credencial principal y refuerza el acceso.',
    route: Routes.profile.changePassword,
  },
  {
    emoji: '📦',
    title: 'Exportar datos',
    description: 'Descarga tu historial antes de cerrar cambios grandes.',
    route: Routes.profile.exportData,
  },
  {
    emoji: '🗑️',
    title: 'Eliminar cuenta',
    description: 'Acción irreversible. Queda agrupada dentro del hub de cuenta.',
    route: Routes.profile.deleteAccount,
    destructive: true,
  },
];

export default function SettingsAccountScreen() {
  const profile = useAuthStore((state) => state.profile);
  const user = useAuthStore((state) => state.user);
  const userEmail = useAuthStore((state) => state.user?.email ?? state.profile?.email ?? null);
  const signOut = useAuthStore((state) => state.signOut);
  const setProfile = useAuthStore((state) => state.setProfile);
  const biometricUnlockEnabled = useSettingsStore((state) => state.biometricUnlockEnabled);
  const setBiometricUnlockEnabled = useSettingsStore((state) => state.setBiometricUnlockEnabled);
  const showToast = useUIStore((state) => state.showToast);
  const [savingWeight, setSavingWeight] = useState(false);
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [signOutOpen, setSignOutOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [currentKg, setCurrentKg] = useState(
    String(profile?.weight_current_kg ?? profile?.weight_start_kg ?? ''),
  );
  const [goalKg, setGoalKg] = useState(String(profile?.weight_goal_kg ?? ''));
  const isAnonymous = isGuestAuthUser(user);

  useEffect(() => {
    let active = true;

    const checkBiometrics = async () => {
      try {
        const [hasHardware, isEnrolled] = await Promise.all([
          LocalAuthentication.hasHardwareAsync(),
          LocalAuthentication.isEnrolledAsync(),
        ]);

        if (!active) return;
        const available = hasHardware && isEnrolled;
        setBiometricAvailable(available);
        if (!available && biometricUnlockEnabled) {
          setBiometricUnlockEnabled(false);
        }
      } catch {
        if (!active) return;
        setBiometricAvailable(false);
      }
    };

    void checkBiometrics();
    return () => {
      active = false;
    };
  }, [biometricUnlockEnabled, setBiometricUnlockEnabled]);

  const bmi = useMemo(() => {
    if (!profile?.height_cm) return null;
    const parsed = Number.parseFloat(currentKg.replace(',', '.'));
    if (!Number.isFinite(parsed)) return null;
    return calculateBMI(parsed, profile.height_cm);
  }, [currentKg, profile?.height_cm]);

  const bmiCategoryLabel = useMemo(() => {
    if (bmi === null) return null;
    const category = getBMICategory(bmi);
    return BMI_CATEGORY_LABELS[category.category];
  }, [bmi]);

  const visibleAccountItems = useMemo(
    () =>
      ACCOUNT_ITEMS.filter((item) => {
        if (isAnonymous && item.route === Routes.profile.changePassword) {
          return false;
        }
        return true;
      }),
    [isAnonymous],
  );

  const handleSaveWeightSettings = async () => {
    if (!profile?.id) return;

    const parsedCurrent = Number.parseFloat(currentKg.replace(',', '.'));
    const parsedGoal = Number.parseFloat(goalKg.replace(',', '.'));

    if (!Number.isFinite(parsedCurrent) || parsedCurrent < 30 || parsedCurrent > 300) {
      showToast('Ingresa un peso de referencia entre 30 y 300 kg.', 'error');
      return;
    }

    setSavingWeight(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({
          weight_current_kg: parsedCurrent,
          weight_start_kg: profile.weight_start_kg ?? parsedCurrent,
          weight_goal_kg: Number.isFinite(parsedGoal) ? parsedGoal : null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', profile.id)
        .select('*')
        .single();

      if (error) throw error;
      setProfile(data);
      showToast('Peso y meta actualizados.', 'success');
    } catch {
      showToast('No se pudo guardar la configuración de peso.', 'error');
    } finally {
      setSavingWeight(false);
    }
  };

  const handleSignOut = () => {
    setSignOutOpen(true);
  };

  const confirmSignOut = async () => {
    setSigningOut(true);
    try {
      await signOut();
      router.replace(Routes.auth.welcome as never);
    } catch {
      showToast('No pudimos cerrar la sesion en este momento.', 'error');
    } finally {
      setSigningOut(false);
      setSignOutOpen(false);
    }
  };

  return (
    <SafeScreen padHorizontal={false} padBottom>
      <Header title="Cuenta y seguridad" showBack color={Colors.brand} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Card style={styles.heroCard}>
          <Text style={styles.heroEyebrow}>Hub de cuenta</Text>
          <Text style={styles.heroTitle}>Lo sensible vive aquí.</Text>
          <Text style={styles.heroBody}>
            Perfil, contrasena, exportacion y configuración de peso quedan agrupados para
            evitar saltos entre pantallas fragmentadas.
          </Text>
        </Card>

        {isAnonymous ? (
          <Card style={styles.guestCard}>
            <Text style={styles.guestEyebrow}>Modo invitado</Text>
            <Text style={styles.guestTitle}>Puedes guardar esta cuenta después.</Text>
            <Text style={styles.guestBody}>
              Lo que registres hoy ya queda asociado a esta sesión temporal. Vincula Google o Apple cuando quieras y conservas tu historial.
            </Text>
            <View style={styles.guestActions}>
              <Button
                color={Colors.brand}
                onPress={() => router.push(Routes.profile.claimAccount as never)}
              >
                Guardar con email
              </Button>
              <Button
                variant="secondary"
                color={Colors.brand}
                onPress={() => router.push(Routes.auth.google as never)}
              >
                Guardar con Google
              </Button>
              <Button
                variant="secondary"
                color={Colors.textPrimary}
                onPress={() => router.push(Routes.auth.apple as never)}
              >
                Guardar con Apple
              </Button>
            </View>
          </Card>
        ) : null}

        <Card style={styles.weightCard}>
          <Text style={styles.sectionTitle}>Peso y meta</Text>
          <Text style={styles.sectionBody}>
            El peso diario se registra desde Inicio y Progreso. Aquí solo defines la
            referencia base y la meta que usan las comparativas.
          </Text>

          <Input
            label="Peso de referencia (kg)"
            value={currentKg}
            onChangeText={setCurrentKg}
            keyboardType="decimal-pad"
            placeholder="Ej: 75.5"
          />

          <Input
            label="Meta de peso (kg)"
            value={goalKg}
            onChangeText={setGoalKg}
            keyboardType="decimal-pad"
            placeholder="Opcional"
          />

          {bmi !== null && bmiCategoryLabel ? (
            <View style={styles.bmiWrap}>
              <BmiGauge bmi={bmi} category={bmiCategoryLabel} />
              <Text style={styles.bmiHint}>
                El IMC es un contexto rápido, no un diagnostico clinico.
              </Text>
            </View>
          ) : null}

          <Button
            label={savingWeight ? 'Guardando...' : 'Guardar peso y meta'}
            onPress={() => {
              void handleSaveWeightSettings();
            }}
            disabled={savingWeight}
            color={Colors.weight}
            fullWidth
          />
        </Card>

        <Card style={styles.card}>
          <SettingToggleRow
            title="Desbloqueo biometrico"
            description={
              biometricAvailable
                ? 'Pide huella o rostro para reabrir tu sesión sin volver a loguearte.'
                : 'Activa biometría en tu dispositivo para proteger la reapertura de la app.'
            }
            value={biometricUnlockEnabled && biometricAvailable}
            onValueChange={(value) => setBiometricUnlockEnabled(value && biometricAvailable)}
            disabled={!biometricAvailable}
            accentColor={Colors.brand}
          />
        </Card>

        <Card style={styles.card}>
          {visibleAccountItems.map((item) => (
            <Pressable
              key={item.route}
              onPress={() => router.push(item.route as never)}
              style={styles.row}
              accessibilityRole="button"
              accessibilityLabel={item.title}
              accessibilityHint={item.description}
              hitSlop={8}
            >
              <Text style={styles.emoji}>{item.emoji}</Text>
              <View style={styles.rowCopy}>
                <Text style={[styles.title, item.destructive && styles.titleDestructive]}>
                  {item.title}
                </Text>
                <Text style={styles.description}>{item.description}</Text>
              </View>
              <Text style={styles.chevron}>›</Text>
            </Pressable>
          ))}
        </Card>

        <Card style={styles.heroCard}>
          <Text style={styles.heroEyebrow}>Sesión actual</Text>
          <Text style={styles.heroTitle}>La sesión ya no vive en otra pantalla.</Text>
          <Text style={styles.heroBody}>
            {userEmail ? `Estás usando ${userEmail}. ` : 'Este dispositivo es tu sesión activa. '}
            {profile?.updated_at
              ? `Última actualizacion: ${new Date(profile.updated_at).toLocaleDateString('es-AR')}.`
              : 'Puedes cerrar sesión local sin salir de este hub.'}
          </Text>
        </Card>

        <Button variant="secondary" color={Colors.brand} onPress={handleSignOut} fullWidth>
          Cerrar sesión en este dispositivo
        </Button>
      </ScrollView>

      <ConfirmationSheet
        visible={signOutOpen}
        onClose={() => setSignOutOpen(false)}
        title="Cerrar sesion"
        body={
          userEmail
            ? `Se cerrara ${userEmail} en este dispositivo. Tus datos seguiran en tu cuenta y podras volver a entrar cuando quieras.`
            : 'Se cerrara tu sesion en este dispositivo. Tus datos seguiran en tu cuenta y podras volver a entrar cuando quieras.'
        }
        confirmLabel={signingOut ? 'Cerrando sesion...' : 'Cerrar sesion'}
        onConfirm={() => {
          void confirmSignOut();
        }}
        confirmVariant="danger"
        loading={signingOut}
      />
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: Spacing[5],
    paddingTop: Spacing[4],
    paddingBottom: Spacing[8],
    gap: Spacing[4],
  },
  heroCard: {
    gap: Spacing[2],
  },
  heroEyebrow: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.xs,
    color: Colors.brand,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  heroTitle: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.xl,
    color: Colors.textPrimary,
  },
  heroBody: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  weightCard: {
    gap: Spacing[3],
  },
  guestCard: {
    gap: Spacing[2],
    borderColor: `${Colors.brand}35`,
    backgroundColor: `${Colors.brand}10`,
  },
  guestEyebrow: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.xs,
    color: Colors.brand,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  guestTitle: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.lg,
    color: Colors.textPrimary,
  },
  guestBody: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    lineHeight: 20,
    color: Colors.textSecondary,
  },
  guestActions: {
    gap: Spacing[2],
    marginTop: Spacing[1],
  },
  sectionTitle: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.lg,
    color: Colors.textPrimary,
  },
  sectionBody: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  bmiWrap: {
    gap: Spacing[2],
  },
  bmiHint: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    textAlign: 'center',
  },
  card: {
    padding: 0,
    overflow: 'hidden',
    borderRadius: Radius.xl,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[3],
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: `${Colors.border}60`,
  },
  emoji: {
    fontSize: 20,
    width: 26,
    textAlign: 'center',
  },
  rowCopy: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.base,
    color: Colors.textPrimary,
  },
  titleDestructive: {
    color: Colors.error,
  },
  description: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  chevron: {
    fontFamily: FontFamily.bold,
    fontSize: 20,
    color: Colors.textMuted,
  },
});
