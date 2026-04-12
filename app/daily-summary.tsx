import React, { useMemo, useState } from 'react';



import { Pressable, ScrollView, StyleSheet, Text, View, Modal } from 'react-native';



import { Ionicons } from '@expo/vector-icons';



import { router } from 'expo-router';



import Svg, { Circle } from 'react-native-svg';



import SafeScreen from '@/components/ui/SafeScreen';



import Header from '@/components/layout/Header';



import Card from '@/components/ui/Card';



import Button from '@/components/ui/Button';



import { RewardedAdButton } from '@/components/ui/RewardedAdButton';



import { Colors, withOpacity } from '@/constants/colors';



import { Routes } from '@/constants/routes';



import { FontFamily, FontSize, Radius, Spacing } from '@/constants/theme';



import { useDashboard } from '@/hooks/useDashboard';



import { useNutrition } from '@/hooks/useNutrition';



import { useWorkout } from '@/hooks/useWorkout';



import { useBadges } from '@/hooks/useBadges';



import { useGamification } from '@/hooks/useGamification';



import { useCoins } from '@/hooks/useCoins';



import { useAuthStore } from '@/stores/authStore';



import { usePremiumStore } from '@/stores/premiumStore';

import { useUIStore } from '@/stores/uiStore';



import { todayISO } from '@/utils/dates';



import { useKora } from '@/hooks/useKora';



import { useDailyTimeline, type TimelineEntry, type TimelineType } from '@/hooks/useDailyTimeline';

import { requestNotificationPermissions, scheduleDailySummaryReminder, scheduleStreakAtRisk } from '@/lib/notifications';







const TIMELINE_META: Record<TimelineType, { icon: keyof typeof Ionicons.glyphMap; accent: string }> = {



  water: { icon: 'water', accent: Colors.water },



  meal: { icon: 'restaurant', accent: Colors.nutrition },



  workout: { icon: 'barbell', accent: Colors.workout },



  sleep: { icon: 'moon', accent: Colors.sleep },



  fasting_start: { icon: 'timer', accent: Colors.fasting },



  fasting_end: { icon: 'timer', accent: Colors.fasting },



  weight: { icon: 'scale', accent: Colors.weight },



  mental: { icon: 'happy', accent: Colors.mental },



};







function getScoreAccent(score: number) {



  if (score >= 70) return Colors.recovery;



  if (score >= 40) return Colors.steps;



  return Colors.error;



}







function getScoreLabel(score: number) {



  if (score >= 80) return 'Da muy slido';



  if (score >= 60) return 'Buen cierre';



  if (score >= 40) return 'Todavía mejorable';



  return 'Necesita ajuste';



}







function ProgressRing({ size, progress, color }: { size: number; progress: number; color: string }) {



  const strokeWidth = 8;



  const radius = (size - strokeWidth) / 2;



  const circumference = 2 * Math.PI * radius;



  const safeProgress = Math.max(0, Math.min(100, progress));



  const offset = circumference - (safeProgress / 100) * circumference;







  return (



    <Svg width={size} height={size}>



      <Circle cx={size / 2} cy={size / 2} r={radius} stroke={withOpacity(color, 0.18)} strokeWidth={strokeWidth} fill="none" />



      <Circle



        cx={size / 2}



        cy={size / 2}



        r={radius}



        stroke={color}



        strokeWidth={strokeWidth}



        fill="none"



        strokeLinecap="round"



        strokeDasharray={circumference}



        strokeDashoffset={offset}



        transform={`rotate(-90, ${size / 2}, ${size / 2})`}



      />



    </Svg>



  );



}







function SectionHeader({ title, hint }: { title: string; hint: string }) {



  return (



    <View style={styles.sectionHeader}>



      <Text style={styles.sectionTitle}>{title}</Text>



      <Text style={styles.sectionHint}>{hint}</Text>



    </View>



  );



}







function SummaryMetric({ icon, label, value, accent }: { icon: keyof typeof Ionicons.glyphMap; label: string; value: string; accent: string }) {



  return (



    <View style={styles.metricRow}>



      <View style={[styles.metricIcon, { backgroundColor: withOpacity(accent, 0.16) }]}>



        <Ionicons name={icon} size={15} color={accent} />



      </View>



      <View style={styles.metricCopy}>



        <Text style={styles.metricLabel}>{label}</Text>



        <Text style={styles.metricValue}>{value}</Text>



      </View>



    </View>



  );



}







