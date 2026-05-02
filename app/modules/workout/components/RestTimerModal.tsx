import React, { useEffect, useRef, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, Vibration, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { Colors, withOpacity } from '@/constants/colors';
import { FontFamily, Radius, Spacing } from '@/constants/theme';
import { triggerImpactHaptic, triggerNotificationHaptic } from '@/lib/haptics';

const DEFAULT_REST = 90;
const RADIUS = 80;

interface RestTimerModalProps {
  visible: boolean;
  onClose: () => void;
  defaultSeconds?: number;
  alertMode?: 'soft' | 'strong' | 'sound' | 'silent';
}

export function RestTimerModal({
  visible,
  onClose,
  defaultSeconds = DEFAULT_REST,
  alertMode = 'soft',
}: RestTimerModalProps) {
  const [timeLeft, setTimeLeft] = useState(defaultSeconds);
  const [total, setTotal] = useState(defaultSeconds);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const circumference = 2 * Math.PI * RADIUS;
  const progress = total > 0 ? 1 - timeLeft / total : 0;
  const strokeDashoffset = circumference * (1 - progress);

  async function triggerFinishAlert() {
    if (alertMode === 'silent') return;

    if (alertMode === 'soft') {
      await triggerImpactHaptic('light');
      return;
    }

    await triggerNotificationHaptic('success');

    if (alertMode === 'strong') {
      Vibration.vibrate([0, 180, 80, 180]);
      return;
    }

    Vibration.vibrate([0, 220, 60, 220, 60, 220]);
  }

  useEffect(() => {
    if (visible) {
      setTimeLeft(defaultSeconds);
      setTotal(defaultSeconds);
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            if (intervalRef.current) clearInterval(intervalRef.current);
            void triggerFinishAlert();
            return 0;
          }

          if (prev <= 4 && alertMode !== 'silent') {
            void triggerImpactHaptic('light');
          }

          return prev - 1;
        });
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [alertMode, defaultSeconds, visible]);

  function adjust(delta: number) {
    setTimeLeft((prev) => Math.max(5, Math.min(300, prev + delta)));
    setTotal((prev) => Math.max(5, Math.min(300, prev + delta)));
  }

  function formatTime(value: number) {
    return `${Math.floor(value / 60)}:${String(value % 60).padStart(2, '0')}`;
  }

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Text style={styles.title}>Descanso</Text>

          <View style={styles.circleWrapper}>
            <Svg width={200} height={200} viewBox="0 0 200 200">
              <Circle
                cx={100}
                cy={100}
                r={RADIUS}
                stroke={Colors.bgElevated}
                strokeWidth={12}
                fill="none"
              />
              <Circle
                cx={100}
                cy={100}
                r={RADIUS}
                stroke={Colors.workout}
                strokeWidth={12}
                fill="none"
                strokeDasharray={`${circumference} ${circumference}`}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                rotation="-90"
                origin="100,100"
              />
            </Svg>

            <View
              style={styles.circleCenter}
              accessible
              accessibilityLabel={`Quedan ${timeLeft} segundos de descanso`}
            >
              <Text style={styles.timeText}>{formatTime(timeLeft)}</Text>
              <Text style={styles.timeLabel}>restantes</Text>
            </View>
          </View>

          <View style={styles.controls}>
            <Pressable
              style={styles.adjustBtn}
              onPress={() => adjust(-15)}
              accessibilityRole="button"
              accessibilityLabel="Restar 15 segundos"
            >
              <Text style={styles.adjustBtnText}>-15s</Text>
            </Pressable>

            <Pressable
              style={[styles.adjustBtn, styles.adjustBtnSkip]}
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel="Saltar descanso"
            >
              <Text style={[styles.adjustBtnText, styles.adjustBtnSkipText]}>Saltar</Text>
            </Pressable>

            <Pressable
              style={styles.adjustBtn}
              onPress={() => adjust(15)}
              accessibilityRole="button"
              accessibilityLabel="Sumar 15 segundos"
            >
              <Text style={styles.adjustBtnText}>+15s</Text>
            </Pressable>
          </View>

          {timeLeft === 0 ? (
            <Pressable
              style={styles.goBtn}
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel="Ir al siguiente set"
            >
              <Text style={styles.goBtnText}>Ir al siguiente set</Text>
            </Pressable>
          ) : null}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: withOpacity(Colors.black, 0.4),
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  container: {
    width: '100%',
    gap: Spacing[5],
    alignItems: 'center',
    backgroundColor: Colors.bgSurface,
    borderTopLeftRadius: Radius['2xl'],
    borderTopRightRadius: Radius['2xl'],
    padding: Spacing[6],
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
    alignItems: 'center',
    justifyContent: 'center',
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
    backgroundColor: withOpacity(Colors.workout, 0.12),
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
    color: Colors.white,
  },
});

export default RestTimerModal;
