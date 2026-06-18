import { Image, StyleSheet, Text, View } from 'react-native';
import { Colors, withOpacity } from '@/constants/colors';
import { FontFamily, FontSize, Radius, Spacing } from '@/constants/theme';
import type { BiologicalSex } from '@/types/user';
import MuscleMapMale from '@/assets/MuscleMap/MapaMuscularHombre.png';
import MuscleMapFemale from '@/assets/MuscleMap/MapaMuscularMujer.png';

type MuscleZoneKey =
  | 'chest'
  | 'shoulders'
  | 'biceps'
  | 'forearms'
  | 'abdomen'
  | 'obliques'
  | 'upperBack'
  | 'lats'
  | 'triceps'
  | 'lowerBack'
  | 'glutes'
  | 'quadriceps'
  | 'adductors'
  | 'hamstrings'
  | 'calves';

type MuscleCountMap = Record<string, number>;

const MAP_ASPECT_RATIO = 1672 / 941;
const MAP_LAYOUT = {
  zoom: 1.18,
  verticalOffsetRatio: 0.2,
  frontCenterRatio: 0.372,
  backCenterRatio: 0.625,
} as const;

const MUSCLE_ZONES: Array<{ key: MuscleZoneKey; label: string }> = [
  { key: 'chest', label: 'Pecho' },
  { key: 'shoulders', label: 'Hombros' },
  { key: 'biceps', label: 'Bíceps' },
  { key: 'forearms', label: 'Antebrazos' },
  { key: 'abdomen', label: 'Abdomen' },
  { key: 'obliques', label: 'Oblicuos' },
  { key: 'upperBack', label: 'Espalda alta' },
  { key: 'lats', label: 'Dorsales' },
  { key: 'triceps', label: 'Tríceps' },
  { key: 'lowerBack', label: 'Lumbares' },
  { key: 'glutes', label: 'Glúteos' },
  { key: 'quadriceps', label: 'Cuádriceps' },
  { key: 'adductors', label: 'Aductores' },
  { key: 'hamstrings', label: 'Isquiotibiales' },
  { key: 'calves', label: 'Pantorrillas' },
];

const LEGEND_LEVELS = [
  { label: 'Sin carga', opacity: 0.08 },
  { label: 'Suave', opacity: 0.34 },
  { label: 'Media', opacity: 0.6 },
  { label: 'Alta', opacity: 0.86 },
] as const;

function createEmptyCounts(): Record<MuscleZoneKey, number> {
  return {
    chest: 0,
    shoulders: 0,
    biceps: 0,
    forearms: 0,
    abdomen: 0,
    obliques: 0,
    upperBack: 0,
    lats: 0,
    triceps: 0,
    lowerBack: 0,
    glutes: 0,
    quadriceps: 0,
    adductors: 0,
    hamstrings: 0,
    calves: 0,
  };
}

function addZone(
  counts: Record<MuscleZoneKey, number>,
  key: MuscleZoneKey,
  amount = 1,
) {
  counts[key] = (counts[key] ?? 0) + amount;
}

function spreadLegLoad(counts: Record<MuscleZoneKey, number>, amount: number) {
  addZone(counts, 'quadriceps', amount * 0.82);
  addZone(counts, 'hamstrings', amount * 0.68);
  addZone(counts, 'glutes', amount * 0.6);
  addZone(counts, 'adductors', amount * 0.42);
  addZone(counts, 'calves', amount * 0.34);
}

function spreadBackLoad(counts: Record<MuscleZoneKey, number>, amount: number) {
  addZone(counts, 'upperBack', amount * 0.64);
  addZone(counts, 'lats', amount * 0.86);
  addZone(counts, 'lowerBack', amount * 0.46);
}

function spreadArmLoad(counts: Record<MuscleZoneKey, number>, amount: number) {
  addZone(counts, 'biceps', amount * 0.6);
  addZone(counts, 'triceps', amount * 0.6);
  addZone(counts, 'forearms', amount * 0.38);
}

function spreadCoreLoad(counts: Record<MuscleZoneKey, number>, amount: number) {
  addZone(counts, 'abdomen', amount * 0.82);
  addZone(counts, 'obliques', amount * 0.52);
}

function mergeLegacyCounts(
  counts: Record<MuscleZoneKey, number>,
  input?: MuscleCountMap,
) {
  if (!input) return;

  for (const zone of MUSCLE_ZONES) {
    if (typeof input[zone.key] === 'number' && Number.isFinite(input[zone.key])) {
      counts[zone.key] = Math.max(counts[zone.key], input[zone.key]);
    }
  }

  if (typeof input.arms === 'number') spreadArmLoad(counts, input.arms);
  if (typeof input.core === 'number') spreadCoreLoad(counts, input.core);
  if (typeof input.back === 'number') spreadBackLoad(counts, input.back);
  if (typeof input.legs === 'number') spreadLegLoad(counts, input.legs);
}

