// ============================================================
// VYRA FITNESS — Módulo Mental: Pantalla Principal
// Check-in diario (mood, energía, estrés, motivación)
// Si ya se hizo: mostrar resumen del día editable
// ============================================================

import { useState } from 'react';
import { View, Text, ScrollView, Pressable, TextInput, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue, useAnimatedStyle,
  withSpring, withSequence, withTiming,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import SafeScreen from '@/components/ui/SafeScreen';
import Header from '@/components/layout/Header';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import ProgressCircle from '@/components/charts/ProgressCircle';
import { useMental, getMentalScoreInfo } from '@/hooks/useMental';
import { Colors } from '@/constants/colors';
import { FontSize, FontFamily, Spacing, Radius } from '@/constants/theme';

const MOOD_EMOJIS    = ['', '😞', '😕', '😐', '🙂', '😄'];
const MOOD_LABELS    = ['', 'Pésimo', 'Malo', 'Regular', 'Bien', '¡Genial!'];

// ─── Slider de 10 puntos ─────────────────────────────────────
function MetricSlider({
  label, value, onChange, lowLabel, highLabel, color, inverted = false,
}: {
  label: string; value: number; onChange: (v: number) => void;
  lowLabel: string; highLabel: string; color: string; inverted?: boolean;
}) {
  const displayColor = inverted
    ? (value <= 3 ? Colors.steps : value <= 6 ? Colors.fasting : Colors.error)
    : (value >= 8 ? Colors.steps : value >= 5 ? Colors.fasting : Colors.error);

  return (
    <View style={styles.slider}>
      <View style={styles.sliderHeader}>
        <Text style={styles.sliderLabel}>{label}</Text>
        <Text style={[styles.sliderValue, { color: displayColor }]}>{value}/10</Text>
      </View>
      <View style={styles.sliderDots}>
        {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
          <Pressable
            key={n}
            onPress={() => {
              onChange(n);
              Haptics.selectionAsync().catch(() => {});
            }}
            style={[
              styles.dot,
              n <= value && { backgroundColor: displayColor },
            ]}
          />
        ))}
      </View>
      <View style={styles.sliderLegend}>
        <Text style={styles.sliderLegendText}>{lowLabel}</Text>
        <Text style={styles.sliderLegendText}>{highLabel}</Text>
      </View>
    </View>
  );
}

