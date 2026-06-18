export type ProtocolType = 'daily' | 'weekly';

export type FastingSessionStatus =
  | 'planned'
  | 'active'
  | 'completed'
  | 'interrupted'
  | 'missed';

export interface FastingSession {
  id: string;
  user_id: string;
  protocol: string;
  protocol_type: ProtocolType;

  // times
  start_time: string | null;
  end_time: string | null;
  target_duration: number; // seconds
  actual_duration: number | null;

  // status
  status: FastingSessionStatus;

  // 5:2 specific
  scheduled_date: string | null; // 'YYYY-MM-DD'
  week_number: number | null;
  year: number | null;

  // metadata
  notes?: string | null;
  created_at: string;
  updated_at: string;

  // derived
  total_hours?: number;
}

export interface StartFastPayload {
  protocol: string;
  startTime?: Date | string;
  sessionId?: string;
}

export interface StartFastOptions {
  onSuccess?: () => void;
  onError?: (err: Error) => void;
}

export interface CompleteFastOptions {
  onSuccess?: () => void;
  onError?: (err: Error) => void;
}

export interface AdjustActiveFastPayload {
  startTime: Date | string;
}

export interface LogPastFastPayload {
  protocol: string;
  startTime: Date | string;
  endTime: Date | string;
}

export interface FiveTwoWeekSummary {
  weekNumber: number;
  year: number;
  days: Array<{
    date: string;
    status: FastingSessionStatus | 'normal';
    hours: number | null;
  }>;
  completedDays: number;
  targetDays: number;
}

export default {};
