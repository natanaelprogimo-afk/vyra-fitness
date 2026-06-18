/**
 * Library Layer - Library setup, auth, and utilities
 * 
 * Exports all public lib APIs organized by layer:
 * - auth: Authentication & session management
 * - security: Cryptographic utilities
 * - setup: Library initialization (Sentry, Analytics, Query Client)
 * - sync: Offline-first sync queue
 * - integrations: Third-party integrations and AI
 * - qa: QA/testing utilities
 */

export * from './auth';
export * from './security';
export * from './setup';
export * from './sync';
export * from './integrations';
export * from './qa';
