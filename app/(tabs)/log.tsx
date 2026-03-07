import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { router } from 'expo-router';
import SafeScreen from '@/components/ui/SafeScreen';
import Header from '@/components/layout/Header';
import Card from '@/components/ui/Card';
import { Colors } from '@/constants/colors';
import { FontFamily, FontSize, Radius, Spacing } from '@/constants/theme';
import { useAuthStore } from '@/stores/authStore';
import { getActiveModules } from '@/lib/active-modules';
import type { ModuleId } from '@/constants/modules';

type QuickAction = {
  emoji: string;
  title: string;
  subtitle: string;
  route: string;
  moduleId: ModuleId;
};

const QUICK_ACTIONS: QuickAction[] = [
  {
    emoji: '💧',
    title: 'Registrar agua',
    subtitle: 'Agregá hidratación rápida',
    route: '/modules/water/custom',
    moduleId: 'water',
  },
  {
    emoji: '🍎',
    title: 'Registrar comida',
    subtitle: 'Búsqueda, barcode o manual',
    route: '/modules/nutrition/log?mealType=snack',
    moduleId: 'nutrition',
  },
  {
    emoji: '⚖️',
    title: 'Registrar peso',
    subtitle: 'Peso, grasa y nota diaria',
    route: '/modules/weight/index',
    moduleId: 'weight',
  },
  {
    emoji: '😴',
    title: 'Registrar sueño',
    subtitle: 'Horas + calidad',
    route: '/modules/sleep/index',
    moduleId: 'sleep',
  },
  {
    emoji: '💪',
    title: 'Iniciar entreno',
    subtitle: 'Comenzá sesión activa',
    route: '/modules/workout/session',
    moduleId: 'workout',
  },
  {
    emoji: '🧠',
    title: 'Check-in mental',
    subtitle: 'Ánimo, energía y estrés',
    route: '/modules/mental/index',
    moduleId: 'mental',
  },
];

function actionPriority(moduleId: ModuleId, hour: number): number {
  if (hour >= 6 && hour <= 10) {
    if (moduleId === 'sleep') return 100;
    if (moduleId === 'water') return 90;
    if (moduleId === 'mental') return 80;
  }

  if (hour >= 11 && hour <= 15) {
    if (moduleId === 'nutrition') return 100;
    if (moduleId === 'water') return 90;
    if (moduleId === 'steps') return 80;
  }

  if (hour >= 16 && hour <= 20) {
    if (moduleId === 'workout') return 100;
    if (moduleId === 'steps') return 90;
    if (moduleId === 'water') return 80;
  }

  if (hour >= 21 || hour <= 3) {
    if (moduleId === 'mental') return 100;
    if (moduleId === 'sleep') return 90;
    if (moduleId === 'weight') return 80;
  }

  return 50;
}

export default function LogScreen() {
  const { profile } = useAuthStore();
  const activeModules = useMemo(() => getActiveModules(profile), [profile]);
  const hour = new Date().getHours();

  const visibleActions = useMemo(() => {
    const allowed = new Set<ModuleId>(activeModules);

    return QUICK_ACTIONS
      .filter((action) => allowed.has(action.moduleId))
      .sort((a, b) => actionPriority(b.moduleId, hour) - actionPriority(a.moduleId, hour));
  }, [activeModules, hour]);

  return (
    <SafeScreen padHorizontal={false} padBottom>
      <Header title="Registro rápido" color={Colors.brand} />

      <View style={styles.content}>
        <Text style={styles.subtitle}>Elegí qué querés registrar ahora</Text>

        <View style={styles.grid}>
          {visibleActions.map((action, index) => (
            <Pressable
              key={action.title}
              onPress={() => router.push(action.route as any)}
              style={({ pressed }) => [
                styles.card,
                pressed && styles.cardPressed,
              ]}
            >
              <Card style={styles.cardInner}>
                <View style={styles.cardTop}>
                  <Text style={styles.emoji}>{action.emoji}</Text>
                  {index === 0 ? <Text style={styles.suggested}>Sugerido ahora</Text> : null}
                </View>
                <Text style={styles.title}>{action.title}</Text>
                <Text style={styles.description}>{action.subtitle}</Text>
              </Card>
            </Pressable>
          ))}

          {visibleActions.length === 0 ? (
            <Card style={styles.emptyCard}>
              <Text style={styles.emptyTitle}>No hay módulos activos</Text>
              <Text style={styles.emptySubtitle}>
                Activá módulos desde Configuración → Módulos activos para ver accesos rápidos.
              </Text>
            </Card>
          ) : null}
        </View>
      </View>
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    paddingHorizontal: Spacing[5],
    paddingTop: Spacing[4],
    paddingBottom: Spacing[8],
  },
  subtitle: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginBottom: Spacing[4],
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing[3],
  },
  card: {
    width: '48%',
  },
  cardPressed: {
    opacity: 0.85,
  },
  cardInner: {
    minHeight: 140,
    justifyContent: 'space-between',
    borderRadius: Radius.xl,
  },
  cardTop: {
    gap: Spacing[1],
  },
  emoji: {
    fontSize: 28,
  },
  suggested: {
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing[2],
    paddingVertical: 2,
    borderRadius: Radius.full,
    backgroundColor: `${Colors.brand}18`,
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.xs,
    color: Colors.brand,
  },
  title: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.base,
    color: Colors.textPrimary,
  },
  description: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    lineHeight: 18,
  },
  emptyCard: {
    width: '100%',
    borderRadius: Radius.xl,
  },
  emptyTitle: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.base,
    color: Colors.textPrimary,
  },
  emptySubtitle: {
    marginTop: Spacing[1],
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
});
