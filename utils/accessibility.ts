import { AccessibilityInfo } from 'react-native';

export async function announceAccessibility(message: string | null | undefined) {
  if (!message || !message.trim()) return;
  try {
    await AccessibilityInfo.announceForAccessibility(message.trim());
  } catch {
    // Ignore accessibility announcement failures on unsupported platforms.
  }
}

