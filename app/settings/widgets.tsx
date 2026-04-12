import React, { useEffect, useMemo, useState } from 'react';

import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import { router } from 'expo-router';

import SafeScreen from '@/components/ui/SafeScreen';

import { Header } from '@/components/layout/Header';

import Card from '@/components/ui/Card';

import Button from '@/components/ui/Button';

import { Colors, withOpacity } from '@/constants/colors';

import { FontFamily, FontSize, Radius, Spacing } from '@/constants/theme';

import { supabase } from '@/lib/supabase';

import { useAuthStore } from '@/stores/authStore';

import { useUIStore } from '@/stores/uiStore';

import { useReadiness } from '@/hooks/useReadiness';

import { Routes } from '@/constants/routes';

import {

  WIDGET_FOCUS_OPTIONS,

  WIDGET_SURFACE_DEFINITIONS,

  getWidgetFocus,

  getWidgetFocusOption,

  getWidgetCoverageStateCopy,

  withWidgetFocus,

  isWidgetFocusAllowed,

  type WidgetFocus,

} from '@/lib/widget-settings';

import { getWidgetStatus, requestPinWidget } from '@/lib/widget-native';



type NativeWidgetStatus = {

  pinSupported: boolean;

  compactPinned: boolean;

  expandedPinned: boolean;

};



type WidgetIconName = React.ComponentProps<typeof Ionicons>['name'];



