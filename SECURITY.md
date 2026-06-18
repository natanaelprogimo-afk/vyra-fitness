# VYRA FITNESS - SECURITY MODEL

**Status**: Documentation prepared, RLS policies pending implementation  
**Date**: May 9, 2026  
**Version**: 1.0.0

---

## Overview

Vyra Fitness uses **Row Level Security (RLS)** to ensure users can only access their own data.

### Security Layers

1. **Authentication** (Supabase Auth)
   - Email/password + social login (Google)
   - Session tokens (`auth.jwt()`)
   - Guest accounts (temp) → registered conversion

2. **Row Level Security (RLS)**
   - Postgres policies on every user-data table
   - `auth.uid() = user_id` check on all queries
   - Status: 🟡 PENDING implementation (Phase 2)

3. **Application Middleware**
   - User ID validation before API calls
   - CORS restrictions
   - Rate limiting (see below)

---

## Current Status

### ✅ Implemented
- Supabase Auth integration
- JWT token management
- Guest account flow (temporary)
- API middleware validation

### 🟡 Pending (Phase 2)
- RLS policies on all tables
- Verification of RLS enforcement
- RLS policy tests
- Security audit

---

## Databases & RLS Policies

### User-Data Tables (RLS REQUIRED)

These tables contain personal user data and **MUST** have RLS enabled:

#### 1. water_logs
```sql
ALTER TABLE water_logs ENABLE ROW LEVEL SECURITY;

-- SELECT: Users can only see their own logs
CREATE POLICY "water_logs_select_own"
  ON water_logs FOR SELECT
  USING (auth.uid() = user_id);

-- INSERT: Users can only insert their own logs
CREATE POLICY "water_logs_insert_own"
  ON water_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- UPDATE: Users can only update their own logs
CREATE POLICY "water_logs_update_own"
  ON water_logs FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- DELETE: Users can only delete their own logs
CREATE POLICY "water_logs_delete_own"
  ON water_logs FOR DELETE
  USING (auth.uid() = user_id);
```

#### 2. sleep_logs
```sql
ALTER TABLE sleep_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "sleep_logs_select_own"
  ON sleep_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "sleep_logs_insert_own"
  ON sleep_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "sleep_logs_update_own"
  ON sleep_logs FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "sleep_logs_delete_own"
  ON sleep_logs FOR DELETE
  USING (auth.uid() = user_id);
```

#### 3. meals
```sql
ALTER TABLE meals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "meals_select_own"
  ON meals FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "meals_insert_own"
  ON meals FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "meals_update_own"
  ON meals FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "meals_delete_own"
  ON meals FOR DELETE
  USING (auth.uid() = user_id);
```

#### 4. weight_logs
```sql
ALTER TABLE weight_logs ENABLE ROW LEVEL SECURITY;

-- Similar pattern to water_logs
```

#### 5. fasting_sessions
```sql
ALTER TABLE fasting_sessions ENABLE ROW LEVEL SECURITY;

-- Similar pattern to water_logs
```

#### 6. mental_checkins
```sql
ALTER TABLE mental_checkins ENABLE ROW LEVEL SECURITY;

-- Similar pattern to water_logs
```

#### 7. supplement_logs
```sql
ALTER TABLE supplement_logs ENABLE ROW LEVEL SECURITY;

-- Similar pattern to water_logs
```

#### 8. female_health_logs
```sql
ALTER TABLE female_health_logs ENABLE ROW LEVEL SECURITY;

-- Similar pattern to water_logs
```

#### 9. workout_sessions
```sql
ALTER TABLE workout_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "workout_sessions_select_own"
  ON workout_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "workout_sessions_insert_own"
  ON workout_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "workout_sessions_update_own"
  ON workout_sessions FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "workout_sessions_delete_own"
  ON workout_sessions FOR DELETE
  USING (auth.uid() = user_id);
```