function BreakdownBar({ label, value, accent }: { label: string; value: number; accent: string }) {



  const safeValue = Math.max(0, Math.min(100, Math.round(value)));



  return (



    <View style={styles.breakdownRow}>



      <View style={styles.breakdownCopy}>



        <Text style={styles.breakdownLabel}>{label}</Text>



        <Text style={[styles.breakdownValue, { color: accent }]}>{safeValue}%</Text>



      </View>



      <View style={styles.breakdownTrack}>



        <View style={[styles.breakdownFill, { width: `${safeValue}%`, backgroundColor: accent }]} />



      </View>



    </View>



  );



}







function TimelineRow({ entry }: { entry: TimelineEntry }) {



  const meta = TIMELINE_META[entry.type];



  const timeLabel = new Date(entry.timestamp).toLocaleTimeString('es', {



    hour: '2-digit',



    minute: '2-digit',



  });







  return (



    <View style={styles.timelineRow}>



      <Text style={styles.timelineTime}>{timeLabel}</Text>



      <View style={[styles.timelineDot, { backgroundColor: withOpacity(meta.accent, 0.16) }]}>



        <Ionicons name={meta.icon} size={14} color={meta.accent} />



      </View>



      <View style={styles.timelineCopy}>



        <Text style={styles.timelineTitle}>{entry.title}</Text>



        {entry.detail ? <Text style={styles.timelineDetail}>{entry.detail}</Text> : null}



      </View>



    </View>



  );



}







function MetaMetric({ label, value, accent }: { label: string; value: string; accent: string }) {



  return (



    <View style={styles.metaMetric}>



      <Text style={[styles.metaMetricValue, { color: accent }]}>{value}</Text>



      <Text style={styles.metaMetricLabel}>{label}</Text>



    </View>



  );



}







