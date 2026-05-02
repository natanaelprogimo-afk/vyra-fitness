import { asRecord, getAuthHeaders, getBackendUrl, requestJson } from '@/services/backend/client';

export interface WeeklySummaryPayload {
  summary: string;
  bullets: string[];
  nextFocus: string;
  suggestedPrompt: string;
}

export async function getWeeklySummary(): Promise<WeeklySummaryPayload | null> {
  if (!getBackendUrl()) return null;

  try {
    const headers = await getAuthHeaders();
    const response = await requestJson('/api/ai/weekly-summary', {
      method: 'GET',
      headers,
    });

    if (!response.ok) return null;
    const payload = asRecord(response.data);
    if (!payload || typeof payload.summary !== 'string') return null;

    return {
      summary: payload.summary,
      bullets: Array.isArray(payload.bullets) ? payload.bullets.filter((item): item is string => typeof item === 'string') : [],
      nextFocus: typeof payload.nextFocus === 'string' ? payload.nextFocus : '',
      suggestedPrompt: typeof payload.suggestedPrompt === 'string' ? payload.suggestedPrompt : '',
    };
  } catch {
    return null;
  }
}