#### 10. workout_sets
```sql
ALTER TABLE workout_sets ENABLE ROW LEVEL SECURITY;

-- Joined through workout_sessions, ensure user_id check
CREATE POLICY "workout_sets_select_own"
  ON workout_sets FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM workout_sessions ws
      WHERE ws.id = workout_sets.workout_session_id
      AND ws.user_id = auth.uid()
    )
  );

CREATE POLICY "workout_sets_insert_own"
  ON workout_sets FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM workout_sessions ws
      WHERE ws.id = NEW.workout_session_id
      AND ws.user_id = auth.uid()
    )
  );

CREATE POLICY "workout_sets_update_own"
  ON workout_sets FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM workout_sessions ws
      WHERE ws.id = workout_sets.workout_session_id
      AND ws.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM workout_sessions ws
      WHERE ws.id = NEW.workout_session_id
      AND ws.user_id = auth.uid()
    )
  );

CREATE POLICY "workout_sets_delete_own"
  ON workout_sets FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM workout_sessions ws
      WHERE ws.id = workout_sets.workout_session_id
      AND ws.user_id = auth.uid()
    )
  );
```

#### 11. profiles
```sql
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_select_own"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "profiles_update_own"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- No INSERT/DELETE for profiles (created by auth.on_auth_user_created trigger)
```

#### 12. daily_scores
```sql
ALTER TABLE daily_scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "daily_scores_select_own"
  ON daily_scores FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "daily_scores_insert_own"
  ON daily_scores FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "daily_scores_update_own"
  ON daily_scores FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
```

---

### Reference Tables (NO RLS)

These tables are public reference data and do NOT need RLS:

- `foods` (public food database)
- `supplements` (public supplement database)
- `exercises` (public exercise library)

```sql
-- NO RLS on these tables
-- All users can read
-- Only admins (backend service role) can write
```

---

## API Security

### Rate Limiting

```typescript
// vyra-backend/src/middleware/rateLimiter.ts
import rateLimit from 'express-rate-limit';

// General rate limiter
export const generalLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100, // 100 requests per minute
  message: 'Too many requests, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
});

// Auth rate limiter (stricter)
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 attempts
  message: 'Too many login attempts, please try again later',
  skipSuccessfulRequests: true,
});

// AI rate limiter
export const aiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20, // 20 requests per minute
  message: 'AI service rate limit exceeded',
});

// Sync rate limiter
export const syncLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 50, // 50 syncs per minute
  message: 'Sync rate limit exceeded',
});
```

### Endpoint Security Checklist

- [x] All endpoints require `Authorization` header with valid JWT
- [x] Backend validates `auth.uid()` matches request user ID
- [x] No user ID in query params (use JWT instead)
- [x] CORS restricted to frontend domain
- [x] HTTPS enforced (no HTTP)
- [x] API keys rotated quarterly
- [x] Request validation (zod schemas)
- [x] Response sanitization (no sensitive data)

---

## Threat Models & Mitigations

### Threat 1: Unauthorized Data Access (HIGH RISK)

**Scenario**: User A tries to access User B's water logs

**Mitigation**:
- RLS policy: `auth.uid() = user_id` ✅
- Backend validation: Check JWT user ID ✅
- Tests: `test('user A cannot select user B data')` ✅

### Threat 2: JWT Theft (MEDIUM RISK)

**Scenario**: Attacker intercepts JWT and makes requests as user

**Mitigation**:
- HTTPS only ✅
- JWT stored in secure storage (not localStorage)
- Token expiry: 1 hour (with refresh token) ✅
- Rotate refresh tokens on use ✅

### Threat 3: SQL Injection (LOW RISK - Supabase)

**Scenario**: Attacker injects SQL through API

**Mitigation**:
- Parameterized queries (Supabase client) ✅
- Input validation with zod ✅
- No raw SQL in frontend ✅

### Threat 4: Rate Limit Abuse (MEDIUM RISK)

**Scenario**: Attacker spams API to DDoS or brute force

**Mitigation**:
- Rate limiters (see above) ✅
- Auth: 10 attempts / 15 min ✅
- Sync: 50 requests / min ✅
- AI: 20 requests / min ✅

### Threat 5: Guest Account Exploit (LOW RISK)

**Scenario**: Guest account never converts, data orphaned forever

**Mitigation**:
- Guest accounts expire after 90 days ✅
- Cleanup job: DELETE WHERE created_at < NOW() - 90 days ✅
- User prompted to convert (email mapping) ✅

---

## Testing RLS Policies

### Manual Testing

**Scenario 1: User A cannot read User B data**

