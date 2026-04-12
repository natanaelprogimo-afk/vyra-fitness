import { supabase } from '@/lib/supabase';

const BACKEND_URL = process.env.EXPO_PUBLIC_API_URL ?? process.env.EXPO_PUBLIC_BACKEND_URL ?? '';

async function getAuthHeaders(): Promise<Record<string, string>> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;

  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function requestJson(
  path: string,
  init: RequestInit,
): Promise<{ ok: boolean; status: number; data: any; text: string }> {
  const response = await fetch(`${BACKEND_URL}${path}`, init);
  const text = await response.text();

  let data: any = null;
  if (text.trim()) {
    try {
      data = JSON.parse(text);
    } catch {
      data = null;
    }
  }

  return {
    ok: response.ok,
    status: response.status,
    data,
    text,
  };
}

export interface FoundingLeaderboardEntry {
  id: string;
  name: string | null;
  avatar_url: string | null;
  xp: number;
  level: number;
  streak: number;
  founding_member_rank: number | null;
}

export async function getFoundingLeaderboard(limit = 50): Promise<FoundingLeaderboardEntry[]> {
  try {
    const headers = await getAuthHeaders();
    const response = await requestJson(`/api/gamification/leaderboard?founding_only=1&limit=${limit}`, {
      method: 'GET',
      headers,
    });
    if (!response.ok) return [];
    return Array.isArray(response.data?.items) ? response.data.items : [];
  } catch {
    return [];
  }
}
