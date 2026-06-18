import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useWater } from '@/hooks/useWater';
import { trackQuickLogCompleted } from '@/lib/analytics';
import { Colors, withOpacity } from '@/constants/colors';
import { FontFamily, FontSize, Spacing, Radius } from '@/constants/theme';

type WaterQuickLogState = 'closed' | 'selecting' | 'submitting' | 'done';

export interface WaterQuickLogCardProps {
  onLogged?: () => void;
}

export function WaterQuickLogCard({ onLogged }: WaterQuickLogCardProps) {
  const { addWaterLog } = useWater();
  const [state, setState] = useState<WaterQuickLogState>('closed');
  const [lastAmount, setLastAmount] = useState(0);

  const handleOpenSelection = () => {
    setState('selecting');
  };

  const handleSelectAmount = async (amount: number) => {
    setState('submitting');
    setLastAmount(amount);
    try {
      await addWaterLog(amount);
      trackQuickLogCompleted('water', {
        source: 'water_module_card',
        amount_ml: amount,
      });
      setState('done');
      setTimeout(() => {
        setState('closed');
        onLogged?.();
      }, 2500);
    } catch (err) {
      console.error('Failed to log water:', err);
      setState('closed');
    }
  };

  const handleClose = () => {
    setState('closed');
  };

  if (state === 'closed') {
    return (
      <Pressable style={styles.container} onPress={handleOpenSelection}>
        <View style={styles.card}>
          <View style={styles.iconWrap}>
            <Ionicons name="water" size={20} color={Colors.water} />
          </View>
          <View style={styles.content}>
            <Text style={styles.label}>Beber agua</Text>
            <Text style={styles.detail}>Registra tu hidratación</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={Colors.water} />
        </View>
      </Pressable>
    );
  }

  if (state === 'done') {
    return (
      <View style={styles.container}>
        <View style={[styles.card, styles.doneCard]}>
          <View style={styles.iconWrap}>
            <Ionicons name="checkmark-circle" size={20} color={Colors.success} />
          </View>
          <View style={styles.content}>
            <Text style={styles.label}>Agua registrada</Text>
            <Text style={styles.detail}>{lastAmount} ml agregados</Text>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.header}>
          <Text style={styles.headerLabel}>¿Cuánta agua tomaste?</Text>
          <Pressable onPress={handleClose}>
            <Ionicons name="close" size={20} color={Colors.textPrimary} />
          </Pressable>
        </View>

        <View style={styles.suggestions}>
          <Pressable
            style={styles.suggestionBtn}
            onPress={() => handleSelectAmount(250)}
            disabled={state === 'submitting'}
          >
            <Text style={styles.suggestionIcon}>🥤</Text>
            <Text style={styles.suggestionLabel}>250 ml</Text>
            <Text style={styles.suggestionDetail}>Vaso chico</Text>
          </Pressable>

          <Pressable
            style={styles.suggestionBtn}
            onPress={() => handleSelectAmount(500)}
            disabled={state === 'submitting'}
          >
            <Text style={styles.suggestionIcon}>🥛</Text>
            <Text style={styles.suggestionLabel}>500 ml</Text>
            <Text style={styles.suggestionDetail}>Vaso grande</Text>
          </Pressable>

          <Pressable
            style={styles.suggestionBtn}
            onPress={() => handleSelectAmount(1000)}
            disabled={state === 'submitting'}
          >
            <Text style={styles.suggestionIcon}>🚰</Text>
            <Text style={styles.suggestionLabel}>1000 ml</Text>
            <Text style={styles.suggestionDetail}>Botella</Text>
          </Pressable>

          <Pressable
            style={styles.suggestionBtn}
            onPress={() => handleSelectAmount(750)}
            disabled={state === 'submitting'}
          >
            <Text style={styles.suggestionIcon}>💧</Text>
            <Text style={styles.suggestionLabel}>750 ml</Text>
            <Text style={styles.suggestionDetail}>Medio litro</Text>
          </Pressable>
        </View>

        <Text style={styles.hint}>
          {state === 'submitting' ? 'Registrando...' : 'Selecciona una cantidad'}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: Spacing[4],
    marginVertical: Spacing[3],
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing[4],
    borderWidth: 1,
    borderColor: withOpacity(Colors.water, 0.2),
  },
  doneCard: {
    borderColor: withOpacity(Colors.success, 0.3),
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: Radius.md,
    backgroundColor: withOpacity(Colors.water, 0.12),
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing[4],
  },
  headerLabel: {
    fontSize: FontSize.lg,
    fontFamily: FontFamily.bold,
    color: Colors.textPrimary,
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
  suggestions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing[3],
    marginVertical: Spacing[4],
  },
  suggestionBtn: {
    flex: 1,
    minWidth: '47%',
    paddingVertical: Spacing[4],
    paddingHorizontal: Spacing[3],
    borderRadius: Radius.md,
    backgroundColor: withOpacity(Colors.water, 0.08),
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: withOpacity(Colors.water, 0.15),
  },
  suggestionIcon: {
    fontSize: 28,
    marginBottom: Spacing[2],
  },
  suggestionLabel: {
    fontSize: FontSize.md,
    fontFamily: FontFamily.bold,
    color: Colors.water,
    marginBottom: Spacing[1],
  },
  suggestionDetail: {
    fontSize: FontSize.xs,
    fontFamily: FontFamily.regular,
    color: Colors.textSecondary,
  },
  hint: {
    fontSize: FontSize.sm,
    fontFamily: FontFamily.regular,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: Spacing[3],
  },
});
