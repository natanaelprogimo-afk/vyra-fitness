// ============================================================
// VYRA FITNESS — Onboarding Step 3: Actividad física
// ============================================================

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

const LEVELS: { id: ActivityLevel; emoji: string; label: string; desc: string }[] = [
  { id: 0, emoji: '🛋️', label: 'Sedentario',             desc: 'Casi sin actividad' },
  { id: 1, emoji: '🚶', label: 'Muy poco activo',         desc: '1-2 días/semana' },
  { id: 2, emoji: '🏃', label: 'Algo activo',             desc: '3 días/semana' },
  { id: 3, emoji: '🏋️', label: 'Moderadamente activo',   desc: '4-5 días/semana' },
  { id: 4, emoji: '🚴', label: 'Muy activo',              desc: '6-7 días/semana' },
  { id: 5, emoji: '⚡', label: 'Atleta',                  desc: 'Múltiples sesiones al día' },
];

const EQUIPMENT: { id: string; emoji: string; label: string }[] = [
  { id: 'gym',     emoji: '🏋️', label: 'Gimnasio'       },
  { id: 'home',    emoji: '🏠', label: 'En casa'         },
  { id: 'both',    emoji: '🔄', label: 'Ambos'           },
  { id: 'outside', emoji: '🌳', label: 'Al aire libre'   },
  { id: 'none',    emoji: '❌', label: 'No entreno aún'  },
];

export default function Step3Activity() {
  const params    = useLocalSearchParams();
  const [level,   setLevel]   = useState<ActivityLevel>(2);
  const [equip,   setEquip]   = useState('gym');

  const handleNext = () => {
    router.push({
      pathname: '/(auth)/onboarding/step4-schedule',
      params: { ...params, activity: level.toString(), equipment: equip },
    } as any);
  };

  return (
    <SafeScreen scrollable>
      <OnboardingProgress step={3} total={5} />
      <Text style={styles.title}>¿Cuánto te movés?</Text>
      <Text style={styles.subtitle}>Calibramos tus metas de pasos y calorías.</Text>

      <View style={styles.levels}>
        {LEVELS.map((l) => (
          <Pressable
            key={l.id}
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(()=>{}); setLevel(l.id); }}
            style={[styles.levelCard, level === l.id && styles.levelCardActive]}
          >
            <Text style={styles.levelEmoji}>{l.emoji}</Text>
            <View style={styles.levelText}>
              <Text style={[styles.levelLabel, level === l.id && styles.levelLabelActive]}>{l.label}</Text>
              <Text style={styles.levelDesc}>{l.desc}</Text>
            </View>
            {level === l.id && <Text style={styles.levelCheck}>✓</Text>}
          </Pressable>
        ))}
      </View>

      <Text style={[styles.subtitle, { marginBottom: Spacing[3] }]}>¿Dónde entrenás?</Text>
      <View style={styles.equipRow}>
        {EQUIPMENT.map((e) => (
          <Pressable
            key={e.id}
            onPress={() => setEquip(e.id)}
            style={[styles.equipBtn, equip === e.id && styles.equipBtnActive]}
          >
            <Text style={styles.equipEmoji}>{e.emoji}</Text>
            <Text style={[styles.equipLabel, equip === e.id && styles.equipLabelActive]}>{e.label}</Text>
          </Pressable>
        ))}
      </View>

      <Button onPress={handleNext} variant="primary" fullWidth size="lg" style={styles.cta}>
        Siguiente →
      </Button>
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  title:     { fontFamily: FontFamily.bold, fontSize: FontSize['2xl'], color: Colors.textPrimary, marginTop: Spacing[6], marginBottom: Spacing[2] },
  subtitle:  { fontFamily: FontFamily.regular, fontSize: FontSize.base, color: Colors.textSecondary, marginBottom: Spacing[5] },
  levels:    { gap: Spacing[2], marginBottom: Spacing[6] },
  levelCard: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing[3],
    padding: Spacing[3], borderRadius: Radius.xl,
    borderWidth: 1.5, borderColor: Colors.border, backgroundColor: Colors.bgSurface,
  },
  levelCardActive:  { borderColor: Colors.brand, backgroundColor: Colors.brand + '12' },
  levelEmoji:       { fontSize: 22 },
  levelText:        { flex: 1 },
  levelLabel:       { fontFamily: FontFamily.semibold, fontSize: FontSize.sm, color: Colors.textPrimary },
  levelLabelActive: { color: Colors.brand },
  levelDesc:        { fontFamily: FontFamily.regular, fontSize: FontSize.xs, color: Colors.textMuted, marginTop: 2 },
  levelCheck:       { fontFamily: FontFamily.bold, fontSize: FontSize.base, color: Colors.brand },
  equipRow:         { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing[2], marginBottom: Spacing[6] },
  equipBtn: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing[1.5],
    paddingVertical: Spacing[2], paddingHorizontal: Spacing[3],
    borderRadius: Radius.full, borderWidth: 1.5, borderColor: Colors.border, backgroundColor: Colors.bgSurface,
  },
  equipBtnActive:  { borderColor: Colors.steps, backgroundColor: Colors.steps + '15' },
  equipEmoji:      { fontSize: 14 },
  equipLabel:      { fontFamily: FontFamily.medium, fontSize: FontSize.sm, color: Colors.textSecondary },
  equipLabelActive:{ color: Colors.steps },
  cta:             { marginBottom: Spacing[6] },
});