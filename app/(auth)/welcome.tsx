// ============================================================
// VYRA FITNESS — Welcome Screen
// Pantalla de bienvenida con animación de entrada y CTAs
// ============================================================

import { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { router } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSpring,
  Easing,
} from 'react-native-reanimated';
import { Colors } from '@/constants/colors';
import { FontSize, FontFamily, Spacing, Radius } from '@/constants/theme';
import Button from '@/components/ui/Button';
import { AuthStrings } from '@/constants/strings';

const { height: SCREEN_H } = Dimensions.get('window');

// Módulos a mostrar en el grid decorativo
const MODULES = [
  { emoji: '💧', color: Colors.water,     label: 'Hidratación' },
  { emoji: '🚶', color: Colors.steps,     label: 'Pasos'       },
  { emoji: '🍎', color: Colors.nutrition, label: 'Nutrición'   },
  { emoji: '😴', color: Colors.sleep,     label: 'Sueño'       },
  { emoji: '⏳', color: Colors.fasting,   label: 'Ayuno'       },
  { emoji: '💪', color: Colors.workout,   label: 'Entrenos'    },
  { emoji: '🧠', color: Colors.mental,    label: 'Ánimo'       },
  { emoji: '⚖️', color: Colors.weight,    label: 'Peso'        },
];

export default function WelcomeScreen() {
  // Animaciones de entrada escalonadas
  const logoOp  = useSharedValue(0);
  const logoY   = useSharedValue(20);
  const gridOp  = useSharedValue(0);
  const titleOp = useSharedValue(0);
  const titleY  = useSharedValue(20);
  const ctaOp   = useSharedValue(0);
  const ctaY    = useSharedValue(30);

  useEffect(() => {
    // Logo
    logoOp.value = withTiming(1, { duration: 500 });
    logoY.value  = withSpring(0, { damping: 18 });

    // Grid decorativo
    gridOp.value = withDelay(300, withTiming(1, { duration: 600 }));

    // Título
    titleOp.value = withDelay(500, withTiming(1, { duration: 500 }));
    titleY.value  = withDelay(500, withSpring(0, { damping: 18 }));

    // CTAs
    ctaOp.value = withDelay(800, withTiming(1, { duration: 500 }));
    ctaY.value  = withDelay(800, withSpring(0, { damping: 18 }));
  }, []);

  const logoStyle  = useAnimatedStyle(() => ({ opacity: logoOp.value,  transform: [{ translateY: logoY.value }]  }));
  const gridStyle  = useAnimatedStyle(() => ({ opacity: gridOp.value  }));
  const titleStyle = useAnimatedStyle(() => ({ opacity: titleOp.value, transform: [{ translateY: titleY.value }] }));
  const ctaStyle   = useAnimatedStyle(() => ({ opacity: ctaOp.value,   transform: [{ translateY: ctaY.value }]   }));

  return (
    <View style={styles.container}>
      {/* Fondo con gradiente simulado */}
      <View style={styles.bgGradient} />
      <View style={styles.bgGlow} />

      {/* Logo */}
      <Animated.View style={[styles.logoSection, logoStyle]}>
        <View style={styles.logoIcon}>
          <Text style={styles.logoEmoji}>⚡</Text>
        </View>
        <Text style={styles.logoText}>VYRA</Text>
        <Text style={styles.logoSubtext}>FITNESS</Text>
      </Animated.View>

      {/* Grid de módulos decorativo */}
      <Animated.View style={[styles.grid, gridStyle]}>
        {MODULES.map((mod, i) => (
          <ModuleChip key={mod.label} {...mod} delay={i * 60} />
        ))}
      </Animated.View>

      {/* Título y subtítulo */}
      <Animated.View style={[styles.titleSection, titleStyle]}>
        <Text style={styles.title}>{AuthStrings.welcome.title}</Text>
        <Text style={styles.subtitle}>{AuthStrings.welcome.subtitle}</Text>
      </Animated.View>

      {/* CTAs */}
      <Animated.View style={[styles.ctaSection, ctaStyle]}>
        <Button
          onPress={() => router.push('/(auth)/register' as any)}
          variant="primary"
          fullWidth
          size="lg"
          haptic="medium"
          style={styles.ctaPrimary}
        >
          {AuthStrings.welcome.cta}
        </Button>
        <Button
          onPress={() => router.push('/(auth)/login' as any)}
          variant="ghost"
          fullWidth
          size="md"
        >
          {AuthStrings.welcome.login}
        </Button>
      </Animated.View>
    </View>
  );
}

