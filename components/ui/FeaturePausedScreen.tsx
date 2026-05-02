import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import SafeScreen from '@/components/ui/SafeScreen';
import Header from '@/components/layout/Header';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { Colors, withOpacity } from '@/constants/colors';
import { Routes } from '@/constants/routes';
import { FontFamily, FontSize, Radius, Spacing } from '@/constants/theme';

type FeaturePausedScreenProps = {
  eyebrow?: string;
  title: string;
  subtitle: string;
  accentColor?: string;
};

export default function FeaturePausedScreen({
  eyebrow = 'Proximamente',
  title,
  subtitle,
  accentColor = Colors.workout,
}: FeaturePausedScreenProps) {
  return (
    <SafeScreen padHorizontal={false} padBottom>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Header
          eyebrow={eyebrow}
          title={title}
          subtitle={subtitle}
          color={accentColor}
          showBack
        />

        <Card accentColor={accentColor} style={styles.card} decorative={false}>
          <Text style={[styles.eyebrow, { color: Colors.textMuted }]}>Modulo pausado</Text>
          <Text style={[styles.heading, { color: Colors.textPrimary }]}>Lo reharemos desde cero</Text>
          <Text style={[styles.body, { color: Colors.textSecondary }]}>
            Está parte quedó fuera por ahora para no sostener una experiencia que ya no queremos conservar.
            Cuando definamos la nueva versión, la montamos desde una base limpia.
          </Text>

          <View style={styles.pillRow}>
            <View
              style={[
                styles.pill,
                {
                  borderColor: withOpacity(accentColor, 0.22),
                  backgroundColor: withOpacity(accentColor, 0.12),
                },
              ]}
            >
              <Text style={[styles.pillText, { color: accentColor }]}>Rediseño pendiente</Text>
            </View>
            <View
              style={[
                styles.pill,
                {
                  borderColor: withOpacity(accentColor, 0.22),
                  backgroundColor: withOpacity(accentColor, 0.12),
                },
              ]}
            >
              <Text style={[styles.pillText, { color: accentColor }]}>Sin flujo viejo</Text>
            </View>
          </View>

          <View style={styles.actions}>
            <Button
              onPress={() => router.replace(Routes.tabs.home as never)}
              label="Volver al inicio"
              color={accentColor}
              fullWidth
            />
            <Button
              onPress={() => router.replace(Routes.tabs.progress as never)}
              label="Abrir progreso"
              variant="secondary"
              color={accentColor}
              fullWidth
            />
          </View>
        </Card>
      </ScrollView>
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingHorizontal: Spacing[5],
    paddingTop: Spacing[5],
    paddingBottom: Spacing[12],
    gap: Spacing[4],
  },
  card: {
    gap: Spacing[3],
  },
  eyebrow: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.xs,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  heading: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.xl,
  },
  body: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.md,
    lineHeight: 22,
  },
  pillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing[2],
  },
  pill: {
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[1.5],
    borderRadius: Radius.full,
    borderWidth: 1,
  },
  pillText: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.sm,
  },
  actions: {
    gap: Spacing[2],
    marginTop: Spacing[1],
  },
});