// ─── Pantalla principal ───────────────────────────────────────
export default function MentalScreen() {
  const {
    todayEntry, todayDone, todayScore,
    weeklyAvgScore, avgMood, avgEnergy, avgStress,
    checkinStreak, insights,
    isSaving, saveCheckin, logQuickMood, emotionalDrift,
  } = useMental();

  const [isEditing, setIsEditing] = useState(false);
  const [mood,       setMood]       = useState(todayEntry?.mood       ?? 3);
  const [energy,     setEnergy]     = useState(todayEntry?.energy     ?? 5);
  const [stress,     setStress]     = useState(todayEntry?.stress     ?? 5);
  const [motivation, setMotivation] = useState(todayEntry?.motivation ?? 5);
  const [notes,      setNotes]      = useState(todayEntry?.notes      ?? '');

  const moodScale = useSharedValue(1);
  const moodStyle = useAnimatedStyle(() => ({ transform: [{ scale: moodScale.value }] }));

  const onMoodPress = (v: number) => {
    setMood(v);
    moodScale.value = withSequence(
      withSpring(1.3, { damping: 6 }),
      withSpring(1.0, { damping: 12 })
    );
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
  };

  const handleSave = () => {
    saveCheckin({ mood, energy, stress, motivation, notes: notes.trim() || undefined });
    setIsEditing(false);
  };

  const scoreInfo = getMentalScoreInfo(todayScore ?? weeklyAvgScore);

  return (
    <SafeScreen padHorizontal={false} padBottom>
      <Header
        title="Salud mental"
        showBack
        color={Colors.mental}
        rightAction={
          <Pressable onPress={() => router.push('/modules/mental/history' as any)} style={styles.histBtn}>
            <Text style={styles.histText}>Historial</Text>
          </Pressable>
        }
      />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {!todayDone && !isEditing && (
          <Card style={styles.quickCard}>
            <Text style={styles.quickTitle}>Check-in rápido (1 toque)</Text>
            <Text style={styles.quickSubtitle}>Elegí tu ánimo de hoy y listo.</Text>
            <View style={styles.quickMoodRow}>
              {[1, 2, 3, 4, 5].map((v) => (
                <Pressable
                  key={v}
                  onPress={() => {
                    onMoodPress(v);
                    logQuickMood(v);
                  }}
                  style={styles.quickMoodBtn}
                >
                  <Text style={styles.quickMoodEmoji}>{MOOD_EMOJIS[v]}</Text>
                  <Text style={styles.quickMoodLabel}>{MOOD_LABELS[v]}</Text>
                </Pressable>
              ))}
            </View>
            <Button onPress={() => setIsEditing(true)} variant="secondary" fullWidth size="sm">
              Quiero hacerlo detallado
            </Button>
          </Card>
        )}

        {/* Score del día / semana */}
        {!isEditing && todayScore !== null && (
          <View style={styles.scoreSection}>
            <ProgressCircle
              value={todayScore}
              size={160}
              strokeWidth={12}
              color={scoreInfo.color}
              trackColor={Colors.bgElevated}
              animated
            >
              <Animated.Text style={[styles.scoreEmoji, moodStyle]}>
                {scoreInfo.emoji}
              </Animated.Text>
              <Text style={[styles.scoreValue, { color: scoreInfo.color }]}>{todayScore}</Text>
              <Text style={styles.scoreLabel}>{scoreInfo.label}</Text>
            </ProgressCircle>

            <View style={styles.miniStats}>
              <MiniStat label="Humor"      value={`${todayEntry!.mood}/5`}  emoji="😊" />
              <MiniStat label="Energía"    value={`${todayEntry!.energy}/10`} emoji="⚡" />
              <MiniStat label="Estrés"     value={`${todayEntry!.stress}/10`} emoji="😤" />
              <MiniStat label="Motivación" value={`${todayEntry!.motivation}/10`} emoji="🔥" />
            </View>

            {todayEntry?.notes && (
              <Card style={styles.notesCard}>
                <Text style={styles.notesText}>"{todayEntry.notes}"</Text>
              </Card>
            )}

            <Button
              onPress={() => setIsEditing(true)}
              variant="secondary"
              fullWidth
              size="sm"
              style={styles.editBtn}
            >
              Editar check-in de hoy
            </Button>
          </View>
        )}

        {/* Formulario de check-in */}
        {isEditing && (
          <View style={styles.formSection}>
            <Text style={styles.formTitle}>¿Cómo estás hoy?</Text>

            {/* Mood */}
            <Text style={styles.sectionLabel}>Estado de ánimo</Text>
            <View style={styles.moodRow}>
              {[1, 2, 3, 4, 5].map((v) => (
                <Pressable key={v} onPress={() => onMoodPress(v)} style={styles.moodBtn}>
                  <Animated.Text style={[
                    styles.moodEmoji,
                    mood === v && moodStyle,
                    { opacity: mood === v ? 1 : 0.4, transform: [{ scale: mood === v ? 1.2 : 1 }] },
                  ]}>
                    {MOOD_EMOJIS[v]}
                  </Animated.Text>
                  <Text style={[styles.moodLabel, mood === v && { color: Colors.mental }]}>
                    {MOOD_LABELS[v]}
                  </Text>
                </Pressable>
              ))}
            </View>

            {/* Sliders */}
            <MetricSlider
              label="Nivel de energía"
              value={energy}
              onChange={setEnergy}
              lowLabel="Agotado"
              highLabel="Con pilas"
              color={Colors.fasting}
            />
            <MetricSlider
              label="Nivel de estrés"
              value={stress}
              onChange={setStress}
              lowLabel="Relajado"
              highLabel="Al límite"
              color={Colors.error}
              inverted
            />
            <MetricSlider
              label="Motivación"
              value={motivation}
              onChange={setMotivation}
              lowLabel="Sin ganas"
              highLabel="Imparable"
              color={Colors.mental}
            />

            {/* Notas opcionales */}
            <Text style={styles.sectionLabel}>¿Algo que quieras anotar? (opcional)</Text>
            <TextInput
              style={styles.notesInput}
              value={notes}
              onChangeText={setNotes}
              placeholder="Cómo te sentís, qué pasó hoy..."
              placeholderTextColor={Colors.textMuted}
              multiline
              numberOfLines={3}
              maxLength={300}
            />
            <Text style={styles.charCount}>{notes.length}/300</Text>

            <Button
              onPress={handleSave}
              variant="primary"
              fullWidth
              size="lg"
              loading={isSaving}
              style={styles.saveBtn}
            >
              {todayDone ? 'Actualizar check-in' : 'Guardar check-in'}
            </Button>

            {todayDone && (
              <Button onPress={() => setIsEditing(false)} variant="ghost" fullWidth size="sm">
                Cancelar
              </Button>
            )}
          </View>
        )}

        {/* Insights automáticos */}
        {(insights.length > 0 || emotionalDrift.isDrifting) && !isEditing && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Insights de la semana</Text>
            {emotionalDrift.isDrifting && emotionalDrift.message ? (
              <Card style={[styles.insightCard, styles.driftCard]}>
                <Text style={styles.insightText}>⚠️ {emotionalDrift.message}</Text>
              </Card>
            ) : null}
            {insights.map((insight, i) => (
              <Card key={i} style={styles.insightCard}>
                <Text style={styles.insightText}>{insight}</Text>
              </Card>
            ))}
          </View>
        )}

        {/* Stats semanales */}
        {!isEditing && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Esta semana</Text>
            <View style={styles.statsGrid}>
              <StatCard emoji="🌟" label="Score prom." value={`${weeklyAvgScore}/100`} />
              <StatCard emoji="😊" label="Humor prom." value={`${avgMood.toFixed(1)}/5`} />
              <StatCard emoji="⚡" label="Energía prom." value={`${avgEnergy.toFixed(1)}/10`} />
              <StatCard emoji="🔥" label="Racha" value={`${checkinStreak} días`} />
            </View>
          </View>
        )}

        {/* Botón a insights */}
        {!isEditing && (
          <Button
            onPress={() => router.push('/modules/mental/insights')}
            variant="secondary"
            fullWidth
            size="md"
          >
            Ver tendencias y correlaciones 📊
          </Button>
        )}
      </ScrollView>
    </SafeScreen>
  );
}

