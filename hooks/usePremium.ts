import { useState, useEffect, useCallback } from 'react';
import * as Linking from 'expo-linking';
import { useAuthStore } from '@/stores/authStore';
import { usePremiumStore } from '@/stores/premiumStore';
import { supabase } from '@/lib/supabase';
import {
  getSubscriptionStatus,
  cancelSubscription,
  confirmSubscription,
  createSubscription,
  PlanType,
} from '@/services/backend/paypal';
import { captureError } from '@/lib/sentry';

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

type PremiumStateSnapshot = {
  isActive: boolean;
  isPremium: boolean;
  plan: string | null;
  expiresAt: string | null;
  trialEndsAt: string | null;
  isInTrial: boolean;
  status: string | null;
  subscriptionId: string | null;
};

export function usePremium() {
  const { profile, updateProfile } = useAuthStore();
  const { setIsPremium } = usePremiumStore();

  const [loading, setLoading] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [starting, setStarting] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [status, setStatus] = useState<PremiumStateSnapshot | null>(null);

  const applySubscriptionStatus = useCallback((data: PremiumStateSnapshot | null) => {
    if (!data) return;

    setStatus(data);
    setIsPremium(data.isPremium);
    updateProfile({
      is_premium: data.isPremium,
      premium_expires_at: data.expiresAt,
      paypal_subscription_id: data.subscriptionId ?? null,
    });
  }, [setIsPremium, updateProfile]);

  const checkStatus = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getSubscriptionStatus();
      if (data) {
        applySubscriptionStatus({
          isActive: data.isActive,
          isPremium: data.isPremium,
          plan: data.plan,
          expiresAt: data.expiresAt,
          trialEndsAt: data.trialEndsAt,
          isInTrial: data.isInTrial,
          status: data.status,
          subscriptionId: data.subscriptionId,
        });
      }
    } catch (err) {
      captureError(err instanceof Error ? err : new Error(String(err)), {
        action: 'usePremium.checkStatus',
      });
    } finally {
      setLoading(false);
    }
  }, [applySubscriptionStatus]);

  const startSubscription = useCallback(async (plan: PlanType = 'monthly'): Promise<boolean> => {
    setStarting(true);
    try {
      const data = await createSubscription(plan);
      if (!data?.approvalUrl) return false;
      await Linking.openURL(data.approvalUrl);
      return true;
    } catch (err) {
      captureError(err instanceof Error ? err : new Error(String(err)), {
        action: 'usePremium.startSubscription',
      });
      return false;
    } finally {
      setStarting(false);
    }
  }, []);

  const confirmSubscriptionFlow = useCallback(async (subscriptionId: string): Promise<'active' | 'pending' | 'failed'> => {
    setConfirming(true);

    try {
      for (let attempt = 0; attempt < 6; attempt += 1) {
        const data = await confirmSubscription(subscriptionId);

        if (data) {
          applySubscriptionStatus({
            isActive: data.isActive,
            isPremium: data.isPremium,
            plan: data.plan,
            expiresAt: data.expiresAt,
            trialEndsAt: data.trialEndsAt,
            isInTrial: data.isInTrial,
            status: data.status,
            subscriptionId: data.subscriptionId,
          });

          if (data.isActive) {
            return 'active';
          }

          if (data.status && data.status !== 'pending') {
            return 'failed';
          }
        }

        await sleep(2000);
      }

      const finalStatus = await getSubscriptionStatus();
      if (finalStatus) {
        applySubscriptionStatus({
          isActive: finalStatus.isActive,
          isPremium: finalStatus.isPremium,
          plan: finalStatus.plan,
          expiresAt: finalStatus.expiresAt,
          trialEndsAt: finalStatus.trialEndsAt,
          isInTrial: finalStatus.isInTrial,
          status: finalStatus.status,
          subscriptionId: finalStatus.subscriptionId,
        });

        if (finalStatus.isActive) {
          return 'active';
        }

        if (finalStatus.status === 'pending') {
          return 'pending';
        }
      }

      return 'failed';
    } catch (err) {
      captureError(err instanceof Error ? err : new Error(String(err)), {
        action: 'usePremium.confirmSubscriptionFlow',
        subscriptionId,
      });
      return 'failed';
    } finally {
      setConfirming(false);
    }
  }, [applySubscriptionStatus]);

  const handleCancel = useCallback(async (): Promise<boolean> => {
    setCancelling(true);
    try {
      const success = await cancelSubscription(status?.subscriptionId ?? null);
      if (success) await checkStatus();
      return success;
    } finally {
      setCancelling(false);
    }
  }, [checkStatus, status?.subscriptionId]);

  const isPremium = profile?.is_premium ?? false;
  const isInTrial = status?.isInTrial ?? false;
  const trialDaysLeft = (() => {
    if (!status?.trialEndsAt) return 0;
    const diff = new Date(status.trialEndsAt).getTime() - Date.now();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  })();

  useEffect(() => {
    void checkStatus();
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
          const nextRow =
            payload.new && typeof payload.new === 'object' ? (payload.new as Record<string, unknown>) : {};
          const nextPremium = nextRow.is_premium === true;
          const nextExpiresAt = typeof nextRow.premium_expires_at === 'string' ? nextRow.premium_expires_at : null;
          setIsPremium(nextPremium);
          updateProfile({
            is_premium: nextPremium,
            premium_expires_at: nextExpiresAt,
          });
        },
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
    confirming,
    startSubscription,
    confirmSubscriptionFlow,
    checkStatus,
    handleCancel,
  };
}
