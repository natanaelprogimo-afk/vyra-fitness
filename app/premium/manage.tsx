// REDESIGNED: 2026-05-23 — manage access reframed as a legacy compatibility hub
import React from 'react';
import { useEffect } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import SafeScreen from '@/components/ui/SafeScreen';
import Header from '@/components/layout/Header';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import NoticeCard from '@/components/ui/NoticeCard';
import ScreenFooterSpacer from '@/components/ui/ScreenFooterSpacer';
import SectionHeader from '@/components/ui/SectionHeader';
import LinkRow from '@/components/ui/LinkRow';
import { Colors } from '@/constants/colors';
import { Routes } from '@/constants/routes';
import { FontFamily, FontSize, Radius, Spacing } from '@/constants/theme';
import { trackPaywallViewed } from '@/lib/analytics';

const ACTIVE_ZONES = [
  {
    title: 'Progreso',
    body: 'Correlaciones, tendencias y lectura cruzada del avance.',
    route: Routes.tabs.progress,
    accent: Colors.brand,
  },
  {
    title: 'Nutrición',
    body: 'Scanner, historial y carga manual dentro del acceso actual.',
    route: Routes.nutrition.index,
    accent: Colors.nutrition,
  },
  {
    title: 'Readiness',
    body: 'Balance diario, contexto del día y señales útiles en un solo lugar.',
    route: Routes.readiness,
    accent: Colors.steps,
  },
  {
    title: 'Perfil',
    body: 'Abre tu perfil y revisa identidad, progreso y cuenta.',
    route: Routes.profile.sheet,
    accent: Colors.info,
  },
] as const;

export default function ManageAccessScreen() {
  useEffect(() => {
    trackPaywallViewed({
      surface: 'premium_manage',
    });
  }, []);

  return (
    <SafeScreen padHorizontal={false} padBottom>
      <Header title="Gestion de acceso" showBack color={Colors.brand} />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <NoticeCard
          title="Pantalla de compatibilidad"
          body="Si llegaste aqui desde un enlace o boton viejo, no hace falta gestionar ningun plan. Esta ruta solo resume el acceso actual."
          tone="info"
        />

        <Card accentColor={Colors.brand} style={styles.heroCard}>
          <Text style={styles.eyebrow}>Estado actual</Text>
          <Text style={styles.heroTitle}>Tu cuenta ya entra completa.</Text>
          <Text style={styles.heroBody}>
            Esta ruta deja de parecer una pantalla de pago. Ahora funciona como una explicacion
            corta del acceso actual y como atajo a las capas donde mas se nota.
          </Text>
          <View style={styles.heroMetrics}>
            <View style={styles.metricPill}>
              <Text style={styles.metricPillValue}>100%</Text>
              <Text style={styles.metricPillLabel}>modulos abiertos</Text>
            </View>
            <View style={styles.metricPill}>
              <Text style={styles.metricPillValue}>0</Text>
              <Text style={styles.metricPillLabel}>planes por gestionar</Text>
            </View>
          </View>
        </Card>

        <Card style={styles.card}>
          <SectionHeader
            eyebrow="Incluido"
            title="Donde mas se nota"
            subtitle="Atajos a las superficies donde el acceso abierto devuelve mas valor hoy."
          />

          <View style={styles.zoneStack}>
            {ACTIVE_ZONES.map((item) => (
              <LinkRow
                key={item.title}
                label={item.title}
                description={item.body}
                hint="Abrir"
                onPress={() => router.push(item.route as never)}
                accentColor={item.accent}
              />
            ))}
          </View>
        </Card>

        <Card style={styles.card}>
          <SectionHeader
            eyebrow="Siguiente paso"
            title="Acceso actual"
            subtitle="El acceso sigue abierto mientras ordenamos una experiencia premium mas limpia."
          />
          <View style={styles.modelStack}>
            <View style={styles.modelRow}>
              <Text style={styles.modelLabel}>Tracking principal</Text>
              <Text style={styles.modelValue}>Abierto</Text>
            </View>
            <View style={styles.modelRow}>
              <Text style={styles.modelLabel}>Promocion</Text>
              <Text style={styles.modelValue}>Fuera del producto</Text>
            </View>
            <View style={styles.modelRow}>
              <Text style={styles.modelLabel}>Suscripcion</Text>
              <Text style={styles.modelValue}>Pendiente</Text>
            </View>
          </View>
        </Card>

        <Button onPress={() => router.replace('/(tabs)' as never)} fullWidth color={Colors.brand}>
          Volver al inicio
        </Button>

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
  heroCard: {
    gap: Spacing[3],
  },
  card: {
    gap: Spacing[4],
  },
  eyebrow: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.xs,
    color: Colors.brand,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  heroTitle: {
    fontFamily: FontFamily.display,
    fontSize: FontSize['3xl'],
    lineHeight: 34,
    color: Colors.textPrimary,
  },
  heroBody: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    lineHeight: 20,
    color: Colors.textSecondary,
  },
  heroMetrics: {
    flexDirection: 'row',
    gap: Spacing[3],
  },
  metricPill: {
    flex: 1,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface2,
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[3],
    gap: 4,
  },
  metricPillValue: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.xl,
    color: Colors.textPrimary,
  },
  metricPillLabel: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
  },
  zoneStack: {
    gap: Spacing[2],
  },
  modelStack: {
    gap: Spacing[2],
  },
  modelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing[3],
    minHeight: 44,
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[3],
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface2,
  },
  modelLabel: {
    flex: 1,
    fontFamily: FontFamily.medium,
    fontSize: FontSize.sm,
    color: Colors.textPrimary,
  },
  modelValue: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
  },
});