export default function DailySummaryScreen() {



  const profile = useAuthStore((state) => state.profile);



  const { todayData, dailyScore } = useDashboard();



  const { totals, calorieGoal, calorieBudget, activityCalories } = useNutrition();



  const { history, activeSession, getConsistencyStats, getActiveProgram } = useWorkout();



  const { getProgress } = useBadges();



  const { currentTier, dailyChallenge, claimableCount, claimDailyChallenge } = useGamification();



  const { addCoins } = useCoins();



  const isPremium = usePremiumStore((state) => state.isPremium);

  const showToast = useUIStore((state) => state.showToast);



  const { timeline, loading: timelineLoading } = useDailyTimeline();



  const { koraName, descriptor: koraDescriptor, todayTruth: koraTruth } = useKora();



  const [claimingDaily, setClaimingDaily] = useState(false);

  const [schedulingReturnReminder, setSchedulingReturnReminder] = useState(false);







  const consistency = getConsistencyStats();



  const activeProgram = getActiveProgram();



  const badgeProgress = getProgress();



  const streak = profile?.streak ?? profile?.current_streak ?? 0;







  const todayWorkout = useMemo(() => {



    const today = todayISO();



    return history.find((entry) => entry.started_at.startsWith(today)) ?? null;



  }, [history]);







  const score = Math.round(dailyScore?.score ?? 0);



  const scoreAccent = getScoreAccent(score);



  const scoreLabel = dailyScore ? getScoreLabel(score) : 'Todavía sin suficiente contexto';



  const formattedDate = useMemo(() => {



    const raw = new Intl.DateTimeFormat('es', {



      weekday: 'long',



      day: 'numeric',



      month: 'long',



    }).format(new Date());



    return raw.charAt(0).toUpperCase() + raw.slice(1);



  }, []);



  const now = new Date();



  const streakInDanger = streak > 0 && !todayWorkout && now.getHours() >= 20;



  const minutesUntilMidnight = Math.max(0, (23 - now.getHours()) * 60 + (60 - now.getMinutes()));



  const hoursLeft = Math.floor(minutesUntilMidnight / 60);



  const minutesLeft = minutesUntilMidnight % 60;



  const timeLeftLabel = hoursLeft > 0 ? `${hoursLeft}h ${minutesLeft}m` : `${minutesLeft}m`;



  const dailyMissionReady = dailyChallenge.completed && !dailyChallenge.claimed;



  const loopAccent = streakInDanger ? Colors.error : dailyMissionReady || claimableCount > 0 ? Colors.coins : scoreAccent;



  const loopTitle = streakInDanger



    ? 'No cierres as?'



    : dailyMissionReady



      ? 'Recompensa lista'



      : claimableCount > 0



        ? 'Todavía tienes algo por reclamar'



        : 'Cierre con dirección';



  const loopBody = streakInDanger



    ? `Tu racha de ${streak} días entra en riesgo en ${timeLeftLabel}. Haz una acción útil antes de salir y luego vuelve a revisar cómo quedó tu día.`



    : dailyMissionReady



      ? `Tu misión diaria ya quedó lista. Reclama +${dailyChallenge.rewardCoins} coins y +${dailyChallenge.rewardXp} XP para cerrar hoy con retorno real.`



      : claimableCount > 0



        ? `Tienes ${claimableCount} recompensa${claimableCount === 1 ? '' : 's'} esperando. Si las reclamas ahora, mañana vuelves con más impulso.`



        : 'No hay urgencias rojas ahora. Usa progreso, retos o tienda para salir con una siguiente intención clara.';



  const loopStatus = streakInDanger



    ? 'Hoy conviene salvar la racha antes de perseguir métricas bonitas.'



    : dailyMissionReady



      ? 'El mejor cierre ahora mismo es reclamar tu misión diaria.'



      : claimableCount > 0



        ? 'Ya hiciste parte del trabajo: no dejes las recompensas sin cobrar.'



        : 'Cerraste sin alarmas. Ahora toca decidir qué quieres empujar mañana.';



  const loopPrimaryLabel = streakInDanger



    ? 'Salvar racha'



    : dailyMissionReady



      ? 'Reclamar misión'



      : claimableCount > 0



        ? 'Abrir retos'



        : 'Abrir progreso';



  const heroTitle = streakInDanger

    ? 'Todavia puedes salvar el dia.'

    : dailyMissionReady

      ? 'Hoy ya tienes cierre util.'

      : activeSession

        ? 'Cierra el dia con una accion.'

        : todayWorkout

          ? 'Hoy ya cerraste una base util.'

          : 'Cierra el dia con criterio.';


  const heroBody = streakInDanger

    ? `Tu racha entra en riesgo en ${timeLeftLabel}. Haz una accion util antes de salir.`

    : dailyMissionReady

      ? `Tu mision diaria ya esta lista. Reclama +${dailyChallenge.rewardCoins} coins y sal con retorno real.`

      : activeSession

        ? 'Todavia tienes una sesion abierta. Si la cierras, el score final puede moverse.'

        : todayWorkout

          ? 'Entreno cerrado. Ahora toca decidir si reclamas, revisas progreso o preparas manana.'

          : 'Si haces un ultimo registro corto, el cierre y la lectura de manana mejoran.';


  const weightDelta =



    typeof profile?.weight_goal_kg === 'number'



      ? `${profile.weight_goal_kg.toFixed(1)} kg objetivo`



      : 'Meta sin definir';







  const breakdownRows = [



    { label: 'Hidratación', value: dailyScore?.breakdown?.hydration ?? 0, accent: Colors.water },



    { label: 'Sueño', value: dailyScore?.breakdown?.sleep ?? 0, accent: Colors.sleep },



    { label: 'Nutrición', value: dailyScore?.breakdown?.nutrition ?? 0, accent: Colors.nutrition },



    { label: 'Actividad', value: dailyScore?.breakdown?.workout ?? dailyScore?.breakdown?.steps ?? 0, accent: Colors.workout },



  ];



  const handleLoopPrimaryAction = async () => {



    if (streakInDanger) {



      router.push(Routes.workout.index as any);



      return;



    }



    if (dailyMissionReady) {



      setClaimingDaily(true);



      try {



        await claimDailyChallenge();



      } finally {



        setClaimingDaily(false);



      }



      return;



    }



    if (claimableCount > 0) {



      router.push(Routes.gamification.challenges as any);



      return;



    }



    router.push(Routes.tabs.progress as any);



  };



  const handleScheduleReturnReminder = async () => {



    if (schedulingReturnReminder) return;



    setSchedulingReturnReminder(true);



    try {



      const granted = await requestNotificationPermissions();



      if (!granted) {



        showToast('Activa las notificaciones para que VYRA te recuerde volver mañana.', 'warning');



        return;



      }



      await scheduleDailySummaryReminder(21, 0);

      await scheduleStreakAtRisk();



      showToast('Listo. VYRA te recordará volver mañana y te avisará si tu racha entra en riesgo.', 'success', 4200);



    } catch {



      showToast('No pude dejar listo el recordatorio ahora mismo.', 'error');



    } finally {



      setSchedulingReturnReminder(false);



    }



  };



  return (



    <Modal visible transparent animationType="slide">
      <SafeScreen padHorizontal={false} padBottom>



      <Header



        eyebrow="Cierre diario"



        title="Resumen del día"



        subtitle="Score, hitos y siguiente paso."



        color={scoreAccent}



      />







      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>



        <Card accentColor={scoreAccent} style={styles.heroCard}>



          <Text style={styles.heroEyebrow}>{formattedDate}</Text>



          <View style={styles.heroTopRow}>



            <View style={styles.heroCopy}>



              <Text style={styles.heroTitle}>{heroTitle}</Text>



              <Text style={styles.heroBody} numberOfLines={2}>{heroBody}</Text>



            </View>



            <View style={styles.scoreWrap}>



              <ProgressRing size={96} progress={score} color={scoreAccent} />



              <View style={styles.scoreCenter}>



                <Text style={styles.scoreNumber}>{dailyScore ? score : '--'}</Text>



                <Text style={[styles.scoreLabel, { color: scoreAccent }]}>{scoreLabel}</Text>



              </View>



            </View>



          </View>







          <View style={styles.heroFacts}>



            <View style={styles.heroFact}>



              <Text style={[styles.heroFactValue, { color: Colors.workout }]}>{streak}</Text>



              <Text style={styles.heroFactLabel}>racha</Text>



            </View>



            <View style={styles.heroFact}>



              <Text style={[styles.heroFactValue, { color: Colors.coins }]}>{badgeProgress.unlocked}</Text>



              <Text style={styles.heroFactLabel}>badges</Text>



            </View>



            <View style={styles.heroFact}>



              <Text style={[styles.heroFactValue, { color: Colors.mental }]}>{activeProgram ? 'Activo' : 'Libre'}</Text>



              <Text style={styles.heroFactLabel}>programa</Text>



            </View>



          </View>



        </Card>



        <Card accentColor={Colors.brand} style={styles.actionsCard}>



          <SectionHeader



            title="Siguiente paso"



            hint="Si ya cerraste lo básico, sigue a progreso. Si no, registra algo útil y sal."



          />



          <View style={styles.actions}>



            <Button onPress={() => router.push(Routes.tabs.progress as any)} fullWidth>



              Abrir progreso



            </Button>



            <Button onPress={() => router.push(Routes.log as any)} variant="secondary" fullWidth>



              Registro rápido



            </Button>



          </View>



        </Card>



        <Card accentColor={loopAccent} style={styles.loopCard}>



          <View style={styles.sectionHeader}>



            <View style={styles.sectionHeaderCopy}>



              <Text style={[styles.loopEyebrow, { color: loopAccent }]}>CIERRE VIVO</Text>



              <Text style={styles.sectionTitle}>{loopTitle}</Text>



              <Text style={styles.sectionHintLeft} numberOfLines={2}>{loopBody}</Text>



            </View>



            <View style={[styles.rankPill, { backgroundColor: withOpacity(loopAccent, 0.16) }]}>



              <Ionicons



                name={streakInDanger ? 'shield-outline' : dailyMissionReady ? 'gift-outline' : 'compass-outline'}



                size={18}



                color={loopAccent}



              />



              <Text style={[styles.rankPillText, { color: loopAccent }]}>{currentTier.glyph}</Text>



            </View>



          </View>



          <View style={styles.loopStats}>



            <View style={styles.loopStat}>



              <Text style={styles.loopStatValue}>{streak}</Text>



              <Text style={styles.loopStatLabel}>racha</Text>



            </View>



            <View style={styles.loopStat}>



              <Text style={styles.loopStatValue}>{claimableCount}</Text>



              <Text style={styles.loopStatLabel}>claimables</Text>



            </View>



            <View style={styles.loopStat}>



              <Text style={styles.loopStatValue}>{profile?.level ?? 1}</Text>



              <Text style={styles.loopStatLabel}>nivel</Text>



            </View>



          </View>



          <View style={styles.loopStatus}>



            <Ionicons



              name={streakInDanger ? 'warning-outline' : dailyMissionReady ? 'sparkles-outline' : 'checkmark-done-outline'}



              size={16}



              color={loopAccent}



            />



            <Text style={styles.loopStatusText}>{loopStatus}</Text>



          </View>



          <Button



            onPress={() => void handleLoopPrimaryAction()}



            label={loopPrimaryLabel}



            color={loopAccent}



            fullWidth



            loading={dailyMissionReady && claimingDaily}



          />



          <Button



            onPress={() => void handleScheduleReturnReminder()}



            label={schedulingReturnReminder ? 'Activando recordatorio...' : 'Recordarme mañana a las 21:00'}



            accessibilityLabel="Recordarme mañana a las 21:00"



            accessibilityHint="Programa un recordatorio de cierre diario y protección de racha"



            variant="secondary"



            color={Colors.coins}



            fullWidth



            loading={schedulingReturnReminder}



          />



          <View style={styles.loopPills}>



            <Pressable style={styles.loopPill} onPress={() => router.push(Routes.tabs.progress as any)}>



              <Ionicons name="stats-chart-outline" size={14} color={Colors.brandLight} />



              <Text style={styles.loopPillText}>Progreso</Text>



            </Pressable>



            <Pressable style={styles.loopPill} onPress={() => router.push(Routes.gamification.challenges as any)}>



              <Ionicons name="trophy-outline" size={14} color={Colors.warning} />



              <Text style={styles.loopPillText}>Retos</Text>



            </Pressable>



            <Pressable style={styles.loopPill} onPress={() => router.push(Routes.tabs.home as any)}>



              <Ionicons name="home-outline" size={14} color={Colors.brand} />



              <Text style={styles.loopPillText}>Home</Text>



            </Pressable>



          </View>



        </Card>



        <Card accentColor={scoreAccent} style={styles.metricsCard}>



          <SectionHeader



            title="Estado de hoy"



            hint="Las métricas principales aparecen aquí para que entiendas el día sin cambiar de módulo."



          />



          <View style={styles.metricsGrid}>



            <SummaryMetric icon="flame" label="Racha" value={`${streak} días`} accent={Colors.workout} />



            <SummaryMetric



              icon="walk"



              label="Pasos"



              value={`${todayData?.steps?.steps ?? 0} / ${todayData?.stepGoal ?? profile?.step_goal ?? 10000}`}



              accent={Colors.steps}



            />



            <SummaryMetric



              icon="water"



              label="Agua"



              value={`${Math.round(todayData?.water?.total ?? 0)} / ${Math.round(todayData?.water?.goal ?? profile?.water_goal_ml ?? 2500)} ml`}



              accent={Colors.water}



            />



            <SummaryMetric



              icon="moon"



              label="Sueño"



              value={



                todayData?.sleep?.duration_min



                  ? `${Math.round(todayData.sleep.duration_min / 60)}h ${todayData.sleep.duration_min % 60}m`



                  : 'Sin carga'



              }



              accent={Colors.sleep}



            />



            <SummaryMetric



              icon="restaurant"



              label="Calorías"



              value={`${Math.round(totals.calories)} / ${calorieBudget ?? calorieGoal}`}



              accent={Colors.nutrition}



            />



            <SummaryMetric



              icon="barbell"



              label="Entreno"



              value={activeSession ? 'Sesión activa' : todayWorkout ? 'Completado' : 'Pendiente'}



              accent={Colors.workout}



            />



            <SummaryMetric



              icon="timer"



              label="Ayuno"



              value={todayData?.fasting?.start_time ? 'Activo' : 'Sin ayuno activo'}



              accent={Colors.fasting}



            />



            <SummaryMetric icon="scale" label="Peso" value={weightDelta} accent={Colors.weight} />



            {activityCalories > 0 ? (



              <SummaryMetric icon="flash" label="Actividad" value={`+${activityCalories} kcal`} accent={Colors.workout} />



            ) : null}



          </View>



        </Card>







        <Card accentColor={scoreAccent} style={styles.breakdownCard}>



          <SectionHeader



            title="Que empujo tu score"



            hint="No es un juicio del dia: es contexto visual para ver que area sostuvo el cierre y cual necesita apoyo."



          />



          <View style={styles.breakdownList}>



            {breakdownRows.map((item) => (



              <BreakdownBar key={item.label} label={item.label} value={item.value} accent={item.accent} />



            ))}



          </View>



        </Card>







        <Card accentColor={Colors.brand} style={styles.timelineCard}>



          <SectionHeader



            title="Timeline del dia"



            hint="Una lnea simple de lo que hoy ya qued registrado en agua, comida, sueo, entreno y otros módulos."



          />



          {timelineLoading ? (



            <Text style={styles.timelineEmpty}>Cargando actividad...</Text>



          ) : timeline.length > 0 ? (



            <View style={styles.timelineList}>



              {timeline.map((entry) => (



                <TimelineRow key={entry.id} entry={entry} />



              ))}



            </View>



          ) : (



            <Text style={styles.timelineEmpty}>Todavía no hay actividad registrada hoy.</Text>



          )}



        </Card>







        <Card accentColor={Colors.brand} style={styles.explainCard}>



          <SectionHeader



            title="Por que Vyra decidio hoy"



            hint="Abre la explicacion completa de ajustes, senales y correlaciones entre modulos."



          />



          <Button onPress={() => showToast('Explicación no disponible', 'info')} variant="secondary" fullWidth>



            Ver explicacion



          </Button>



        </Card>







        <Card accentColor={Colors.brandLight} style={styles.metaCard}>



          <SectionHeader



            title="Lo que sostiene retencion"



            hint="No todo pesa igual: aquí quedan visibles las palancas que mas empujan continuidad en la semana."



          />



          <View style={styles.metaGrid}>



            <MetaMetric label="Semanas activas" value={`${consistency.activeWeeksLast12}`} accent={Colors.brand} />



            <MetaMetric label="Entrenos semana" value={`${consistency.currentWeekSessions}`} accent={Colors.workout} />



            <MetaMetric label="Badges" value={`${badgeProgress.unlocked}/${badgeProgress.total}`} accent={Colors.coins} />



            <MetaMetric label="Programa" value={activeProgram ? activeProgram.split_tag : 'Libre'} accent={Colors.mental} />



          </View>



        </Card>







        <Card accentColor={koraDescriptor.accent} style={styles.koraCard}>



          <Text style={[styles.koraEyebrow, { color: koraDescriptor.accent }]}>{koraName}</Text>



          <Text style={styles.koraTitle}>{koraDescriptor.title}</Text>



          <Text style={styles.koraBody}>{koraTruth}</Text>



          <Button onPress={() => router.push(Routes.kora as any)} variant="secondary" color={koraDescriptor.accent} fullWidth>



            Abrir espacio de Kora



          </Button>



        </Card>







        {!isPremium ? (



          <Card accentColor={Colors.coins} style={styles.rewardCard}>



            <SectionHeader



              title="Bonus rapido"



              hint="Mira un anuncio corto y suma 10 coins para boosts o recompensas sin salir del cierre del dia."



            />



            <RewardedAdButton



              context="quick_log_coins"



              label="Ver anuncio y ganar 10 coins"



              coins={10}



              onReward={async (earned) => {



                await addCoins(earned, 'ad_reward', 'Anuncio rewarded desde resumen diario');



              }}



            />



          </Card>



        ) : null}







      </ScrollView>



      </SafeScreen>
    </Modal>



  );



}







