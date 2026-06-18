import React, { useEffect, useMemo, useState } from 'react';

import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import { Redirect, router } from 'expo-router';

import SafeScreen from '@/components/ui/SafeScreen';

import { Header } from '@/components/layout/Header';

import Card from '@/components/ui/Card';

import Button from '@/components/ui/Button';

import { Colors, withOpacity } from '@/constants/colors';

import { FontFamily, FontSize, LineHeight, Radius, Spacing } from '@/constants/theme';

import {
  buildLegacyProfileContextUpdate,
  buildProfileContextUpdate,
  getProfileContextMemory,
  shouldFallbackToLegacyProfileContext,
} from '@/lib/profile-context';
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
    case 'balance':

      return Routes.readiness;

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

      return Routes.progress.index;

    case 'female':

      return Routes.female.index;

    default:

      return Routes.readiness;

  }

}



export default function WidgetSettingsScreen() {
  if (!(__DEV__ && process.env.EXPO_PUBLIC_ENABLE_INTERNAL_ROUTES === 'true')) {
    return <Redirect href={Routes.settings.index as never} />;
  }

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

  }, [profile?.context_memory_json, profile?.id]);



  useEffect(() => {

    void refreshWidgetStatus();

  }, []);



  const installedCount = useMemo(() => Number(widgetStatus.compactPinned) + Number(widgetStatus.expandedPinned), [widgetStatus.compactPinned, widgetStatus.expandedPinned]);

  const selectedOption = getWidgetFocusOption(selected);
  const isReadinessFocus = selected === 'summary' || selected === 'balance';

  const coverageState = getWidgetCoverageStateCopy(installedCount, widgetStatus.pinSupported);

  const focusAction = focusActions[0] ?? null;

  const dayScore = dailyScore?.score != null ? Math.round(dailyScore.score) : null;

  const dayScoreAccent = dayScore !== null ? scoreColor(dayScore) : Colors.steps;

  const scoreVsWeek = dayScore !== null && weeklyAverage !== null ? Math.round(dayScore - weeklyAverage) : null;

  const compactPending = !widgetStatus.compactPinned;

  const expandedPending = !widgetStatus.expandedPinned;

  const coveragePercent = Math.round((installedCount / 2) * 100);

  const coverageAccent = installedCount === 2 ? Colors.steps : installedCount === 1 ? Colors.brand : Colors.warning;

  const launcherCoverage = coverageState.coverageLabel;

  const activeFormat = installedCount === 0

    ?  'Sin anclar'

    : widgetStatus.compactPinned && widgetStatus.expandedPinned

      ?  'Doble'

      : widgetStatus.compactPinned

        ?  'Compacto'

        : 'Expandido';

  const preferredStartKind = dayScore !== null && dayScore < 65 ? 'compacto' : isReadinessFocus ? 'expandido' : 'compacto';

  const nextMountMode = coverageState.nextMode;

  const compactState = widgetStatus.compactPinned ? 'Listo' : widgetStatus.pinSupported ? 'Pendiente' : 'Manual';

  const expandedState = widgetStatus.expandedPinned ? 'Listo' : widgetStatus.pinSupported ? 'Pendiente' : 'Manual';

  const compactHint = widgetStatus.compactPinned
    ? 'Ya te deja ver lo importante sin abrir la app.'
    : widgetStatus.pinSupported
      ? 'Es la forma más rápida de tener el dato clave en la pantalla de inicio.'
      : 'Si tu telefono no permite agregarlo desde aquí, puedes ponerlo manualmente desde la pantalla de inicio.';

  const expandedHint = widgetStatus.expandedPinned
    ? 'Ya te muestra resumen y contexto del día de un vistazo.'
    : widgetStatus.pinSupported
      ? 'Completa el compacto cuando necesitas más contexto sin entrar a la app.'
      : 'Si tu telefono lo permite, agregalo manualmente para tener más contexto sin abrir la app.';

  const launcherTitle = coverageState.title;

  const launcherBody = installedCount === 0
    ? `${coverageState.body} Hoy conviene empezar por ${preferredStartKind} para ver algo útil apenas desbloqueas el telefono.`
    : installedCount === 1
      ? `${coverageState.body} Ahora mismo ${widgetStatus.compactPinned ? 'compacto' : 'expandido'} ya está activo. Falta ${widgetStatus.compactPinned ? 'expandido' : 'compacto'} para cerrar mejor la lectura del día.`
      : `${coverageState.body} El siguiente ajuste útil es afinar el foco en ${selectedOption.title.toLowerCase()} y dejarlo estable.`;

  const nextMountTitle = installedCount === 0

    ?  `Empieza por ${preferredStartKind}`

    : compactPending

      ?  'Completa con compacto'

      : expandedPending

        ?  'Completa con expandido'

        : selected === 'summary'

          ?  'Deja el resumen al frente'

          : selected === 'balance'

            ?  'Deja balance al frente'

            : `Sostener ${selectedOption.title.toLowerCase()} como foco`;

  const nextMountHint = installedCount === 0
    ? preferredStartKind === 'compacto'
      ? 'Empieza por compacto si quieres ver lo esencial rápido y sin ruido.'
      : 'Empieza por expandido si prefieres más contexto en la primera mirada.'
    : compactPending
      ? 'Compacto cierra la lectura minima y te devuelve la siguiente acción en un vistazo.'
      : expandedPending
        ? 'Expandido suma contexto sin obligarte a entrar a la app.'
        : dayScore !== null && dayScore < 65
          ? 'Con todo listo, ahora conviene cuidar el día y no seguir tocando ajustes.'
          : 'Con la cobertura lista, lo importante es dejar el foco correcto y no meter más fricción.';

  const returnMode = installedCount === 2 && dayScore !== null && dayScore < 65

    ?  'Cuidar'

    : installedCount === 2 && isReadinessFocus

      ?  'Guiar'

      : coverageState.returnMode;

  const coachTitle = installedCount === 0
    ? 'El primer panel debería mostrar algo realmente útil apenas desbloqueas.'
    : installedCount === 1
      ? 'Ya tienes un panel activo, pero aún puedes dejar la vista mucho más completa.'
      : dayScore !== null && dayScore < 65
        ? 'Hoy conviene una vista simple, clara y sin seguir tocando ajustes.'
        : selected === 'summary'
          ? 'La pantalla de inicio ya puede devolverte la lectura correcta del día.'
          : selected === 'balance'
            ? 'La pantalla de inicio ya puede devolverte tu balance diario de un vistazo.'
            : `La pantalla de inicio ya puede sostener ${selectedOption.title.toLowerCase()} sin meter fricción.`;

  const coachBody =

    similarDayComparison?.message ??

    morningNarrative ??

    (installedCount === 0

      ? 'El panel vale la pena cuando te evita abrir la app solo para mirar lo importante.'
      : `Ahora mismo tienes ${installedCount} panel${installedCount === 1 ? '' : 'es'} activo${installedCount === 1 ? '' : 's'} y el foco principal está en ${selectedOption.title.toLowerCase()}.`);

  const coachHint = installedCount === 0
    ? widgetStatus.pinSupported
      ? 'Empieza por el panel compacto y luego decide si también te sirve el expandido.'
      : 'Agregalo manualmente desde la pantalla de inicio y luego vuelve para ajustar el foco.'
    : installedCount === 1
      ? 'Si tienes espacio, completa con el segundo formato para depender menos de abrir la app.'
      : focusAction
        ? `${focusAction.title}.`
        : dayScore !== null && dayScore < 65
          ? 'Si hoy vienes bajo, resumen e inicio ordenan mejor el día que seguir tocando ajustes.'
          : `Si ${selectedOption.title.toLowerCase()} ya está bien elegido, ahora conviene no meter más ruido.`;

  const routeActionTitle = installedCount === 0
    ? 'Poner algo útil en la pantalla de inicio'
    : installedCount === 1
      ? 'Completar la vista de inicio'
      : dayScore !== null && dayScore < 65
        ? 'Proteger el día antes de retocar'
        : isReadinessFocus
          ? 'Guiar el día desde afuera de la app'
          : `Sostener ${selectedOption.title.toLowerCase()} en primer plano`;

  const primaryActionLabel = installedCount === 0

    ? (widgetStatus.pinSupported ? 'Agregar compacto' : 'Abrir resumen')

    : installedCount === 1 && widgetStatus.pinSupported

      ?  'Agregar expandido'

      : focusAction

        ?  'Seguir foco'

        : dayScore !== null && dayScore < 65

          ?  'Abrir resumen'

          : selected === 'balance'

            ?  'Abrir balance'

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

    setSelected(next);

    setSaving(true);

    try {

      const currentMemory = getProfileContextMemory(profile);

      const nextMemory = withWidgetFocus(currentMemory, next);

      let { error } = await supabase

        .from('profiles')

        .update({ ...buildProfileContextUpdate({ memory: nextMemory }), updated_at: new Date().toISOString() })

        .eq('id', profile.id);



      if (error && shouldFallbackToLegacyProfileContext(error)) {

        const retry = await supabase

          .from('profiles')

          .update({ ...buildLegacyProfileContextUpdate({ memory: nextMemory }), updated_at: new Date().toISOString() })

          .eq('id', profile.id);

        error = retry.error;

      }

      if (error) throw error;

      updateProfile(buildProfileContextUpdate({ memory: nextMemory }));

      showToast(`Widget maestro ahora prioriza ${getWidgetFocusOption(next).title.toLowerCase()}.`, 'success');

    } catch {

      showToast('No se pudo actualizar el enfoque del panel.', 'error');

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

        showToast(kind === 'compact' ? 'Se abrio la solicitud para agregar el panel compacto.' : 'Se abrio la solicitud para agregar el panel expandido.', 'success');

      } else {

        showToast('Tu telefono no permitio agregar el panel desde aqui.', 'warning');

      }

    } catch {

      showToast('No se pudo abrir la solicitud del panel.', 'error');

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

      router.push(Routes.readiness as never);

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

      router.push(Routes.readiness as never);

      return;

    }

    router.push(routeForWidgetFocus(selected) as never);

  };



  return (

    <SafeScreen padHorizontal={false} padBottom>

      <Header title="Widgets de inicio" subtitle="Lo que quieres ver primero fuera de la app" showBack color={Colors.steps} />



      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        <Card style={styles.routeCard} accentColor={Colors.brand}>

          <Text style={styles.routeEyebrow}>Resumen rápido</Text>

          <Text style={styles.routeTitle}>{coachTitle}</Text>

          <Text style={styles.routeBody} numberOfLines={3}>{coachBody}</Text>



          <View style={styles.routeStatsRow}>

            <RouteStat

              label="Día"

              value={dayScore !== null ? `${dayScore}` : '--'}

              hint={dayScore !== null ? `cierre ${predictedScore ?? dayScore}` : 'sin lectura'}

              accent={dayScoreAccent}

            />

            <RouteStat

              label="Vista"

              value={returnMode}

              hint={`${installedCount}/2 paneles`}

              accent={installedCount === 0 ? Colors.warning : Colors.brand}

            />

            <RouteStat

              label="Atajo"

              value={scoreVsWeek !== null ? `${scoreVsWeek > 0 ? '+' : ''}${scoreVsWeek}` : `${selectedOption.shortTitle}`}

              hint={scoreVsWeek !== null ? 'vs semana' : selectedOption.focusCue}

              accent={scoreVsWeek !== null && scoreVsWeek < 0 ? Colors.warning : Colors.textPrimary}

            />

          </View>



          <View style={styles.routeActionRow}>

            <View style={styles.routeActionCopy}>

              <Text style={styles.routeActionLabel}>Lo siguiente</Text>

              <Text style={styles.routeActionTitle}>{routeActionTitle}</Text>

              <Text style={styles.routeActionHint} numberOfLines={3}>{coachHint}</Text>

            </View>

          </View>



          <View style={styles.routeButtons}>

            <Button onPress={() => void handlePrimaryAction()} label={primaryActionLabel} size="sm" color={Colors.brand} />

            <Button onPress={() => router.push(Routes.tabs.home as never)} label="Abrir inicio" size="sm" variant="secondary" color={Colors.brand} />

            <Button onPress={() => router.push(Routes.readiness as never)} label="Abrir resumen" size="sm" variant="ghost" color={Colors.brand} />

          </View>

        </Card>



        <Card style={styles.heroCard} accentColor={Colors.steps}>

          <View style={styles.heroHeader}>

            <View style={styles.heroCopy}>

              <Text style={styles.eyebrow}>Pantalla de inicio</Text>

              <Text style={styles.heroTitle} numberOfLines={3}>El panel maestro ya puede priorizar justo el dato que más consultas fuera de la app.</Text>

              <Text style={styles.heroBody} numberOfLines={2}>Desde aquí decides que quieres ver primero y que formato te sirve más fuera de la app.</Text>

            </View>

            <View style={styles.heroBadge}>

              <Ionicons name="phone-portrait-outline" size={22} color={Colors.steps} />

            </View>

          </View>



          <View style={styles.metricRow}>

            <Metric label="Instalados" value={String(installedCount)} accent={Colors.steps} />

            <Metric label="Anclaje" value={widgetStatus.pinSupported ? 'Directo' : 'Manual'} accent={Colors.brand} />

            <Metric label="Foco" value={getWidgetFocusOption(selected).shortTitle} accent={Colors.textPrimary} />

          </View>

        </Card>



        <Card style={styles.launcherCard} accentColor={Colors.steps}>

          <Text style={styles.launcherEyebrow}>Paneles activos</Text>

          <Text style={styles.launcherTitle}>{launcherTitle}</Text>

          <Text style={styles.launcherBody}>{launcherBody}</Text>



          <View style={styles.routeStatsRow}>

            <RouteStat

              label="Activos"

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

              label="Siguiente"

              value={nextMountMode}

              hint={widgetStatus.pinSupported ? 'listo desde aquí' : 'agrega a mano'}

              accent={widgetStatus.pinSupported ? Colors.brand : Colors.warning}

            />

          </View>



          <View style={styles.formatGrid}>

            <FormatCard

              title={WIDGET_SURFACE_DEFINITIONS.compact.title}

              state={compactState}

              body={WIDGET_SURFACE_DEFINITIONS.compact.body}

              hint={compactHint}

              icon="phone-portrait-outline"

              accent={widgetStatus.compactPinned ? Colors.steps : Colors.brand}

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

            <Text style={styles.launcherActionLabel}>Lo siguiente</Text>

            <Text style={styles.launcherActionTitle}>{nextMountTitle}</Text>

            <Text style={styles.launcherActionHint}>{nextMountHint}</Text>

          </View>

        </Card>



        <Card>

          <View style={styles.sectionHeader}>

            <View style={styles.sectionCopy}>

              <Text style={styles.sectionTitle}>Agregar a la pantalla de inicio</Text>

              <Text style={styles.sectionBody}>Si tu telefono lo permite, puedes agregar el panel sin salir de VYRA.</Text>

            </View>

            <Button size="sm" variant="secondary" color={Colors.steps} onPress={() => void refreshWidgetStatus()}>

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

                  <Button size="sm" onPress={() => void handlePinWidget(item.id)} disabled={pinningKind !== null} color={Colors.steps}>

                    {pinningKind === item.id ? 'Abriendo...' : 'Agregar'}

                  </Button>

                </View>

              </View>

            ))}

          </View>



          {!widgetStatus.pinSupported ? (

            <View style={styles.noteRow}>

              <Ionicons name="information-circle-outline" size={16} color={Colors.textMuted} />

              <Text style={styles.noteText}>Si tu telefono no lo permite desde aquí, agrega el atajo manualmente desde la pantalla de inicio.</Text>

            </View>

          ) : null}

        </Card>



        <Card>

          <Text style={styles.sectionTitle}>Enfoque del panel maestro</Text>

          <Text style={styles.sectionBody}>Elige que historia quieres ver primero cada vez que desbloqueas el telefono.</Text>

          <View style={styles.optionStack}>

            {WIDGET_FOCUS_OPTIONS.map((option) => {

              const isActive = selected === option.id;

              return (

                <Pressable

                  key={option.id}

                  onPress={() => void saveFocus(option.id)}

                  disabled={saving}

                  style={[styles.optionRow, isActive && styles.optionRowActive]}

                  accessibilityRole="radio"

                  accessibilityLabel={option.title}

                  accessibilityHint={option.description}

                  accessibilityState={{ selected: isActive, disabled: saving }}

                  hitSlop={8}

                >

                  <View style={[styles.optionIcon, isActive && styles.optionIconActive]}>

                    <Ionicons name="grid-outline" size={18} color={isActive ? Colors.steps : Colors.textMuted} />

                  </View>

                  <View style={styles.optionCopy}>

                    <View style={styles.optionTopRow}>

                      <Text style={[styles.optionTitle, isActive && styles.optionTitleActive]}>{option.title}</Text>

                    </View>

                    <Text style={styles.optionBody}>{option.description}</Text>

                  </View>

                  <View style={[styles.optionDot, isActive && styles.optionDotActive]} />

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

  heroTitle: { fontFamily: FontFamily.bold, fontSize: FontSize.xl, color: Colors.textPrimary, lineHeight: LineHeight.px28 },

  heroBody: { fontFamily: FontFamily.regular, fontSize: FontSize.sm, lineHeight: LineHeight.px20, color: Colors.textSecondary },

  heroBadge: { width: 46, height: 46, borderRadius: Radius.full, alignItems: 'center', justifyContent: 'center', backgroundColor: withOpacity(Colors.steps, 0.14) },

  metricRow: { flexDirection: 'row', gap: Spacing[2] },

  metricCard: { flex: 1, minWidth: 0, padding: Spacing[3], borderRadius: Radius.lg, borderWidth: 1, borderColor: Colors.border, backgroundColor: withOpacity(Colors.white, 0.04), gap: 4 },

  metricValue: { fontFamily: FontFamily.bold, fontSize: FontSize.sm },

  metricLabel: { fontFamily: FontFamily.medium, fontSize: FontSize.xs, color: Colors.textSecondary },

  routeCard: { gap: Spacing[4] },

  routeEyebrow: { fontFamily: FontFamily.bold, fontSize: FontSize.xs, color: Colors.brand },

  routeTitle: { fontFamily: FontFamily.bold, fontSize: FontSize.xl, color: Colors.textPrimary, lineHeight: LineHeight.px28 },

  routeBody: { fontFamily: FontFamily.regular, fontSize: FontSize.sm, lineHeight: LineHeight.px20, color: Colors.textSecondary },

  routeStatsRow: { flexDirection: 'row', gap: Spacing[2] },

  routeStat: { flex: 1, minWidth: 0, padding: Spacing[3], borderRadius: Radius.lg, borderWidth: 1, borderColor: Colors.border, backgroundColor: withOpacity(Colors.white, 0.04), gap: 4 },

  routeStatLabel: { fontFamily: FontFamily.medium, fontSize: FontSize.xs, color: Colors.textMuted },

  routeStatValue: { fontFamily: FontFamily.bold, fontSize: FontSize.sm },

  routeStatHint: { fontFamily: FontFamily.medium, fontSize: FontSize.xs, color: Colors.textSecondary },

  routeActionRow: { borderRadius: Radius.lg, borderWidth: 1, borderColor: withOpacity(Colors.brand, 0.24), backgroundColor: withOpacity(Colors.brand, 0.1), padding: Spacing[3] },

  routeActionCopy: { gap: 4 },

  routeActionLabel: { fontFamily: FontFamily.medium, fontSize: FontSize.xs, color: Colors.brand },

  routeActionTitle: { fontFamily: FontFamily.bold, fontSize: FontSize.base, color: Colors.textPrimary },

  routeActionHint: { fontFamily: FontFamily.regular, fontSize: FontSize.sm, lineHeight: LineHeight.px20, color: Colors.textSecondary },

  routeButtons: { flexDirection: 'row', gap: Spacing[2], flexWrap: 'wrap' },

  launcherCard: { gap: Spacing[4] },

  launcherEyebrow: { fontFamily: FontFamily.bold, fontSize: FontSize.xs, color: Colors.steps },

  launcherTitle: { fontFamily: FontFamily.bold, fontSize: FontSize.xl, color: Colors.textPrimary, lineHeight: LineHeight.px28 },

  launcherBody: { fontFamily: FontFamily.regular, fontSize: FontSize.sm, lineHeight: LineHeight.px20, color: Colors.textSecondary },

  formatGrid: { gap: Spacing[3] },

  formatCard: { gap: Spacing[3], borderRadius: Radius.xl, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.surface2, padding: Spacing[3] },

  formatHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing[3] },

  formatIcon: { width: 40, height: 40, borderRadius: Radius.full, alignItems: 'center', justifyContent: 'center' },

  formatCopy: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: Spacing[2] },

  formatTitle: { fontFamily: FontFamily.bold, fontSize: FontSize.base, color: Colors.textPrimary },

  formatPill: { borderRadius: Radius.full, borderWidth: 1, paddingHorizontal: Spacing[3], paddingVertical: 5 },

  formatPillText: { fontFamily: FontFamily.medium, fontSize: FontSize.xs },

  formatBody: { fontFamily: FontFamily.regular, fontSize: FontSize.sm, lineHeight: LineHeight.px20, color: Colors.textPrimary },

  formatHint: { fontFamily: FontFamily.regular, fontSize: FontSize.xs, lineHeight: LineHeight.px18, color: Colors.textSecondary },

  launcherAction: { borderRadius: Radius.lg, borderWidth: 1, borderColor: withOpacity(Colors.steps, 0.24), backgroundColor: withOpacity(Colors.steps, 0.1), padding: Spacing[3], gap: 4 },

  launcherActionLabel: { fontFamily: FontFamily.medium, fontSize: FontSize.xs, color: Colors.steps },

  launcherActionTitle: { fontFamily: FontFamily.bold, fontSize: FontSize.base, color: Colors.textPrimary },

  launcherActionHint: { fontFamily: FontFamily.regular, fontSize: FontSize.sm, lineHeight: LineHeight.px20, color: Colors.textSecondary },

  sectionHeader: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: Spacing[3], marginBottom: Spacing[4] },

  sectionCopy: { flex: 1, gap: 4 },

  sectionTitle: { fontFamily: FontFamily.bold, fontSize: FontSize.lg, color: Colors.textPrimary, marginBottom: Spacing[2] },

  sectionBody: { fontFamily: FontFamily.regular, fontSize: FontSize.sm, lineHeight: LineHeight.px20, color: Colors.textSecondary },

  widgetStack: { gap: Spacing[3] },

  widgetRow: { gap: Spacing[3], borderRadius: Radius.xl, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.surface2, padding: Spacing[3] },

  widgetCopy: { gap: 4 },

  widgetTitle: { fontFamily: FontFamily.bold, fontSize: FontSize.base, color: Colors.textPrimary },

  widgetBody: { fontFamily: FontFamily.regular, fontSize: FontSize.sm, lineHeight: LineHeight.px20, color: Colors.textSecondary },

  widgetActions: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: Spacing[3] },

  statusPill: { borderRadius: Radius.full, borderWidth: 1, borderColor: Colors.border, backgroundColor: withOpacity(Colors.white, 0.04), paddingHorizontal: Spacing[3], paddingVertical: 6 },

  statusPillActive: { borderColor: withOpacity(Colors.steps, 0.34), backgroundColor: withOpacity(Colors.steps, 0.12) },

  statusText: { fontFamily: FontFamily.medium, fontSize: FontSize.xs, color: Colors.textSecondary },

  statusTextActive: { color: Colors.steps },

  noteRow: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing[2], marginTop: Spacing[3] },

  noteText: { flex: 1, fontFamily: FontFamily.regular, fontSize: FontSize.xs, lineHeight: LineHeight.px18, color: Colors.textMuted },

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

  optionBody: { fontFamily: FontFamily.regular, fontSize: FontSize.xs, lineHeight: LineHeight.px18, color: Colors.textSecondary },

  optionDot: { width: 18, height: 18, borderRadius: Radius.full, borderWidth: 2, borderColor: Colors.border },

  optionDotActive: { borderColor: Colors.steps, backgroundColor: Colors.steps },

  lockPill: { borderRadius: Radius.full, borderWidth: 1, borderColor: withOpacity(Colors.steps, 0.34), backgroundColor: withOpacity(Colors.steps, 0.12), paddingHorizontal: Spacing[2], paddingVertical: 4 },

  lockText: { fontFamily: FontFamily.medium, fontSize: 11, color: Colors.steps },

});


