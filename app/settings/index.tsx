import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { router } from 'expo-router';
import SafeScreen from '@/components/ui/SafeScreen';
import Header from '@/components/layout/Header';
import Card from '@/components/ui/Card';
import { Colors } from '@/constants/colors';
import { FontFamily, FontSize, Radius, Spacing } from '@/constants/theme';

const ITEMS = [
  { emoji: '\u{1F464}', title: 'Cuenta', route: '/settings/account' },
  { emoji: '\u{1F514}', title: 'Notificaciones', route: '/settings/notifications' },
  { emoji: '\u{1F916}', title: 'Coach IA', route: '/settings/coach' },
  { emoji: '\u{1F3A8}', title: 'Tema', route: '/settings/theme' },
  { emoji: '\u{1F4CF}', title: 'Unidades', route: '/settings/units' },
  { emoji: '\u{1F9E9}', title: 'Modulos activos', route: '/settings/modules' },
  { emoji: '\u{1F510}', title: 'Privacidad', route: '/settings/privacy' },
  { emoji: '\u{1F5D1}\u{FE0F}', title: 'Zona de peligro', route: '/settings/danger' },
];

export default function SettingsScreen() {
  return (
    <SafeScreen padHorizontal={false} padBottom>
      <Header title="Configuracion" showBack color={Colors.brand} />
      <View style={styles.content}>
        <Card style={styles.card}>
          {ITEMS.map((item) => (
            <Pressable
              key={item.route}
              onPress={() => router.push(item.route as any)}
              style={styles.row}
            >
              <Text style={styles.emoji}>{item.emoji}</Text>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.chevron}>›</Text>
            </Pressable>
          ))}
        </Card>
      </View>
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    paddingHorizontal: Spacing[5],
    paddingTop: Spacing[4],
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
  title: {
    flex: 1,
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.base,
    color: Colors.textPrimary,
  },
  chevron: {
    fontFamily: FontFamily.bold,
    fontSize: 20,
    color: Colors.textMuted,
  },
});


