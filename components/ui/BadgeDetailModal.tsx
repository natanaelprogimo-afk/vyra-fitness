import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Modal from './Modal';
import { BadgeDef } from '@/hooks/useBadges';
import { Colors } from '@/constants/colors';
import { FontFamily, Spacing, Radius } from '@/constants/theme';

export default function BadgeDetailModal({
  visible,
  badge,
  unlocked,
  onClose,
}: {
  visible: boolean;
  badge: BadgeDef | null;
  unlocked: boolean;
  onClose: () => void;
}) {
  if (!badge) return null;

  return (
    <Modal visible={visible} onClose={onClose} title={badge.name} showClose>
      <View style={styles.container}>
        <Text style={styles.emoji}>{badge.emoji}</Text>
        <Text style={styles.name}>{badge.name}</Text>
        <Text style={styles.desc}>{badge.description}</Text>
        <Text style={styles.rewards}>Recompensa: {badge.coins} 🪙 • XP {badge.xp}</Text>
        <Text style={styles.status}>{unlocked ? 'Desbloqueado' : 'No desbloqueado'}</Text>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { gap: Spacing[4], paddingVertical: Spacing[2] },
  emoji: { fontSize: 48, textAlign: 'center' },
  name: { fontFamily: FontFamily.bold, fontSize: 18, textAlign: 'center', color: Colors.textPrimary },
  desc: { fontFamily: FontFamily.regular, fontSize: 14, color: Colors.textSecondary, textAlign: 'center' },
  rewards: { textAlign: 'center', color: Colors.coins, marginTop: Spacing[2] },
  status: { textAlign: 'center', color: Colors.textMuted, marginTop: Spacing[1] },
});