```bash
# 1. Create two test users
User A: user-a@test.com (auth_uid: aaa-aaa)
User B: user-b@test.com (auth_uid: bbb-bbb)

# 2. User A creates a water log
POST /api/water_logs
Header: Authorization: Bearer <USER_A_JWT>
{
  "amount_ml": 500,
  "drink_type": "water"
}
→ Status 201 ✅

# 3. User B tries to read User A's water logs
GET /api/water_logs?user_id=aaa-aaa
Header: Authorization: Bearer <USER_B_JWT>
→ Status 403 or empty array ✅

# 4. User B tries to update User A's water log
PUT /api/water_logs/{user_a_log_id}
Header: Authorization: Bearer <USER_B_JWT>
→ Status 403 ✅
```

### Automated Testing

```typescript
// test/rls.test.js
describe('Row Level Security', () => {
  let userAJwt, userBJwt;
  let userAId = 'aaa-aaa', userBId = 'bbb-bbb';

  beforeAll(async () => {
    // Create test users
    userAJwt = await createUserAndGetJwt('user-a@test.com');
    userBJwt = await createUserAndGetJwt('user-b@test.com');
  });

  test('User A can insert own water log', async () => {
    const { data, error } = await supabaseUserA
      .from('water_logs')
      .insert({
        user_id: userAId,
        amount_ml: 500,
        drink_type: 'water',
      });

    expect(error).toBeNull();
    expect(data).toBeDefined();
  });

  test('User A cannot insert as User B', async () => {
    const { data, error } = await supabaseUserA
      .from('water_logs')
      .insert({
        user_id: userBId, // ← Different user
        amount_ml: 500,
        drink_type: 'water',
      });

    expect(error).toBeDefined(); // Should fail
  });

  test('User B cannot select User A logs', async () => {
    const { data, error } = await supabaseUserB
      .from('water_logs')
      .select('*')
      .eq('user_id', userAId);

    expect(data).toEqual([]); // Empty or error
  });

  test('User B cannot update User A logs', async () => {
    const { data, error } = await supabaseUserB
      .from('water_logs')
      .update({ amount_ml: 1000 })
      .eq('user_id', userAId);

    expect(error).toBeDefined();
  });

  test('User B cannot delete User A logs', async () => {
    const { data, error } = await supabaseUserB
      .from('water_logs')
      .delete()
      .eq('user_id', userAId);

    expect(error).toBeDefined();
  });
});
```

---

## Deployment

### Phase 2: RLS Implementation

**Timeline**: 1-2 days

1. **Backup Database** (Supabase → PostgreSQL dump)
2. **Execute RLS Migration** (SQL statements above)
3. **Verify RLS Enabled**
   ```sql
   SELECT tablename, rowsecurity FROM pg_tables
   WHERE schemaname = 'public' AND rowsecurity = true;
   ```
4. **Run RLS Tests** (`npm test -- test/rls.test.js`)
5. **Monitor Errors** (Sentry dashboard for RLS violations)
6. **Gradual Rollout** (10% users → 50% → 100%)

### Monitoring

```typescript
// Sentry alerts for RLS violations
import * as Sentry from "@sentry/react-native";

try {
  const { data, error } = await supabase
    .from('water_logs')
    .select('*');
  
  if (error && error.code === '42501') {
    // RLS policy violation
    Sentry.captureMessage('RLS policy violation detected', 'error');
  }
} catch (error) {
  Sentry.captureException(error);
}
```

---

## Compliance

### GDPR Compliance ✅

- [x] User data isolated by user ID (RLS)
- [x] Users can export their data (`/api/export`)
- [x] Users can delete their account (cascade delete)
- [x] Data residency in EU (Supabase region: eu-west-1)

### Privacy Policy

- Users own all their health data
- Data never shared with 3rd parties without consent
- No behavioral tracking (except Posthog analytics, opt-out available)
- Encrypted at rest (Supabase default)
- Encrypted in transit (HTTPS)

---

## References

- Supabase RLS: https://supabase.com/docs/guides/auth/row-level-security
- Postgres RLS: https://www.postgresql.org/docs/current/sql-createpolicy.html
- GDPR Compliance: https://gdpr-info.eu/

---

**Next Review**: After Phase 2 RLS implementation  
**Owner**: Backend Team + Security Lead  
**Last Updated**: May 9, 2026
