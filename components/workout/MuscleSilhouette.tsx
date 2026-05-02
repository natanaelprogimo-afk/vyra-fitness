import { StyleSheet, View } from 'react-native';
import Svg, { Circle, Path, Rect, Text as SvgText } from 'react-native-svg';
import { Colors, withOpacity } from '@/constants/colors';

type MuscleCountMap = Record<string, number>;

function normalizeMuscleCounts(musclesWorked: string[], counts?: MuscleCountMap) {
  if (counts) return counts;
  const lower = musclesWorked.map((item) => item.toLowerCase());
  return {
    chest: lower.some((item) => item.includes('pecho')) ? 1 : 0,
    back: lower.some((item) => item.includes('espalda') || item.includes('dorsal')) ? 1 : 0,
    shoulders: lower.some((item) => item.includes('hombro')) ? 1 : 0,
    arms: lower.some((item) => item.includes('brazo') || item.includes('biceps') || item.includes('triceps')) ? 1 : 0,
    legs: lower.some((item) => item.includes('pierna') || item.includes('gluteo') || item.includes('femoral') || item.includes('cuadr')) ? 1 : 0,
    core: lower.some((item) => item.includes('core') || item.includes('abd')) ? 1 : 0,
  };
}

function colorFor(count: number, maxCount: number) {
  if (count <= 0) return withOpacity(Colors.white, 0.06);
  const ratio = maxCount > 0 ? count / maxCount : 0.4;
  return withOpacity(Colors.action, 0.26 + ratio * 0.52);
}

interface MuscleSilhouetteProps {
  musclesWorked?: string[];
  counts?: MuscleCountMap;
  width?: number;
  height?: number;
}

export default function MuscleSilhouette({
  musclesWorked = [],
  counts,
  width = 260,
  height = 170,
}: MuscleSilhouetteProps) {
  const zones = normalizeMuscleCounts(musclesWorked, counts);
  const maxCount = Math.max(...Object.values(zones), 1);
  const baseFill = withOpacity(Colors.white, 0.08);

  return (
    <View style={styles.wrap}>
      <Svg width={width} height={height} viewBox="0 0 260 170">
        <SvgText x="62" y="14" fill={Colors.textMuted} fontSize="10" textAnchor="middle">
          Front
        </SvgText>
        <SvgText x="198" y="14" fill={Colors.textMuted} fontSize="10" textAnchor="middle">
          Back
        </SvgText>

        <Circle cx="62" cy="28" r="12" fill={baseFill} />
        <Path d="M42 50 C48 38, 76 38, 82 50 L78 92 C75 108, 49 108, 46 92 Z" fill={baseFill} />
        <Path d="M46 48 C48 40, 58 38, 62 38 C66 38, 76 40, 78 48 L72 66 L52 66 Z" fill={colorFor(zones.chest ?? 0, maxCount)} />
        <Rect x="52" y="68" width="20" height="24" rx="8" fill={colorFor(zones.core ?? 0, maxCount)} />
        <Rect x="30" y="48" width="12" height="48" rx="6" fill={colorFor(zones.arms ?? 0, maxCount)} />
        <Rect x="82" y="48" width="12" height="48" rx="6" fill={colorFor(zones.arms ?? 0, maxCount)} />
        <Path d="M40 48 C45 40, 50 38, 56 38 L52 56 L40 62 Z" fill={colorFor(zones.shoulders ?? 0, maxCount)} />
        <Path d="M84 48 C79 40, 74 38, 68 38 L72 56 L84 62 Z" fill={colorFor(zones.shoulders ?? 0, maxCount)} />
        <Path d="M48 104 L60 104 L56 154 L44 154 Z" fill={colorFor(zones.legs ?? 0, maxCount)} />
        <Path d="M64 104 L76 104 L80 154 L68 154 Z" fill={colorFor(zones.legs ?? 0, maxCount)} />

        <Circle cx="198" cy="28" r="12" fill={baseFill} />
        <Path d="M178 50 C184 38, 212 38, 218 50 L214 92 C211 108, 185 108, 182 92 Z" fill={baseFill} />
        <Path d="M182 48 C186 40, 192 38, 198 38 C204 38, 210 40, 214 48 L208 78 L188 78 Z" fill={colorFor(zones.back ?? 0, maxCount)} />
        <Rect x="188" y="80" width="20" height="16" rx="8" fill={colorFor(zones.core ?? 0, maxCount)} />
        <Path d="M188 98 C192 92, 204 92, 208 98 L206 112 L190 112 Z" fill={colorFor(zones.legs ?? 0, maxCount)} />
        <Rect x="166" y="48" width="12" height="48" rx="6" fill={colorFor(zones.arms ?? 0, maxCount)} />
        <Rect x="218" y="48" width="12" height="48" rx="6" fill={colorFor(zones.arms ?? 0, maxCount)} />
        <Path d="M176 48 C181 40, 186 38, 192 38 L188 56 L176 62 Z" fill={colorFor(zones.shoulders ?? 0, maxCount)} />
        <Path d="M220 48 C215 40, 210 38, 204 38 L208 56 L220 62 Z" fill={colorFor(zones.shoulders ?? 0, maxCount)} />
        <Path d="M184 104 L196 104 L192 154 L180 154 Z" fill={colorFor(zones.legs ?? 0, maxCount)} />
        <Path d="M200 104 L212 104 L216 154 L204 154 Z" fill={colorFor(zones.legs ?? 0, maxCount)} />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
