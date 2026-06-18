/**
 * Guest-related types for Issue #10
 */

/**
 * Email Verification Request
 */
export interface EmailVerificationRequest {
  email: string;
  verificationCode: string;
  password: string;
  guestUserId: string;  // For data migration
}

/**
 * Email Verification Response
 */
export interface EmailVerificationResponse {
  success: boolean;
  userId?: string;
  error?: string;
}

/**
 * Guest Conversion Status
 */
export interface GuestConversionStatus {
  step: 'email' | 'verify_code' | 'password' | 'migrating' | 'complete' | 'failed';
  email?: string;
  guestUserId: string;
  error?: string;
  migratedItems?: number;
}

/**
 * Guest Data Summary
 * Shows user what will be saved during conversion
 */
export interface GuestDataSummary {
  totalItems: number;
  waterLogs: number;
  sleepLogs: number;
  meals: number;
  weightLogs: number;
  fastingSessions: number;
  mentalCheckins: number;
  supplementLogs: number;
  femaleHealthLogs: number;
  workoutSessions: number;
  dailyScores: number;
}
