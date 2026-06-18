/**
 * SENSITIVE DATA ENCRYPTION STRATEGY
 * Issue #8: Crypto Decision & Server-Side Encryption
 * 
 * ⚠️  DEPRECATION NOTICE
 * 
 * Client-side encryption in sensitive-crypto.ts is DEPRECATED
 * Sensitive data should be encrypted SERVER-SIDE
 */

// ❌ DEPRECATED: Client-side encryption (old approach)
/**
 * @deprecated Do not use client-side encryption
 * 
 * Reasons:
 * - Session keys expire with JWT, data becomes unrecoverable
 * - No persistent key storage (security risk on device)
 * - Difficult to audit and rotate keys
 * - Not GDPR-compliant for persistent health data
 * 
 * Use: Server-side encryption instead (see vyra-backend/middleware/encryptSensitive.ts)
 */
export class DeprecatedSensitiveCrypto {
  static encrypt(data: string): string {
    throw new Error(
      'Client-side encryption is deprecated. ' +
      'Use backend encryption instead. See vyra-backend/middleware/encryptSensitive.ts'
    );
  }

  static decrypt(ciphertext: string): string {
    throw new Error(
      'Client-side decryption is deprecated. ' +
      'Use backend decryption instead. See vyra-backend/middleware/encryptSensitive.ts'
    );
  }
}

// ✅ RECOMMENDED: Server-side encryption

/**
 * Server-Side Encryption Strategy for Vyra Fitness
 * 
 * Architecture:
 * 1. Sensitive data (female health, exports) encrypted at server
 * 2. Encryption key managed by backend (environment variable)
 * 3. Data persisted in encrypted form
 * 4. Client receives encrypted or plaintext based on context
 * 5. Decryption only on backend (read-only from client perspective)
 * 
 * Security Properties:
 * - Data at rest: Encrypted (AES-256-GCM)
 * - Data in transit: HTTPS
 * - Key rotation: Server-controlled
 * - Compliance: GDPR-ready (auditable encryption)
 */

export interface EncryptedData {
  encrypted: string; // Hex-encoded ciphertext
  iv: string; // Hex-encoded initialization vector
  authTag: string; // Hex-encoded authentication tag (for GCM mode)
  algorithm: 'aes-256-gcm';
  version: number; // For future key rotation
}

/**
 * Data Classification for Encryption
 * 
 * LEVEL 1 (No Encryption):
 * - Public fitness data: step counts, calorie burns
 * - Non-personal metrics: workout types, durations
 * - Rationale: Not sensitive, user doesn't mind sharing
 * 
 * LEVEL 2 (Server-Side Encryption):
 * - Female health: cycle tracking, symptoms
 * - Medical: previous injuries, conditions
 * - Exports: Full health data downloads
 * - Rationale: Sensitive, health-related, needs encryption
 * 
 * LEVEL 3 (Extra Security):
 * - Account credentials (already handled by Supabase auth)
 * - API keys, tokens (backend only)
 * - Rationale: System-level security
 */

