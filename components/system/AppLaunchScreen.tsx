import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Animated, Easing, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Radius, Spacing } from '@/constants/theme';

type AppLaunchScreenProps = {
  ready?: boolean;
  onFinished?: () => void;
  onReadyToDisplay?: () => void;
};

const MIN_VISIBLE_MS = 900;
const FADE_DURATION_MS = 260;

export default function AppLaunchScreen({
  ready = false,
  onFinished,
  onReadyToDisplay,
}: AppLaunchScreenProps) {
  const insets = useSafeAreaInsets();
  const [minVisibleDone, setMinVisibleDone] = useState(false);
  const [isFading, setIsFading] = useState(false);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(0.35)).current;

  useEffect(() => {
    onReadyToDisplay?.();
    const timer = setTimeout(() => setMinVisibleDone(true), MIN_VISIBLE_MS);
    return () => clearTimeout(timer);
  }, [onReadyToDisplay]);

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 900,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.35,
          duration: 900,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    );

    pulse.start();
    return () => pulse.stop();
  }, [pulseAnim]);

  useEffect(() => {
    if (!ready || !minVisibleDone || isFading) return;

    setIsFading(true);
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: FADE_DURATION_MS,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished) {
        onFinished?.();
      } else {
        setIsFading(false);
      }
    });
  }, [fadeAnim, isFading, minVisibleDone, onFinished, ready]);

  return (
    <Animated.View
      style={[
        styles.screen,
        {
          opacity: fadeAnim,
          paddingTop: Math.max(insets.top + 32, 32),
          paddingBottom: Math.max(insets.bottom + 28, 28),
        },
      ]}
    >
      <View pointerEvents="none" style={styles.orangeGlow} />
      <Animated.View pointerEvents="none" style={[styles.blueGlow, { opacity: pulseAnim }]} />

      <View style={styles.content}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>VYRA</Text>
        </View>

        <View style={styles.copyBlock}>
          <Text style={styles.title}>Preparando tu sistema fitness</Text>
          <Text style={styles.subtitle}>
            {ready ? 'Abriendo tu inicio personalizado.' : 'Sincronizando sesión, perfil y módulos base.'}
          </Text>
        </View>

        <View style={styles.loaderCard}>
          <ActivityIndicator size="small" color="#FF6A2B" />
          <Text style={styles.loaderTitle}>{ready ? 'Entrando a Vyra' : 'Cargando experiencia'}</Text>
          <Text style={styles.loaderHint}>
            {ready ? 'Todo listo.' : 'Esto solo tarda unos segundos.'}
          </Text>
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#07080D',
    overflow: 'hidden',
  },
  orangeGlow: {
    position: 'absolute',
    top: -90,
    right: -90,
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: '#FF6A2B',
    opacity: 0.12,
  },
  blueGlow: {
    position: 'absolute',
    bottom: 180,
    left: -30,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: '#234FFF',
    opacity: 0.2,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
    gap: Spacing[6],
  },
  badge: {
    minWidth: 116,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    backgroundColor: 'rgba(255,255,255,0.04)',
    alignItems: 'center',
  },
  badgeText: {
    color: '#F5F3EF',
    fontSize: 19,
    fontWeight: '800',
    letterSpacing: 6,
  },
  copyBlock: {
    alignItems: 'center',
    gap: 10,
  },
  title: {
    color: '#F5F3EF',
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
  },
  subtitle: {
    maxWidth: 280,
    color: 'rgba(245,243,239,0.62)',
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
  },
  loaderCard: {
    width: '100%',
    maxWidth: 320,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    backgroundColor: 'rgba(255,255,255,0.04)',
    paddingHorizontal: 20,
    paddingVertical: 18,
    alignItems: 'center',
    gap: 8,
  },
  loaderTitle: {
    color: '#F5F3EF',
    fontSize: 15,
    fontWeight: '600',
  },
  loaderHint: {
    color: 'rgba(245,243,239,0.52)',
    fontSize: 13,
    textAlign: 'center',
  },
});
