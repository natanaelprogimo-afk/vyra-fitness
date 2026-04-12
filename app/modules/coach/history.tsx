import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import SafeScreen from '@/components/ui/SafeScreen';
import Header from '@/components/layout/Header';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { EmptyStateFirstUse } from '@/components/ui/EmptyStateVariants';
import { Colors, withOpacity } from '@/constants/colors';
import { FontFamily, FontSize, Radius, Spacing } from '@/constants/theme';
import { useCoach } from '@/hooks/useCoach';
import { useReadiness } from '@/hooks/useReadiness';
import { Routes } from '@/constants/routes';
import { useAuthStore } from '@/stores/authStore';

const TABS = [
  { label: 'Chat', route: Routes.coach.index },
  { label: 'Historial', route: Routes.coach.history },
  { label: 'Ajustes', route: Routes.coach.settings },
] as const;

function formatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('es', { day: '2-digit', month: 'short' });
}
function getDaysSince(dayKey: string): number | null {
  if (!dayKey) return null;
  const date = new Date(`${dayKey}T00:00:00`);
  if (Number.isNaN(date.getTime())) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diff = today.getTime() - date.getTime();
  return Math.max(0, Math.round(diff / 86400000));
}

function trimPreview(text: string, max = 120): string {
  const clean = text.replace(/\s+/g, ' ').trim();
  if (clean.length <= max) return clean;
  return `${clean.slice(0, max - 1).trimEnd()}...`;
}

function Metric({ label, value, accent }: { label: string; value: string; accent: string }) {
  return (
    <View style={styles.metricCard}>
      <Text style={[styles.metricValue, { color: accent }]}>{value}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
    </View>
  );
}

function RouteStat({
  label,
  value,
  hint,
  accent,
}: {
  label: string;
  value: string;
  hint: string;
  accent: string;
}) {
  return (
    <View style={styles.routeStat}>
      <Text style={styles.routeStatLabel}>{label}</Text>
      <Text style={[styles.routeStatValue, { color: accent }]} numberOfLines={1}>
        {value}
      </Text>
      <Text style={styles.routeStatHint}>{hint}</Text>
    </View>
  );
}

