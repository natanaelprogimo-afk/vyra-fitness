import { Routes } from '@/constants/routes';
import { MODULES, type ModuleId } from '@/constants/modules';
import type { ActivityLevel, OnboardingData, PrimaryGoal } from '@/types/user';
import type { OnboardingDraft } from '@/lib/onboarding-storage';
import { calculateWaterGoal } from '@/utils/calculations';

export const ONBOARDING_STEP_TOTAL = 12;

export type OnboardingBinaryGender = 'male' | 'female';
export type OnboardingEquipmentType = 'gym_full' | 'home_basic' | 'bodyweight' | 'gym_and_home';
export type OnboardingGoalDetailId =
  | 'lose_fat'
  | 'gain_muscle'
  | 'improve_health'
  | 'improve_appearance'
  | 'eat_better'
  | 'recover_habit'
  | 'perform_better'
  | 'feel_better';

export type EquipmentInventoryId =
  | 'barbell'
  | 'dumbbells'
  | 'bench'
  | 'rack'
  | 'cables'
  | 'machines'
  | 'cardio'
  | 'bands'
  | 'kettlebell'
  | 'pullup_bar'
  | 'chair_or_box'
  | 'mat'
  | 'bike_or_treadmill'
  | 'none';

export const GOAL_OPTIONS: Array<{
  id: OnboardingGoalDetailId;
  profileGoal: PrimaryGoal;
  label: string;
  subtitle: string;
  emoji: string;
}> = [
  {
    id: 'lose_fat',
    profileGoal: 'lose_fat',
    label: 'Perder grasa',
    subtitle: 'Definir, bajar porcentaje y moverte mejor.',
    emoji: '🔥',
  },
  {
    id: 'gain_muscle',
    profileGoal: 'gain_muscle',
    label: 'Ganar músculo',
    subtitle: 'Construir fuerza y masa con progresión.',
    emoji: '💪',
  },
  {
    id: 'improve_health',
    profileGoal: 'general_health',
    label: 'Mejorar salud',
    subtitle: 'Dormir, moverte y comer con una base más estable.',
    emoji: '🫀',
  },
  {
    id: 'improve_appearance',
    profileGoal: 'general_health',
    label: 'Mejorar apariencia',
    subtitle: 'Cambiar tu composición sin reducir todo a perder peso.',
    emoji: '✨',
  },
  {
    id: 'eat_better',
    profileGoal: 'general_health',
    label: 'Comer mejor',
    subtitle: 'Ordenar comidas, hambre y adherencia diaria.',
    emoji: '🥗',
  },
  {
    id: 'recover_habit',
    profileGoal: 'general_health',
    label: 'Recuperar hábito',
    subtitle: 'Volver a la constancia sin empezar pasado de rosca.',
    emoji: '🧱',
  },
  {
    id: 'perform_better',
    profileGoal: 'sport_performance',
    label: 'Rendir mejor',
    subtitle: 'Entrenar con más energía, capacidad y continuidad.',
    emoji: '⚡',
  },
  {
    id: 'feel_better',
    profileGoal: 'mental_wellbeing',
    label: 'Sentirme mejor',
    subtitle: 'Bajar fricción diaria y recuperar sensación de control.',
    emoji: '🌿',
  },
] as const;

export const EQUIPMENT_OPTIONS: Array<{
  id: OnboardingEquipmentType;
  label: string;
  subtitle: string;
  emoji: string;
}> = [
  {
    id: 'gym_full',
    label: 'Gimnasio',
    subtitle: 'Entreno en un gym con varias estaciones y cargas.',
    emoji: '🏋️',
  },
  {
    id: 'home_basic',
    label: 'Casa',
    subtitle: 'Entreno en casa y quiero marcar qué material tengo.',
    emoji: '🏠',
  },
  {
    id: 'gym_and_home',
    label: 'Gym + Casa',
    subtitle: 'Alterna entre gym y entrenamientos en casa según necesidad.',
    emoji: '🔄',
  },
  {
    id: 'bodyweight',
    label: 'Peso corporal',
    subtitle: 'Voy a resolverlo casi todo con mi cuerpo y apoyos mínimos.',
    emoji: '🤸',
  },
] as const;

