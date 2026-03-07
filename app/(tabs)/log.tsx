import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { router } from 'expo-router';
import SafeScreen from '@/components/ui/SafeScreen';
import Header from '@/components/layout/Header';
import Card from '@/components/ui/Card';
import { Colors } from '@/constants/colors';
import { FontFamily, FontSize, Radius, Spacing } from '@/constants/theme';

type QuickAction = {
  emoji: string;
  title: string;
  subtitle: string;
  route: string;
};

const QUICK_ACTIONS: QuickAction[] = [
  {
    emoji: '💧',
    title: 'Registrar agua',
    subtitle: 'Agregá hidratación rápida',
    route: '/modules/water/custom',
  },
  {
    emoji: '🍎',
    title: 'Registrar comida',
    subtitle: 'Búsqueda, barcode o manual',
    route: '/modules/nutrition/log?mealType=snack',
  },
  {
    emoji: '⚖️',
    title: 'Registrar peso',
    subtitle: 'Peso, grasa y nota diaria',
    route: '/modules/weight/index',
  },
  {
    emoji: '😴',
    title: 'Registrar sueño',
    subtitle: 'Horas + calidad',
    route: '/modules/sleep/index',
  },
  {
    emoji: '💪',
    title: 'Iniciar entreno',
    subtitle: 'Comenzá sesión activa',
    route: '/modules/workout/session',
  },
  {
    emoji: '🧠',
    title: 'Check-in mental',
    subtitle: 'Ánimo, energía y estrés',
    route: '/modules/mental/index',
  },
];

export default function LogScreen() {
  return (
    <SafeScreen padHorizontal={false} padBottom>
      <Header title="Registro rápido" color={Colors.brand} />

      <View style={styles.content}>
        <Text style={styles.subtitle}>Elegí qué querés registrar ahora</Text>

        <View style={styles.grid}>
          {QUICK_ACTIONS.map((action) => (
            <Pressable
              key={action.title}
              onPress={() => router.push(action.route as any)}
              style={({ pressed }) => [
                styles.card,
                pressed && styles.cardPressed,
              ]}
            >
              <Card style={styles.cardInner}>
                <Text style={styles.emoji}>{action.emoji}</Text>
                <Text style={styles.title}>{action.title}</Text>
                <Text style={styles.description}>{action.subtitle}</Text>
              </Card>
            </Pressable>
          ))}
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
  emoji: {
    fontSize: 28,
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
});
