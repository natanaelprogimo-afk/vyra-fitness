import { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import SafeScreen from '@/components/ui/SafeScreen';
import { Colors, withOpacity } from '@/constants/colors';
import { Routes } from '@/constants/routes';
import { FontFamily, FontSize, Radius, Spacing } from '@/constants/theme';

export default function SetupTransitionScreen() {
  useEffect(() => {
    const timeout = setTimeout(() => {
      router.replace(Routes.auth.onboarding.goals as any);
    }, 1000);
    return () => clearTimeout(timeout);
  }, []);

  return (
    <SafeScreen padBottom contentStyle={styles.content}>
      <View style={styles.card}>
        <ActivityIndicator color={Colors.brand} />
        <Text style={styles.title}>Listo, ahora configuremos tu espacio.</Text>
        <Text style={styles.body}>Unos pasos cortos y entras con todo mucho mas claro.</Text>
      </View>
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  card: {
    borderRadius: Radius['3xl'],
    borderWidth: 1,
    borderColor: withOpacity(Colors.white, 0.08),
    backgroundColor: withOpacity(Colors.surface1, 0.95),
    padding: Spacing[6],
    gap: Spacing[3],
    alignItems: 'center',
  },
  title: {
    fontFamily: FontFamily.display,
    fontSize: FontSize.xl,
    lineHeight: 30,
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  body: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    lineHeight: 20,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
});
