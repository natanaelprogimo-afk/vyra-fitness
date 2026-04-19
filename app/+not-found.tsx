import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import SafeScreen from '@/components/ui/SafeScreen';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { Colors, withOpacity } from '@/constants/colors';
import { FontFamily, FontSize, Spacing } from '@/constants/theme';

export default function NotFound() {
  return (
    <SafeScreen>
      <View style={styles.container}>
        <Card style={styles.card}>
          <View style={styles.iconWrap}>
            <Ionicons name="compass-outline" size={42} color={Colors.textMuted} />
          </View>
          <Text style={styles.title}>Esto no existe.</Text>
          <Text style={styles.subtitle}>La ruta que buscabas no esta aqui, pero puedes volver al inicio.</Text>
          <Button onPress={() => router.replace('/(tabs)/' as never)} variant="ghost" fullWidth>
            Volver al inicio
          </Button>
        </Card>
      </View>
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  card: {
    alignItems: 'center',
    gap: Spacing[3],
    borderColor: withOpacity(Colors.white, 0.06),
  },
  iconWrap: {
    width: 84,
    height: 84,
    borderRadius: 42,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: withOpacity(Colors.white, 0.03),
    borderWidth: 1,
    borderColor: withOpacity(Colors.white, 0.06),
  },
  title: {
    fontFamily: FontFamily.display,
    fontSize: 34,
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.base,
    lineHeight: 24,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing[1],
  },
});
