# 📁 lib/ Reorganization Guide - Issue #3

**Status**: Phase 2 P1 High  
**Target**: Clear layered architecture for 85+ lib files  
**Approach**: Nivel 1 (documentation + export structure, files moved as needed)

---

## Current State

`vyra-fitness/lib/` contains 85+ files with no clear organization:
- 20+ auth files mixed with domain logic
- Utility functions scattered across files
- Domain logic (workout, nutrition, etc.) mixed with setup code

## Target Architecture

```
vyra-fitness/
├── lib/
│   ├── auth/
│   │   ├── auth-profile.ts          ✅ MOVED
│   │   ├── auth-session.ts          ✅ MOVED
│   │   ├── guest-auth.ts            ✅ MOVED
│   │   ├── password-recovery.ts     ✅ MOVED
│   │   ├── supabase.ts              ✅ MOVED
│   │   └── index.ts                 ✅ CREATED
│   ├── security/
│   │   ├── sensitive-crypto.ts      ✅ MOVED
│   │   └── index.ts                 ✅ CREATED
│   ├── setup/
│   │   ├── analytics.ts             ✅ MOVED
│   │   ├── sentry.ts                ✅ MOVED
│   │   ├── query-client.ts          ✅ MOVED
│   │   └── index.ts                 ✅ CREATED
│   ├── sync/
│   │   ├── syncQueue.ts             ✅ Phase 1 (created)
│   │   ├── sync-user.ts             📋 QUEUED
│   │   └── index.ts                 📋 QUEUED
│   ├── integrations/
│   │   ├── ads/                     ✅ MOVED
│   │   ├── ad-consent.ts            📋 QUEUED
│   │   ├── widget-*.ts              📋 QUEUED
│   │   ├── ai-assist.ts             📋 QUEUED
│   │   └── index.ts                 📋 QUEUED
│   ├── qa/
│   │   ├── qa-auth-bridge.ts        📋 QUEUED
│   │   ├── qa-background-fetch.ts   📋 QUEUED
│   │   └── index.ts                 📋 QUEUED
│   └── (legacy files stay for now)
│       ├── active-modules.ts
│       ├── background-task-ids.ts
│       ├── incoming-route.ts
│       ├── offline-errors.ts
│       ├── privacy-settings.ts
│       └── quick-log.ts
├── domain/
│   ├── readiness/
│   │   ├── readiness-score.ts       ✅ MOVED
│   │   └── index.ts                 📋 QUEUED
│   ├── workout/
│   │   ├── workout-catalog.generated.ts  ✅ MOVED
│   │   ├── workout-cycle.ts         ✅ MOVED
│   │   ├── workout-data.ts          ✅ MOVED
│   │   ├── workout-local-data.ts    ✅ MOVED
│   │   ├── workout-metrics.ts       ✅ MOVED
│   │   ├── workout-plan.ts          ✅ MOVED
│   │   ├── workout-session.ts       ✅ MOVED
│   │   ├── workout-share-image.ts   ✅ MOVED
│   │   ├── workout-types.ts         ✅ MOVED
│   │   ├── muscle-images.ts         ✅ MOVED
│   │   └── index.ts                 📋 QUEUED
│   ├── fasting/
│   │   ├── fasting-module.ts        ✅ MOVED
│   │   ├── fasting-settings.ts      ✅ MOVED
│   │   ├── fasting-types.ts         ✅ MOVED
│   │   └── index.ts                 📋 QUEUED
│   ├── female-health/
│   │   ├── female-module.ts         ✅ MOVED
│   │   ├── female-phase.ts          ✅ MOVED
│   │   ├── injury-settings.ts       ✅ MOVED
│   │   └── index.ts                 📋 QUEUED
│   ├── onboarding/
│   │   ├── onboarding-storage.ts    ✅ MOVED
│   │   ├── onboarding-v2.ts         ✅ MOVED
│   │   └── index.ts                 📋 QUEUED
│   ├── notifications/
│   │   ├── notification-actions.ts  ✅ MOVED
│   │   ├── notification-activity.ts ✅ MOVED
│   │   ├── notification-quiet-hours.ts ✅ MOVED
│   │   ├── notifications.ts         ✅ MOVED
│   │   └── index.ts                 📋 QUEUED
│   ├── nutrition/
│   │   ├── nutrition-limits.ts      ✅ MOVED
│   │   ├── nutrition-log.ts         ✅ MOVED
│   │   ├── nutrition-mode.ts        ✅ MOVED
│   │   ├── nutrition-offline.ts     ✅ MOVED
│   │   └── index.ts                 📋 QUEUED
│   ├── sleep/
│   │   ├── sleep-module.ts          ✅ MOVED
│   │   ├── sleep-offline.ts         ✅ MOVED
│   │   ├── sleep-sounds.ts          ✅ MOVED
│   │   └── index.ts                 📋 QUEUED
│   ├── water/
│   │   ├── water-context.ts         ✅ MOVED
│   │   ├── water-custom.ts          ✅ MOVED
│   │   ├── water-offline.ts         ✅ MOVED
│   │   ├── water-weather.ts         ✅ MOVED
│   │   ├── water.ts                 ✅ MOVED
│   │   └── index.ts                 📋 QUEUED
│   ├── weight/
│   │   ├── weight-offline.ts        ✅ MOVED
│   │   └── index.ts                 📋 QUEUED
│   ├── health-connect/
│   │   ├── health-connect-sleep.ts  ✅ MOVED
│   │   ├── health-connect-steps.ts  ✅ MOVED
│   │   ├── steps-background-sync.ts ✅ MOVED
│   │   ├── steps-calibration.ts     ✅ MOVED
│   │   ├── steps-route-task.ts      ✅ MOVED
│   │   └── index.ts                 📋 QUEUED
│   ├── engagement/
│   │   ├── engagement-streak.ts     ✅ MOVED
│   │   ├── module-correlations.ts   ✅ MOVED
│   │   ├── progress-insights.ts     ✅ MOVED
│   │   └── index.ts                 📋 QUEUED
│   ├── export/
│   │   ├── export-history.ts        ✅ MOVED
│   │   ├── export-sensitive.ts      ✅ MOVED
│   │   └── index.ts                 📋 QUEUED
│   └── profile/
│       ├── profile-context.ts       ✅ MOVED
│       └── index.ts                 📋 QUEUED
├── config/
│   ├── i18n.ts                      ✅ MOVED
│   ├── language.ts                  ✅ MOVED
│   ├── legal-content.ts             ✅ MOVED
│   ├── navigation-context.ts        ✅ MOVED
│   └── index.ts                     📋 QUEUED
└── utils/
    ├── accessibility.ts             ✅ MOVED
    ├── text-scale.ts                ✅ MOVED
    ├── format-distance.ts           ✅ MOVED
    ├── haptics.ts                   ✅ MOVED
    ├── vyra-balance.ts              ✅ MOVED
    ├── visual-progress.ts           ✅ MOVED
    └── (updated index.ts)           📋 QUEUED
```

