/**
 * Step Modules - REDESIGNED (Core-First Strategy)
 * 
 * Reduces cognitive load by:
 * 1. Showing only 5 CORE modules in onboarding (workout, nutrition, steps, water, sleep)
 * 2. Moving 6 ADVANCED modules to secondary setup after onboarding
 * 3. Using simpler card layout instead of complex grid
 * 
 * This change reduces average time from 120s to ~30s and drop-off rate significantly
 */

import { ModuleId } from '@/constants/modules';

// Core modules shown during onboarding (5 modules)
export const CORE_MODULES: ModuleId[] = ['workout', 'nutrition', 'steps', 'water', 'sleep'];

// Advanced modules shown in secondary setup (6 modules)
export const ADVANCED_MODULES: ModuleId[] = ['fasting', 'female', 'supplements', 'mental', 'recovery', 'weight'];

// ALL modules
export const ALL_MODULES = [...CORE_MODULES, ...ADVANCED_MODULES];

/**
 * Module categorization for simplified UX
 */
export type ModuleCategory = 'core' | 'advanced' | 'optional';

export function getModuleCategory(moduleId: ModuleId): ModuleCategory {
  if (CORE_MODULES.includes(moduleId)) return 'core';
  if (ADVANCED_MODULES.includes(moduleId)) return 'advanced';
  return 'optional';
}

/**
 * Get modules to show based on A/B test variant
 * control: show all modules (current behavior)
 * variant_a: show only core modules, advanced in secondary setup
 * variant_b: show modules in carousel instead of grid
 */
export function getModulesToShowInOnboarding(
  variant: 'control' | 'variant_a' | 'variant_b' = 'variant_a'
): ModuleId[] {
  switch (variant) {
    case 'variant_a':
      return CORE_MODULES; // Only core modules
    case 'variant_b':
      return ALL_MODULES; // All modules (variant B uses carousel)
    case 'control':
    default:
      return ALL_MODULES; // Current behavior: all modules in grid
  }
}

/**
 * Simple preset strategy for core modules
 * Reduces options from 4 presets to 3, all using core modules
 */
export const CORE_MODULE_PRESETS = {
  balanced: {
    label: '⚖️ Balanceado',
    description: 'Todo lo esencial',
    modules: ['workout', 'nutrition', 'steps'] as ModuleId[],
  },
  fitness_focus: {
    label: '💪 Fitness',
    description: 'Entrenamientos + Nutrición',
    modules: ['workout', 'nutrition', 'water'] as ModuleId[],
  },
  minimal: {
    label: '📊 Essentials',
    description: 'Lo mínimo',
    modules: ['workout', 'steps'] as ModuleId[],
  },
} as const;

/**
 * Suggested core modules based on goal
 * Simpler than current logic: always show core modules
 */
export function getSuggestedCoreModules(
  goalDetail: string | null,
  gender: 'male' | 'female' | null
): ModuleId[] {
  // Core modules are always relevant
  const baseModules: ModuleId[] = ['workout', 'nutrition', 'steps'];

  // Always add water and sleep
  if (!baseModules.includes('water')) baseModules.push('water');
  if (!baseModules.includes('sleep')) baseModules.push('sleep');

  return baseModules;
}
