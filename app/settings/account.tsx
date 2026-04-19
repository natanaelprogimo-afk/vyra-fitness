import React, { useMemo, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import SafeScreen from '@/components/ui/SafeScreen';
import Header from '@/components/layout/Header';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import BmiGauge from '@/components/progress/BmiGauge';
import { Colors } from '@/constants/colors';
import { Routes } from '@/constants/routes';
import { FontFamily, FontSize, Radius, Spacing } from '@/constants/theme';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';
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
    description: 'Accion irreversible. Queda agrupada dentro del hub de cuenta.',
    route: Routes.profile.deleteAccount,
    destructive: true,
  },
];

export default function SettingsAccountScreen() {
  const profile = useAuthStore((state) => state.profile);
  const userEmail = useAuthStore((state) => state.user?.email ?? state.profile?.email ?? null);
  const signOut = useAuthStore((state) => state.signOut);
  const setProfile = useAuthStore((state) => state.setProfile);
  const [savingWeight, setSavingWeight] = useState(false);
  const [currentKg, setCurrentKg] = useState(
    String(profile?.weight_current_kg ?? profile?.weight_start_kg ?? ''),
  );
  const [goalKg, setGoalKg] = useState(String(profile?.weight_goal_kg ?? ''));

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

  const handleSaveWeightSettings = async () => {
    if (!profile?.id) return;

    const parsedCurrent = Number.parseFloat(currentKg.replace(',', '.'));
    const parsedGoal = Number.parseFloat(goalKg.replace(',', '.'));

    if (!Number.isFinite(parsedCurrent) || parsedCurrent < 30 || parsedCurrent > 300) {
      Alert.alert('Peso invalido', 'Ingresa un peso de referencia entre 30 y 300 kg.');
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
      Alert.alert('Peso actualizado', 'La configuración de peso ya vive dentro de tu cuenta.');
    } catch {
      Alert.alert('Error', 'No se pudo guardar la configuración de peso.');
    } finally {
      setSavingWeight(false);
    }
  };

  const handleSignOut = () => {
    Alert.alert('Cerrar sesión', 'Se cerrará tu sesión en este dispositivo.', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Cerrar sesión',
        style: 'destructive',
        onPress: async () => {
          await signOut();
          router.replace(Routes.auth.welcome as never);
        },
      },
    ]);
  };

  return (
    <SafeScreen padHorizontal={false} padBottom>
      <Header title="Cuenta y seguridad" showBack color={Colors.brand} />
      <View style={styles.content}>
        <Card style={styles.heroCard}>
          <Text style={styles.heroEyebrow}>Hub de cuenta</Text>
          <Text style={styles.heroTitle}>Lo sensible vive aqui.</Text>
          <Text style={styles.heroBody}>
            Perfil, contrasena, exportacion y configuración de peso quedan agrupados para
            evitar saltos entre pantallas fragmentadas.
          </Text>
        </Card>

        <Card style={styles.weightCard}>
          <Text style={styles.sectionTitle}>Peso y meta</Text>
          <Text style={styles.sectionBody}>
            El peso diario se registra desde Inicio y Progreso. Aqui solo defines la
            referencia base y la meta que usan las comparativas.
          </Text>

          <View style={styles.field}>
            <Text style={styles.label}>Peso de referencia (kg)</Text>
            <TextInput
              style={styles.input}
              value={currentKg}
              onChangeText={setCurrentKg}
              keyboardType="decimal-pad"
              placeholder="Ej: 75.5"
              placeholderTextColor={Colors.textMuted}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Meta de peso (kg)</Text>
            <TextInput
              style={styles.input}
              value={goalKg}
              onChangeText={setGoalKg}
              keyboardType="decimal-pad"
              placeholder="Opcional"
              placeholderTextColor={Colors.textMuted}
            />
          </View>

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
          {ACCOUNT_ITEMS.map((item) => (
            <Pressable
              key={item.route}
              onPress={() => router.push(item.route as never)}
              style={styles.row}
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
          <Text style={styles.heroEyebrow}>Sesion actual</Text>
          <Text style={styles.heroTitle}>La sesión ya no vive en otra pantalla.</Text>
          <Text style={styles.heroBody}>
            {userEmail ? `Estás usando ${userEmail}. ` : 'Este dispositivo es tu sesión activa. '}
            {profile?.updated_at
              ? `Ultima actualizacion: ${new Date(profile.updated_at).toLocaleDateString('es-AR')}.`
              : 'Puedes cerrar sesión local sin salir de este hub.'}
          </Text>
        </Card>

        <Button variant="secondary" color={Colors.brand} onPress={handleSignOut} fullWidth>
          Cerrar sesión en este dispositivo
        </Button>
      </View>
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    paddingHorizontal: Spacing[5],
    paddingTop: Spacing[4],
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
  field: {
    gap: Spacing[1.5],
  },
  label: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  input: {
    backgroundColor: Colors.bgElevated,
    borderWidth: 1,
    borderColor: `${Colors.border}90`,
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[3],
    fontFamily: FontFamily.medium,
    fontSize: FontSize.base,
    color: Colors.textPrimary,
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
