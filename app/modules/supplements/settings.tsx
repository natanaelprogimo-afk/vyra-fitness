import React from 'react';

import { Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import { router } from 'expo-router';

import SafeScreen from '@/components/ui/SafeScreen';

import Header from '@/components/layout/Header';

import Card from '@/components/ui/Card';

import Button from '@/components/ui/Button';

import { Colors, withOpacity } from '@/constants/colors';

import { FontFamily, FontSize, Radius, Spacing } from '@/constants/theme';

import { Routes } from '@/constants/routes';

import { useSupplements } from '@/hooks/useSupplements';

import { useReadiness } from '@/hooks/useReadiness';

import { useAuthStore } from '@/stores/authStore';

import { useSettingsStore } from '@/stores/settingsStore';



const TABS = [

  { label: 'Hoy', route: Routes.supplements.index },

  { label: 'Historial', route: Routes.supplements.history },

  { label: 'Ajustes', route: Routes.supplements.settings },

] as const;



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



export default function SupplementsSettingsScreen() {

  const profile = useAuthStore((state) => state.profile);

  const notificationsEnabled = useSettingsStore((s) => s.notificationsEnabled);

  const hapticsEnabled = useSettingsStore((s) => s.hapticsEnabled);

  const setNotificationsEnabled = useSettingsStore((s) => s.setNotificationsEnabled);

  const setHapticsEnabled = useSettingsStore((s) => s.setHapticsEnabled);

  const {

    supplements,

    interactionWarnings,

    deactivateSupplement,

    dailyAdherenceStreak,

  } = useSupplements();

  const {

    dailyScore,

    predictedScore,

    weeklyAverage,

    scoreColor,

    similarDayComparison,

    focusActions,

    morningNarrative,

  } = useReadiness();



  const activeSupps = supplements.filter((supp) => supp.active);

  const coachName = profile?.coach_name_preference ?? 'Vyra';

  const focusAction = focusActions[0] ?? null;

  const dayScore = dailyScore?.score != null ? Math.round(dailyScore.score) : null;

  const dayScoreAccent = dayScore !== null ? scoreColor(dayScore) : Colors.supplements;

  const scoreVsWeek = dayScore !== null && weeklyAverage !== null ? Math.round(dayScore - weeklyAverage) : null;

  const reminderCoverage = activeSupps.length

    ? Math.round((activeSupps.filter((supp) => supp.reminder_times.length > 0).length / activeSupps.length) * 100)

    : 0;

  const strongestSupplement =

    activeSupps.find((supp) => supp.reminder_times.length > 0 && supp.frequency === 'daily') ?? activeSupps[0] ?? null;

  const needsReminderSetup = activeSupps.length > 0 && reminderCoverage < 100;

  const hasInteractionWarnings = interactionWarnings.length > 0;



  const returnMode = !activeSupps.length

    ? 'Configurar'

    : !notificationsEnabled

      ? 'Activar'

      : hasInteractionWarnings

        ? 'Revisar'

        : needsReminderSetup

          ? 'Ordenar'

          : dailyAdherenceStreak >= 3

            ? 'Sostener'

            : 'Corregir';



  const coachTitle = !activeSupps.length

    ? `${coachName} quiere construir un stack simple antes de afinar ajustes.`

    : !notificationsEnabled

      ? `${coachName} quiere recuperar avisos antes de dejar el stack solo.`

      : hasInteractionWarnings

        ? `${coachName} quiere revisar interacciones antes de sostener adherencia.`

        : needsReminderSetup

          ? `${coachName} ve un stack util, pero todavia con recordatorios desparejos.`

          : dailyAdherenceStreak >= 3

            ? `${coachName} ve una configuracion lista para sostener la semana sin friccion.`

            : `${coachName} quiere limpiar el panel para que el stack vuelva a respirar mejor.`;



  const coachBody = hasInteractionWarnings

    ? interactionWarnings[0]?.message ?? 'Las interacciones merecen una revision corta antes de seguir acumulando tomas.'

    : similarDayComparison?.message ??

      morningNarrative ??

      (!activeSupps.length

        ? 'Sin suplementos activos, ajustes no puede decirte mucho del retorno: primero conviene construir una base minima.'

        : needsReminderSetup

          ? 'Cuando faltan recordatorios, la adherencia suele depender de memoria. Ajustar eso vale mas que tocar el stack a ciegas.'

          : 'El panel ya esta bastante cerca de lo util. La pregunta correcta ahora es si conviene sostener, simplificar o volver al flujo.');



  const coachHint = !activeSupps.length

    ? 'Siguiente lectura util: abre el hub y agrega el primer suplemento con una frecuencia clara.'

    : !notificationsEnabled

      ? 'Siguiente lectura util: recupera avisos antes de pedirle disciplina a un stack que hoy depende de memoria.'

      : hasInteractionWarnings

        ? 'Siguiente lectura util: abre el stack y revisa si conviene separar horarios o pausar una combinacion.'

        : needsReminderSetup

          ? 'Siguiente lectura util: cubre los suplementos sin recordatorio para que el retorno no dependa de suerte.'

          : focusAction

            ? `Siguiente lectura util: ${focusAction.title}.`

            : strongestSupplement

              ? `Siguiente lectura util: usa ${strongestSupplement.name} como referencia y simplifica lo que hoy agrega ruido.`

              : 'Siguiente lectura util: vuelve al hub y confirma si hoy toca sostener o corregir el stack.';



  const primaryActionLabel = !activeSupps.length

    ? 'Abrir suplementos'

    : !notificationsEnabled

      ? 'Abrir avisos'

      : hasInteractionWarnings || needsReminderSetup

        ? 'Gestionar stack'

        : focusAction?.title ?? 'Abrir resumen';



  const handlePrimaryAction = () => {

    if (!activeSupps.length) {

      router.push(Routes.supplements.index as any);

      return;

    }

    if (!notificationsEnabled) {

      router.push(Routes.settings.notificationsSettings as any);

      return;

    }

    if (hasInteractionWarnings || needsReminderSetup) {

      router.push(Routes.supplements.index as any);

      return;

    }

    if (focusAction) {

      router.push(focusAction.route as any);

      return;

    }

    router.push(Routes.dailySummary as any);

  };



  return (

    <SafeScreen padHorizontal={false} padBottom>

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>

        <Header

          color={Colors.supplements}

          eyebrow="Suplementos"

          title="La configuracion del stack tiene que ayudarte a sostenerlo, simplificarlo y detectar riesgos rapido."

          subtitle={activeSupps.length ? `${activeSupps.length} suplementos activos | Cobertura ${reminderCoverage}%` : 'Sin stack activo'}

          rightElement={

            <Pressable

              style={[styles.headerIconButton, { borderColor: withOpacity(Colors.supplements, 0.24) }]}

              onPress={() => router.push(Routes.settings.notificationsSettings as any)}

            >

              <Ionicons name="notifications-outline" size={18} color={Colors.textPrimary} />

            </Pressable>

          }

        />



        <Card accentColor={Colors.supplements} style={styles.heroCard}>

          <Text style={styles.heroTitle}>Centro de control del stack</Text>

          <Text style={styles.heroBody}>

            Desde aqui ajustas avisos, haptica, riesgos de interaccion y el orden minimo para que el stack no dependa de memoria.

          </Text>

          <View style={styles.heroActions}>

            <Button onPress={() => router.push(Routes.supplements.index as any)} label="Gestionar stack" color={Colors.supplements} fullWidth />

            <Button onPress={() => router.push(Routes.settings.notificationsSettings as any)} label="Abrir avisos" variant="secondary" color={Colors.supplements} fullWidth />

          </View>

        </Card>



        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabRow}>

          {TABS.map((tab) => {

            const isActive = tab.route === Routes.supplements.settings;

            return (

              <Pressable

                key={tab.label}

                style={[

                  styles.tab,

                  isActive && { borderColor: withOpacity(Colors.supplements, 0.32), backgroundColor: withOpacity(Colors.supplements, 0.12) },

                ]}

                onPress={() => router.push(tab.route as any)}

              >

                <Text style={[styles.tabText, isActive && { color: Colors.supplements }]}>{tab.label}</Text>

              </Pressable>

            );

          })}

        </ScrollView>



        <Card style={styles.coachCard}>

          <View style={styles.sectionHeader}>

            <Text style={styles.coachEyebrow}>Coach contextual</Text>

            <Text style={styles.coachTitle}>{coachTitle}</Text>

            <Text style={styles.coachBody}>{coachBody}</Text>

          </View>



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

              hint={activeSupps.length ? `${activeSupps.length} activos` : 'sin stack'}

              accent={Colors.coach}

            />

            <RouteStat

              label="Ritmo"

              value={scoreVsWeek !== null ? `${scoreVsWeek > 0 ? '+' : ''}${scoreVsWeek}` : `${reminderCoverage}%`}

              hint={scoreVsWeek !== null ? 'vs. semana' : 'cobertura avisos'}

              accent={scoreVsWeek !== null && scoreVsWeek < 0 ? Colors.warning : Colors.textPrimary}

            />

          </View>



          <View style={styles.routeActionRow}>

            <View style={styles.routeActionCopy}>

              <Text style={styles.routeActionLabel}>Siguiente lectura</Text>

              <Text style={styles.routeActionTitle}>

                {!activeSupps.length

                  ? 'Construir la primera base'

                  : !notificationsEnabled

                    ? 'Activar avisos antes de perder el ritmo'

                    : hasInteractionWarnings

                      ? 'Revisar riesgos del stack'

                      : needsReminderSetup

                        ? 'Ordenar recordatorios antes de sostener'

                        : 'El panel ya esta listo para acompanar'}

              </Text>

              <Text style={styles.routeActionHint}>{coachHint}</Text>

            </View>

            <View style={styles.routeButtons}>

              <Button onPress={handlePrimaryAction} label={primaryActionLabel} size="sm" color={Colors.coach} />

              <Button onPress={() => router.push(Routes.coach.index as any)} label="Abrir coach" size="sm" variant="secondary" color={Colors.coach} />

              <Button onPress={() => router.push(Routes.dailySummary as any)} label="Abrir resumen" size="sm" variant="ghost" color={Colors.coach} />

            </View>

          </View>

        </Card>



        <Card accentColor={Colors.info}>

          <SectionHeader

            title="Ruta del panel"

            hint="Una lectura corta para decidir si hoy conviene simplificar, ordenar o sostener el stack."

          />

          <View style={styles.routeList}>

            <View style={styles.routeListItem}>

              <Text style={styles.routeListLabel}>Cobertura de avisos</Text>

              <Text style={styles.routeListValue}>{activeSupps.length ? `${reminderCoverage}%` : 'Sin stack'}</Text>

              <Text style={styles.routeListHint}>

                {activeSupps.length

                  ? `${activeSupps.filter((supp) => supp.reminder_times.length > 0).length} de ${activeSupps.length} suplementos tienen horarios definidos.`

                  : 'Primero conviene crear una base minima para que ajustes tenga algo real que proteger.'}

              </Text>

            </View>

            <View style={styles.routeListItem}>

              <Text style={styles.routeListLabel}>Interacciones</Text>

              <Text style={styles.routeListValue}>{hasInteractionWarnings ? 'Revisar' : 'Limpio'}</Text>

              <Text style={styles.routeListHint}>

                {hasInteractionWarnings

                  ? interactionWarnings[0]?.message ?? 'Hay combinaciones que conviene revisar.'

                  : 'No hay alertas visibles ahora mismo, asi que el panel puede enfocarse en adherencia y ritmo.'}

              </Text>

            </View>

            <View style={styles.routeListItem}>

              <Text style={styles.routeListLabel}>Constancia</Text>

              <Text style={styles.routeListValue}>{dailyAdherenceStreak} dias</Text>

              <Text style={styles.routeListHint}>

                {dailyAdherenceStreak >= 3

                  ? 'La racha ya sostiene retorno: evita tocar de mas y prioriza que el stack siga simple.'

                  : 'Todavia vale mas construir una secuencia clara que agregar complejidad al stack.'}

              </Text>

            </View>

          </View>

        </Card>



        <Card>

          <SectionHeader

            title="Preferencias"

            hint="Mantiene visibles solo los avisos y el feedback que realmente ayudan a cumplir."

          />

          <View style={styles.switchRow}>

            <View style={styles.switchCopy}>

              <Text style={styles.switchLabel}>Notificaciones activas</Text>

              <Text style={styles.switchHint}>Recordatorios de toma y resumenes del stack.</Text>

            </View>

            <Switch

              value={notificationsEnabled}

              onValueChange={setNotificationsEnabled}

              trackColor={{ false: Colors.border, true: `${Colors.supplements}66` }}

              thumbColor={notificationsEnabled ? Colors.supplements : Colors.textMuted}

            />

          </View>

          <View style={styles.switchRow}>

            <View style={styles.switchCopy}>

              <Text style={styles.switchLabel}>Haptica</Text>

              <Text style={styles.switchHint}>Feedback tactil al marcar tomas o confirmar cambios del stack.</Text>

            </View>

            <Switch

              value={hapticsEnabled}

              onValueChange={setHapticsEnabled}

              trackColor={{ false: Colors.border, true: `${Colors.supplements}66` }}

              thumbColor={hapticsEnabled ? Colors.supplements : Colors.textMuted}

            />

          </View>

        </Card>



        {interactionWarnings.length ? (

          <Card accentColor={Colors.warning}>

            <SectionHeader

              title="Alertas de interaccion"

              hint="No reemplazan consejo medico, pero si ayudan a detectar combinaciones que conviene revisar."

            />

            <View style={styles.warningList}>

              {interactionWarnings.map((warning) => (

                <View key={warning.id} style={styles.warningRow}>

                  <View style={styles.warningDot} />

                  <Text style={styles.warningText}>{warning.message}</Text>

                </View>

              ))}

            </View>

          </Card>

        ) : null}



        <Card>

          <SectionHeader

            title="Suplementos activos"

            hint="Pausa rapido lo que no estes usando para que la adherencia refleje tu stack real."

          />

          {activeSupps.length === 0 ? (

            <Text style={styles.emptyText}>No tienes suplementos activos.</Text>

          ) : (

            activeSupps.map((item) => (

              <View key={item.id} style={styles.suppRow}>

                <View style={styles.suppCopy}>

                  <Text style={styles.suppTitle}>{item.name}</Text>

                  <Text style={styles.suppSub}>

                    {item.dose}

                    {item.unit} | {item.frequency === 'daily' ? 'Diario' : item.frequency}

                  </Text>

                  <Text style={styles.suppMeta}>

                    {item.reminder_times.length ? item.reminder_times.join(' / ') : 'Sin horario definido'}

                  </Text>

                </View>

                <Pressable style={styles.pauseBtn} onPress={() => deactivateSupplement(item.id)}>

                  <Text style={styles.pauseText}>Pausar</Text>

                </Pressable>

              </View>

            ))

          )}

        </Card>

      </ScrollView>

    </SafeScreen>

  );

}



