import type { UserProfile } from '@/types/user';

export type InjuryId =
  | 'shoulder'
  | 'knee'
  | 'lower_back'
  | 'wrist'
  | 'hip'
  | 'ankle'
  | 'neck';

export interface InjuryOption {
  id: InjuryId;
  label: string;
  description: string;
  avoidMuscles: string[];
  avoidPatterns: string[];
}

export const INJURY_OPTIONS: InjuryOption[] = [
  {
    id: 'shoulder',
    label: 'Hombro',
    description: 'Evita presses y elevaciones agresivas.',
    avoidMuscles: ['shoulders', 'upper_chest'],
    avoidPatterns: ['overhead', 'press', 'abduction', 'incline'],
  },
  {
    id: 'knee',
    label: 'Rodilla',
    description: 'Filtra sentadillas, zancadas y impactos.',
    avoidMuscles: ['quads'],
    avoidPatterns: ['squat', 'lunge', 'step', 'leg press', 'knee'],
  },
  {
    id: 'lower_back',
    label: 'Espalda baja',
    description: 'Reduce bisagras pesadas y cargas axiales.',
    avoidMuscles: ['lower_back'],
    avoidPatterns: ['hinge', 'deadlift', 'good morning', 'row', 'hyperextension'],
  },
  {
    id: 'wrist',
    label: 'Mu?eca',
    description: 'Filtra presses y apoyos directos.',
    avoidMuscles: [],
    avoidPatterns: ['press', 'push', 'curl', 'plank'],
  },
  {
    id: 'hip',
    label: 'Cadera',
    description: 'Reduce hip thrust, zancadas y bisagras.',
    avoidMuscles: ['glutes'],
    avoidPatterns: ['hip', 'thrust', 'lunge', 'split squat', 'hinge'],
  },
  {
    id: 'ankle',
    label: 'Tobillo',
    description: 'Evita saltos y carga explosiva.',
    avoidMuscles: ['calves'],
    avoidPatterns: ['jump', 'plyo', 'run', 'calf'],
  },
  {
    id: 'neck',
    label: 'Cuello',
    description: 'Reduce trabajo de trapecio y encogimientos.',
    avoidMuscles: ['traps'],
    avoidPatterns: ['shrug', 'neck'],
  },
];

function toArray(value: unknown): InjuryId[] {
  if (!Array.isArray(value)) return [];
  return value.filter((entry): entry is InjuryId => typeof entry === 'string');
}

export function getInjurySelection(profile: UserProfile | null | undefined): InjuryId[] {
  const memory =
    profile?.coach_memory_json && typeof profile.coach_memory_json === 'object'
      ? (profile.coach_memory_json as Record<string, unknown>)
      : null;

  return toArray(memory?.injuries);
}

export function withInjurySelection(
  memory: Record<string, unknown> | null | undefined,
  injuries: InjuryId[],
): Record<string, unknown> {
  return {
    ...(memory ?? {}),
    injuries,
  };
}

export function isExerciseAllowed(
  params: {
    muscle_group: string;
    muscles_secondary: string[];
    movement_pattern?: string | null;
    name: string;
  },
  injuries: InjuryId[],
): boolean {
  if (!injuries.length) return true;

  const muscle = params.muscle_group.toLowerCase();
  const secondary = params.muscles_secondary.map((value) => value.toLowerCase());
  const pattern = params.movement_pattern?.toLowerCase() ?? '';
  const name = params.name.toLowerCase();

  for (const injuryId of injuries) {
    const rule = INJURY_OPTIONS.find((option) => option.id === injuryId);
    if (!rule) continue;

    const hitsMuscle = rule.avoidMuscles.some((avoid) => avoid === muscle || secondary.includes(avoid));
    if (hitsMuscle) return false;

    const hitsPattern = rule.avoidPatterns.some((avoid) => pattern.includes(avoid) || name.includes(avoid));
    if (hitsPattern) return false;
  }

  return true;
}
