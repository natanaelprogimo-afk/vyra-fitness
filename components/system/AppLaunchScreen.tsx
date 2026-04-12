import { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Easing, Image, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFonts } from 'expo-font';
import { DMSans_400Regular } from '@expo-google-fonts/dm-sans/400Regular';
import { DMSans_500Medium } from '@expo-google-fonts/dm-sans/500Medium';
import { DMSans_600SemiBold } from '@expo-google-fonts/dm-sans/600SemiBold';
import { Syne_700Bold } from '@expo-google-fonts/syne/700Bold';
import Svg, { Path } from 'react-native-svg';
import { FontFamily, Radius, Spacing } from '@/constants/theme';

const LOGO_IMAGE = require('@/assets/Vyra_LOGO/VYRA.jpeg');

const MODULES = [
  { name: 'Score & racha', detail: 'Calculando tu puntuación actual' },
  { name: 'Misión del día', detail: 'Generando objetivos de hoy' },
  { name: 'Coach Vyra', detail: 'Cargando tu contexto personal' },
  { name: 'Ayuno & ritmo', detail: 'Leyendo tu ventana activa' },
  { name: 'Módulos activos', detail: 'Aplicando tu configuración' },
] as const;

const ACTIVE_LABELS = [
  'Cargando score…',
  'Preparando misión…',
  'Conectando coach…',
  'Leyendo ayuno…',
  'Aplicando módulos…',
] as const;

type AppLaunchScreenProps = {
  ready?: boolean;
  onFinished?: () => void;
  onReadyToDisplay?: () => void;
};

type ModuleState = 'wait' | 'active' | 'done';

