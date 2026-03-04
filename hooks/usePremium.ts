import { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { usePremiumStore } from '@/stores/premiumStore';
import { getSubscriptionStatus, cancelSubscription, PlanType } from '@/services/backend/paypal';
import { captureError } from '@/lib/sentry';

export function usePremium() {
  const { profile, updateProfile } = useAuthStore();
  const { setIsPremium } = usePremiumStore();

  const [loading,     setLoading]     = useState(false);
  const [cancelling,  setCancelling]  = useState(false);
  const [status,      setStatus]      = useState<{
    isActive:     boolean;
    plan:         string | null;
    expiresAt:    string | null;
    trialEndsAt:  string | null;
    isInTrial:    boolean;
  } | null>(null);

  // Verificar estado desde el backend (fuente de verdad)
  const checkStatus = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getSubscriptionStatus();
      if (data) {
        setStatus({
          isActive:    data.isActive,
          plan:        data.plan,
          expiresAt:   data.expiresAt,
          trialEndsAt: data.trialEndsAt,
          isInTrial:   data.isInTrial,
        });
        // Sincronizar con store global y perfil
        setIsPremium(data.isPremium);
        if (profile?.is_premium !== data.isPremium) {
          await updateProfile({ is_premium: data.isPremium });
        }
      }
    } catch (err) {
      captureError(err instanceof Error ? err : new Error(String(err)), { action: "usePremium.checkStatus" });
    } finally {
      setLoading(false);
    }
  }, [profile?.is_premium, setIsPremium, updateProfile]);

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

  // El estado isPremium más rápido viene del perfil local (cacheado)
  const isPremium = profile?.is_premium ?? false;

  // Estado del trial
  const isInTrial = status?.isInTrial ?? false;
  const trialDaysLeft = (() => {
    if (!status?.trialEndsAt) return 0;
    const diff = new Date(status.trialEndsAt).getTime() - Date.now();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  })();

  useEffect(() => {
    checkStatus();
  }, []);

  return {
    isPremium,
    isInTrial,
    trialDaysLeft,
    status,
    loading,
    cancelling,
    checkStatus,
    handleCancel,
  };
}