---

## Import Migration Patterns

### BEFORE (Confusing):
```typescript
// Mixed from lib/ with no clear pattern
import { calculateScore } from '@/lib/readiness-score';
import { getPhase } from '@/lib/female-phase';
import { logEvent } from '@/lib/analytics';
import { setupSentry } from '@/lib/sentry';
import { queryClient } from '@/lib/query-client';
```

### AFTER (Clear by Layer):
```typescript
// Domain logic - clear intent
import { calculateScore } from '@/domain/readiness';
import { getPhase } from '@/domain/female-health';

// Setup/initialization
import { logEvent } from '@/lib/setup';
import { setupSentry } from '@/lib/setup';
import { queryClient } from '@/lib/setup';

// Auth layer
import { supabase } from '@/lib/auth';

// Utils
import { formatDate } from '@/utils/dates';
```

---

## Files Completed ✅

- **Moved to lib/auth/**: auth-profile.ts, auth-session.ts, guest-auth.ts, password-recovery.ts, supabase.ts
- **Moved to lib/security/**: sensitive-crypto.ts
- **Moved to lib/setup/**: analytics.ts, sentry.ts, query-client.ts
- **Moved to domain/readiness/**: readiness-score.ts
- **Moved to domain/workout/**: all workout-*.ts files
- **Moved to domain/fasting/**: all fasting-*.ts files
- **Moved to domain/female-health/**: all female-*.ts files, injury-settings.ts
- **Moved to domain/onboarding/**: all onboarding-*.ts files
- **Moved to domain/notifications/**: all notification-*.ts files, notifications.ts
- **Moved to domain/nutrition/**: all nutrition-*.ts files
- **Moved to domain/sleep/**: all sleep-*.ts files
- **Moved to domain/water/**: all water-*.ts files
- **Moved to domain/weight/**: weight-*.ts files
- **Moved to domain/health-connect/**: health-connect-*.ts, steps-*.ts files
- **Moved to domain/engagement/**: engagement-streak.ts, progress-insights.ts, module-correlations.ts
- **Moved to domain/export/**: export-history.ts, export-sensitive.ts
- **Moved to domain/profile/**: profile-context.ts
- **Moved to utils/**: accessibility.ts, text-scale.ts, format-distance.ts, haptics.ts, vyra-balance.ts, visual-progress.ts
- **Deleted**: watermelondb.ts (deprecated in Phase 1)

---

## Files Remaining (Legacy, To Be Organized)

These files need categorization as part of Phase 2:
- `active-modules.ts` → constants/ or lib/
- `ad-consent.ts` → lib/integrations/
- `background-task-ids.ts` → lib/ (stays)
- `incoming-route.ts` → lib/navigation/ (new)
- `offline-errors.ts` → lib/offline/
- `privacy-settings.ts` → domain/privacy/ or config/
- `quick-log.ts` → domain/quick-actions/
- `widget-settings.ts` → lib/integrations/
- `widget-sync.ts` → lib/integrations/
- `ai-assist.ts` → lib/integrations/

---

## Index Files to Create

Each domain folder needs an index.ts that exports all public APIs:

### domain/readiness/index.ts
```typescript
export * from './readiness-score';
```

### domain/workout/index.ts
```typescript
export * from './workout-types';
export * from './workout-data';
export * from './workout-local-data';
export * from './workout-cycle';
export * from './workout-session';
export * from './workout-metrics';
export * from './workout-plan';
export * from './workout-share-image';
export * from './muscle-images';
export { catalogedWorkouts } from './workout-catalog.generated';
```

(Similar for all domain folders...)

### lib/index.ts
```typescript
// Auth layer
export * from './auth';

// Security
export * from './security';

// Setup/initialization
export * from './setup';

// Sync/offline
export * from './sync';

// Third-party integrations
export * from './integrations';
```

### config/index.ts
```typescript
export * from './i18n';
export * from './language';
export * from './legal-content';
export * from './navigation-context';
```

---

## Impact on Code Quality

✅ **Discoverability**: New dev knows where female health logic is (`@/domain/female-health`)
✅ **Responsibility**: Clear layer separation (domain vs lib vs utils vs config)
✅ **Imports**: Standardized patterns (from @/domain/*, @/lib/*, @/config/*, @/utils/*)
✅ **Testing**: Tests can mirror folder structure (test/domain/*, test/lib/*, etc.)
✅ **Refactoring**: Moving code has clear rules (don't move across layers)

---

## Next Steps

1. ✅ Create directory structure
2. ✅ Move files by category
3. 📋 Create index.ts files for all domain folders
4. 📋 Create lib/index.ts and config/index.ts
5. 📋 Update imports in hooks/components (major refactor)
6. 📋 Run npm typecheck (verify no errors)
7. 📋 Update tsconfig paths (optional, for cleaner imports)

---

## Effort Estimate

- **Nivel 1** (Done): Directory structure + file moves = ✅ COMPLETE
- **Nivel 2** (Next): Update imports across 200+ files = 4-6 hours
- **Nivel 3** (Optional): tsconfig path aliases + barrel exports = 1-2 hours

**Current Status**: Nivel 1 COMPLETE, ready for Nivel 2 import updates

---

**Document**: Issue #3 Reorganization Guide  
**Created**: May 9, 2026  
**Version**: 1.0.0
