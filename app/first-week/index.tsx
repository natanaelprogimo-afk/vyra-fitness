// app/first-week/index.tsx
import React, { useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import LottieView from 'lottie-react-native';
import { Colors } from '@/constants/colors';
import { useFirstWeek, FIRST_WEEK_TASKS } from '@/hooks/useFirstWeek';
import Skeleton from '@/components/ui/Skeleton';
import type { FirstWeekTask } from '@/types/user';

// ─── EMOJIS DE DÍA ───────────────────────────────────────────────────────────

const DAY_EMOJIS = ['🌱', '🍽️', '🚶', '⏳', '💪', '🤖', '🏆'];

// ─── COLORES DE MÓDULO ────────────────────────────────────────────────────────

const MODULE_COLORS: Record<string, string> = {
  checkin:   Colors.brand,
  nutrition: Colors.nutrition,
  steps:     Colors.steps,
  fasting:   Colors.fasting,
  workout:   Colors.workout,
  coach:     Colors.mental,
  progress:  Colors.weight,
};

// ─── COMPONENTE DÍA INDICADOR ─────────────────────────────────────────────────

interface DayDotProps {
  day:       number; // 1-based
  completed: boolean;
  isCurrent: boolean;
  isPast:    boolean;
}

function DayDot({ day, completed, isCurrent, isPast }: DayDotProps) {
  const color = completed
    ? Colors.steps
    : isCurrent
    ? Colors.brand
    : isPast
    ? Colors.error    // pasado sin completar
    : Colors.bgElevated;

  return (
    <View style={styles.dayDotWrapper}>
      <View
        style={[
          styles.dayDot,
          { backgroundColor: color, borderColor: isCurrent ? Colors.brand : 'transparent' },
          isCurrent && styles.dayDotCurrent,
        ]}
      >
        {completed ? (
          <Text style={styles.dayDotCheck}>✓</Text>
        ) : (
          <Text style={[styles.dayDotNumber, !isCurrent && !isPast && { color: Colors.textMuted }]}>
            {day}
          </Text>
        )}
      </View>
      {day < 7 && (
        <View
          style={[
            styles.dayLine,
            { backgroundColor: completed ? Colors.steps : Colors.bgElevated },
          ]}
        />
      )}
    </View>
  );
}

// ─── COMPONENTE TAREA ────────────────────────────────────────────────────────

interface TaskCardProps {
  task:       FirstWeekTask;
  isCurrent:  boolean;
  onComplete: (day: number) => void;
}

function TaskCard({ task, isCurrent, onComplete }: TaskCardProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const color     = MODULE_COLORS[task.module] ?? Colors.brand;
  const emoji     = DAY_EMOJIS[task.day - 1];

  const handlePress = useCallback(() => {
    if (task.completed) return;

    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 0.96, duration: 80, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1,    duration: 80, useNativeDriver: true }),
    ]).start();

    router.push(task.action as any);
  }, [task, scaleAnim]);

  const handleMarkDone = useCallback(() => {
    Alert.alert(
      '¿Completaste esta tarea?',
      `Marca el Día ${task.day} como completado y recibís ${task.coinReward} 🪙`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: '¡Sí, completé!',
          onPress: () => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            onComplete(task.day);
          },
        },
      ]
    );
  }, [task, onComplete]);

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <View
        style={[
          styles.taskCard,
          task.completed && styles.taskCardCompleted,
          isCurrent && styles.taskCardCurrent,
          { borderLeftColor: color },
        ]}
      >
        {/* Header */}
        <View style={styles.taskHeader}>
          <View style={[styles.taskDayBadge, { backgroundColor: color + '22' }]}>
            <Text style={[styles.taskDayLabel, { color }]}>Día {task.day}</Text>
          </View>
          {task.completed && (
            <View style={styles.completedBadge}>
              <Text style={styles.completedBadgeText}>✓ Completado</Text>
            </View>
          )}
          {isCurrent && !task.completed && (
            <View style={styles.currentBadge}>
              <Text style={styles.currentBadgeText}>🔥 Hoy</Text>
            </View>
          )}
        </View>

        {/* Body */}
        <View style={styles.taskBody}>
          <Text style={styles.taskEmoji}>{emoji}</Text>
          <View style={styles.taskTextContainer}>
            <Text
              style={[
                styles.taskTitle,
                task.completed && styles.taskTitleCompleted,
              ]}
            >
              {task.title}
            </Text>
            <Text style={styles.taskDescription}>{task.description}</Text>
          </View>
        </View>

        {/* Footer con recompensa */}
        <View style={styles.taskFooter}>
          <View style={styles.rewardRow}>
            <Text style={styles.rewardText}>+{task.coinReward} 🪙</Text>
            <Text style={styles.rewardSeparator}>·</Text>
            <Text style={styles.rewardText}>+{task.xpReward} XP</Text>
          </View>

          {/* Botones solo si es actual y no completado */}
          {isCurrent && !task.completed && (
            <View style={styles.taskButtons}>
              <TouchableOpacity
                style={[styles.taskBtn, styles.taskBtnSecondary]}
                onPress={handleMarkDone}
              >
                <Text style={styles.taskBtnSecondaryText}>Ya lo hice</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.taskBtn, { backgroundColor: color }]}
                onPress={handlePress}
              >
                <Text style={styles.taskBtnText}>Ir al módulo →</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </Animated.View>
  );
}

