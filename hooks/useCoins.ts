import { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { supabase } from '@/lib/supabase';
import { captureError } from '@/lib/sentry';
import { addCoins as addCoinsService } from '@/services/supabase/profiles';

export interface CoinTransaction {
  id:          string;
  amount:      number; // positivo = ganado, negativo = gastado
  type:        string;
  description: string;
  created_at:  string;
}

export function useCoins() {
  const { profile, updateProfile } = useAuthStore();
  const userId = profile?.id;

  const [transactions, setTransactions] = useState<CoinTransaction[]>([]);
  const [loading,      setLoading]      = useState(true);

  const balance = profile?.coins ?? 0;

  const fetchTransactions = useCallback(async () => {
    if (!userId) return;
    try {
      const { data, error } = await supabase
        .from('coin_transactions')
        .select('id, amount, type, description, created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setTransactions(data ?? []);
    } catch (err) {
      captureError(err instanceof Error ? err : new Error(String(err)), { action: "useCoins.fetchTransactions" });
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // Ganar coins (con cap diario de 200 — lo maneja la RPC en Supabase)
  const addCoins = useCallback(
    async (
      amount:      number,
      type:        string,
      description: string,
    ): Promise<{ newBalance: number; capReached: boolean }> => {
      if (!userId) return { newBalance: balance, capReached: false };
      try {
        const parsedBalance = await addCoinsService(userId, amount, type, description);
        if (parsedBalance === null) {
          throw new Error('No se pudo actualizar el balance de coins');
        }

        const awarded = Math.max(0, parsedBalance - balance);
        const capReached = amount > 0 && awarded < amount;

        await updateProfile({ coins: parsedBalance });
        return {
          newBalance: parsedBalance,
          capReached,
        };
      } catch (err) {
        captureError(err instanceof Error ? err : new Error(String(err)), { action: "useCoins.addCoins" });
        return { newBalance: balance, capReached: false };
      }
    },
    [userId, balance, updateProfile],
  );

  // Gastar coins (compra en tienda)
  const spendCoins = useCallback(
    async (
      amount:      number,
      description: string,
    ): Promise<boolean> => {
      if (!userId || balance < amount) return false;
      try {
        const itemId = description
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '_')
          .replace(/^_+|_+$/g, '') || 'store_item';

        const { data, error } = await supabase.rpc('purchase_store_item', {
          p_user_id: userId,
          p_item_id: itemId,
          p_item_type: 'boosts',
          p_coins_cost: amount,
          p_expires_at: null,
        });
        if (error) throw error;
        const result = (Array.isArray(data) ? data[0] : data) as { success?: boolean; new_balance?: number } | null;
        if (result?.success) {
          const nextBalance = typeof result.new_balance === 'number'
            ? result.new_balance
            : Math.max(0, balance - amount);
          await updateProfile({ coins: nextBalance });
          return true;
        }
        return false;
      } catch (err) {
        captureError(err instanceof Error ? err : new Error(String(err)), { action: "useCoins.spendCoins" });
        return false;
      }
    },
    [userId, balance, updateProfile],
  );

  // Stats de coins
  function getCoinStats() {
    const earned = transactions
      .filter((t) => t.amount > 0)
      .reduce((sum, t) => sum + t.amount, 0);
    const spent = transactions
      .filter((t) => t.amount < 0)
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);
    return { earned, spent };
  }

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  return {
    balance,
    transactions,
    loading,
    getBalance: () => balance,
    earnCoins: addCoins,
    addCoins,
    spendCoins,
    getCoinStats,
    refresh: fetchTransactions,
  };
}