function MiniStat({ label, value, emoji }: { label: string; value: string; emoji: string }) {
  return (
    <View style={styles.miniStat}>
      <Text style={styles.miniEmoji}>{emoji}</Text>
      <Text style={styles.miniValue}>{value}</Text>
      <Text style={styles.miniLabel}>{label}</Text>
    </View>
  );
}

function StatCard({ emoji, label, value }: { emoji: string; label: string; value: string }) {
  return (
    <Card style={styles.statCard}>
      <Text style={{ fontSize: 20 }}>{emoji}</Text>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  content:     { paddingHorizontal: Spacing[5], paddingBottom: Spacing[10] },
  histBtn:     { paddingHorizontal: Spacing[2] },
  histText:    { fontFamily: FontFamily.medium, fontSize: FontSize.sm, color: Colors.mental },
  quickCard:   { marginTop: Spacing[4], marginBottom: Spacing[4], backgroundColor: `${Colors.mental}0A` },
  quickTitle:  { fontFamily: FontFamily.bold, fontSize: FontSize.base, color: Colors.textPrimary },
  quickSubtitle:{ fontFamily: FontFamily.regular, fontSize: FontSize.sm, color: Colors.textMuted, marginTop: 2, marginBottom: Spacing[3] },
  quickMoodRow:{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: Spacing[3] },
  quickMoodBtn:{ alignItems: 'center', flex: 1 },
  quickMoodEmoji:{ fontSize: 26 },
  quickMoodLabel:{ fontFamily: FontFamily.medium, fontSize: 9, color: Colors.textMuted, marginTop: Spacing[1] },

  // Score
  scoreSection:{ alignItems: 'center', paddingVertical: Spacing[6] },
  scoreEmoji:  { fontSize: 32, marginBottom: Spacing[1] },
  scoreValue:  { fontFamily: FontFamily.bold, fontSize: FontSize['3xl'], lineHeight: FontSize['3xl'] * 1.1 },
  scoreLabel:  { fontFamily: FontFamily.medium, fontSize: FontSize.sm, color: Colors.textMuted },
  miniStats:   { flexDirection: 'row', gap: Spacing[3], marginTop: Spacing[5] },
  miniStat:    { alignItems: 'center', flex: 1 },
  miniEmoji:   { fontSize: 18, marginBottom: 2 },
  miniValue:   { fontFamily: FontFamily.bold, fontSize: FontSize.base, color: Colors.textPrimary },
  miniLabel:   { fontFamily: FontFamily.regular, fontSize: FontSize.xs, color: Colors.textMuted, marginTop: 1 },
  notesCard:   { marginTop: Spacing[4], width: '100%', backgroundColor: `${Colors.mental}0A` },
  notesText:   { fontFamily: FontFamily.regular, fontSize: FontSize.sm, color: Colors.textSecondary, fontStyle: 'italic', lineHeight: FontSize.sm * 1.5 },
  editBtn:     { marginTop: Spacing[4], borderColor: Colors.mental },

  // Form
  formSection: { paddingVertical: Spacing[4] },
  formTitle:   { fontFamily: FontFamily.bold, fontSize: FontSize['2xl'], color: Colors.textPrimary, marginBottom: Spacing[5] },
  sectionLabel:{ fontFamily: FontFamily.semibold, fontSize: FontSize.sm, color: Colors.textSecondary, marginBottom: Spacing[3] },
  moodRow:     { flexDirection: 'row', justifyContent: 'space-between', marginBottom: Spacing[6] },
  moodBtn:     { alignItems: 'center', flex: 1 },
  moodEmoji:   { fontSize: 28 },
  moodLabel:   { fontFamily: FontFamily.medium, fontSize: 9, color: Colors.textMuted, marginTop: Spacing[1], textAlign: 'center' },

  // Sliders
  slider:         { marginBottom: Spacing[5] },
  sliderHeader:   { flexDirection: 'row', justifyContent: 'space-between', marginBottom: Spacing[2] },
  sliderLabel:    { fontFamily: FontFamily.medium, fontSize: FontSize.sm, color: Colors.textSecondary },
  sliderValue:    { fontFamily: FontFamily.bold, fontSize: FontSize.sm },
  sliderDots:     { flexDirection: 'row', gap: Spacing[1.5] },
  dot:            { flex: 1, height: 8, borderRadius: 4, backgroundColor: Colors.bgElevated },
  sliderLegend:   { flexDirection: 'row', justifyContent: 'space-between', marginTop: Spacing[1] },
  sliderLegendText:{ fontFamily: FontFamily.regular, fontSize: FontSize.xs, color: Colors.textMuted },

  // Notes
  notesInput: {
    backgroundColor: Colors.bgSurface,
    borderRadius:    Radius.lg,
    borderWidth:     1,
    borderColor:     Colors.border,
    padding:         Spacing[3],
    color:           Colors.textPrimary,
    fontFamily:      FontFamily.regular,
    fontSize:        FontSize.sm,
    textAlignVertical:'top',
    minHeight:       80,
    marginBottom:    Spacing[1],
  },
  charCount: { fontFamily: FontFamily.regular, fontSize: FontSize.xs, color: Colors.textMuted, textAlign: 'right', marginBottom: Spacing[5] },
  saveBtn:   { marginBottom: Spacing[2] },

  // Insights
  section:      { marginBottom: Spacing[5] },
  sectionTitle: { fontFamily: FontFamily.bold, fontSize: FontSize.base, color: Colors.textPrimary, marginBottom: Spacing[3] },
  insightCard:  { marginBottom: Spacing[2], backgroundColor: `${Colors.mental}0A` },
  driftCard:    { borderColor: `${Colors.warning}66`, borderWidth: 1 },
  insightText:  { fontFamily: FontFamily.regular, fontSize: FontSize.sm, color: Colors.textSecondary, lineHeight: FontSize.sm * 1.5 },

  // Stats
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing[3] },
  statCard:  { width: '47%', alignItems: 'center', paddingVertical: Spacing[3] },
  statValue: { fontFamily: FontFamily.bold, fontSize: FontSize.lg, color: Colors.textPrimary, marginTop: Spacing[1] },
  statLabel: { fontFamily: FontFamily.regular, fontSize: FontSize.xs, color: Colors.textMuted, marginTop: 2, textAlign: 'center' },
});
