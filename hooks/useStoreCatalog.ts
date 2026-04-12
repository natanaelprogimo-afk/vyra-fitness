import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';
import { captureError } from '@/lib/sentry';

export type StoreItemType =
  | 'programs'
  | 'nutrition'
  | 'themes'
  | 'boosts'
  | 'frames'
  | 'skins'
  | 'accessories';

export interface StoreCatalogItem {
  id: string;
  name: string;
  description: string;
  item_type: StoreItemType;
  coins_cost: number;
  tier: number;
  active: boolean;
  icon_name: string | null;
  accent_color: string | null;
  duration_hours: number | null;
  preview_payload: Record<string, unknown> | null;
}

export interface StorePurchase {
  item_id: string;
  item_type: StoreItemType;
  purchased_at: string;
  expires_at: string | null;
}

function normalizeItemType(value: unknown): StoreItemType {
  if (
    value === 'programs' ||
    value === 'nutrition' ||
    value === 'themes' ||
    value === 'boosts' ||
    value === 'frames' ||
    value === 'skins' ||
    value === 'accessories'
  ) {
    return value;
  }

  return 'boosts';
}

export function useStoreCatalog() {
  const { profile, updateProfile } = useAuthStore();
  const userId = profile?.id ?? null;

  const [items, setItems] = useState<StoreCatalogItem[]>([]);
  const [purchases, setPurchases] = useState<StorePurchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [purchasingId, setPurchasingId] = useState<string | null>(null);

  const fetchItems = useCallback(async () => {
    try {
      const advanced = await supabase
        .from('store_items_catalog')
        .select('id, name, description, item_type, coins_cost, tier, active, icon_name, accent_color, duration_hours, preview_payload')
        .eq('active', true)
        .order('item_type')
        .order('tier')
        .order('coins_cost');

      if (!advanced.error) {
        setItems(
          (advanced.data ?? []).map((item: any) => ({
            id: item.id,
            name: item.name,
            description: item.description,
            item_type: normalizeItemType(item.item_type),
            coins_cost: Number(item.coins_cost ?? 0),
            tier: Number(item.tier ?? 1),
            active: Boolean(item.active),
            icon_name: typeof item.icon_name === 'string' ? item.icon_name : null,
            accent_color: typeof item.accent_color === 'string' ? item.accent_color : null,
            duration_hours: typeof item.duration_hours === 'number' ? item.duration_hours : null,
            preview_payload: item.preview_payload && typeof item.preview_payload === 'object' ? item.preview_payload : null,
          })),
        );
        return;
      }

      const fallback = await supabase
        .from('store_items_catalog')
        .select('id, name, description, item_type, coins_cost, tier, active')
        .eq('active', true)
        .order('item_type')
        .order('tier')
        .order('coins_cost');

      if (fallback.error) throw fallback.error;

      setItems(
        (fallback.data ?? []).map((item: any) => ({
          id: item.id,
          name: item.name,
          description: item.description,
          item_type: normalizeItemType(item.item_type),
          coins_cost: Number(item.coins_cost ?? 0),
          tier: Number(item.tier ?? 1),
          active: Boolean(item.active),
          icon_name: null,
          accent_color: null,
          duration_hours: null,
          preview_payload: null,
        })),
      );
    } catch (err) {
      setLoadError(true);
      captureError(err instanceof Error ? err : new Error(String(err)), {
        action: 'useStoreCatalog.fetchItems',
      });
    }
  }, []);

  const fetchPurchases = useCallback(async () => {
    if (!userId) {
      setPurchases([]);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('store_purchases')
        .select('item_id, item_type, purchased_at, expires_at')
        .eq('user_id', userId)
        .order('purchased_at', { ascending: false });

      if (error) throw error;

      setPurchases(
        (data ?? []).map((purchase: any) => ({
          item_id: purchase.item_id,
          item_type: normalizeItemType(purchase.item_type),
          purchased_at: purchase.purchased_at,
          expires_at: purchase.expires_at ?? null,
        })),
      );
    } catch (err) {
      captureError(err instanceof Error ? err : new Error(String(err)), {
        action: 'useStoreCatalog.fetchPurchases',
      });
    }
  }, [userId]);

  const loadCatalog = useCallback(async () => {
    setLoading(true);
    setLoadError(false);
    try {
      await Promise.allSettled([fetchItems(), fetchPurchases()]);
    } finally {
      setLoading(false);
    }
  }, [fetchItems, fetchPurchases]);

  const purchaseItem = useCallback(
    async (item: StoreCatalogItem): Promise<{ ok: boolean; error?: string }> => {
      if (!userId) {
        return { ok: false, error: 'No hay sesion activa.' };
      }

      setPurchasingId(item.id);
      try {
        const expiresAt = item.duration_hours
          ? new Date(Date.now() + item.duration_hours * 60 * 60 * 1000).toISOString()
          : null;

        const { data, error } = await supabase.rpc('purchase_store_item', {
          p_user_id: userId,
          p_item_id: item.id,
          p_item_type: item.item_type,
          p_coins_cost: item.coins_cost,
          p_expires_at: expiresAt,
        });

        if (error) throw error;

        const result = (Array.isArray(data) ? data[0] : data) as
          | { success?: boolean; error?: string; new_balance?: number }
          | null;

        if (!result?.success) {
          return { ok: false, error: result?.error ?? 'No se pudo completar la compra.' };
        }

        let nextBalance: number | null =
          typeof result.new_balance === 'number' ? result.new_balance : null;

        if (nextBalance === null) {
          const { data: latestProfile, error: latestProfileError } = await supabase
            .from('profiles')
            .select('coins')
            .eq('id', userId)
            .single();

          if (latestProfileError) {
            captureError(latestProfileError, {
              action: 'useStoreCatalog.purchaseItem.fetchBalance',
              itemId: item.id,
            });
          }

          nextBalance =
            typeof latestProfile?.coins === 'number'
              ? Number(latestProfile.coins)
              : Math.max(0, Number(profile?.coins ?? 0) - item.coins_cost);
        }

        await updateProfile({ coins: nextBalance });

        await fetchPurchases();
        return { ok: true };
      } catch (err) {
        captureError(err instanceof Error ? err : new Error(String(err)), {
          action: 'useStoreCatalog.purchaseItem',
          itemId: item.id,
        });
        return { ok: false, error: 'No se pudo completar la compra.' };
      } finally {
        setPurchasingId(null);
      }
    },
    [fetchPurchases, profile?.coins, updateProfile, userId],
  );

  const isOwned = useCallback(
    (itemId: string) =>
      purchases.some((purchase) => purchase.item_id === itemId && (!purchase.expires_at || new Date(purchase.expires_at) > new Date())),
    [purchases],
  );

  useEffect(() => {
    void loadCatalog();
  }, [loadCatalog]);

  return {
    items,
    purchases,
    loading,
    loadError,
    purchasingId,
    isOwned,
    purchaseItem,
    refresh: loadCatalog,
  };
}
