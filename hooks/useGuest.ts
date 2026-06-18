/**
 * useGuest Hook
 * Issue #10: Access guest session state and methods
 * 
 * Usage:
 * const { isGuest, guestUserId, startGuestSession, endGuestSession } = useGuest();
 */

import { useCallback } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { createGuestSession, loadGuestSession, clearGuestSession } from '@/lib/auth/guest-account';

/**
 * Guest hook state
 */
export interface UseGuestReturn {
  /**
   * Is user currently in guest mode
   */
  isGuest: boolean;

  /**
   * Guest user ID (UUID)
   */
  guestUserId: string | null;

  /**
   * Start a new guest session
   */
  startGuestSession: () => Promise<void>;

  /**
   * End guest session (clear data)
   */
  endGuestSession: () => Promise<void>;

  /**
   * Restore guest session from device storage
   */
  restoreGuestSession: () => Promise<void>;
}

/**
 * useGuest - Manage guest session
 * 
 * Provides methods to start/end guest sessions
 * Syncs with both authStore and AsyncStorage
 */
export function useGuest(): UseGuestReturn {
  const { isGuest, guestUserId, setGuestSession, clearGuestSession: clearGuestFromStore } =
    useAuthStore();

  /**
   * Start new guest session
   * Creates guest account in DB
   * Stores session locally
   */
  const startGuestSession = useCallback(async () => {
    try {
      const session = await createGuestSession();
      setGuestSession(session.userId);
    } catch (error) {
      console.error('Error starting guest session:', error);
      throw error;
    }
  }, [setGuestSession]);

  /**
   * End guest session
   * Clears local storage and auth store
   */
  const endGuestSession = useCallback(async () => {
    try {
      await clearGuestSession();
      clearGuestFromStore();
    } catch (error) {
      console.error('Error ending guest session:', error);
      throw error;
    }
  }, [clearGuestFromStore]);

  /**
   * Restore guest session from device storage
   * Called on app startup
   */
  const restoreGuestSession = useCallback(async () => {
    try {
      const session = await loadGuestSession();
      if (session && session.isGuest) {
        setGuestSession(session.userId);
      }
    } catch (error) {
      console.error('Error restoring guest session:', error);
    }
  }, [setGuestSession]);

  return {
    isGuest,
    guestUserId,
    startGuestSession,
    endGuestSession,
    restoreGuestSession,
  };
}
