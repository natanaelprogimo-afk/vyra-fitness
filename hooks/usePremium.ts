import { useState, useEffect, useCallback } from 'react';
import * as Linking from 'expo-linking';
import { useAuthStore } from '@/stores/authStore';
import { usePremiumStore } from '@/stores/premiumStore';
import { supabase } from '@/lib/supabase';
import {
  getSubscriptionStatus,
  cancelSubscription,
  createSubscription,
  PlanType,
} from '@/services/backend/paypal';
import { captureError } from '@/lib/sentry';

export function usePremium() {
  const { profile, updateProfile } = useAuthStore();
  const { setIsPremium } = usePremiumStore();

  const [loading, setLoading] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [starting, setStarting] = useState(false);
  const [status, setStatus] = useState<{
    isActive: boolean;
    plan: string | null;
    expiresAt: string | null;
    trialEndsAt: string | null;
    isInTrial: boolean;
  } | null>(null);

  const checkStatus = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getSubscriptionStatus();
      if (data) {
        setStatus({
          isActive: data.isActive,
          plan: data.plan,
          expiresAt: data.expiresAt,
          trialEndsAt: data.trialEndsAt,
          isInTrial: data.isInTrial,
        });

        setIsPremium(data.isPremium);
        if (profile?.is_premium !== data.isPremium) {
          await updateProfile({ is_premium: data.isPremium });
        }
      }
    } catch (err) {
      captureError(err instanceof Error ? err : new Error(String(err)), { action: 'usePremium.checkStatus' });
    } finally {
      setLoading(false);
    }
  }, [profile?.is_premium, setIsPremium, updateProfile]);

  const startSubscription = useCallback(async (plan: PlanType = 'monthly'): Promise<boolean> => {
    setStarting(true);
    try {
      const data = await createSubscription(plan);
      if (!data?.approvalUrl) return false;
      await Linking.openURL(data.approvalUrl);
      return true;
    } catch (err) {
      captureError(err instanceof Error ? err : new Error(String(err)), { action: 'usePremium.startSubscription' });
      return false;
    } finally {
      setStarting(false);
    }
  }, []);

  const handleCancel = useCallback(async (): Promise<boolean> => {
    setCancelling(true);
    try {
      const success = await cancelSubscription();
      if (success) await checkStatus();
      return success;
    } finally {
      setCancelling(false);
    }
  }, [checkStatus]);

  const isPremium = profile?.is_premium ?? false;
  const isInTrial = status?.isInTrial ?? false;
  const trialDaysLeft = (() => {
    if (!status?.trialEndsAt) return 0;
    const diff = new Date(status.trialEndsAt).getTime() - Date.now();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  })();

  useEffect(() => {
    checkStatus();
  }, [checkStatus]);

  useEffect(() => {
    if (!profile?.id) return;

    const channel = supabase
      .channel(`premium-status-${profile.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${profile.id}`,
        },
        (payload) => {
          const nextPremium = Boolean((payload.new as any)?.is_premium);
          setIsPremium(nextPremium);
          void updateProfile({ is_premium: nextPremium });
        }
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [profile?.id, setIsPremium, updateProfile]);

  return {
    isPremium,
    isInTrial,
    trialDaysLeft,
    status,
    loading,
    starting,
    cancelling,
    startSubscription,
    checkStatus,
    handleCancel,
  };
}
