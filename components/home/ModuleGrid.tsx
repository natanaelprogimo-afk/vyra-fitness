import React, { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Colors, withOpacity } from '@/constants/colors';
import { FontFamily, FontSize, Radius, Spacing } from '@/constants/theme';
import { Modules } from '@/constants/modules';
import type { ModuleId } from '@/constants/modules';
import { triggerImpactHaptic } from '@/lib/haptics';
import { visibleProgressPercent } from '@/lib/visual-progress';

export interface ModuleProgress {
  water?: { current: number; goal: number };
  steps?: { current: number; goal: number };
  fasting?: { isActive: boolean; hours: number; target: number };
  sleep?: { hours: number; quality: number };
  nutrition?: { calories: number; goal: number };
  weight?: { lastKg: number | null };
  workout?: { done: boolean; setsToday: number };
  mental?: { done: boolean; mood: number | null };
  supplements?: { taken: number; total: number };
}

interface ModuleGridProps {
  progress?: ModuleProgress;
  activeModules?: ModuleId[];
}

type ModuleStatus = {
  value: string;
  detail: string | null;
  pct: number | null;
};

function formatModuleStatus(id: ModuleId, progress: ModuleProgress): ModuleStatus {
  switch (id) {
    case 'water': {
      const water = progress.water;
      if (!water) return { value: '0 ml', detail: 'Sin registros', pct: 0 };
      const pct = water.goal > 0 ? (water.current / water.goal) * 100 : 0;
      return {
        value: `${Math.round(water.current)}`,
        detail: `de ${Math.round(water.goal)} ml`,
        pct,
      };
    }
    case 'steps': {
      const steps = progress.steps;
      if (!steps) return { value: '0', detail: 'Pasos hoy', pct: 0 };
      const pct = steps.goal > 0 ? (steps.current / steps.goal) * 100 : 0;
      return {
        value: `${Math.round(steps.current)}`,
        detail: 'pasos',
        pct,
      };
    }
    case 'fasting': {
      const fasting = progress.fasting;
      if (!fasting || !fasting.isActive) return { value: 'Listo', detail: 'Sin ayuno activo', pct: null };
      const pct = fasting.target > 0 ? (fasting.hours / fasting.target) * 100 : 0;
      return {
        value: `${fasting.hours.toFixed(1)} h`,
        detail: `meta ${fasting.target} h`,
        pct,
      };
    }
    case 'sleep': {
      const sleep = progress.sleep;
      if (!sleep) return { value: '--', detail: 'Sin sueño', pct: null };
      return {
        value: `${sleep.hours.toFixed(1)} h`,
        detail: sleep.quality >= 80 ? 'buen cierre' : 'anoche',
        pct: Math.min(100, (sleep.hours / 8) * 100),
      };
    }
    case 'nutrition': {
      const nutrition = progress.nutrition;
      if (!nutrition) return { value: '0', detail: 'kcal', pct: 0 };
      const pct = nutrition.goal > 0 ? (nutrition.calories / nutrition.goal) * 100 : 0;
      return {
        value: `${Math.round(nutrition.calories)}`,
        detail: nutrition.goal > 0 ? `de ${Math.round(nutrition.goal)} kcal` : 'kcal',
        pct,
      };
    }
    case 'weight': {
      const weight = progress.weight?.lastKg;
      return {
        value: weight != null ? `${weight.toFixed(1)} kg` : '--',
        detail: 'último peso',
        pct: null,
      };
    }
    case 'workout': {
      const workout = progress.workout;
      if (!workout?.done) return { value: 'Pendiente', detail: 'sin sesión', pct: null };
      return {
        value: `${workout.setsToday}`,
        detail: 'series hoy',
        pct: 100,
      };
    }
    case 'mental': {
      const mental = progress.mental;
      if (!mental?.done) return { value: 'Pendiente', detail: 'check-in', pct: null };
      return {
        value: mental.mood ? `Ánimo ${mental.mood}/5` : 'Hecho',
        detail: 'resumen',
        pct: 100,
      };
    }
    case 'supplements': {
      const supplements = progress.supplements;
      if (!supplements || supplements.total === 0) {
        return { value: '--', detail: 'sin pauta', pct: null };
      }
      const pct = (supplements.taken / supplements.total) * 100;
      return {
        value: `${supplements.taken}/${supplements.total}`,
        detail: 'tomados',
        pct,
      };
    }
    default:
      return { value: '--', detail: null, pct: null };
  }
}

export function ModuleGrid({ progress = {}, activeModules }: ModuleGridProps) {
  const visibleModules = activeModules?.length ? activeModules : (Modules.map((item) => item.id) as ModuleId[]);

  return (
    <View style={styles.grid}>
      {visibleModules.map((moduleId) => {
        const module = Modules.find((item) => item.id === moduleId);
        if (!module) return null;

        const status = formatModuleStatus(moduleId, progress);

        return (
          <Pressable
            key={module.id}
            onPress={() => {
              void triggerImpactHaptic('light');
              router.push(module.route as never);
            }}
            accessibilityRole="button"
            accessibilityLabel={`${module.shortName ?? module.name}: ${status.value}${status.detail ? `, ${status.detail}` : ''}`}
            accessibilityHint={`Abre el modulo de ${module.name}.`}
            hitSlop={8}
            style={[
              styles.cell,
              {
                borderColor: withOpacity(module.color, 0.18),
                backgroundColor: Colors.surface1,
              },
            ]}
          >
            <View style={styles.cellHeader}>
              <View style={[styles.iconWrap, { backgroundColor: withOpacity(module.color, 0.16) }]}>
                <Text style={styles.emoji}>{module.emoji}</Text>
              </View>
              <Text style={styles.moduleName}>
                {module.shortName ?? module.name}
              </Text>
            </View>

            <Text style={styles.metricValue} numberOfLines={1}>
              {status.value}
            </Text>
            {status.detail ? (
              <Text style={styles.metricDetail} numberOfLines={1}>
                {status.detail}
              </Text>
            ) : null}

            {status.pct !== null ? (
              <View style={styles.track}>
                <View
                  style={[
                    styles.fill,
                    {
                      width: `${visibleProgressPercent(status.pct)}%`,
                      backgroundColor: module.color,
                    },
                  ]}
                />
              </View>
            ) : null}
          </Pressable>
        );
      })}
    </View>
  );
}

export default memo(ModuleGrid);

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing[3],
  },
  cell: {
    width: '49%',
    minHeight: 88,
    borderWidth: 1,
    borderRadius: Radius.xl,
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[3],
    justifyContent: 'space-between',
    gap: 4,
  },
  cellHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[2],
  },
  iconWrap: {
    width: 24,
    height: 24,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: {
    fontSize: 12,
  },
  moduleName: {
    flex: 1,
    fontFamily: FontFamily.medium,
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
  },
  metricValue: {
    fontFamily: FontFamily.display,
    fontSize: 18,
    lineHeight: 20,
    color: Colors.textPrimary,
  },
  metricDetail: {
    fontFamily: FontFamily.regular,
    fontSize: 11,
    color: Colors.textMuted,
  },
  track: {
    marginTop: 4,
    height: 2,
    borderRadius: Radius.full,
    backgroundColor: withOpacity(Colors.white, 0.08),
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: Radius.full,
  },
});
