import React from 'react';

import { View, Text, StyleSheet, Pressable, Switch, ScrollView } from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import { router } from 'expo-router';

import SafeScreen from '@/components/ui/SafeScreen';

import Header from '@/components/layout/Header';

import Card from '@/components/ui/Card';

import Button from '@/components/ui/Button';

import { Colors, withOpacity } from '@/constants/colors';

import { FontFamily, FontSize, Radius, Spacing } from '@/constants/theme';

import { Routes } from '@/constants/routes';

import { useSettingsStore } from '@/stores/settingsStore';

import { useCoach } from '@/hooks/useCoach';

import { useReadiness } from '@/hooks/useReadiness';



const TABS = [

  { label: 'Chat', route: Routes.coach.index },

  { label: 'Historial', route: Routes.coach.history },

  { label: 'Ajustes', route: Routes.coach.settings },

] as const;



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



function SwitchRow({

  title,

  hint,

  value,

  onValueChange,

}: {

  title: string;

  hint: string;

  value: boolean;

  onValueChange: (value: boolean) => void;

}) {

  return (

    <View style={styles.switchRow}>

      <View style={styles.switchCopy}>

        <Text style={styles.switchLabel}>{title}</Text>

        <Text style={styles.switchHint}>{hint}</Text>

      </View>

      <Switch

        value={value}

        onValueChange={onValueChange}

        trackColor={{ false: Colors.border, true: withOpacity(Colors.coach, 0.45) }}

        thumbColor={value ? Colors.coach : Colors.textMuted}

      />

    </View>

  );

}