// ─── PANTALLA CELEBRACIÓN DÍA 7 ─────────────────────────────────────────────

function CompletionCelebration() {
  return (
    <View style={styles.celebrationContainer}>
      <LottieView
        source={require('@/assets/lottie/celebration.json')}
        autoPlay
        loop={false}
        style={styles.celebrationLottie}
      />
      <Text style={styles.celebrationEmoji}>🏆</Text>
      <Text style={styles.celebrationTitle}>¡Primera semana completada!</Text>
      <Text style={styles.celebrationSubtitle}>
        7 días de hábitos saludables. Ya tenés una historia. Ahora esto es tuyo.
      </Text>
      <View style={styles.celebrationReward}>
        <Text style={styles.celebrationRewardText}>+200 🪙 · Badge desbloqueado</Text>
      </View>
      <TouchableOpacity
        style={styles.celebrationBtn}
        onPress={() => router.push('/(tabs)' as any)}
      >
        <Text style={styles.celebrationBtnText}>Continuar con Vyra 🚀</Text>
      </TouchableOpacity>
    </View>
  );
}

// ─── PANTALLA PRINCIPAL ──────────────────────────────────────────────────────

export default function FirstWeekScreen() {
  const {
    tasks,
    currentDayIndex,
    isCompleted,
    isActive,
    daysElapsed,
    completedCount,
    completeTask,
    isLoading,
  } = useFirstWeek();

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Skeleton width={200} height={24} borderRadius={6} />
          <Skeleton width={300} height={16} borderRadius={6} style={{ marginTop: 8 }} />
        </View>
        {[1, 2, 3].map(i => (
          <Skeleton key={i} width="100%" height={120} borderRadius={16} style={{ marginBottom: 12 }} />
        ))}
      </SafeAreaView>
    );
  }

  if (isCompleted) {
    return (
      <SafeAreaView style={styles.container}>
        <CompletionCelebration />
      </SafeAreaView>
    );
  }

  const progressPct = (completedCount / 7) * 100;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backBtnText}>← Volver</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Primera semana</Text>
          <Text style={styles.subtitle}>
            {isActive
              ? `Día ${daysElapsed + 1} de 7 — ${completedCount} tarea${completedCount !== 1 ? 's' : ''} completada${completedCount !== 1 ? 's' : ''}`
              : `${completedCount} de 7 tareas completadas`}
          </Text>
        </View>

        {/* Barra de progreso */}
        <View style={styles.progressContainer}>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${progressPct}%` }]} />
          </View>
          <Text style={styles.progressLabel}>{Math.round(progressPct)}%</Text>
        </View>

        {/* Indicadores de día */}
        <View style={styles.dayDotsRow}>
          {FIRST_WEEK_TASKS.map((task, i) => (
            <DayDot
              key={task.day}
              day={task.day}
              completed={tasks[i]?.completed ?? false}
              isCurrent={i === currentDayIndex && isActive}
              isPast={i < currentDayIndex}
            />
          ))}
        </View>

        {/* Tarea de hoy (destacada) */}
        {isActive && tasks[currentDayIndex] && !tasks[currentDayIndex].completed && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>📍 Tu tarea de hoy</Text>
            <TaskCard
              task={tasks[currentDayIndex]}
              isCurrent
              onComplete={completeTask}
            />
          </View>
        )}

        {/* Todas las tareas */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Todas las tareas</Text>
          {tasks.map((task, i) => (
            <TaskCard
              key={task.day}
              task={task}
              isCurrent={i === currentDayIndex && isActive && !task.completed}
              onComplete={completeTask}
            />
          ))}
        </View>

        {/* Nota motivacional */}
        <View style={styles.motivationalNote}>
          <Text style={styles.motivationalText}>
            💡 Completar cada tarea desbloquea un badge exclusivo y te da monedas para canjear en la tienda.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── ESTILOS ─────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex:            1,
    backgroundColor: Colors.bgPrimary,
  },
  scroll: {
    padding:    20,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 20,
  },
  backBtn: {
    marginBottom: 12,
  },
  backBtnText: {
    color:    Colors.brand,
    fontSize: 14,
  },
  title: {
    color:      Colors.textPrimary,
    fontSize:   26,
    fontWeight: '800',
    marginBottom: 4,
  },
  subtitle: {
    color:    Colors.textSecondary,
    fontSize: 14,
  },

  // Progreso
  progressContainer: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           10,
    marginBottom:  24,
  },
  progressTrack: {
    flex:            1,
    height:          8,
    backgroundColor: Colors.bgElevated,
    borderRadius:    4,
    overflow:        'hidden',
  },
  progressFill: {
    height:          '100%',
    backgroundColor: Colors.brand,
    borderRadius:    4,
  },
  progressLabel: {
    color:      Colors.brand,
    fontSize:   14,
    fontWeight: '700',
    width:      40,
    textAlign:  'right',
  },

  // Day dots
  dayDotsRow: {
    flexDirection: 'row',
    alignItems:    'center',
    marginBottom:  28,
  },
  dayDotWrapper: {
    flexDirection: 'row',
    alignItems:    'center',
    flex:          1,
  },
  dayDot: {
    width:          32,
    height:         32,
    borderRadius:   16,
    alignItems:     'center',
    justifyContent: 'center',
  },
  dayDotCurrent: {
    borderWidth: 2,
    borderColor: Colors.brand,
  },
  dayDotCheck: {
    color:      '#FFFFFF',
    fontSize:   14,
    fontWeight: '700',
  },
  dayDotNumber: {
    color:      Colors.textPrimary,
    fontSize:   13,
    fontWeight: '600',
  },
  dayLine: {
    flex:   1,
    height: 2,
  },

  // Secciones
  section: {
    marginBottom: 24,
  },
  sectionLabel: {
    color:        Colors.textSecondary,
    fontSize:     13,
    fontWeight:   '600',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 12,
  },

  // Task card
  taskCard: {
    backgroundColor: Colors.bgSurface,
    borderRadius:    16,
    padding:         16,
    marginBottom:    12,
    borderLeftWidth: 4,
    borderLeftColor: Colors.brand,
  },
  taskCardCompleted: {
    opacity: 0.65,
  },
  taskCardCurrent: {
    backgroundColor: Colors.bgElevated,
    shadowColor:     Colors.brand,
    shadowOpacity:   0.2,
    shadowRadius:    12,
    elevation:       4,
  },
  taskHeader: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           8,
    marginBottom:  12,
  },
  taskDayBadge: {
    paddingHorizontal: 8,
    paddingVertical:   3,
    borderRadius:      8,
  },
  taskDayLabel: {
    fontSize:   12,
    fontWeight: '700',
  },
  completedBadge: {
    backgroundColor: Colors.steps + '22',
    paddingHorizontal: 8,
    paddingVertical:   3,
    borderRadius:      8,
  },
  completedBadgeText: {
    color:      Colors.steps,
    fontSize:   12,
    fontWeight: '600',
  },
  currentBadge: {
    backgroundColor: Colors.fasting + '22',
    paddingHorizontal: 8,
    paddingVertical:   3,
    borderRadius:      8,
  },
  currentBadgeText: {
    color:      Colors.fasting,
    fontSize:   12,
    fontWeight: '600',
  },
  taskBody: {
    flexDirection: 'row',
    gap:           12,
    marginBottom:  12,
  },
  taskEmoji: {
    fontSize: 32,
  },
  taskTextContainer: {
    flex: 1,
  },
  taskTitle: {
    color:        Colors.textPrimary,
    fontSize:     16,
    fontWeight:   '700',
    marginBottom: 4,
  },
  taskTitleCompleted: {
    textDecorationLine: 'line-through',
    color:              Colors.textMuted,
  },
  taskDescription: {
    color:      Colors.textSecondary,
    fontSize:   13,
    lineHeight: 18,
  },
  taskFooter: {
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop:     10,
    gap:            10,
  },
  rewardRow: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           6,
  },
  rewardText: {
    color:      Colors.coins,
    fontSize:   13,
    fontWeight: '600',
  },
  rewardSeparator: {
    color:    Colors.textMuted,
    fontSize: 13,
  },
  taskButtons: {
    flexDirection: 'row',
    gap:           8,
  },
  taskBtn: {
    flex:             1,
    paddingVertical:  10,
    borderRadius:     10,
    alignItems:       'center',
  },
  taskBtnSecondary: {
    backgroundColor: Colors.bgElevated,
    borderWidth:     1,
    borderColor:     Colors.border,
  },
  taskBtnSecondaryText: {
    color:      Colors.textSecondary,
    fontSize:   14,
    fontWeight: '600',
  },
  taskBtnText: {
    color:      '#FFFFFF',
    fontSize:   14,
    fontWeight: '700',
  },

  // Motivacional
  motivationalNote: {
    backgroundColor: Colors.bgSurface,
    borderRadius:    12,
    padding:         14,
    borderWidth:     1,
    borderColor:     Colors.border,
  },
  motivationalText: {
    color:      Colors.textSecondary,
    fontSize:   13,
    lineHeight: 18,
  },

  // Celebración
  celebrationContainer: {
    flex:            1,
    alignItems:      'center',
    justifyContent:  'center',
    padding:         32,
  },
  celebrationLottie: {
    width:    200,
    height:   200,
    position: 'absolute',
    top:      0,
  },
  celebrationEmoji: {
    fontSize:     64,
    marginBottom: 16,
    marginTop:    180,
  },
  celebrationTitle: {
    color:        Colors.textPrimary,
    fontSize:     28,
    fontWeight:   '800',
    textAlign:    'center',
    marginBottom: 12,
  },
  celebrationSubtitle: {
    color:        Colors.textSecondary,
    fontSize:     15,
    textAlign:    'center',
    lineHeight:   22,
    marginBottom: 24,
  },
  celebrationReward: {
    backgroundColor:   Colors.coins + '22',
    paddingHorizontal: 20,
    paddingVertical:   10,
    borderRadius:      20,
    marginBottom:      32,
  },
  celebrationRewardText: {
    color:      Colors.coins,
    fontSize:   16,
    fontWeight: '700',
  },
  celebrationBtn: {
    backgroundColor: Colors.brand,
    paddingHorizontal: 32,
    paddingVertical:   16,
    borderRadius:      16,
  },
  celebrationBtnText: {
    color:      '#FFFFFF',
    fontSize:   17,
    fontWeight: '700',
  },
});