function normalizeMuscleCounts(musclesWorked: string[], counts?: MuscleCountMap) {
  const normalized = createEmptyCounts();
  mergeLegacyCounts(normalized, counts);

  musclesWorked.forEach((item) => {
    const muscle = item.toLowerCase();

    if (muscle.includes('pecho') || muscle.includes('pectoral')) {
      addZone(normalized, 'chest');
      return;
    }

    if (muscle.includes('trap')) {
      addZone(normalized, 'upperBack');
      return;
    }

    if (muscle.includes('dorsal') || muscle.includes('lat')) {
      addZone(normalized, 'lats');
      return;
    }

    if (muscle.includes('lumbar')) {
      addZone(normalized, 'lowerBack');
      return;
    }

    if (muscle.includes('espalda')) {
      spreadBackLoad(normalized, 1);
      return;
    }

    if (muscle.includes('hombro') || muscle.includes('deltoid')) {
      addZone(normalized, 'shoulders');
      return;
    }

    if (muscle.includes('antebrazo')) {
      addZone(normalized, 'forearms');
      return;
    }

    if (muscle.includes('bicep')) {
      addZone(normalized, 'biceps');
      return;
    }

    if (muscle.includes('tricep')) {
      addZone(normalized, 'triceps');
      return;
    }

    if (muscle.includes('brazo')) {
      spreadArmLoad(normalized, 1);
      return;
    }

    if (muscle.includes('abdomen') || muscle.includes('recto abdominal')) {
      addZone(normalized, 'abdomen');
      return;
    }

    if (muscle.includes('oblic')) {
      addZone(normalized, 'obliques');
      return;
    }

    if (muscle.includes('core') || muscle.includes('abd')) {
      spreadCoreLoad(normalized, 1);
      return;
    }

    if (muscle.includes('glute')) {
      addZone(normalized, 'glutes');
      return;
    }

    if (muscle.includes('cuadr')) {
      addZone(normalized, 'quadriceps');
      return;
    }

    if (muscle.includes('aductor')) {
      addZone(normalized, 'adductors');
      return;
    }

    if (muscle.includes('femoral') || muscle.includes('isquio')) {
      addZone(normalized, 'hamstrings');
      return;
    }

    if (muscle.includes('pantorr') || muscle.includes('gastroc')) {
      addZone(normalized, 'calves');
      return;
    }

    if (muscle.includes('pierna')) {
      spreadLegLoad(normalized, 1);
    }
  });

  return normalized;
}

function getIntensityLabel(count: number, maxCount: number) {
  if (count <= 0) return 'Sin carga';
  const ratio = maxCount > 0 ? count / maxCount : 0;
  if (ratio >= 0.8) return 'Alta';
  if (ratio >= 0.45) return 'Media';
  return 'Suave';
}

function getTrackFillWidth(count: number, maxCount: number): `${number}%` {
  if (count <= 0 || maxCount <= 0) return '10%';
  const ratio = Math.max(0.16, Math.min(1, count / maxCount));
  return `${Math.round(ratio * 100)}%`;
}

function renderCropStyle(
  previewWidth: number,
  previewHeight: number,
  centerRatio: number,
) {
  const imageHeight = previewHeight * MAP_LAYOUT.zoom;
  const imageWidth = imageHeight * MAP_ASPECT_RATIO;
  const translateY = -((imageHeight - previewHeight) * MAP_LAYOUT.verticalOffsetRatio);
  const translateX = -(imageWidth * centerRatio - previewWidth / 2);

  return {
    width: imageWidth,
    height: imageHeight,
    transform: [{ translateX }, { translateY }],
  } as const;
}

interface MuscleSilhouetteProps {
  musclesWorked?: string[];
  counts?: MuscleCountMap;
  sex?: BiologicalSex | null;
  width?: number;
  height?: number;
  showSummary?: boolean;
}