function Metric({ label, value, accent }: { label: string; value: string; accent: string }) {

  return (

    <View style={styles.metricCard}>

      <Text

        style={[styles.metricValue, { color: accent }]}

        numberOfLines={1}

        adjustsFontSizeToFit

        minimumFontScale={0.7}

      >

        {value}

      </Text>

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



function FormatCard({

  title,

  state,

  body,

  hint,

  icon,

  accent,

}: {

  title: string;

  state: string;

  body: string;

  hint: string;

  icon: WidgetIconName;

  accent: string;

}) {

  return (

    <View style={styles.formatCard}>

      <View style={styles.formatHeader}>

        <View style={[styles.formatIcon, { backgroundColor: withOpacity(accent, 0.14) }]}>

          <Ionicons name={icon} size={18} color={accent} />

        </View>

        <View style={styles.formatCopy}>

          <Text style={styles.formatTitle}>{title}</Text>

          <View style={[styles.formatPill, { borderColor: withOpacity(accent, 0.28), backgroundColor: withOpacity(accent, 0.12) }]}>

            <Text style={[styles.formatPillText, { color: accent }]}>{state}</Text>

          </View>

        </View>

      </View>

      <Text style={styles.formatBody}>{body}</Text>

      <Text style={styles.formatHint}>{hint}</Text>

    </View>

  );

}



function routeForWidgetFocus(focus: WidgetFocus) {

  switch (focus) {

    case 'summary':

      return Routes.dailySummary;

    case 'kora':

      return Routes.kora;

    case 'steps':

      return Routes.steps.index;

    case 'water':

      return Routes.water.index;

    case 'workout':

      return Routes.workout.index;

    case 'sleep':

      return Routes.sleep.index;

    case 'nutrition':

      return Routes.nutrition.index;

    case 'fasting':

      return Routes.fasting.index;

    case 'weight':

      return Routes.weight.index;

    case 'female':

      return Routes.female.index;

    default:

      return Routes.dailySummary;

  }

}



export default function WidgetSettingsScreen() {

  const { profile, updateProfile } = useAuthStore();

  const showToast = useUIStore((state) => state.showToast);

  const [selected, setSelected] = useState<WidgetFocus>(getWidgetFocus(profile));

  const [saving, setSaving] = useState(false);

  const [widgetStatus, setWidgetStatus] = useState<NativeWidgetStatus>({ pinSupported: false, compactPinned: false, expandedPinned: false });

  const [pinningKind, setPinningKind] = useState<'compact' | 'expanded' | null>(null);

  const {

    dailyScore,

    predictedScore,

    weeklyAverage,

    scoreColor,

    similarDayComparison,

    focusActions,

    morningNarrative,

  } = useReadiness();



  useEffect(() => {

    setSelected(getWidgetFocus(profile));

  }, [profile?.coach_memory_json, profile?.id]);



  useEffect(() => {

    void refreshWidgetStatus();

  }, []);



  const installedCount = useMemo(() => Number(widgetStatus.compactPinned) + Number(widgetStatus.expandedPinned), [widgetStatus.compactPinned, widgetStatus.expandedPinned]);

  const selectedOption = getWidgetFocusOption(selected);

  const coverageState = getWidgetCoverageStateCopy(installedCount, widgetStatus.pinSupported);

  const coachName = profile?.coach_name_preference ?? 'Vyra';

  const focusAction = focusActions[0] ?? null;

  const dayScore = dailyScore?.score != null ? Math.round(dailyScore.score) : null;

  const dayScoreAccent = dayScore !== null ? scoreColor(dayScore) : Colors.steps;

  const scoreVsWeek = dayScore !== null && weeklyAverage !== null ? Math.round(dayScore - weeklyAverage) : null;

  const compactPending = !widgetStatus.compactPinned;

  const expandedPending = !widgetStatus.expandedPinned;

  const coveragePercent = Math.round((installedCount / 2) * 100);

  const coverageAccent = installedCount === 2 ? Colors.steps : installedCount === 1 ? Colors.coach : Colors.warning;

  const launcherCoverage = coverageState.coverageLabel;

  const activeFormat = installedCount === 0

    ? 'Sin anclar'

    : widgetStatus.compactPinned && widgetStatus.expandedPinned

      ? 'Doble'

      : widgetStatus.compactPinned

        ? 'Compacto'

        : 'Expandido';

  const preferredStartKind = dayScore !== null && dayScore < 65 ? 'compacto' : selected === 'summary' || selected === 'kora' ? 'expandido' : 'compacto';

  const nextMountMode = coverageState.nextMode;

  const compactState = widgetStatus.compactPinned ? 'Listo' : widgetStatus.pinSupported ? 'Pendiente' : 'Manual';

  const expandedState = widgetStatus.expandedPinned ? 'Listo' : widgetStatus.pinSupported ? 'Pendiente' : 'Manual';

  const compactHint = widgetStatus.compactPinned

    ? 'Ya protege score, racha y siguiente accion sin abrir la app.'

    : widgetStatus.pinSupported

      ? 'Es la base mas rapida para montar retorno desde el escritorio.'

      : 'Tu launcher pide montarlo a mano, pero sigue siendo la salida minima mas util.';

  const expandedHint = widgetStatus.expandedPinned

    ? 'Ya deja semana, score y contexto en una sola lectura larga.'

    : widgetStatus.pinSupported

      ? 'Completa la capa visible cuando necesitas mas contexto del dia.'

      : 'Si cabe en tu launcher, agregalo manualmente para cerrar mejor la lectura del dia.';

  const launcherTitle = coverageState.title;

  const launcherBody = installedCount === 0

    ? `${coverageState.body} Hoy conviene empezar por ${preferredStartKind} para que el escritorio deje de depender de abrir la app completa.`

    : installedCount === 1

      ? `${coverageState.body} Ahora mismo ${widgetStatus.compactPinned ? 'compacto' : 'expandido'} ya esta vivo. Falta ${widgetStatus.compactPinned ? 'expandido' : 'compacto'} para cerrar la capa visible.`

      : `${coverageState.body} Compacto y expandido ya estan montados. El siguiente ajuste util es afinar el foco en ${selectedOption.title.toLowerCase()} y sostener esa lectura.`;

  const nextMountTitle = installedCount === 0

    ? `Empieza por ${preferredStartKind}`

    : compactPending

      ? 'Completa con compacto'

      : expandedPending

        ? 'Completa con expandido'

        : selected === 'summary'

          ? 'Deja el resumen al frente'

          : selected === 'kora'

            ? 'Deja el coach a un toque'

            : `Sostener ${selectedOption.title.toLowerCase()} como foco`;

  const nextMountHint = installedCount === 0

    ? preferredStartKind === 'compacto'

      ? 'Compacto gana cuando quieres score, racha y accion rapida sin saturar el escritorio.'

      : 'Expandido gana cuando quieres semana, score y contexto en la misma primera mirada.'

    : compactPending

      ? 'Compacto cierra la lectura minima y te devuelve la siguiente accion en un vistazo.'

      : expandedPending

        ? 'Expandido cierra contexto de semana y deja menos ida y vuelta al abrir la app.'

        : dayScore !== null && dayScore < 65

          ? 'Con los dos formatos montados, ahora conviene proteger el dia y no seguir cambiando el panel.'

          : 'Con la cobertura lista, el siguiente paso real es limpiar friccion y sostener el foco correcto.';

  const returnMode = installedCount === 2 && dayScore !== null && dayScore < 65

    ? 'Cuidar'

    : installedCount === 2 && (selected === 'summary' || selected === 'kora')

      ? 'Guiar'

      : coverageState.returnMode;

  const coachTitle = installedCount === 0

    ? `${coachName} quiere fijar una salida real en el escritorio antes de pedir mas memoria.`

    : installedCount === 1

      ? `${coachName} ve un widget vivo, pero quiere completar la capa visible del dia.`

      : dayScore !== null && dayScore < 65

        ? `${coachName} quiere proteger el retorno del dia antes de tocar mas el panel.`

        : selected === 'summary'

          ? `${coachName} quiere que el widget abra con la lectura correcta del dia.`

          : selected === 'kora'

            ? `${coachName} quiere que el widget te devuelva contexto emocional rapido.`

            : `${coachName} quiere que el widget sostenga ${selectedOption.title.toLowerCase()} sin meter friccion.`;

  const coachBody =

    similarDayComparison?.message ??

    morningNarrative ??

    (installedCount === 0

      ? 'Widgets gana valor cuando deja de ser solo una opcion bonita y pasa a poner la siguiente decision util delante de tus ojos.'

      : `Ahora mismo tienes ${installedCount} widget${installedCount === 1 ? '' : 's'} activo${installedCount === 1 ? '' : 's'} y el foco principal esta en ${selectedOption.title.toLowerCase()}.`);

  const coachHint = installedCount === 0

    ? widgetStatus.pinSupported

      ? 'Siguiente lectura util: agrega el widget compacto y luego revisa si tambien conviene fijar el expandido.'

      : 'Siguiente lectura util: si tu launcher no permite pinning, agrega el widget manualmente y vuelve para afinar el foco.'

    : installedCount === 1

      ? 'Siguiente lectura util: si el espacio lo permite, completa el stack con el segundo widget para que el dia no dependa de abrir la app.'

      : focusAction

        ? `Siguiente lectura util: ${focusAction.title}.`

        : dayScore !== null && dayScore < 65

          ? 'Siguiente lectura util: si el score viene bajo, resumen y coach ordenan mejor el dia antes de tocar mas ajustes.'

          : `Siguiente lectura util: si ${selectedOption.title.toLowerCase()} ya esta bien elegido, el siguiente paso es limpiar friccion y sostener retorno.`;

  const routeActionTitle = installedCount === 0

    ? 'Montar la capa visible del dia'

    : installedCount === 1

      ? 'Completar el stack del escritorio'

      : dayScore !== null && dayScore < 65

        ? 'Proteger el dia antes de retocar'

        : selected === 'summary' || selected === 'kora'

          ? 'Guiar el dia desde afuera de la app'

          : `Sostener ${selectedOption.title.toLowerCase()} en primer plano`;

  const primaryActionLabel = installedCount === 0

    ? (widgetStatus.pinSupported ? 'Agregar compacto' : 'Abrir resumen')

    : installedCount === 1 && widgetStatus.pinSupported

      ? 'Agregar expandido'

      : focusAction

        ? 'Seguir foco'

        : dayScore !== null && dayScore < 65

          ? 'Abrir resumen'

          : selected === 'kora'

            ? 'Abrir coach'

            : 'Abrir foco';



  const refreshWidgetStatus = async () => {

    try {

      setWidgetStatus(await getWidgetStatus());

    } catch {

      // ignore temporary bridge read failures

    }

  };



  const saveFocus = async (next: WidgetFocus) => {

    if (!profile?.id || saving) return;

    if (!isWidgetFocusAllowed(profile, next)) {

      router.push(Routes.premium.paywall as never);

      return;

    }



    setSelected(next);

    setSaving(true);

    try {

      const currentMemory = profile.coach_memory_json && typeof profile.coach_memory_json === 'object'

        ? (profile.coach_memory_json as Record<string, unknown>)

        : {};

      const nextMemory = withWidgetFocus(currentMemory, next);

      const { error } = await supabase

        .from('profiles')

        .update({ coach_memory_json: nextMemory, updated_at: new Date().toISOString() })

        .eq('id', profile.id);



      if (error) throw error;

      updateProfile({ coach_memory_json: nextMemory });

      showToast(`Widget maestro ahora prioriza ${getWidgetFocusOption(next).title.toLowerCase()}.`, 'success');

    } catch {

      showToast('No se pudo actualizar el enfoque del widget.', 'error');

    } finally {

      setSaving(false);

    }

  };



  const handlePinWidget = async (kind: 'compact' | 'expanded') => {

    if (pinningKind) return;

    setPinningKind(kind);

    try {

      const accepted = await requestPinWidget(kind);

      if (accepted) {

        showToast(kind === 'compact' ? 'El launcher acepto agregar el widget compacto.' : 'El launcher acepto agregar el widget expandido.', 'success');

      } else {

        showToast('Tu launcher no permitio fijar el widget desde la app.', 'warning');

      }

    } catch {

      showToast('No se pudo solicitar el widget al launcher.', 'error');

    } finally {

      setPinningKind(null);

      setTimeout(() => {

        void refreshWidgetStatus();

      }, 900);

    }

  };



  const handlePrimaryAction = async () => {

    if (installedCount === 0) {

      if (widgetStatus.pinSupported) {

        await handlePinWidget('compact');

        return;

      }

      router.push(Routes.dailySummary as never);

      return;

    }

    if (installedCount === 1 && widgetStatus.pinSupported) {

      await handlePinWidget(widgetStatus.compactPinned ? 'expanded' : 'compact');

      return;

    }

    if (focusAction) {

      router.push(focusAction.route as never);

      return;

    }

    if (dayScore !== null && dayScore < 65) {

      router.push(Routes.dailySummary as never);

      return;

    }

    router.push(routeForWidgetFocus(selected) as never);

  };



  return (

    <SafeScreen padHorizontal={false} padBottom>

      <Header title="Widgets" subtitle="Que quieres ver primero fuera de la app" showBack color={Colors.steps} />



      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        <Card style={styles.routeCard} accentColor={Colors.coach}>

          <Text style={styles.routeEyebrow}>Coach contextual</Text>

          <Text style={styles.routeTitle}>{coachTitle}</Text>

          <Text style={styles.routeBody} numberOfLines={3}>{coachBody}</Text>



          <View style={styles.routeStatsRow}>

            <RouteStat

              label="Score"

              value={dayScore !== null ? `${dayScore}` : '--'}

              hint={dayScore !== null ? `cierre ${predictedScore ?? dayScore}` : 'sin lectura'}

              accent={dayScoreAccent}

            />

            <RouteStat

              label="Retorno"

              value={returnMode}

              hint={`${installedCount}/2 widgets`}

              accent={installedCount === 0 ? Colors.warning : Colors.coach}

            />

            <RouteStat

              label="Ritmo"

              value={scoreVsWeek !== null ? `${scoreVsWeek > 0 ? '+' : ''}${scoreVsWeek}` : `${selectedOption.shortTitle}`}

              hint={scoreVsWeek !== null ? 'vs semana' : selectedOption.launcherCue}

              accent={scoreVsWeek !== null && scoreVsWeek < 0 ? Colors.warning : Colors.textPrimary}

            />

          </View>



          <View style={styles.routeActionRow}>

            <View style={styles.routeActionCopy}>

              <Text style={styles.routeActionLabel}>Siguiente lectura</Text>

              <Text style={styles.routeActionTitle}>{routeActionTitle}</Text>

              <Text style={styles.routeActionHint} numberOfLines={3}>{coachHint}</Text>

            </View>

          </View>



          <View style={styles.routeButtons}>

            <Button onPress={() => void handlePrimaryAction()} label={primaryActionLabel} size="sm" color={Colors.coach} />

            <Button onPress={() => router.push(Routes.coach.index as never)} label="Abrir coach" size="sm" variant="secondary" color={Colors.coach} />

            <Button onPress={() => router.push(Routes.dailySummary as never)} label="Abrir resumen" size="sm" variant="ghost" color={Colors.coach} />

          </View>

        </Card>



        <Card style={styles.heroCard} accentColor={Colors.steps}>

          <View style={styles.heroHeader}>

            <View style={styles.heroCopy}>

              <Text style={styles.eyebrow}>Pantalla de inicio</Text>

              <Text style={styles.heroTitle} numberOfLines={3}>El widget maestro ya puede priorizar justo el dato que mas consultas fuera de la app.</Text>

              <Text style={styles.heroBody} numberOfLines={2}>Desde aqui decides si el launcher abre con {selectedOption.widgetLabel.toLowerCase()} y que formato conviene fijar primero.</Text>

            </View>

            <View style={styles.heroBadge}>

              <Ionicons name="phone-portrait-outline" size={22} color={Colors.steps} />

            </View>

          </View>



          <View style={styles.metricRow}>

            <Metric label="Instalados" value={String(installedCount)} accent={Colors.steps} />

            <Metric label="Launcher" value={widgetStatus.pinSupported ? 'Smart pin' : 'Manual'} accent={Colors.coach} />

            <Metric label="Foco" value={getWidgetFocusOption(selected).shortTitle} accent={Colors.textPrimary} />

          </View>

        </Card>



        <Card style={styles.launcherCard} accentColor={Colors.steps}>

          <Text style={styles.launcherEyebrow}>Cobertura del launcher</Text>

          <Text style={styles.launcherTitle}>{launcherTitle}</Text>

          <Text style={styles.launcherBody}>{launcherBody}</Text>



          <View style={styles.routeStatsRow}>

            <RouteStat

              label="Cobertura"

              value={`${coveragePercent}%`}

              hint={`${installedCount}/2 montados`}

              accent={coverageAccent}

            />

            <RouteStat

              label="Formato"

              value={activeFormat}

              hint={launcherCoverage}

              accent={installedCount === 0 ? Colors.warning : Colors.textPrimary}

            />

            <RouteStat

              label="Montaje"

              value={nextMountMode}

              hint={widgetStatus.pinSupported ? 'launcher listo' : 'agrega a mano'}

              accent={widgetStatus.pinSupported ? Colors.coach : Colors.warning}

            />

          </View>



          <View style={styles.formatGrid}>

            <FormatCard

              title={WIDGET_SURFACE_DEFINITIONS.compact.title}

              state={compactState}

              body={WIDGET_SURFACE_DEFINITIONS.compact.body}

              hint={compactHint}

              icon="phone-portrait-outline"

              accent={widgetStatus.compactPinned ? Colors.steps : Colors.coach}

            />

            <FormatCard

              title={WIDGET_SURFACE_DEFINITIONS.expanded.title}

              state={expandedState}

              body={WIDGET_SURFACE_DEFINITIONS.expanded.body}

              hint={expandedHint}

              icon="tablet-landscape-outline"

              accent={widgetStatus.expandedPinned ? Colors.steps : Colors.textPrimary}

            />

          </View>



          <View style={styles.launcherAction}>

            <Text style={styles.launcherActionLabel}>Siguiente montaje util</Text>

            <Text style={styles.launcherActionTitle}>{nextMountTitle}</Text>

            <Text style={styles.launcherActionHint}>{nextMountHint}</Text>

          </View>

        </Card>



        <Card>

          <View style={styles.sectionHeader}>

            <View style={styles.sectionCopy}>

              <Text style={styles.sectionTitle}>Instalar en el escritorio</Text>

              <Text style={styles.sectionBody}>Si tu launcher lo soporta, puedes fijar el widget sin salir de VYRA.</Text>

            </View>

            <Button size="utility" variant="secondary" color={Colors.steps} onPress={() => void refreshWidgetStatus()}>

              Actualizar

            </Button>

          </View>



          <View style={styles.widgetStack}>

            {[

              {

                id: 'compact' as const,

                title: WIDGET_SURFACE_DEFINITIONS.compact.installTitle,

                body: WIDGET_SURFACE_DEFINITIONS.compact.installBody,

                pinned: widgetStatus.compactPinned,

              },

              {

                id: 'expanded' as const,

                title: WIDGET_SURFACE_DEFINITIONS.expanded.installTitle,

                body: WIDGET_SURFACE_DEFINITIONS.expanded.installBody,

                pinned: widgetStatus.expandedPinned,

              },

            ].map((item) => (

              <View key={item.id} style={styles.widgetRow}>

                <View style={styles.widgetCopy}>

                  <Text style={styles.widgetTitle}>{item.title}</Text>

                  <Text style={styles.widgetBody}>{item.body}</Text>

                </View>

                <View style={styles.widgetActions}>

                  <View style={[styles.statusPill, item.pinned && styles.statusPillActive]}>

                    <Text style={[styles.statusText, item.pinned && styles.statusTextActive]}>{item.pinned ? 'Agregado' : 'Pendiente'}</Text>

                  </View>

                  <Button size="utility" onPress={() => void handlePinWidget(item.id)} disabled={pinningKind !== null} color={Colors.steps}>

                    {pinningKind === item.id ? 'Abriendo...' : 'Agregar'}

                  </Button>

                </View>

              </View>

            ))}

          </View>



          {!widgetStatus.pinSupported ? (

            <View style={styles.noteRow}>

              <Ionicons name="information-circle-outline" size={16} color={Colors.textMuted} />

              <Text style={styles.noteText}>Si tu launcher no soporta pinning directo, agrega el widget manualmente desde el escritorio.</Text>

            </View>

          ) : null}

        </Card>



        <Card>

          <Text style={styles.sectionTitle}>Enfoque del widget maestro</Text>

          <Text style={styles.sectionBody}>Elige que historia quieres ver primero cada vez que desbloqueas el telefono.</Text>

          <View style={styles.optionStack}>

            {WIDGET_FOCUS_OPTIONS.map((option) => {

              const isActive = selected === option.id;

              const isLocked = !isWidgetFocusAllowed(profile, option.id);

              return (

                <Pressable

                  key={option.id}

                  onPress={() => void saveFocus(option.id)}

                  disabled={saving}

                  style={[styles.optionRow, isActive && styles.optionRowActive, isLocked && styles.optionRowLocked]}

                >

                  <View style={[styles.optionIcon, isActive && styles.optionIconActive]}>

                    <Ionicons name={isLocked ? 'lock-closed-outline' : 'grid-outline'} size={18} color={isActive ? Colors.steps : Colors.textMuted} />

                  </View>

                  <View style={styles.optionCopy}>

                    <View style={styles.optionTopRow}>

                      <Text style={[styles.optionTitle, isActive && styles.optionTitleActive]}>{option.title}</Text>

                      {isLocked ? <View style={styles.lockPill}><Text style={styles.lockText}>Premium</Text></View> : null}

                    </View>

                    <Text style={styles.optionBody}>{option.description}</Text>

                  </View>

                  {!isLocked ? <View style={[styles.optionDot, isActive && styles.optionDotActive]} /> : null}

                </Pressable>

              );

            })}

          </View>

        </Card>

      </ScrollView>

    </SafeScreen>

  );

}



const styles = StyleSheet.create({

  scroll: { paddingHorizontal: Spacing[5], paddingTop: Spacing[5], paddingBottom: Spacing[12], gap: Spacing[4] },

  heroCard: { gap: Spacing[4] },

  heroHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: Spacing[3] },

  heroCopy: { flex: 1, gap: 6 },

  eyebrow: { fontFamily: FontFamily.bold, fontSize: FontSize.xs, color: Colors.steps },

  heroTitle: { fontFamily: FontFamily.bold, fontSize: FontSize.xl, color: Colors.textPrimary, lineHeight: 28 },

  heroBody: { fontFamily: FontFamily.regular, fontSize: FontSize.sm, lineHeight: 20, color: Colors.textSecondary },

  heroBadge: { width: 46, height: 46, borderRadius: Radius.full, alignItems: 'center', justifyContent: 'center', backgroundColor: withOpacity(Colors.steps, 0.14) },

  metricRow: { flexDirection: 'row', gap: Spacing[2] },

  metricCard: { flex: 1, minWidth: 0, padding: Spacing[3], borderRadius: Radius.lg, borderWidth: 1, borderColor: Colors.border, backgroundColor: withOpacity(Colors.white, 0.04), gap: 4 },

  metricValue: { fontFamily: FontFamily.bold, fontSize: FontSize.sm },

  metricLabel: { fontFamily: FontFamily.medium, fontSize: FontSize.xs, color: Colors.textSecondary },

  routeCard: { gap: Spacing[4] },

  routeEyebrow: { fontFamily: FontFamily.bold, fontSize: FontSize.xs, color: Colors.coach },

  routeTitle: { fontFamily: FontFamily.bold, fontSize: FontSize.xl, color: Colors.textPrimary, lineHeight: 28 },

  routeBody: { fontFamily: FontFamily.regular, fontSize: FontSize.sm, lineHeight: 20, color: Colors.textSecondary },

  routeStatsRow: { flexDirection: 'row', gap: Spacing[2] },

  routeStat: { flex: 1, minWidth: 0, padding: Spacing[3], borderRadius: Radius.lg, borderWidth: 1, borderColor: Colors.border, backgroundColor: withOpacity(Colors.white, 0.04), gap: 4 },

  routeStatLabel: { fontFamily: FontFamily.medium, fontSize: FontSize.xs, color: Colors.textMuted },

  routeStatValue: { fontFamily: FontFamily.bold, fontSize: FontSize.sm },

  routeStatHint: { fontFamily: FontFamily.medium, fontSize: FontSize.xs, color: Colors.textSecondary },

  routeActionRow: { borderRadius: Radius.lg, borderWidth: 1, borderColor: withOpacity(Colors.coach, 0.24), backgroundColor: withOpacity(Colors.coach, 0.1), padding: Spacing[3] },

  routeActionCopy: { gap: 4 },

  routeActionLabel: { fontFamily: FontFamily.medium, fontSize: FontSize.xs, color: Colors.coach },

  routeActionTitle: { fontFamily: FontFamily.bold, fontSize: FontSize.base, color: Colors.textPrimary },

  routeActionHint: { fontFamily: FontFamily.regular, fontSize: FontSize.sm, lineHeight: 20, color: Colors.textSecondary },

  routeButtons: { flexDirection: 'row', gap: Spacing[2], flexWrap: 'wrap' },

  launcherCard: { gap: Spacing[4] },

  launcherEyebrow: { fontFamily: FontFamily.bold, fontSize: FontSize.xs, color: Colors.steps },

  launcherTitle: { fontFamily: FontFamily.bold, fontSize: FontSize.xl, color: Colors.textPrimary, lineHeight: 28 },

  launcherBody: { fontFamily: FontFamily.regular, fontSize: FontSize.sm, lineHeight: 20, color: Colors.textSecondary },

  formatGrid: { gap: Spacing[3] },

  formatCard: { gap: Spacing[3], borderRadius: Radius.xl, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.surface2, padding: Spacing[3] },

  formatHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing[3] },

  formatIcon: { width: 40, height: 40, borderRadius: Radius.full, alignItems: 'center', justifyContent: 'center' },

  formatCopy: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: Spacing[2] },

  formatTitle: { fontFamily: FontFamily.bold, fontSize: FontSize.base, color: Colors.textPrimary },

  formatPill: { borderRadius: Radius.full, borderWidth: 1, paddingHorizontal: Spacing[3], paddingVertical: 5 },

  formatPillText: { fontFamily: FontFamily.medium, fontSize: FontSize.xs },

  formatBody: { fontFamily: FontFamily.regular, fontSize: FontSize.sm, lineHeight: 20, color: Colors.textPrimary },

  formatHint: { fontFamily: FontFamily.regular, fontSize: FontSize.xs, lineHeight: 18, color: Colors.textSecondary },

  launcherAction: { borderRadius: Radius.lg, borderWidth: 1, borderColor: withOpacity(Colors.steps, 0.24), backgroundColor: withOpacity(Colors.steps, 0.1), padding: Spacing[3], gap: 4 },

  launcherActionLabel: { fontFamily: FontFamily.medium, fontSize: FontSize.xs, color: Colors.steps },

  launcherActionTitle: { fontFamily: FontFamily.bold, fontSize: FontSize.base, color: Colors.textPrimary },

  launcherActionHint: { fontFamily: FontFamily.regular, fontSize: FontSize.sm, lineHeight: 20, color: Colors.textSecondary },

  sectionHeader: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: Spacing[3], marginBottom: Spacing[4] },

  sectionCopy: { flex: 1, gap: 4 },

  sectionTitle: { fontFamily: FontFamily.bold, fontSize: FontSize.lg, color: Colors.textPrimary, marginBottom: Spacing[2] },

  sectionBody: { fontFamily: FontFamily.regular, fontSize: FontSize.sm, lineHeight: 20, color: Colors.textSecondary },

  widgetStack: { gap: Spacing[3] },

  widgetRow: { gap: Spacing[3], borderRadius: Radius.xl, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.surface2, padding: Spacing[3] },

  widgetCopy: { gap: 4 },

  widgetTitle: { fontFamily: FontFamily.bold, fontSize: FontSize.base, color: Colors.textPrimary },

  widgetBody: { fontFamily: FontFamily.regular, fontSize: FontSize.sm, lineHeight: 20, color: Colors.textSecondary },

  widgetActions: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: Spacing[3] },

  statusPill: { borderRadius: Radius.full, borderWidth: 1, borderColor: Colors.border, backgroundColor: withOpacity(Colors.white, 0.04), paddingHorizontal: Spacing[3], paddingVertical: 6 },

  statusPillActive: { borderColor: withOpacity(Colors.steps, 0.34), backgroundColor: withOpacity(Colors.steps, 0.12) },

  statusText: { fontFamily: FontFamily.medium, fontSize: FontSize.xs, color: Colors.textSecondary },

  statusTextActive: { color: Colors.steps },

  noteRow: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing[2], marginTop: Spacing[3] },

  noteText: { flex: 1, fontFamily: FontFamily.regular, fontSize: FontSize.xs, lineHeight: 18, color: Colors.textMuted },

  optionStack: { gap: Spacing[2] },

  optionRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing[3], borderWidth: 1, borderColor: Colors.border, borderRadius: Radius.xl, backgroundColor: Colors.surface2, paddingHorizontal: Spacing[3], paddingVertical: Spacing[3] },

  optionRowActive: { borderColor: withOpacity(Colors.steps, 0.32), backgroundColor: withOpacity(Colors.steps, 0.09) },

  optionRowLocked: { opacity: 0.74 },

  optionIcon: { width: 42, height: 42, borderRadius: Radius.full, alignItems: 'center', justifyContent: 'center', backgroundColor: withOpacity(Colors.white, 0.05) },

  optionIconActive: { backgroundColor: withOpacity(Colors.steps, 0.14) },

  optionCopy: { flex: 1, gap: 4 },

  optionTopRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: Spacing[2] },

  optionTitle: { fontFamily: FontFamily.bold, fontSize: FontSize.base, color: Colors.textPrimary },

  optionTitleActive: { color: Colors.steps },

  optionBody: { fontFamily: FontFamily.regular, fontSize: FontSize.xs, lineHeight: 18, color: Colors.textSecondary },

  optionDot: { width: 18, height: 18, borderRadius: Radius.full, borderWidth: 2, borderColor: Colors.border },

  optionDotActive: { borderColor: Colors.steps, backgroundColor: Colors.steps },

  lockPill: { borderRadius: Radius.full, borderWidth: 1, borderColor: withOpacity(Colors.steps, 0.34), backgroundColor: withOpacity(Colors.steps, 0.12), paddingHorizontal: Spacing[2], paddingVertical: 4 },

  lockText: { fontFamily: FontFamily.medium, fontSize: 11, color: Colors.steps },

});

