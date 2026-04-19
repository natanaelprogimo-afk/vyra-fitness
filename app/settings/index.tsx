import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import SafeScreen from '@/components/ui/SafeScreen';
import Header from '@/components/layout/Header';
import Card from '@/components/ui/Card';
import { Colors, withOpacity } from '@/constants/colors';
import { Routes } from '@/constants/routes';
import { FontFamily, FontSize, Radius, Spacing } from '@/constants/theme';

const SECTIONS = [
  {
    title: 'Experiencia',
    items: [
      { icon: 'color-palette-outline', label: 'Apariencia', route: Routes.settings.appearance },
      { icon: 'grid-outline', label: 'Modulos activos', route: Routes.settings.modules },
      { icon: 'phone-portrait-outline', label: 'Widgets', route: Routes.settings.widgets },
      { icon: 'notifications-outline', label: 'Notificaciones', route: Routes.settings.notificationsSettings },
    ],
  },
  {
    title: 'Cuenta',
    items: [
      { icon: 'shield-checkmark-outline', label: 'Cuenta y seguridad', route: Routes.settings.account },
      { icon: 'lock-closed-outline', label: 'Privacidad', route: Routes.settings.privacy },
    ],
  },
] as const;

export default function SettingsScreen() {
  return (
    <SafeScreen padHorizontal={false} padBottom>
      <Header title="Ajustes" showBack color={Colors.brand} />

      <View style={styles.content}>
        {SECTIONS.map((section) => (
          <View key={section.title} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <Card style={styles.card}>
              {section.items.map((item, index) => (
                <View key={item.route}>
                  <Pressable onPress={() => router.push(item.route as never)} style={styles.row}>
                    <View style={styles.iconWrap}>
                      <Ionicons name={item.icon} size={18} color={Colors.brand} />
                    </View>
                    <Text style={styles.label}>{item.label}</Text>
                    <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
                  </Pressable>
                  {index < section.items.length - 1 ? <View style={styles.divider} /> : null}
                </View>
              ))}
            </Card>
          </View>
        ))}
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
  section: {
    gap: Spacing[2],
  },
  sectionTitle: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  card: {
    padding: 0,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[3],
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[4],
  },
  iconWrap: {
    width: 34,
    height: 34,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: withOpacity(Colors.brand, 0.12),
  },
  label: {
    flex: 1,
    fontFamily: FontFamily.medium,
    fontSize: FontSize.base,
    color: Colors.textPrimary,
  },
  divider: {
    marginLeft: 50,
    height: 1,
    backgroundColor: withOpacity(Colors.white, 0.06),
  },
});
