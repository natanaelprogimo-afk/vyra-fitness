import { supabase } from '@/lib/supabase';

const BACKEND_URL = process.env.EXPO_PUBLIC_API_URL ?? process.env.EXPO_PUBLIC_BACKEND_URL ?? '';

export interface NutritionAIResult {
  food_name: string;
  amount_g: number;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  fiber_g: number;
  confidence: number;
  note: string;
  components: Array<{
    name: string;
    amount_g: number | null;
  }>;
}

export interface ContextWeeklySummary {
  summary: string;
  bullets: string[];
  nextFocus: string;
  suggestedPrompt: string;
}

async function getAuthHeaders() {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.access_token) {
    throw new Error('Sin sesion activa');
  }

  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${session.access_token}`,
  };
}

async function parseJsonResponse<T>(response: Response): Promise<T> {
  const payload = await response.json().catch(() => ({} as T & { error?: string }));
  if (!response.ok) {
    const message =
      payload && typeof payload === 'object' && 'error' in payload && typeof payload.error === 'string'
        ? payload.error
        : `HTTP ${response.status}`;
    throw new Error(message);
  }
  return payload;
}

export async function fetchDailyCloseoutLine(input: {
  moodLabel?: string;
  note?: string;
  readinessScore?: number;
  yesterdayScore?: number | null;
}): Promise<string> {
  if (!BACKEND_URL) throw new Error('Backend no configurado');
  const headers = await getAuthHeaders();
  const response = await fetch(`${BACKEND_URL}/api/ai/daily-summary-closeout`, {
    method: 'POST',
    headers,
    body: JSON.stringify(input),
  });
  const payload = await parseJsonResponse<{ line?: string }>(response);
  return typeof payload.line === 'string' ? payload.line.trim() : '';
}

export async function analyzeNutritionPhoto(input: {
  imageBase64: string;
  mimeType?: string;
  description?: string;
}): Promise<NutritionAIResult> {
  if (!BACKEND_URL) throw new Error('Backend no configurado');
  const headers = await getAuthHeaders();
  const response = await fetch(`${BACKEND_URL}/api/ai/nutrition/analyze-image`, {
    method: 'POST',
    headers,
    body: JSON.stringify(input),
  });
  const payload = await parseJsonResponse<{ result: NutritionAIResult }>(response);
  return payload.result;
}

export async function fetchWeeklyContextSummary(): Promise<ContextWeeklySummary> {
  if (!BACKEND_URL) throw new Error('Backend no configurado');
  const headers = await getAuthHeaders();
  const response = await fetch(`${BACKEND_URL}/api/ai/weekly-summary`, {
    method: 'GET',
    headers,
  });
  return parseJsonResponse<ContextWeeklySummary>(response);
}
