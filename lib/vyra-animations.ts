export type VyraAnimationId =
  | 'greet'
  | 'smallJump'
  | 'wink'
  | 'idle'
  | 'stretch'
  | 'flex'
  | 'lift'
  | 'ready'
  | 'pointClock'
  | 'pointClockAnxious'
  | 'pointDown'
  | 'worried'
  | 'coverFire'
  | 'confetti'
  | 'victory'
  | 'streakFire';

export type VyraAnimationSource = number;

const bounce = require('@/assets/lottie/vyra-bounce.json');
const confetti = require('@/assets/lottie/confetti.json');
const fire = require('@/assets/lottie/fire.json');
const stars = require('@/assets/lottie/stars.json');
const particles = require('@/assets/lottie/particles.json');
const celebration = require('@/assets/lottie/celebration.json');

export const VYRA_ANIMATIONS: Record<VyraAnimationId, VyraAnimationSource> = {
  greet: bounce,
  smallJump: bounce,
  wink: stars,
  idle: bounce,
  stretch: bounce,
  flex: fire,
  lift: fire,
  ready: celebration,
  pointClock: particles,
  pointClockAnxious: particles,
  pointDown: particles,
  worried: stars,
  coverFire: fire,
  confetti,
  victory: celebration,
  streakFire: fire,
};

export const VYRA_ANIMATION_LABELS: Array<{ id: VyraAnimationId; label: string }> = [
  { id: 'greet', label: 'Saludo' },
  { id: 'smallJump', label: 'Pequeño salto' },
  { id: 'wink', label: 'Guiño' },
  { id: 'idle', label: 'Mirando alrededor' },
  { id: 'stretch', label: 'Estirándose' },
  { id: 'flex', label: 'Flexionando músculos' },
  { id: 'lift', label: 'Levantando barra' },
  { id: 'ready', label: 'Preparado para entrenar' },
  { id: 'pointClock', label: 'Señalando el reloj' },
  { id: 'pointClockAnxious', label: 'Reloj con ansiedad' },
  { id: 'pointDown', label: 'Señalando botón' },
  { id: 'worried', label: 'Mirando preocupado' },
  { id: 'coverFire', label: 'Tapando el fuego' },
  { id: 'confetti', label: 'Confeti' },
  { id: 'victory', label: 'Salto de victoria' },
  { id: 'streakFire', label: 'Fuego de racha' },
];

export function getVyraAnimation(id: VyraAnimationId): VyraAnimationSource {
  return VYRA_ANIMATIONS[id];
}

export function getStreakAnimation(streakDays: number): VyraAnimationSource {
  if (streakDays >= 365) return celebration;
  if (streakDays >= 30) return confetti;
  if (streakDays >= 7) return fire;
  if (streakDays >= 3) return stars;
  return bounce;
}