/**
 * IMPLEMENTATION REFERENCE
 * 
 * Backend middleware to handle encryption:
 * 
 * @file vyra-backend/middleware/encryptSensitive.ts
 * 
 * import crypto from 'crypto';
 * 
 * export class SensitiveDataEncryption {
 *   private static readonly ENCRYPTION_KEY = process.env.DATA_ENCRYPTION_KEY;
 *   private static readonly ALGORITHM = 'aes-256-gcm';
 * 
 *   static encryptField(plaintext: string): EncryptedData {
 *     const key = Buffer.from(this.ENCRYPTION_KEY!, 'hex');
 *     const iv = crypto.randomBytes(16);
 *     const cipher = crypto.createCipheriv(this.ALGORITHM, key, iv);
 *     
 *     const encrypted = Buffer.concat([
 *       cipher.update(plaintext, 'utf8'),
 *       cipher.final(),
 *     ]);
 *     
 *     const authTag = cipher.getAuthTag();
 *     
 *     return {
 *       encrypted: encrypted.toString('hex'),
 *       iv: iv.toString('hex'),
 *       authTag: authTag.toString('hex'),
 *       algorithm: 'aes-256-gcm',
 *       version: 1,
 *     };
 *   }
 * 
 *   static decryptField(data: EncryptedData): string {
 *     const key = Buffer.from(this.ENCRYPTION_KEY!, 'hex');
 *     const decipher = crypto.createDecipheriv(
 *       this.ALGORITHM,
 *       key,
 *       Buffer.from(data.iv, 'hex')
 *     );
 *     
 *     decipher.setAuthTag(Buffer.from(data.authTag, 'hex'));
 *     
 *     const decrypted = Buffer.concat([
 *       decipher.update(Buffer.from(data.encrypted, 'hex')),
 *       decipher.final(),
 *     ]);
 *     
 *     return decrypted.toString('utf8');
 *   }
 * }
 * 
 * // Usage in routes:
 * router.post('/female-health/log', async (req, res) => {
 *   const { symptoms } = req.body;
 *   
 *   const encrypted = SensitiveDataEncryption.encryptField(JSON.stringify(symptoms));
 *   
 *   await supabase
 *     .from('female_health_logs')
 *     .insert({
 *       user_id: req.userId,
 *       symptoms_encrypted: encrypted,
 *       created_at: new Date(),
 *     });
 *   
 *   res.json({ success: true });
 * });
 */

/**
 * GDPR COMPLIANCE
 * 
 * ✅ Data Protection:
 * - Sensitive health data encrypted at rest
 * - No plaintext storage of female health symptoms
 * - All encryption keys rotatable
 * 
 * ✅ Data Access:
 * - Audit logs for who accessed encrypted data
 * - Only authorized backend services can decrypt
 * - Client receives only decrypted data if authorized
 * 
 * ✅ Data Deletion:
 * - Users can request data deletion
 * - Encrypted data deleted immediately
 * - No recovery possible (by design)
 * 
 * ✅ Data Portability:
 * - Users can export their data
 * - Export includes decrypted sensitive fields
 * - Decryption happens on backend before export
 */

/**
 * DECISION RECORD
 * 
 * Issue #8 Resolution: SERVER-SIDE ENCRYPTION FOR SENSITIVE DATA
 * 
 * Alternatives Considered:
 * 1. Client-side ephemeral encryption (rejected - key loss on logout)
 * 2. No encryption (rejected - GDPR non-compliance)
 * 3. Server-side persistent encryption (✅ CHOSEN)
 * 
 * Reasons:
 * - Persistent encryption: Keys don't expire with sessions
 * - Auditable: Backend controls all key operations
 * - Scalable: Key rotation managed server-side
 * - Compliant: Meets GDPR requirements for sensitive data
 * - Maintainable: Centralized in one location
 * 
 * Implementation: 
 * - Add DATA_ENCRYPTION_KEY to .env
 * - Encrypt female_health_logs.symptoms
 * - Encrypt exports before delivery
 * - Add audit logging for access
 * - Document in SECURITY.md
 * 
 * Timeline: Phase 2 (after Issue #3, #6)
 * Owner: Backend team
 * Review: Security + GDPR compliance review
 */

export default {
  deprecated: DeprecatedSensitiveCrypto,
  strategy: 'SERVER_SIDE_ENCRYPTION',
  status: '🟡 RECOMMENDED - Awaiting implementation',
  nextSteps: [
    '1. Approve server-side encryption strategy',
    '2. Add DATA_ENCRYPTION_KEY to backend .env',
    '3. Implement vyra-backend/middleware/encryptSensitive.ts',
    '4. Add encryption to female_health_logs routes',
    '5. Add encryption to data export routes',
    '6. Update SECURITY.md with encryption details',
    '7. Create key rotation policy',
    '8. Test GDPR compliance',
  ],
};
