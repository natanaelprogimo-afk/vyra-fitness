import React, { useEffect, useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import SafeScreen from '@/components/ui/SafeScreen';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { Colors, withOpacity } from '@/constants/colors';
import { FontFamily, FontSize, Radius, Spacing } from '@/constants/theme';
import { Routes } from '@/constants/routes';
import { useAuthStore } from '@/stores/authStore';

const NEXT_STEPS = [
  'El codigo se traslada al registro sin que tengas que volver a escribirlo.',
  'Si completas el alta con ese referido, ambos reciben 7 dias Premium.',
  'Despues entras directo al flujo de growth, ranking y memoria compartida.',
] as const;

export default function ReferralScreen() {
  const params = useLocalSearchParams<Record<string, string>>();
  const isInitialized = useAuthStore((state) => state.isInitialized);
  const hasResolvedProfile = useAuthStore((state) => state.hasResolvedProfile);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated());

  const code = useMemo(() => {
    const raw = params.code ?? params.ref ?? '';
    return typeof raw === 'string' ? raw.trim().toUpperCase() : '';
  }, [params.code, params.ref]);

  useEffect(() => {
    if (!isInitialized) return;
    if (isAuthenticated && !hasResolvedProfile) return;
    if (isAuthenticated) {
      router.replace(Routes.growth.invite as any);
    }
  }, [hasResolvedProfile, isAuthenticated, isInitialized]);

  if (!isInitialized || (isAuthenticated && !hasResolvedProfile)) {
    return (
      <SafeScreen padHorizontal={false} padBottom>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <Card style={styles.heroCard} accentColor={Colors.brand}>
            <View style={styles.heroHeader}>
              <View style={styles.heroCopy}>
                <Text style={styles.eyebrow}>Cargando tu invitacion</Text>
                <Text style={styles.heroTitle}>Estamos resolviendo tu acceso para llevarte al lugar correcto sin perder el codigo.</Text>
                <Text style={styles.heroBody}>
                  Un segundo mas y seguimos con el flujo que toque: invitacion, registro o tu espacio de growth.
                </Text>
              </View>
              <View style={styles.heroIconWrap}>
                <Ionicons name="time-outline" size={22} color={Colors.brand} />
              </View>
            </View>
          </Card>
        </ScrollView>
      </SafeScreen>
    );
  }

  const handleStart = () => {
    router.push({ pathname: Routes.auth.register, params: code ? { ref: code } : {} } as any);
  };

  return (
    <SafeScreen padHorizontal={false} padBottom>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Card style={styles.heroCard} accentColor={Colors.brand}>
          <View style={styles.heroHeader}>
            <View style={styles.heroCopy}>
              <Text style={styles.eyebrow}>Entrada por referido</Text>
              <Text style={styles.heroTitle}>Entrar con codigo te deja el onboarding ya orientado y con recompensa lista.</Text>
              <Text style={styles.heroBody}>
                Si recibiste este enlace, ya hicimos lo dificil: tu codigo queda detectado y el siguiente paso es solo crear la cuenta.
              </Text>
            </View>
            <View style={styles.heroIconWrap}>
              <Ionicons name="sparkles-outline" size={22} color={Colors.brand} />
            </View>
          </View>

          <View style={styles.codeCard}>
            <Text style={styles.codeLabel}>Codigo detectado</Text>
            <Text style={styles.codeValue}>{code || 'SIN CODIGO'}</Text>
            <Text style={styles.codeHint}>
              {code ? 'Se aplicara automaticamente al registrarte.' : 'Si te compartieron uno, podras ingresarlo manualmente en el registro.'}
            </Text>
          </View>

          <View style={styles.metricRow}>
            <View style={styles.metricCard}>
              <Text style={[styles.metricValue, { color: Colors.brand }]}>7 dias</Text>
              <Text style={styles.metricLabel}>Premium para ambos</Text>
            </View>
            <View style={styles.metricCard}>
              <Text style={[styles.metricValue, { color: Colors.coins }]}>1 paso</Text>
              <Text style={styles.metricLabel}>para entrar al flujo</Text>
            </View>
          </View>
        </Card>

        <Card>
          <Text style={styles.sectionTitle}>Que pasa despues</Text>
          <View style={styles.list}>
            {NEXT_STEPS.map((step, index) => (
              <View key={step} style={styles.row}>
                <View style={styles.dotWrap}><Text style={styles.dotText}>{index + 1}</Text></View>
                <Text style={styles.rowText}>{step}</Text>
              </View>
            ))}
          </View>
        </Card>

        <View style={styles.actions}>
          <Button onPress={handleStart} fullWidth>
            Crear cuenta con referido
          </Button>
          <Button variant="secondary" onPress={() => router.replace(Routes.auth.welcome as any)} fullWidth>
            Volver a bienvenida
          </Button>
        </View>
      </ScrollView>
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingHorizontal: Spacing[5],
    paddingTop: Spacing[6],
    paddingBottom: Spacing[12],
    gap: Spacing[4],
  },
  heroCard: { gap: Spacing[4] },
  heroHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: Spacing[3] },
  heroCopy: { flex: 1, gap: 6 },
  eyebrow: { fontFamily: FontFamily.semibold, fontSize: FontSize.xs, letterSpacing: 0.2, color: Colors.brand },
  heroTitle: { fontFamily: FontFamily.display, fontSize: FontSize['2xl'], color: Colors.textPrimary, lineHeight: 36 },
  heroBody: { fontFamily: FontFamily.regular, fontSize: FontSize.sm, color: Colors.textSecondary, lineHeight: 20 },
  heroIconWrap: {
    width: 48,
    height: 48,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: withOpacity(Colors.brand, 0.14),
  },
  codeCard: {
    borderRadius: Radius.xl,
    padding: Spacing[4],
    backgroundColor: Colors.surface2,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 6,
  },
  codeLabel: { fontFamily: FontFamily.medium, fontSize: FontSize.xs, color: Colors.textSecondary },
  codeValue: { fontFamily: FontFamily.display, fontSize: FontSize.xl, color: Colors.textPrimary },
  codeHint: { fontFamily: FontFamily.regular, fontSize: FontSize.sm, color: Colors.textSecondary, lineHeight: 20 },
  metricRow: { flexDirection: 'row', gap: Spacing[2] },
  metricCard: {
    flex: 1,
    padding: Spacing[3],
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: withOpacity(Colors.white, 0.04),
    gap: 4,
  },
  metricValue: { fontFamily: FontFamily.bold, fontSize: FontSize.lg },
  metricLabel: { fontFamily: FontFamily.medium, fontSize: FontSize.xs, color: Colors.textSecondary },
  sectionTitle: { fontFamily: FontFamily.bold, fontSize: FontSize.lg, color: Colors.textPrimary, marginBottom: Spacing[3] },
  list: { gap: Spacing[2] },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing[3] },
  dotWrap: {
    width: 24,
    height: 24,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: withOpacity(Colors.brand, 0.16),
    marginTop: 2,
  },
  dotText: { fontFamily: FontFamily.bold, fontSize: FontSize.xs, color: Colors.brand },
  rowText: { flex: 1, fontFamily: FontFamily.regular, fontSize: FontSize.sm, lineHeight: 20, color: Colors.textSecondary },
  actions: { gap: Spacing[3] },
});
