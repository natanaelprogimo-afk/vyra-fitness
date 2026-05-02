import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import SafeScreen from '@/components/ui/SafeScreen';
import Header from '@/components/layout/Header';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import NoticeCard from '@/components/ui/NoticeCard';
import ScreenFooterSpacer from '@/components/ui/ScreenFooterSpacer';
import SectionHeader from '@/components/ui/SectionHeader';
import { Colors } from '@/constants/colors';
import { Routes } from '@/constants/routes';
import { FontFamily, FontSize, Spacing } from '@/constants/theme';

const ACTIVE_ZONES = [
  {
    title: 'Progreso',
    body: 'Correlaciones, tendencias y lectura cruzada del avance.',
    route: Routes.tabs.progress,
    accent: Colors.brand,
  },
  {
    title: 'Nutricion',
    body: 'Scanner, historial y carga manual dentro del acceso actual.',
    route: Routes.nutrition.index,
    accent: Colors.nutrition,
  },
  {
    title: 'Readiness',
    body: 'Balance diario, contexto del dia y senales utiles en un solo lugar.',
    route: Routes.readiness,
    accent: Colors.steps,
  },
  {
    title: 'Invitar',
    body: 'Comparte tu codigo como flujo de comunidad, no como premio de pago.',
    route: Routes.profile.referral,
    accent: Colors.info,
  },
] as const;

export default function ManageAccessScreen() {
  return (
    <SafeScreen padHorizontal={false} padBottom>
      <Header title="Acceso incluido" showBack color={Colors.brand} />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <NoticeCard
          title="Pantalla de compatibilidad"
          body="Si llegaste aqui desde un enlace o boton viejo, no hace falta gestionar ningun plan. Esta ruta solo resume el acceso actual."
          tone="info"
        />

        <Card accentColor={Colors.brand}>
          <Text style={styles.eyebrow}>Estado actual</Text>
          <Text style={styles.heroTitle}>Tu cuenta ya tiene todo abierto.</Text>
          <Text style={styles.heroBody}>
            Esta superficie queda como apoyo para rutas legacy y para explicar rapidamente que el
            producto hoy funciona con acceso incluido.
          </Text>
        </Card>

        <Card style={styles.card}>
          <SectionHeader
            eyebrow="Incluido"
            title="Donde mas se nota"
            subtitle="Atajos a las superficies donde el acceso abierto devuelve mas valor hoy."
          />

          <View style={styles.zoneStack}>
            {ACTIVE_ZONES.map((item) => (
              <Card
                key={item.title}
                onPress={() => router.push(item.route as never)}
                style={styles.zoneCard}
                accessibilityLabel={`Abrir ${item.title}`}
                accessibilityHint={item.body}
              >
                <Text style={[styles.zoneTitle, { color: item.accent }]}>{item.title}</Text>
                <Text style={styles.zoneBody}>{item.body}</Text>
              </Card>
            ))}
          </View>
        </Card>

        <Card style={styles.card}>
          <SectionHeader
            eyebrow="Siguiente paso"
            title="Monetizacion actual"
            subtitle="El acceso sigue abierto y el soporte del producto ahora se apoya en anuncios discretos y opcionales."
          />
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
  card: {
    gap: Spacing[4],
  },
  eyebrow: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.xs,
    color: Colors.brand,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  heroTitle: {
    fontFamily: FontFamily.display,
    fontSize: 30,
    lineHeight: 32,
    color: Colors.textPrimary,
    marginBottom: 6,
  },
  heroBody: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    lineHeight: 20,
    color: Colors.textSecondary,
  },
  zoneStack: {
    gap: Spacing[2],
  },
  zoneCard: {
    gap: 4,
    backgroundColor: Colors.surface2,
  },
  zoneTitle: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.sm,
  },
  zoneBody: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    lineHeight: 18,
    color: Colors.textSecondary,
  },
});
