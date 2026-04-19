import { useCallback, useMemo, useState } from 'react';
import { Pressable, ScrollView, Share, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import Svg, { Circle, Rect } from 'react-native-svg';
import AnimatedNumber from '@/components/ui/AnimatedNumber';
import Button from '@/components/ui/Button';
import SafeScreen from '@/components/ui/SafeScreen';
import { Colors, withOpacity } from '@/constants/colors';
import { Routes } from '@/constants/routes';
import { FontFamily, Radius, Spacing } from '@/constants/theme';
import { useAuthStore } from '@/stores/authStore';
import { useWorkout } from '@/hooks/useWorkout';

function dayDiff(fromIso: string, toIso: string) {
  const from = new Date(fromIso);
  from.setHours(0, 0, 0, 0);
  const to = new Date(toIso);
  to.setHours(0, 0, 0, 0);
  return Math.max(0, Math.round((to.getTime() - from.getTime()) / 86400000));
}

function wasFreezeUsedYesterday(iso: string | null | undefined) {
  if (!iso) return false;
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  yesterday.setHours(0, 0, 0, 0);
  const used = new Date(iso);
  used.setHours(0, 0, 0, 0);
  return used.getTime() === yesterday.getTime();
}

function buildDoneCopy({
  streak,
  sessionCount,
  duration,
  prs,
  prExerciseName,
  previousSessionStartedAt,
  currentSessionStartedAt,
  isHardestSessionThisWeek,
  freezeUsedYesterday,
}: {
  streak: number;
  sessionCount: number;
  duration: number;
  prs: number;
  prExerciseName: string | null;
  previousSessionStartedAt: string | null;
  currentSessionStartedAt: string | null;
  isHardestSessionThisWeek: boolean;
  freezeUsedYesterday: boolean;
}) {
  if (freezeUsedYesterday) {
    return { title: 'Racha protegida.', subtitle: 'Usaste tu comodin. La racha sigue. Hoy la refuerzas.' };
  }

  if (sessionCount <= 1) {
    return { title: 'Lo hiciste.', subtitle: 'Tu primer entrenamiento. Asi empieza todo.' };
  }

  if (prs > 0) {
    return {
      title: 'Nuevo record.',
      subtitle: prExerciseName
        ? `Record en ${prExerciseName}. Te estas volviendo mas fuerte.`
        : 'Te estas volviendo mas fuerte.',
    };
  }

  if (streak >= 30) {
    return { title: '30 dias.', subtitle: '30 dias consecutivos. Eres otra persona.' };
  }
  if (streak >= 14) {
    return { title: '14 dias.', subtitle: 'Ya no necesitas motivacion. Tienes habito.' };
  }
  if (streak >= 7) {
    return { title: 'Una semana.', subtitle: '7 dias completos. Ya no es casualidad, es decision.' };
  }
  if (streak >= 3) {
    return { title: 'Lo hiciste.', subtitle: `${streak} dias seguidos. El habito se esta formando.` };
  }

  if (previousSessionStartedAt && currentSessionStartedAt) {
    const daysAway = dayDiff(previousSessionStartedAt, currentSessionStartedAt) - 1;
    if (daysAway >= 7) {
      return { title: 'Volviste.', subtitle: 'Volviste. Eso es lo mas dificil. Ya esta hecho.' };
    }
    if (daysAway >= 3) {
      return { title: 'Volviste.', subtitle: `Estuviste ${daysAway} dias. Ya esta. Eso es lo mas dificil.` };
    }
  }

  if (duration >= 60) {
    return { title: 'Una hora.', subtitle: 'Tu primera sesion de mas de una hora. A por mas.' };
  }

  if (isHardestSessionThisWeek) {
    return { title: 'Lo hiciste.', subtitle: 'Esa era la sesion mas dura de la semana. La hiciste.' };
  }

  return { title: 'Lo hiciste.', subtitle: 'Otro dia entrenado. Asi se construye esto.' };
}

function normalizeMuscles(musclesWorked: string[]) {
  const lower = musclesWorked.map((item) => item.toLowerCase());
  return {
    chest: lower.some((item) => item.includes('pecho')),
    back: lower.some((item) => item.includes('espalda') || item.includes('dorsal')),
    shoulders: lower.some((item) => item.includes('hombro')),
    arms: lower.some((item) => item.includes('brazo') || item.includes('biceps') || item.includes('triceps')),
    legs: lower.some((item) => item.includes('pierna') || item.includes('cuadr') || item.includes('gluteo') || item.includes('femoral')),
    core: lower.some((item) => item.includes('core') || item.includes('abd')),
  };
}

function MuscleSilhouette({ musclesWorked }: { musclesWorked: string[] }) {
  const zones = normalizeMuscles(musclesWorked);
  const active = withOpacity(Colors.action, 0.42);
  const base = Colors.bgElevated;

  return (
    <View style={styles.silhouetteWrap}>
      <Svg width={220} height={92} viewBox="0 0 220 92">
        <Circle cx={46} cy={16} r={10} fill={base} />
        <Rect x={36} y={28} width={20} height={18} rx={8} fill={zones.chest ? active : base} />
        <Rect x={30} y={48} width={32} height={14} rx={7} fill={zones.core ? active : base} />
        <Rect x={18} y={28} width={10} height={28} rx={5} fill={zones.arms ? active : base} />
        <Rect x={64} y={28} width={10} height={28} rx={5} fill={zones.arms ? active : base} />
        <Rect x={32} y={64} width={12} height={22} rx={6} fill={zones.legs ? active : base} />
        <Rect x={48} y={64} width={12} height={22} rx={6} fill={zones.legs ? active : base} />
        <Rect x={30} y={24} width={12} height={10} rx={5} fill={zones.shoulders ? active : base} />
        <Rect x={50} y={24} width={12} height={10} rx={5} fill={zones.shoulders ? active : base} />

        <Circle cx={174} cy={16} r={10} fill={base} />
        <Rect x={164} y={28} width={20} height={18} rx={8} fill={zones.back ? active : base} />
        <Rect x={158} y={48} width={32} height={14} rx={7} fill={zones.core ? active : base} />
        <Rect x={146} y={28} width={10} height={28} rx={5} fill={zones.arms ? active : base} />
        <Rect x={192} y={28} width={10} height={28} rx={5} fill={zones.arms ? active : base} />
        <Rect x={160} y={64} width={12} height={22} rx={6} fill={zones.legs ? active : base} />
        <Rect x={176} y={64} width={12} height={22} rx={6} fill={zones.legs ? active : base} />
        <Rect x={158} y={24} width={12} height={10} rx={5} fill={zones.shoulders ? active : base} />
        <Rect x={178} y={24} width={12} height={10} rx={5} fill={zones.shoulders ? active : base} />
      </Svg>
    </View>
  );
}

function buildShareCardHtml(input: {
  name: string;
  userName: string;
  dateLabel: string;
  duration: number;
  sets: number;
  volume: number;
  streak: number;
}) {
  return `
    <html>
      <body style="margin:0;padding:24px;background:#09090B;color:#F0F0F3;font-family:Inter,Arial,sans-serif;">
        <div style="border:1px solid rgba(255,255,255,.08);border-radius:24px;background:#111115;padding:28px;">
          <div style="height:4px;background:#FF4500;border-radius:999px;margin-bottom:24px;"></div>
          <div style="font-size:12px;letter-spacing:1.4px;text-transform:uppercase;color:#9090A0;">VYRA</div>
          <div style="font-size:32px;font-weight:800;margin-top:8px;">${input.name}</div>
          <div style="font-size:15px;color:#9090A0;margin-top:8px;">${input.userName} · ${input.dateLabel}</div>
          <div style="display:flex;gap:16px;margin-top:28px;">
            <div style="flex:1;">
              <div style="font-size:28px;font-weight:700;">${input.duration} min</div>
              <div style="font-size:13px;color:#9090A0;">Duracion</div>
            </div>
            <div style="flex:1;">
              <div style="font-size:28px;font-weight:700;">${input.sets}</div>
              <div style="font-size:13px;color:#9090A0;">Series</div>
            </div>
            <div style="flex:1;">
              <div style="font-size:28px;font-weight:700;">${Math.round(input.volume).toLocaleString('es-UY')} kg</div>
              <div style="font-size:13px;color:#9090A0;">Volumen</div>
            </div>
          </div>
          <div style="margin-top:28px;padding:16px;border-radius:16px;background:#18181D;">
            <div style="font-size:12px;color:#9090A0;text-transform:uppercase;letter-spacing:1.2px;">Racha</div>
            <div style="font-size:24px;font-weight:700;margin-top:6px;">${input.streak} dias seguidos</div>
          </div>
        </div>
      </body>
    </html>
  `;
}

export default function WorkoutDoneScreen() {
  const [isSharing, setIsSharing] = useState(false);
  const params = useLocalSearchParams<{
    sessionId?: string;
    duration?: string;
    volume?: string;
    sets?: string;
    prs?: string;
    name?: string;
  }>();
  const profile = useAuthStore((state) => state.profile);
  const { history, getConsistencyStats, getSessionDetail } = useWorkout();

  const sessionId = typeof params.sessionId === 'string' ? params.sessionId : '';
  const duration = Number(params.duration ?? 0) || 0;
  const volume = Number(params.volume ?? 0) || 0;
  const sets = Number(params.sets ?? 0) || 0;
  const prs = Number(params.prs ?? 0) || 0;
  const name = typeof params.name === 'string' ? params.name : 'Entrenamiento';
  const streak = Number(profile?.current_streak ?? profile?.streak ?? getConsistencyStats().currentStreak ?? 0);
  const detail = sessionId ? getSessionDetail(sessionId) : null;
  const musclesWorked = detail?.session?.muscles_worked ?? [];
  const previousSession = history.find((entry) => entry.id !== sessionId) ?? null;
  const currentSessionStartedAt =
    detail?.session?.started_at ?? history.find((entry) => entry.id === sessionId)?.started_at ?? null;
  const prExerciseName = detail?.sets.find((set) => set.is_pr)?.exercise_name ?? null;
  const freezeUsedYesterday = wasFreezeUsedYesterday(profile?.streak_freeze_last_used_at ?? null);

  const weekCutoff = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const currentVolume = Math.round(volume);
  const isHardestSessionThisWeek = history
    .filter((entry) => new Date(entry.started_at).getTime() >= weekCutoff)
    .every((entry) => entry.id === sessionId || Number(entry.total_volume_kg ?? 0) <= currentVolume);

  const copy = buildDoneCopy({
    streak,
    sessionCount: history.length,
    duration,
    prs,
    prExerciseName,
    previousSessionStartedAt: previousSession?.started_at ?? null,
    currentSessionStartedAt,
    isHardestSessionThisWeek,
    freezeUsedYesterday,
  });

  const dateLabel = useMemo(
    () =>
      new Intl.DateTimeFormat('es-UY', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }).format(new Date()),
    [],
  );

  const handleShare = useCallback(async () => {
    const userName = profile?.name?.trim() || 'Usuario';
    setIsSharing(true);

    try {
      const html = buildShareCardHtml({
        name,
        userName,
        dateLabel,
        duration,
        sets,
        volume,
        streak,
      });

      const file = await Print.printToFileAsync({ html });
      const canShareFile = await Sharing.isAvailableAsync();

      if (canShareFile) {
        await Sharing.shareAsync(file.uri, {
          mimeType: 'application/pdf',
          dialogTitle: 'Compartir entrenamiento',
        });
        return;
      }

      await Share.share({
        title: 'Compartir entrenamiento',
        message: `${name}\n${duration} min - ${sets} series - ${Math.round(volume).toLocaleString('es-UY')} kg\nRacha actual: ${streak} dias\nVYRA`,
      });
    } finally {
      setIsSharing(false);
    }
  }, [dateLabel, duration, name, profile?.name, sets, streak, volume]);

  return (
    <SafeScreen padHorizontal={false} padBottom={false}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.closeRow}>
          <Pressable onPress={() => router.replace(Routes.tabs.home as never)} style={styles.closeButton}>
            <Ionicons name="close" size={16} color={Colors.textMuted} />
          </Pressable>
        </View>

        <View style={styles.checkWrap}>
          <View style={styles.checkCircle}>
            <Ionicons name="checkmark" size={42} color={Colors.white} />
          </View>
        </View>

        <View style={styles.header}>
          <Text style={styles.title}>{copy.title}</Text>
          <Text style={styles.subtitle}>{copy.subtitle}</Text>
        </View>

        <View style={styles.statsRow}>
          <Stat label="Duracion" value={duration} suffix=" min" delay={0} />
          <Stat label="Series" value={sets} delay={100} />
          <Stat
            label="Volumen"
            value={Math.round(volume)}
            suffix=" kg"
            delay={200}
            formatFn={(value) => Math.round(value).toLocaleString('es-UY')}
          />
        </View>

        <MuscleSilhouette musclesWorked={musclesWorked} />

        <View style={styles.streakRow}>
          {Array.from({ length: 7 }, (_, index) => {
            const active = index < Math.min(7, streak);
            return <View key={index} style={[styles.streakDot, active && styles.streakDotActive]} />;
          })}
        </View>

        <View style={styles.actions}>
          <Button onPress={() => router.push(Routes.tabs.progress as never)} fullWidth size="lg" haptic="medium">
            Ver mi progreso
          </Button>
          <Button onPress={() => void handleShare()} variant="secondary" fullWidth loading={isSharing}>
            Compartir entrenamiento
          </Button>
          <Button onPress={() => router.replace(Routes.tabs.home as never)} variant="ghost" fullWidth>
            Volver al inicio
          </Button>
        </View>
      </ScrollView>
    </SafeScreen>
  );
}