export default function CoachHistoryScreen() {
  const {
    messages,
    clearHistory,
    coachName,
    isPremium,
    dailyMessagesLeft,
    proactivityLevel,
  } = useCoach();
  const {
    dailyScore,
    predictedScore,
    weeklyAverage,
    scoreColor,
    similarDayComparison,
    focusActions,
    morningNarrative,
  } = useReadiness();
  const profile = useAuthStore((state) => state.profile);
  const displayName = profile?.name ?? 'Tu';

  const grouped = useMemo(() => {
    const buckets = new Map<string, typeof messages>();
    messages.forEach((msg) => {
      const dayKey = msg.createdAt?.slice(0, 10) ?? '';
      if (!buckets.has(dayKey)) buckets.set(dayKey, []);
      buckets.get(dayKey)?.push(msg);
    });
    return [...buckets.entries()]
      .sort((a, b) => b[0].localeCompare(a[0]))
      .map(([key, list]) => ({ key, list }));
  }, [messages]);

  const summary = useMemo(() => {
    const total = messages.length;
    const userCount = messages.filter((m) => m.role === 'user').length;
    return { total, userCount };
  }, [messages]);

  const focusAction = focusActions[0] ?? null;
  const lastGroup = grouped[0] ?? null;
  const lastConversationAge = lastGroup ? getDaysSince(lastGroup.key) : null;
  const activeDays = grouped.length;
  const lastAssistantMessage = [...messages].reverse().find((msg) => msg.role === 'assistant')?.content ?? null;
  const lastUserMessage = [...messages].reverse().find((msg) => msg.role === 'user')?.content ?? null;
  const recentActiveDays = grouped.filter((group) => {
    const age = getDaysSince(group.key);
    return age !== null && age <= 6;
  }).length;
  const avgPromptsPerDay = activeDays > 0 ? Math.round((summary.userCount / activeDays) * 10) / 10 : 0;

  const dayScore = dailyScore?.score != null ? Math.round(dailyScore.score) : null;
  const dayScoreAccent = dayScore !== null ? scoreColor(dayScore) : Colors.coach;
  const scoreVsWeek = dayScore !== null && weeklyAverage !== null ? Math.round(dayScore - weeklyAverage) : null;

  const returnMode = summary.total === 0
    ? 'Abrir'
    : lastConversationAge !== null && lastConversationAge >= 5
      ? 'Reabrir'
      : dayScore !== null && dayScore < 65
        ? 'Cuidar'
        : recentActiveDays >= 3
          ? 'Sostener'
          : proactivityLevel === 'silent'
            ? 'Silencio'
            : 'Retomar';

  const coachTitle = summary.total === 0
    ? `${coachName} quiere guardar la primera memoria util del dia.`
    : lastConversationAge !== null && lastConversationAge >= 5
      ? `${coachName} detecta un hilo frio y quiere reabrirlo con mas contexto.`
      : dayScore !== null && dayScore < 65
        ? `${coachName} quiere proteger el dia antes de seguir acumulando ruido.`
        : recentActiveDays >= 3
          ? `${coachName} ya tiene una memoria util para sostener el hilo de esta semana.`
          : `${coachName} quiere retomar la memoria reciente sin perder direccion.`;

  const coachBody = summary.total === 0
    ? 'Todavia no hay conversaciones guardadas, asi que la mejor jugada es abrir el primer hilo con contexto real del score y del foco del dia.'
    : lastConversationAge !== null && lastConversationAge >= 5
      ? trimPreview(lastAssistantMessage ?? lastUserMessage ?? similarDayComparison?.message ?? morningNarrative ?? 'La memoria del coach gana valor cuando se reabre antes de que el hilo se enfrie demasiado.')
      : trimPreview(similarDayComparison?.message ?? lastAssistantMessage ?? morningNarrative ?? 'La memoria del coach vale mas cuando conversa con el score, la semana y la siguiente accion util.');

  const coachHint = summary.total === 0
    ? 'Siguiente lectura util: abre el chat y guarda una primera conversacion con contexto real.'
    : lastConversationAge !== null && lastConversationAge >= 5
      ? 'Siguiente lectura util: reabre el chat y pide a Vyra que retome el ultimo hilo antes de abrir otro frente.'
      : dayScore !== null && dayScore < 65
        ? 'Siguiente lectura util: si el score viene bajo, usa resumen o progreso antes de pedir mas carga al coach.'
        : focusAction
          ? `Siguiente lectura util: ${focusAction.title}.`
          : 'Siguiente lectura util: si el hilo ya esta vivo, progreso y resumen te ayudan a cerrar el sistema.';

  const routeActionTitle = summary.total === 0
    ? 'Guardar la primera memoria util'
    : lastConversationAge !== null && lastConversationAge >= 5
      ? 'Reabrir el ultimo hilo'
      : dayScore !== null && dayScore < 65
        ? 'Proteger el dia antes de insistir'
        : recentActiveDays >= 3
          ? 'Sostener el hilo de la semana'
          : 'Retomar contexto sin abrir ruido';

  const primaryActionLabel = summary.total === 0
    ? 'Abrir chat'
    : lastConversationAge !== null && lastConversationAge >= 5
      ? 'Reabrir chat'
      : focusAction
        ? 'Seguir foco'
        : dayScore !== null && dayScore < 65
          ? 'Abrir resumen'
          : 'Abrir progreso';

  const handlePrimaryAction = () => {
    if (summary.total === 0) {
      router.push(Routes.coach.index as any);
      return;
    }
    if (lastConversationAge !== null && lastConversationAge >= 5) {
      router.push(Routes.coach.index as any);
      return;
    }
    if (focusAction) {
      router.push(focusAction.route as any);
      return;
    }
    if (dayScore !== null && dayScore < 65) {
      router.push(Routes.dailySummary as any);
      return;
    }
    router.push(Routes.tabs.progress as any);
  };

  const handleClear = () => {
    Alert.alert('Borrar historial', `Quieres borrar todo el historial con ${coachName}?`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Borrar', style: 'destructive', onPress: clearHistory },
    ]);
  };

  const latestSnapshot = lastGroup?.list[lastGroup.list.length - 1] ?? null;

  return (
    <SafeScreen padHorizontal={false} padBottom>
      <Header title="Historial del coach" subtitle="Memoria reciente y proximo hilo util" showBack color={Colors.coach} />

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.tabs}>
          {TABS.map((tab) => {
            const isActive = tab.route === Routes.coach.history;
            return (
              <Pressable key={tab.label} style={[styles.tab, isActive && styles.tabActive]} onPress={() => router.push(tab.route as any)}>
                <Text style={[styles.tabText, isActive && styles.tabTextActive]}>{tab.label}</Text>
              </Pressable>
            );
          })}
        </View>

        <Card style={styles.routeCard} accentColor={Colors.coach}>
          <Text style={styles.routeEyebrow}>Coach contextual</Text>
          <Text style={styles.routeTitle}>{coachTitle}</Text>
          <Text style={styles.routeBody} numberOfLines={3}>{coachBody}</Text>

          <View style={styles.routeStatsRow}>
            <RouteStat
              label="Score"
              value={dayScore !== null ? `${dayScore}` : '--'}
              hint={dayScore !== null ? `cierre ${predictedScore ?? dayScore}` : 'sin lectura todavia'}
              accent={dayScoreAccent}
            />
            <RouteStat
              label="Retorno"
              value={returnMode}
              hint={summary.total === 0 ? 'sin historial' : `${summary.userCount} prompts utiles`}
              accent={Colors.coach}
            />
            <RouteStat
              label="Ritmo"
              value={scoreVsWeek !== null ? `${scoreVsWeek > 0 ? '+' : ''}${scoreVsWeek}` : `${avgPromptsPerDay}`}
              hint={scoreVsWeek !== null ? 'vs. semana' : 'prompts / dia'}
              accent={scoreVsWeek !== null && scoreVsWeek < 0 ? Colors.warning : Colors.textPrimary}
            />
          </View>

          <View style={styles.routeActionRow}>
            <View style={styles.routeActionCopy}>
              <Text style={styles.routeActionLabel}>Siguiente lectura</Text>
              <Text style={styles.routeActionTitle}>{routeActionTitle}</Text>
              <Text style={styles.routeActionHint} numberOfLines={3}>{coachHint}</Text>
            </View>
            <View style={styles.routeButtons}>
              <Button onPress={handlePrimaryAction} label={primaryActionLabel} size="sm" color={Colors.coach} />
              <Button onPress={() => router.push(Routes.coach.index as any)} label="Abrir coach" size="sm" variant="secondary" color={Colors.coach} />
              <Button onPress={() => router.push(Routes.dailySummary as any)} label="Abrir resumen" size="sm" variant="ghost" color={Colors.coach} />
            </View>
          </View>
        </Card>

        <Card style={styles.heroCard} accentColor={Colors.coach}>
          <View style={styles.heroHeader}>
            <View style={styles.heroCopy}>
              <Text style={styles.eyebrow}>Memoria viva</Text>
              <Text style={styles.heroTitle} numberOfLines={3}>Guardar menos y reabrir mejor vale mas que acumular mensajes.</Text>
              <Text style={styles.heroBody} numberOfLines={2}>Aqui importa volver al hilo correcto sin tener que reconstruir todo el contexto.</Text>
            </View>
            <View style={styles.heroIconWrap}>
              <Ionicons name="sparkles-outline" size={22} color={Colors.coach} />
            </View>
          </View>

          <View style={styles.metricRow}>
            <Metric label="mensajes" value={String(summary.total)} accent={Colors.coach} />
            <Metric label="dias vivos" value={String(activeDays)} accent={Colors.textPrimary} />
            <Metric label="ritmo" value={recentActiveDays >= 3 ? 'Alto' : recentActiveDays >= 1 ? 'Medio' : 'Base'} accent={Colors.mental} />
          </View>
        </Card>

        <Card>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionCopy}>
              <Text style={styles.sectionTitle}>Ruta del historial</Text>
              <Text style={styles.sectionHint}>Lee rapido si hoy conviene retomar, sostener o limpiar memoria.</Text>
            </View>
            <View style={styles.sectionAction}>
              <Button variant="secondary" onPress={handleClear} color={Colors.coach}>
                Borrar historial
              </Button>
            </View>
          </View>

          <View style={styles.routeSummaryGrid}>
            <View style={styles.summaryBox}>
              <Text style={styles.summaryLabel}>Ultimo hilo</Text>
              <Text style={styles.summaryValue}>{lastGroup ? formatDate(lastGroup.key) : 'Sin base'}</Text>
              <Text style={styles.summaryHint}>{lastConversationAge !== null ? `${lastConversationAge} dias` : 'todavia vacio'}</Text>
            </View>
            <View style={styles.summaryBox}>
              <Text style={styles.summaryLabel}>Prompts / dia</Text>
              <Text style={styles.summaryValue}>{summary.total === 0 ? '--' : `${avgPromptsPerDay}`}</Text>
              <Text style={styles.summaryHint}>{summary.userCount} tuyos</Text>
            </View>
            <View style={styles.summaryBox}>
              <Text style={styles.summaryLabel}>Proactividad</Text>
              <Text style={styles.summaryValue}>{proactivityLevel === 'active' ? 'Alta' : proactivityLevel === 'silent' ? 'Baja' : 'Media'}</Text>
              <Text style={styles.summaryHint}>{!isPremium && dailyMessagesLeft !== 999 ? `${dailyMessagesLeft} libres` : 'coach activo'}</Text>
            </View>
          </View>

          <View style={styles.contextCard}>
            <Text style={styles.contextTitle}>Lectura corta</Text>
            <Text style={styles.contextText}>
              {summary.total === 0
                ? `${displayName}, la memoria del coach empieza a ser util cuando guardas el primer hilo con una pregunta real del dia.`
                : latestSnapshot
                  ? `${latestSnapshot.role === 'assistant' ? coachName : displayName} cerro el ultimo hilo con: ${trimPreview(latestSnapshot.content, 96)}`
                  : 'La memoria del coach queda lista para recuperar el contexto cuando vuelvas al chat.'}
            </Text>
          </View>
        </Card>

        {grouped.length === 0 ? (
          <Card accentColor={Colors.coach}>
            <EmptyStateFirstUse
              moduleLabel="Coach"
              itemLabel="conversacion"
              emoji="AI"
              tone="brand"
              ctaLabel="Abrir chat"
              onCta={() => router.push(Routes.coach.index as any)}
            />
            <Text style={styles.emptyText}>
              {displayName}, cuando hables con {coachName} la memoria aparecera ordenada por dia y con mucho mejor contexto para reabrir hilos utiles.
            </Text>
          </Card>
        ) : (
          grouped.map((group) => {
            const userMessages = group.list.filter((msg) => msg.role === 'user').length;
            const assistantMessages = group.list.length - userMessages;
            const recentMessage = group.list[group.list.length - 1];
            return (
              <Card key={group.key}>
                <View style={styles.groupHeader}>
                  <View style={styles.groupCopy}>
                    <Text style={styles.groupDate}>{formatDate(group.key)}</Text>
                    <Text style={styles.groupMeta}>{group.list.length} mensajes | {userMessages} tuyos | {assistantMessages} de {coachName}</Text>
                  </View>
                  <View style={styles.groupBadge}>
                    <Text style={styles.groupBadgeText}>{getDaysSince(group.key) === 0 ? 'Hoy' : `${getDaysSince(group.key)}d`}</Text>
                  </View>
                </View>

                <View style={styles.dayHighlight}>
                  <Text style={styles.dayHighlightLabel}>Ultima lectura del hilo</Text>
                  <Text style={styles.dayHighlightText}>{trimPreview(recentMessage?.content ?? 'Sin contenido util.', 130)}</Text>
                </View>

                <View style={styles.messageList}>
                  {group.list.slice(-6).map((msg) => (
                    <View key={msg.id} style={styles.messageRow}>
                      <View style={[styles.dot, msg.role === 'assistant' ? styles.dotAI : styles.dotUser]} />
                      <View style={styles.messageCopy}>
                        <Text style={styles.messageRole}>{msg.role === 'assistant' ? coachName : 'Tu'}</Text>
                        <Text style={styles.messageText}>{msg.content}</Text>
                      </View>
                    </View>
                  ))}
                </View>
              </Card>
            );
          })
        )}
      </ScrollView>
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: Spacing[5], paddingTop: Spacing[5], paddingBottom: Spacing[12], gap: Spacing[4] },
  heroCard: { gap: Spacing[4] },
  heroHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: Spacing[3] },
  heroCopy: { flex: 1, gap: 6 },
  eyebrow: { fontFamily: FontFamily.semibold, fontSize: FontSize.xs, color: Colors.coach },
  heroTitle: { fontFamily: FontFamily.bold, fontSize: FontSize.xl, lineHeight: 28, color: Colors.textPrimary },
  heroBody: { fontFamily: FontFamily.regular, fontSize: FontSize.sm, lineHeight: 20, color: Colors.textSecondary },
  heroIconWrap: { width: 46, height: 46, borderRadius: Radius.full, alignItems: 'center', justifyContent: 'center', backgroundColor: withOpacity(Colors.coach, 0.14) },
  tabs: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing[2] },
  tab: { paddingHorizontal: Spacing[3], paddingVertical: Spacing[1.5], borderRadius: Radius.full, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.surface3 },
  tabActive: { borderColor: withOpacity(Colors.coach, 0.34), backgroundColor: withOpacity(Colors.coach, 0.14) },
  tabText: { fontFamily: FontFamily.medium, fontSize: FontSize.sm, color: Colors.textSecondary },
  tabTextActive: { color: Colors.coach, fontFamily: FontFamily.bold },
  metricRow: { flexDirection: 'row', gap: Spacing[2] },
  metricCard: { flex: 1, padding: Spacing[3], borderRadius: Radius.lg, borderWidth: 1, borderColor: Colors.border, backgroundColor: withOpacity(Colors.white, 0.04), gap: 4 },
  metricValue: { fontFamily: FontFamily.bold, fontSize: FontSize.base },
  metricLabel: { fontFamily: FontFamily.medium, fontSize: FontSize.xs, color: Colors.textSecondary },
  routeCard: { gap: Spacing[4] },
  routeEyebrow: { fontFamily: FontFamily.semibold, fontSize: FontSize.xs, color: Colors.coach },
  routeTitle: { fontFamily: FontFamily.bold, fontSize: FontSize.lg, lineHeight: 24, color: Colors.textPrimary },
  routeBody: { fontFamily: FontFamily.regular, fontSize: FontSize.sm, lineHeight: 20, color: Colors.textSecondary },
  routeStatsRow: { flexDirection: 'row', gap: Spacing[2] },
  routeStat: { flex: 1, padding: Spacing[3], borderRadius: Radius.lg, borderWidth: 1, borderColor: Colors.border, backgroundColor: withOpacity(Colors.white, 0.04), gap: 4 },
  routeStatLabel: { fontFamily: FontFamily.medium, fontSize: FontSize.xs, color: Colors.textSecondary },
  routeStatValue: { fontFamily: FontFamily.bold, fontSize: FontSize.base },
  routeStatHint: { fontFamily: FontFamily.regular, fontSize: FontSize.xs, lineHeight: 16, color: Colors.textMuted },
  routeActionRow: { gap: Spacing[3] },
  routeActionCopy: { gap: 4 },
  routeActionLabel: { fontFamily: FontFamily.semibold, fontSize: FontSize.xs, color: Colors.coach },
  routeActionTitle: { fontFamily: FontFamily.bold, fontSize: FontSize.base, color: Colors.textPrimary },
  routeActionHint: { fontFamily: FontFamily.regular, fontSize: FontSize.sm, lineHeight: 20, color: Colors.textSecondary },
  routeButtons: { gap: Spacing[2] },
  sectionHeader: { gap: Spacing[3] },
  sectionCopy: { flex: 1, gap: 4 },
  sectionAction: { alignSelf: 'flex-start' },
  sectionTitle: { fontFamily: FontFamily.bold, fontSize: FontSize.lg, color: Colors.textPrimary },
  sectionHint: { fontFamily: FontFamily.regular, fontSize: FontSize.sm, lineHeight: 20, color: Colors.textSecondary },
  routeSummaryGrid: { flexDirection: 'row', gap: Spacing[2], marginTop: Spacing[3] },
  summaryBox: { flex: 1, padding: Spacing[3], borderRadius: Radius.lg, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.surface2, gap: 4 },
  summaryLabel: { fontFamily: FontFamily.medium, fontSize: FontSize.xs, color: Colors.textSecondary },
  summaryValue: { fontFamily: FontFamily.bold, fontSize: FontSize.base, color: Colors.textPrimary },
  summaryHint: { fontFamily: FontFamily.regular, fontSize: FontSize.xs, lineHeight: 16, color: Colors.textMuted },
  contextCard: { marginTop: Spacing[3], padding: Spacing[3], borderRadius: Radius.lg, backgroundColor: withOpacity(Colors.coach, 0.08), gap: 4 },
  contextTitle: { fontFamily: FontFamily.bold, fontSize: FontSize.sm, color: Colors.textPrimary },
  contextText: { fontFamily: FontFamily.regular, fontSize: FontSize.sm, lineHeight: 20, color: Colors.textSecondary },
  emptyText: { fontFamily: FontFamily.regular, fontSize: FontSize.sm, lineHeight: 20, color: Colors.textSecondary },
  groupHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: Spacing[3], marginBottom: Spacing[3] },
  groupCopy: { flex: 1, gap: 4 },
  groupDate: { fontFamily: FontFamily.bold, fontSize: FontSize.base, color: Colors.textPrimary },
  groupMeta: { fontFamily: FontFamily.regular, fontSize: FontSize.xs, color: Colors.textSecondary },
  groupBadge: { minWidth: 48, paddingHorizontal: Spacing[2], paddingVertical: Spacing[1], borderRadius: Radius.full, alignItems: 'center', backgroundColor: withOpacity(Colors.coach, 0.12) },
  groupBadgeText: { fontFamily: FontFamily.bold, fontSize: FontSize.xs, color: Colors.coach },
  dayHighlight: { padding: Spacing[3], borderRadius: Radius.lg, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.surface2, gap: 4, marginBottom: Spacing[3] },
  dayHighlightLabel: { fontFamily: FontFamily.semibold, fontSize: FontSize.xs, color: Colors.coach },
  dayHighlightText: { fontFamily: FontFamily.regular, fontSize: FontSize.sm, lineHeight: 20, color: Colors.textSecondary },
  messageList: { gap: Spacing[3] },
  messageRow: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing[3] },
  dot: { width: 8, height: 8, borderRadius: Radius.full, marginTop: 7 },
  dotAI: { backgroundColor: Colors.coach },
  dotUser: { backgroundColor: Colors.nutrition },
  messageCopy: { flex: 1, gap: 2, paddingBottom: Spacing[3], borderBottomWidth: 1, borderBottomColor: Colors.border },
  messageRole: { fontFamily: FontFamily.bold, fontSize: FontSize.xs, color: Colors.textPrimary },
  messageText: { fontFamily: FontFamily.regular, fontSize: FontSize.sm, lineHeight: 20, color: Colors.textSecondary },
});
