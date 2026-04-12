import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';
import * as Haptics from 'expo-haptics';
import { Colors } from '@/constants/colors';
import { FontFamily, Spacing, Radius } from '@/constants/theme';

const DEFAULT_REST = 90; // segundos

interface RestTimerModalProps {
  visible: boolean;
  onClose: () => void;
  defaultSeconds?: number;
}

export function RestTimerModal({
  visible,
  onClose,
  defaultSeconds = DEFAULT_REST,
}: RestTimerModalProps) {
  const [timeLeft, setTimeLeft] = useState(defaultSeconds);
  const [total, setTotal] = useState(defaultSeconds);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // SVG círculo
  const RADIUS = 80;
  const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
  const progress = timeLeft / total;
  const strokeDashoffset = CIRCUMFERENCE * (1 - progress);

  useEffect(() => {
    if (visible) {
      setTimeLeft(defaultSeconds);
      setTotal(defaultSeconds);
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(intervalRef.current!);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            return 0;
          }
          if (prev <= 4) {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [visible, defaultSeconds]);

  const adjust = (delta: number) => {
    setTimeLeft((prev) => Math.max(5, Math.min(300, prev + delta)));
    setTotal((prev) => Math.max(5, Math.min(300, prev + delta)));
  };

  const formatTime = (s: number) =>
    `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Text style={styles.title}>Descanso</Text>

          {/* Círculo SVG */}
          <View style={styles.circleWrapper}>
            <Svg width={200} height={200} viewBox="0 0 200 200">
              {/* Track */}
              <Circle
                cx={100}
                cy={100}
                r={RADIUS}
                stroke={Colors.bgElevated}
                strokeWidth={12}
                fill="none"
              />
              {/* Progress */}
              <Circle
                cx={100}
                cy={100}
                r={RADIUS}
                stroke={Colors.workout}
                strokeWidth={12}
                fill="none"
                strokeDasharray={`${CIRCUMFERENCE} ${CIRCUMFERENCE}`}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                rotation="-90"
                origin="100,100"
              />
            </Svg>
            <View style={styles.circleCenter}>
              <Text style={styles.timeText}>{formatTime(timeLeft)}</Text>
              <Text style={styles.timeLabel}>restantes</Text>
            </View>
          </View>

          {/* Controles ±15s */}
          <View style={styles.controls}>
            <TouchableOpacity
              style={styles.adjustBtn}
              onPress={() => adjust(-15)}
            >
              <Text style={styles.adjustBtnText}>−15s</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.adjustBtn, styles.adjustBtnSkip]}
              onPress={onClose}
            >
              <Text style={[styles.adjustBtnText, styles.adjustBtnSkipText]}>
                Saltar →
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.adjustBtn}
              onPress={() => adjust(15)}
            >
              <Text style={styles.adjustBtnText}>+15s</Text>
            </TouchableOpacity>
          </View>

          {timeLeft === 0 && (
            <TouchableOpacity style={styles.goBtn} onPress={onClose}>
              <Text style={styles.goBtnText}>💪 ¡A por el siguiente set!</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  container: {
    backgroundColor: Colors.bgSurface,
    borderTopLeftRadius: Radius['2xl'],
    borderTopRightRadius: Radius['2xl'],
    padding: Spacing[6],
    alignItems: 'center',
    width: '100%',
    gap: Spacing[5],
  },
  title: {
    fontFamily: FontFamily.bold,
    fontSize: 22,
    color: Colors.textPrimary,
  },
  circleWrapper: {
    position: 'relative',
    width: 200,
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  circleCenter: {
    position: 'absolute',
    alignItems: 'center',
  },
  timeText: {
    fontFamily: FontFamily.bold,
    fontSize: 42,
    color: Colors.workout,
  },
  timeLabel: {
    fontFamily: FontFamily.regular,
    fontSize: 14,
    color: Colors.textSecondary,
  },
  controls: {
    flexDirection: 'row',
    gap: Spacing[3],
  },
  adjustBtn: {
    backgroundColor: Colors.bgElevated,
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[3],
  },
  adjustBtnSkip: {
    backgroundColor: `${Colors.workout}22`,
    borderWidth: 1,
    borderColor: Colors.workout,
  },
  adjustBtnText: {
    fontFamily: FontFamily.bold,
    fontSize: 15,
    color: Colors.textSecondary,
  },
  adjustBtnSkipText: {
    color: Colors.workout,
  },
  goBtn: {
    backgroundColor: Colors.workout,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing[6],
    paddingVertical: Spacing[3],
  },
  goBtnText: {
    fontFamily: FontFamily.bold,
    fontSize: 16,
    color: '#fff',
  },
});

export default RestTimerModal;