export default function CoachSettingsScreen() {

  const notificationsEnabled = useSettingsStore((s) => s.notificationsEnabled);

  const notifCoach = useSettingsStore((s) => s.notifCoach);

  const hapticsEnabled = useSettingsStore((s) => s.hapticsEnabled);

  const toggleNotif = useSettingsStore((s) => s.toggleNotif);

  const setNotificationsEnabled = useSettingsStore((s) => s.setNotificationsEnabled);

  const setHapticsEnabled = useSettingsStore((s) => s.setHapticsEnabled);

  const { coachName, dailyMessagesLeft, isPremium, proactivityLevel } = useCoach();

  const {

    dailyScore,

    predictedScore,

    weeklyAverage,

    scoreColor,

    similarDayComparison,

    focusActions,

    morningNarrative,

  } = useReadiness();



  const focusAction = focusActions[0] ?? null;

  const dayScore = dailyScore?.score != null ? Math.round(dailyScore.score) : null;

  const dayScoreAccent = dayScore !== null ? scoreColor(dayScore) : Colors.coach;

  const scoreVsWeek = dayScore !== null && weeklyAverage !== null ? Math.round(dayScore - weeklyAverage) : null;



  const returnMode = !notificationsEnabled

    ? 'Silencio'

    : !notifCoach

      ? 'Manual'

      : dayScore !== null && dayScore < 65

        ? 'Cuidar'

        : proactivityLevel === 'active'

          ? 'Guiar'

          : 'Sostener';



  const coachTitle = !notificationsEnabled

    ? `${coachName} quiere recuperar la capa de avisos antes de pedirte mas acciones.`

    : !notifCoach

      ? `${coachName} esta en modo manual y quiere devolverte el control sin perder direccion.`

      : dayScore !== null && dayScore < 65

        ? `${coachName} quiere proteger el dia antes de empujar mas proactividad.`

        : proactivityLevel === 'active'

          ? `${coachName} ya esta listo para empujar el dia con una presencia mas alta.`

          : `${coachName} tiene un ajuste equilibrado para sostener el dia sin ruido.`;



  const coachBody = !notificationsEnabled

    ? 'Si los avisos estan apagados, el coach pierde una parte importante de la capa transversal del dia.'

    : !notifCoach

      ? 'Cuando el coach proactivo esta en pausa, el sistema sigue funcionando, pero depende mas de que abras el modulo a tiempo.'

      : similarDayComparison?.message

        ?? morningNarrative

        ?? 'Ajustar el panel del coach tiene mas valor cuando conversa con tu score, el foco del dia y el retorno que quieres proteger.';



  const coachHint = !notificationsEnabled

    ? 'Siguiente lectura util: abre avisos y confirma que el sistema pueda devolverte al hilo correcto.'

    : !notifCoach

      ? 'Siguiente lectura util: si quieres menos ruido pero no perder direccion, deja avisos activos y el coach en manual.'

      : dayScore !== null && dayScore < 65

        ? 'Siguiente lectura util: si el score viene bajo, usa resumen antes de subir la proactividad.'

        : focusAction

          ? `Siguiente lectura util: ${focusAction.title}.`

          : 'Siguiente lectura util: si el panel ya esta limpio, vuelve al coach o al resumen para cerrar el sistema.';



  const routeActionTitle = !notificationsEnabled

    ? 'Recuperar la capa de avisos'

    : !notifCoach

      ? 'Ordenar el modo manual'

      : dayScore !== null && dayScore < 65

        ? 'Proteger el dia antes de empujar'

        : proactivityLevel === 'active'

          ? 'Sostener una guia alta'

          : 'Mantener una proactividad util';



  const primaryActionLabel = !notificationsEnabled

    ? 'Abrir avisos'

    : !notifCoach

      ? 'Abrir coach'

      : focusAction

        ? 'Seguir foco'

        : 'Abrir resumen';



  const handlePrimaryAction = () => {

    if (!notificationsEnabled) {
      
      router.push(Routes.settings.notificationsSettings as any);

      return;
    }

    if (!notifCoach) {

      router.push(Routes.coach.index as any);

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

      <Header title="Ajustes del coach" subtitle="Proactividad, avisos y tono del coach" showBack color={Colors.coach} />


      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>

        <View style={styles.tabs}>
          {TABS.map((tab) => {
            const isActive = tab.route === Routes.coach.settings;
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

              hint={!isPremium && dailyMessagesLeft !== 999 ? `${dailyMessagesLeft} libres` : 'coach activo'}

              accent={Colors.coach}

            />

            <RouteStat

              label="Ritmo"

              value={scoreVsWeek !== null ? `${scoreVsWeek > 0 ? '+' : ''}${scoreVsWeek}` : proactivityLevel === 'active' ? 'Alto' : proactivityLevel === 'silent' ? 'Bajo' : 'Medio'}

              hint={scoreVsWeek !== null ? 'vs. semana' : 'proactividad'}

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
              <Text style={styles.eyebrow}>Control Vyra</Text>
              <Text style={styles.heroTitle} numberOfLines={3}>Ajusta presencia, no ruido.</Text>
              <Text style={styles.heroBody} numberOfLines={2}>Desde aqui decides cuanto empuja el coach y cuanto silencio necesita el sistema.</Text>
            </View>
            <View style={styles.heroIconWrap}>
              <Ionicons name="options-outline" size={22} color={Colors.coach} />
            </View>
          </View>

          <View style={styles.metricRow}>
            <Metric label="avisos" value={notificationsEnabled ? 'Activos' : 'Pausa'} accent={Colors.coach} />
            <Metric label="coach" value={notifCoach ? 'Activo' : 'Manual'} accent={notifCoach ? Colors.success : Colors.textSecondary} />
            <Metric label="haptica" value={hapticsEnabled ? 'Activa' : 'Pausa'} accent={Colors.mental} />
          </View>
        </Card>


        <Card>

          <Text style={styles.sectionTitle}>Ruta del panel</Text>

          <Text style={styles.sectionHint}>Lee rapido si hoy conviene ajustar avisos o sostener el modo actual.</Text>


          <View style={styles.summaryGrid}>

            <View style={styles.summaryBox}>

              <Text style={styles.summaryLabel}>Cobertura</Text>

              <Text style={styles.summaryValue}>{notificationsEnabled ? 'Lista' : 'Incompleta'}</Text>

              <Text style={styles.summaryHint}>avisos del sistema</Text>

            </View>

            <View style={styles.summaryBox}>

              <Text style={styles.summaryLabel}>Modo</Text>

              <Text style={styles.summaryValue}>{notifCoach ? 'Proactivo' : 'Manual'}</Text>

              <Text style={styles.summaryHint}>empuje del coach</Text>

            </View>

            <View style={styles.summaryBox}>

              <Text style={styles.summaryLabel}>Limite</Text>

              <Text style={styles.summaryValue}>{!isPremium && dailyMessagesLeft !== 999 ? `${dailyMessagesLeft}` : 'Libre'}</Text>

              <Text style={styles.summaryHint}>mensajes restantes</Text>

            </View>

          </View>

        </Card>



        <Card>

          <Text style={styles.sectionTitle}>Capas de acompanamiento</Text>

          <Text style={styles.sectionHint}>Activa solo lo necesario para que el coach ayude sin invadir el dia.</Text>
          <View style={styles.switchStack}>

            <SwitchRow title="Notificaciones activas" hint="Permite que VYRA use cualquier capa push o local del sistema." value={notificationsEnabled} onValueChange={setNotificationsEnabled} />

            <SwitchRow title="Coach proactivo" hint="Mensajes automaticos y empujones suaves cuando detecta inercia o huecos." value={notifCoach} onValueChange={() => toggleNotif('notifCoach')} />

            <SwitchRow title="Haptica" hint="Feedback breve al enviar mensajes o ejecutar respuestas rapidas." value={hapticsEnabled} onValueChange={setHapticsEnabled} />

          </View>

        </Card>



        <Card>

          <Text style={styles.sectionTitle}>Ajustes avanzados</Text>

          <Text style={styles.sectionHint}>Especialidad, profundidad del coach y acceso a capas premium.</Text>

          <View style={styles.actionStack}>

            <Button variant="secondary" onPress={() => router.push(Routes.settings.coach as any)} fullWidth color={Colors.coach}>

              Especialidad y proactividad

            </Button>

            <Button variant="secondary" onPress={() => router.push(Routes.premium.paywall as any)} fullWidth color={Colors.coach}>

              Abrir Premium

            </Button>

          </View>

        </Card>



        <Card accentColor={Colors.coach}>

          <Text style={styles.sectionTitle}>Nota operativa</Text>

          <Text style={styles.sectionHint}>El coach puede responder con tu contexto local incluso si la conexion va lenta. Cuando hay internet, sincroniza historial y memoria extendida.</Text>

        </Card>

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

  heroTitle: { fontFamily: FontFamily.bold, fontSize: FontSize.xl, color: Colors.textPrimary, lineHeight: 28 },

  heroBody: { fontFamily: FontFamily.regular, fontSize: FontSize.sm, color: Colors.textSecondary, lineHeight: 20 },

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

  routeTitle: { fontFamily: FontFamily.bold, fontSize: FontSize.lg, color: Colors.textPrimary, lineHeight: 24 },

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

  sectionTitle: { fontFamily: FontFamily.bold, fontSize: FontSize.lg, color: Colors.textPrimary, marginBottom: Spacing[2] },

  sectionHint: { fontFamily: FontFamily.regular, fontSize: FontSize.sm, lineHeight: 20, color: Colors.textSecondary, marginBottom: Spacing[4] },

  summaryGrid: { flexDirection: 'row', gap: Spacing[2] },

  summaryBox: { flex: 1, padding: Spacing[3], borderRadius: Radius.lg, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.surface2, gap: 4 },

  summaryLabel: { fontFamily: FontFamily.medium, fontSize: FontSize.xs, color: Colors.textSecondary },

  summaryValue: { fontFamily: FontFamily.bold, fontSize: FontSize.base, color: Colors.textPrimary },

  summaryHint: { fontFamily: FontFamily.regular, fontSize: FontSize.xs, lineHeight: 16, color: Colors.textMuted },

  switchStack: { gap: Spacing[4] },

  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: Spacing[3] },

  switchCopy: { flex: 1, gap: 2 },

  switchLabel: { fontFamily: FontFamily.bold, fontSize: FontSize.base, color: Colors.textPrimary },

  switchHint: { fontFamily: FontFamily.regular, fontSize: FontSize.sm, lineHeight: 19, color: Colors.textSecondary },

  actionStack: { gap: Spacing[3] },

});

