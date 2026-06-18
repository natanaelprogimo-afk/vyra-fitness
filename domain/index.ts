/**
 * Domain Layer - Business logic for all fitness modules
 * 
 * Organized by domain:
 * - readiness: Score calculation
 * - workout: Training sessions and cycles
 * - fasting: Intermittent fasting
 * - female-health: Female cycle tracking, injury
 * - onboarding: User onboarding flow
 * - notifications: Push notifications
 * - nutrition: Meal tracking
 * - sleep: Sleep tracking
 * - water: Hydration tracking
 * - weight: Weight tracking
 * - health-connect: HealthKit/Google Health integration
 * - engagement: Streaks, insights, correlations
 * - export: Data export functionality
 * - profile: User profile management
 */

export * from './readiness';
export * from './workout';
export * from './fasting';
export * from './female-health';
export * from './onboarding';
export * from './notifications';
export * from './nutrition';
export * from './sleep';
export * from './water';
export * from './weight';
export * from './health-connect';
export * from './engagement';
export * from './export';
export * from './profile';