function ModuleChip({
  emoji, color, label, delay,
}: { emoji: string; color: string; label: string; delay: number }) {
  const op    = useSharedValue(0);
  const scale = useSharedValue(0.8);

  useEffect(() => {
    op.value    = withDelay(400 + delay, withTiming(1, { duration: 400 }));
    scale.value = withDelay(400 + delay, withSpring(1, { damping: 14 }));
  }, []);

  const anim = useAnimatedStyle(() => ({
    opacity:   op.value,
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View
      style={[
        styles.chip,
        { backgroundColor: `${color}22`, borderColor: `${color}44` },
        anim,
      ]}
    >
      <Text style={styles.chipEmoji}>{emoji}</Text>
      <Text style={[styles.chipLabel, { color }]}>{label}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex:            1,
    backgroundColor: Colors.bgPrimary,
    paddingHorizontal: Spacing[6],
    paddingTop:      60,
    paddingBottom:   40,
  },

  // Fondo decorativo
  bgGradient: {
    position:        'absolute',
    top:             -100,
    left:            -100,
    width:           400,
    height:          400,
    borderRadius:    200,
    backgroundColor: Colors.brand,
    opacity:         0.08,
  },
  bgGlow: {
    position:        'absolute',
    bottom:          -60,
    right:           -80,
    width:           300,
    height:          300,
    borderRadius:    150,
    backgroundColor: Colors.sleep,
    opacity:         0.06,
  },

  // Logo
  logoSection: {
    alignItems: 'center',
    marginBottom: Spacing[8],
  },
  logoIcon: {
    width:           72,
    height:          72,
    borderRadius:    20,
    backgroundColor: Colors.brand,
    alignItems:      'center',
    justifyContent:  'center',
    marginBottom:    Spacing[3],
    shadowColor:     Colors.brand,
    shadowOffset:    { width: 0, height: 8 },
    shadowOpacity:   0.5,
    shadowRadius:    16,
    elevation:       12,
  },
  logoEmoji: { fontSize: 36 },
  logoText: {
    fontFamily: FontFamily.bold,
    fontSize:   FontSize['4xl'],
    color:      Colors.textPrimary,
    letterSpacing: 8,
  },
  logoSubtext: {
    fontFamily:    FontFamily.medium,
    fontSize:      FontSize.sm,
    color:         Colors.textMuted,
    letterSpacing: 5,
    marginTop:     -4,
  },

  // Grid
  grid: {
    flexDirection:  'row',
    flexWrap:       'wrap',
    gap:            Spacing[2],
    justifyContent: 'center',
    marginBottom:   Spacing[8],
  },
  chip: {
    flexDirection:   'row',
    alignItems:      'center',
    paddingVertical: Spacing[1.5],
    paddingHorizontal: Spacing[3],
    borderRadius:    Radius.full,
    borderWidth:     1,
    gap:             Spacing[1.5],
  },
  chipEmoji: { fontSize: FontSize.sm },
  chipLabel: {
    fontFamily: FontFamily.semibold,
    fontSize:   FontSize.xs,
  },

  // Título
  titleSection: {
    marginBottom: Spacing[10],
  },
  title: {
    fontFamily:  FontFamily.bold,
    fontSize:    FontSize['3xl'],
    color:       Colors.textPrimary,
    lineHeight:  FontSize['3xl'] * 1.2,
    marginBottom: Spacing[3],
  },
  subtitle: {
    fontFamily: FontFamily.regular,
    fontSize:   FontSize.base,
    color:      Colors.textSecondary,
    lineHeight: FontSize.base * 1.6,
  },

  // CTAs
  ctaSection: { gap: Spacing[2] },
  ctaPrimary: {
    shadowColor:   Colors.brand,
    shadowOffset:  { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius:  12,
    elevation:     8,
  },
});