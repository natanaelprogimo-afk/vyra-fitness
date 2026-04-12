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
  { pathname: Routes.auth.register, stepKey: 'account', label: 'Cuenta', order: 1 },
  { pathname: Routes.auth.onboarding.goals, stepKey: 'goal', label: 'Objetivo', order: 2 },
  { pathname: Routes.auth.onboarding.base, stepKey: 'base', label: 'Tu base', order: 3 },
  { pathname: Routes.auth.onboarding.modules, stepKey: 'modules', label: 'Modulos', order: 4 },
  { pathname: Routes.auth.onboarding.meta, stepKey: 'meta', label: 'Metas', order: 5 },
  { pathname: Routes.auth.onboarding.permissions, stepKey: 'permissions', label: 'Permisos', order: 6 },
  { pathname: Routes.auth.onboarding.legal, stepKey: 'legal', label: 'Legal', order: 7 },
] as const;

function normalizeOnboardingPath(pathname: string | null | undefined) {
  if (!pathname) return '';
  const [pathOnly] = pathname.split('?');
  if (!pathOnly) return '';
  const trimmed = pathOnly.trim();
  if (!trimmed) return '';
  const withLeadingSlash = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
  const withoutGroups = withLeadingSlash.replace(/\/\([^/]+\)/g, '');
  const collapsed = withoutGroups.replace(/\/{2,}/g, '/');
  if (!collapsed) return '/';
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
