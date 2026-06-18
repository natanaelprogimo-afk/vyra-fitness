import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Colors, withOpacity } from '@/constants/colors';
import { FontFamily, FontSize, Spacing, Radius } from '@/constants/theme';
import { Routes } from '@/constants/routes';

export interface StepsQuickLogCardProps {
  onPressed?: () => void;
}

export function StepsQuickLogCard({ onPressed }: StepsQuickLogCardProps) {
  const handlePress = () => {
    onPressed?.();
    router.push(Routes.steps.index as never);
  };

  return (
    <Pressable style={styles.container} onPress={handlePress}>
      <View style={styles.card}>
        <View style={styles.iconWrap}>
          <Ionicons name="footsteps" size={20} color={Colors.steps} />
        </View>
        <View style={styles.content}>
          <Text style={styles.label}>Registrar pasos</Text>
          <Text style={styles.detail}>Abre el formulario de pasos</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={Colors.steps} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: Spacing[4],
    marginVertical: Spacing[3],
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing[4],
    borderWidth: 1,
    borderColor: withOpacity(Colors.steps, 0.2),
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: Radius.md,
    backgroundColor: withOpacity(Colors.steps, 0.12),
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    marginHorizontal: Spacing[4],
  },
  label: {
    fontSize: FontSize.md,
    fontFamily: FontFamily.semibold,
    color: Colors.textPrimary,
  },
  detail: {
    fontSize: FontSize.sm,
    fontFamily: FontFamily.regular,
    color: Colors.textSecondary,
    marginTop: Spacing[2],
  },
});
