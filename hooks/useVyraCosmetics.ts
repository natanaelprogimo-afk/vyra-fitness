import { useMemo } from 'react';
import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';
import { useUIStore } from '@/stores/uiStore';
import { useStoreCatalog } from '@/hooks/useStoreCatalog';
import {
  VYRA_ACCESSORIES,
  VYRA_SKINS,
  formatAccessoryUnlockLabel,
  formatSkinUnlockLabel,
  getEquippedVyraAccessoryId,
  getEquippedVyraSkinId,
  type VyraAccessoryEntry,
  type VyraAccessoryId,
  type VyraSkinEntry,
  type VyraSkinId,
  withVyraCosmetics,
} from '@/lib/vyra-cosmetics';
import { captureError } from '@/lib/sentry';

function isPurchaseActive(expiresAt: string | null): boolean {
  if (!expiresAt) return true;
  return new Date(expiresAt) > new Date();
}

export function useVyraCosmetics() {
  const profile = useAuthStore((state) => state.profile);
  const updateProfile = useAuthStore((state) => state.updateProfile);
  const showToast = useUIStore((state) => state.showToast);
  const { items, purchases } = useStoreCatalog();

  const level = profile?.level ?? 1;
  const isPremium = Boolean(profile?.is_premium);

  const storeIndex = useMemo(() => {
    const map = new Map<string, { coins_cost: number }>();
    for (const item of items) {
      map.set(item.id, { coins_cost: item.coins_cost });
    }
    return map;
  }, [items]);

  const ownedItemIds = useMemo(() => {
    const set = new Set<string>();
    for (const purchase of purchases) {
      if (isPurchaseActive(purchase.expires_at ?? null)) {
        set.add(purchase.item_id);
      }
    }
    return set;
  }, [purchases]);

  const skins: VyraSkinEntry[] = useMemo(
    () =>
      VYRA_SKINS.map((skin) => {
        const cost = skin.storeId
          ? storeIndex.get(skin.storeId)?.coins_cost ?? skin.coinsCost ?? null
          : skin.coinsCost ?? null;
        const unlocked =
          skin.unlock === 'base' ||
          (skin.unlock === 'coins' && skin.storeId ? ownedItemIds.has(skin.storeId) : false) ||
          (skin.unlock === 'level' && level >= (skin.minLevel ?? 0)) ||
          (skin.unlock === 'premium' && isPremium);

        let lockedReason: string | null = null;
        if (!unlocked) {
          lockedReason =
            skin.unlock === 'coins'
              ? 'Compra en tienda'
              : skin.unlock === 'premium'
                ? 'Solo Premium'
                : skin.unlock === 'level'
                  ? `Requiere nivel ${skin.minLevel ?? 0}`
                  : 'Bloqueado';
        }

        return {
          ...skin,
          coinsCost: cost ?? skin.coinsCost ?? undefined,
          unlocked,
          unlockLabel: formatSkinUnlockLabel(skin, cost),
          lockedReason,
        };
      }),
    [isPremium, level, ownedItemIds, storeIndex],
  );

  const accessories: VyraAccessoryEntry[] = useMemo(
    () =>
      VYRA_ACCESSORIES.map((accessory) => {
        const cost = storeIndex.get(accessory.storeId)?.coins_cost ?? accessory.coinsCost;
        const unlocked = ownedItemIds.has(accessory.storeId);
        return {
          ...accessory,
          coinsCost: cost,
          unlocked,
          unlockLabel: formatAccessoryUnlockLabel(accessory, cost),
          lockedReason: unlocked ? null : 'Compra en tienda',
        };
      }),
    [ownedItemIds, storeIndex],
  );

  const equippedSkinId = getEquippedVyraSkinId(profile);
  const equippedAccessoryId = getEquippedVyraAccessoryId(profile);
  const equippedSkin =
    skins.find((skin) => skin.id === equippedSkinId && skin.unlocked) ??
    skins.find((skin) => skin.unlock === 'base') ??
    null;
  const equippedAccessory =
    accessories.find((acc) => acc.id === equippedAccessoryId && acc.unlocked) ?? null;

  const { mutateAsync: equipSkin, isPending: isSavingSkin } = useMutation({
    mutationFn: async (skinId: VyraSkinId | null) => {
      if (!profile?.id) throw new Error('No user');
      if (skinId) {
        const skin = skins.find((item) => item.id === skinId);
        if (!skin || !skin.unlocked) {
          throw new Error('Skin locked');
        }
      }
      const currentMemory =
        profile.coach_memory_json && typeof profile.coach_memory_json === 'object'
          ? (profile.coach_memory_json as Record<string, unknown>)
          : {};
      const nextMemory = withVyraCosmetics(currentMemory, skinId, equippedAccessory?.id ?? null);
      const { error } = await supabase
        .from('profiles')
        .update({ coach_memory_json: nextMemory, updated_at: new Date().toISOString() })
        .eq('id', profile.id);
      if (error) throw error;
      return { skinId, nextMemory };
    },
    onSuccess: ({ skinId, nextMemory }) => {
      updateProfile({ coach_memory_json: nextMemory });
      showToast(skinId ? 'Skin equipada.' : 'Skin reseteada.', 'success');
    },
    onError: (error) => {
      captureError(error instanceof Error ? error : new Error(String(error)), { action: 'useVyraCosmetics.equipSkin' });
      showToast('No se pudo equipar la skin.', 'error');
    },
  });

  const { mutateAsync: equipAccessory, isPending: isSavingAccessory } = useMutation({
    mutationFn: async (accessoryId: VyraAccessoryId | null) => {
      if (!profile?.id) throw new Error('No user');
      if (accessoryId) {
        const accessory = accessories.find((item) => item.id === accessoryId);
        if (!accessory || !accessory.unlocked) {
          throw new Error('Accessory locked');
        }
      }
      const currentMemory =
        profile.coach_memory_json && typeof profile.coach_memory_json === 'object'
          ? (profile.coach_memory_json as Record<string, unknown>)
          : {};
      const nextMemory = withVyraCosmetics(currentMemory, equippedSkin?.id ?? null, accessoryId);
      const { error } = await supabase
        .from('profiles')
        .update({ coach_memory_json: nextMemory, updated_at: new Date().toISOString() })
        .eq('id', profile.id);
      if (error) throw error;
      return { accessoryId, nextMemory };
    },
    onSuccess: ({ accessoryId, nextMemory }) => {
      updateProfile({ coach_memory_json: nextMemory });
      showToast(accessoryId ? 'Accesorio equipado.' : 'Accesorio removido.', 'success');
    },
    onError: (error) => {
      captureError(error instanceof Error ? error : new Error(String(error)), {
        action: 'useVyraCosmetics.equipAccessory',
      });
      showToast('No se pudo equipar el accesorio.', 'error');
    },
  });

  return {
    skins,
    accessories,
    equippedSkin,
    equippedAccessory,
    isSavingSkin,
    isSavingAccessory,
    equipSkin,
    equipAccessory,
  };
}