const styles = StyleSheet.create({

  container: {

    paddingHorizontal: Spacing[5],

    paddingTop: Spacing[5],

    paddingBottom: Spacing[10],

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

  heroCard: { gap: Spacing[3] },

  heroTitle: { fontFamily: FontFamily.bold, fontSize: FontSize.lg, color: Colors.textPrimary },

  heroBody: { fontFamily: FontFamily.regular, fontSize: FontSize.sm, color: Colors.textSecondary, lineHeight: 20 },

  heroActions: { gap: Spacing[2] },

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

  coachCard: { gap: Spacing[4] },

  coachEyebrow: {

    fontFamily: FontFamily.semibold,

    fontSize: FontSize.xs,

    letterSpacing: 1.1,

    textTransform: 'uppercase',

    color: Colors.coach,

  },

  coachTitle: { fontFamily: FontFamily.bold, fontSize: FontSize.lg, color: Colors.textPrimary },

  coachBody: { fontFamily: FontFamily.regular, fontSize: FontSize.sm, lineHeight: 20, color: Colors.textSecondary },

  routeStatsRow: { flexDirection: 'row', gap: Spacing[2] },

  routeStat: {

    flex: 1,

    borderRadius: Radius.xl,

    borderWidth: 1,

    borderColor: Colors.border,

    backgroundColor: Colors.surface2,

    paddingHorizontal: Spacing[3],

    paddingVertical: Spacing[3],

    gap: 4,

  },

  routeStatLabel: {

    fontFamily: FontFamily.semibold,

    fontSize: FontSize.xs,

    textTransform: 'uppercase',

    letterSpacing: 0.8,

    color: Colors.textMuted,

  },

  routeStatValue: { fontFamily: FontFamily.bold, fontSize: FontSize.lg },

  routeStatHint: { fontFamily: FontFamily.regular, fontSize: FontSize.xs, color: Colors.textSecondary, lineHeight: 16 },

  routeActionRow: {

    flexDirection: 'row',

    gap: Spacing[3],

    alignItems: 'flex-start',

    justifyContent: 'space-between',

  },

  routeActionCopy: { flex: 1, gap: 6 },

  routeActionLabel: {

    fontFamily: FontFamily.semibold,

    fontSize: FontSize.xs,

    letterSpacing: 0.8,

    textTransform: 'uppercase',

    color: Colors.textMuted,

  },

  routeActionTitle: { fontFamily: FontFamily.bold, fontSize: FontSize.base, color: Colors.textPrimary },

  routeActionHint: { fontFamily: FontFamily.regular, fontSize: FontSize.sm, lineHeight: 20, color: Colors.textSecondary },

  routeButtons: { width: 148, gap: Spacing[2] },

  routeList: { gap: Spacing[3] },

  routeListItem: {

    borderRadius: Radius.lg,

    borderWidth: 1,

    borderColor: Colors.border,

    backgroundColor: Colors.surface2,

    paddingHorizontal: Spacing[3],

    paddingVertical: Spacing[3],

    gap: 4,

  },

  routeListLabel: {

    fontFamily: FontFamily.semibold,

    fontSize: FontSize.xs,

    textTransform: 'uppercase',

    letterSpacing: 0.8,

    color: Colors.textMuted,

  },

  routeListValue: { fontFamily: FontFamily.bold, fontSize: FontSize.base, color: Colors.textPrimary },

  routeListHint: { fontFamily: FontFamily.regular, fontSize: FontSize.sm, color: Colors.textSecondary, lineHeight: 20 },

  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: Spacing[3], paddingVertical: Spacing[1] },

  switchCopy: { flex: 1, gap: 4 },

  switchLabel: { fontFamily: FontFamily.bold, fontSize: FontSize.sm, color: Colors.textPrimary },

  switchHint: { fontFamily: FontFamily.regular, fontSize: FontSize.sm, color: Colors.textSecondary, lineHeight: 20 },

  warningList: { gap: Spacing[2] },

  warningRow: { flexDirection: 'row', gap: Spacing[2], alignItems: 'flex-start' },

  warningDot: { width: 8, height: 8, borderRadius: 4, marginTop: 6, backgroundColor: Colors.warning },

  warningText: { flex: 1, fontFamily: FontFamily.regular, fontSize: FontSize.sm, color: Colors.textSecondary, lineHeight: 20 },

  suppRow: {

    flexDirection: 'row',

    justifyContent: 'space-between',

    alignItems: 'center',

    paddingVertical: Spacing[2],

    gap: Spacing[3],

    borderTopWidth: 1,

    borderTopColor: Colors.border,

  },

  suppCopy: { flex: 1, gap: 4 },

  suppTitle: { fontFamily: FontFamily.bold, fontSize: FontSize.sm, color: Colors.textPrimary },

  suppSub: { fontFamily: FontFamily.regular, fontSize: FontSize.sm, color: Colors.textSecondary },

  suppMeta: { fontFamily: FontFamily.regular, fontSize: FontSize.xs, color: Colors.textMuted },

  pauseBtn: {

    paddingHorizontal: Spacing[3],

    paddingVertical: Spacing[1.5],

    borderRadius: Radius.full,

    borderWidth: 1,

    borderColor: Colors.supplements,

  },

  pauseText: { fontFamily: FontFamily.bold, fontSize: FontSize.xs, color: Colors.supplements },

  emptyText: { fontFamily: FontFamily.regular, fontSize: FontSize.sm, color: Colors.textSecondary, lineHeight: 20 },

});

