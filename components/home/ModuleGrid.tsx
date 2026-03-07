// ============================================================
// VYRA FITNESS — ModuleGrid
// Grid de módulos con progreso en tiempo real
// ============================================================

import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { Colors } from '@/constants/colors';
import { FontSize, FontFamily, Spacing, Radius } from '@/constants/theme';
import { GridModules, Modules } from '@/constants/modules';
import type { ModuleId } from '@/constants/modules';

// Datos del día para cada módulo (se pasan como prop desde el dashboard)
export interface ModuleProgress {
  water?:    { current: number; goal: number };
  steps?:    { current: number; goal: number };
  fasting?:  { isActive: boolean; hours: number; target: number };
  sleep?:    { hours: number; quality: number };
  nutrition?:{ calories: number; goal: number };
  weight?:   { lastKg: number | null };
  workout?:  { done: boolean; setsToday: number };
  mental?:   { done: boolean; mood: number | null };
  supplements?:{ taken: number; total: number };
}

interface ModuleGridProps {
  progress?: ModuleProgress;
  activeModules?: ModuleId[];
}

export const ModuleGrid = ({ progress = {}, activeModules }: ModuleGridProps) => {
  const visibleModules = activeModules && activeModules.length > 0 ? activeModules : GridModules;

  return (
    <View style={styles.grid}>
      {visibleModules.map((id) => (
        <ModuleCell
          key={id}
          id={id}
          progress={progress}
        />
      ))}
    </View>
  );
};

function ModuleCell({ id, progress }: { id: ModuleId; progress: ModuleProgress }) {
  const found = Modules.find(m => m.id === id);
  const cfg = found ?? { id, name: id, emoji: '❓', color: Colors.brand, route: '/' };
  const cfgColorBg = `${cfg.color}22`;
  const scale = useSharedValue(1);
  const anim  = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  const handlePress = () => {
    scale.value = withSpring(0.93, { damping: 10 }, () => { scale.value = withSpring(1); });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    router.push(cfg.route as never);
  };

  const { pct, badge, statusText } = getModuleStatus(id, progress);

  return (
    <Animated.View style={[styles.cellWrap, anim]}>
      <Pressable onPress={handlePress} style={[styles.cell, { borderColor: `${cfg.color}33` }]}>
        {/* Background glow */}
        <View style={[styles.cellGlow, { backgroundColor: `${cfg.color}08` }]} />

        {/* Header */}
        <View style={styles.cellHeader}>
          <Text style={styles.cellEmoji}>{cfg.emoji}</Text>
          {badge !== null && (
            <View style={[styles.cellBadge, { backgroundColor: cfgColorBg }]}>
              <Text style={[styles.cellBadgeText, { color: cfg.color }]}>{badge}</Text>
            </View>
          )}
        </View>

        {/* Name */}
        <Text style={styles.cellName}>{cfg.name}</Text>

        {/* Status */}
        {statusText && (
          <Text style={[styles.cellStatus, { color: cfg.color }]} numberOfLines={1}>
            {statusText}
          </Text>
        )}

        {/* Progress bar */}
        {pct !== null && (
          <View style={styles.cellBarTrack}>
            <View
              style={[
                styles.cellBarFill,
                {
                  backgroundColor: cfg.color,
                  width:           `${Math.min(100, pct)}%`,
                },
              ]}
            />
          </View>
        )}
      </Pressable>
    </Animated.View>
  );
}