const EQUIPMENT_INVENTORY_MAP: Record<
  OnboardingEquipmentType,
  Array<{ id: EquipmentInventoryId; label: string; helper: string; emoji: string }>
> = {
  gym_full: [
    { id: 'barbell', label: 'Barras', helper: 'Barra olímpica o fija', emoji: '🏋️' },
    { id: 'dumbbells', label: 'Mancuernas', helper: 'Juego libre o ajustable', emoji: '💪' },
    { id: 'bench', label: 'Banco', helper: 'Plano o inclinable', emoji: '🪑' },
    { id: 'rack', label: 'Rack', helper: 'Jaula, soportes o smith', emoji: '🧱' },
    { id: 'cables', label: 'Poleas', helper: 'Estación de cables', emoji: '🎯' },
    { id: 'machines', label: 'Máquinas', helper: 'Prensa, femoral, pecho, etc.', emoji: '⚙️' },
    { id: 'cardio', label: 'Cardio', helper: 'Cinta, remo, bici o elíptica', emoji: '🏃' },
  ],
  home_basic: [
    { id: 'dumbbells', label: 'Mancuernas', helper: 'Fijas o ajustables', emoji: '💪' },
    { id: 'bands', label: 'Bandas', helper: 'Elásticas o de tela', emoji: '🪢' },
    { id: 'bench', label: 'Banco', helper: 'Banco o superficie estable', emoji: '🪑' },
    { id: 'kettlebell', label: 'Kettlebell', helper: 'Pesa rusa', emoji: '🔔' },
    { id: 'pullup_bar', label: 'Barra', helper: 'Dominadas o suspensión', emoji: '📏' },
    { id: 'chair_or_box', label: 'Silla o cajón', helper: 'Apoyo estable para fondos o step', emoji: '🪜' },
    { id: 'bike_or_treadmill', label: 'Cardio', helper: 'Bici, cinta o similar', emoji: '🚲' },
  ],
  gym_and_home: [
    { id: 'barbell', label: 'Barras', helper: 'En el gym', emoji: '🏋️' },
    { id: 'dumbbells', label: 'Mancuernas', helper: 'En casa y gym', emoji: '💪' },
    { id: 'machines', label: 'Máquinas', helper: 'En el gym', emoji: '⚙️' },
    { id: 'bands', label: 'Bandas', helper: 'En casa para movilidad', emoji: '🪢' },
    { id: 'bench', label: 'Banco', helper: 'En casa o gym', emoji: '🪑' },
    { id: 'cables', label: 'Poleas', helper: 'En el gym', emoji: '🎯' },
    { id: 'cardio', label: 'Cardio', helper: 'En ambos lugares', emoji: '🏃' },
  ],
  bodyweight: [
    { id: 'mat', label: 'Colchoneta', helper: 'Apoyo de piso', emoji: '🧘' },
    { id: 'pullup_bar', label: 'Barra', helper: 'Si puedes colgarte', emoji: '📏' },
    { id: 'chair_or_box', label: 'Silla o cajón', helper: 'Para apoyo o elevación', emoji: '🪜' },
    { id: 'none', label: 'Nada extra', helper: 'Solo tu cuerpo', emoji: '⭕' },
  ],
};

export const ACTIVITY_OPTIONS: Array<{
  id: ActivityLevel;
  label: string;
  subtitle: string;
  emoji: string;
}> = [
  { id: 0, label: 'Muy baja', subtitle: 'Paso gran parte del día sentado o quieto.', emoji: '🪑' },
  { id: 1, label: 'Ligera', subtitle: 'Me muevo algo, pero todavía sin mucha carga semanal.', emoji: '🚶' },
  { id: 2, label: 'Media', subtitle: 'Camino bastante o entreno algunas veces por semana.', emoji: '🏃' },
  { id: 3, label: 'Alta', subtitle: 'Me muevo mucho o entreno con constancia.', emoji: '🏋️' },
  { id: 4, label: 'Muy alta', subtitle: 'Trabajo físico o entreno fuerte casi a diario.', emoji: '⚡' },
] as const;

