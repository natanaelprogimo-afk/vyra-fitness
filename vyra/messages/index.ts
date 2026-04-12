import type { VyraMessageContext } from './es';
import { VYRA_MESSAGES_ES } from './es';
import { VYRA_MESSAGES_EN } from './en';

function pickRandom(messages: string[]): string {
  if (!messages.length) return '';
  const idx = Math.floor(Math.random() * messages.length);
  return messages[idx] ?? messages[0] ?? '';
}

export function getVyraMessage(
  context: VyraMessageContext,
  locale: 'es' | 'en',
): string {
  const map = locale === 'en' ? VYRA_MESSAGES_EN : VYRA_MESSAGES_ES;
  return pickRandom(map[context] ?? map.general);
}

export type { VyraMessageContext };
