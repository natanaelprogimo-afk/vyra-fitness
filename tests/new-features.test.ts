/**
 * Tests for new onboarding features
 * - Resume onboarding
 * - Reset in-flow
 * - A/B testing framework
 * - Modules redesign
 * - Secure storage
 */

import { describe, it, expect } from '@jest/globals';
import {
  CORE_MODULES,
  ADVANCED_MODULES,
  getModuleCategory,
  getModulesToShowInOnboarding,
} from '@/lib/modules-redesign';

describe('Modules Redesign', () => {
  it('categorizes modules correctly', () => {
    expect(getModuleCategory('workout')).toBe('core');
    expect(getModuleCategory('nutrition')).toBe('core');
    expect(getModuleCategory('steps')).toBe('core');
    expect(getModuleCategory('water')).toBe('core');
    expect(getModuleCategory('sleep')).toBe('core');

    expect(getModuleCategory('fasting')).toBe('advanced');
    expect(getModuleCategory('female')).toBe('advanced');
    expect(getModuleCategory('supplements')).toBe('advanced');
    expect(getModuleCategory('mental')).toBe('advanced');
    expect(getModuleCategory('recovery')).toBe('advanced');
    expect(getModuleCategory('weight')).toBe('advanced');
  });

  it('returns correct modules by variant', () => {
    const control = getModulesToShowInOnboarding('control');
    const variantA = getModulesToShowInOnboarding('variant_a');
    const variantB = getModulesToShowInOnboarding('variant_b');

    // Control and variant_b show all
    expect(control.length).toBe(11);
    expect(variantB.length).toBe(11);

    // Variant A shows only core
    expect(variantA.length).toBe(5);
    expect(variantA).toEqual(['workout', 'nutrition', 'steps', 'water', 'sleep']);
  });

  it('correctly separates core and advanced modules', () => {
    expect(CORE_MODULES.length).toBe(5);
    expect(ADVANCED_MODULES.length).toBe(6);

    // No overlap
    const overlap = CORE_MODULES.filter(m => ADVANCED_MODULES.includes(m));
    expect(overlap).toHaveLength(0);
  });

  it('core modules include fitness essentials', () => {
    const essentials = ['workout', 'nutrition', 'steps'];
    essentials.forEach(essential => {
      expect(CORE_MODULES).toContain(essential as any);
    });
  });

  it('advanced modules are optional enhancements', () => {
    // Advanced modules are more specialized
    const specialized = ['fasting', 'female', 'recovery'];
    specialized.forEach(special => {
      expect(ADVANCED_MODULES).toContain(special as any);
    });
  });
});
