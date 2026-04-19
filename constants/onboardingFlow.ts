import { Routes } from '@/constants/routes';
import { ONBOARDING_STEP_TOTAL } from '@/lib/onboarding-v2';

export type OnboardingBlockKey = 'setup';

export interface OnboardingStepMeta {
  pathname: string;
  stepKey: string;
  label: string;
  title: string;
  order: number;
  totalSteps: number;
  blockKey: OnboardingBlockKey;
  blockLabel: string;
  blockIndex: number;
  stepInBlock: number;
  stepsInBlock: number;
  isUpsell?: boolean;
}

type StepSeed = {
  pathname: string;
  stepKey: string;
  label: string;
  order: number;
};

const STEP_SEEDS: readonly StepSeed[] = [
  { pathname: Routes.auth.onboarding.goals, stepKey: 'goal', label: 'Nombre y objetivo', order: 1 },
  { pathname: Routes.auth.onboarding.equipment, stepKey: 'equipment', label: 'Equipo', order: 2 },
  { pathname: Routes.auth.onboarding.modules, stepKey: 'modules', label: 'Modulos', order: 3 },
  { pathname: Routes.auth.onboarding.ready, stepKey: 'ready', label: 'Todo listo', order: 4 },
] as const;

function normalizeOnboardingPath(pathname: string | null | undefined) {
  if (!pathname) return '';
  const trimmed = pathname.trim();
  if (!trimmed) return '';
  const withLeadingSlash = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
  const withoutGroups = withLeadingSlash.replace(/\/\([^/]+\)/g, '');
  const collapsed = withoutGroups.replace(/\/{2,}/g, '/');
  return collapsed.length > 1 ? collapsed.replace(/\/$/, '') : collapsed;
}

export const ONBOARDING_STEPS: readonly OnboardingStepMeta[] = STEP_SEEDS.map((seed) => ({
  pathname: normalizeOnboardingPath(seed.pathname),
  stepKey: seed.stepKey,
  label: seed.label,
  title: seed.label,
  order: seed.order,
  totalSteps: ONBOARDING_STEP_TOTAL,
  blockKey: 'setup',
  blockLabel: 'Configurando VYRA',
  blockIndex: 1,
  stepInBlock: seed.order,
  stepsInBlock: ONBOARDING_STEP_TOTAL,
  isUpsell: false,
}));

export function isOnboardingPath(pathname: string | null | undefined) {
  const normalized = normalizeOnboardingPath(pathname);
  return ONBOARDING_STEPS.some((step) => step.pathname === normalized);
}

export function getOnboardingStepMeta(pathname: string | null | undefined): OnboardingStepMeta | null {
  const normalized = normalizeOnboardingPath(pathname);
  return ONBOARDING_STEPS.find((step) => step.pathname === normalized) ?? null;
}
