import type { UserProfile } from '@/types/user';

export type VyraSkinId =
  | 'base'
  | 'astronaut'
  | 'ninja'
  | 'pirate'
  | 'athlete'
  | 'mage'
  | 'gold'
  | 'legendary'
  | 'diamond';

export type VyraAccessoryId = 'cap' | 'glasses' | 'collar';

export type VyraUnlockType = 'base' | 'coins' | 'level' | 'premium';

export interface VyraSkin {
  id: VyraSkinId;
  name: string;
  unlock: VyraUnlockType;
  minLevel?: number;
  storeId?: string;
  coinsCost?: number;
  accent: string;
  background: string;
}

export interface VyraAccessory {
  id: VyraAccessoryId;
  name: string;
  storeId: string;
  coinsCost: number;
  accent: string;
}

export interface VyraSkinEntry extends VyraSkin {
  unlocked: boolean;
  unlockLabel: string;
  lockedReason: string | null;
}

export interface VyraAccessoryEntry extends VyraAccessory {
  unlocked: boolean;
  unlockLabel: string;
  lockedReason: string | null;
}

const SKIN_IDS = new Set<VyraSkinId>([
  'base',
  'astronaut',
  'ninja',
  'pirate',
  'athlete',
  'mage',
  'gold',
  'legendary',
  'diamond',
]);

const ACCESSORY_IDS = new Set<VyraAccessoryId>(['cap', 'glasses', 'collar']);

export const VYRA_SKINS: VyraSkin[] = [
  {
    id: 'base',
    name: 'Base',
    unlock: 'base',
    accent: '#F97316',
    background: '#FFE7D1',
  },
  {
    id: 'astronaut',
    name: 'Astronauta',
    unlock: 'coins',
    storeId: 'skin_astronaut',
    coinsCost: 600,
    accent: '#3B82F6',
    background: '#E0EEFF',
  },
  {
    id: 'ninja',
    name: 'Ninja',
    unlock: 'coins',
    storeId: 'skin_ninja',
    coinsCost: 600,
    accent: '#111827',
    background: '#E5E7EB',
  },
  {
    id: 'pirate',
    name: 'Pirata',
    unlock: 'coins',
    storeId: 'skin_pirate',
    coinsCost: 340,
    accent: '#B45309',
    background: '#FFEBD0',
  },
  {
    id: 'athlete',
    name: 'Deportista',
    unlock: 'coins',
    storeId: 'skin_athlete',
    coinsCost: 300,
    accent: '#10B981',
    background: '#D9FBE9',
  },
  {
    id: 'mage',
    name: 'Maga',
    unlock: 'coins',
    storeId: 'skin_mage',
    coinsCost: 380,
    accent: '#8B5CF6',
    background: '#EEE5FF',
  },
  {
    id: 'gold',
    name: 'Dorada',
    unlock: 'level',
    minLevel: 10,
    accent: '#F59E0B',
    background: '#FFF4CC',
  },
  {
    id: 'legendary',
    name: 'Legendaria',
    unlock: 'level',
    minLevel: 15,
    accent: '#EF4444',
    background: '#FFE5E5',
  },
  {
    id: 'diamond',
    name: 'Diamante',
    unlock: 'premium',
    accent: '#38BDF8',
    background: '#DDF4FF',
  },
];

export const VYRA_ACCESSORIES: VyraAccessory[] = [
  {
    id: 'cap',
    name: 'Gorra deportiva',
    storeId: 'acc_cap',
    coinsCost: 200,
    accent: '#0EA5E9',
  },
  {
    id: 'glasses',
    name: 'Gafas',
    storeId: 'acc_glasses',
    coinsCost: 260,
    accent: '#6366F1',
  },
  {
    id: 'collar',
    name: 'Collar',
    storeId: 'acc_collar',
    coinsCost: 320,
    accent: '#F97316',
  },
];

export function getEquippedVyraSkinId(profile: UserProfile | null): VyraSkinId | null {
  const memory =
    profile?.coach_memory_json && typeof profile.coach_memory_json === 'object'
      ? (profile.coach_memory_json as Record<string, unknown>)
      : {};
  const raw = memory.vyra_skin_id;
  return typeof raw === 'string' && SKIN_IDS.has(raw as VyraSkinId) ? (raw as VyraSkinId) : null;
}

export function getEquippedVyraAccessoryId(profile: UserProfile | null): VyraAccessoryId | null {
  const memory =
    profile?.coach_memory_json && typeof profile.coach_memory_json === 'object'
      ? (profile.coach_memory_json as Record<string, unknown>)
      : {};
  const raw = memory.vyra_accessory_id;
  return typeof raw === 'string' && ACCESSORY_IDS.has(raw as VyraAccessoryId) ? (raw as VyraAccessoryId) : null;
}

export function withVyraCosmetics(
  memory: Record<string, unknown> | null | undefined,
  skinId: VyraSkinId | null,
  accessoryId: VyraAccessoryId | null,
): Record<string, unknown> {
  const next = { ...(memory ?? {}) } as Record<string, unknown>;
  if (skinId) {
    next.vyra_skin_id = skinId;
  } else {
    delete next.vyra_skin_id;
  }
  if (accessoryId) {
    next.vyra_accessory_id = accessoryId;
  } else {
    delete next.vyra_accessory_id;
  }
  return next;
}

export function formatSkinUnlockLabel(skin: VyraSkin, coinsCost?: number | null): string {
  if (skin.unlock === 'base') return 'Base';
  if (skin.unlock === 'premium') return 'Premium';
  if (skin.unlock === 'level') return `Nivel ${skin.minLevel ?? 0}`;
  const cost = coinsCost ?? skin.coinsCost ?? 0;
  return `Coins ${cost}`;
}

export function formatAccessoryUnlockLabel(accessory: VyraAccessory, coinsCost?: number | null): string {
  const cost = coinsCost ?? accessory.coinsCost ?? 0;
  return `Coins ${cost}`;
}