const GOAL_MODULE_STACK: Record<OnboardingGoalDetailId, ModuleId[]> = {
  lose_fat: ['nutrition', 'steps', 'workout', 'water'],          // NEW: Steps primero (NEAT es clave para pérdida grasa)
  gain_muscle: ['workout', 'nutrition', 'sleep', 'water'],       // FIXED: Sleep > Water (crítico para recuperación)
  improve_health: ['steps', 'sleep', 'water', 'nutrition'],
  improve_appearance: ['nutrition', 'steps', 'workout', 'water'], // NEW: Steps (composición corporal)
  eat_better: ['nutrition', 'water', 'steps'],
  recover_habit: ['steps', 'sleep', 'water', 'nutrition'],
  perform_better: ['workout', 'nutrition', 'sleep', 'steps', 'water'],
  feel_better: ['sleep', 'water', 'steps', 'nutrition'],
};

const ONBOARDING_MODULE_IDS = MODULES.map((module) => module.id as ModuleId);
const FASTING_PROTOCOLS = new Set(['16:8', '18:6', '20:4', '5:2', 'custom']);

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

function toNumber(value: unknown) {
  if (typeof value === 'number') return value;
  if (typeof value === 'string' && value.trim().length > 0) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function uniqueStrings(values: string[]) {
  const seen = new Set<string>();
  return values.filter((value) => {
    if (seen.has(value)) return false;
    seen.add(value);
    return true;
  });
}

function uniqueModuleIds(values: ModuleId[]) {
  const seen = new Set<ModuleId>();
  const ordered: ModuleId[] = [];

  for (const value of values) {
    if (seen.has(value)) continue;
    seen.add(value);
    ordered.push(value);
  }

  return ordered;
}

export function isBinaryGender(value: unknown): value is OnboardingBinaryGender {
  return value === 'male' || value === 'female';
}

export function isGoalDetailId(value: unknown): value is OnboardingGoalDetailId {
  return GOAL_OPTIONS.some((option) => option.id === value);
}

export function isEquipmentType(value: unknown): value is OnboardingEquipmentType {
  return EQUIPMENT_OPTIONS.some((option) => option.id === value);
}

export function isValidWaterGoal(value: unknown): boolean {
  const parsed = toNumber(value);
  return parsed !== null && parsed >= 500 && parsed <= 4000;
}

export function getGoalOption(goalDetailId: OnboardingGoalDetailId | null | undefined) {
  return GOAL_OPTIONS.find((option) => option.id === goalDetailId) ?? null;
}

export function getEquipmentInventoryOptions(equipmentType: OnboardingEquipmentType) {
  return EQUIPMENT_INVENTORY_MAP[equipmentType];
}

export function sanitizeEquipmentInventory(
  equipmentType: OnboardingEquipmentType,
  values: unknown,
): EquipmentInventoryId[] {
  if (!Array.isArray(values)) return [];
  const allowed = new Set(EQUIPMENT_INVENTORY_MAP[equipmentType].map((item) => item.id));
  const normalized = uniqueStrings(
    values.filter((item): item is string => typeof item === 'string' && item.trim().length > 0),
  ).filter((item): item is EquipmentInventoryId => allowed.has(item as EquipmentInventoryId));

  if (equipmentType === 'bodyweight' && normalized.includes('none')) {
    return ['none'];
  }

  return normalized.filter((item) => item !== 'none');
}

export function getSuggestedStepGoal(activityLevel: ActivityLevel | undefined | null) {
  switch (activityLevel) {
    case 0:
      return 5000;
    case 1:
      return 6500;
    case 2:
      return 8000;
    case 4:
      return 11500;
    case 3:
    default:
      return 9500;
  }
}

function calculateSleepGoalHours(sleepTimeMinutes: number, wakeTimeMinutes: number) {
  const normalizedWake = wakeTimeMinutes <= sleepTimeMinutes ? wakeTimeMinutes + 1440 : wakeTimeMinutes;
  return Math.round((((normalizedWake - sleepTimeMinutes) / 60) + Number.EPSILON) * 10) / 10;
}

export function buildSuggestedWaterGoal(weightKg: number, activityLevel: ActivityLevel) {
  const baseGoal = calculateWaterGoal(weightKg);
  return activityLevel >= 4 ? baseGoal + 500 : baseGoal;
}

export function mapGoalDetailToProfileGoal(goalDetailId: OnboardingGoalDetailId): PrimaryGoal {
  return getGoalOption(goalDetailId)?.profileGoal ?? 'general_health';
}

export function buildSuggestedActiveModules(
  goalDetailId: OnboardingGoalDetailId,
  _gender: OnboardingBinaryGender,
  femaleHealthEnabled = false,
) {
  const ordered = uniqueModuleIds([...GOAL_MODULE_STACK[goalDetailId]]);

  if (femaleHealthEnabled) {
    ordered.push('female');
  }

  return uniqueModuleIds(ordered);
}

export function getSelectableOnboardingModules(gender: OnboardingBinaryGender) {
  return MODULES.filter((module) => gender === 'female' || module.id !== 'female');
}

export function sanitizeActiveModuleSelection(
  gender: OnboardingBinaryGender,
  values: unknown,
): ModuleId[] {
  if (!Array.isArray(values)) return [];

  const allowed = new Set(getSelectableOnboardingModules(gender).map((module) => module.id));
  const ordered: ModuleId[] = [];
  const seen = new Set<ModuleId>();

  for (const item of values) {
    if (typeof item !== 'string') continue;
    const normalized = item.trim();
    if (!allowed.has(normalized) || !ONBOARDING_MODULE_IDS.includes(normalized as ModuleId)) {
      continue;
    }

    const moduleId = normalized as ModuleId;
    if (seen.has(moduleId)) continue;
    seen.add(moduleId);
    ordered.push(moduleId);
  }

  return ordered;
}

function isValidAge(value: unknown) {
  const parsed = toNumber(value);
  return parsed !== null && parsed >= 13 && parsed <= 90;
}

function isValidHeight(value: unknown) {
  const parsed = toNumber(value);
  return parsed !== null && parsed >= 120 && parsed <= 230;
}

function isValidWeight(value: unknown) {
  const parsed = toNumber(value);
  return parsed !== null && parsed >= 35 && parsed <= 260;
}

function isValidActivity(value: unknown): value is ActivityLevel {
  return value === 0 || value === 1 || value === 2 || value === 3 || value === 4;
}

function isValidMinutes(value: unknown) {
  const parsed = toNumber(value);
  return parsed !== null && parsed >= 0 && parsed <= 1440;
}

function isValidFastingProtocol(value: unknown) {
  return typeof value === 'string' && FASTING_PROTOCOLS.has(value.trim());
}

function isValidNutritionPattern(value: unknown) {
  return typeof value === 'string' && value.trim().length > 0;
}

function isValidCycleLength(value: unknown) {
  const parsed = toNumber(value);
  return parsed !== null && parsed >= 20 && parsed <= 40;
}

function isValidDateString(value: unknown) {
  if (typeof value !== 'string' || value.trim().length === 0) return false;
  const parsed = new Date(`${value}T00:00:00`);
  return !Number.isNaN(parsed.getTime());
}

function requiresEquipmentInventory(equipment: unknown) {
  return equipment === 'home_basic' || equipment === 'bodyweight';
}

export function getFirstIncompleteOnboardingRoute(
  draft: Partial<OnboardingDraft> | null | undefined,
) {
  if (!isGoalDetailId(draft?.goal_detail) || !getGoalOption(draft.goal_detail)) {
    return Routes.auth.onboarding.goal;
  }
  if (!isBinaryGender(draft?.gender)) return Routes.auth.onboarding.age;
  if (!isValidAge(draft?.age) || !isValidHeight(draft?.height_cm) || !isValidWeight(draft?.weight_start_kg)) {
    return Routes.auth.onboarding.age;
  }
  if (!isValidActivity(draft?.activity_level)) return Routes.auth.onboarding.activity;
  const selectedModules = sanitizeActiveModuleSelection(draft.gender, draft.active_modules);
  if (selectedModules.length === 0) return Routes.auth.onboarding.modules;

  const activeModules = new Set(selectedModules);

  if (activeModules.has('nutrition') && !isValidNutritionPattern(draft?.nutrition_pattern)) {
    return Routes.auth.onboarding.nutrition;
  }

  if (activeModules.has('workout')) {
    if (!isEquipmentType(draft?.equipment)) return Routes.auth.onboarding.equipment;
    if (requiresEquipmentInventory(draft.equipment)) {
      const equipmentInventory = sanitizeEquipmentInventory(draft.equipment, draft.equipment_inventory);
      if (equipmentInventory.length === 0) {
        return Routes.auth.onboarding.equipmentInventory;
      }
    }
  }

  if (activeModules.has('fasting') && !isValidFastingProtocol(draft?.fasting_protocol)) {
    return Routes.auth.onboarding.fasting;
  }

  if (
    activeModules.has('sleep') &&
    (!isValidMinutes(draft?.wake_time_minutes) || !isValidMinutes(draft?.sleep_time_minutes))
  ) {
    return Routes.auth.onboarding.sleep;
  }

  if (activeModules.has('steps') && !isValidNumberLikeGoal(draft?.step_goal, 1000, 50000)) {
    return Routes.auth.onboarding.steps;
  }

  if (activeModules.has('water') && !isValidWaterGoal(draft?.water_goal_ml)) {
    return Routes.auth.onboarding.water;
  }

  if (
    draft.female_health_enabled === true &&
    draft.female_onboarding_completed !== true
  ) {
    return Routes.auth.onboarding.female;
  }

  return Routes.auth.onboarding.ready;
}

function isValidNumberLikeGoal(value: unknown, min: number, max: number) {
  const parsed = toNumber(value);
  return parsed !== null && parsed >= min && parsed <= max;
}

const ONBOARDING_ROUTE_ORDER: Record<string, number> = {
  [Routes.auth.onboarding.goal]: 1,
  [Routes.auth.onboarding.age]: 2,
  [Routes.auth.onboarding.activity]: 3,
  [Routes.auth.onboarding.equipment]: 4,
  [Routes.auth.onboarding.modules]: 5,
  [Routes.auth.onboarding.nutrition]: 6,
  [Routes.auth.onboarding.water]: 6.5,
  [Routes.auth.onboarding.equipmentInventory]: 7,
  [Routes.auth.onboarding.fasting]: 8,
  [Routes.auth.onboarding.sleep]: 9,
  [Routes.auth.onboarding.steps]: 10,
  [Routes.auth.onboarding.female]: 11,
  [Routes.auth.onboarding.ready]: 12,
};

export function getAccessibleOnboardingRoute(
  requestedRoute: string,
  draft: Partial<OnboardingDraft> | null | undefined,
) {
  const firstIncompleteRoute = getFirstIncompleteOnboardingRoute(draft);
  const requestedOrder = ONBOARDING_ROUTE_ORDER[requestedRoute];
  const firstIncompleteOrder = ONBOARDING_ROUTE_ORDER[firstIncompleteRoute];

  if (!requestedOrder || !firstIncompleteOrder) {
    return firstIncompleteRoute;
  }

  return requestedOrder <= firstIncompleteOrder ? requestedRoute : firstIncompleteRoute;
}

export function buildOnboardingDataFromDraft(
  draft: Partial<OnboardingDraft> | null | undefined,
): OnboardingData | null {
  if (!draft) return null;
  if (getFirstIncompleteOnboardingRoute(draft) !== Routes.auth.onboarding.ready) return null;

  const gender = draft.gender as OnboardingBinaryGender;
  const goalDetail = draft.goal_detail as OnboardingGoalDetailId;
  const age = Number(draft.age);
  const heightCm = Number(draft.height_cm);
  const weightStartKg = Number(draft.weight_start_kg);
  const activityLevel = draft.activity_level as ActivityLevel;
  const waterGoalMl = buildSuggestedWaterGoal(weightStartKg, activityLevel);
  const stepGoal = isValidNumberLikeGoal(draft?.step_goal, 1000, 50000)
    ? Number(draft.step_goal)
    : getSuggestedStepGoal(activityLevel);
  const sleepTimeMinutes = isValidMinutes(draft?.sleep_time_minutes)
    ? Number(draft.sleep_time_minutes)
    : 1380;
  const wakeTimeMinutes = isValidMinutes(draft?.wake_time_minutes)
    ? Number(draft.wake_time_minutes)
    : 420;
  const equipment = draft.equipment as OnboardingEquipmentType;
  const equipmentInventory = sanitizeEquipmentInventory(equipment, draft.equipment_inventory);
  const selectedModules = sanitizeActiveModuleSelection(gender, draft.active_modules);
  const femaleHealthEnabled = draft.female_health_enabled === true;
  const activeModules =
    selectedModules.length >= 1
      ? selectedModules
      : buildSuggestedActiveModules(goalDetail, gender, femaleHealthEnabled);
  const nutritionPattern =
    typeof draft.nutrition_pattern === 'string' && draft.nutrition_pattern.trim().length > 0
      ? draft.nutrition_pattern.trim()
      : 'sin_restricciones';
  const fastingProtocol =
    typeof draft.fasting_protocol === 'string' && draft.fasting_protocol.trim().length > 0
      ? draft.fasting_protocol.trim()
      : activeModules.includes('fasting')
        ? '16:8'
        : null;

  return {
    name: draft.name?.trim() ?? '',
    age,
    goal: mapGoalDetailToProfileGoal(goalDetail),
    goal_detail: goalDetail,
    gender,
    height_cm: heightCm,
    weight_start_kg: weightStartKg,
    weight_current_kg: weightStartKg,
    body_fat_current_pct: isFiniteNumber(draft.body_fat_current_pct)
      ? draft.body_fat_current_pct
      : null,
    activity_level: activityLevel,
    water_goal_ml: waterGoalMl,
    step_goal: stepGoal,
    sleep_goal_hours: calculateSleepGoalHours(sleepTimeMinutes, wakeTimeMinutes),
    nutrition_pattern: nutritionPattern,
    equipment,
    equipment_inventory: equipmentInventory,
    workout_limitations: [],
    active_modules: activeModules,
    wake_time_minutes: wakeTimeMinutes,
    sleep_time_minutes: sleepTimeMinutes,
    fasting_protocol: fastingProtocol,
    female_health_enabled: femaleHealthEnabled,
    female_onboarding_completed: draft.female_onboarding_completed === true || femaleHealthEnabled,
    female_cycle_length:
      isFiniteNumber(draft.female_cycle_length) && draft.female_cycle_length >= 20
        ? draft.female_cycle_length
        : null,
    female_last_period_date:
      typeof draft.female_last_period_date === 'string' &&
      draft.female_last_period_date.trim().length > 0
        ? draft.female_last_period_date.trim()
        : null,
    context_display_name: draft.name?.trim() ?? '',
    notifications_permission_state: 'skipped',
    health_connect_enabled: false,
    terms_accepted: true,
    privacy_accepted: true,
  } satisfies OnboardingData;
}
