import { StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import SafeScreen from '@/components/ui/SafeScreen';
import Button from '@/components/ui/Button';
import { Colors } from '@/constants/colors';
import { FontFamily, Spacing } from '@/constants/theme';
import { Routes } from '@/constants/routes';

export default function WelcomeScreen() {
  return (
    <SafeScreen padBottom contentStyle={styles.container}>
      <View style={styles.topSpace} />

      <View style={styles.hero}>
        <Text style={styles.brand}>VYRA</Text>
        <Text style={styles.title}>Entrena hoy.</Text>
        <Text style={styles.subtitle}>Sin excusas. Sin dashboards.</Text>
      </View>

      <View style={styles.actions}>
        <Button onPress={() => router.push(Routes.auth.register as never)} fullWidth size="lg" haptic="medium">
          Empezar gratis
        </Button>
        <Button onPress={() => router.push(Routes.auth.login as never)} variant="ghost" fullWidth>
          Ya tengo cuenta
        </Button>
      </View>
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topSpace: {
    height: 80,
  },
  hero: {
    gap: 8,
  },
  brand: {
    fontFamily: FontFamily.bold,
    fontSize: 28,
    color: Colors.textPrimary,
  },
  title: {
    fontFamily: FontFamily.display,
    fontSize: 44,
    lineHeight: 46,
    letterSpacing: -2,
    color: Colors.textPrimary,
  },
  subtitle: {
    fontFamily: FontFamily.regular,
    fontSize: 18,
    color: Colors.textSecondary,
  },
  actions: {
    marginTop: 'auto',
    gap: Spacing[3],
    paddingBottom: 40,
  },
});
