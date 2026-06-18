import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/colors';
import { FontFamily, FontSize, Spacing } from '@/constants/theme';
import { AVAILABLE_THEMES, type ThemeId } from '@/constants/themes';

interface ThemeSelectorProps {
  selectedTheme: ThemeId | 'system' | 'dark' | 'light' | 'midnight' | 'pastel' | 'forest' | 'ocean' | 'sunset';
  onThemeSelect: (themeId: ThemeId | 'system' | 'dark' | 'light' | 'midnight' | 'pastel' | 'forest' | 'ocean' | 'sunset') => void;
}

export function ThemeSelector({ selectedTheme, onThemeSelect }: ThemeSelectorProps) {
  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: Colors.textPrimary }]}>Tema de la Aplicación</Text>
      <View style={styles.grid}>
        {AVAILABLE_THEMES.map((theme) => (
          <Pressable
            key={theme.id}
            style={[
              styles.themeOption,
              {
                backgroundColor: Colors.surface2,
                borderColor: selectedTheme === theme.id ? Colors.secondary : Colors.border,
              },
            ]}
            onPress={() => onThemeSelect(theme.id as any)}
          >
            <View style={styles.themePreview}>
              <Text style={[styles.themeName, { color: Colors.textPrimary }]}>
                {theme.label}
              </Text>
              <Text style={[styles.themeDesc, { color: Colors.textMuted }]}>
                {theme.description}
              </Text>
            </View>
            {selectedTheme === theme.id && (
              <Ionicons name="checkmark-circle" size={24} color={Colors.secondary} />
            )}
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
  },
  title: {
    fontSize: FontSize.lg,
    fontFamily: FontFamily.bold,
    marginBottom: Spacing.md,
  },
  grid: {
    gap: Spacing.md,
  },
  themeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderRadius: 12,
    borderWidth: 2,
  },
  themePreview: {
    flex: 1,
  },
  themeName: {
    fontSize: FontSize.base,
    fontFamily: FontFamily.semibold,
    marginBottom: Spacing.xs,
  },
  themeDesc: {
    fontSize: FontSize.sm,
    fontFamily: FontFamily.regular,
  },
});
