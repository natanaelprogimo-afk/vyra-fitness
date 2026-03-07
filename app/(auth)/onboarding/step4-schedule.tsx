// ============================================================
// VYRA FITNESS — Onboarding Step 4: Horarios y ayuno
// ============================================================

import { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import SafeScreen from '@/components/ui/SafeScreen';
import Button from '@/components/ui/Button';
import { OnboardingProgress } from './step1-goals';
import { Colors } from '@/constants/colors';
import { FontSize, FontFamily, Spacing, Radius } from '@/constants/theme';

const TIME_OPTIONS = [
  { label: '5:00', minutes: 300 }, { label: '5:30', minutes: 330 },
  { label: '6:00', minutes: 360 }, { label: '6:30', minutes: 390 },
  { label: '7:00', minutes: 420 }, { label: '7:30', minutes: 450 },
  { label: '8:00', minutes: 480 }, { label: '8:30', minutes: 510 },
  { label: '9:00', minutes: 540 },
];
const SLEEP_OPTIONS = [
  { label: '21:00', minutes: 1260 }, { label: '21:30', minutes: 1290 },
  { label: '22:00', minutes: 1320 }, { label: '22:30', minutes: 1350 },
  { label: '23:00', minutes: 1380 }, { label: '23:30', minutes: 1410 },
  { label: '00:00', minutes: 0   }, { label: '00:30', minutes: 30  },
  { label: '01:00', minutes: 60  },
];
const PROTOCOLS = [
  { id: '16:8', label: '16:8', desc: '16h ayuno, 8h comida — el mas popular' },
  { id: '18:6', label: '18:6', desc: '18h ayuno, 6h ventana' },
  { id: '20:4', label: '20:4', desc: '20h ayuno, mas exigente' },
];

export default function Step4Schedule() {
  const params = useLocalSearchParams();
  const [wakeTime,    setWakeTime]    = useState(420);
  const [sleepTime,   setSleepTime]   = useState(1380);
  const [wantsFasting,setWantsFasting]= useState(false);
  const [protocol,    setProtocol]    = useState('16:8');

  const handleNext = () => {
    router.push({
      pathname: '/(auth)/onboarding/step5-premium',
      params: {
        ...params,
        wakeTime:  wakeTime.toString(),
        sleepTime: sleepTime.toString(),
        fasting:   wantsFasting ? '1' : '0',
        protocol:  wantsFasting ? protocol : '',
      },
    } as any);
  };

  return (
    <SafeScreen scrollable>
      <OnboardingProgress step={3} total={4} />
      <Text style={styles.title}>Tus horarios</Text>
      <Text style={styles.subtitle}>Configuramos las notificaciones para que no te molesten.</Text>

      <Text style={styles.sectionLabel}>A que hora te levantás?</Text>
      <View style={styles.timeRow}>
        {TIME_OPTIONS.map((t) => (
          <Pressable key={t.minutes} onPress={() => setWakeTime(t.minutes)}
            style={[styles.timeChip, wakeTime === t.minutes && styles.timeChipActive]}>
            <Text style={[styles.timeLabel, wakeTime === t.minutes && styles.timeLabelActive]}>{t.label}</Text>
          </Pressable>
        ))}
      </View>

      <Text style={styles.sectionLabel}>A que hora te dormis?</Text>
      <View style={styles.timeRow}>
        {SLEEP_OPTIONS.map((t) => (
          <Pressable key={t.minutes} onPress={() => setSleepTime(t.minutes)}
            style={[styles.timeChip, sleepTime === t.minutes && styles.timeChipActive]}>
            <Text style={[styles.timeLabel, sleepTime === t.minutes && styles.timeLabelActive]}>{t.label}</Text>
          </Pressable>
        ))}
      </View>

      <Text style={styles.sectionLabel}>Te interesa el ayuno intermitente?</Text>
      <View style={styles.fastingRow}>
        <Pressable onPress={() => setWantsFasting(true)}
          style={[styles.fastingBtn, wantsFasting && styles.fastingBtnActive]}>
          <Text style={styles.fastingEmoji}>23h</Text>
          <Text style={[styles.fastingLabel, wantsFasting && styles.fastingLabelActive]}>Si, quiero probarlo</Text>
        </Pressable>
        <Pressable onPress={() => setWantsFasting(false)}
          style={[styles.fastingBtn, !wantsFasting && styles.fastingBtnActiveNo]}>
          <Text style={styles.fastingEmoji}>X</Text>
          <Text style={[styles.fastingLabel, !wantsFasting && styles.fastingLabelNo]}>No por ahora</Text>
        </Pressable>
      </View>

      {wantsFasting && (
        <View style={styles.protocols}>
          <Text style={styles.sectionLabel}>Que protocolo preferis?</Text>
          {PROTOCOLS.map((p) => (
            <Pressable key={p.id} onPress={() => setProtocol(p.id)}
              style={[styles.protocolCard, protocol === p.id && styles.protocolCardActive]}>
              <Text style={[styles.protocolLabel, protocol === p.id && styles.protocolLabelActive]}>{p.label}</Text>
              <Text style={styles.protocolDesc}>{p.desc}</Text>
            </Pressable>
          ))}
        </View>
      )}

      <Button onPress={handleNext} variant="primary" fullWidth size="lg" style={styles.cta}>
        Siguiente -&gt;
      </Button>
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  title:       { fontFamily: FontFamily.bold, fontSize: FontSize['2xl'], color: Colors.textPrimary, marginTop: Spacing[6], marginBottom: Spacing[2] },
  subtitle:    { fontFamily: FontFamily.regular, fontSize: FontSize.base, color: Colors.textSecondary, marginBottom: Spacing[5] },
  sectionLabel:{ fontFamily: FontFamily.semibold, fontSize: FontSize.sm, color: Colors.textSecondary, marginBottom: Spacing[2], marginTop: Spacing[4] },
  timeRow:     { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing[2] },
  timeChip: { paddingVertical: Spacing[1.5], paddingHorizontal: Spacing[3], borderRadius: Radius.full, borderWidth: 1.5, borderColor: Colors.border, backgroundColor: Colors.bgSurface },
  timeChipActive:  { borderColor: Colors.brand, backgroundColor: Colors.brand + '15' },
  timeLabel:       { fontFamily: FontFamily.medium, fontSize: FontSize.sm, color: Colors.textSecondary },
  timeLabelActive: { color: Colors.brand, fontFamily: FontFamily.semibold },
  fastingRow:      { flexDirection: 'row', gap: Spacing[3], marginTop: Spacing[2] },
  fastingBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: Spacing[2], padding: Spacing[3], borderRadius: Radius.xl, borderWidth: 1.5, borderColor: Colors.border, backgroundColor: Colors.bgSurface },
  fastingBtnActive:   { borderColor: Colors.fasting, backgroundColor: Colors.fasting + '12' },
  fastingBtnActiveNo: { borderColor: Colors.border },
  fastingEmoji:       { fontSize: 16 },
  fastingLabel:       { fontFamily: FontFamily.medium, fontSize: FontSize.sm, color: Colors.textSecondary, flex: 1 },
  fastingLabelActive: { color: Colors.fasting },
  fastingLabelNo:     { color: Colors.textMuted },
  protocols:          { marginTop: Spacing[4], gap: Spacing[2] },
  protocolCard: { padding: Spacing[3], borderRadius: Radius.xl, borderWidth: 1.5, borderColor: Colors.border, backgroundColor: Colors.bgSurface },
  protocolCardActive:  { borderColor: Colors.fasting, backgroundColor: Colors.fasting + '12' },
  protocolLabel:       { fontFamily: FontFamily.bold, fontSize: FontSize.base, color: Colors.textPrimary, marginBottom: 2 },
  protocolLabelActive: { color: Colors.fasting },
  protocolDesc:        { fontFamily: FontFamily.regular, fontSize: FontSize.sm, color: Colors.textMuted },
  cta:                 { marginTop: Spacing[6], marginBottom: Spacing[6] },
});
