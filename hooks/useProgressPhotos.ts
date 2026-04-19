import { useCallback, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { useAuthStore } from '@/stores/authStore';

export interface ProgressPhoto {
  id: string;
  uri: string;
  createdAt: string;
}

function createStorageKey(userId: string | null | undefined) {
  return `vyra_progress_photos:${userId ?? 'guest'}`;
}

export function useProgressPhotos() {
  const userId = useAuthStore((state) => state.profile?.id ?? null);
  const storageKey = useMemo(() => createStorageKey(userId), [userId]);
  const [photos, setPhotos] = useState<ProgressPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;

    const load = async () => {
      setLoading(true);
      try {
        const raw = await AsyncStorage.getItem(storageKey);
        if (!active) return;
        const parsed = raw ? (JSON.parse(raw) as ProgressPhoto[]) : [];
        setPhotos(Array.isArray(parsed) ? parsed : []);
      } catch {
        if (active) setPhotos([]);
      } finally {
        if (active) setLoading(false);
      }
    };

    void load();

    return () => {
      active = false;
    };
  }, [storageKey]);

  const persist = useCallback(
    async (next: ProgressPhoto[]) => {
      setPhotos(next);
      await AsyncStorage.setItem(storageKey, JSON.stringify(next));
    },
    [storageKey],
  );

  const addPhoto = useCallback(
    async (uri: string) => {
      const next: ProgressPhoto[] = [
        {
          id: `${Date.now()}`,
          uri,
          createdAt: new Date().toISOString(),
        },
        ...photos,
      ];
      await persist(next);
    },
    [persist, photos],
  );

  const pickPhoto = useCallback(async () => {
    setSaving(true);
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) return { ok: false as const, reason: 'permission' as const };

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.9,
        allowsMultipleSelection: false,
      });

      if (result.canceled || !result.assets?.[0]?.uri) {
        return { ok: false as const, reason: 'cancelled' as const };
      }

      await addPhoto(result.assets[0].uri);
      return { ok: true as const };
    } finally {
      setSaving(false);
    }
  }, [addPhoto]);

  const removePhoto = useCallback(
    async (photoId: string) => {
      await persist(photos.filter((photo) => photo.id !== photoId));
    },
    [persist, photos],
  );

  return {
    photos,
    loading,
    saving,
    pickPhoto,
    removePhoto,
  };
}