export default function MuscleSilhouette({
  musclesWorked = [],
  counts,
  sex = 'male',
  width,
  height,
  showSummary = true,
}: MuscleSilhouetteProps) {
  const zones = normalizeMuscleCounts(musclesWorked, counts);
  const maxCount = Math.max(...Object.values(zones), 1);
  const imageSource = sex === 'female' ? MuscleMapFemale : MuscleMapMale;
  const imageLabel = sex === 'female' ? 'Mapa muscular femenino' : 'Mapa muscular masculino';
  const badgeLabel = sex === 'female' ? 'Mapa muscular real · Mujer' : 'Mapa muscular real · Hombre';
  const previewHeight = height ?? 240;
  const previewWidth = width ? Math.max(124, (width - Spacing[2]) / 2) : 150;
  const topZones = MUSCLE_ZONES
    .map((zone) => ({ ...zone, count: zones[zone.key] ?? 0 }))
    .filter((zone) => zone.count > 0)
    .sort((left, right) => right.count - left.count)
    .slice(0, 3);

  return (
    <View style={[styles.wrap, width ? { width } : null]}>
      <View style={styles.mapFrame}>
        <View style={styles.mapHeader}>
          <View style={styles.mapBadge}>
            <Text style={styles.mapBadgeText}>{badgeLabel}</Text>
          </View>
          {topZones.length ? (
            <View style={styles.topZoneRow}>
              {topZones.map((zone) => (
                <View key={zone.key} style={styles.topZoneChip}>
                  <Text style={styles.topZoneChipText}>{zone.label}</Text>
                </View>
              ))}
            </View>
          ) : (
            <Text style={styles.mapHint}>Todavía no hay carga reciente para destacar.</Text>
          )}
        </View>

        <View style={styles.previewRow} accessibilityLabel={imageLabel}>
          <View style={[styles.previewCard, { height: previewHeight }]}>
            <Text style={styles.previewLabel}>Frente</Text>
            <View style={styles.previewCrop}>
              <Image
                source={imageSource}
                resizeMode="stretch"
                style={[
                  styles.cropImage,
                  renderCropStyle(previewWidth, previewHeight, MAP_LAYOUT.frontCenterRatio),
                ]}
              />
              <View pointerEvents="none" style={styles.cropTopMask} />
            </View>
          </View>

          <View style={[styles.previewCard, { height: previewHeight }]}>
            <Text style={styles.previewLabel}>Espalda</Text>
            <View style={styles.previewCrop}>
              <Image
                source={imageSource}
                resizeMode="stretch"
                style={[
                  styles.cropImage,
                  renderCropStyle(previewWidth, previewHeight, MAP_LAYOUT.backCenterRatio),
                ]}
              />
              <View pointerEvents="none" style={styles.cropTopMask} />
            </View>
          </View>
        </View>
      </View>

      {showSummary ? (
        <>
          <View style={styles.legendRow}>
            <Text style={styles.legendLabel}>Carga relativa real</Text>
            <View style={styles.legendItems}>
              {LEGEND_LEVELS.map((level) => (
                <View key={level.label} style={styles.legendItem}>
                  <View
                    style={[
                      styles.legendSwatch,
                      { backgroundColor: withOpacity(Colors.workout, level.opacity) },
                    ]}
                  />
                  <Text style={styles.legendText}>{level.label}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.summaryGrid}>
            {MUSCLE_ZONES.map((item) => {
              const count = zones[item.key] ?? 0;
              return (
                <View key={item.key} style={styles.summaryCard}>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryTitle}>{item.label}</Text>
                    <Text style={styles.summaryMeta}>{getIntensityLabel(count, maxCount)}</Text>
                  </View>
                  <View style={styles.summaryTrack}>
                    <View
                      style={[
                        styles.summaryFill,
                        {
                          width: getTrackFillWidth(count, maxCount),
                          backgroundColor:
                            count > 0
                              ? withOpacity(Colors.workout, 0.86)
                              : withOpacity(Colors.white, 0.08),
                        },
                      ]}
                    />
                  </View>
                </View>
              );
            })}
          </View>
        </>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: Spacing[3],
  },
  mapFrame: {
    gap: Spacing[3],
    borderRadius: Radius['3xl'],
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: withOpacity(Colors.white, 0.08),
    backgroundColor: withOpacity(Colors.surface3, 0.72),
    padding: Spacing[3],
  },
  mapHeader: {
    gap: Spacing[2],
  },
  mapBadge: {
    alignSelf: 'flex-start',
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: withOpacity(Colors.white, 0.08),
    backgroundColor: withOpacity(Colors.base, 0.72),
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[1.5],
  },
  mapBadgeText: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.xs,
    color: Colors.textPrimary,
  },
  topZoneRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing[2],
  },
  topZoneChip: {
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: withOpacity(Colors.workout, 0.16),
    backgroundColor: withOpacity(Colors.workout, 0.12),
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[1.5],
  },
  topZoneChipText: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.xs,
    color: Colors.workout,
  },
  mapHint: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
  },
  previewRow: {
    flexDirection: 'row',
    gap: Spacing[2],
  },
  previewCard: {
    flex: 1,
    gap: Spacing[2],
    minHeight: 180,
  },
  previewLabel: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.xs,
    color: Colors.textPrimary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  previewCrop: {
    flex: 1,
    borderRadius: Radius['2xl'],
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: withOpacity(Colors.white, 0.06),
    backgroundColor: withOpacity(Colors.base, 0.24),
  },
  cropImage: {
    position: 'absolute',
    left: 0,
    top: 0,
  },
  cropTopMask: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 42,
    backgroundColor: Colors.bgSurface,
  },
  legendRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: Spacing[2],
  },
  legendLabel: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
  },
  legendItems: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing[2],
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[1],
  },
  legendSwatch: {
    width: 10,
    height: 10,
    borderRadius: Radius.full,
  },
  legendText: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.xs,
    color: Colors.textMuted,
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing[2],
  },
  summaryCard: {
    flexGrow: 1,
    flexBasis: '31%',
    minWidth: 96,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: withOpacity(Colors.white, 0.06),
    backgroundColor: withOpacity(Colors.surface3, 0.86),
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[3],
    gap: Spacing[1.5],
  },
  summaryRow: {
    gap: 4,
  },
  summaryTitle: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.xs,
    color: Colors.textPrimary,
  },
  summaryMeta: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
  },
  summaryTrack: {
    height: 7,
    borderRadius: Radius.full,
    backgroundColor: withOpacity(Colors.white, 0.08),
    overflow: 'hidden',
  },
  summaryFill: {
    height: '100%',
    borderRadius: Radius.full,
  },
});
