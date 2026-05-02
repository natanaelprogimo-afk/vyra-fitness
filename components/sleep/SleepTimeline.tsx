import { StyleSheet, Text, View } from 'react-native';
import { Colors, withOpacity } from '@/constants/colors';
import { FontFamily, FontSize, Radius, Spacing } from '@/constants/theme';
import { visibleRatioPercent } from '@/lib/visual-progress';

function formatTime(iso: string | null | undefined) {
  if (!iso) return '--:--';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '--:--';
  return date.toLocaleTimeString('es-UY', { hour: '2-digit', minute: '2-digit' });
}

interface SleepTimelineProps {
  startTime?: string | null;
  endTime?: string | null;
  durationHours?: number;
  color?: string;
}

export default function SleepTimeline({
  startTime,
  endTime,
  durationHours = 0,
  color = Colors.sleep,
}: SleepTimelineProps) {
  const fillPct = visibleRatioPercent(durationHours, 9);

  return (
    <View style={styles.wrap}>
      <View style={styles.labelRow}>
        <Text style={styles.label}>{formatTime(startTime)}</Text>
        <Text style={styles.duration}>{durationHours > 0 ? `${durationHours.toFixed(1)}h` : '--'}</Text>
        <Text style={styles.label}>{formatTime(endTime)}</Text>
      </View>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${fillPct}%`, backgroundColor: color }]} />
        {fillPct > 0 ? (
          <View style={[styles.deepSection, { backgroundColor: withOpacity(color, 0.7) }]} />
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: Spacing[2],
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing[2],
  },
  label: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
  },
  duration: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.sm,
    color: Colors.textPrimary,
  },
  track: {
    height: 18,
    borderRadius: Radius.full,
    backgroundColor: withOpacity(Colors.white, 0.05),
    overflow: 'hidden',
    justifyContent: 'center',
  },
  fill: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    borderRadius: Radius.full,
  },
  deepSection: {
    position: 'absolute',
    left: '28%',
    width: '26%',
    top: 0,
    bottom: 0,
    borderRadius: Radius.full,
  },
});
