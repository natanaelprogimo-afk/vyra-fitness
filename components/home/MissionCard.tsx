// components/home/MissionCard.tsx
// Banner que aparece en el Dashboard durante los primeros 7 días desde el registro.
// Se oculta automáticamente al completar la primera semana o pasados los 7 días.

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { router } from 'expo-router';
import { Colors } from '@/constants/colors';
import { useFirstWeek } from '@/hooks/useFirstWeek';

export function MissionCard() {
  const { isActive, isCompleted, completedCount, todayTask, currentDayIndex } =
    useFirstWeek();

  // No mostrar si ya pasaron los 7 días o si están todos completos
  if (!isActive || isCompleted) return null;

  const progressPct   = (completedCount / 7) * 100;
  const dayLabel      = `Día ${currentDayIndex + 1} de 7`;
  const taskTitle     = todayTask?.title ?? 'Primera semana guiada';

  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.85}
      onPress={() => router.push('/first-week' as any)}
    >
      {/* Barra de progreso superior */}
      <View style={styles.progressTrack}>
        <Animated.View style={[styles.progressFill, { width: `${progressPct}%` }]} />
      </View>

      {/* Contenido */}
      <View style={styles.content}>
        <View style={styles.left}>
          <View style={styles.dayBadge}>
            <Text style={styles.dayBadgeText}>{dayLabel}</Text>
          </View>
          <Text style={styles.title} numberOfLines={1}>
            {taskTitle}
          </Text>
          <Text style={styles.subtitle}>
            {completedCount} de 7 tareas completadas
          </Text>
        </View>

        <View style={styles.right}>
          {/* Puntos de días */}
          <View style={styles.dots}>
            {Array.from({ length: 7 }).map((_, i) => (
              <View
                key={i}
                style={[
                  styles.dot,
                  i < completedCount    && styles.dotCompleted,
                  i === currentDayIndex && styles.dotCurrent,
                ]}
              />
            ))}
          </View>
          <Text style={styles.arrow}>→</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.bgSurface,
    borderRadius:    16,
    marginHorizontal: 16,
    marginBottom:    12,
    overflow:        'hidden',
    borderWidth:     1,
    borderColor:     Colors.brand + '44',
  },
  progressTrack: {
    height:          3,
    backgroundColor: Colors.bgElevated,
  },
  progressFill: {
    height:          '100%',
    backgroundColor: Colors.brand,
  },
  content: {
    flexDirection:   'row',
    alignItems:      'center',
    justifyContent:  'space-between',
    padding:         14,
    gap:             12,
  },
  left: {
    flex: 1,
    gap:  4,
  },
  dayBadge: {
    backgroundColor:   Colors.brand + '22',
    paddingHorizontal: 8,
    paddingVertical:   2,
    borderRadius:      8,
    alignSelf:         'flex-start',
  },
  dayBadgeText: {
    color:      Colors.brand,
    fontSize:   11,
    fontWeight: '700',
  },
  title: {
    color:      Colors.textPrimary,
    fontSize:   14,
    fontWeight: '700',
  },
  subtitle: {
    color:    Colors.textSecondary,
    fontSize: 12,
  },
  right: {
    alignItems: 'center',
    gap:        8,
  },
  dots: {
    flexDirection: 'row',
    gap:           4,
  },
  dot: {
    width:           7,
    height:          7,
    borderRadius:    4,
    backgroundColor: Colors.bgElevated,
  },
  dotCompleted: {
    backgroundColor: Colors.steps,
  },
  dotCurrent: {
    backgroundColor: Colors.brand,
    width:           10,
    height:          10,
    borderRadius:    5,
  },
  arrow: {
    color:    Colors.brand,
    fontSize: 16,
  },
});

export default MissionCard;