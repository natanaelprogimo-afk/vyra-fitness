import type { ImageSourcePropType } from 'react-native';
import AductoresImage from '@/assets/Musculos/Aductores.jpg';
import AntebrazosImage from '@/assets/Musculos/Antebrazos.png';
import BicepsImage from '@/assets/Musculos/Biceps.png';
import CoreCompletoImage from '@/assets/Musculos/Core-Completo.png';
import CuerpoCompletoImage from '@/assets/Musculos/Cuerpo-Completo.png';
import CuadricepsImage from '@/assets/Musculos/Cuadriceps.png';
import DeltoideLateralImage from '@/assets/Musculos/Deltoide-Lateral.png';
import EspaldaImage from '@/assets/Musculos/Espalda.png';
import GluteosImage from '@/assets/Musculos/Gluteos.png';
import IsquiotibialesImage from '@/assets/Musculos/Isquiotibiales.png';
import PantorrillasImage from '@/assets/Musculos/Pantorrillas.jpg';
import PectoralImage from '@/assets/Musculos/Pectoral.jpg';
import PsoasFlexoresImage from '@/assets/Musculos/Psoas-Flexores-de-Cadera.png';
import SerratoAnteriorImage from '@/assets/Musculos/Serrato-Anterior.png';
import TricepsImage from '@/assets/Musculos/Triceps.png';

const MUSCLE_ASSETS: Array<{ match: RegExp; source: ImageSourcePropType }> = [
  { match: /(pecho|pectoral)/i, source: PectoralImage },
  { match: /(espalda|dorsal|trapecio)/i, source: EspaldaImage },
  { match: /(biceps|bíceps)/i, source: BicepsImage },
  { match: /(triceps|tríceps)/i, source: TricepsImage },
  { match: /(hombro|deltoide)/i, source: DeltoideLateralImage },
  { match: /(cuadriceps|cuádriceps)/i, source: CuadricepsImage },
  { match: /(isquio|isquiotibiales)/i, source: IsquiotibialesImage },
  { match: /(gluteo|glúteo)/i, source: GluteosImage },
  { match: /(pantorrilla|soleo|sóleo)/i, source: PantorrillasImage },
  { match: /(core|abdominal|abs|oblicuo)/i, source: CoreCompletoImage },
  { match: /(antebrazo)/i, source: AntebrazosImage },
  { match: /(aductor)/i, source: AductoresImage },
  { match: /(psoas|flexor)/i, source: PsoasFlexoresImage },
  { match: /(serrato)/i, source: SerratoAnteriorImage },
];

const FALLBACK: ImageSourcePropType = CuerpoCompletoImage;

export function getMuscleImage(muscle: string | null | undefined) {
  if (!muscle) return FALLBACK;
  const entry = MUSCLE_ASSETS.find((item) => item.match.test(muscle));
  return entry?.source ?? FALLBACK;
}
