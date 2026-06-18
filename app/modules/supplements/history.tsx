import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import SafeScreen from '@/components/ui/SafeScreen';
import Header from '@/components/layout/Header';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { EmptyStateFirstUse } from '@/components/ui/EmptyStateVariants';
import { Colors, getModuleBg, getModuleColor, withOpacity } from '@/constants/colors';
import { FontFamily, Radius, Spacing, FontSize } from '@/constants/theme';
import { useSupplements } from '@/hooks/useSupplements';
import { useReadiness } from '@/hooks/useReadiness';
import { useSettingsStore } from '@/stores/settingsStore';
import { Routes } from '@/constants/routes';

const TABS = [
  { label: 'Hoy', route: Routes.supplements.index },
  { label: 'Historial', route: Routes.supplements.history },
  { label: 'Ajustes', route: Routes.supplements.settings },
] as const;

const WEEK_LABELS = ['Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab'];

function getRecentDayKeys(days = 7): string[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const keys: string[] = [];
  for (let i = days - 1; i >= 0; i -= 1) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    keys.push(`${year}-${month}-${day}`);
  }
  return keys;
}

function SectionHeader({ title, hint }: { title: string; hint: string }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <Text style={styles.sectionHint}>{hint}</Text>
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

export default function SupplementsHistoryScreen() {
  const {
    dailyScore,
    predictedScore,
    weeklyAverage,
    scoreColor,
    similarDayComparison,
    focusActions,
    morningNarrative,
  } = useReadiness();
  const {
    supplements,
    getWeeklyHistory,
    getAdherence,
    dailyAdherenceStreak,
    interactionWarnings,
  } = useSupplements();
  const focusMode = useSettingsStore((s) => s.focusMode);
  const accent = getModuleColor('supplements', focusMode);
  const accentBg = getModuleBg('supplements', 0.18, focusMode);

  const activeSupps = useMemo(() => supplements.filter((item) => item.active), [supplements]);
  const [weeklyHistoryBySupplement, setWeeklyHistoryBySupplement] = useState<Record<string, string[]>>({});
  const [adherenceBySupplement, setAdherenceBySupplement] = useState<Record<string, number>>({});

  const recentDayKeys = useMemo(() => getRecentDayKeys(7), []);

  useEffect(() => {
    let mounted = true;
    const loadWeekly = async () => {
      if (!activeSupps.length) {
        setWeeklyHistoryBySupplement((current) => (Object.keys(current).length ? {} : current));
        return;
      }
      const week = await getWeeklyHistory();
      const completedDays = week.filter((entry) => entry.completed).map((entry) => entry.date);
      if (!mounted) return;
      const next: Record<string, string[]> = {};
      for (const item of activeSupps) {
        next[item.id] = completedDays;
      }
      setWeeklyHistoryBySupplement(next);
    };
    void loadWeekly();
    return () => {
      mounted = false;
    };
  }, [activeSupps, getWeeklyHistory]);

  useEffect(() => {
    let mounted = true;
    const loadAdherence = async () => {
      if (!activeSupps.length) {
        setAdherenceBySupplement((current) => (Object.keys(current).length ? {} : current));
        return;
      }
      const entries = await Promise.all(
        activeSupps.map(async (item) => [item.id, await getAdherence(item.id)] as const),
      );
      if (!mounted) return;
      const next: Record<string, number> = {};
      for (const [id, value] of entries) next[id] = value;
      setAdherenceBySupplement(next);
    };
    void loadAdherence();
    return () => {
      mounted = false;
    };
  }, [activeSupps, getAdherence]);

  const dailyCounts = recentDayKeys.map((dayKey) => {
    const taken = activeSupps.filter((supp) => (weeklyHistoryBySupplement[supp.id] ?? []).includes(dayKey)).length;
    return { dayKey, count: taken };
  });

  const weeklyAdherencePct = activeSupps.length
    ?  Math.round((dailyCounts.filter((day) => day.count === activeSupps.length).length / recentDayKeys.length) * 100)
    : 0;
  const maxCount = Math.max(1, ...dailyCounts.map((day) => day.count));
  const hasActiveSupplements = activeSupps.length > 0;
  const focusAction = focusActions[0] ?? null;
  const dayScore = dailyScore?.score != null ? Math.round(dailyScore.score) : null;
  const dayScoreAccent = dayScore !== null ? scoreColor(dayScore) : accent;
  const scoreVsWeek = dayScore !== null && weeklyAverage !== null ? Math.round(dayScore - weeklyAverage) : null;

  const adherenceEntries = activeSupps
    .map((item) => ({ item, value: adherenceBySupplement[item.id] ?? 0 }))
    .sort((a, b) => a.value - b.value);
  const atRiskSupplement = adherenceEntries[0] ?? null;
  const strongestSupplement = adherenceEntries.length ? adherenceEntries[adherenceEntries.length - 1] : null;

  const returnMode = !hasActiveSupplements
    ?  'Configurar'
    : interactionWarnings.length > 0
      ?  'Revisar'
      : weeklyAdherencePct < 60
        ?  'Corregir'
        : dailyAdherenceStreak >= 3
          ?  'Sostener'
          : 'Ordenar';
  const coachTitle = !hasActiveSupplements
    ?  'La lectura actual quiere construir un stack simple antes de hablar de adherencia'
    : interactionWarnings.length > 0
      ?  'La lectura actual quiere revisar riesgos antes de seguir acumulando tomas'
      : weeklyAdherencePct < 60
        ?  'La lectura actual quiere corregir el ritmo del stack antes de que se enfrie la semana'
        : atRiskSupplement && atRiskSupplement.value < 75
          ?  'La lectura actual detecta un suplemento que está rompiendo la constancia del stack'
          : 'La adherencia se ve útil y conviene sostenerla sin ruido';
  const coachBody =
    interactionWarnings[0]?.message ??
    similarDayComparison?.message ??
    morningNarrative ??
    (!hasActiveSupplements
      ?  'Sin un stack mínimo, el historial no puede darte una lectura útil del retorno semanal.'
      : atRiskSupplement && atRiskSupplement.value < 75
        ?  `${atRiskSupplement.item.name} está en ${atRiskSupplement.value}% de adherencia y hoy conviene decidir si lo sostienes, lo ajustas o lo pausas.`
        : 'La adherencia gana valor cuando deja de depender de memoria y se vuelve un ritmo claro del día.');
  const coachHint = !hasActiveSupplements
    ? 'Siguiente lectura útil: agrega el primer suplemento y define una frecuencia clara.'
    : interactionWarnings.length > 0
      ? 'Siguiente lectura útil: abre ajustes y revisa si conviene separar horarios o pausar una combinacion.'
      : atRiskSupplement && atRiskSupplement.value < 75
        ? `Siguiente lectura útil: revisa ${atRiskSupplement.item.name}, porque hoy está marcando el retorno de la semana.`
        : focusAction
          ? `Siguiente lectura útil: ${focusAction.title}.`
          : 'Siguiente lectura útil: vuelve al hub y confirma si hoy toca completar el stack o solo sostenerlo.';
  const primaryActionLabel = !hasActiveSupplements
    ?  'Abrir suplementos'
    : interactionWarnings.length > 0
      ?  'Abrir ajustes'
      : weeklyAdherencePct < 100
        ?  'Volver a hoy'
        : 'Abrir resumen';
  const routeActionTitle = !hasActiveSupplements
    ?  'Construir la primera base'
    : interactionWarnings.length > 0
      ?  'Revisar riesgos del stack'
      : weeklyAdherencePct < 100
        ?  'Corregir la semana activa'
        : 'Sostener el ritmo del stack';

  const handlePrimaryAction = () => {
    if (!hasActiveSupplements) {
      router.push(Routes.supplements.index as never);
      return;
    }
    if (interactionWarnings.length > 0) {
      router.push(Routes.supplements.settings as never);
      return;
    }
    if (weeklyAdherencePct < 100) {
      router.push(Routes.supplements.index as never);
      return;
    }
    router.push(Routes.readiness as never);
  };

  return (
    <SafeScreen padHorizontal={false} padBottom>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <Header
          color={accent}
          eyebrow="Suplementos"
          title="La adherencia gana valor cuando puedes leerla por semana y por suplemento en una sola pasada."
          subtitle={`Adherencia global ${weeklyAdherencePct}% | Racha ${dailyAdherenceStreak} días`}
          rightElement={
            <Pressable
              style={[styles.headerIconButton, { borderColor: withOpacity(accent, 0.24) }]}
              onPress={() => router.push(Routes.supplements.settings as never)}
              accessibilityRole="button"
              accessibilityLabel="Abrir ajustes de suplementos"
              accessibilityHint="Muestra recordatorios y configuración del módulo."
              hitSlop={8}
            >
              <Ionicons name="settings-outline" size={18} color={Colors.textPrimary} />
            </Pressable>
          }
        />

        <Card accentColor={accent} style={styles.heroCard}>
          <View style={styles.heroTopRow}>
            <View style={styles.heroCopy}>
              <View style={[styles.heroBadge, { backgroundColor: accentBg }]}>
                <Ionicons name="medkit-outline" size={16} color={accent} />
                <Text style={[styles.heroBadgeText, { color: accent }]}>Adherencia semanal</Text>
              </View>
              <Text style={styles.heroValue}>{weeklyAdherencePct}%</Text>
              <Text style={styles.heroUnit}>cumplimiento global</Text>
              <Text style={styles.heroHint}>
                Lo importante aquí no es tomarlo perfecto un día, sino ver si el stack realmente se sostiene.
              </Text>
            </View>
            <View style={styles.heroMetaColumn}>
              <View style={styles.metaCard}>
                <Text style={styles.metaLabel}>Activos</Text>
                <Text style={styles.metaValue}>{activeSupps.length}</Text>
              </View>
              <View style={styles.metaCard}>
                <Text style={styles.metaLabel}>Racha</Text>
                <Text style={[styles.metaValue, { color: accent }]}>{dailyAdherenceStreak}</Text>
              </View>
              <View style={styles.metaCard}>
                <Text style={styles.metaLabel}>Ventana</Text>
                <Text style={styles.metaValue}>7 días</Text>
              </View>
            </View>
          </View>
        </Card>

        <Card style={styles.coachCard}>
          <View style={styles.coachSectionHeader}>
            <Text style={styles.coachEyebrow}>Lectura contextual</Text>
            <Text style={styles.coachTitle}>{coachTitle}</Text>
            <Text style={styles.coachBody}>{coachBody}</Text>
          </View>

          <View style={styles.routeStatsRow}>
            <RouteStat
              label="Score"
              value={dayScore !== null ? `${dayScore}` : '--'}
              hint={dayScore !== null ? `cierre ${predictedScore ?? dayScore}` : 'sin lectura todavía'}
              accent={dayScoreAccent}
            />
            <RouteStat
              label="Retorno"
              value={returnMode}
              hint={!hasActiveSupplements ? 'sin stack' : `${weeklyAdherencePct}% semana`}
              accent={Colors.info}
            />
            <RouteStat
              label="Ritmo"
              value={scoreVsWeek !== null ? `${scoreVsWeek > 0 ? '+' : ''}${scoreVsWeek}` : `${dailyAdherenceStreak}`}
              hint={scoreVsWeek !== null ? 'vs. semana' : 'racha útil'}
              accent={scoreVsWeek !== null && scoreVsWeek < 0 ? Colors.warning : Colors.textPrimary}
            />
          </View>

          <View style={styles.routeActionRow}>
            <View style={styles.routeActionCopy}>
              <Text style={styles.routeActionLabel}>Siguiente lectura</Text>
              <Text style={styles.routeActionTitle}>{routeActionTitle}</Text>
              <Text style={styles.routeActionHint}>{coachHint}</Text>
            </View>
            <View style={styles.routeButtons}>
              <Button onPress={handlePrimaryAction} label={primaryActionLabel} size="sm" color={Colors.info} />
              <Button onPress={() => router.push(Routes.tabs.home as never)} label="Abrir inicio" size="sm" variant="secondary" color={Colors.info} />
              <Button onPress={() => router.push(Routes.readiness as never)} label="Abrir resumen" size="sm" variant="ghost" color={Colors.info} />
            </View>
          </View>
        </Card>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabRow}>
          {TABS.map((tab) => {
            const isActive = tab.route === Routes.supplements.history;
            return (
              <Pressable
                key={tab.label}
                style={[
                  styles.tab,
                  isActive && { borderColor: withOpacity(accent, 0.32), backgroundColor: accentBg },
                ]}
                onPress={() => router.push(tab.route as never)}
                accessibilityRole="tab"
                accessibilityLabel={tab.label}
                accessibilityState={{ selected: isActive }}
                hitSlop={8}
              >
                <Text style={[styles.tabText, isActive && { color: accent }]}>{tab.label}</Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {!hasActiveSupplements ? (
          <Card accentColor={accent}>
            <EmptyStateFirstUse
              moduleLabel="Suplementos"
              itemLabel="stack"
              emoji="SUPP"
              tone="brand"
              ctaLabel="Agregar suplemento"
              onCta={() => router.push(Routes.supplements.index as never)}
              subtitle="Activa tu primer suplemento y esta pantalla empezara a mostrar adherencia, racha y cumplimiento semanal."
            />
          </Card>
        ) : (
          <>
            <Card style={styles.contextCard}>
              <Text style={styles.contextTitle}>Ruta del historial</Text>
              <Text style={styles.contextText}>
                {atRiskSupplement && atRiskSupplement.value < 75
                  ?  `${atRiskSupplement.item.name} está frenando la constancia del stack con ${atRiskSupplement.value}% de adherencia.`
                  : `El stack está sosteniendo ${weeklyAdherencePct}% de adherencia semanal con ${activeSupps.length} suplementos activos.`}
              </Text>
              <Text style={styles.contextMeta}>
                {strongestSupplement
                  ? `Base más estable: ${strongestSupplement.item.name} con ${strongestSupplement.value}% de adherencia.`
                  : 'Sin base estable todavía.'}
              </Text>
            </Card>

            <Card accentColor={accent}>
              <SectionHeader
                title="últimos 7 días"
                hint="Una lectura corta de cumplimiento día por día frente a todo lo que tenias activo."
              />
              <View style={styles.weekRow}>
                {dailyCounts.map((item) => {
                  const date = new Date(`${item.dayKey}T00:00:00`);
                  const label = WEEK_LABELS[date.getDay()];
                  const height = 12 + Math.round((item.count / maxCount) * 76);
                  return (
                    <View key={item.dayKey} style={styles.weekCol}>
                      <Text style={styles.weekCount}>{item.count}</Text>
                      <View style={styles.weekTrack}>
                        <View style={[styles.weekBar, { height, backgroundColor: accent }]} />
                      </View>
                      <Text style={styles.weekLabel}>{label}</Text>
                    </View>
                  );
                })}
              </View>
            </Card>

            <Card>
              <SectionHeader
                title="Por suplemento"
                hint="Lectura de adherencia a 30 días para detectar que si sostienes y que está quedando atrás."
              />
              {activeSupps.map((item) => (
                <View key={item.id} style={styles.suppRow}>
                  <View style={styles.suppCopy}>
                    <Text style={styles.suppTitle}>{item.name}</Text>
                    <Text style={styles.suppSub}>
                      {item.dose}
                      {item.unit} | {item.frequency === 'daily' ? 'Diario' : item.frequency}
                    </Text>
                  </View>
                  <View style={styles.adherencePill}>
                    <Text style={styles.adherenceText}>{adherenceBySupplement[item.id] ?? 0}%</Text>
                  </View>
                </View>
              ))}
            </Card>
          </>
        )}
      </ScrollView>
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing[5],
    paddingTop: Spacing[5],
    paddingBottom: Spacing[12] + 112,
    gap: Spacing[4],
  },
  headerIconButton: {
    width: 46,
    height: 46,
    borderRadius: Radius.full,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surface2,
  },
  heroCard: { gap: Spacing[4] },
  heroTopRow: { flexDirection: 'row', gap: Spacing[3], alignItems: 'stretch' },
  heroCopy: { flex: 1, gap: Spacing[2] },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: Spacing[1.5],
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[1.5],
    borderRadius: Radius.full,
  },
  heroBadgeText: { fontFamily: FontFamily.semibold, fontSize: FontSize.xs },
  heroValue: { fontFamily: FontFamily.display, fontSize: 34, color: Colors.textPrimary, letterSpacing: -1 },
  heroUnit: { fontFamily: FontFamily.semibold, fontSize: FontSize.sm, color: Colors.textSecondary },
  heroHint: { fontFamily: FontFamily.regular, fontSize: FontSize.sm, color: Colors.textSecondary, lineHeight: 20 },
  heroMetaColumn: { width: 120, gap: Spacing[2] },
  metaCard: {
    borderRadius: Radius.lg,
    backgroundColor: withOpacity(Colors.white, 0.04),
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing[3],
    gap: 4,
  },
  metaLabel: { fontFamily: FontFamily.medium, fontSize: FontSize.xs, color: Colors.textSecondary },
  metaValue: { fontFamily: FontFamily.bold, fontSize: FontSize.sm, color: Colors.textPrimary, lineHeight: 20 },
  coachCard: { gap: Spacing[4] },
  coachSectionHeader: { gap: Spacing[2] },
  coachEyebrow: {
    fontFamily: FontFamily.bold,
    fontSize: 12,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: Colors.info,
  },
  coachTitle: {
    fontFamily: FontFamily.bold,
    fontSize: 19,
    color: Colors.textPrimary,
    lineHeight: 24,
  },
  coachBody: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    lineHeight: 21,
  },
  routeStatsRow: {
    flexDirection: 'row',
    gap: Spacing[2],
  },
  routeStat: {
    flex: 1,
    borderRadius: Radius.lg,
    backgroundColor: Colors.surface2,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing[3],
    gap: 4,
  },
  routeStatLabel: {
    fontFamily: FontFamily.medium,
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    color: Colors.textMuted,
  },
  routeStatValue: {
    fontFamily: FontFamily.bold,
    fontSize: 18,
  },
  routeStatHint: {
    fontFamily: FontFamily.regular,
    fontSize: 12,
    color: Colors.textSecondary,
  },
  routeActionRow: { gap: Spacing[3] },
  routeActionCopy: { gap: Spacing[1] },
  routeActionLabel: {
    fontFamily: FontFamily.bold,
    fontSize: 12,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: Colors.info,
  },
  routeActionTitle: {
    fontFamily: FontFamily.bold,
    fontSize: 17,
    color: Colors.textPrimary,
  },
  routeActionHint: {
    fontFamily: FontFamily.regular,
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 19,
  },
  routeButtons: { gap: Spacing[2] },
  tabRow: { gap: Spacing[2], paddingRight: Spacing[2] },
  tab: {
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[2],
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface2,
  },
  tabText: { fontFamily: FontFamily.semibold, fontSize: FontSize.sm, color: Colors.textSecondary },
  sectionHeader: { gap: 4, marginBottom: Spacing[3] },
  sectionTitle: { fontFamily: FontFamily.bold, fontSize: FontSize.lg, color: Colors.textPrimary },
  sectionHint: { fontFamily: FontFamily.regular, fontSize: FontSize.sm, color: Colors.textSecondary, lineHeight: 20 },
  contextCard: { gap: Spacing[1] },
  contextTitle: { fontFamily: FontFamily.bold, fontSize: FontSize.md, color: Colors.textPrimary },
  contextText: { fontFamily: FontFamily.regular, fontSize: FontSize.sm, color: Colors.textSecondary, lineHeight: 20 },
  contextMeta: { fontFamily: FontFamily.medium, fontSize: FontSize.xs, color: Colors.textMuted },
  weekRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', gap: Spacing[2] },
  weekCol: { flex: 1, alignItems: 'center', gap: 4 },
  weekCount: { fontFamily: FontFamily.bold, fontSize: FontSize.xs, color: Colors.textSecondary },
  weekTrack: { width: '100%', height: 92, justifyContent: 'flex-end', alignItems: 'center' },
  weekBar: { width: '72%', borderRadius: Radius.lg },
  weekLabel: { fontFamily: FontFamily.medium, fontSize: FontSize.xs, color: Colors.textMuted },
  suppRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: Spacing[3],
    paddingVertical: Spacing[2],
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  suppCopy: { flex: 1, gap: 4 },
  suppTitle: { fontFamily: FontFamily.bold, fontSize: FontSize.md, color: Colors.textPrimary },
  suppSub: { fontFamily: FontFamily.regular, fontSize: FontSize.sm, color: Colors.textSecondary },
  adherencePill: {
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[1.5],
    borderRadius: Radius.full,
    backgroundColor: withOpacity(Colors.supplements, 0.12),
    borderWidth: 1,
    borderColor: Colors.supplements,
  },
  adherenceText: { fontFamily: FontFamily.bold, fontSize: FontSize.xs, color: Colors.supplements },
});