const styles = StyleSheet.create({



  container: {



    paddingHorizontal: Spacing[5],



    paddingTop: Spacing[5],



    paddingBottom: Spacing[12],



    gap: Spacing[4],



  },



  heroCard: {



    gap: Spacing[3],



  },



  heroEyebrow: {



    fontFamily: FontFamily.semibold,



    fontSize: FontSize.xs,



    color: Colors.textSecondary,



  },



  heroTopRow: {



    flexDirection: 'row',



    gap: Spacing[3],



    alignItems: 'center',



  },



  heroCopy: {



    flex: 1,



    gap: Spacing[2],



  },



  heroTitle: {



    fontFamily: FontFamily.display,



    fontSize: FontSize.xl,



    lineHeight: 30,



    color: Colors.textPrimary,



  },



  heroBody: {



    fontFamily: FontFamily.regular,



    fontSize: FontSize.sm,



    lineHeight: 20,



    color: Colors.textSecondary,



  },



  scoreWrap: {



    width: 96,



    height: 96,



    alignItems: 'center',



    justifyContent: 'center',



  },



  scoreCenter: {



    position: 'absolute',



    alignItems: 'center',



    justifyContent: 'center',



    gap: 2,



  },



  scoreNumber: {



    fontFamily: FontFamily.display,



    fontSize: FontSize['3xl'],



    color: Colors.textPrimary,



    lineHeight: 44,



  },



  scoreLabel: {



    fontFamily: FontFamily.semibold,



    fontSize: FontSize.xs,



  },



  heroFacts: {



    flexDirection: 'row',



    flexWrap: 'wrap',



    gap: Spacing[2],



  },



  heroFact: {



    minWidth: 84,



    flexDirection: 'row',



    alignItems: 'center',



    justifyContent: 'space-between',



    borderRadius: Radius.full,



    borderWidth: 1,



    borderColor: Colors.border,



    backgroundColor: Colors.bgElevated,



    paddingHorizontal: Spacing[2.5],



    paddingVertical: Spacing[2],



    gap: 8,



  },



  heroFactValue: {



    fontFamily: FontFamily.bold,



    fontSize: FontSize.base,



  },



  heroFactLabel: {



    fontFamily: FontFamily.medium,



    fontSize: FontSize.xs,



    color: Colors.textSecondary,



  },



  sectionHeader: {



    gap: 4,



  },



  sectionHeaderCopy: {



    flex: 1,



    gap: Spacing[1],



  },



  sectionTitle: {



    fontFamily: FontFamily.bold,



    fontSize: FontSize.lg,



    color: Colors.textPrimary,



  },



  sectionHint: {



    fontFamily: FontFamily.regular,



    fontSize: FontSize.sm,



    lineHeight: 20,



    color: Colors.textSecondary,



  },



  sectionHintLeft: {



    fontFamily: FontFamily.regular,



    fontSize: FontSize.sm,



    lineHeight: 20,



    color: Colors.textSecondary,



  },



  loopCard: {



    gap: Spacing[3],



  },



  loopEyebrow: {



    fontFamily: FontFamily.semibold,



    fontSize: FontSize.xs,



  },



  rankPill: {



    minWidth: 58,



    flexDirection: 'row',



    alignItems: 'center',



    justifyContent: 'center',



    gap: Spacing[1],



    borderRadius: Radius.full,



    paddingHorizontal: Spacing[3],



    paddingVertical: Spacing[2],



  },



  rankPillText: {



    fontFamily: FontFamily.bold,



    fontSize: FontSize.sm,



  },



  loopStats: {



    flexDirection: 'row',



    gap: Spacing[2],



  },



  loopStat: {



    flex: 1,



    borderRadius: Radius.xl,



    backgroundColor: Colors.bgElevated,



    borderWidth: 1,



    borderColor: withOpacity(Colors.white, 0.05),



    padding: Spacing[3],



    gap: Spacing[1],



  },



  loopStatValue: {



    fontFamily: FontFamily.bold,



    fontSize: FontSize.lg,



    color: Colors.textPrimary,



  },



  loopStatLabel: {



    fontFamily: FontFamily.medium,



    fontSize: FontSize.xs,



    color: Colors.textMuted,



  },



  loopStatus: {



    flexDirection: 'row',



    alignItems: 'flex-start',



    gap: Spacing[2],



    borderRadius: Radius.xl,



    backgroundColor: Colors.bgElevated,



    borderWidth: 1,



    borderColor: withOpacity(Colors.white, 0.05),



    padding: Spacing[3],



  },



  loopStatusText: {



    flex: 1,



    fontFamily: FontFamily.regular,



    fontSize: FontSize.sm,



    lineHeight: 20,



    color: Colors.textSecondary,



  },



  loopPills: {



    flexDirection: 'row',



    flexWrap: 'wrap',



    gap: Spacing[2],



  },



  loopPill: {



    flexDirection: 'row',



    alignItems: 'center',



    gap: Spacing[1],



    borderRadius: Radius.full,



    paddingHorizontal: Spacing[3],



    paddingVertical: Spacing[2],



    backgroundColor: Colors.bgElevated,



    borderWidth: 1,



    borderColor: withOpacity(Colors.white, 0.06),



  },



  loopPillText: {



    fontFamily: FontFamily.medium,



    fontSize: FontSize.xs,



    color: Colors.textSecondary,



  },



  metricsCard: {



    gap: Spacing[4],



  },



  metricsGrid: {



    flexDirection: 'row',



    flexWrap: 'wrap',



    gap: Spacing[3],



  },



  metricRow: {



    width: '47%',



    borderRadius: Radius.xl,



    backgroundColor: Colors.bgElevated,



    borderWidth: 1,



    borderColor: withOpacity(Colors.white, 0.05),



    padding: Spacing[3],



    gap: Spacing[2],



  },



  metricIcon: {



    width: 30,



    height: 30,



    borderRadius: Radius.full,



    alignItems: 'center',



    justifyContent: 'center',



  },



  metricCopy: {



    gap: Spacing[1],



  },



  metricLabel: {



    fontFamily: FontFamily.medium,



    fontSize: FontSize.xs,



    color: Colors.textMuted,



  },



  metricValue: {



    fontFamily: FontFamily.semibold,



    fontSize: FontSize.sm,



    lineHeight: 20,



    color: Colors.textPrimary,



  },



  breakdownCard: {



    gap: Spacing[3],



  },



  breakdownList: {



    gap: Spacing[3],



  },



  breakdownRow: {



    gap: Spacing[2],



  },



  breakdownCopy: {



    flexDirection: 'row',



    alignItems: 'center',



    justifyContent: 'space-between',



  },



  breakdownLabel: {



    fontFamily: FontFamily.medium,



    fontSize: FontSize.sm,



    color: Colors.textPrimary,



  },



  breakdownValue: {



    fontFamily: FontFamily.semibold,



    fontSize: FontSize.sm,



  },



  breakdownTrack: {



    height: 6,



    borderRadius: Radius.full,



    backgroundColor: Colors.surface3,



    overflow: 'hidden',



  },



  breakdownFill: {



    height: '100%',



    borderRadius: Radius.full,



  },



  timelineCard: {



    gap: Spacing[3],



  },



  timelineList: {



    gap: Spacing[3],



  },



  timelineRow: {



    flexDirection: 'row',



    alignItems: 'flex-start',



    gap: Spacing[3],



    borderRadius: Radius.xl,



    backgroundColor: Colors.bgElevated,



    borderWidth: 1,



    borderColor: withOpacity(Colors.white, 0.05),



    padding: Spacing[3],



  },



  timelineTime: {



    width: 46,



    fontFamily: FontFamily.medium,



    fontSize: FontSize.xs,



    color: Colors.textMuted,



    lineHeight: 20,



  },



  timelineDot: {



    width: 30,



    height: 30,



    borderRadius: Radius.full,



    alignItems: 'center',



    justifyContent: 'center',



  },



  timelineCopy: {



    flex: 1,



    gap: 2,



  },



  timelineTitle: {



    fontFamily: FontFamily.semibold,



    fontSize: FontSize.base,



    color: Colors.textPrimary,



  },



  timelineDetail: {



    fontFamily: FontFamily.regular,



    fontSize: FontSize.sm,



    lineHeight: 20,



    color: Colors.textSecondary,



  },



  timelineEmpty: {



    fontFamily: FontFamily.regular,



    fontSize: FontSize.sm,



    color: Colors.textSecondary,



  },



  explainCard: {



    gap: Spacing[3],



  },



  metaCard: {



    gap: Spacing[3],



  },



  metaGrid: {



    flexDirection: 'row',



    flexWrap: 'wrap',



    gap: Spacing[3],



  },



  metaMetric: {



    width: '47%',



    borderRadius: Radius.xl,



    backgroundColor: Colors.bgElevated,



    borderWidth: 1,



    borderColor: withOpacity(Colors.white, 0.05),



    padding: Spacing[4],



    gap: Spacing[1],



  },



  metaMetricValue: {



    fontFamily: FontFamily.bold,



    fontSize: FontSize.xl,



  },



  metaMetricLabel: {



    fontFamily: FontFamily.regular,



    fontSize: FontSize.xs,



    color: Colors.textMuted,



  },



  koraCard: {



    gap: Spacing[3],



  },



  koraEyebrow: {



    fontFamily: FontFamily.semibold,



    fontSize: FontSize.xs,



  },



  koraTitle: {



    fontFamily: FontFamily.bold,



    fontSize: FontSize.xl,



    color: Colors.textPrimary,



  },



  koraBody: {



    fontFamily: FontFamily.regular,



    fontSize: FontSize.base,



    lineHeight: 24,



    color: Colors.textSecondary,



  },



  rewardCard: {



    gap: Spacing[3],



  },



  actionsCard: {



    gap: Spacing[2],



  },



  actions: {



    gap: Spacing[2],



  },



});



