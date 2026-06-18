import { useCallback, useState } from 'react';
import { captureError } from '@/lib/sentry';
import { supabase } from '@/lib/supabase';

export interface NutritionFeedback {
  user_id: string;
  date: string;
  meal_type: string;
  suggestion_type: 'protein' | 'carbs' | 'fat' | 'calories';
  amount_missing: number;
  logged_amount: number;
  target_amount: number;
  user_accepted: boolean;
  accepted_at?: string;
}

export function useNutritionFeedback() {
  const [submitting, setSubmitting] = useState(false);

  const submitFeedback = useCallback(async (feedback: Omit<NutritionFeedback, 'user_id' | 'accepted_at'>) => {
    setSubmitting(true);
    try {
      const { data: authData } = await supabase.auth.getUser();
      if (!authData.user?.id) {
        throw new Error('No authenticated user');
      }

      const insertPayload: NutritionFeedback = {
        user_id: authData.user.id,
        accepted_at: feedback.user_accepted ? new Date().toISOString() : undefined,
        ...feedback,
      };

      const { error } = await supabase
        .from('nutrition_feedback')
        .insert([insertPayload]);

      if (error) {
        throw error;
      }

      return true;
    } catch (err) {
      captureError(err instanceof Error ? err : new Error(String(err)), {
        action: 'useNutritionFeedback.submitFeedback',
      });
      return false;
    } finally {
      setSubmitting(false);
    }
  }, []);

  return {
    submitFeedback,
    submitting,
  };
}