function getModuleStatus(id: ModuleId, p: ModuleProgress): {
  pct:        number | null;
  badge:      string | null;
  statusText: string | null;
} {
  switch (id) {
    case 'water': {
      const w = p.water;
      if (!w) return { pct: 0, badge: null, statusText: 'Sin logs' };
      const pct = (w.current / w.goal) * 100;
      return { pct, badge: pct >= 100 ? '✓' : null, statusText: `${w.current}/${w.goal}ml` };
    }
    case 'steps': {
      const s = p.steps;
      if (!s) return { pct: 0, badge: null, statusText: '0 pasos' };
      const pct = (s.current / s.goal) * 100;
      return { pct, badge: pct >= 100 ? '✓' : null, statusText: `${s.current.toLocaleString('es')} pasos` };
    }
    case 'fasting': {
      const f = p.fasting;
      if (!f || !f.isActive) return { pct: null, badge: null, statusText: 'Inactivo' };
      const pct = (f.hours / f.target) * 100;
      return { pct, badge: '🔥', statusText: `${f.hours.toFixed(1)}h` };
    }
    case 'sleep': {
      const s = p.sleep;
      if (!s) return { pct: null, badge: null, statusText: 'Sin log' };
      const pct = Math.min(100, (s.hours / 8) * 100);
      return { pct, badge: s.quality >= 80 ? '⭐' : null, statusText: `${s.hours.toFixed(1)}h` };
    }
    case 'nutrition': {
      const n = p.nutrition;
      if (!n) return { pct: 0, badge: null, statusText: '0 kcal' };
      const pct = (n.calories / n.goal) * 100;
      return { pct, badge: null, statusText: `${Math.round(n.calories)}kcal` };
    }
    case 'weight': {
      const w = p.weight;
      return { pct: null, badge: null, statusText: w?.lastKg ? `${w.lastKg}kg` : 'Sin log' };
    }
    case 'workout': {
      const w = p.workout;
      if (!w || !w.done) return { pct: null, badge: null, statusText: 'Sin entreno hoy' };
      return { pct: null, badge: '💪', statusText: `${w.setsToday} series` };
    }
    case 'mental': {
      const m = p.mental;
      if (!m || !m.done) return { pct: null, badge: null, statusText: 'Check-in pendiente' };
      return { pct: null, badge: '✓', statusText: m.mood ? `Ánimo ${m.mood}/5` : 'Hecho' };
    }
    case 'supplements': {
      const s = p.supplements;
      if (!s || s.total === 0) return { pct: null, badge: null, statusText: 'Sin suplementos' };
      const pct = (s.taken / s.total) * 100;
      return { pct, badge: pct >= 100 ? '✓' : null, statusText: `${s.taken}/${s.total}` };
    }
    default:
      return { pct: null, badge: null, statusText: null };
  }
}

const styles = StyleSheet.create({
  grid: {
    flexDirection:  'row',
    flexWrap:       'wrap',
    gap:            Spacing[3],
  },
  cellWrap: {
    width:  '31%',
  },
  cell: {
    backgroundColor: Colors.bgSurface,
    borderRadius:    Radius.xl,
    padding:         Spacing[3],
    borderWidth:     1,
    overflow:        'hidden',
    minHeight:       100,
  },
  cellGlow: {
    position:        'absolute',
    top:             0, left: 0, right: 0, bottom: 0,
    borderRadius:    Radius.xl,
  },
  cellHeader: {
    flexDirection:  'row',
    justifyContent: 'space-between',
    alignItems:     'flex-start',
    marginBottom:   Spacing[1.5],
  },
  cellEmoji: {
    fontSize: 22,
  },
  cellBadge: {
    paddingHorizontal: 5,
    paddingVertical:   1,
    borderRadius:      Radius.full,
  },
  cellBadgeText: {
    fontFamily: FontFamily.bold,
    fontSize:   10,
  },
  cellName: {
    fontFamily: FontFamily.semibold,
    fontSize:   FontSize.xs,
    color:      Colors.textSecondary,
    marginBottom: Spacing[1],
  },
  cellStatus: {
    fontFamily: FontFamily.bold,
    fontSize:   FontSize.xs,
    marginBottom: Spacing[1.5],
  },
  cellBarTrack: {
    height:          4,
    borderRadius:    2,
    backgroundColor: Colors.bgElevated,
    overflow:        'hidden',
    marginTop:       'auto',
  },
  cellBarFill: {
    height:       '100%',
    borderRadius: 2,
    minWidth:     4,
  },
});

export default ModuleGrid;
