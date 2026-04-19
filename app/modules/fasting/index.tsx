import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useMemo, useState } from 'react';
import Header from '@/components/layout/Header';
import ModuleIntroScreen from '@/components/modules/ModuleIntroScreen';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import ProgressCircle from '@/components/charts/ProgressCircle';
import SafeScreen from '@/components/ui/SafeScreen';
import { Colors, withOpacity } from '@/constants/colors';
import { FontFamily, FontSize, Radius, Spacing } from '@/constants/theme';
import {
  PROTOCOLS,
  formatFastingTime,
  formatFastingTimeShort,
  useFasting,
} from '@/hooks/useFasting';
import { useSettingsStore } from '@/stores/settingsStore';

const MAIN_PROTOCOLS = ['16:8', '14:10', '18:6'] as const;

export default function FastingScreen() {
  const hasSeenIntro = useSettingsStore((state) => Boolean(state.moduleIntroSeen.fasting));
  const markModuleIntroSeen = useSettingsStore((state) => state.markModuleIntroSeen);
  const {
    isActive,
    isComplete,
    protocol,
    targetHours,
    elapsedSeconds,
    progressPct,
    currentPhase,
    history,
    completedFasts,
    avgHours,
    longestFast,
    dailyAdaptiveSuggestion,
    cycleAwareNotice,
    isStarting,
    isCompleting,
    startFast,
    completeFast,
    abandonFast,
  } = useFasting();
  const [selectedProtocol, setSelectedProtocol] = useState<'16:8' | '14:10' | '18:6'>('16:8');

  const elapsedLabel = useMemo(() => formatFastingTimeShort(elapsedSeconds), [elapsedSeconds]);
  const remainingSeconds = Math.max(0, targetHours * 3600 - elapsedSeconds);

  if (!hasSeenIntro) {
    return (
      <SafeScreen padHorizontal={false} padBottom>
        <Header title="Ayuno" showBack />
        <ModuleIntroScreen
          accentColor={Colors.fasting}
          icon="⏱"
          title="Ayuno"
          body="Elige una ventana simple y deja que VYRA lleve el tiempo, el progreso y cuando conviene romper."
          ctaLabel="Entrar al modulo"
          onContinue={() => markModuleIntroSeen('fasting')}
        />
      </SafeScreen>
    );
  }

  return (
    <SafeScreen padHorizontal={false} padBottom>
      <Header title="Ayuno" showBack />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {!isActive ? (
          <Card style={styles.startCard} shadow={false}>
            <Text style={styles.sectionTitle}>Iniciar ayuno</Text>
            <View style={styles.protocolRow}>
              {MAIN_PROTOCOLS.map((item) => {
                const isSelected = selectedProtocol === item;
                return (
                  <Pressable
                    key={item}
                    style={[styles.protocolChip, isSelected && styles.protocolChipActive]}
                    onPress={() => setSelectedProtocol(item)}
                  >
                    <Text style={[styles.protocolLabel, isSelected && styles.protocolLabelActive]}>{item}</Text>
                    <Text style={[styles.protocolHint, isSelected && styles.protocolHintActive]}>
                      {PROTOCOLS[item].description}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {dailyAdaptiveSuggestion ? (
              <Card style={styles.contextCard} shadow={false}>
                <Text style={styles.contextTitle}>Hoy conviene esto</Text>
                <Text style={styles.contextBody}>{dailyAdaptiveSuggestion.message}</Text>
              </Card>
            ) : null}

            <Button onPress={() => startFast(selectedProtocol)} loading={isStarting} fullWidth>
              Iniciar ayuno {selectedProtocol}
            </Button>
            <Text style={styles.lastFastText}>
              {completedFasts > 0 ? `Promedio ${avgHours.toFixed(1)}h · mejor ${longestFast.toFixed(1)}h` : 'Aun no hay ayunos completos.'}
            </Text>
          </Card>
        ) : (
          <Card style={styles.activeCard} shadow={false}>
            <Text style={styles.activeLabel}>Ayuno activo</Text>
            <ProgressCircle
              value={Math.max(0, Math.min(100, progressPct))}
              size={180}
              strokeWidth={12}
              color={Colors.fasting}
              trackColor={Colors.bgElevated}
              animated
              duration={500}
            >
              <Text style={styles.timerText}>{formatFastingTime(remainingSeconds)}</Text>
              <Text style={styles.timerMeta}>restantes</Text>
            </ProgressCircle>
            <Text style={styles.activeMeta}>
              Protocolo {protocol} · {elapsedLabel} completadas
            </Text>

            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${Math.max(0, Math.min(100, progressPct))}%` }]} />
            </View>

            <Card style={styles.phaseCard} shadow={false}>
              <Text style={styles.contextTitle}>{currentPhase.label}</Text>
              <Text style={styles.contextBody}>{currentPhase.description}</Text>
            </Card>

            <Button onPress={() => completeFast()} loading={isCompleting} fullWidth>
              Completar ayuno
            </Button>
            {!isComplete ? (
              <Button
                onPress={() => {
                  Alert.alert(
                    'Terminar anticipadamente',
                    `Llevas ${elapsedLabel} de ${targetHours}h. Puedes cerrar parcial o cancelarlo.`,
                    [
                      { text: 'Seguir', style: 'cancel' },
                      { text: 'Cancelar ayuno', style: 'destructive', onPress: () => abandonFast('manual') },
                      { text: 'Terminar parcial', onPress: () => completeFast() },
                    ],
                  );
                }}
                variant="ghost"
                fullWidth
              >
                Terminar anticipadamente
              </Button>
            ) : null}
          </Card>
        )}

        {cycleAwareNotice ? (
          <Card style={styles.noticeCard} shadow={false}>
            <Text style={styles.contextTitle}>Contexto del dia</Text>
            <Text style={styles.contextBody}>{cycleAwareNotice}</Text>
          </Card>
        ) : null}

        <View style={styles.statsGrid}>
          <StatCard label="Completados" value={String(completedFasts)} />
          <StatCard label="Promedio" value={`${avgHours.toFixed(1)}h`} />
          <StatCard label="Mas largo" value={`${longestFast.toFixed(1)}h`} />
        </View>

        <Card style={styles.historyCard} shadow={false}>
          <Text style={styles.sectionTitle}>Ultimos ayunos</Text>
          <View style={styles.historyList}>
            {history.slice(0, 7).map((item) => {
              const hours = Number(item.total_hours ?? 0);
              const pct = Math.max(0, Math.min(100, (hours / Math.max(1, PROTOCOLS[item.protocol ?? '16:8']?.targetHours ?? 16)) * 100));
              return (
                <View key={item.id} style={styles.historyRow}>
                  <View style={styles.historyCopy}>
                    <Text style={styles.historyName}>{item.protocol ?? 'Ayuno'}</Text>
                    <Text style={styles.historyMeta}>
                      {new Date(item.start_time).toLocaleDateString('es-UY', {
                        day: 'numeric',
                        month: 'short',
                      })} · {hours.toFixed(1)}h
                    </Text>
                  </View>
                  <View style={styles.historyProgress}>
                    <View style={styles.historyProgressTrack}>
                      <View style={[styles.historyProgressFill, { width: `${pct}%` }]} />
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        </Card>
      </ScrollView>
    </SafeScreen>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <Card style={styles.statCard} shadow={false}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: Spacing[5],
    paddingBottom: Spacing[10],
    gap: Spacing[4],
  },
  startCard: {
    gap: Spacing[4],
  },
  sectionTitle: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.md,
    color: Colors.textPrimary,
  },
  protocolRow: {
    gap: Spacing[3],
  },
  protocolChip: {
    borderRadius: Radius.md,
    backgroundColor: Colors.bgElevated,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[3],
    gap: 4,
  },
  protocolChipActive: {
    borderColor: Colors.actionBorder,
    backgroundColor: Colors.actionBg,
  },
  protocolLabel: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.md,
    color: Colors.textPrimary,
  },
  protocolLabelActive: {
    color: Colors.action,
  },
  protocolHint: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.base,
    color: Colors.textSecondary,
  },
  protocolHintActive: {
    color: Colors.textPrimary,
  },
  contextCard: {
    gap: Spacing[2],
    backgroundColor: withOpacity(Colors.fasting, 0.08),
    borderColor: withOpacity(Colors.fasting, 0.2),
  },
  contextTitle: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.md,
    color: Colors.textPrimary,
  },
  contextBody: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.base,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  lastFastText: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.base,
    color: Colors.textSecondary,
  },
  activeCard: {
    gap: Spacing[4],
    alignItems: 'center',
  },
  activeLabel: {
    alignSelf: 'stretch',
    fontFamily: FontFamily.bold,
    fontSize: FontSize.xs,
    color: Colors.fasting,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  timerText: {
    fontFamily: FontFamily.mono,
    fontSize: 34,
    color: Colors.textPrimary,
  },
  timerMeta: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.base,
    color: Colors.textSecondary,
  },
  activeMeta: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.base,
    color: Colors.textSecondary,
  },
  progressTrack: {
    width: '100%',
    height: 8,
    borderRadius: Radius.full,
    backgroundColor: Colors.bgElevated,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: Radius.full,
    backgroundColor: Colors.fasting,
  },
  phaseCard: {
    width: '100%',
    gap: Spacing[2],
    backgroundColor: withOpacity(Colors.fasting, 0.08),
    borderColor: withOpacity(Colors.fasting, 0.18),
  },
  noticeCard: {
    gap: Spacing[2],
  },
  statsGrid: {
    flexDirection: 'row',
    gap: Spacing[3],
  },
  statCard: {
    flex: 1,
    gap: Spacing[2],
  },
  statValue: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.xl,
    color: Colors.textPrimary,
  },
  statLabel: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.base,
    color: Colors.textSecondary,
  },
  historyCard: {
    gap: Spacing[3],
  },
  historyList: {
    gap: Spacing[3],
  },
  historyRow: {
    gap: Spacing[2],
  },
  historyCopy: {
    gap: 4,
  },
  historyName: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.md,
    color: Colors.textPrimary,
  },
  historyMeta: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.base,
    color: Colors.textSecondary,
  },
  historyProgress: {
    width: '100%',
  },
  historyProgressTrack: {
    width: '100%',
    height: 8,
    borderRadius: Radius.full,
    backgroundColor: Colors.bgElevated,
    overflow: 'hidden',
  },
  historyProgressFill: {
    height: '100%',
    borderRadius: Radius.full,
    backgroundColor: Colors.fasting,
  },
});
