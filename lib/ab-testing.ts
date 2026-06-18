/**
 * A/B Testing Framework for Onboarding Flow
 * Allows testing different flow variations without code changes
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

export type ExperimentVariant = 'control' | 'variant_a' | 'variant_b' | 'variant_c';

export interface ABTestConfig {
  experimentName: string;
  variants: ExperimentVariant[];
  enabled: boolean;
  // Which variants show which steps
  modulesSplit?: {
    // For 'modules_redesign' experiment:
    // control: shows all 11 modules in one step
    // variant_a: shows only core 5, then advanced module config in settings
    // variant_b: shows modules in carousel instead of grid
  };
  stepsOrder?: {
    // For 'steps_reorder' experiment:
    // control: original order (goal, age, activity, modules, ...)
    // variant_a: modules before activity
    // variant_b: modules before goal
  };
}

// Active experiments configuration
export const ACTIVE_EXPERIMENTS: Record<string, ABTestConfig> = {
  modules_redesign: {
    experimentName: 'modules_redesign',
    variants: ['control', 'variant_a', 'variant_b'],
    enabled: true,
    // control: 11 modules in grid (3 col)
    // variant_a: 5 core modules, 6 advanced moved to secondary setup
    // variant_b: 11 modules in carousel/horizontal scroll
  },
  steps_reorder: {
    experimentName: 'steps_reorder',
    variants: ['control', 'variant_a'],
    enabled: false,
    // control: original order
    // variant_a: modules before activity (test if less abandon)
  },
  express_extra_fields: {
    experimentName: 'express_extra_fields',
    variants: ['control', 'variant_a'],
    enabled: true,
    // control: express flow without age/height (current)
    // variant_a: express flow with quick age/height collection (single step)
  },
};

/**
 * Assign user to a variant for an experiment
 * Uses consistent hashing based on user ID to ensure stable assignment
 */
export async function getVariantForExperiment(
  experimentName: string,
  userId?: string
): Promise<ExperimentVariant> {
  const config = ACTIVE_EXPERIMENTS[experimentName];

  if (!config?.enabled) {
    return 'control';
  }

  try {
    // Check if already assigned
    const cachedVariant = await AsyncStorage.getItem(`experiment_${experimentName}_variant`);
    if (cachedVariant && (config.variants as string[]).includes(cachedVariant)) {
      return cachedVariant as ExperimentVariant;
    }

    // Assign based on userId hash for consistent distribution
    const seedValue = userId ? hashUserId(userId) : Math.random();
    const variantIndex = Math.floor(seedValue * config.variants.length);
    const assignedVariant = config.variants[variantIndex];

    // Cache the assignment
    await AsyncStorage.setItem(`experiment_${experimentName}_variant`, assignedVariant);

    return assignedVariant;
  } catch (error) {
    console.error(`Error getting variant for ${experimentName}:`, error);
    return 'control';
  }
}

/**
 * Simple hash function for user ID to distribution
 */
function hashUserId(userId: string): number {
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    const char = userId.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash) / 2147483647; // Normalize to 0-1
}

/**
 * Track experiment event (for analytics)
 */
export async function trackExperimentEvent(
  experimentName: string,
  variant: ExperimentVariant,
  eventType: 'view' | 'interact' | 'complete' | 'abandon',
  metadata?: Record<string, any>
): Promise<void> {
  try {
    // Implementation would send to analytics backend
    // For now, just log to console
    console.log(`[AB Test] ${experimentName} - ${variant} - ${eventType}`, metadata);

    // In production, send to:
    // - Segment
    // - Mixpanel
    // - Custom analytics backend
    // Example:
    // await analytics.track({
    //   event: `experiment_${eventType}`,
    //   properties: {
    //     experiment: experimentName,
    //     variant,
    //     ...metadata,
    //   },
    // });
  } catch (error) {
    console.error('Error tracking experiment event:', error);
  }
}

/**
 * Clear experiment assignments (for testing/debugging)
 */
export async function clearExperimentAssignments(): Promise<void> {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const experimentKeys = keys.filter(k => k.startsWith('experiment_'));
    await AsyncStorage.multiRemove(experimentKeys);
  } catch (error) {
    console.error('Error clearing experiment assignments:', error);
  }
}

/**
 * Force a specific variant for testing
 */
export async function forceVariantForExperiment(
  experimentName: string,
  variant: ExperimentVariant
): Promise<void> {
  try {
    await AsyncStorage.setItem(`experiment_${experimentName}_variant`, variant);
  } catch (error) {
    console.error('Error forcing variant:', error);
  }
}
