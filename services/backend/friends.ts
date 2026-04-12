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

export type FriendsRange = 'week' | 'month';

export interface FriendsLeaderboardEntry {
  userId: string;
  name: string;
  avatarUrl: string | null;
  steps: number;
  rank: number;
  isYou: boolean;
}

export interface FriendsLeaderboardResponse {
  range: FriendsRange;
  startDate: string;
  endDate: string;
  friendCount: number;
  leaderboard: FriendsLeaderboardEntry[];
}

export async function getFriendsLeaderboard(
  range: FriendsRange = 'week',
): Promise<FriendsLeaderboardResponse | null> {
  try {
    const headers = await getAuthHeaders();
    const response = await requestJson(`/api/friends/leaderboard?range=${range}`, {
      method: 'GET',
      headers,
    });
    if (!response.ok) return null;
    return response.data as FriendsLeaderboardResponse;
  } catch {
    return null;
  }
}
