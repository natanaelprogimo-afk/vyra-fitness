import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import SafeScreen from '@/components/ui/SafeScreen';
import { Header } from '@/components/layout/Header';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { Colors } from '@/constants/colors';
import { Spacing, Radius, FontFamily } from '@/constants/theme';
import { useWorkout } from '@/hooks/useWorkout';
import { RestTimerModal } from './components/RestTimerModal';
import { ExercisePickerModal } from './components/ExercisePickerModal';
import { PrBadge } from './components/PrBadge';

export default function WorkoutSessionScreen() {
  const { activeSession, exercises, addSet, finishSession, cancelSession, saving } = useWorkout();

  const [currentExercise, setCurrentExercise] = useState<{ id: string; name: string } | null>(null);
  const [reps, setReps] = useState('10');
  const [weight, setWeight] = useState('20');
  const [showRestTimer, setShowRestTimer] = useState(false);
  const [showExercisePicker, setShowExercisePicker] = useState(false);
  const [lastPr, setLastPr] = useState<string | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // Timer de sesión
  useEffect(() => {
    const interval = setInterval(() => {
      if (activeSession) {
        const sec = Math.floor(
          (Date.now() - activeSession.startedAt.getTime()) / 1000,
        );
        setElapsedSeconds(sec);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [activeSession]);

  // Animación PR
  const prScale = useSharedValue(0);
  const prStyle = useAnimatedStyle(() => ({
    transform: [{ scale: prScale.value }],
    opacity: prScale.value,
  }));

  const formatTime = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  const handleCompleteSet = useCallback(async () => {
    if (!currentExercise) {
      Alert.alert('Seleccioná un ejercicio primero');
      return;
    }
    const repsNum = parseInt(reps);
    const weightNum = parseFloat(weight.replace(',', '.'));
    if (isNaN(repsNum) || isNaN(weightNum) || repsNum < 1 || weightNum < 0) return;

    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

    const { isPr } = await addSet(currentExercise.id, currentExercise.name, repsNum, weightNum);

    if (isPr) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setLastPr(currentExercise.name);
      prScale.value = withSequence(
        withSpring(1.3, { damping: 5 }),
        withSpring(1.0, { damping: 8 }),
        withTiming(1, {}, () => {
          setTimeout(() => {
            prScale.value = withTiming(0, { duration: 500 });
          }, 2000);
        }),
      );
    }

    setShowRestTimer(true);
  }, [currentExercise, reps, weight, addSet]);

  const handleFinish = () => {
    Alert.alert(
      'Terminar entreno',
      `¿Terminás la sesión? Registraste ${activeSession?.sets.length ?? 0} sets.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Terminar',
          style: 'destructive',
          onPress: async () => {
            const summary = await finishSession();
            if (summary) {
              // Navegar a resumen pasando datos como params
              router.replace({
                pathname: '/modules/workout/summary',
                params: {
                  duration: summary.durationMin,
                  volume: summary.totalVolume,
                  sets: summary.setsCount,
                  prs: summary.prs.length,
                  name: summary.name,
                },
              } as any);
            }
          },
        },
      ],
    );
  };

  const handleCancel = () => {
    Alert.alert(
      'Cancelar entreno',
      '¿Cancelás esta sesión? Se perderán todos los sets registrados.',
      [
        { text: 'Seguir entrenando', style: 'cancel' },
        {
          text: 'Cancelar sesión',
          style: 'destructive',
          onPress: async () => {
            await cancelSession();
            router.back();
          },
        },
      ],
    );
  };

  // Sets del ejercicio actual en esta sesión
  const currentSets = activeSession?.sets.filter(
    (s) => s.exercise_id === currentExercise?.id,
  ) ?? [];

  return (
    <SafeScreen padHorizontal={false} padBottom>
      <Header
        title={activeSession?.name ?? 'Entreno'}
        showBack={false}
        color={Colors.workout}
        rightElement={
          <TouchableOpacity onPress={handleCancel} style={styles.cancelBtn}>
            <Text style={styles.cancelText}>✕</Text>
          </TouchableOpacity>
        }
      />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
        >
          {/* Timer + sets totales */}
          <View style={styles.sessionBar}>
            <Text style={styles.sessionTimer}>⏱ {formatTime(elapsedSeconds)}</Text>
            <Text style={styles.sessionSets}>
              {activeSession?.sets.length ?? 0} sets
            </Text>
          </View>

          {/* Badge PR animado */}
          {lastPr && (
            <Animated.View style={[styles.prBadge, prStyle]}>
              <Text style={styles.prBadgeText}>🏆 PR en {lastPr}!</Text>
            </Animated.View>
          )}

          {/* Selector de ejercicio */}
          <Card>
            <Text style={styles.fieldLabel}>Ejercicio</Text>
            <TouchableOpacity
              style={styles.exerciseSelector}
              onPress={() => setShowExercisePicker(true)}
            >
              <Text
                style={[
                  styles.exerciseSelectorText,
                  !currentExercise && styles.exerciseSelectorPlaceholder,
                ]}
              >
                {currentExercise?.name ?? 'Tocá para seleccionar'}
              </Text>
              <Text style={styles.exerciseSelectorArrow}>▼</Text>
            </TouchableOpacity>
          </Card>

          {/* Input reps y peso */}
          <Card style={styles.inputCard}>
            <View style={styles.inputRow}>
              <View style={styles.inputGroup}>
                <Text style={styles.fieldLabel}>Reps</Text>
                <View style={styles.numInputWrapper}>
                  <TouchableOpacity
                    style={styles.numBtn}
                    onPress={() =>
                      setReps((v) => String(Math.max(1, parseInt(v) - 1)))
                    }
                  >
                    <Text style={styles.numBtnText}>−</Text>
                  </TouchableOpacity>
                  <TextInput
                    style={styles.numInput}
                    value={reps}
                    onChangeText={setReps}
                    keyboardType="number-pad"
                    selectTextOnFocus
                  />
                  <TouchableOpacity
                    style={styles.numBtn}
                    onPress={() => setReps((v) => String(parseInt(v) + 1))}
                  >
                    <Text style={styles.numBtnText}>+</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.inputDivider} />

              <View style={styles.inputGroup}>
                <Text style={styles.fieldLabel}>Peso (kg)</Text>
                <View style={styles.numInputWrapper}>
                  <TouchableOpacity
                    style={styles.numBtn}
                    onPress={() =>
                      setWeight((v) =>
                        String(Math.max(0, parseFloat(v) - 2.5).toFixed(1)),
                      )
                    }
                  >
                    <Text style={styles.numBtnText}>−</Text>
                  </TouchableOpacity>
                  <TextInput
                    style={styles.numInput}
                    value={weight}
                    onChangeText={setWeight}
                    keyboardType="decimal-pad"
                    selectTextOnFocus
                  />
                  <TouchableOpacity
                    style={styles.numBtn}
                    onPress={() =>
                      setWeight((v) =>
                        String((parseFloat(v) + 2.5).toFixed(1)),
                      )
                    }
                  >
                    <Text style={styles.numBtnText}>+</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.completeSetBtn, saving && styles.completeSetBtnDisabled]}
              onPress={handleCompleteSet}
              disabled={saving}
              activeOpacity={0.8}
            >
              <Text style={styles.completeSetBtnText}>
                {saving ? '...' : '✓ COMPLETAR SET'}
              </Text>
            </TouchableOpacity>
          </Card>

          {/* Sets registrados para el ejercicio actual */}
          {currentSets.length > 0 && (
            <Card>
              <Text style={styles.sectionTitle}>Sets de {currentExercise?.name}</Text>
              <View style={styles.setsHeader}>
                <Text style={styles.setsHeaderText}>Set</Text>
                <Text style={styles.setsHeaderText}>Reps</Text>
                <Text style={styles.setsHeaderText}>Peso</Text>
                <Text style={styles.setsHeaderText}>PR</Text>
              </View>
              {currentSets.map((set, i) => (
                <View key={i} style={styles.setRow}>
                  <Text style={styles.setCell}>{set.set_number}</Text>
                  <Text style={styles.setCell}>{set.reps}</Text>
                  <Text style={styles.setCell}>{set.weight_kg} kg</Text>
                  <Text style={styles.setCell}>{set.is_pr ? '🏆' : '—'}</Text>
                </View>
              ))}
            </Card>
          )}

          {/* Botón terminar */}
          <Button
            label="Terminar entreno"
            onPress={handleFinish}
            color={Colors.workout}
            style={styles.finishBtn}
          />
        </ScrollView>
      </KeyboardAvoidingView>

      <RestTimerModal
        visible={showRestTimer}
        onClose={() => setShowRestTimer(false)}
      />

      <ExercisePickerModal
        visible={showExercisePicker}
        exercises={exercises}
        onSelect={(ex) => {
          setCurrentExercise({ id: ex.id, name: ex.name });
          setShowExercisePicker(false);
        }}
        onClose={() => setShowExercisePicker(false)}
      />
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingHorizontal: Spacing[5],
    paddingBottom: Spacing[10],
    paddingTop: Spacing[3],
    gap: Spacing[4],
  },
  cancelBtn: {
    padding: Spacing[2],
  },
  cancelText: {
    fontFamily: FontFamily.bold,
    fontSize: 20,
    color: Colors.textSecondary,
  },
  sessionBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: Colors.bgSurface,
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[3],
  },
  sessionTimer: {
    fontFamily: FontFamily.bold,
    fontSize: 18,
    color: Colors.workout,
  },
  sessionSets: {
    fontFamily: FontFamily.bold,
    fontSize: 18,
    color: Colors.textPrimary,
  },
  prBadge: {
    alignSelf: 'center',
    backgroundColor: `${Colors.coins}22`,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing[5],
    paddingVertical: Spacing[2],
    borderWidth: 2,
    borderColor: Colors.coins,
  },
  prBadgeText: {
    fontFamily: FontFamily.bold,
    fontSize: 18,
    color: Colors.coins,
  },
  fieldLabel: {
    fontFamily: FontFamily.medium,
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: Spacing[2],
  },
  exerciseSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.bgElevated,
    borderRadius: Radius.lg,
    padding: Spacing[4],
  },
  exerciseSelectorText: {
    flex: 1,
    fontFamily: FontFamily.bold,
    fontSize: 18,
    color: Colors.textPrimary,
  },
  exerciseSelectorPlaceholder: {
    color: Colors.textMuted,
    fontFamily: FontFamily.regular,
    fontSize: 16,
  },
  exerciseSelectorArrow: {
    color: Colors.textMuted,
    fontSize: 14,
  },
  inputCard: {
    gap: Spacing[4],
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[4],
  },
  inputGroup: {
    flex: 1,
  },
  inputDivider: {
    width: 1,
    height: 80,
    backgroundColor: Colors.border,
  },
  numInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.bgElevated,
    borderRadius: Radius.lg,
    overflow: 'hidden',
  },
  numBtn: {
    width: 44,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: `${Colors.workout}22`,
  },
  numBtnText: {
    fontFamily: FontFamily.bold,
    fontSize: 22,
    color: Colors.workout,
  },
  numInput: {
    flex: 1,
    fontFamily: FontFamily.bold,
    fontSize: 26,
    color: Colors.textPrimary,
    textAlign: 'center',
    paddingVertical: Spacing[2],
  },
  completeSetBtn: {
    backgroundColor: Colors.workout,
    borderRadius: Radius.xl,
    paddingVertical: Spacing[4],
    alignItems: 'center',
  },
  completeSetBtnDisabled: {
    opacity: 0.5,
  },
  completeSetBtnText: {
    fontFamily: FontFamily.bold,
    fontSize: 18,
    color: '#fff',
    letterSpacing: 1,
  },
  sectionTitle: {
    fontFamily: FontFamily.bold,
    fontSize: 16,
    color: Colors.textPrimary,
    marginBottom: Spacing[3],
  },
  setsHeader: {
    flexDirection: 'row',
    paddingBottom: Spacing[2],
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  setsHeaderText: {
    flex: 1,
    fontFamily: FontFamily.medium,
    fontSize: 13,
    color: Colors.textMuted,
    textAlign: 'center',
  },
  setRow: {
    flexDirection: 'row',
    paddingVertical: Spacing[2],
    borderBottomWidth: 1,
    borderBottomColor: `${Colors.border}50`,
  },
  setCell: {
    flex: 1,
    fontFamily: FontFamily.regular,
    fontSize: 15,
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  finishBtn: {
    marginTop: Spacing[2],
  },
});