function CheckMark() {
  return (
    <Svg width={9} height={9} viewBox="0 0 9 7" fill="none">
      <Path d="M1 3.5L3.5 6L8 1" stroke="#FFFFFF" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

export default function AppLaunchScreen({ ready = false, onFinished, onReadyToDisplay }: AppLaunchScreenProps) {
  const insets = useSafeAreaInsets();
  const [fontsLoaded] = useFonts({
    Syne_700Bold,
    DMSans_400Regular,
    DMSans_500Medium,
    DMSans_600SemiBold,
  });
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [doneCount, setDoneCount] = useState(0);
  const [showFinalMessage, setShowFinalMessage] = useState(false);
  const [canFade, setCanFade] = useState(false);
  const [isFading, setIsFading] = useState(false);

  const fadeAnim = useRef(new Animated.Value(1)).current;
  const spinnerRotation = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const rowEntrances = useRef(MODULES.map(() => new Animated.Value(0))).current;
  const rowPulses = useRef(MODULES.map(() => new Animated.Value(1))).current;
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const hasReportedLayoutRef = useRef(false);
  const previousDoneCountRef = useRef(0);

  const displayFont = fontsLoaded ? 'Syne_700Bold' : FontFamily.display;
  const bodyRegular = fontsLoaded ? 'DMSans_400Regular' : FontFamily.regular;
  const bodyMedium = fontsLoaded ? 'DMSans_500Medium' : FontFamily.medium;
  const bodySemiBold = fontsLoaded ? 'DMSans_600SemiBold' : FontFamily.semibold;

  useEffect(() => {
    const spin = Animated.loop(
      Animated.timing(spinnerRotation, {
        toValue: 1,
        duration: 700,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );

    spin.start();

    const schedule = (delay: number, cb: () => void) => {
      const timer = setTimeout(cb, delay);
      timeoutsRef.current.push(timer);
    };

    rowEntrances.forEach((row, index) => {
      schedule(300 + index * 90, () => {
        Animated.timing(row, {
          toValue: 1,
          duration: 400,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }).start();
      });
    });

    schedule(600, () => setActiveIndex(0));
    schedule(1400, () => {
      setDoneCount(1);
      setActiveIndex(1);
    });
    schedule(2200, () => {
      setDoneCount(2);
      setActiveIndex(2);
    });
    schedule(3000, () => {
      setDoneCount(3);
      setActiveIndex(3);
    });
    schedule(3800, () => {
      setDoneCount(4);
      setActiveIndex(4);
    });
    schedule(5000, () => {
      setDoneCount(5);
      setActiveIndex(null);
    });
    schedule(5300, () => setShowFinalMessage(true));
    schedule(6100, () => setCanFade(true));

    const nativeSplashTimer = setTimeout(() => {
      onReadyToDisplay?.();
    }, 120);
    timeoutsRef.current.push(nativeSplashTimer);

    return () => {
      spin.stop();
      timeoutsRef.current.forEach((timer) => clearTimeout(timer));
      timeoutsRef.current = [];
    };
  }, [onReadyToDisplay, rowEntrances, spinnerRotation]);

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: doneCount / MODULES.length,
      duration: 600,
      easing: Easing.out(Easing.ease),
      useNativeDriver: false,
    }).start();
  }, [doneCount, progressAnim]);

  useEffect(() => {
    if (doneCount <= previousDoneCountRef.current) return;

    const pulseIndex = doneCount - 1;
    previousDoneCountRef.current = doneCount;
    const pulseValue = rowPulses[pulseIndex];

    Animated.sequence([
      Animated.timing(pulseValue, {
        toValue: 1.15,
        duration: 110,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(pulseValue, {
        toValue: 1,
        duration: 110,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
    ]).start();
  }, [doneCount, rowPulses]);

  useEffect(() => {
    if (!ready || !canFade || isFading) return;

    setIsFading(true);
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 400,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished) {
        onFinished?.();
      }
    });
  }, [canFade, fadeAnim, isFading, onFinished, ready]);

  const progressLabel = useMemo(() => {
    if (showFinalMessage) return 'Tu espacio está listo';
    if (doneCount === MODULES.length) return 'Todo listo · abriendo';
    if (activeIndex === null) return 'Iniciando…';
    return ACTIVE_LABELS[activeIndex];
  }, [activeIndex, doneCount, showFinalMessage]);

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  const spinnerTransform = {
    transform: [
      {
        rotate: spinnerRotation.interpolate({
          inputRange: [0, 1],
          outputRange: ['0deg', '360deg'],
        }),
      },
    ],
  } as const;

  return (
    <Animated.View
      onLayout={() => {
        if (hasReportedLayoutRef.current) return;
        hasReportedLayoutRef.current = true;
      }}
      style={[
        styles.screen,
        {
          opacity: fadeAnim,
          paddingTop: Math.max(insets.top + 24, 24),
          paddingBottom: Math.max(insets.bottom, 0),
        },
      ]}
    >
      <View pointerEvents="none" style={styles.orbOrange} />
      <View pointerEvents="none" style={styles.orbBlue} />

      <View style={styles.shell}>
        <View style={styles.logoZone}>
          <View style={styles.logoContainer}>
            <Image source={LOGO_IMAGE} style={styles.logoImage} resizeMode="contain" />
          </View>

          <View style={styles.logoCopy}>
            <Text style={[styles.logoTitle, { fontFamily: displayFont }]}>VYRA</Text>
            <Text style={[styles.logoSubtitle, { fontFamily: bodyRegular }]}>tu sistema fitness diario</Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.modulesZone}>
          {MODULES.map((module, index) => {
            const state: ModuleState =
              index < doneCount ? 'done' : activeIndex === index ? 'active' : 'wait';
            const pulseStyle = {
              transform: [{ scale: rowPulses[index] }],
            };
            const rowEntranceStyle = {
              opacity: rowEntrances[index],
              transform: [
                {
                  translateY: rowEntrances[index].interpolate({
                    inputRange: [0, 1],
                    outputRange: [8, 0],
                  }),
                },
              ],
            };
            const showActiveSeparator = activeIndex === index && doneCount > 0;

            return (
              <View key={module.name}>
                {showActiveSeparator ? <View style={styles.activeSeparator} /> : null}
                <Animated.View style={[styles.moduleRow, rowEntranceStyle, showActiveSeparator && styles.moduleRowOffset]}>
                  <Animated.View
                    style={[
                      styles.stateCircle,
                      pulseStyle,
                      state === 'wait' && styles.stateCircleWait,
                      state === 'active' && styles.stateCircleActive,
                      state === 'done' && styles.stateCircleDone,
                    ]}
                  >
                    {state === 'active' ? <Animated.View style={[styles.spinner, spinnerTransform]} /> : null}
                    {state === 'done' ? <CheckMark /> : null}
                  </Animated.View>

                  <View style={styles.moduleTextBlock}>
                    <Text
                      style={[
                        styles.moduleName,
                        { fontFamily: bodyMedium },
                        state === 'wait' && styles.moduleNameWait,
                        state === 'active' && styles.moduleNameActive,
                        state === 'done' && styles.moduleNameDone,
                      ]}
                    >
                      {module.name}
                    </Text>
                    <Text
                      style={[
                        styles.moduleDetail,
                        { fontFamily: bodyRegular },
                        state === 'active' ? styles.moduleDetailActive : styles.moduleDetailIdle,
                      ]}
                    >
                      {module.detail}
                    </Text>
                  </View>

                  <View
                    style={[
                      styles.tagPill,
                      state === 'wait' && styles.tagPillWait,
                      state === 'active' && styles.tagPillActive,
                      state === 'done' && styles.tagPillDone,
                    ]}
                  >
                    <Text
                      style={[
                        styles.tagText,
                        { fontFamily: bodySemiBold },
                        state === 'wait' && styles.tagTextWait,
                        state === 'active' && styles.tagTextActive,
                        state === 'done' && styles.tagTextDone,
                      ]}
                    >
                      {state === 'wait' ? '—' : state === 'active' ? 'cargando' : 'listo'}
                    </Text>
                  </View>
                </Animated.View>
              </View>
            );
          })}
        </View>

        <View style={[styles.progressZone, { paddingBottom: 40 }]}>
          <View style={styles.progressTrack}>
            <Animated.View style={[styles.progressFill, { width: progressWidth }]} />
          </View>
          <Text
            style={[
              styles.progressLabel,
              showFinalMessage ? styles.progressLabelFinal : styles.progressLabelDefault,
              { fontFamily: showFinalMessage ? bodyMedium : bodyRegular },
            ]}
          >
            {progressLabel}
          </Text>
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#0A0A0F',
    overflow: 'hidden',
  },
  shell: {
    flex: 1,
    paddingHorizontal: 32,
  },
  orbOrange: {
    position: 'absolute',
    top: -112,
    right: -132,
    width: 264,
    height: 264,
    borderRadius: 132,
    backgroundColor: '#FF5C1A',
    opacity: 0.05,
    shadowColor: '#FF5C1A',
    shadowOpacity: 0.38,
    shadowRadius: 120,
    shadowOffset: { width: 0, height: 0 },
    elevation: 0,
  },
  orbBlue: {
    position: 'absolute',
    bottom: 68,
    left: -84,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: '#4A9EFF',
    opacity: 0.05,
    shadowColor: '#4A9EFF',
    shadowOpacity: 0.34,
    shadowRadius: 100,
    shadowOffset: { width: 0, height: 0 },
    elevation: 0,
  },
  logoZone: {
    minHeight: 268,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingTop: Spacing[4],
    paddingBottom: Spacing[2],
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: '#111120',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoImage: {
    width: 44,
    height: 44,
  },
  logoCopy: {
    marginTop: 14,
    alignItems: 'center',
    gap: 4,
  },
  logoTitle: {
    fontSize: 24,
    lineHeight: 28,
    fontWeight: '700',
    color: '#F0EDE8',
    letterSpacing: 5,
  },
  logoSubtitle: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '400',
    color: 'rgba(255,255,255,0.28)',
    letterSpacing: 0.8,
  },
  divider: {
    width: '100%',
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.06)',
    marginTop: 12,
    marginBottom: 18,
  },
  modulesZone: {
    gap: 14,
  },
  activeSeparator: {
    height: 1,
    marginVertical: 2,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  moduleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  moduleRowOffset: {
    marginTop: 4,
  },
  stateCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stateCircleWait: {
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.12)',
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  stateCircleActive: {
    borderWidth: 1.5,
    borderColor: '#FF5C1A',
    backgroundColor: 'rgba(255,92,26,0.06)',
  },
  stateCircleDone: {
    borderWidth: 1.5,
    borderColor: '#22C97A',
    backgroundColor: 'rgba(34,201,122,0.10)',
  },
  spinner: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 1.5,
    borderColor: 'rgba(255,92,26,0.2)',
    borderTopColor: '#FF5C1A',
  },
  moduleTextBlock: {
    flex: 1,
    gap: 3,
  },
  moduleName: {
    fontSize: 13,
    lineHeight: 16,
    fontWeight: '500',
  },
  moduleNameWait: {
    color: 'rgba(255,255,255,0.45)',
  },
  moduleNameActive: {
    color: '#F0EDE8',
  },
  moduleNameDone: {
    color: 'rgba(255,255,255,0.28)',
  },
  moduleDetail: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '400',
  },
  moduleDetailIdle: {
    color: 'rgba(255,255,255,0.20)',
  },
  moduleDetailActive: {
    color: 'rgba(255,92,26,0.70)',
  },
  tagPill: {
    minWidth: 52,
    height: 20,
    borderRadius: 10,
    paddingHorizontal: 9,
    paddingVertical: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tagPillWait: {
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  tagPillActive: {
    backgroundColor: 'rgba(255,92,26,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255,92,26,0.28)',
  },
  tagPillDone: {
    backgroundColor: 'rgba(34,201,122,0.12)',
  },
  tagText: {
    fontSize: 10,
    lineHeight: 12,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  tagTextWait: {
    color: 'rgba(255,255,255,0.18)',
  },
  tagTextActive: {
    color: '#FF5C1A',
  },
  tagTextDone: {
    color: '#22C97A',
  },
  progressZone: {
    marginTop: 26,
  },
  progressTrack: {
    width: '100%',
    height: 2,
    borderRadius: 1,
    backgroundColor: 'rgba(255,255,255,0.06)',
    overflow: 'hidden',
  },
  progressFill: {
    height: 2,
    borderRadius: 1,
    backgroundColor: '#FF5C1A',
  },
  progressLabel: {
    textAlign: 'center',
  },
  progressLabelDefault: {
    marginTop: 8,
    fontSize: 10,
    lineHeight: 12,
    fontWeight: '400',
    color: 'rgba(255,255,255,0.22)',
    letterSpacing: 0.5,
  },
  progressLabelFinal: {
    marginTop: 10,
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '500',
    color: '#F0EDE8',
    letterSpacing: 0.2,
  },
});
