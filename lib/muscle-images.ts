const MUSCLE_ASSETS = [
  { match: /(pecho|pectoral)/i, source: require('@/assets/Musculos/Pectoral.jpg') },
  { match: /(espalda|dorsal|trapecio)/i, source: require('@/assets/Musculos/Espalda.png') },
  { match: /(biceps|bíceps)/i, source: require('@/assets/Musculos/Biceps.png') },
  { match: /(triceps|tríceps)/i, source: require('@/assets/Musculos/Triceps.png') },
  { match: /(hombro|deltoide)/i, source: require('@/assets/Musculos/Deltoide-Lateral.png') },
  { match: /(cuadriceps|cuádriceps)/i, source: require('@/assets/Musculos/Cuadriceps.png') },
  { match: /(isquio|isquiotibiales)/i, source: require('@/assets/Musculos/Isquiotibiales.png') },
  { match: /(gluteo|glúteo)/i, source: require('@/assets/Musculos/Gluteos.png') },
  { match: /(pantorrilla|soleo|sóleo)/i, source: require('@/assets/Musculos/Pantorrillas.jpg') },
  { match: /(core|abdominal|abs|oblicuo)/i, source: require('@/assets/Musculos/Core-Completo.png') },
  { match: /(antebrazo)/i, source: require('@/assets/Musculos/Antebrazos.png') },
  { match: /(aductor)/i, source: require('@/assets/Musculos/Aductores.jpg') },
  { match: /(psoas|flexor)/i, source: require('@/assets/Musculos/Psoas-Flexores-de-Cadera.png') },
  { match: /(serrato)/i, source: require('@/assets/Musculos/Serrato-Anterior.png') },
];

const FALLBACK = require('@/assets/Musculos/Cuerpo-Completo.png');

export function getMuscleImage(muscle: string | null | undefined) {
  if (!muscle) return FALLBACK;
  const entry = MUSCLE_ASSETS.find((item) => item.match.test(muscle));
  return entry?.source ?? FALLBACK;
}
