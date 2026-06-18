/**
 * Secure Storage Wrapper
 * Encrypts sensitive onboarding data using expo-secure-store
 * Fallback to AsyncStorage for non-sensitive data
 */

import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type SecureStorageKey =
  | 'onboarding_weight' // Sensitive: health data
  | 'onboarding_female_cycle' // Sensitive: female health data
  | 'onboarding_fasting_protocol' // Sensitive: dietary restriction
  | 'onboarding_sleep_times'; // Sensitive: sleep data

export type PublicStorageKey =
  | 'onboarding_goal'
  | 'onboarding_name'
  | 'onboarding_gender'
  | 'onboarding_age'
  | 'onboarding_height'
  | 'onboarding_modules'
  | 'onboarding_activity'
  | 'onboarding_nutrition';

const SECURE_KEYS = new Set<string>([
  'onboarding_weight',
  'onboarding_female_cycle',
  'onboarding_fasting_protocol',
  'onboarding_sleep_times',
]);

/**
 * Get value from secure storage (encrypted) or AsyncStorage (plain)
 * Automatically routes to appropriate storage based on sensitivity
 */
export async function getSecureValue(key: string): Promise<string | null> {
  try {
    if (SECURE_KEYS.has(key)) {
      // Try secure store first
      try {
        const value = await SecureStore.getItemAsync(key);
        return value;
      } catch (secureError) {
        // If secure store fails, fallback to AsyncStorage (migration path)
        console.warn(`Secure store failed for ${key}, falling back to AsyncStorage`, secureError);
        return await AsyncStorage.getItem(key);
      }
    } else {
      // Non-sensitive data goes to AsyncStorage
      return await AsyncStorage.getItem(key);
    }
  } catch (error) {
    console.error(`Error retrieving ${key}:`, error);
    return null;
  }
}

/**
 * Set value to secure storage (encrypted) or AsyncStorage (plain)
 * Automatically routes based on sensitivity
 */
export async function setSecureValue(key: string, value: string): Promise<void> {
  try {
    if (SECURE_KEYS.has(key)) {
      // Store in secure storage (encrypted)
      try {
        await SecureStore.setItemAsync(key, value);
        // Clean up from AsyncStorage if it was migrated there
        await AsyncStorage.removeItem(key);
      } catch (secureError) {
        // If secure store fails, fallback to AsyncStorage
        console.warn(`Secure store failed for ${key}, falling back to AsyncStorage`, secureError);
        await AsyncStorage.setItem(key, value);
      }
    } else {
      // Non-sensitive data goes to AsyncStorage
      await AsyncStorage.setItem(key, value);
    }
  } catch (error) {
    console.error(`Error setting ${key}:`, error);
    throw error;
  }
}

/**
 * Remove value from secure storage or AsyncStorage
 */
export async function removeSecureValue(key: string): Promise<void> {
  try {
    if (SECURE_KEYS.has(key)) {
      try {
        await SecureStore.deleteItemAsync(key);
      } catch (secureError) {
        // Fallback: remove from AsyncStorage
        await AsyncStorage.removeItem(key);
      }
    } else {
      await AsyncStorage.removeItem(key);
    }
  } catch (error) {
    console.error(`Error removing ${key}:`, error);
  }
}

/**
 * Clear all onboarding data (both secure and plain)
 * Used when resetting onboarding flow
 */
export async function clearAllOnboardingData(): Promise<void> {
  try {
    // Clear all secure values
    const secureKeys = Array.from(SECURE_KEYS);
    await Promise.all(
      secureKeys.map(key =>
        SecureStore.deleteItemAsync(key).catch(err => {
          console.warn(`Failed to clear secure key ${key}:`, err);
        })
      )
    );

    // Clear AsyncStorage (non-sensitive data)
    const asyncKeys = await AsyncStorage.getAllKeys();
    const onboardingKeys = asyncKeys.filter(k => k.startsWith('onboarding_'));
    await AsyncStorage.multiRemove(onboardingKeys);
  } catch (error) {
    console.error('Error clearing onboarding data:', error);
    throw error;
  }
}
