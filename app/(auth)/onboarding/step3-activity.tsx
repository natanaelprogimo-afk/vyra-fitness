import { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import * as Haptics from 'expo-haptics';
import SafeScreen from '@/components/ui/SafeScreen';
import Button from '@/components/ui/Button';
import { OnboardingProgress } from './step1-goals';
import { Colors } from '@/constants/colors';
import { FontSize, FontFamily, Spacing, Radius } from '@/constants/theme';
import type { ActivityLevel } from '@/types/user';
import type { ModuleId } from '@/constants/modules';

const LEVELS: { id: ActivityLevel; emoji: string; label: string; desc: string }[] = [
  { id: 0, emoji: '🛋️', label: 'Sedentario', desc: 'Casi sin actividad' },
  { id: 1, emoji: '🚶', label: 'Muy poco activo', desc: '1-2 dias/semana' },
  { id: 2, emoji: '🏃', label: 'Algo activo', desc: '3 dias/semana' },
  { id: 3, emoji: '🏋️', label: 'Moderadamente activo', desc: '4-5 dias/semana' },
  { id: 4, emoji: '🚴', label: 'Muy activo', desc: '6-7 dias/semana' },
  { id: 5, emoji: '⚡', label: 'Atleta', desc: 'Multiples sesiones al dia' },
];

const EQUIPMENT: { id: string; emoji: string; label: string }[] = [
  { id: 'gym', emoji: '🏋️', label: 'Gimnasio' },
  { id: 'home', emoji: '🏠', label: 'En casa' },
  { id: 'both', emoji: '🔁', label: 'Ambos' },
  { id: 'outside', emoji: '🌳', label: 'Aire libre' },
  { id: 'none', emoji: '❌', label: 'Aun no entreno' },
];

const MODULE_CHOICES: Array<{ id: ModuleId; emoji: string; label: string }> = [
  { id: 'water', emoji: '💧', label: 'Hidratación' },
  { id: 'sleep', emoji: '😴', label: 'Sueño' },
  { id: 'nutrition', emoji: '🍎', label: 'Nutrición' },
  { id: 'steps', emoji: '🚶', label: 'Pasos' },
  { id: 'workout', emoji: '💪', label: 'Entrenamiento' },
  { id: 'weight', emoji: '⚖️', label: 'Peso' },
  { id: 'mental', emoji: '🧠', label: 'Salud mental' },
  { id: 'fasting', emoji: '⏳', label: 'Ayuno' },
  { id: 'supplements', emoji: '💊', label: 'Suplementos' },
  { id: 'female', emoji: '🌸', label: 'Salud femenina' },
];

function defaultModulesByGoal(goal?: string): ModuleId[] {
  switch (goal) {
    case 'gain_muscle':
      return ['workout', 'nutrition', 'sleep', 'water', 'steps', 'weight'];
    case 'sport_performance':
      return ['workout', 'sleep', 'steps', 'water', 'nutrition', 'mental'];
    case 'mental_wellbeing':
      return ['mental', 'sleep', 'water', 'steps', 'nutrition'];
    case 'lose_fat':
      return ['nutrition', 'weight', 'steps', 'water', 'sleep', 'mental'];
    default:
      return ['water', 'sleep', 'nutrition', 'steps', 'workout', 'mental'];
  }
}

export default function Step3Activity() {
  const params = useLocalSearchParams<{ goal?: string; active_modules?: string; activity?: string }>();
  const initialLevel = (() => {
    const value = Number(params.activity ?? 2);
    if (Number.isFinite(value) && value >= 0 && value <= 5) {
      return value as ActivityLevel;
    }
    return 2 as ActivityLevel;
  })();
  const [level, setLevel] = useState<ActivityLevel>(initialLevel);
  const [equip, setEquip] = useState('gym');
  const [activeModules, setActiveModules] = useState<ModuleId[]>(() => {
    if (params.active_modules) {
      const preset = params.active_modules
        .split(',')
        .map((value) => value.trim())
        .filter((value): value is ModuleId =>
          MODULE_CHOICES.some((module) => module.id === value),
        );
      if (preset.length > 0) return preset;
    }
    return defaultModulesByGoal(params.goal);
  });

  const toggleModule = (moduleId: ModuleId) => {
    setActiveModules((prev) => {
      if (prev.includes(moduleId)) {
        if (prev.length <= 3) return prev;
        return prev.filter((module) => module !== moduleId);
      }
      return [...prev, moduleId];
    });
  };

  const continueFast = () => {
    router.push({
      pathname: '/(auth)/onboarding/step5-premium',
      params: {
        ...params,
        activity: level.toString(),
        equipment: equip,
        active_modules: activeModules.join(','),
      },
    } as any);
  };

  const openAdvanced = () => {
    router.push({
      pathname: '/(auth)/onboarding/step4-schedule',
      params: {
        ...params,
        activity: level.toString(),
        equipment: equip,
        active_modules: activeModules.join(','),
      },
    } as any);
  };

  return (
    <SafeScreen scrollable>
      <OnboardingProgress step={3} total={4} />
      <Text style={styles.title}>Cuanto te moves hoy</Text>
      <Text style={styles.subtitle}>Esto define tus metas iniciales de pasos y energia.</Text>

      <View style={styles.levels}>
        {LEVELS.map((item) => (
          <Pressable
            key={item.id}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
              setLevel(item.id);
            }}
            style={[styles.levelCard, level === item.id && styles.levelCardActive]}
          >
            <Text style={styles.levelEmoji}>{item.emoji}</Text>
            <View style={styles.levelText}>
              <Text style={[styles.levelLabel, level === item.id && styles.levelLabelActive]}>
                {item.label}
              </Text>
              <Text style={styles.levelDesc}>{item.desc}</Text>
            </View>
            {level === item.id ? <Text style={styles.levelCheck}>✓</Text> : null}
          </Pressable>
        ))}
      </View>

      <Text style={[styles.subtitle, { marginBottom: Spacing[3] }]}>Donde entrenas</Text>
      <View style={styles.equipRow}>
        {EQUIPMENT.map((item) => (
          <Pressable
            key={item.id}
            onPress={() => setEquip(item.id)}
            style={[styles.equipBtn, equip === item.id && styles.equipBtnActive]}
          >
            <Text style={styles.equipEmoji}>{item.emoji}</Text>
            <Text style={[styles.equipLabel, equip === item.id && styles.equipLabelActive]}>
              {item.label}
            </Text>
          </Pressable>
        ))}
      </View>

      <Text style={[styles.subtitle, { marginBottom: Spacing[3] }]}>Elegi tus modulos activos</Text>
      <Text style={styles.modulesHint}>
        Elegi al menos 3. Solo vas a ver estos modulos en tu dashboard y registro rapido.
      </Text>
      <View style={styles.modulesRow}>
        {MODULE_CHOICES.map((item) => {
          const selected = activeModules.includes(item.id);
          return (
            <Pressable
              key={item.id}
              onPress={() => toggleModule(item.id)}
              style={[styles.moduleChip, selected && styles.moduleChipActive]}
            >
              <Text style={styles.moduleEmoji}>{item.emoji}</Text>
              <Text style={[styles.moduleLabel, selected && styles.moduleLabelActive]}>{item.label}</Text>
            </Pressable>
          );
        })}
      </View>

      <Button onPress={continueFast} variant="primary" fullWidth size="lg" style={styles.cta}>
        Terminar onboarding rapido
      </Button>
      <Button onPress={openAdvanced} variant="ghost" fullWidth>
        Configurar horarios y ayuno (opcional)
      </Button>
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  title: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize['2xl'],
    color: Colors.textPrimary,
    marginTop: Spacing[6],
    marginBottom: Spacing[2],
  },
  subtitle: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.base,
    color: Colors.textSecondary,
    marginBottom: Spacing[5],
  },
  levels: {
    gap: Spacing[2],
    marginBottom: Spacing[6],
  },
  levelCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[3],
    padding: Spacing[3],
    borderRadius: Radius.xl,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.bgSurface,
  },
  levelCardActive: {
    borderColor: Colors.brand,
    backgroundColor: `${Colors.brand}12`,
  },
  levelEmoji: {
    fontSize: 22,
  },
  levelText: {
    flex: 1,
  },
  levelLabel: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.sm,
    color: Colors.textPrimary,
  },
  levelLabelActive: {
    color: Colors.brand,
  },
  levelDesc: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    marginTop: 2,
  },
  levelCheck: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.base,
    color: Colors.brand,
  },
  equipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing[2],
    marginBottom: Spacing[6],
  },
  equipBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[1.5],
    paddingVertical: Spacing[2],
    paddingHorizontal: Spacing[3],
    borderRadius: Radius.full,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.bgSurface,
  },
  equipBtnActive: {
    borderColor: Colors.steps,
    backgroundColor: `${Colors.steps}15`,
  },
  equipEmoji: {
    fontSize: 14,
  },
  equipLabel: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  equipLabelActive: {
    color: Colors.steps,
  },
  modulesHint: {
    marginBottom: Spacing[2],
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    color: Colors.textMuted,
  },
  modulesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing[2],
    marginBottom: Spacing[6],
  },
  moduleChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[1.5],
    paddingVertical: Spacing[2],
    paddingHorizontal: Spacing[3],
    borderRadius: Radius.full,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.bgSurface,
  },
  moduleChipActive: {
    borderColor: Colors.brand,
    backgroundColor: `${Colors.brand}15`,
  },
  moduleEmoji: {
    fontSize: 14,
  },
  moduleLabel: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  moduleLabelActive: {
    color: Colors.brand,
  },
  cta: {
    marginBottom: Spacing[2],
  },
});
