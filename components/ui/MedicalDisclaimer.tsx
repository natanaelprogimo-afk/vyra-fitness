import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Modal from './Modal';
import { Colors } from '@/constants/colors';
import { FontFamily, FontSize, Radius, Spacing } from '@/constants/theme';

interface MedicalDisclaimerProps {
  title: string;
  summary: string;
  details?: string[];
  accentColor?: string;
  accentBg?: string;
  ctaLabel?: string;
  modalTitle?: string;
}

export default function MedicalDisclaimer({
  title,
  summary,
  details = [],
  accentColor = Colors.warning,
  accentBg = Colors.warningBg,
  ctaLabel = 'Ver aviso completo',
  modalTitle,
}: MedicalDisclaimerProps) {
  const [open, setOpen] = useState(false);

  const detailRows = useMemo(
    () => details.filter((item) => item && item.trim().length > 0),
    [details],
  );

  return (
    <>
      <View style={[styles.card, { borderColor: accentColor, backgroundColor: accentBg }]}>
        <View style={styles.header}>
          <View style={[styles.iconWrap, { backgroundColor: accentColor }]}>
            <Ionicons name="warning" size={14} color={Colors.white} />
          </View>
          <Text style={styles.title}>{title}</Text>
        </View>
        <Text style={styles.summary}>{summary}</Text>
        {detailRows.length > 0 ? (
          <Pressable style={styles.link} onPress={() => setOpen(true)} hitSlop={8}>
            <Text style={[styles.linkText, { color: accentColor }]}>{ctaLabel}</Text>
            <Ionicons name="chevron-forward" size={14} color={accentColor} />
          </Pressable>
        ) : null}
      </View>

      <Modal
        visible={open}
        onClose={() => setOpen(false)}
        title={modalTitle ?? title}
        ctaLabel="Entendido"
        onCta={() => setOpen(false)}
        ctaVariant="primary"
      >
        <Text style={styles.modalSummary}>{summary}</Text>
        {detailRows.length > 0 ? (
          <View style={styles.detailList}>
            {detailRows.map((item) => (
              <View key={item} style={styles.detailRow}>
                <Text style={styles.detailBullet}>-</Text>
                <Text style={styles.detailText}>{item}</Text>
              </View>
            ))}
          </View>
        ) : null}
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Radius.xl,
    borderWidth: 1,
    padding: Spacing[4],
    gap: Spacing[2],
  },
  header: {
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
  title: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.base,
    color: Colors.textPrimary,
  },
  summary: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  link: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[1],
    marginTop: Spacing[1],
  },
  linkText: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.sm,
  },
  modalSummary: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.base,
    color: Colors.textSecondary,
    lineHeight: 22,
    marginBottom: Spacing[3],
  },
  detailList: {
    gap: Spacing[2],
  },
  detailRow: {
    flexDirection: 'row',
    gap: Spacing[2],
  },
  detailBullet: {
    fontFamily: FontFamily.bold,
    color: Colors.textSecondary,
    fontSize: FontSize.base,
    lineHeight: 22,
  },
  detailText: {
    flex: 1,
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
});
