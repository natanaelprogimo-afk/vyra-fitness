import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '@/constants/colors';
import { FontFamily, Spacing, Radius } from '@/constants/theme';

const METABOLIC_ZONES = [
  { id: 'fed',       label: 'Saciado',    emoji: '🍽️', start: 0,  description: 'Digiriendo y con energía todavía cerca de la última comida.' },
  { id: 'early',     label: 'Adaptando',  emoji: '⚡',  start: 4,  description: 'Empieza a bajar la energía fácil y el cuerpo cambia de fuente.' },
  { id: 'fat',       label: 'Fat burn',   emoji: '🔥',  start: 12, description: 'Se vuelve más fácil usar grasa como combustible principal.' },
  { id: 'ketosis',   label: 'Ketosis',    emoji: '✨',  start: 16, description: 'La señal de cetosis ya aparece con bastante claridad.' },
  { id: 'autophagy', label: 'Autofagia',  emoji: '🌿',  start: 18, description: 'Ventana avanzada. Aquí vale más el contexto y la recuperación.' },
] as const;

const ZONE_COLORS: Record<string, string> = {
  fed:       '#94A3B8',
  early:     '#F59E0B',
  fat:       '#F97316',
  ketosis:   Colors.fasting,
  autophagy: '#8B5CF6',
};

export default function MetabolicTimeline({ elapsedHours, targetHours }: { elapsedHours: number; targetHours: number }) {
  const maxHours = Math.max(targetHours, 24);
  const zones = [...METABOLIC_ZONES];

  return (
    <View style={styles.container}>
      {/* Barra base */}
      <View style={styles.track}>
        {/* Fill hasta ahora */}
        <View style={[styles.fill, { width: `${Math.min(100, (elapsedHours / maxHours) * 100)}%` }]} />
        {/* Marcadores de zona */}
        {zones.map((zone) => {
          const pct = (zone.start / maxHours) * 100;
          if (pct > 100) return null;
          const passed = elapsedHours >= zone.start;
          return (
            <View
              key={zone.id}
              style={[
                styles.marker,
                { left: `${pct}%`, backgroundColor: passed ? ZONE_COLORS[zone.id] : Colors.bgElevated }
              ]}
            />
          );
        })}
      </View>
      {/* Labels */}
      <View style={styles.labels}>
        {zones.map((zone) => {
          const pct = (zone.start / maxHours) * 100;
          if (pct > 100) return null;
          const active = Math.max(0, elapsedHours) >= zone.start;
          return (
            <View key={zone.id} style={[styles.labelItem, { left: `${pct}%` }]}>
              <Text style={[styles.labelText, active && { color: ZONE_COLORS[zone.id], fontFamily: FontFamily.bold }]}>
                {zone.emoji}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: '100%', paddingBottom: Spacing[3] },
  track: {
    height: 6,
    backgroundColor: Colors.bgElevated,
    borderRadius: Radius.full,
    position: 'relative',
    marginBottom: Spacing[2],
    overflow: 'visible',
  },
  fill: {
    position: 'absolute',
    height: '100%',
    backgroundColor: Colors.fasting,
    borderRadius: Radius.full,
    opacity: 0.6,
  },
  marker: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: 5,
    top: -2,
    marginLeft: -5,
    borderWidth: 1.5,
    borderColor: Colors.bgSurface,
  },
  labels: {
    position: 'relative',
    height: 20,
  },
  labelItem: {
    position: 'absolute',
    marginLeft: -8,
  },
  labelText: {
    fontSize: 14,
  },
});