function Stat({
  label,
  value,
  suffix = '',
  delay = 0,
  formatFn,
}: {
  label: string;
  value: number;
  suffix?: string;
  delay?: number;
  formatFn?: (value: number) => string;
}) {
  return (
    <View style={styles.statItem}>
      <AnimatedNumber
        value={value}
        duration={800 + delay}
        suffix={suffix}
        formatFn={formatFn}
        style={styles.statValue}
      />
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingHorizontal: Spacing[5],
    paddingTop: Spacing[5],
    paddingBottom: Spacing[10],
    gap: Spacing[6],
  },
  closeRow: {
    alignItems: 'flex-end',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkWrap: {
    alignItems: 'center',
    marginTop: Spacing[5],
  },
  checkCircle: {
    width: 80,
    height: 80,
    borderRadius: Radius.full,
    backgroundColor: Colors.action,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    gap: Spacing[2],
  },
  title: {
    fontFamily: FontFamily.display,
    fontSize: 48,
    lineHeight: 50,
    color: Colors.textPrimary,
    letterSpacing: -2,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: FontFamily.regular,
    fontSize: 18,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing[3],
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  statValue: {
    fontFamily: FontFamily.bold,
    fontSize: 36,
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  statLabel: {
    fontFamily: FontFamily.semibold,
    fontSize: 13,
    color: Colors.textMuted,
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  silhouetteWrap: {
    alignItems: 'center',
  },
  streakRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing[2],
  },
  streakDot: {
    width: 14,
    height: 14,
    borderRadius: Radius.full,
    backgroundColor: Colors.bgElevated,
  },
  streakDotActive: {
    backgroundColor: Colors.action,
  },
  actions: {
    gap: Spacing[2],
  },
});
