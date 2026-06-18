/**
 * Guest Account Management
 * Issue #10: Guest to Registered Conversion
 * 
 * Handles anonymous guest sessions:
 * - Generate device-based UUID
 * - Persist guest session locally
 * - Track guest user_id
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '@/lib/auth/supabase';

// Storage key for guest session
const GUEST_SESSION_KEY = 'vyra_guest_session';

/**
 * Guest Session Data
 */
export interface GuestSession {
  userId: string;           // Device-based UUID v4
  createdAt: number;        // Unix timestamp
  isGuest: boolean;         // Always true for guest sessions
  email?: string;           // Set during conversion
  deviceId?: string;        // Device fingerprint (optional)
}

/**
 * Generate a random UUID for guest user
 * Each device gets a unique anonymous user ID
 */
export async function generateGuestUserId(): Promise<string> {
  if (typeof globalThis.crypto?.randomUUID === 'function') {
    return globalThis.crypto.randomUUID();
  }

  return `guest_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

/**
 * Create a new guest session
 * - Generate UUID
 * - Store locally
 * - Create profile in DB
 */
export async function createGuestSession(): Promise<GuestSession> {
  const userId = await generateGuestUserId();
  
  const session: GuestSession = {
    userId,
    createdAt: Date.now(),
    isGuest: true,
  };

  // Store locally
  await AsyncStorage.setItem(GUEST_SESSION_KEY, JSON.stringify(session));

  // Create guest profile in Supabase
  try {
    const { error } = await supabase
      .from('profiles')
      .insert({
        id: userId,
        is_guest: true,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    // If profile already exists, that's OK
    if (error && error.code !== '23505') {
      console.error('Failed to create guest profile:', error);
      throw error;
    }
  } catch (error) {
    console.error('Guest profile creation error:', error);
    // Continue anyway - profile might already exist
  }

  return session;
}

/**
 * Load existing guest session from device
 * Returns null if no guest session found
 */
export async function loadGuestSession(): Promise<GuestSession | null> {
  try {
    const data = await AsyncStorage.getItem(GUEST_SESSION_KEY);
    if (!data) return null;
    
    const session: GuestSession = JSON.parse(data);
    return session;
  } catch (error) {
    console.error('Error loading guest session:', error);
    return null;
  }
}

/**
 * Check if user is currently a guest
 */
export async function isGuestUser(): Promise<boolean> {
  const session = await loadGuestSession();
  return !!session?.isGuest;
}

/**
 * Get current guest user ID
 * Returns null if not a guest
 */
export async function getGuestUserId(): Promise<string | null> {
  const session = await loadGuestSession();
  return session?.userId ?? null;
}

/**
 * Clear guest session from device
 * Called after successful conversion to registered account
 */
export async function clearGuestSession(): Promise<void> {
  try {
    await AsyncStorage.removeItem(GUEST_SESSION_KEY);
  } catch (error) {
    console.error('Error clearing guest session:', error);
  }
}

/**
 * Update guest session (e.g., add email during conversion)
 */
export async function updateGuestSession(
  updates: Partial<GuestSession>
): Promise<GuestSession | null> {
  const session = await loadGuestSession();
  if (!session) return null;

  const updated: GuestSession = {
    ...session,
    ...updates,
    isGuest: true, // Always guest
  };

  await AsyncStorage.setItem(GUEST_SESSION_KEY, JSON.stringify(updated));
  return updated;
}

/**
 * Verify guest account exists in database
 * Used during app startup to verify profile
 */
export async function verifyGuestProfile(userId: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .eq('is_guest', true)
      .single();

    return !!data && !error;
  } catch {
    return false;
  }
}

/**
 * Get guest profile details
 */
export async function getGuestProfile(userId: string) {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching guest profile:', error);
    return null;
  }
}

/**
 * Count guest data records for all tables
 * Useful for showing user what will be saved
 */
export async function countGuestData(guestUserId: string): Promise<Record<string, number>> {
  const tables = [
    'water_logs',
    'sleep_logs',
    'meals',
    'weight_logs',
    'fasting_sessions',
    'mental_checkins',
    'supplement_logs',
    'female_health_logs',
    'workout_sessions',
    'daily_scores',
  ];

  const counts: Record<string, number> = {};

  for (const table of tables) {
    try {
      const { count } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true })
        .eq('user_id', guestUserId);

      counts[table] = count || 0;
    } catch (error) {
      console.error(`Error counting ${table}:`, error);
      counts[table] = 0;
    }
  }

  return counts;
}

/**
 * Calculate total guest data size
 * Shows user how much data will be migrated
 */
export async function calculateGuestDataSize(guestUserId: string): Promise<number> {
  const counts = await countGuestData(guestUserId);
  const totalItems = Object.values(counts).reduce((sum, count) => sum + count, 0);
  return totalItems;
}

/**
 * Guest session debug info (for testing)
 */
export async function getGuestDebugInfo(): Promise<{
  hasSession: boolean;
  userId?: string;
  createdAt?: string;
  age?: string;
}> {
  const session = await loadGuestSession();
  if (!session) {
    return { hasSession: false };
  }

  const created = new Date(session.createdAt);
  const age = Math.floor((Date.now() - session.createdAt) / 1000 / 60); // minutes

  return {
    hasSession: true,
    userId: session.userId,
    createdAt: created.toISOString(),
    age: `${age} minutes`,
  };
}
